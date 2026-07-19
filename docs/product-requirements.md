# Product Requirements Document

## Product statement

ELSEWHERE helps customers discover unusual, importable objects through an exploratory digital world rather than a conventional catalog grid. The homepage should feel like moving through a sequence of cinematic portals, with each portal representing one category world.

## Objective

Validate whether an atmospheric, spatial interface makes the brand memorable while still allowing a visitor to understand the six categories and reach a request action within two minutes.

## Primary audience

- Design-aware customers searching for uncommon play, fragrance, travel, sports, beauty, accessory, and children's products
- Customers who know the feeling or use case they want but not the exact product
- Early partners and suppliers evaluating the brand concept

## Primary user journey

1. The visitor sees a short loading and entry sequence.
2. The visitor chooses sound or quiet entry.
3. The first collage portal appears in depth.
4. Wheel, trackpad, drag, touch, or keyboard movement advances through six portals.
5. Each portal reveals a world name, short proposition, progress, and color atmosphere.
6. Selecting a portal moves the camera toward it and opens the corresponding world route.
7. The visitor explores a researched, filterable opening catalog with dated availability evidence.
8. The visitor chooses either “Explore what we can import” or “Request something.”

## Functional requirements

### Homepage

- A 2–3 second entry sequence that never blocks longer than necessary
- Explicit sound and quiet-entry choices
- Atmospheric Depth Gallery behavior based on the approved Codrops reference
- Six collage planes arranged along the Z-axis
- Smooth bounded progression; no circular carousel and no empty overscroll
- Active-world title, category proposition, and `01 / 06` progress
- Hover/focus affordance and click/tap portal entry
- Persistent wordmark, sound toggle, index-view link, and primary request action
- Optional index view listing all six worlds without WebGL dependence

### World routes

- One route per world: `/world/arcade`, `/world/scent`, `/world/carry`, `/world/arena`, `/world/adorn`, `/world/little`. Legacy aliases `/world/gather`, `/world/restore`, `/world/ritual`, `/world/roam`, `/world/wear`, and `/world/wonder` preserve old inbound links.
- Hero uses the same world collage as its portal
- Manifesto, filterable opening catalog, product-fit guidance, and request action
- Request form collects full name, email, optional phone/WhatsApp, city and country, preferred contact method, reference link, and request details
- Previous/next world navigation
- Return to the exact homepage depth position

### Input and accessibility

- Wheel and trackpad scrolling
- Pointer dragging with inertia
- Touch dragging and momentum
- Arrow keys, Page Up/Page Down, Home, and End
- Focus-visible controls and semantic fallback content
- `prefers-reduced-motion` replaces depth travel with crossfades and discrete steps
- WebGL failure exposes the index view and all routes
- Sound is opt-in and never required for navigation
- Phone and tablet users can leave the spatial gallery through a visible control or final-edge input handoff.
- Internal route changes use a smooth, reduced-motion-aware transition rather than a blank or abrupt cut.
- Route transitions begin navigation promptly and include a bounded recovery path so a failed, slow, hash-only, or same-document move cannot leave the curtain stuck.
- Safe areas, dynamic viewport height, short landscape, and coarse-pointer targets are supported.

## Success criteria

- A new visitor can identify all six worlds without instruction beyond a short move hint.
- The active world remains readable throughout motion.
- Portal selection and return navigation preserve orientation.
- Desktop motion maintains a target of 60 fps on a recent laptop.
- Mobile motion maintains a target of 30–60 fps with reduced visual effects.
- Largest collage images are progressively loaded; the first interactive frame is not blocked by all six full-resolution assets.
- The WebGL loop pauses while the gallery is offscreen or the page is hidden.
- Lighthouse accessibility target: 90 or higher, excluding unavoidable WebGL caveats.

## Non-goals for the first release

- Checkout, inventory, pricing, or payment processing
- User accounts or saved collections
- Supplier dashboards
- A fully modeled 3D environment for every product
- Copying the reference site’s proprietary code, imagery, music, or branding

## Release definition

The first releasable experience is complete when the depth gallery, all six world routes, original collage assets, request flow, responsive controls, fallback index, accessibility behavior, and performance tiers are deployed and verified.
