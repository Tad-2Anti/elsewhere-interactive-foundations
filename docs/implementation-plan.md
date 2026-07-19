# Atmospheric Depth Gallery Implementation Plan

## Decision

Replace the former ring-based `SpatialLobby` with a direct TypeScript port of the MIT-licensed Atmospheric Depth Gallery. The source migration is implemented; this document now doubles as the release and parity checklist.

## Definition of “exact”

“Exact” means the following behaviors from the approved component are present and tuned against its live demo:

- Planes are positioned along depth rather than around a circle.
- Scroll target and rendered camera position are separated and smoothed.
- Camera motion is bounded by the first and last planes.
- Pointer position creates small X/Y parallax.
- Scroll direction produces temporary vertical drift.
- Scroll speed drives plane tilt and scale breath.
- The active plane’s palette drives a smoothly blended atmosphere.
- Desktop and touch input feel weighted and continuous.

It does not mean copying the demo’s flowers, copy, typography, or branding.

## Phase 0 — planning and assets

Deliverables:

- Updated PRD, design, interaction, technical, world, asset, and AI-context documents
- Six production 4:5 homepage portals and six distinct route-hero masters, each with a mobile derivative. The five legacy homepage placeholders have been removed from active use.
- Upstream attribution and license record
- Baseline screenshot/video captures of the approved demo at desktop and mobile sizes

Acceptance:

- Every world has one palette, an approved portal image, a separate route hero, crop-safe responsive derivatives, and a documented replacement brief.
- All implementation decisions refer to the depth gallery, never the ring lobby.

## Phase 1 — upstream parity sandbox

1. Add the upstream MIT license text and identify the exact upstream commit used.
2. Bring the required engine, gallery, scroll, background, plane, trail, and shader modules into `app/atmospheric-gallery/`.
3. Convert JavaScript modules to strict TypeScript without changing equations or constants.
4. Replace upstream assets with six temporary solid-color textures only.
5. Mount the canvas through a minimal React client wrapper.
6. Verify disposal and hot-reload behavior.

Acceptance:

- The local page matches the upstream demo’s depth, smoothing, drift, tilt, scale response, and background interpolation with placeholder planes.
- No ELSEWHERE-specific layout changes are introduced before parity is confirmed.

## Phase 2 — six-world integration

1. Extend `World` with gallery position, palette, texture, and focal-point fields.
2. Map the six collages to the six planes.
3. Author alternating X positions while preserving upstream plane spacing.
4. Connect active-plane changes to the HTML overlay.
5. Replace generic labels with each world’s number, name, kicker, and short description.
6. Add index-view access without leaving the homepage.

Acceptance:

- Every collage appears at the correct aspect ratio without cropping critical objects.
- One active world is always unambiguous.
- Scrolling from first to last never enters empty space.

## Phase 3 — portal navigation

1. Add pointer hit testing to gallery planes.
2. First activation focuses an inactive plane; activation of the active plane enters it.
3. Build one GSAP timeline for portal entry: settle, isolate, camera push, HTML fade, route commit.
4. Preserve active-world state for return navigation.
5. Update each world route to use its collage as the hero image.

Acceptance:

- All six portals open the correct route.
- Returning restores the same portal and does not replay the entry gate in-session.
- Route changes never occur while the camera is between planes.

## Phase 4 — input, accessibility, and fallback

1. Port upstream wheel and touch logic unchanged before adding keyboard input.
2. Add pointer dragging with capture and momentum.
3. Add keyboard stepping and focus management.
4. Implement reduced-motion mode as discrete portal changes with crossfades.
5. Add a semantic non-WebGL index and renderer-failure recovery.
6. Confirm sound remains optional.

Acceptance:

- Mouse, trackpad, touch, and keyboard reach all six worlds.
- Reduced-motion users receive the same content and routes.
- With WebGL disabled, the site remains usable.

## Phase 5 — performance and responsive tuning — implemented

1. Load the initial portal first, then progressively load the remaining collages by distance from it.
2. Cap DPR, plane size, X spread, pointer parallax, shader noise, antialiasing, and trail use by mobile/tablet/desktop tier.
3. Coalesce renderer resizing across window, visual viewport, and element-size changes.
4. Pause animation when the gallery is offscreen or the page is hidden.
5. Add wheel, touch, and keyboard handoff from the final portal to the semantic index.
6. Implement dedicated phone, tablet, desktop, and short-landscape CSS compositions with safe-area spacing.
7. Add persistent internal-route transitions and reduced-motion alternatives.

Acceptance:

- Recent desktop target: stable 60 fps during normal movement.
- Mobile target: 30–60 fps with no input stalls and a `1.0` DPR cap.
- First portal is interactive without waiting for all six high-resolution textures.
- The render loop stops when the gallery is not visible.
- Phone and tablet visitors can reach below-fold content without being trapped by canvas input.

## Phase 6 — validation and release

1. Compare our scene with the approved demo at matching viewport sizes.
2. Record side-by-side checks for rest, slow scroll, fast scroll, pointer corner positions, and bounds.
3. Test all six routes and return restoration.
4. Test Safari/iOS, Chrome/Android, desktop Chrome, and reduced motion.
5. Run the Sites agent preview when available, then checkpoint and verify deployment.

Acceptance:

- No circular rotation code is active.
- Motion parity checklist passes.
- All routes, controls, assets, and fallbacks work in the deployed build.

## File-level migration map

| Current file | Action |
|---|---|
| `app/spatial-lobby.tsx` | Deleted after parity replacement was connected |
| `app/experience.tsx` | Remove ring index/drag math; connect depth engine callbacks |
| `app/world-data.ts` | Add gallery positions, palettes, textures, and focal points |
| `app/globals.css` | Replace ring-specific styles with depth overlay and fallback styles |
| `app/world/[slug]/world-experience.tsx` | Use collage hero and restore-state return link |
| `package.json` | Add GSAP for portal timelines; remove R3F/Drei if unused |
| `public/media/worlds/*.svg` | Retain temporarily as low-bandwidth fallbacks, then archive or remove |

## Risks and controls

| Risk | Control |
|---|---|
| React port changes the feel | Keep engine imperative and preserve upstream render loop/constants |
| Large texture memory | Derivatives, progressive loading, capped DPR, texture disposal |
| Touch conflicts with browser scroll | Full-screen gallery uses deliberate touch handling; fallback index remains available |
| WebGL failure | Semantic HTML index and direct world links |
| Copyright confusion | MIT logic only; original images, copy, sound, and brand system |
| “Exact” becomes subjective | Use a written parity checklist and matching viewport recordings |
