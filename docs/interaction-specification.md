# Interaction Specification

## Interaction model

The homepage is a bounded depth journey through six portals. It is not an orbit, carousel, infinite loop, free-flight camera, or flat scroll page.

## Scene states

1. `loading`: minimum assets and shaders initialize.
2. `entry`: sound/quiet choice is visible.
3. `intro`: camera settles on Arcade and the move hint appears.
4. `resting`: velocity approaches zero; active portal is readable.
5. `moving`: wheel, drag, touch, or keyboard modifies the scroll target.
6. `focusing`: the nearest portal becomes active and its HTML metadata updates.
7. `entering`: input locks; camera moves toward the selected portal; route changes.
8. `returning`: homepage restores the last active depth and fades controls in.
9. `fallback`: semantic index replaces WebGL when rendering is unavailable.

## Input mapping

| Input | Behavior |
|---|---|
| Mouse wheel / trackpad | Add delta to bounded depth target |
| Pointer drag | Convert vertical drag distance into depth target change |
| Touch drag | Same as pointer drag with velocity sampling and momentum |
| Arrow Down / Right | Move to next portal |
| Arrow Up / Left | Move to previous portal |
| Page Down / Page Up | Move one portal |
| Home / End | Move to first / last portal |
| Click / tap active portal | Begin portal-entry transition |
| Click / tap inactive portal | Focus it first; second activation enters |
| Escape during entering | Cancel before route commit when technically possible |

## Camera and plane response

The engine preserves the upstream Atmospheric Depth Gallery relationships, including its deliberately off-centre compositions. A shared transition anchor keeps the large left/right offsets without allowing the outgoing and incoming images to pull in opposite directions during a crossfade.

Core relationships:

```text
scrollTarget += normalizedInputDelta
scrollCurrent = lerp(scrollCurrent, scrollTarget, smoothing)
cameraZ = startZ - scrollCurrent * scrollToWorldFactor
cameraDelta = (scrollCurrent - previousScrollCurrent) * scrollToWorldFactor
velocity = lowPass(clamp(cameraDelta, velocityLimit))
```

Composition and per-plane response:

```text
blendEased = smootherstep(depth - floor(depth))
compositionX = lerp(currentWorld.authoredX, nextWorld.authoredX, blendEased)
x = compositionX + pointerX * parallaxAmount * depthInfluence * (1 - movementSuppression)
y = authoredY + pointerY * parallaxAmount * depthInfluence + scrollDrift
rotationX = pointerY * velocityTilt
rotationY = pointerX * velocityTilt
scale = baseScale + velocityBreath
```

The outgoing and incoming planes receive the same `compositionX` for the entire overlap. Because `smootherstep` has zero first and second derivatives at both ends, crossing an integer depth cannot introduce a one-frame lateral velocity jump.

## Authored six-world path

Desktop uses the original component's pronounced alternating offsets. Little uses a quieter positive offset to finish the sequence:

| World | X tendency | Z order | Dominant atmosphere |
|---|---:|---:|---|
| Arcade | `-0.90` | `0` | Cyan / violet |
| Scent | `0.80` | `-1` | Apricot / cherry |
| Carry | `-0.70` | `-2` | Pool blue / coral |
| Arena | `1.05` | `-3` | Acid lime / bottle green; right-weighted sports collage |
| Wear | `-0.70` | `-4` | Tobacco / dusty rose |
| Little | `0.55` | `-5` | Yellow / tomato / violet |

Z positions use the upstream `planeGap` until the parity pass is complete.

## Motion stability profile

- Scroll and velocity interpolation are frame-rate independent.
- Large authored offsets are interpolated through one shared `smootherstep` composition anchor; crossfading planes never occupy competing X targets.
- Camera velocity is measured in world space, clamped, low-pass filtered, and given a dead zone before it affects visuals.
- Pointer X parallax is limited to `0.018` world units and is suppressed by up to 94% while the camera is moving.
- Maximum scroll-driven plane tilt is `0.007` radians.
- Breath scale is limited to `0.014` and uses a slower interpolation channel.
- Wheel and drag events add directional impulses of `0.15` and `0.18` to a deliberately under-damped vertical spring. Scroll velocity sustains it with stiffness `38`, damping `4.8`, target amplitude `0.20`, velocity limit `1.60`, and a hard travel limit of `0.30` world units. This produces a visible overshoot and settling motion without unbounded displacement.
- Plane positioning, rotation, scale, and pointer tracking use separate smoothing constants so one noisy input cannot shake every channel.
- Horizontal and vertical positions have separate response rates (`0.065` and `0.14` at 60 fps), allowing the bounce to read clearly while lateral travel remains restrained.
- Mobile retains one quarter of the desktop authored X spread so the subject remains inside the narrow viewport.

## Active portal rule

The active portal is the plane with the smallest absolute distance from the camera’s focus depth, with hysteresis to prevent rapid toggling near midpoints. HTML metadata changes only after the new portal remains active for at least one rendered frame.

## Portal entry

- Freeze new scroll target input.
- Ease scroll target to the portal’s exact focus value.
- Increase active plane scale slightly and fade neighboring planes.
- Fade fixed metadata except the world name.
- Move camera toward/through the plane over approximately 650–900 ms.
- Navigate to the matching route.
- Store the active world ID in session storage and route state.

## Audio

- Music is opt-in at the entry gate and remains controllable independently of navigation.
- The soundtrack is generated entirely in Web Audio at 118 BPM using original arpeggio, bass, kick, hat, and clap patterns.
- A compressor and low-pass color stage keep the mix bright but controlled.
- No third-party recording, sample, or music license is required.
- Muting suspends the audio context; resuming continues the loop without reloading the page.

## Reduced motion

- No continuous camera interpolation or pointer parallax.
- Wheel/keys change one portal at a time.
- Planes crossfade and reposition instantly or within 150–200 ms.
- Portal entry becomes a simple fade-through transition.
- All content and routes remain identical.
