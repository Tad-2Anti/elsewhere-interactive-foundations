# Off-centre Composition and Bounce Plan

## Problem

The stability pass removed the distracting left/right shake, but it also compressed the authored image offsets enough to lose the original Atmospheric Depth Gallery composition. The vertical response was controlled but too subtle to convey the requested physical bounce.

## Root causes

1. Assigning each crossfading plane its own large authored X target makes two partially visible images pull toward opposite sides at once. That reads as shake even when both target positions are intentional.
2. Reducing the offsets fixes the symptom but removes the reference component's asymmetric editorial framing.
3. The previous spring's high stiffness and damping returned to rest quickly, so its overshoot was difficult to perceive.
4. Using one response rate for both axes prevents the vertical movement from becoming more expressive without also making lateral travel twitchier.

## Correction plan

1. Restore the original five component offsets (`-0.90, 0.80, -0.70, 1.00, -0.70`) and use `0.55` for the added sixth world.
2. Derive one `compositionX` from the current and next world instead of positioning the two visible planes independently.
3. Ease that anchor with fifth-order `smootherstep`, which reaches zero velocity and zero acceleration at both world boundaries.
4. Continue applying velocity filtering, dead-zone handling, movement-time pointer suppression, low tilt, and frame-rate-independent interpolation from the stability pass.
5. Separate horizontal and vertical interpolation. Keep X deliberately measured while allowing Y to react quickly enough for the spring to remain visible.
6. Increase wheel/drag impulse and travel, then lower the spring's stiffness and damping to create an under-damped overshoot with a bounded settling tail.
7. Preserve a hard Y position limit and spring velocity limit. Disable the spring entirely under reduced motion.
8. Keep depth spacing, plane fades, routes, collages, atmosphere palettes, and portal activation unchanged.

## Acceptance checks

- At each rest point, desktop X matches the authored value for that world; mobile uses exactly 25% of it.
- During every crossfade, outgoing and incoming planes share the same X target.
- The horizontal anchor is position-, velocity-, and acceleration-continuous at each world boundary.
- Slow trackpad scrolling does not visibly oscillate left and right, and a stationary cursor cannot add meaningful lateral motion during travel.
- Fast wheel movement produces noticeable vertical displacement, overshoot, and a short settling tail without exceeding `0.30` world units.
- Direction reversals do not introduce a one-frame lateral snap or an unbounded vertical kick.
- All six worlds remain compositionally distinct and reachable.
- Reduced-motion behavior remains discrete and has no spring bounce.
