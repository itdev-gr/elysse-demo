# Lighthouse — Sonan Bunkers Rebuild

Run: 2026-05-14, on `localhost:4321` via `astro preview`, Lighthouse CI 0.15.1, desktop preset, 1 run per URL.

## Scores (post-fix)

| URL | Performance | A11y | Best Practices | SEO |
|---|---:|---:|---:|---:|
| `/` | 100 | 100 | 59 | 100 |
| `/our-services/fuel-products/` | 100 | 100 | 59 | 100 |

Targets met for Performance / A11y / SEO. Best Practices is driven entirely by environment-level audits documented under *Deferred* below.

### Key metrics (both URLs)

- LCP: 0.6 s
- CLS: 0
- TBT: 0 ms
- FCP: 0.5 – 0.7 s
- Speed Index: 0.5 – 0.8 s

## Baseline before fixes

| URL | Perf | A11y | BP | SEO | Notes |
|---|---:|---:|---:|---:|---|
| `/` | 99 | 100 | 59 | 92 | `link-text` (3 "LEARN MORE" CTAs) |
| `/our-services/fuel-products/` | 100 | 98 | 59 | 100 | `heading-order` (aside `<h3>`, footer `<h4>`) |

## Fixes applied

1. **SEO `link-text` (homepage):** the three `kind: 'text'` section CTAs labelled "LEARN MORE" were flagged as non-descriptive. Renamed in `src/data/content.ts` to "LEARN MORE ABOUT OUR VALUES", "LEARN MORE ABOUT OUR ADVISORY SERVICES", and "LEARN MORE ABOUT SONAN". (Lighthouse's `link-text` audit looks at *visible* text and ignores `aria-label`, so editing the label was the only durable fix.) Also wired up `ariaLabel` on the Button via `SectionRenderer.astro` for assistive tech that *does* honour it.
2. **A11y `heading-order` (inner pages):** the services-page sidebar used `<h3>Our Services</h3>` directly after a hero `<h1>`, skipping `<h2>`. Promoted to `<h2>` in `fuel-products.astro`, `alternative-fuels.astro`, `marine-lubricants.astro`, `advisory-services.astro` (visual styling unchanged). Same for the four `<h4>` column titles in `Footer.astro`, now `<h2>` — they were skipping levels on every page that didn't have an `<h3>` in the main content.
3. **Perf hygiene:** added `fetchpriority="high"` to the Hero `<Image>` (already `loading="eager"`) in `src/components/Hero.astro`. Marginal — both URLs already reported LCP ≈ 0.6 s — but it aligns the hint with the LCP element.

## Deferred (and why)

All three remaining Best Practices failures stem from the environment, not the code:

- **`is-on-https`** (weight 5): localhost preview server. Production deploy will be served over HTTPS and this passes automatically.
- **`third-party-cookies`** (weight 5): `https://fast.fonts.net/cssapi/...` (Monotype) sets a `__cf_bm` Cloudflare bot-management cookie. The Monotype stylesheet is required by the domain-locked license issued for `sonanbunkers.com` — see the comment in `src/data/fonts.ts`. Self-hosting Averta Standard W01 via `@fontsource` would violate that license, and stripping the stylesheet would break the primary typeface. Accepted.
- **`inspector-issues`** (weight 1): same Monotype cookie surfaces as a DevTools Issues panel entry. Resolves only if `third-party-cookies` is resolved.

Expected production Best Practices: **~94** once HTTPS is in place. The two third-party-cookie audits remain inherent to the license-required font CDN.

Informational (weight 0) findings — no action needed:
- `font-display` / `font-display-insight`: Monotype's stylesheet doesn't set `font-display: swap`. We don't control that stylesheet; FOIT is brief in practice and the Roboto Slab Google Fonts URL already includes `&display=swap`.
- `render-blocking-resources`: the same two font stylesheets. `<link rel="preconnect" href="https://fonts.gstatic.com">` is already in `BaseLayout` head; weight is 0 because the actual perf impact at 0.6 s LCP is negligible.
- `uses-long-cache-ttl` / `cache-insight`: `astro preview` doesn't set far-future cache headers; the production host (Vercel/Netlify/etc.) will. Cannot validate from preview.

## Reports

Full HTML + JSON Lighthouse reports are written to `.lighthouseci/lhr-*.html` and `.lighthouseci/lhr-*.json` (gitignored). Open the HTML files in a browser to inspect every audit interactively. Re-run with:

```bash
pnpm astro build
pnpm astro preview --port 4321 &
pnpm exec lhci collect
pnpm exec lhci upload --target=filesystem --outputDir=.lighthouseci
```
