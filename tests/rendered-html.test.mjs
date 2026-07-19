import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function createWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker;
}

async function fetchPage(worker, path) {
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders development preview metadata and hardened homepage controls", async () => {
  const worker = await createWorker();

  const response = await fetchPage(worker, "/");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Skip the spatial gallery/i);
  assert.match(html, /Browse the six worlds/i);
  assert.match(html, /route-curtain/i);
  assert.match(html, /Full name/i);
  assert.match(html, /Email address/i);
  assert.match(html, /Phone or WhatsApp/i);
  assert.match(html, /City and country/i);
  assert.match(html, /Preferred contact/i);
});

test("renders every world route with its collection and return navigation", async () => {
  const worker = await createWorker();
  const worlds = ["arcade", "scent", "carry", "arena", "adorn", "little"];

  for (const world of worlds) {
    const response = await fetchPage(worker, `/world/${world}`);
    assert.equal(response.status, 200, world);
    const html = await response.text();
    assert.match(html, /Back to the index/i, world);
    assert.doesNotMatch(html, /INDIA GAP|CHECKOUT-GATED|Official source recorded|ships only|does not ship|India absent|verification date/i, world);
    assert.match(html, /Next world/i, world);
    assert.match(html, new RegExp(`<img src="/media/worlds/${world}-hero\\.webp"`, "i"), world);
    assert.match(html, new RegExp(`${world}-hero-mobile\\.webp`, "i"), world);
    assert.doesNotMatch(html, /\/_vinext\/image/i, world);
  }
});

test("renders Arena as a clean, filterable sports world", async () => {
  const worker = await createWorker();
  const response = await fetchPage(worker, "/world/arena");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Nine performance pieces/i);
  assert.match(html, /Jerseys/i);
  assert.match(html, /Footwear/i);
  assert.match(html, /2025 Inaugural Primary Authentic Jersey/i);
  assert.match(html, /Neovolt Pro V3/i);
  assert.match(html, /Top Flex 26/i);
  assert.doesNotMatch(html, /CHECKOUT-GATED|INDIA GAP|Grey-market marketplace/i);
});

test("keeps the former Roam route as an Arena alias", async () => {
  const worker = await createWorker();
  const response = await fetchPage(worker, "/world/roam");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Arena/i);
});

test("renders the four new researched worlds and preserves their former aliases", async () => {
  const worker = await createWorker();
  const checks = [
    ["/world/arcade", /Nintendo Switch 2 Pro Controller/i],
    ["/world/scent", /Banane Délice Eau de Parfum/i],
    ["/world/carry", /Packing Cubes/i],
    ["/world/little", /Busy Port City Train Set/i],
    ["/world/gather", /Arcade/i],
    ["/world/restore", /Scent/i],
    ["/world/ritual", /Carry/i],
    ["/world/wonder", /Little/i],
  ];

  for (const [path, expected] of checks) {
    const response = await fetchPage(worker, path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }
});

test("renders the Adorn catalog without research-led verification copy", async () => {
  const worker = await createWorker();
  const response = await fetchPage(worker, "/world/adorn");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Eight considered pieces/i);
  assert.match(html, /Underlined Kajal Eyeliner/i);
  assert.match(html, /Skin Spark Blush Balm/i);
  assert.match(html, /Kasha Coin Fringe/i);
  assert.doesNotMatch(html, /INDIA GAP|Distribution changes|authorised Indian/i);
  assert.match(html, /adorn-makeup-collage\.webp/i);
  assert.match(html, /adorn-accessories-collage\.webp/i);
});

test("keeps responsive, reduced-motion, direct-image, navigation, and runtime safeguards in source", async () => {
  const [css, engine, worldData, transitions, worldExperience, gallery] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/atmospheric-gallery/depth-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/world-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/route-transition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/world/[slug]/world-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/atmospheric-depth-gallery.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(css, /100dvh/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /max-height:\s*560px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /pointer:\s*coarse/);
  assert.match(engine, /TABLET_BREAKPOINT/);
  assert.match(engine, /loadRemainingTextures/);
  assert.match(engine, /ResizeObserver/);
  assert.match(engine, /IntersectionObserver/);
  assert.match(engine, /handoffToIndex/);
  assert.match(engine, /this\.worlds\[index\]\.imageMobile/);
  assert.match(engine, /TEXTURE_LOAD_TIMEOUT_MS/);
  assert.equal((worldData.match(/heroImage:\s*"\/media\/worlds\//g) ?? []).length, 6);
  assert.equal((worldData.match(/imageMobile:\s*"\/media\/worlds\//g) ?? []).length, 6);
  assert.match(transitions, /sameDocument/);
  assert.match(transitions, /releaseTimer/);
  assert.match(worldExperience, /width=\{1120\}/);
  assert.match(worldExperience, /height=\{1400\}/);
  assert.doesNotMatch(worldExperience, /from "next\/image"/);
  assert.doesNotMatch(gallery, /from "next\/image"/);
  assert.match(worldData, /accent:\s*"#b8ff45"/i);
  assert.match(worldData, /background:\s*"#0d4f87"/i);
});
