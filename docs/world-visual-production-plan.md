# World Visual Production Plan

Status: implemented and visually inspected · 18 July 2026

## Audit: what is genuinely missing

Before this production pass, Adorn was the only homepage portal that spoke the intended bright, youthful, physical-collage language. Arcade, Scent, Carry, Arena and Little pointed to legacy images made for former categories. They were dark, centred still lifes with limited colour, little paper movement and no credible relationship to the new products.

Every world route also reused its homepage portal as its hero. That created three problems:

1. The homepage image is designed to read as a moving 4:5 portal at a distance, while the route hero needs closer editorial detail.
2. Repetition makes entering a world feel like seeing the same screen twice.
3. The six route heroes differ only through a mask and background colour; their compositions do not express category-specific behaviour.

## Deliverable set

| Role | Count | Master ratio | Production derivatives | Purpose |
| --- | ---: | --- | --- | --- |
| Homepage portal | 5 | 4:5 portrait | 1120×1400 WebP + 800×1000 mobile | Replace Arcade, Scent, Carry, Arena and Little legacy images. Adorn remains. |
| World route hero | 6 | 4:5 portrait | 1120×1400 WebP + 800×1000 mobile | Give every route a distinct entry image, including a new Adorn hero. |

Generated masters remain outside the public bundle. Only inspected WebP derivatives enter `public/media/worlds/`.

Implementation result: all five replacement portals, all six separate route heroes, and all eleven mobile derivatives are in production. The exact paths are indexed in `docs/asset-manifest.md`.

## Shared visual contract

- Physical scrapbook collage with photographed paper, tape, translucent film, textile, plastic, metal and soft cast shadows.
- Bright, youthful and slightly chaotic, but with one clear focal cluster.
- Off-centre composition: roughly 65% of visual mass sits to one side, leaving breathing space for the site's HTML labels.
- Deep coloured paper field rather than a plain black or flat gradient background.
- No brand names, packaging, logos, copyrighted characters, readable labels or imitation product photography.
- Objects are category archetypes, not counterfeit renderings of catalog products.
- No embedded text, watermark, UI, browser frame or mock website.
- Preserve a safe central 70% so tablet and mobile cropping never removes the category cue.

## Portal briefs

### Arcade

Emerald-green paper field; cyan grid fragments; abstract controller shells, sticks, button caps, cable loops, a red optical-viewer hood and acid-yellow wheel ring. Focal cluster lower-right, with one cable crossing the empty upper-left space.

### Scent

Plum-to-coral paper field; clear abstract perfume glass, banana crescent, coconut shell, tea leaves, oily reflections, lilac foil and a red lacquer heart. Focal cluster right-of-centre; vapor creates depth without becoming smoke-heavy.

### Carry

Pool-blue/navy field; abstract travel-backpack panels, coral packing cubes, olive straps, yellow sock, zipper pulls, route-line paper and baggage-tag shapes. Open-pack geometry lower-right; strap escapes the frame.

### Arena

Pitch-black/cobalt field; cropped unbranded jersey mesh, basketball and futsal tread fragments, laces, match-ticket shapes, court tape and an acid-lime arc. Strong diagonal from lower-left to upper-right; no team crests or player imagery.

### Little

Deep-violet field; wooden train curve, toy crane, candy-coloured dollhouse section, small wooden people, spoon, wheel, confetti and a tomato-red handprint shape. Playful cluster low-left with a blue track line rising through the frame.

## Route-hero briefs and section behaviour

### Arcade — control deck

Image: closer, more architectural controller-and-viewer arrangement on emerald, leaf and acid-green paper, with cyan acrylic reflections and visible paper depth. Section: chamfered portal, offset hot-pink shadow, green grid and a tiny moving scan line.

### Scent — glass cloud

Image: clear bottle geometry, fruit, tea and liquid light arranged like a floating gourmand picnic. Section: asymmetric droplet frame, large blurred halo and slow vapor-like highlight drift.

### Carry — open system

Image: open travel-pack interior exploded into colour-coded cubes and straps. Section: squared soft case frame, coral offset layer, animated route line and luggage-tag corner detail.

### Arena — match cut

Image: mesh, sole tread, laces and ticket fragments crossing at speed. Section: hard diagonal crop, acid-lime court arc, coral score-mark accent and faster hover parallax than the quieter worlds.

### Adorn — dressing-table burst

Image: makeup pigment, sculptural earrings and flowers moving outward across cobalt and plum paper. Section: jewel-like scalloped frame, gold orbit line and softer reflective hover glint. It must complement, not duplicate, the existing homepage portal.

### Little — build-anything city

Image: a miniature wooden city assembled from train, house and mud-kitchen cues, with visible handmade paper shadows. Section: organic blob frame, confetti drift and a small track-line flourish.

## Responsive rules

- Desktop hero image occupies 34–38vw and remains deliberately off-centre.
- Tablet reduces decorative layers before reducing the image; the product cue remains at least 60% visible.
- Phone uses the 800×1000 derivative, keeps the focal cluster in view through per-world `object-position`, and moves decoration behind rather than over copy.
- Short landscape uses a compact two-column hero and disables large offset shadows.
- Reduced motion keeps the final composition, removes scan/highlight/confetti travel and retains only a short opacity transition.

## Acceptance checklist

- All five new portals are recognisable without reading the title.
- Every route hero differs from its homepage portal at first glance.
- The set feels related through paper depth, lighting and crop discipline, not through identical layouts.
- No image contains readable or recognisable third-party branding.
- Every desktop and mobile derivative has been visually inspected.
- Homepage loading remains progressive and all routes remain useful when imagery fails.
