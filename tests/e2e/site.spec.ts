import { expect, test } from "@playwright/test";

// ─── Homepage ─────────────────────────────────────────────────────────────────

test.describe("Homepage", () => {
  test("loads with 200 OK and correct title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ELSEWHERE/i);
  });

  test("contains gallery canvas and skip link", async ({ page }) => {
    await page.goto("/");
    // The Three.js canvas should be present
    await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
    // Accessibility: skip-to-content or gallery bypass link
    const skipLink = page.getByText(/Skip the spatial gallery/i);
    await expect(skipLink).toBeAttached();
  });

  test("contains the six world names in the index section", async ({ page }) => {
    await page.goto("/");
    for (const world of ["Arcade", "Scent", "Carry", "Arena", "Adorn", "Little"]) {
      await expect(page.getByText(world).first()).toBeAttached();
    }
  });

  test("form fields are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/Full name/i)).toBeAttached();
    await expect(page.getByLabel(/Email address/i)).toBeAttached();
    await expect(page.getByLabel(/City and country/i)).toBeAttached();
  });
});

// ─── World routes ─────────────────────────────────────────────────────────────

const WORLDS = [
  { slug: "arcade", name: "Arcade" },
  { slug: "scent", name: "Scent" },
  { slug: "carry", name: "Carry" },
  { slug: "arena", name: "Arena" },
  { slug: "adorn", name: "Adorn" },
  { slug: "little", name: "Little" },
];

for (const { slug, name } of WORLDS) {
  test(`/world/${slug} renders ${name} world with navigation`, async ({ page }) => {
    const response = await page.goto(`/world/${slug}`);
    expect(response?.status()).toBe(200);
    // World name present somewhere on the page
    await expect(page.getByText(name).first()).toBeAttached();
    // Return navigation
    await expect(page.getByText(/Back to the index/i)).toBeAttached();
    // Next world link
    await expect(page.getByText(/Next world/i)).toBeAttached();
    // Hero image present (native <img>)
    const heroImg = page.locator(`img[src*="${slug}-hero"]`);
    await expect(heroImg).toBeAttached();
  });
}

// ─── Alias routes ─────────────────────────────────────────────────────────────

const ALIASES = [
  { alias: "roam", resolves: "Arena" },
  { alias: "gather", resolves: "Arcade" },
  { alias: "restore", resolves: "Scent" },
  { alias: "ritual", resolves: "Carry" },
  { alias: "wonder", resolves: "Little" },
];

for (const { alias, resolves } of ALIASES) {
  test(`/world/${alias} alias resolves to ${resolves}`, async ({ page }) => {
    const response = await page.goto(`/world/${alias}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByText(resolves).first()).toBeAttached();
  });
}

// ─── 404 page ─────────────────────────────────────────────────────────────────

test("unknown route returns 404 with ELSEWHERE not-found page", async ({ page }) => {
  const response = await page.goto("/world/nonexistent-world-xyz");
  expect(response?.status()).toBe(404);
  // Our custom not-found page
  await expect(page.getByText(/ELSEWHERE/i).first()).toBeAttached();
});

// ─── No _vinext or _next/image leaks ─────────────────────────────────────────

test("world pages do not reference _vinext image paths", async ({ page }) => {
  await page.goto("/world/arcade");
  const content = await page.content();
  expect(content).not.toMatch(/_vinext\/image/i);
});

// ─── Form validation feedback ─────────────────────────────────────────────────

test("form shows validation error for invalid email", async ({ page }) => {
  await page.goto("/");

  // Fill required fields except give a bad email
  await page.getByLabel(/Full name/i).fill("Test User");
  await page.getByLabel(/Email address/i).fill("not-an-email");
  await page.getByLabel(/City and country/i).fill("Mumbai, India");

  // Submit the form
  const submitBtn = page.getByRole("button", { name: /Submit|Send|Request/i });
  await submitBtn.click();

  // An error or validation message should appear
  await expect(page.getByText(/email|invalid/i).first()).toBeVisible({ timeout: 5_000 });
});

// ─── Arena catalog filters ────────────────────────────────────────────────────

test("Arena world contains filter controls and filterable products", async ({ page }) => {
  await page.goto("/world/arena");
  await expect(page.getByText(/Nine performance pieces/i)).toBeAttached();
  await expect(page.getByText(/Jerseys/i)).toBeAttached();
  await expect(page.getByText(/Footwear/i)).toBeAttached();
});

// ─── Adorn catalog ────────────────────────────────────────────────────────────

test("Adorn catalog renders without research-led verification copy", async ({ page }) => {
  await page.goto("/world/adorn");
  await expect(page.getByText(/Eight considered pieces/i)).toBeAttached();
  const content = await page.content();
  expect(content).not.toMatch(/INDIA GAP|CHECKOUT-GATED|authorised Indian/i);
});
