# ELSEWHERE Interactive

ELSEWHERE is an immersive import-discovery website organized as six atmospheric worlds: Arcade, Scent, Carry, Arena, Adorn, and Little.

The approved homepage interaction is the **Atmospheric Depth Gallery** pattern: a sequence of image planes positioned along the Z-axis, navigated by wheel, trackpad, drag, and touch. Scroll velocity influences plane drift, tilt, scale, and atmosphere. It replaces the earlier circular carousel experiment.

## Approved reference

- [Atmospheric Depth Gallery demo](https://tympanus.net/Tutorials/DepthGallery/)
- [MIT-licensed source](https://github.com/houmahani/codrops-depth-gallery)
- [Codrops implementation article](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/)

The reference code is not yet integrated in this planning checkpoint. The exact migration is specified in [docs/implementation-plan.md](docs/implementation-plan.md).

## Product shape

- Entry sequence with sound or quiet entry
- One depth-scrolling homepage containing six visual portals
- Six individual world routes with researched, filterable opening catalogs
- Mouse, wheel, trackpad, keyboard, touch, and reduced-motion behavior
- Original collage imagery and properly licensed audio only
- Two primary actions: “Explore what we can import” and “Request something”

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Design direction](docs/design-direction.md)
- [Interaction specification](docs/interaction-specification.md)
- [Technical architecture](docs/technical-architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [World and content model](docs/content-and-worlds.md)
- [Asset manifest](docs/asset-manifest.md)
- [World visual production plan](docs/world-visual-production-plan.md)
- [Generated collage prompts](docs/generated-asset-prompts.md)
- [Reference audit](docs/reference-audit.md)
- [AI implementation context](docs/ai-context.md)
- [Third-party attributions](ATTRIBUTIONS.md)

## Local development

```bash
npm run dev
```

The production artifact is built and validated through the Sites lifecycle. The application uses Vinext, React, TypeScript, and Three.js.
