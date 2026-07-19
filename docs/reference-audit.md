# Reference Audit and Component Decision

## Original inspiration

- Live portfolio: https://michaelgatt.com/
- Project credit: https://dribbble.com/shots/27563725-Michael-Gatt-Folio

The live portfolio was inspected as a behavioral reference. It presents a sound-gated, full-screen canvas experience with camera-led spatial exploration, custom cursor behavior, minimal fixed navigation, and a separate index view. Its production code and media are not treated as reusable assets.

## Selected reusable component

- Demo: https://tympanus.net/Tutorials/DepthGallery/
- Source: https://github.com/houmahani/codrops-depth-gallery
- Technical article: https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/
- License: MIT

The Atmospheric Depth Gallery was selected because it supplies the closest verified open-source behavior:

| Required behavior | Selected component |
|---|---|
| Cinematic image planes in 3D space | Planes authored along the Z-axis |
| Weighted movement | Separate target/current scroll values with interpolation |
| Camera travels through the collection | Scroll value drives camera Z |
| Cursor affects the scene | X/Y plane parallax |
| Fast movement feels physical | Velocity-driven drift, tilt, and scale |
| Every world has a visual atmosphere | Per-plane palette blends the background |
| Reusable code | Public MIT-licensed repository |

## Rejected alternatives

### Circular WebGL Gallery

Useful for a curved carousel, but it produces the wrong navigation model. ELSEWHERE should move through depth, not around an orbit.

### Infinite Canvas

Useful for free X/Y/Z exploration and chunked media loading, but broader than required. ELSEWHERE needs an authored six-step journey with clear bounds.

### GSAP Draggable galleries

Useful for input inertia and transition timelines, but typically operate on flat DOM galleries. GSAP remains appropriate for entry and portal timelines, not as the core renderer.

## Implementation conclusion

Port the Atmospheric Depth Gallery engine directly and preserve its motion logic. Use ELSEWHERE’s six original collages, copy, palettes, route structure, sound design, accessibility layer, and responsive quality tiers. Do not mix the earlier circular lobby into the new engine.
