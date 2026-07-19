# ELSEWHERE Interactive

ELSEWHERE is an immersive import-discovery website organized as six atmospheric worlds: **Arcade, Scent, Carry, Arena, Adorn, and Little.** Visitors navigate a depth-scrolling Three.js gallery on the homepage, then dive into individual world routes with researched, filterable product catalogs and a sourcing request form.

---

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 (strict) |
| Styling | Vanilla CSS (Tailwind 4 utility layer) |
| 3-D gallery | Three.js 0.179 |
| Form persistence | PostgreSQL via Drizzle ORM + `pg` |
| Email forwarding | Web3Forms |
| Testing | Node.js built-in test runner + Playwright |
| CI | GitHub Actions (lint → build → E2E) |
| Hosting | Vercel (native Next.js) |

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | Homepage with Atmospheric Depth Gallery and sourcing request form |
| `/world/[slug]` | SSG | World page for each of the six canonical worlds |
| `/world/[alias]` | SSG | Legacy alias slugs (roam, gather, restore, ritual, wonder) that render the canonical world |
| `/api/requests` | Dynamic | `POST` endpoint — validates, persists to Postgres, forwards to Web3Forms |
| `/sitemap.xml` | Static | Dynamically generated sitemap |
| `/robots.txt` | Static | Search engine crawl rules |

## Gallery interaction

The approved homepage experience is the **Atmospheric Depth Gallery**: six world-portal images positioned along the Z-axis, navigated by wheel, trackpad momentum, drag, and touch. Scroll velocity modulates drift, tilt, scale, and a colour-keyed atmospheric gradient. Implementation lives in [`app/atmospheric-gallery/depth-engine.ts`](app/atmospheric-gallery/depth-engine.ts) and [`app/atmospheric-depth-gallery.tsx`](app/atmospheric-depth-gallery.tsx).

> **Do not reintroduce the circular ring lobby** — it was rejected and the approved experience is the Depth Gallery only.

## Local development

```bash
# 1. Clone and install
git clone <repo-url>
cd elsewhere-interactive-foundations
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL to a real Postgres URL

# 3. Run database migrations (first time only)
npx drizzle-kit push

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

## Testing

```bash
# Unit tests (no server needed)
npm test

# TypeScript check
npm run typecheck

# Lint
npm run lint

# E2E tests (requires dev or production server)
npm run test:e2e
```

Unit tests run without a live database — `NODE_ENV=test` activates a mock DB shim in [`db/index.ts`](db/index.ts). E2E tests auto-start `npm run dev` locally; in CI they use the pre-built production server.

## Production build

```bash
npm run build    # outputs to .next/
npm run start    # serves the production build on :3000
```

## Deployment (Vercel)

1. Import the repository in the Vercel dashboard.
2. Set **Environment Variables**:
   - `DATABASE_URL` — Neon or Vercel Postgres connection string
   - `WEB3FORMS_ACCESS_KEY` — your Web3Forms key (default is development-only)
3. Deploy — Vercel detects Next.js automatically; no framework preset changes needed.

## Database

Schema is defined in [`db/schema.ts`](db/schema.ts). The single table `sourcing_requests` stores every form submission. Run migrations with Drizzle Kit:

```bash
# Push schema to database (dev / staging)
npx drizzle-kit push

# Generate SQL migration files
npx drizzle-kit generate
```

## Documentation

| Document | Purpose |
|---|---|
| [docs/product-requirements.md](docs/product-requirements.md) | Goals, constraints, user journeys |
| [docs/design-direction.md](docs/design-direction.md) | Visual language, typography, colour system |
| [docs/interaction-specification.md](docs/interaction-specification.md) | Input handling, reduced-motion, accessibility |
| [docs/technical-architecture.md](docs/technical-architecture.md) | Stack decisions, file map, data flow |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Original migration plan from prototype to production |
| [docs/content-and-worlds.md](docs/content-and-worlds.md) | World model, catalog structure, aliases |
| [docs/asset-manifest.md](docs/asset-manifest.md) | All media file paths and licensing |
| [docs/ai-context.md](docs/ai-context.md) | Guidance for AI coding assistants |
| [ATTRIBUTIONS.md](ATTRIBUTIONS.md) | Third-party licenses and credits |

## Contributing

- Run `npm run typecheck`, `npm run lint`, and `npm test` before opening a PR.
- All design or architecture changes must update the corresponding `docs/` document.
- Do not use `next/image` — the gallery uses native `<img>` to preserve Three.js motion hand-off.
- Do not add `_vinext`, Cloudflare Worker, or Vite-specific code — the project is native Next.js.
