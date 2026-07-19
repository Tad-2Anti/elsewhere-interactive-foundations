import { expect, test } from "@playwright/test";

// ─── Homepage ─────────────────────────────────────────────────────────────────

test.describe("Homepage", () => {
  test("loads with 200 OK and correct title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ELSEWHERE/i);
  });

  test("emits canonical, social, manifest, and structured metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://elsewhere.sh");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /ELSEWHERE/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
    const structuredData = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "[]");
    expect(structuredData).toHaveLength(3);
    expect(structuredData.map((entry: { "@type": string }) => entry["@type"]))
      .toEqual(["WebSite", "Organization", "ItemList"]);
  });

  test("quiet entry lands on the hero gallery, not the index", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Enter quietly" }).click();
    await expect(page).not.toHaveURL(/#explore$/);
    await expect(page.locator("#lobby")).toBeInViewport();
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

  test("mobile drag advances one world without changing desktop motion", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "mobile interaction contract");
    await page.addInitScript(() => window.sessionStorage.setItem("elsewhere:entered", "true"));
    await page.goto("/");

    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".active-world-content h2")).toHaveText("Arcade");
    const bounds = await canvas.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    // Let the engine finish its initial mount/texture pass so the gesture
    // isn't racing the first render frames.
    await page.waitForTimeout(400);

    const x = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height * 0.72;
    await canvas.evaluate((element, gesture) => {
      const target = element as HTMLCanvasElement;
      target.setPointerCapture = () => undefined;
      target.hasPointerCapture = () => false;
      const eventInit = { bubbles: true, pointerId: 1, pointerType: "touch", button: 0, clientX: gesture.x };
      target.dispatchEvent(new PointerEvent("pointerdown", { ...eventInit, clientY: gesture.startY }));
      for (let step = 1; step <= 8; step += 1) {
        target.dispatchEvent(new PointerEvent("pointermove", {
          ...eventInit,
          clientY: gesture.startY - (gesture.distance * step / 8),
        }));
      }
      target.dispatchEvent(new PointerEvent("pointerup", { ...eventInit, clientY: gesture.startY - gesture.distance }));
    }, { x, startY, distance: 220 });
    await expect(page.locator(".active-world-content h2")).toHaveText("Scent", { timeout: 6_000 });
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
    await expect(page).toHaveTitle(new RegExp(`^${name}`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://elsewhere.sh/world/${slug}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `https://elsewhere.sh/world/${slug}/opengraph-image`);
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
  { alias: "wear", resolves: "Adorn" },
];

for (const { alias, resolves } of ALIASES) {
  test(`/world/${alias} permanently redirects to ${resolves}`, async ({ page }) => {
    const response = await page.goto(`/world/${alias}`);
    expect(response?.status()).toBe(200);
    expect(response?.request().redirectedFrom()).not.toBeNull();
    await expect(page).toHaveURL(new RegExp(`/world/${resolves.toLowerCase()}$`));
    await expect(page.getByText(resolves).first()).toBeAttached();
  });
}

test("technical discovery routes contain canonical production data", async ({ request }) => {
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  expect((sitemap.match(/<loc>/g) ?? [])).toHaveLength(7);
  expect(sitemap).not.toMatch(/world\/(gather|restore|ritual|roam|wear|wonder)/);

  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBeTruthy();
  await expect(robotsResponse.text()).resolves.toContain("Sitemap: https://elsewhere.sh/sitemap.xml");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  expect(await manifestResponse.json()).toMatchObject({ name: "ELSEWHERE", theme_color: "#070707" });

  const socialImageResponse = await request.get("/opengraph-image");
  expect(socialImageResponse.ok()).toBeTruthy();
  expect(socialImageResponse.headers()["content-type"]).toContain("image/png");
});

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
  await page.getByRole("button", { name: "Enter quietly" }).click();
  await expect(page.locator(".entry-gate")).toBeHidden();
  await page.locator("#request").scrollIntoViewIfNeeded();

  // Fill required fields except give a bad email
  await page.getByLabel(/Full name/i).fill("Test User");
  await page.getByLabel(/Email address/i).fill("not-an-email");
  await page.getByLabel(/City and country/i).fill("Mumbai, India");

  // Submit the form
  await page.locator('button[type="submit"]').click();

  const email = page.getByLabel(/Email address/i);
  expect(await email.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
  expect(await email.evaluate((input: HTMLInputElement) => input.validationMessage.length)).toBeGreaterThan(0);
});

test("form submits a valid request and shows its success state", async ({ page }) => {
  let submittedPayload: Record<string, string> | undefined;
  await page.route("**/api/requests", async (route) => {
    submittedPayload = route.request().postDataJSON() as Record<string, string>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Your request has been successfully submitted.",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Enter quietly" }).click();
  await expect(page.locator(".entry-gate")).toBeHidden();
  await page.locator("#request").scrollIntoViewIfNeeded();
  await page.getByLabel(/Full name/i).fill("Test User");
  await page.getByLabel(/Email address/i).fill("test@example.com");
  await page.getByLabel(/City and country/i).fill("Mumbai, India");
  await page.getByLabel(/What are you looking for/i).fill("A rare design book");
  await expect(page.getByLabel(/Full name/i)).toHaveValue("Test User");
  await expect(page.getByLabel(/What are you looking for/i)).toHaveValue("A rare design book");
  const submitButton = page.getByRole("button", { name: /Submit a request/i });
  const formIsValid = await submitButton.evaluate((button) =>
    (button.closest("form") as HTMLFormElement).checkValidity()
  );
  expect(formIsValid).toBe(true);

  const requestPromise = page.waitForRequest("**/api/requests");
  await submitButton.click();
  await requestPromise;

  await expect(page.getByRole("status")).toContainText(/successfully submitted/i);
  expect(submittedPayload).toMatchObject({
    name: "Test User",
    email: "test@example.com",
    location: "Mumbai, India",
    contactPreference: "email",
    request: "A rare design book",
  });
  await expect(page.getByLabel(/Full name/i)).toHaveValue("");
});

// ─── Arena catalog filters ────────────────────────────────────────────────────

test("Arena world contains filter controls and filterable products", async ({ page }) => {
  await page.goto("/world/arena");
  await expect(page.getByText(/Nine performance pieces/i)).toBeAttached();
  await expect(page.getByRole("button", { name: "Jerseys", exact: true })).toBeAttached();
  await expect(page.getByRole("button", { name: "Footwear", exact: true })).toBeAttached();
});

// ─── Adorn catalog ────────────────────────────────────────────────────────────

test("Adorn catalog renders without research-led verification copy", async ({ page }) => {
  await page.goto("/world/adorn");
  await expect(page.getByText(/Eight considered pieces/i)).toBeAttached();
  const content = await page.content();
  expect(content).not.toMatch(/INDIA GAP|CHECKOUT-GATED|authorised Indian/i);
});
