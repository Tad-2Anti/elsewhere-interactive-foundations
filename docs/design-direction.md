# Design Direction

## Approved experience

The homepage must use the visual and motion language of the [Atmospheric Depth Gallery](https://tympanus.net/Tutorials/DepthGallery/): editorial image planes distributed through depth, a camera moving along the Z-axis, subtle cursor parallax, scroll-velocity reactions, and atmosphere that changes with the active plane.

This decision superseded the circular six-screen ring, which has now been removed from the implementation.

## Brand qualities

- Mysterious, but not confusing
- Editorial, not game-like
- Tactile, material, and collected
- Quiet confidence instead of visual noise
- Cinematic depth with restrained motion

## Composition

- Full-viewport black or near-black canvas
- One dominant portrait collage plane at a time
- Neighboring planes remain visible in depth as peripheral context
- Alternating intentional horizontal positions create a path, not a straight slideshow
- Minimal fixed interface around the WebGL canvas
- World title and metadata stay in HTML for clarity and accessibility

## Visual system

| Token | Value | Use |
|---|---|---|
| Void | `#050505` | Canvas and page background |
| Chalk | `#e9e6df` | Primary type |
| Ash | `#8f8d88` | Secondary type |
| Hairline | `rgba(233,230,223,.22)` | Rules and progress |
| Arcade | `#b8ff45` | Acid-green and emerald arcade-grid atmosphere |
| Scent | `#ff9a71` | Apricot/cherry vapor atmosphere |
| Carry | `#72d7f2` | Pool-blue/coral route-map atmosphere |
| Arena | `#dfff43` | Acid-lime court energy over bottle green, with cobalt and coral image accents |
| Wear | `#9d7966` | Tobacco/rose atmosphere |
| Little | `#ffd73e` | Sunny-yellow/tomato playroom atmosphere |

## Typography

- Display: a high-contrast editorial serif or restrained humanist serif, 400 weight
- Interface: a neutral grotesk sans, 400–500 weight
- Metadata: uppercase, 10–12 px, generous tracking
- World titles: responsive `clamp(3.5rem, 9vw, 9rem)` with controlled line height
- Do not place generated text inside collage images

Font selection remains license-dependent. Until final brand fonts are chosen, use a system serif/sans stack that does not delay implementation.

## Collage art direction

All six collages belong to one collection:

- Portrait 4:5 format
- Black velvet or deep charcoal field
- Layered cut-paper photographic still life
- Museum-catalog polish with tactile material realism
- Soft directional studio lighting and subtle film grain
- Restrained surreal depth rather than chaotic montage
- Generous dark negative space around the subject cluster
- No people, text, logos, watermarks, or recognizable brands

Each world changes objects and palette but preserves framing, lighting logic, density, and material treatment.

## Motion character

- Slow interpolation makes the camera feel weighted rather than delayed.
- Pointer movement produces subtle parallax, never orbit control.
- Scroll direction creates brief vertical drift.
- Scroll velocity creates a small tilt and scale “breath.”
- Palette transitions lag slightly behind camera motion.
- Portal entry accelerates only after explicit selection.
- Reduced motion uses discrete focus changes and opacity fades.

## Responsive direction

- Desktop shows the deepest composition and strongest parallax.
- Tablet preserves the editorial split while reducing plane scale, X spread, shader density, and UI density.
- Mobile uses a centered-safe canvas composition, one-quarter X spread, `1.0` DPR, no trail, and stronger edge vignette for readable HTML.
- Short landscape is a first-class layout: secondary copy collapses and the world route returns to a compact split hero.
- Text remains HTML and relocates to safe-area-aware screen edges rather than being embedded in the canvas.
- Page changes use a restrained black veil and a single hairline signal; decorative route choreography never replaces navigational feedback.
- Micro-animation is functional: it confirms focus, expansion, active-world change, successful submission, or navigation state.
