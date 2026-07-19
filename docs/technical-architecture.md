# Technical Architecture

## Current stack

- Vinext / React / TypeScript
- Cloudflare-compatible Sites deployment
- Three.js
- Direct imperative Three.js engine, dynamically imported after hydration

## Approved engine strategy

Use a direct TypeScript port of the MIT-licensed [Atmospheric Depth Gallery](https://github.com/houmahani/codrops-depth-gallery) rather than reproducing it approximately with React Three Fiber components.

The upstream implementation uses plain Three.js, Vite, JavaScript modules, and GLSL. Preserving its engine boundaries and render-loop behavior gives the best chance of matching the demo exactly. React owns lifecycle, accessible HTML, routing, and state; the gallery engine owns the canvas.

## Target module structure

```text
app/
  atmospheric-gallery/
    atmospheric-depth-gallery.tsx   React client wrapper
    engine.ts                        renderer, scene, camera, clock
    gallery.ts                       plane creation and active-plane logic
    scroll.ts                        wheel/touch target, smoothing, bounds
    interaction.ts                   pointer, keyboard, resize
    background.ts                    palette interpolation and GLSL surface
    trail.ts                         optional upstream spline/trail layer
    media-plane.ts                   texture, geometry, shader uniforms
    shaders/
      media.vert.ts
      media.frag.ts
      background.vert.ts
      background.frag.ts
    types.ts
  experience.tsx                    entry, audio, HTML overlay, routing
  world-data.ts                     world content and gallery parameters
public/media/worlds/
  gather-collage.webp
  restore-collage.webp
  ritual-collage.webp
  roam-collage.webp
  wear-collage.webp
  wonder-collage.webp
```

## React-to-engine contract

`AtmosphericDepthGallery` accepts:

```ts
type AtmosphericDepthGalleryProps = {
  worlds: World[];
  initialWorldId?: string;
  reducedMotion: boolean;
  quality: "low" | "medium" | "high";
  onActiveWorldChange(id: string): void;
  onWorldActivate(id: string): void;
  onLoadProgress?(value: number): void;
};
```

The wrapper creates the engine once, updates only mutable inputs, and disposes geometry, materials, textures, renderer, animation frames, observers, and event listeners on unmount.

## Data model additions

Each `World` gains:

```ts
gallery: {
  texture: string;
  mobileTexture?: string;
  x: number;
  zIndex: number;
  palette: [string, string, string];
  focalPoint?: [number, number];
};
```

The existing `image` field remains temporarily for route compatibility, then aliases `gallery.texture`.

## Performance tiers

| Tier | DPR | Background | Trail | Texture target |
|---|---:|---|---|---|
| Desktop | max `1.75` | Full GLSL, noise `0.040` | Enabled | 1120×1400 WebP |
| Tablet | max `1.35` | Full GLSL, noise `0.032` | Disabled | 1120×1400 WebP |
| Mobile | max `1.25` | Full GLSL, noise `0.022` | Disabled | 800×1000 WebP progressively loaded |

Quality is selected conservatively from live canvas width and coarse-pointer state. Visual Viewport and element resize events are coalesced into one animation-frame update. Antialiasing is disabled when the renderer is created below the mobile breakpoint.

## Loading strategy

- Serve project-owned raster art from direct `/media/` URLs. Do not route these assets through the optional Vinext image optimizer; the production worker does not expose that route reliably.
- Load the requested initial portal and background shader first.
- Create the remaining portals with one-pixel palette placeholders.
- Load remaining textures in distance-prioritized batches of two after the first interactive frame.
- A four-second readiness deadline may reveal a palette placeholder, but late responses remain eligible to replace it; genuine failures receive one delayed retry.
- Use trilinear mipmaps and bounded `2×` anisotropy for stable sampling during plane breath and camera movement.
- Replace and dispose each placeholder in place.
- Pause the request-animation-frame loop through Intersection Observer and Page Visibility state.
- Dispose textures, placeholders, observers, listeners, frames, renderer, materials, and geometry during unmount.

## Route transition contract

`RouteTransitionProvider` persists in the root layout. `TransitionLink` intercepts unmodified internal clicks, starts the route after a short `160ms` cover, and releases through a `320ms` arrival. Same-document and hash moves bypass the curtain. A `1400ms` watchdog always restores the page if navigation stalls. Programmatic portal navigation uses the same provider after the Three.js camera reaches its commit marker.

## Responsive input contract

- Wheel events are cancelled only while a depth target can still move.
- Touch dragging remains canvas-owned, but a bounded final-edge gesture hands off to the semantic index.
- Keyboard forward movement at the last portal performs the same handoff.
- Resize Observer handles the actual canvas box; Visual Viewport covers mobile browser chrome and orientation changes.

## Routing and restoration

- Portal activation calls the existing router only after the entry timeline reaches its route-commit marker.
- Store `activeWorldId` and normalized depth progress in session storage.
- The world-page return link includes `?from=<world-id>` as a deterministic fallback.
- On return, the engine initializes at the saved portal without replaying the entry gate during the same session.

## Search and sharing contract

- `app/site-config.ts` is the single source for the public site name, canonical origin, description, locale, and indexing environment.
- Production pages emit unique canonical metadata. Preview deployments are `noindex`; the request API is excluded from crawler access.
- Legacy world slugs permanently redirect to their canonical six-world routes and never appear in the sitemap.
- The homepage emits `WebSite`, `Organization`, and six-world `ItemList` structured data. World routes emit `CollectionPage` and `BreadcrumbList` data; they intentionally do not claim purchasable `Product` or `Offer` inventory.
- Root and world-specific Open Graph images are original, code-rendered brand assets. The manifest and icon family use the same ELSEWHERE monogram.
- Sitemap modification dates are omitted until a truthful content timestamp exists; runtime request time must never be presented as content freshness.

## Accessibility and fallback

- Canvas is decorative from the accessibility tree.
- Active title, description, progress, controls, and route links remain semantic HTML.
- A non-WebGL index renders the same six route links and collage thumbnails.
- Keyboard input is handled only while the gallery region has focus or the document is not inside a form control.

## Security and licensing

- Vendor only MIT-licensed source logic needed for the component.
- Preserve the upstream license and add attribution in `ATTRIBUTIONS.md` and source headers.
- Do not copy imagery, fonts, text, or sounds from the reference portfolio or Codrops demo.
- All six collage images are original project assets.
- `WEB3FORMS_ACCESS_KEY` is environment-only and has no repository fallback. Database storage and Web3Forms forwarding are independent delivery channels: a validated request succeeds when at least one configured channel accepts it, returns `503` when neither channel is configured, and returns `502` when all configured channels fail. Provider responses must report `success: true`; an HTTP success alone is insufficient.
