# Missing pages — elysee.com.cy/en parity audit

Crawled 2026-05-29. Live site exposes no XML sitemap, so this list was built by following every link from `/en` plus each section index (`/news`, `/blog`, `/exhibitions-en`, `/media-list-en`, `/ebooks-en`, `/funded-research-projects-innovation-en`).

**Top-level / section-index parity: 100%.** All 40 hub URLs already exist in `src/pages/**`.

**Detail / leaf-page gaps: ~40 routes.** Listed below by group.

---

## A. Funded Research Project details — 3 pages

Dead-ends today: the "Read more" CTAs in `innovation/funded-research-projects/` point at `href: '#'`.

| Live URL | Project | Status | Target route |
|----------|---------|--------|--------------|
| `/innova` | Innova | Ongoing | `/innovation/funded-research-projects/innova/` |
| `/agrecomposites` | AgReCOMPOSITES | Ongoing | `/innovation/funded-research-projects/agrecomposites/` |
| `/plantngreen` | PlantNGreen | Completed | `/innovation/funded-research-projects/plantngreen/` |

---

## B. Innovation Insights article details — 6 pages

Cards in `/innovation/insights/` carry no `href` — they currently render as un-clickable tiles.

| Live URL | Article | Category |
|----------|---------|----------|
| `/industry-4-0-and-injection-molding-manufacturing-process` | Industry 4.0 and Injection Molding Manufacturing Process | Innovation News |
| `/success-entrepreneur-stories` | Success Entrepreneur Stories | Success Stories |
| `/overmolding-injection-molding-process` | Overmolding Injection Molding Process | Innovation News |
| `/micro-injection-molding` | Micro Injection Molding | Innovation News |
| `/gas-assisted-injection-molding` | Gas-assisted Injection Molding | Innovation News |
| `/coming-soon` | Exploiting AI Quality Control for Injection Molding Process Optimization | Innovation News |

Target route pattern: `/innovation/insights/[slug]/`

---

## C. Exhibition details — 6 pages

Listed on `/insights/exhibitions/` without detail destinations.

| Live URL | Exhibition | Date |
|----------|------------|------|
| `/elysee-at-eima-international-2026-meet-us-in-bologna` | EIMA International 2026 — Bologna | Nov 2026 |
| `/eima-2022` | EIMA 2022 — Bologna | Nov 2022 |
| `/internationale-gartenbaumesse-tulln` | Internationale Gartenbaumesse Tulln | Sep 2021 |
| `/eima-2021exhibition` | EIMA 2021 — Bologna (Stand B25 Hall 22) | Oct 2021 |
| `/mce-mostra-convegno` | MCE Mostra Convegno (Stand L69, Pavilion 14) | — |
| `/big-5-exhibition` | The Big 5 Exhibition | — |

Target route pattern: `/insights/exhibitions/[slug]/`

---

## D. News articles — 10 pages

| Live URL | Title |
|----------|-------|
| `/the-ultimate-solution-for-pool-plumbing-zeeflex-fittings` | The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings |
| `/meet-the-new-and-improved-elysee-zero-force-range` | Meet the New and Improved Elysée Zero Force Range |
| `/the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer` | The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer! |
| `/neo-koyti-hlektrologoy-elysee-kainotomia-kai-antoxh-sthn-aixmh-ths-egkatastashs` | New Elysée Electrical Box — Innovation & Durability (Greek-transliterated slug) |
| `/h-elysee-irrigation-pistopoieitai-ws-great-place-to-work` | Elysée Irrigation Certified as a Great Place To Work® (Greek-transliterated slug) |
| `/greendrip-en` | GreenDrip |
| `/new-body-design-for-compression-fittings` | New Body Design for Compression Fittings |
| `/job-vacancies-july-2020` | Job Vacancies July 2020 |
| `/recyfilm` | Recyfilm |
| `/news?page=2` | (paginated; out of scope for first pass) |

Target route pattern: `/insights/news/[slug]/`

---

## E. Blog posts — 9 unique pages

Several blog URLs overlap with the News list above (ZEEFLEX, Zero Force, Global Transition, Great Place to Work). Unique blog-only entries:

| Live URL | Title |
|----------|-------|
| `/pvc-fittings-and-pipes-for-waste-and-soil-systems` | PVC Fittings and Pipes for Waste and Soil Systems |
| `/epsilon-series-compression-fittings-simple-strong-and-reliable` | Epsilon Series Compression Fittings — Simple, Strong, and Reliable |
| `/everything-you-need-to-know-about-saddles-and-their-significance` | Everything You Need to Know About Saddles and Their Significance |
| `/our-journey-to-becoming-a-green-leader` | Our Journey to Becoming a Green Leader |
| `/blog?page=2` … `/blog?page=5` | (paginated; out of scope for first pass) |

Target route pattern: `/insights/blog/[slug]/`

> **Decision needed:** unify News + Blog under one detail route (`/insights/articles/[slug]/`) or keep separate? Live site uses both URLs for the same article in some cases. Recommendation: one detail route, two list views.

---

## F. Media (video) details — 3 pages

`/media-list-en` indexes them but exposes no direct slug in nav crawl. Slugs need to be captured from card hrefs on the list page itself.

| Title | Notes |
|-------|-------|
| Elysée 40 Year Anniversary Event | Long-form video |
| European Business Award 2014 | Award coverage video |
| CYBC Documentary about Innovation in Cyprus — Elysée Irrigation | Public broadcaster feature |

Target route pattern: `/insights/media/[slug]/`

---

## G. eBook details — 2 pages

| Live URL | eBook |
|----------|-------|
| `/green-elysee-yearly-report-2021` | Green Elysée Yearly Report 2021 |
| `/environmental-report-2020` | Environmental Report 2020 |

Target route pattern: `/insights/ebooks/[slug]/`

---

## H. Legal — 1 page

We have `/legal/privacy-policy` and `/legal/terms-of-use`. Live site has a third legal page:

| Live URL | Page |
|----------|------|
| `/terms-supply-en` | Terms of Supply |

Target route: `/legal/terms-of-supply/`

---

## Out of scope (deliberately deferred)

- **Per-product PDP pages** — we have a dynamic `/catalog/[category]/[product].astro`; populating every SKU is its own initiative.
- **Pagination beyond page 1** — `/news?page=2`, `/blog?page=2..5`. Detail pages take priority; pagination is a follow-up.
- **Localised routes** — `/el`, `/de`, `/es`. i18n is not yet on the project.
- **`/press-room/news/`** — appears to duplicate `/insights/news/`. Cleanup is a separate task.

---

## Already covered (no action — for reference)

| Pillar | Live URL | Our route |
|--------|----------|-----------|
| About Us (5) | `/corporate-profile` | `/about-us/` |
| | `/history-elysee-en` | `/about-us/history/` |
| | `/company-elysee-en` | `/about-us/company-structure/` |
| | `/vision-mission-en` | `/about-us/vision-mission-values/` |
| | `/quality-certifications-en` | `/about-us/quality-certifications/` |
| Green Elysée (4) | `/about-green-elysee` | `/green-elysee/` |
| | `/certifications-green-elysee-en` | `/green-elysee/certifications/` |
| | `/reports-ebooks-green-elysee-en` | `/green-elysee/reports/` |
| | `/insights-green-elysee-en` | `/green-elysee/insights/` |
| Innovation (6) | `/why-innovation-innovation-en` | `/innovation/why-innovation/` |
| | `/research-and-development-innovation-en` | `/innovation/research-development/` |
| | `/funded-research-projects-innovation-en` | `/innovation/funded-research-projects/` |
| | `/innovation-insights-innovation-en` | `/innovation/insights/` |
| | `/network-partners-innovation-en` | `/innovation/network-partners/` |
| | `/innovate-with-us-innovation-en` | `/innovation/innovate-with-us/` |
| Products (2 + dynamic) | `/products-catalogue-en` | `/products/` |
| | `/catalogues-leaflets-en` | `/products/catalogues/` |
| | individual products | `/catalog/[category]/[product]/` (dynamic) |
| Insights indexes (5) | `/news` | `/insights/news/` |
| | `/blog` | `/insights/blog/` |
| | `/exhibitions-en` | `/insights/exhibitions/` |
| | `/media-list-en` | `/insights/media/` |
| | `/ebooks-en` | `/insights/ebooks/` |
| Contact (5) | `/contact-local-en` | `/contact/local/` |
| | `/contact-world-en` | `/contact/worldwide/` |
| | `/elysee-wise` | `/contact/wise/` |
| | `/elysee-prime-egypt-factory` | `/contact/prime/` |
| | `/elysee-rohrsysteme` | `/contact/rohrsysteme/` |
| Sectors (4) | `/agriculture` | `/our-services/agriculture` |
| | `/landscape` | `/our-services/landscape` |
| | `/building-infastructure` *(live site typo preserved)* | `/our-services/building-infrastructure` |
| | `/industry` | `/our-services/industry` |
| Legal (2 of 3) | `/privacy-policy` | `/legal/privacy-policy` |
| | `/terms-usage-en` | `/legal/terms-of-use` |

---

## Summary

| Group | Pages to build |
|-------|---------------:|
| A. Funded Research Projects | 3 |
| B. Innovation Insights articles | 6 |
| C. Exhibitions | 6 |
| D. News articles | 9 (excluding paginated) |
| E. Blog posts | 4 unique (excluding paginated and News overlap) |
| F. Media | 3 |
| G. eBooks | 2 |
| H. Legal — Terms of Supply | 1 |
| **Total** | **~34** |

Full execution plan: `docs/superpowers/plans/2026-05-29-sitemap-gap-fill.md`.
