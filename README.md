# Sonan Bunkers — Astro Rebuild

A faithful rebuild of https://www.sonanbunkers.com/ in Astro + Tailwind v4 + TypeScript, with a documented design system, comprehensive QA, and 10 representative pages.

## Quick start

```bash
pnpm install          # install runtime + dev deps
pnpm dev              # http://localhost:4321 (vite dev server with HMR)
pnpm build            # produces dist/
pnpm preview          # serves dist/ at http://localhost:4321
```

## Tests

```bash
pnpm test                            # vitest — component-level (Button) unit tests
pnpm exec playwright test            # a11y suite (axe-core, WCAG 2 AA)
pnpm exec lhci collect               # Lighthouse audit (Performance/A11y/Best/SEO)
```

## What's built

- **10 page routes** in `src/pages/` — home, about-us index, about-us/your-marine-energy-provider, four service detail pages, contact, press-room/news, legal/privacy-policy
- **13 reusable components** in `src/components/`: BaseLayout-aware Header (with always-on hamburger MenuDrawer), Footer, Container, Section, Hero, Card, OfficeCard, Slider (Embla), Input, Textarea, Button (TDD), plus SectionRenderer that switches on `section.kind`
- **Design system** — Tailwind v4 `@theme` tokens in `src/styles/global.css` mirrored by raw custom properties in `src/styles/tokens.css`. Brand navy `#274380`, ink `#212529`, Averta Standard W01 (sans) + Roboto Slab (slab)
- **Motion** — MotionOne-driven scroll reveals on `[data-reveal]` elements, with `prefers-reduced-motion` respect; no-FOUC initial state
- **Image pipeline** — astro:assets + Sharp emit AVIF/WebP variants at responsive widths
- **Fonts** — Monotype `fast.fonts.net` (Averta, domain-licensed) + Google Fonts (Roboto Slab) embedded via `<link>` in BaseLayout

## Tech stack

- Astro 6.3 (static SSG)
- Tailwind CSS v4 via `@tailwindcss/vite`
- TypeScript strict
- `@astrojs/sitemap` (auto-emitted at build)
- MotionOne (`motion@^12`) — scroll reveals
- Embla Carousel — slider
- Sharp — image transcoding
- Vitest + happy-dom — component tests
- Playwright + @axe-core/playwright — a11y, visual regression, link checking
- LHCI — Lighthouse spot-checks

## Project structure

```
src/
  layouts/BaseLayout.astro      — single root layout with SEO meta + font links
  components/                   — 13 reusable Astro components + Button.test.ts
  pages/                        — 10 page routes
  data/
    navigation.ts               — primary nav, footer columns, social, services siblings
    content.ts                  — typed PageContent for every route
    fonts.ts                    — Monotype + Google Fonts <link> manifest
  styles/
    global.css                  — Tailwind v4 + @theme tokens + base layer
    tokens.css                  — raw :root custom properties (non-Tailwind contexts)
  scripts/
    reveals.client.ts           — MotionOne scroll-reveal observer
    header.client.ts            — header sticky state + menu open/close + focus trap
  assets/
    images/                     — 70 source JPG/PNG (processed by astro:assets)
    icons/                      — 12 SVG + small PNG icons
public/
  favicon.{svg,ico}
  media/                        — video assets served as-is
  og/                           — OpenGraph image directory (empty placeholder)

recon/                          — RECONNAISSANCE TOOLKIT (not shipped)
  scripts/                      — crawl, screenshots, asset inventory, motion extract, token extract, link check, rebuild screenshots
  output/                       — pages.json, assets.json, tokens.json, motion.json, visual-diff.md, lighthouse.md
  screenshots/                  — source screenshots at 4 breakpoints (gitignored)
  screenshots-rebuild/          — rebuild screenshots at 4 breakpoints (gitignored)
  assets/                       — cached download of source assets (gitignored)

docs/superpowers/plans/         — the 36-task plan document
tests/                          — Playwright a11y suite + playwright.config.ts
.lighthouserc.json              — Lighthouse CI config
PAGE_MAP.md                     — all routes discovered on source
DESIGN.md                       — extracted design system
RESPONSIVE_NOTES.md             — per-section breakpoint behaviour
ANIMATION_NOTES.md              — motion + interaction reference
ASSET_NOTES.md                  — asset inventory + optimization log + license flags
```

## Quality bar (verified)

- 0 broken internal links (Task 32 — `recon/scripts/check-links.ts`)
- 0 axe-core WCAG 2 AA violations across all 10 pages (Task 34 — `tests/a11y.spec.ts`)
- Lighthouse on localhost (desktop preset): Performance 100 / A11y 100 / SEO 100 (Task 35; Best Practices 59 → ~94 once HTTPS active in production — see `recon/output/lighthouse.md`)
- Visual structural fidelity vs source at all 4 breakpoints (Task 33 — `recon/output/visual-diff.md`)
- TDD on Button component, 7/7 tests passing (Task 18 — `src/components/Button.test.ts`)
- Sitemap emitted (`dist/sitemap-index.xml` + `dist/sitemap-0.xml`)

## Deploy

Static output → any static host (Netlify, Vercel, Cloudflare Pages, Nginx).

- Build command: `pnpm build`
- Output dir: `dist/`
- No SSR adapter needed — contact page uses mailto, no form submissions.

Production gotchas:
- HTTPS is required for Best Practices score and to honour the `Strict-Transport-Security` header. All hosts above provide TLS by default.
- Set up gzip/brotli for HTML, CSS, JS (Astro emits uncompressed; CDN compression layer is needed).

## Open items / deferred

Documented in `recon/output/visual-diff.md` and `ASSET_NOTES.md`:

- **Privacy policy** — body is stubbed; full text deferred to legal review before launch
- **Office emails** are reconstructed (`<city>@sonanbunkers.com`) because the source obfuscates via Cloudflare; **confirm before going live**
- **`shutterstock-*` images** — confirm Shutterstock license carryover for the rebuilt domain
- Pages NOT yet rebuilt (35 of 45 source routes): all of `/responsible-partner/*`, `/legal/*` (cookies, terms, terms of sale, T&Cs), CEO/CFO statements, sonan-bunkers-people-working-together/*, careers, individual press articles, etc. Restore them as you'd build any new page: add an entry in `src/data/content.ts`, then a thin `src/pages/<route>.astro` consuming `BaseLayout + Hero + SectionRenderer`.
- **City ticker** on homepage hero (the ROTTERDAM·OSLO·… row from the source) was not rebuilt — content-strategy decision deferred

## Reconnaissance toolkit

The `recon/` directory contains the Playwright-based crawl, screenshot, asset-download, motion-extraction, token-extraction, and link-check scripts used during the rebuild. They can be re-run to refresh source data:

```bash
cd recon
pnpm install
pnpm crawl              # → output/pages.json
pnpm screenshots        # → screenshots/{bp}/*.png (gitignored)
pnpm assets             # → output/assets.json + assets/ download cache (gitignored)
pnpm motion             # → output/motion.json
pnpm tsx scripts/extract-tokens.ts     # → output/tokens.json
pnpm tsx scripts/build-page-map.ts     # → ../PAGE_MAP.md
pnpm tsx scripts/screenshot-rebuild.ts # → screenshots-rebuild/{bp}/*.png
```

## Origin

This rebuild started from a 36-task plan at `docs/superpowers/plans/2026-05-14-sonan-bunkers-astro-rebuild.md`, executed task-by-task with spec + code-quality reviews on non-trivial components. The plan, recon scripts, and component library form a reusable template for future Astro rebuilds.
