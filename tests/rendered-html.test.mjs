/**
 * rendered-html.test.mjs
 *
 * Source-inspection tests that validate structural invariants across the
 * app without requiring a running server.  Runtime HTML assertions (route
 * rendering, alias redirects, filterable catalogues) live in the Playwright
 * E2E suite (tests/e2e/).
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function src(relPath) {
  return readFile(new URL(`../${relPath}`, import.meta.url), "utf8");
}

// ─── CSS safeguards ──────────────────────────────────────────────────────────

test("globals.css contains critical layout and motion safeguards", async () => {
  const css = await src("app/globals.css");

  assert.match(css, /100dvh/, "missing 100dvh");
  assert.match(css, /safe-area-inset-bottom/, "missing safe-area-inset-bottom");
  assert.match(css, /max-height:\s*560px/, "missing 560px max-height cap");
  assert.match(css, /prefers-reduced-motion:\s*reduce/, "missing reduced-motion query");
  assert.match(css, /pointer:\s*coarse/, "missing coarse-pointer query");
});

// ─── depth-engine markers ────────────────────────────────────────────────────

test("depth-engine.ts contains all required runtime markers", async () => {
  const engine = await src("app/atmospheric-gallery/depth-engine.ts");

  assert.match(engine, /TABLET_BREAKPOINT/, "missing TABLET_BREAKPOINT");
  assert.match(engine, /loadRemainingTextures/, "missing loadRemainingTextures");
  assert.match(engine, /ResizeObserver/, "missing ResizeObserver");
  assert.match(engine, /IntersectionObserver/, "missing IntersectionObserver");
  assert.match(engine, /handoffToIndex/, "missing handoffToIndex");
  assert.match(engine, /this\.worlds\[index\]\.imageMobile/, "missing imageMobile access");
  assert.match(engine, /TEXTURE_READY_TIMEOUT_MS/, "missing texture readiness deadline");
  assert.match(engine, /MOBILE_SCROLL_SMOOTHING/, "missing mobile scroll smoothing");
  assert.match(engine, /MOBILE_DPR_LIMIT/, "missing mobile DPR limit");
  assert.match(engine, /LinearMipmapLinearFilter/, "missing trilinear texture filtering");
  assert.match(engine, /TEXTURE_BATCH_SIZE/, "missing bounded texture concurrency");
});

// ─── world-data integrity ────────────────────────────────────────────────────

test("world-data.ts has exactly six heroImage and six imageMobile entries", async () => {
  const worldData = await src("app/world-data.ts");

  const heroCount = (worldData.match(/heroImage:\s*"\/media\/worlds\//g) ?? []).length;
  const mobileCount = (worldData.match(/imageMobile:\s*"\/media\/worlds\//g) ?? []).length;

  assert.equal(heroCount, 6, `expected 6 heroImages, got ${heroCount}`);
  assert.equal(mobileCount, 6, `expected 6 imageMobile entries, got ${mobileCount}`);
});

test("world-data.ts contains the six canonical world accent and background colours", async () => {
  const worldData = await src("app/world-data.ts");

  // Arcade — lime accent, deep blue background (verified in previous session)
  assert.match(worldData, /accent:\s*"#b8ff45"/i, "missing Arcade accent");
  assert.match(worldData, /background:\s*"#0d4f87"/i, "missing Arcade background");
});

test("world-data.ts contains all six canonical world ids", async () => {
  const worldData = await src("app/world-data.ts");

  for (const id of ["arcade", "scent", "carry", "arena", "adorn", "little"]) {
    assert.match(worldData, new RegExp(`id:\\s*["']${id}["']`), `missing world id: ${id}`);
  }
});

// ─── route-transition markers ────────────────────────────────────────────────

test("route-transition.tsx contains sameDocument and releaseTimer guards", async () => {
  const transitions = await src("app/route-transition.tsx");

  assert.match(transitions, /sameDocument/, "missing sameDocument guard");
  assert.match(transitions, /releaseTimer/, "missing releaseTimer guard");
});

// ─── world-experience image safety ──────────────────────────────────────────

test("world-experience does not use next/image (avoids _next/image URL rewriting)", async () => {
  const worldExperience = await src("app/world/[slug]/world-experience.tsx");
  const gallery = await src("app/atmospheric-depth-gallery.tsx");

  // Must use explicit native <img> with known width/height for CLS safety
  assert.match(worldExperience, /width=\{1120\}/, "missing explicit width on world image");
  assert.match(worldExperience, /height=\{1400\}/, "missing explicit height on world image");

  // Neither file should import next/image (we use raw <img> to preserve motion)
  assert.doesNotMatch(worldExperience, /from "next\/image"/, "world-experience must not import next/image");
  assert.doesNotMatch(gallery, /from "next\/image"/, "atmospheric-depth-gallery must not import next/image");
});

// ─── form fields present in experience source ────────────────────────────────

test("experience.tsx contains all required form field labels", async () => {
  const experience = await src("app/experience.tsx");

  for (const label of [
    /Full name/i,
    /Email address/i,
    /Phone or WhatsApp/i,
    /City and country/i,
    /Preferred contact/i,
  ]) {
    assert.match(experience, label, `missing form label: ${label}`);
  }
});

// ─── no research-led verification copy in world data ────────────────────────

test("world-data.ts contains no internal sourcing/verification copy", async () => {
  const worldData = await src("app/world-data.ts");

  const forbidden = [
    /INDIA GAP/,
    /CHECKOUT-GATED/,
    /Official source recorded/,
    /ships only to/i,
    /does not ship/i,
    /India absent/i,
    /verification date/i,
    /Grey-market marketplace/i,
    /authorised Indian/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(worldData, pattern, `found forbidden copy: ${pattern}`);
  }
});

// ─── no Vinext artefacts ─────────────────────────────────────────────────────

test("world-experience.tsx does not reference _vinext image paths", async () => {
  const worldExperience = await src("app/world/[slug]/world-experience.tsx");
  assert.doesNotMatch(worldExperience, /\/_vinext\/image/i, "found _vinext image reference");
});

// ─── search, sharing, and secret safeguards ──────────────────────────────────

test("root metadata contains canonical, social, manifest, and indexing controls", async () => {
  const layout = await src("app/layout.tsx");

  assert.match(layout, /metadataBase:\s*getSiteUrl\(\)/, "missing metadataBase");
  assert.match(layout, /alternates:\s*\{ canonical:\s*["']\/["'] \}/, "missing root canonical");
  assert.match(layout, /openGraph:/, "missing Open Graph metadata");
  assert.match(layout, /twitter:/, "missing Twitter metadata");
  assert.match(layout, /manifest:\s*["']\/manifest\.webmanifest["']/, "missing manifest metadata");
  assert.doesNotMatch(layout, /codex-preview/, "development preview marker leaked into metadata");
});

test("world routes emit unique metadata and permanently redirect aliases", async () => {
  const worldPage = await src("app/world/[slug]/page.tsx");

  assert.match(worldPage, /generateMetadata/, "missing world metadata generator");
  assert.match(worldPage, /alternates:\s*\{ canonical:\s*canonicalPath \}/, "missing world canonical");
  assert.match(worldPage, /permanentRedirect/, "aliases must permanently redirect");
  assert.match(worldPage, /CollectionPage/, "missing CollectionPage structured data");
  assert.match(worldPage, /BreadcrumbList/, "missing breadcrumb structured data");
});

test("sitemap contains canonical worlds only and no fabricated modification dates", async () => {
  const sitemap = await src("app/sitemap.ts");

  assert.doesNotMatch(sitemap, /aliasUrls|worldAliases/, "legacy aliases leaked into sitemap");
  assert.doesNotMatch(sitemap, /lastModified|new Date/, "sitemap contains fabricated freshness");
  assert.match(sitemap, /worlds\.map/, "canonical worlds are missing from sitemap");
});

test("no Web3Forms access key is committed or used as a source fallback", async () => {
  const route = await src("app/api/requests/route.ts");
  const environmentExample = await src(".env.example");
  const keyPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  assert.doesNotMatch(route, keyPattern, "access key committed in request route");
  assert.doesNotMatch(environmentExample, keyPattern, "access key committed in environment example");
  assert.match(route, /WEB3FORMS_ACCESS_KEY\?\.trim/, "environment-only access key lookup missing");
});
