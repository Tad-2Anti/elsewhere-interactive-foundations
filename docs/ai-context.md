# AI Implementation Context

Use this document as the short, authoritative brief when an AI coding agent continues the project.

## Locked decisions

1. The homepage interaction is the Atmospheric Depth Gallery, not a circular carousel.
2. Use the MIT-licensed source at `https://github.com/houmahani/codrops-depth-gallery` as the implementation base.
3. Preserve upstream camera, scroll, velocity, parallax, breath, background, and bounds behavior during the first parity port.
4. Port the imperative Three.js engine to TypeScript and mount it through React; do not approximate it with a new R3F composition.
5. The six worlds are Arcade, Scent, Carry, Arena, Adorn, and Little. Their public pages use editorial catalogs without the internal India-availability research or verification copy.
6. Use only original collage imagery and properly licensed audio.
7. Keep accessible HTML outside the canvas and provide a non-WebGL index.
8. Sound remains opt-in.

## Current implementation status

- The homepage now uses the direct Three.js Atmospheric Depth Gallery engine in `app/atmospheric-gallery/depth-engine.ts`.
- `app/experience.tsx` delegates motion to the engine and owns semantic overlays, sound, routes, return state, and the request form.
- The rejected ring lobby and React Three Fiber implementation have been removed.
- Six world routes and researched catalogs exist. Former slugs remain as compatibility aliases.
- The production visual system now uses six homepage portals and six separate route heroes. Arcade, Scent, Carry, Arena and Little no longer use legacy collage placeholders; Adorn retains its approved portal and has a new route-specific hero.
- The governing visual-production brief is `docs/world-visual-production-plan.md`. Preserve its crop-safety, material, originality and differentiation rules when replacing any image.
- Every generated image is unbranded original art with no readable packaging, copied reference-site media, or copyrighted characters.
- The off-centre motion pass uses a shared eased X anchor and a bounded under-damped Y spring.
- Responsive hardening now includes dedicated mobile/tablet/desktop render tiers, progressive texture loading, offscreen pausing, mobile gallery handoff, safe-area layouts, route transitions, and reduced-motion equivalents.
- First-visit entry choices land on the spatial lobby (depth gallery hero); the semantic six-world index is reached only via deliberate navigation. Explicit `?world=` returns still restore the spatial portal.
- Production SEO now includes canonical root and world metadata, permanent legacy redirects, canonical-only sitemap output, preview `noindex`, JSON-LD, original code-rendered social cards, a web manifest, and an original ELSEWHERE icon family.
- Mobile gallery quality uses a `1.25` DPR cap, trilinear mipmaps, bounded anisotropy, late-texture recovery, and two-at-a-time progressive loading. Mobile touch sensitivity and smoothing are tuned independently; desktop motion remains unchanged.

## Source priorities

Read in this order before coding:

1. `docs/implementation-plan.md`
2. `docs/interaction-specification.md`
3. `docs/technical-architecture.md`
4. `docs/design-direction.md`
5. `docs/responsive-hardening-plan.md`
6. `app/world-data.ts`
7. `app/experience.tsx`
8. `app/atmospheric-gallery/depth-engine.ts`

## Guardrails

- Do not claim visual parity without comparing the live component at matching viewports.
- Do not change motion constants during the initial source port.
- Do not embed accessibility-critical text into WebGL textures.
- Do not load all six high-resolution textures before first interaction.
- Do not make the experience depend on sound, WebGL, or a precision pointing device.
- Do not add a viewport patch without checking short-height, safe-area, coarse-pointer, and reduced-motion behavior.
- Do not bypass `TransitionLink` for internal page changes unless the destination is an in-page hash.
- Do not copy proprietary reference-site code or media.

## Completion signal

The source migration is complete. Release completion still requires the production build, hosted checkpoint, and direct deployment-status verification to pass.
