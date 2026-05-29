# Sitemap Gap-Fill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring our Astro site to URL parity with the live elysee.com.cy/en site by adding the detail/leaf pages that hang off our existing section indexes — fixing dead "Read more" links and giving every catalogued item a real destination.

**Architecture:** Live elysee.com.cy publishes no XML sitemap; this plan is built from a manual crawl of the homepage and every section index (news, blog, exhibitions, media, ebooks, funded research, innovation insights). We add detail pages as **dynamic routes** (`[slug].astro`) reading from typed entries in `src/data/site-content.ts` (the existing single-source-of-truth registry), so a future content addition is a one-line append, not a new file. List pages already render `href` and `image` fields from the same data file, so detail pages slot in cleanly.

**Tech Stack:** Astro 6 dynamic routes (`getStaticPaths`), existing `ContentPageLayout.astro` block renderer, `motion` v12, Tailwind 4. No new dependencies.

---

## Sitemap diff (crawled 2026-05-29)

### Already covered (40 routes) — no action

| Pillar | Live URL → Our route |
|--------|----------------------|
| **About Us** (5) | `/corporate-profile` → `/about-us/`, `/history-elysee-en` → `/about-us/history/`, `/company-elysee-en` → `/about-us/company-structure/`, `/vision-mission-en` → `/about-us/vision-mission-values/`, `/quality-certifications-en` → `/about-us/quality-certifications/` |
| **Green Elysée** (4) | `/about-green-elysee` → `/green-elysee/`, `/certifications-green-elysee-en` → `/green-elysee/certifications/`, `/reports-ebooks-green-elysee-en` → `/green-elysee/reports/`, `/insights-green-elysee-en` → `/green-elysee/insights/` |
| **Innovation** (6) | All six covered in `/innovation/*/` (rebuild from 2026-05-29-innovation-pillar-content-rebuild) |
| **Products** (2 + dynamic) | `/products-catalogue-en` → `/products/`, `/catalogues-leaflets-en` → `/products/catalogues/`, plus `/catalog/[category]/[product]` dynamic routes |
| **Insights — indexes** (5) | News/Blog/Exhibitions/Media/eBooks → `/insights/*/` |
| **Contact** (5) | Local/Worldwide/WISE/PRIME/Rohrsysteme → `/contact/*/` (plus our extra `/contact/careers/`) |
| **Sectors / Our Services** (4) | `/agriculture`, `/landscape`, `/building-infastructure`, `/industry` → `/our-services/*.astro` |
| **Legal** (2 of 3) | `/privacy-policy` → `/legal/privacy-policy`, `/terms-usage-en` → `/legal/terms-of-use` |

### Missing (these are the gaps this plan fills)

| Group | Count | Live URLs | Our target route |
|-------|-------|-----------|------------------|
| **A. Funded Research Project details** | 3 | `/innova`, `/agrecomposites`, `/plantngreen` | `/innovation/funded-research-projects/[slug]/` |
| **B. Innovation Insights article details** | 6 | `/industry-4-0-and-injection-molding-manufacturing-process`, `/success-entrepreneur-stories`, `/overmolding-injection-molding-process`, `/micro-injection-molding`, `/gas-assisted-injection-molding`, `/coming-soon` (AI Quality Control) | `/innovation/insights/[slug]/` |
| **C. Exhibition details** | 6 | `/elysee-at-eima-international-2026-meet-us-in-bologna`, `/eima-2022`, `/internationale-gartenbaumesse-tulln`, `/eima-2021exhibition`, `/mce-mostra-convegno`, `/big-5-exhibition` | `/insights/exhibitions/[slug]/` |
| **D. News article details** | ~10 | `/the-ultimate-solution-for-pool-plumbing-zeeflex-fittings`, `/meet-the-new-and-improved-elysee-zero-force-range`, `/the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer`, `/h-elysee-irrigation-pistopoieitai-ws-great-place-to-work`, `/greendrip-en`, `/new-body-design-for-compression-fittings`, `/job-vacancies-july-2020`, `/recyfilm`, `/pvc-fittings-and-pipes-for-waste-and-soil-systems`, `/our-journey-to-becoming-a-green-leader` | `/insights/news/[slug]/` |
| **E. Blog article details** | ~9 | `/epsilon-series-compression-fittings-simple-strong-and-reliable`, `/everything-you-need-to-know-about-saddles-and-their-significance`, + the news ones reused | `/insights/blog/[slug]/` (share data with News where overlapping) |
| **F. Media (video) details** | 3 | Elysée 40 Year Anniversary, European Business Award 2014, CYBC Documentary | `/insights/media/[slug]/` |
| **G. eBook details** | 2 | `/green-elysee-yearly-report-2021`, `/environmental-report-2020` | `/insights/ebooks/[slug]/` |
| **H. Legal — Terms of Supply** | 1 | `/terms-supply-en` | `/legal/terms-of-supply` |

**Total new pages:** ~40 (3 + 6 + 6 + 10 + 9 + 3 + 2 + 1)

### Out of scope (deliberately deferred)

- **Per-product PDP pages** (catalog leaves). We already have a dynamic `/catalog/[category]/[product].astro` route; populating every SKU is its own initiative.
- **Pagination beyond first page** (live `/news?page=2`, `/blog?page=2..5`). Detail pages let users discover; pagination is a follow-up.
- **Localised routes** (`/el`, `/de`, `/es`). i18n is not yet on the project.
- **`/press-room/news/`** — appears to duplicate `/insights/news/`; decision deferred to a separate cleanup task.

---

## File Structure

**Create**

- `src/pages/innovation/funded-research-projects/[slug].astro` — dynamic project detail
- `src/pages/innovation/insights/[slug].astro` — dynamic insight article
- `src/pages/insights/news/[slug].astro` — dynamic news article
- `src/pages/insights/blog/[slug].astro` — dynamic blog post
- `src/pages/insights/exhibitions/[slug].astro` — dynamic exhibition detail
- `src/pages/insights/media/[slug].astro` — dynamic media detail
- `src/pages/insights/ebooks/[slug].astro` — dynamic ebook detail
- `src/pages/legal/terms-of-supply.astro` — single static page
- `src/components/innovation/ProjectDetail.astro` — funded-project layout (banner + funding facts + body + back link)
- `src/components/insights/ArticleDetail.astro` — generic article layout (hero image + category eyebrow + body blocks + Share/Back)
- `src/components/insights/ExhibitionDetail.astro` — exhibition layout (date, venue, stand, photo gallery slot, prose body)
- `src/components/insights/MediaDetail.astro` — video / gallery embed layout
- `src/components/insights/EbookDetail.astro` — ebook hero + chapters list + download CTA
- `src/scripts/download-content-assets.mjs` — extends the existing pattern, mirrors detail-page imagery to `public/images/{innovation/projects,innovation/insights,insights/news,insights/exhibitions,insights/media,insights/ebooks}/` (skips files already on disk)
- `tests/sitemap-coverage.spec.ts` — Playwright crawl: every detail-route slug from `site-content.ts` returns HTTP 200

**Modify**

- `src/data/site-content.ts`:
  - Add typed registries: `fundedProjectDetails: ProjectDetail[]`, `innovationInsightDetails: ArticleDetail[]`, `newsArticles: ArticleDetail[]`, `blogArticles: ArticleDetail[]`, `exhibitionDetails: ExhibitionDetail[]`, `mediaDetails: MediaDetail[]`, `ebookDetails: EbookDetail[]`, `termsOfSupply: ContentPage`.
  - Each entry carries a `slug`, the verbatim copy crawled from the live page, an image path, and the same `ContentBlock[]` body shape we already render.
  - Update existing list arrays (`insightsNewsItems`, `insightsBlogItems`, `innovationInsightsItems`, `insightsExhibitionsItems`, `insightsMediaItems`, `insightsEbooksItems`) so each item's `href` now points at the new detail route via slug.
- `src/pages/insights/news/index.astro`, `…/blog/index.astro`, `…/exhibitions/index.astro`, `…/media/index.astro`, `…/ebooks/index.astro` — already render the list arrays; only data hrefs change.
- `src/data/site-content.ts` `innovationFundedProjects` — change `href: '#'` placeholders to real slugs.
- `astro.config.mjs` (if needed) — confirm sitemap integration picks up dynamic routes (it does by default; verify in Task 9).

**Test**

- `src/data/__tests__/sitemap-coverage.test.ts` — vitest: every `slug` in each detail registry is unique within its group; every list item with an `href` resolves to a registered detail entry.

---

## Tasks

### Task 1: Crawl missing detail pages from live site

**Files:**
- Create: `docs/superpowers/research/2026-05-29-elysee-detail-pages.md` (research artifact, kept in repo for traceability)

- [ ] **Step 1: Crawl the 3 funded research project pages**

For each of `https://elysee.com.cy/innova`, `/agrecomposites`, `/plantngreen`, WebFetch with prompt:
> Extract ALL text: page title, intro, sections, partner list, deliverables, project timeline, image URLs and alt text. Preserve original phrasing exactly. Return as structured markdown.

Paste each result under a heading in the research file.

- [ ] **Step 2: Crawl the 6 Innovation Insights articles**

URLs: `/industry-4-0-and-injection-molding-manufacturing-process`, `/success-entrepreneur-stories`, `/overmolding-injection-molding-process`, `/micro-injection-molding`, `/gas-assisted-injection-molding`, `/coming-soon`. Same extraction prompt.

- [ ] **Step 3: Crawl the 6 exhibition detail pages**

URLs listed in the gap table above. Capture: date range, venue, hall/stand, body copy, image URLs.

- [ ] **Step 4: Crawl the news + blog articles (deduplicate)**

13 unique URLs across `/news` and `/blog`. The list appears twice; crawl each URL once. Save body, hero image, publication date.

- [ ] **Step 5: Crawl the 3 media + 2 ebook detail pages + terms-supply-en**

URLs: media items have no direct slugs visible from the index — fetch `/media-list-en` first to discover them; ebooks are `/green-elysee-yearly-report-2021` and `/environmental-report-2020`; legal is `/terms-supply-en`.

- [ ] **Step 6: Commit research artifact**

```bash
git add docs/superpowers/research/2026-05-29-elysee-detail-pages.md
git commit -m "docs(research): crawled detail-page content for sitemap gap fill"
```

---

### Task 2: Add typed detail registries to `site-content.ts`

**Files:**
- Modify: `src/data/site-content.ts`

- [ ] **Step 1: Add the discriminated types**

Append after the existing `ContentPage` interface:

```ts
export interface ProjectDetail {
  slug: string;
  name: string;
  status: 'Ongoing' | 'Completed';
  duration: string;
  totalFunding: string;
  elyseeFunding?: string;
  partners?: string[];
  image: string;
  blocks: ContentBlock[];
}

export interface ArticleDetail {
  slug: string;
  title: string;
  category?: 'Innovation News' | 'Success Stories' | 'Activities';
  date?: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  blocks: ContentBlock[];
}

export interface ExhibitionDetail {
  slug: string;
  title: string;
  date: string;
  venue: string;
  stand?: string;
  image: string;
  imageAlt: string;
  blocks: ContentBlock[];
}

export interface MediaDetail {
  slug: string;
  title: string;
  videoUrl?: string;       // YouTube/Vimeo embed
  posterImage: string;
  imageAlt: string;
  blocks: ContentBlock[];
}

export interface EbookDetail {
  slug: string;
  title: string;
  year?: string;
  coverImage: string;
  imageAlt: string;
  downloadUrl?: string;
  blocks: ContentBlock[];
}
```

- [ ] **Step 2: Add `fundedProjectDetails` registry (3 entries)**

Each entry uses verbatim copy from the research artifact, e.g.:

```ts
export const fundedProjectDetails: ProjectDetail[] = [
  {
    slug: 'innova',
    name: 'Innova',
    status: 'Ongoing',
    duration: '1/8/2025 – 30/4/2026',
    totalFunding: '€196,125',
    image: '/images/innovation/projects/innova.png',
    blocks: [
      { kind: 'paragraph', text: '<verbatim intro from /innova>' },
      // ...
    ],
  },
  // agrecomposites and plantngreen with their actual crawled copy
];
```

(Engineer: do NOT paraphrase — paste the strings from Task 1's research file.)

- [ ] **Step 3: Add `innovationInsightDetails` (6), `newsArticles` (~10), `blogArticles` (~9), `exhibitionDetails` (6), `mediaDetails` (3), `ebookDetails` (2)**

Same shape, verbatim copy. Slugs match the live URLs (e.g. `the-ultimate-solution-for-pool-plumbing-zeeflex-fittings`).

- [ ] **Step 4: Add `termsOfSupply: ContentPage` with verbatim legal text**

- [ ] **Step 5: Update existing list arrays to point at detail routes**

Example for `innovationInsightsItems`:

```ts
{
  title: 'Industry 4.0 and Injection Molding Manufacturing Process',
  category: 'Innovation News',
  image: '/images/innovation/insights/industry-40.png',
  href: '/innovation/insights/industry-4-0-and-injection-molding-manufacturing-process/',
  excerpt: '<verbatim — already in the file>',
},
```

Apply the same to `insightsNewsItems`, `insightsBlogItems`, `insightsExhibitionsItems`, `insightsMediaItems`, `insightsEbooksItems`.

Update `innovationFundedProjects` — replace each `href: '#'` with `/innovation/funded-research-projects/<slug>/`.

- [ ] **Step 6: Run TypeScript check**

Run: `npx astro check`
Expected: zero new errors (the pre-existing `3d-globe-demo.tsx` type-import error is unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/data/site-content.ts
git commit -m "feat(content): add detail-page registries for ~40 leaf routes"
```

---

### Task 3: Download detail-page imagery

**Files:**
- Create: `src/scripts/download-content-assets.mjs`

- [ ] **Step 1: Write the script**

Same shape as `download-innovation-assets.mjs`. Buckets:

```js
const groups = [
  ['innovation/projects/details', [/* hero crops for /innova, /agrecomposites, /plantngreen */]],
  ['innovation/insights/details', [/* 6 article hero images */]],
  ['insights/news', [/* 10 news hero images */]],
  ['insights/exhibitions', [/* 6 exhibition photos */]],
  ['insights/media', [/* 3 video poster frames */]],
  ['insights/ebooks', [/* 2 ebook covers */]],
];
```

Source URLs come from the Task 1 research artifact (image URLs were captured during the crawl).

- [ ] **Step 2: Run the script**

Run: `node src/scripts/download-content-assets.mjs`
Expected: every URL → file, no `FAIL`. The script is idempotent (skips existing files).

- [ ] **Step 3: Verify count**

Run: `find public/images/insights public/images/innovation/projects/details public/images/innovation/insights/details -type f | wc -l`
Expected: matches the total in the script (compute as you write it).

- [ ] **Step 4: Commit**

```bash
git add public/images/insights public/images/innovation/projects/details public/images/innovation/insights/details src/scripts/download-content-assets.mjs
git commit -m "feat(assets): import detail-page imagery from elysee.com.cy"
```

---

### Task 4: Build shared detail components

**Files:**
- Create: `src/components/innovation/ProjectDetail.astro`
- Create: `src/components/insights/ArticleDetail.astro`
- Create: `src/components/insights/ExhibitionDetail.astro`
- Create: `src/components/insights/MediaDetail.astro`
- Create: `src/components/insights/EbookDetail.astro`

Each component:
- Takes the typed entry as a prop.
- Wraps the existing `<BaseLayout>` + `<PageHero>` (cover image variant — `heroImage` was added to `ContentPage` already).
- Renders the body `blocks[]` by inlining the same renderer the layout uses (or by extending `ContentPageLayout` to accept a typed entry).
- Includes a "Back to {section}" link at the top of the article.

**ProjectDetail extras:** funding metadata block (Total/Elysée funding chips), partner list if present.

**ArticleDetail extras:** category eyebrow, date, breadcrumb (`Insights › News › Title`), social share buttons (Twitter / LinkedIn intent URLs only — no SDKs).

**ExhibitionDetail extras:** date pill, venue + stand info, optional gallery (uses `kind: 'imagegrid'`).

**MediaDetail extras:** embedded video (responsive 16:9 iframe), fallback poster image.

**EbookDetail extras:** large cover image, "Download PDF" CTA pointing at `downloadUrl` (if absent, render a "Request a copy" mailto CTA).

- [ ] **Step 1: Write `ProjectDetail.astro`** — full code in Task 4 of the previous plan; pattern is identical
- [ ] **Step 2: Write `ArticleDetail.astro`** — full body block renderer + share buttons
- [ ] **Step 3: Write `ExhibitionDetail.astro`**
- [ ] **Step 4: Write `MediaDetail.astro`** with safe iframe (`allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`, `loading="lazy"`, sandbox if appropriate)
- [ ] **Step 5: Write `EbookDetail.astro`**

(All steps land complete code, not stubs — engineer copies from the previous plan's component patterns and adapts the typed prop.)

- [ ] **Step 6: Commit**

```bash
git add src/components/innovation/ProjectDetail.astro src/components/insights
git commit -m "feat(components): detail-page layouts for project/article/exhibition/media/ebook"
```

---

### Task 5: Wire dynamic routes

**Files:**
- Create: 7 `[slug].astro` files in their pillar folders, listed in File Structure above.

Each route follows this Astro pattern (shown for `innovation/funded-research-projects/[slug].astro`):

```astro
---
import ProjectDetail from '../../../components/innovation/ProjectDetail.astro';
import { fundedProjectDetails } from '../../../data/site-content';

export function getStaticPaths() {
  return fundedProjectDetails.map((p) => ({
    params: { slug: p.slug },
    props: { project: p },
  }));
}

const { project } = Astro.props;
---
<ProjectDetail project={project} />
```

- [ ] **Step 1: Funded Research Projects detail route**
- [ ] **Step 2: Innovation Insights article route**
- [ ] **Step 3: Insights News article route**
- [ ] **Step 4: Insights Blog article route**
- [ ] **Step 5: Insights Exhibitions detail route**
- [ ] **Step 6: Insights Media detail route**
- [ ] **Step 7: Insights eBook detail route**
- [ ] **Step 8: Terms of Supply (static page)**

Create `src/pages/legal/terms-of-supply.astro`:

```astro
---
import ContentPageLayout from '../../layouts/ContentPageLayout.astro';
import { termsOfSupply } from '../../data/site-content';
---
<ContentPageLayout content={termsOfSupply} />
```

- [ ] **Step 9: Verify build**

Run: `npx astro build`
Expected: page count rises from 60 to ~100 (60 + ~40 new detail routes).

- [ ] **Step 10: Commit**

```bash
git add src/pages/innovation/funded-research-projects/\[slug\].astro src/pages/innovation/insights/\[slug\].astro src/pages/insights src/pages/legal/terms-of-supply.astro
git commit -m "feat(routes): dynamic detail pages for ~40 sitemap-gap routes"
```

---

### Task 6: Cross-link existing list pages

**Files:**
- Modify: existing index pages that render `InsightItem[]` lists.

The list components already render `href` if present (verified in earlier session). The hrefs we set in Task 2 step 5 should now resolve. This task is **verification**, not edits — unless we discover a list page that ignored `href`.

- [ ] **Step 1: Inspect each list renderer for `href` handling**

For each of the 5 `/insights/*/index.astro` files and `/innovation/insights/index.astro`, confirm the rendered card wraps in an `<a href>` when `item.href` is set.

- [ ] **Step 2: Add hover affordance + arrow on cards that link**

Cards with `href` should grow `↑ -4px` and reveal a "Read more →" affordance on hover (mirrors the pattern from `Card.astro`).

- [ ] **Step 3: Commit if changes needed**

```bash
git add src/pages/insights src/components/innovation/InsightsFilter.tsx
git commit -m "feat(links): wire list cards to new detail routes"
```

---

### Task 7: Add per-detail meta + structured data

**Files:**
- Modify: `src/components/insights/ArticleDetail.astro`, `src/components/innovation/ProjectDetail.astro`

Each detail page emits:
- `<title>{title} — Elysée</title>` (handled by BaseLayout already)
- `<meta name="description" content={excerpt}>`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type=article`
- JSON-LD for articles: `Article` schema with `headline`, `image`, `datePublished`, `publisher`.

- [ ] **Step 1: Pass `description` + `ogImage` to BaseLayout via the existing props**
- [ ] **Step 2: Add JSON-LD `<script type="application/ld+json">` for `ArticleDetail` only** (project/exhibition/media/ebook don't map cleanly to Article — keep them minimal)

- [ ] **Step 3: Commit**

```bash
git add src/components/insights/ArticleDetail.astro src/components/innovation/ProjectDetail.astro
git commit -m "feat(seo): per-article meta + Article schema for detail pages"
```

---

### Task 8: Sitemap regeneration

**Files:**
- No edits expected — `@astrojs/sitemap` already collects every static route, including new dynamic ones.

- [ ] **Step 1: Build and inspect**

Run: `npx astro build && cat dist/sitemap-0.xml | grep -c "<loc>"`
Expected: ~100 URLs (60 prior + ~40 new).

- [ ] **Step 2: Confirm the new URLs are present**

Run: `grep -E "(funded-research-projects|insights/news|insights/blog|insights/exhibitions|terms-of-supply)/" dist/sitemap-0.xml | wc -l`
Expected: matches the count we added in Task 2.

- [ ] **Step 3: Commit (no source changes; sitemap is rebuilt artifact)**

Skip — `dist/` is gitignored.

---

### Task 9: End-to-end coverage test

**Files:**
- Create: `tests/sitemap-coverage.spec.ts`

- [ ] **Step 1: Write Playwright spec**

```ts
import { test, expect } from '@playwright/test';
import {
  fundedProjectDetails,
  innovationInsightDetails,
  newsArticles,
  blogArticles,
  exhibitionDetails,
  mediaDetails,
  ebookDetails,
} from '../src/data/site-content';

const cases = [
  ...fundedProjectDetails.map((p) => ({ url: `/innovation/funded-research-projects/${p.slug}/`, expect: p.name })),
  ...innovationInsightDetails.map((a) => ({ url: `/innovation/insights/${a.slug}/`, expect: a.title })),
  ...newsArticles.map((a) => ({ url: `/insights/news/${a.slug}/`, expect: a.title })),
  ...blogArticles.map((a) => ({ url: `/insights/blog/${a.slug}/`, expect: a.title })),
  ...exhibitionDetails.map((e) => ({ url: `/insights/exhibitions/${e.slug}/`, expect: e.title })),
  ...mediaDetails.map((m) => ({ url: `/insights/media/${m.slug}/`, expect: m.title })),
  ...ebookDetails.map((e) => ({ url: `/insights/ebooks/${e.slug}/`, expect: e.title })),
  { url: '/legal/terms-of-supply/', expect: 'Terms of Supply' },
];

for (const c of cases) {
  test(`renders ${c.url}`, async ({ page }) => {
    const errs: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await page.goto(c.url);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(c.expect);
    expect(errs).toEqual([]);
  });
}
```

- [ ] **Step 2: Run against preview**

Run: `npm run build && npm run preview & sleep 4 && npx playwright test tests/sitemap-coverage.spec.ts`
Expected: ~40 passing.

- [ ] **Step 3: Commit**

```bash
git add tests/sitemap-coverage.spec.ts
git commit -m "test: end-to-end coverage of detail routes"
```

---

## Self-Review

- **Spec coverage:** Every URL in the "Missing" table above maps to a task that produces a real route. The 4 sector pages (`/agriculture`, `/landscape`, `/building-infastructure`, `/industry`) are already covered by `/our-services/*.astro`. Innovation pillar's six detail-less indexes were closed by the previous plan. ✓
- **Placeholder scan:** Task 2 step 2 explicitly notes "paste from research file, do not paraphrase." No TBD/TODO. ✓
- **Type consistency:** Every registry exports the same shape (`slug`, `title|name`, `image`, `blocks: ContentBlock[]`); detail components consume them through one prop name (`article` / `project` / `exhibition` / `media` / `ebook`); `getStaticPaths` returns `{ params: { slug }, props: { … } }` in all 7 dynamic routes. ✓

## Risk register

1. **Disk space.** The data volume sat at 100% during the last build; downloading another ~30 images and running an enlarged build needs roughly +200 MB free. Confirm `df -h` before Task 3 step 2.
2. **CDN URL drift.** Some live image URLs include hashed segments (e.g. `…-PayW5.png`). If the live site re-hashes between Task 1 and Task 3, the download script will 404. Mitigation: capture all URLs in Task 1 and run Task 3 immediately after.
3. **Bilingual articles.** A few news/blog slugs are Greek transliterations (`h-elysee-irrigation-pistopoieitai-ws-great-place-to-work`, `neo-koyti-hlektrologoy-elysee-kainotomia-kai-antoxh-sthn-aixmh-ths-egkatastashs`). Keep them as-is for URL parity; supply English-translated body copy from the Task 1 research.
4. **Media page slugs not in nav crawl.** The media list page returns nav links only — Task 1 step 5 must visit `/media-list-en` directly and read article hrefs from the card grid.
