# Responsive and Design Hardening Plan

## Objective

Finish the experience as a resilient product across real phone, tablet, desktop, short-landscape, touch, keyboard, low-power, reduced-motion, and WebGL-failure conditions. Responsive work is defined by layout and interaction invariants rather than a collection of device-specific pixel patches.

## Failure modes found in the audit

1. A single `820px` breakpoint treated portrait tablets like phones and left no dedicated tablet composition.
2. `min-height: 620px` made the lobby taller than short landscape viewports.
3. The canvas captured wheel and touch movement at both depth boundaries, which could trap visitors inside the lobby.
4. All six full-size textures blocked the gallery's first interactive frame.
5. Rendering continued when the gallery was outside the viewport or the tab was hidden.
6. Route links outside the portal animation changed pages abruptly.
7. World-page accordions hid useful type information on mobile and relied on an inflexible height animation.
8. Safe-area insets, iOS form zoom, coarse-pointer targets, and runtime viewport resizing were not handled systematically.
9. Micro-interactions were primarily hover-only and did not have a shared motion grammar.

## Layout classes

| Class | Condition | Composition rule |
|---|---|---|
| Narrow phone | `280–430px` | Single-column content, one-column WebGL fallback, compact lobby metadata |
| Phone / compact tablet | `431–760px` | Full-height gallery, bottom-aligned active-world card, two-column fallback |
| Tablet | `761–1100px` | Editorial split retained with reduced scale and density |
| Desktop | `1101px+` | Full asymmetric composition, complete metadata, trail enabled |
| Short landscape | Height `≤560px` | Remove minimum lobby height, hide secondary copy, use split world hero |
| Reduced motion | User preference | No spring, reveal travel, route scale/blur, or continuous decorative animation |

The CSS layout breakpoint and WebGL performance breakpoint are intentionally independent. A `700–760px` device can use the compact CSS layout while retaining the tablet render tier when it has enough horizontal pixels.

## Viewport invariants

- Full-screen scenes use dynamic viewport height with small-viewport fallback.
- Every fixed edge accounts for `safe-area-inset-*`.
- No minimum width above `280px` and no horizontal scrolling.
- Phone form controls render at `16px` or larger to prevent browser zoom.
- Primary touch controls provide at least a `44px` hit target.
- Below-fold sections use `content-visibility` without hiding content when JavaScript is unavailable.
- A short viewport never forces the lobby beyond its visible height.

## WebGL quality tiers

| Tier | Width | DPR cap | Plane scale | X spread | Trail | Noise |
|---|---:|---:|---:|---:|---|---:|
| Mobile | `<700px` | `1.25` | `0.66` | `25%` | Off | `0.022` |
| Tablet | `700–1099px` | `1.35` | `0.82` | `62%` | Off | `0.032` |
| Desktop | `≥1100px` | `1.75` | `1.0` | `100%` | On | `0.040` |

Coarse pointers reduce canvas parallax to `25%`. Mobile creation keeps multisample antialiasing disabled, while the `1.25` DPR cap and trilinear mipmaps protect moving image edges without the framebuffer cost of full native DPR. Portal textures use bounded `2×` anisotropy. A `ResizeObserver`, the Visual Viewport API, and a frame-coalesced resize path keep camera aspect and renderer resolution synchronized during browser-chrome changes and orientation changes.

## Loading and runtime plan

1. Load only the requested initial world before declaring the gallery ready.
2. Represent other worlds with palette-colored one-pixel textures.
3. Load the remaining worlds in distance-prioritized batches of two.
4. Replace placeholders in place and dispose them immediately. A readiness deadline may release the loader, but a late cellular response still replaces its placeholder instead of being discarded.
5. Retry a genuine texture failure once after a bounded delay.
6. Pause the render loop when the canvas leaves the viewport or the page becomes hidden.
7. Dispose resize, intersection, visibility, input, retry timer, animation, geometry, material, and texture resources on unmount.

## Navigation continuity

- Portal selection retains its camera push and overlay fade.
- Every non-hash route link uses the persistent route-transition provider.
- The outgoing page scales and softens behind a bottom-up black veil over `420ms`.
- The arriving page releases the veil with the same motion family.
- Reduced motion routes immediately without scale, blur, or travel.
- Session state prevents the entry choice from replaying when returning to the homepage.

## Gallery escape behavior

- Wheel movement beyond the first or last portal is not cancelled, so normal document scrolling resumes.
- A final-portal upward touch drag accumulates a deliberate `52px` handoff before smoothly revealing the semantic index.
- Pressing a forward step key at the final portal performs the same index handoff.
- The always-visible “Explore what we can import” link remains a direct escape path.

## Micro-interaction grammar

- Use one shared exit curve: `cubic-bezier(.22, 1, .36, 1)`.
- Active-world metadata crossfades upward when the focused world changes.
- Index rows translate the title and diagonal arrow on hover without shifting layout.
- Form labels react through `:focus-within`; submission status enters once.
- Accordions rotate their state mark and reveal copy with opacity plus bounded height.
- Viewport reveals run only once and retain visible content when scripting is unavailable.
- All motion has a `prefers-reduced-motion` equivalent.

## Acceptance checklist

- No overlap among header, intro, world card, dots, and index CTA at `320×568`, `390×844`, `768×1024`, `1024×768`, `1366×768`, or `1440×900`.
- All six worlds are reachable by wheel, drag, touch, keyboard, direct index, and WebGL fallback.
- Visitors can leave the gallery at its final boundary without reloading or finding a hidden control.
- Route changes never expose a blank flash or abrupt palette cut.
- The first world becomes interactive without waiting for five unrelated textures.
- Rendering pauses outside the viewport and resumes without a jump.
- Reduced-motion and WebGL-failure modes preserve all content and routes.
- Lint, route rendering, production build, and deployment verification pass.
