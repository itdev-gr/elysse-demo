# Elysée Cyprus Full Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the local site so its navigation, page set, and content match the live https://elysee.com.cy/ company (Elysée Irrigation Ltd — Cyprus-based piping/fittings manufacturer, founded 1979). Drop the local repo's "Marine Energy Provider" framing and the entire `sonan-bunkers` / `responsible-partner` URL scheme. Produce 27 new content pages and rewrite the homepage, sector pages, footer, and primary nav from real source material.

**Architecture:** Source of truth is `src/data/site-content.ts` — one typed content object per route, consumed by a small set of reusable Astro layouts (`ContentPageLayout`, `ListPageLayout`, `DirectoryPageLayout`). Per-page `.astro` files are 3–6 lines: import the layout + content object, render. Nav data in `src/data/navigation.ts` is rewritten end-to-end to mirror the live site's 6 categories. Content is sourced by the implementer running `WebFetch` against each live URL with a standardized prompt; the verbatim text is then stored in the data module. Eight pages are already crawled and their content is embedded in this plan; the remaining pages list their URL + content key for the implementer to fetch during execution.

**Tech Stack:** Astro 6, Tailwind 4 (existing tokens), pnpm, Playwright, vitest. Plus `WebFetch` available to implementer subagents.

**Scope decisions (from user):**
- Full rebuild matching elysee.com.cy nav (6 categories, not the current 8)
- Products section limited to top-level Categories + Catalogues pages (no individual product detail pages)
- English only (no Astro i18n setup; live site is EN/GR/DE/ES)

**Pre-requisite:** `feat/navbar-dropdowns` (the previous plan) must be merged to main first. This plan starts from a clean main with PrimaryNav / MobileNav already in place. The same nav components are reused — only the data they consume changes.

**Branch:** `feat/elysee-cy-rebuild` (create at start of execution).

**Live-site source URLs (English versions; record so implementers don't have to re-derive):**
- Homepage: `https://elysee.com.cy/en` (or `/`)
- About Us pillar: `/corporate-profile`, `/history-elysee-en`, `/company-elysee-en`, `/vision-mission-en`, `/quality-certifications-en`
- Green Elysée pillar: `/about-green-elysee`, `/certifications-green-elysee-en`, `/reports-ebooks-green-elysee-en`, `/insights-green-elysee-en`
- Innovation pillar: `/why-innovation-innovation-en`, `/research-and-development-innovation-en`, `/funded-research-projects-innovation-en`, `/innovation-insights-innovation-en`, `/network-partners-innovation-en`, `/innovate-with-us-innovation-en`
- Products: `/products-catalogue-en`, `/catalogues-leaflets-en`
- Insights: `/news`, `/blog`, `/exhibitions-en`, `/media-list-en`, `/ebooks-en`
- Contact: `/contact-local-en`, `/contact-world-en`, `/elysee-wise`, `/elysee-prime-egypt-factory`, `/elysee-rohrsysteme`
- Sectors (used by 4 industry pages we already have): `/agriculture`, `/landscape`, `/building-infastructure` *(sic — typo on live site)*, `/industry`
- Legal: `/terms-usage-en`, `/terms-supply-en`, `/privacy-policy`
- Footer-only link: `/en/environmental-report-2020`

---

## Audit: current nav routes vs. new structure

Current `megaNav` has **18 broken sub-links**. The full rebuild deletes all of them. Mapping of "what the broken link was for" → "where the equivalent lives in the new structure":

| Current (broken) | New target |
|---|---|
| `/sonan-bunkers-people-working-together/` and 2 sub-pages | Gone — content folds into `/about-us/` |
| `/responsible-partner/` + 6 sub-pages (compliance, csr, hseq, sustainability, etc.) | Gone — replaced by `/green-elysee/` pillar (4 pages) |
| `/about-us/group-ceo-statement/`, `/group-cfo-statement/` | Gone — content folds into Corporate Profile under `/about-us/` |
| `/careers/` | Gone (live site doesn't have it; replaced by `/innovation/innovate-with-us/`) |
| `/legal/`, `/legal/cookies/`, `/legal/terms-and-conditions-of-sale/` | Footer-only `/legal/privacy-policy/`, `/legal/terms-of-use/`, `/legal/terms-of-supply/` |
| `/press-room/`, `/press-room/annual-reports/` | Gone — annual reports become `/green-elysee/reports/` |

Plus routes we are **moving / renaming**:

| Current | New |
|---|---|
| `/about-us/your-marine-energy-provider/` | Deleted (replaced by Corporate Profile content under `/about-us/`) |
| `/press-room/news/` | Moved to `/insights/news/` |
| `/contact/` | Replaced by `/contact/local/` (and four others) |

---

## File Structure

### Create

**Layouts (reusable):**
- `src/layouts/ContentPageLayout.astro` — generic page: hero with title/subhead + ordered list of content sections (rich text + optional callouts/lists/grids)
- `src/layouts/ListPageLayout.astro` — list/index pages (News, Blog, Exhibitions, Media, eBooks) — header + paginated card grid
- `src/layouts/DirectoryPageLayout.astro` — contact/network pages — header + grouped office cards

**Components:**
- `src/components/StatGrid.astro` — 4-up stat block (Founded 1979 / 215+ employees / 5000+ codes / 65+ countries)
- `src/components/Timeline.astro` — year-anchored milestones (history page)
- `src/components/ValueList.astro` — labeled bullet list (vision/mission/values, mission bullets, etc.)
- `src/components/StrategyPillars.astro` — numbered pillar grid (Green Elysée's 6 strategic components)
- `src/components/CertificationsGrid.astro` — partner logo grid (ISO, DVGW, KIWA, WRAS, SII, OVGW, etc.)
- `src/components/ProductCategoryGrid.astro` — 13 product-category cards with images + "View Products" / "Download PDF" actions
- `src/components/ProcessSteps.astro` — 4-step "From Design to Application" sequence (homepage)
- `src/components/PageHero.astro` — small hero used by ContentPageLayout (title, optional subtitle, optional background image) — distinct from the existing `Hero.astro` which is the full-bleed homepage video hero

**Data:**
- `src/data/site-content.ts` — typed content registry: one named export per route
- `src/data/product-categories.ts` — the 13 product categories with slug + image + PDF link

**Pages (27 new):**
- About Us (5): `/about-us/index.astro` *(rewrite)*, `/about-us/history/index.astro`, `/about-us/company-structure/index.astro`, `/about-us/vision-mission-values/index.astro`, `/about-us/quality-certifications/index.astro`
- Green Elysée (4): `/green-elysee/index.astro`, `/green-elysee/certifications/index.astro`, `/green-elysee/reports/index.astro`, `/green-elysee/insights/index.astro`
- Innovation (6): `/innovation/why-innovation/index.astro`, `/innovation/research-development/index.astro`, `/innovation/funded-research-projects/index.astro`, `/innovation/insights/index.astro`, `/innovation/network-partners/index.astro`, `/innovation/innovate-with-us/index.astro`
- Products (2): `/products/index.astro`, `/products/catalogues/index.astro`
- Insights (5): `/insights/news/index.astro`, `/insights/blog/index.astro`, `/insights/exhibitions/index.astro`, `/insights/media/index.astro`, `/insights/ebooks/index.astro`
- Contact (5): `/contact/local/index.astro`, `/contact/worldwide/index.astro`, `/contact/wise/index.astro`, `/contact/prime/index.astro`, `/contact/rohrsysteme/index.astro`

**Tests:**
- Extend `tests/a11y.spec.ts` route list (will grow from 10 to ~35 routes)
- Extend `tests/nav.spec.ts` desktop describe block — new EXPECTED_GROUPS array

### Modify

- `src/data/navigation.ts` — rewrite `megaNav`, `primaryNav`, `footerNav`, `footerLegal`. Add `productCategoryNav` if needed by the homepage product strip.
- `src/components/Footer.astro` — rewrite columns to match live-site footer (About us, Green Elysée, Products, Insights, Contact us)
- `src/components/Header.astro` — no change (PrimaryNav + MobileNav re-render from new data automatically)
- `src/pages/index.astro` — full rewrite using real homepage content
- `src/pages/our-services/agriculture.astro` — replace marine-energy copy with live `/agriculture` content
- `src/pages/our-services/landscape.astro` — replace with live `/landscape` content
- `src/pages/our-services/building-infrastructure.astro` — replace with live `/building-infastructure` content (note typo on live URL; our URL stays correctly spelled)
- `src/pages/our-services/industry.astro` — replace with live `/industry` content

### Delete

- `src/pages/about-us/your-marine-energy-provider.astro` — replaced by new About Us section
- `src/pages/press-room/news/index.astro` — replaced by `/insights/news/`
- `src/pages/contact.astro` — replaced by `/contact/local/` + siblings

---

## Content sourcing pattern (used by every page task)

For each page whose source URL is listed but whose content is **not** embedded in this plan, the implementer fetches the live content with a standardized prompt:

```text
WebFetch(
  url: '<LIVE_URL>',
  prompt: 'Return the FULL verbatim text of this page. Include every heading (with level), every paragraph, every list item, every callout, every caption. Do not summarize. Preserve the order in which content appears. Note any tabs, accordions, or carousels with their tab labels.'
)
```

The implementer then transcribes the relevant text into a content object in `src/data/site-content.ts` following the schema defined in **Task 2**. Light editorial cleanup is allowed (fix obvious typos, drop boilerplate navigation/cookie banners), but the textual substance must come from the live site.

Pages with content **already embedded** in this plan (do NOT re-fetch; use the embedded text): Homepage, Corporate Profile, History, Vision/Mission/Values, About Green Elysée, Why Innovation, Products Catalogue (categories list), Contact Local Network, Agriculture sector page.

---

## Phase 1 — Foundation (Tasks 1–8)

Lays the data + layout groundwork that every later phase depends on. Ships a working site whose nav matches the live structure, homepage shows real Elysée content, footer is rebuilt, and the 4 sector pages carry real industry copy. Subsequent phases only add pages; they never re-touch foundation files.

### Task 1: Rewrite navigation data

**Files:** Modify `src/data/navigation.ts` (full replacement).

- [ ] **Step 1: Replace `src/data/navigation.ts` with:**

```typescript
export interface NavItem { label: string; href: string; children?: NavItem[]; }

/**
 * Primary navigation — full rebuild mirroring elysee.com.cy's 6-pillar structure.
 * Source: https://elysee.com.cy/en (mega-menu, May 2026).
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: '/about-us/',
    children: [
      { label: 'Corporate Profile', href: '/about-us/' },
      { label: 'History', href: '/about-us/history/' },
      { label: 'Company Structure', href: '/about-us/company-structure/' },
      { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
      { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
    ],
  },
  {
    label: 'Green Elysée',
    href: '/green-elysee/',
    children: [
      { label: 'About Green Elysée', href: '/green-elysee/' },
      { label: 'Certifications', href: '/green-elysee/certifications/' },
      { label: 'Reports', href: '/green-elysee/reports/' },
      { label: 'Insights', href: '/green-elysee/insights/' },
    ],
  },
  {
    label: 'Innovation',
    href: '/innovation/why-innovation/',
    children: [
      { label: 'Why Innovation', href: '/innovation/why-innovation/' },
      { label: 'Research & Development', href: '/innovation/research-development/' },
      { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/' },
      { label: 'Innovation Insights', href: '/innovation/insights/' },
      { label: 'Network Partners', href: '/innovation/network-partners/' },
      { label: 'Innovate with Us', href: '/innovation/innovate-with-us/' },
    ],
  },
  {
    label: 'Products',
    href: '/products/',
    children: [
      { label: 'Categories', href: '/products/' },
      { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
      { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/' },
    ],
  },
  {
    label: 'Insights',
    href: '/insights/news/',
    children: [
      { label: 'News', href: '/insights/news/' },
      { label: 'Blog', href: '/insights/blog/' },
      { label: 'Exhibitions', href: '/insights/exhibitions/' },
      { label: 'Media', href: '/insights/media/' },
      { label: 'eBooks', href: '/insights/ebooks/' },
    ],
  },
  {
    label: 'Contact Us',
    href: '/contact/local/',
    children: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
    ],
  },
];

export interface MegaGroup {
  title: string;
  href?: string;
  items: NavItem[];
}

/** Tuple shape: [column 1 groups, column 2 groups, column 3 groups] */
export type MegaColumns = [MegaGroup[], MegaGroup[], MegaGroup[]];

/**
 * Mega-menu data — 6 categories arranged across 3 columns. Consumed via
 * `navGroups` by PrimaryNav.astro (desktop) and MobileNav.astro (mobile).
 */
export const megaNav: MegaColumns = [
  // Column 1
  [
    {
      title: 'About Us',
      href: '/about-us/',
      items: [
        { label: 'Corporate Profile', href: '/about-us/' },
        { label: 'History', href: '/about-us/history/' },
        { label: 'Company Structure', href: '/about-us/company-structure/' },
        { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
        { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
      ],
    },
    {
      title: 'Green Elysée',
      href: '/green-elysee/',
      items: [
        { label: 'About Green Elysée', href: '/green-elysee/' },
        { label: 'Certifications', href: '/green-elysee/certifications/' },
        { label: 'Reports', href: '/green-elysee/reports/' },
        { label: 'Insights', href: '/green-elysee/insights/' },
      ],
    },
  ],
  // Column 2
  [
    {
      title: 'Innovation',
      href: '/innovation/why-innovation/',
      items: [
        { label: 'Why Innovation', href: '/innovation/why-innovation/' },
        { label: 'Research & Development', href: '/innovation/research-development/' },
        { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/' },
        { label: 'Innovation Insights', href: '/innovation/insights/' },
        { label: 'Network Partners', href: '/innovation/network-partners/' },
        { label: 'Innovate with Us', href: '/innovation/innovate-with-us/' },
      ],
    },
    {
      title: 'Products',
      href: '/products/',
      items: [
        { label: 'Categories', href: '/products/' },
        { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
        { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/' },
      ],
    },
  ],
  // Column 3
  [
    {
      title: 'Insights',
      href: '/insights/news/',
      items: [
        { label: 'News', href: '/insights/news/' },
        { label: 'Blog', href: '/insights/blog/' },
        { label: 'Exhibitions', href: '/insights/exhibitions/' },
        { label: 'Media', href: '/insights/media/' },
        { label: 'eBooks', href: '/insights/ebooks/' },
      ],
    },
    {
      title: 'Contact Us',
      href: '/contact/local/',
      items: [
        { label: 'Local Network', href: '/contact/local/' },
        { label: 'Worldwide Network', href: '/contact/worldwide/' },
        { label: 'Elysée WISE', href: '/contact/wise/' },
        { label: 'Elysée PRIME', href: '/contact/prime/' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
      ],
    },
  ],
];

/** Flat list consumed by PrimaryNav and MobileNav (one source of truth). */
export const navGroups: MegaGroup[] = megaNav.flat();

/**
 * Footer link columns — mirrors live site footer (About us, Green Elysée,
 * Products, Insights, Contact us). 5 columns; bottom strip has Terms of Use,
 * Terms of Supply, Privacy Policy + copyright.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'About us',
    items: [
      { label: 'History', href: '/about-us/history/' },
      { label: 'Company Structure', href: '/about-us/company-structure/' },
      { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
      { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
    ],
  },
  {
    title: 'Green Elysée',
    items: [
      { label: 'About Green Elysée', href: '/green-elysee/' },
      { label: 'Certifications', href: '/green-elysee/certifications/' },
      { label: 'Reports', href: '/green-elysee/reports/' },
      { label: 'Insights', href: '/green-elysee/insights/' },
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Categories', href: '/products/' },
      { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'News', href: '/insights/news/' },
      { label: 'Blog', href: '/insights/blog/' },
      { label: 'Exhibitions', href: '/insights/exhibitions/' },
      { label: 'Media', href: '/insights/media/' },
      { label: 'eBooks', href: '/insights/ebooks/' },
      { label: 'Environmental Report', href: '/green-elysee/reports/' },
    ],
  },
  {
    title: 'Contact us',
    items: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
    ],
  },
];

/** Legal/utility links rendered in the bottom strip beside the copyright. */
export const footerLegal: NavItem[] = [
  { label: 'Terms of Use', href: '/legal/terms-of-use/' },
  { label: 'Terms of Supply', href: '/legal/terms-of-supply/' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
];

/** Social icons — LinkedIn only (per source site Connect column). */
export const social: { label: string; href: string; icon: string }[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/11204464/admin/',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
];
```

- [ ] **Step 2: Run `pnpm astro check`** — expect 0 errors related to navigation.ts.

- [ ] **Step 3: Commit**

```bash
git add src/data/navigation.ts
git commit -m "feat(nav): restructure navigation to match elysee.com.cy"
```

---

### Task 2: Create `site-content.ts` schema + foundation entries

**Files:** Create `src/data/site-content.ts`.

- [ ] **Step 1: Create the file with this schema and the foundation entries (Corporate Profile, History, Vision/Mission/Values, About Green Elysée, Why Innovation):**

```typescript
/**
 * Site content registry — one named export per route. Consumed by the per-page
 * .astro files via ContentPageLayout / ListPageLayout / DirectoryPageLayout.
 * Text is sourced verbatim from elysee.com.cy live pages (English version).
 */

export interface RichBlock {
  /** Paragraph of body copy. */
  kind: 'paragraph';
  text: string;
}

export interface HeadingBlock {
  kind: 'heading';
  level: 2 | 3;
  text: string;
}

export interface ListBlock {
  kind: 'list';
  ordered?: boolean;
  items: string[];
}

export interface CalloutBlock {
  kind: 'callout';
  title?: string;
  body: string;
}

export interface StatBlock {
  kind: 'stats';
  items: { label: string; value: string }[];
}

export interface TimelineBlock {
  kind: 'timeline';
  items: { year: string; title?: string; body: string }[];
}

export interface PillarsBlock {
  kind: 'pillars';
  intro?: string;
  items: { number: number; title: string; body: string }[];
}

export interface ValueListBlock {
  kind: 'valuelist';
  items: { label: string; body?: string }[];
}

export type ContentBlock =
  | HeadingBlock
  | RichBlock
  | ListBlock
  | CalloutBlock
  | StatBlock
  | TimelineBlock
  | PillarsBlock
  | ValueListBlock;

export interface ContentPage {
  /** Browser title + h1 source. */
  title: string;
  /** Optional eyebrow shown above h1 (e.g. parent section name). */
  eyebrow?: string;
  /** Optional subtitle shown directly under the h1. */
  subtitle?: string;
  /** Page body in document order. */
  blocks: ContentBlock[];
  /** Meta description for <head>. Defaults to first paragraph if absent. */
  metaDescription?: string;
}

/* =========================================================================
 * About Us pillar
 * ========================================================================= */

export const aboutUsCorporateProfile: ContentPage = {
  title: 'Corporate Profile',
  eyebrow: 'About Us',
  blocks: [
    { kind: 'heading', level: 2, text: 'Who we are' },
    {
      kind: 'paragraph',
      text:
        'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.',
    },
    {
      kind: 'paragraph',
      text:
        'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.',
    },
    {
      kind: 'paragraph',
      text:
        'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.',
    },
    { kind: 'heading', level: 2, text: 'Years of experience' },
    {
      kind: 'paragraph',
      text:
        'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.',
    },
    {
      kind: 'paragraph',
      text:
        'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.',
    },
    {
      kind: 'stats',
      items: [
        { label: 'Founded in', value: '1979' },
        { label: 'Employees', value: '215+' },
        { label: 'Product Codes', value: '5000+' },
        { label: 'Countries Worldwide', value: '65+' },
      ],
    },
    { kind: 'heading', level: 2, text: 'What makes Elysée stand out' },
    {
      kind: 'list',
      items: [
        'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.',
        'This product range has been proven in the field for forty years.',
        'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.',
        'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.',
      ],
    },
    {
      kind: 'callout',
      title: 'Streaming Water, Streaming Life',
      body:
        'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.',
    },
  ],
};

export const aboutUsHistory: ContentPage = {
  title: 'History',
  eyebrow: 'About Us',
  subtitle: 'A family business, built one decade at a time.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "The company's origins trace to founder Antonis Protopapas, who possessed a love of nature and an agricultural background with a physics education. His initial vision focused on cultivating premium flowers in the Middle East. During the 1970s, irrigation knowledge became essential to the flower business, which led to trading irrigation supplies, then to manufacturing.",
    },
    {
      kind: 'timeline',
      items: [
        { year: '1979', title: 'Elysée Irrigation founded', body: 'Established on April 16, 1979 in Nicosia, Cyprus.' },
        { year: '1980', body: 'Export activities commenced to nearby Middle Eastern markets.' },
        { year: '1989', body: 'Current facility opened in Ergates Industrial Area due to growth demands. Product range includes drippers, sprinklers, compression fittings, saddles, and threaded fittings.' },
        { year: '1991', body: 'Polyethylene pipe manufacturing unit launched, enabling complete water-supply solutions.' },
        { year: '1998', body: 'ISO 9001 certification achieved after formal quality-control division establishment.' },
        { year: '2001', body: 'New office building erected; headquarters relocated from central Nicosia.' },
        { year: '2002', body: 'Special Export Award received; Research and Development department created.' },
        { year: '2003–2016', body: 'Four further Export Awards (2003, 2008, 2012, 2016). Products now available on all five continents.' },
        { year: 'Today', body: 'Active in 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, Energy. Distribution centres in Austria, Russia, and Lebanon.' },
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Enquiries and orders can reach us through our wide network of local agents and sales representatives.',
    },
  ],
};

export const aboutUsVisionMissionValues: ContentPage = {
  title: 'Vision, Mission & Values',
  eyebrow: 'About Us',
  blocks: [
    { kind: 'heading', level: 2, text: 'Vision' },
    {
      kind: 'paragraph',
      text:
        'To be a green leader worldwide through Innovative, Smart, Easy-to-use Piping Systems.',
    },
    { kind: 'heading', level: 2, text: 'Mission' },
    {
      kind: 'list',
      items: [
        'Develop W.I.S.E. Products to preserve water resources for future generations (Worldwide, Innovative, Smart, Easy-to-use).',
        'Provide our Customers and Partners with a competitive edge.',
        'Lead our people to meet their full potential.',
        'Achieve sustainable and profitable company growth.',
        'Contribute to Society and the Environment making Earth a better place to live.',
      ],
    },
    { kind: 'heading', level: 2, text: 'Values' },
    {
      kind: 'valuelist',
      items: [
        { label: 'Business-driven innovation' },
        { label: 'Green thinking' },
        { label: 'Customer commitment and value creation' },
        { label: 'Quality and continuous improvement' },
        { label: 'Respect each other and win as a team' },
        { label: 'Promote personal and professional growth' },
      ],
    },
  ],
};

/* =========================================================================
 * Green Elysée pillar
 * ========================================================================= */

export const greenElyseeAbout: ContentPage = {
  title: 'About Green Elysée',
  eyebrow: 'Green Elysée',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "One of Elysée's main concerns is the protection of the environment, hence, we always strive to minimize our Carbon Footprint. We are committed to protecting the earth in every possible way, making it a better place to live, while maintaining our business-driven innovation, green thinking, and continuous improvement. For this reason, we wish to pave the road for becoming a leading green company, with effective, sustainable, innovative, and smart piping and fitting systems.",
    },
    {
      kind: 'paragraph',
      text:
        'Here at Elysée, we acknowledge both the benefits and the challenges that leading a green company comes with, and we still remain fully committed to sustainability. Our tag-line "streaming water streaming life" synopsizes perfectly the organization\'s beliefs and culture. It is not just a phrase; it is the foundation of all principles and strategies that define Elysée.',
    },
    {
      kind: 'callout',
      title: 'Vision',
      body:
        'Be a Green Leader Worldwide through Innovative, Smart, Easy-to-Use piping systems.',
    },
    { kind: 'heading', level: 2, text: 'Elysée Strategy50' },
    {
      kind: 'paragraph',
      text:
        "Elysée acknowledges that businesses have a tremendous impact to climate change and can help in the fight against it. For this reason, we are setting a strategic approach to help us ultimately lead the way to a circular economy model, a testimony of our commitment to quality, towards the fulfillment of our goals for sustainability.",
    },
    {
      kind: 'paragraph',
      text:
        'Elysée has set a 10-year strategy that delineates the way we aim to achieve our vision50 by 2029, when the company will turn 50 years old. This strategy encompasses the company\'s set of actions which are grouped in 6 strategic directions or Pillars. Each one of the six Strategic Pillars is further broken down to discrete projects while each project has a specific aim and timeframe. One of the strategic pillars, #4 Green Elysée, is illustrative of the aspiration to be a Green Leader in the industry.',
    },
    {
      kind: 'pillars',
      intro: 'Green Economy Pillar 4 — six strategic components:',
      items: [
        { number: 1, title: 'Carbon Footprint', body: 'Quantifying our environmental impact.' },
        { number: 2, title: 'Green Energy', body: 'Investing in renewable energy and significantly reducing the energy intensity of our production facilities.' },
        { number: 3, title: 'Zero Waste', body: 'Achieving Zero-waste-to-landfill as well as diverting piping waste from landfills.' },
        { number: 4, title: 'Circular Economy', body: 'Philosophy, initiatives, and Green thinking.' },
        { number: 5, title: 'Green Circular Products & Technologies', body: 'High quality, safe, and innovative products, particularly circular products and technologies of circularity.' },
        { number: 6, title: 'Green Policy', body: 'Investing in emissions-offsetting projects.' },
      ],
    },
  ],
};

/* =========================================================================
 * Innovation pillar
 * ========================================================================= */

export const innovationWhy: ContentPage = {
  title: 'Why Innovation',
  eyebrow: 'Innovation',
  subtitle: 'Innovation Matters',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "At Elysée, innovation matters and is the major key to succeeding. We are highly inspired and motivated, intending to launch modern technologies and breakthrough product solutions in our application field. Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy to use Piping Systems. Today's competitive perspective of Elysée highly relies on scientific and technical research and innovation activities.",
    },
    {
      kind: 'paragraph',
      text:
        'The company is strategically looking for new ways to innovate and bring new solutions to the market suitable for improving the end-user experience. By being innovative, we act dynamically for the national economy, achieving our business leadership. Inventiveness — the key component of innovation — fosters monadic ideas.',
    },
    { kind: 'heading', level: 2, text: 'What is innovation?' },
    {
      kind: 'paragraph',
      text:
        "Innovation can be a product, service, business model, or strategy that's both inventive and serviceable in the end. The innovation strategy aims for breakthroughs in technology or new business models, as well as straightforward upgrades to customer service or modern features added to existing products.",
    },
    { kind: 'heading', level: 2, text: 'The importance of innovation' },
    { kind: 'heading', level: 3, text: 'Innovation in Business' },
    {
      kind: 'list',
      items: [
        'Ensure success',
        'Safeguard existing position in the market',
        'Pursue essential growth',
        'Improve competitive positioning',
      ],
    },
    { kind: 'heading', level: 3, text: 'Disruptive' },
    {
      kind: 'paragraph',
      text:
        "Creation of additional market segments to serve a customer base the existing market doesn't reach. New-market disruption is always a challenge for Elysée.",
    },
    { kind: 'heading', level: 3, text: 'Sustaining' },
    {
      kind: 'paragraph',
      text:
        'Improvement of processes and technologies of product lines. Elysée wants to stay atop its market.',
    },
    { kind: 'heading', level: 2, text: 'Our four-step process' },
    {
      kind: 'list',
      ordered: true,
      items: ['Clarify', 'Ideate', 'Develop', 'Execute'],
    },
  ],
};

// ====================================================================
// REMAINING PAGES — added by their respective per-page tasks below.
// Each task lists: the live URL to WebFetch, the export name to add here,
// and the route slug. The implementer follows the schema above and the
// patterns shown by the entries already in this file.
// ====================================================================
```

- [ ] **Step 2: Run `pnpm astro check`** — expect 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/site-content.ts
git commit -m "feat(content): add site-content schema and About Us / Green / Innovation foundation entries"
```

---

### Task 3: Build shared content components

**Files:** Create the 8 components listed under "Components" in File Structure.

- [ ] **Step 1: Create `src/components/PageHero.astro`:**

```astro
---
interface Props {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}
const { title, eyebrow, subtitle } = Astro.props;
---
<section class="pt-32 md:pt-40 pb-12 md:pb-16 bg-brand-500 text-surface">
  <div class="mx-auto max-w-screen-xl px-4 md:px-8">
    {eyebrow && (
      <p class="text-xs md:text-sm uppercase tracking-widest font-medium text-surface/80 mb-3">{eyebrow}</p>
    )}
    <h1 class="text-3xl md:text-5xl lg:text-6xl font-sans font-heavy">{title}</h1>
    {subtitle && (
      <p class="mt-4 text-base md:text-lg text-surface/90 max-w-3xl">{subtitle}</p>
    )}
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/StatGrid.astro`:**

```astro
---
interface Props { items: { label: string; value: string }[]; }
const { items } = Astro.props;
---
<dl class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 my-10">
  {items.map((it) => (
    <div class="text-center md:text-left">
      <dt class="text-xs md:text-sm uppercase tracking-widest text-ink/70">{it.label}</dt>
      <dd class="mt-2 text-3xl md:text-4xl font-heavy text-brand-500">{it.value}</dd>
    </div>
  ))}
</dl>
```

- [ ] **Step 3: Create `src/components/Timeline.astro`:**

```astro
---
interface Item { year: string; title?: string; body: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<ol class="relative border-l-2 border-brand-500/40 pl-6 md:pl-8 my-10 space-y-8">
  {items.map((it) => (
    <li class="relative">
      <span aria-hidden="true" class="absolute -left-[33px] md:-left-[37px] top-1 w-4 h-4 rounded-full bg-brand-500"></span>
      <div class="text-sm uppercase tracking-widest font-medium text-brand-500">{it.year}</div>
      {it.title && <div class="mt-1 text-lg font-heavy text-ink">{it.title}</div>}
      <p class="mt-1 text-base text-ink/85">{it.body}</p>
    </li>
  ))}
</ol>
```

- [ ] **Step 4: Create `src/components/ValueList.astro`:**

```astro
---
interface Item { label: string; body?: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<ul class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 my-8">
  {items.map((it) => (
    <li>
      <span class="block text-base md:text-lg font-medium text-ink">{it.label}</span>
      {it.body && <span class="block mt-1 text-sm text-ink/75">{it.body}</span>}
    </li>
  ))}
</ul>
```

- [ ] **Step 5: Create `src/components/StrategyPillars.astro`:**

```astro
---
interface Item { number: number; title: string; body: string; }
interface Props { intro?: string; items: Item[]; }
const { intro, items } = Astro.props;
---
<section class="my-12">
  {intro && <p class="text-base md:text-lg text-ink/85 mb-8 max-w-3xl">{intro}</p>}
  <ol class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((it) => (
      <li class="p-6 bg-brand-500/5 border border-brand-500/10 rounded-sm">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-2xl font-heavy text-brand-500">{it.number.toString().padStart(2, '0')}</span>
          <h3 class="text-lg font-heavy text-ink">{it.title}</h3>
        </div>
        <p class="text-sm text-ink/80">{it.body}</p>
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 6: Create `src/components/ProcessSteps.astro`:**

```astro
---
interface Item { title: string; description: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<ol class="grid grid-cols-1 md:grid-cols-4 gap-4 my-10">
  {items.map((it, i) => (
    <li class="p-6 bg-surface border border-ink/10 rounded-sm">
      <div class="text-xs uppercase tracking-widest text-brand-500 font-medium">Step {i + 1}</div>
      <h3 class="mt-2 text-lg font-heavy text-ink">{it.title}</h3>
      <p class="mt-1 text-sm text-ink/75">{it.description}</p>
    </li>
  ))}
</ol>
```

- [ ] **Step 7: Create `src/components/ProductCategoryGrid.astro`:**

```astro
---
import { productCategories } from '../data/product-categories';
---
<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
  {productCategories.map((cat) => (
    <li class="border border-ink/10 rounded-sm overflow-hidden bg-surface">
      <div class="aspect-[4/3] bg-brand-500/5 flex items-center justify-center">
        <span class="text-sm text-ink/40">{cat.name}</span>
      </div>
      <div class="p-5">
        <h3 class="text-lg font-heavy text-ink">{cat.name}</h3>
        <div class="mt-4 flex items-center gap-3">
          <a href={`/products/${cat.slug}/`} class="text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent transition-colors duration-fast">View Products →</a>
          {cat.pdf && (
            <a href={cat.pdf} class="text-xs uppercase tracking-widest font-medium text-ink/60 hover:text-brand-500 transition-colors duration-fast">PDF</a>
          )}
        </div>
      </div>
    </li>
  ))}
</ul>
```

- [ ] **Step 8: Create `src/components/CertificationsGrid.astro`:**

```astro
---
interface Cert { name: string; description?: string; }
interface Props { items: Cert[]; }
const { items } = Astro.props;
---
<ul class="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
  {items.map((c) => (
    <li class="aspect-[3/2] border border-ink/10 rounded-sm bg-surface flex flex-col items-center justify-center text-center p-4">
      <span class="text-sm font-heavy text-ink">{c.name}</span>
      {c.description && <span class="mt-1 text-xs text-ink/60">{c.description}</span>}
    </li>
  ))}
</ul>
```

- [ ] **Step 9: Run `pnpm astro check`** — expect 0 errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/PageHero.astro src/components/StatGrid.astro src/components/Timeline.astro src/components/ValueList.astro src/components/StrategyPillars.astro src/components/ProcessSteps.astro src/components/ProductCategoryGrid.astro src/components/CertificationsGrid.astro
git commit -m "feat(components): add shared content components for site rebuild"
```

---

### Task 4: Build the three layout shells

**Files:** Create `src/layouts/ContentPageLayout.astro`, `src/layouts/ListPageLayout.astro`, `src/layouts/DirectoryPageLayout.astro`.

- [ ] **Step 1: Create `src/layouts/ContentPageLayout.astro`:**

```astro
---
import BaseLayout from './BaseLayout.astro';
import PageHero from '../components/PageHero.astro';
import StatGrid from '../components/StatGrid.astro';
import Timeline from '../components/Timeline.astro';
import ValueList from '../components/ValueList.astro';
import StrategyPillars from '../components/StrategyPillars.astro';
import type { ContentPage } from '../data/site-content';

interface Props { content: ContentPage; }
const { content } = Astro.props;
const desc = content.metaDescription
  ?? content.blocks.find((b) => b.kind === 'paragraph')?.text?.slice(0, 160)
  ?? content.title;
---
<BaseLayout title={`${content.title} — Elysée`} description={desc}>
  <PageHero title={content.title} eyebrow={content.eyebrow} subtitle={content.subtitle} />
  <article class="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 space-y-6">
    {content.blocks.map((b) => {
      if (b.kind === 'heading' && b.level === 2) return <h2 class="text-2xl md:text-3xl font-heavy text-ink mt-8 first:mt-0">{b.text}</h2>;
      if (b.kind === 'heading' && b.level === 3) return <h3 class="text-xl font-heavy text-ink mt-6">{b.text}</h3>;
      if (b.kind === 'paragraph') return <p class="text-base md:text-lg text-ink/85 leading-relaxed">{b.text}</p>;
      if (b.kind === 'list') {
        const Tag = b.ordered ? 'ol' : 'ul';
        const cls = b.ordered ? 'list-decimal' : 'list-disc';
        return <Tag class={`${cls} pl-6 space-y-2 text-base md:text-lg text-ink/85`}>{b.items.map((i) => <li>{i}</li>)}</Tag>;
      }
      if (b.kind === 'callout') return (
        <aside class="p-6 md:p-8 bg-brand-500/5 border-l-4 border-brand-500 rounded-sm">
          {b.title && <h3 class="text-lg font-heavy text-brand-500 mb-2">{b.title}</h3>}
          <p class="text-base md:text-lg text-ink/85">{b.body}</p>
        </aside>
      );
      if (b.kind === 'stats') return <StatGrid items={b.items} />;
      if (b.kind === 'timeline') return <Timeline items={b.items} />;
      if (b.kind === 'pillars') return <StrategyPillars intro={b.intro} items={b.items} />;
      if (b.kind === 'valuelist') return <ValueList items={b.items} />;
      return null;
    })}
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create `src/layouts/ListPageLayout.astro`:**

```astro
---
import BaseLayout from './BaseLayout.astro';
import PageHero from '../components/PageHero.astro';

export interface ListItem { title: string; date?: string; excerpt?: string; href?: string; image?: string; }
interface Props { title: string; eyebrow?: string; subtitle?: string; items: ListItem[]; emptyMessage?: string; }
const { title, eyebrow, subtitle, items, emptyMessage = 'No entries yet — check back soon.' } = Astro.props;
---
<BaseLayout title={`${title} — Elysée`} description={subtitle ?? title}>
  <PageHero title={title} eyebrow={eyebrow} subtitle={subtitle} />
  <section class="mx-auto max-w-screen-xl px-4 md:px-8 py-12 md:py-16">
    {items.length === 0 ? (
      <p class="text-center text-ink/60 py-16">{emptyMessage}</p>
    ) : (
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <li class="border border-ink/10 rounded-sm overflow-hidden bg-surface">
            {it.image && <div class="aspect-[16/9] bg-brand-500/5"></div>}
            <div class="p-5">
              {it.date && <time class="text-xs uppercase tracking-widest text-ink/60">{it.date}</time>}
              <h3 class="mt-2 text-lg font-heavy text-ink">
                {it.href ? <a href={it.href} class="hover:text-brand-500 transition-colors duration-fast">{it.title}</a> : it.title}
              </h3>
              {it.excerpt && <p class="mt-2 text-sm text-ink/75">{it.excerpt}</p>}
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 3: Create `src/layouts/DirectoryPageLayout.astro`:**

```astro
---
import BaseLayout from './BaseLayout.astro';
import PageHero from '../components/PageHero.astro';

export interface Office {
  name: string;
  region?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  notes?: string;
}
interface Props { title: string; eyebrow?: string; subtitle?: string; offices: Office[]; intro?: string; }
const { title, eyebrow, subtitle, offices, intro } = Astro.props;
---
<BaseLayout title={`${title} — Elysée`} description={subtitle ?? title}>
  <PageHero title={title} eyebrow={eyebrow} subtitle={subtitle} />
  <section class="mx-auto max-w-screen-xl px-4 md:px-8 py-12 md:py-16">
    {intro && <p class="text-base md:text-lg text-ink/85 max-w-3xl mb-10">{intro}</p>}
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offices.map((o) => (
        <li class="p-6 border border-ink/10 rounded-sm bg-surface">
          {o.region && <p class="text-xs uppercase tracking-widest text-brand-500 font-medium">{o.region}</p>}
          <h3 class="mt-1 text-lg font-heavy text-ink">{o.name}</h3>
          {o.address && <p class="mt-3 text-sm text-ink/85 whitespace-pre-line">{o.address}</p>}
          {o.phone && <p class="mt-2 text-sm text-ink/85">Tel: <a href={`tel:${o.phone.replace(/\s+/g, '')}`} class="hover:text-brand-500">{o.phone}</a></p>}
          {o.email && <p class="text-sm text-ink/85">Email: <a href={`mailto:${o.email}`} class="hover:text-brand-500">{o.email}</a></p>}
          {o.hours && <p class="mt-3 text-xs text-ink/70 whitespace-pre-line">{o.hours}</p>}
          {o.notes && <p class="mt-2 text-xs text-ink/60">{o.notes}</p>}
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Run `pnpm astro check`** — expect 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ContentPageLayout.astro src/layouts/ListPageLayout.astro src/layouts/DirectoryPageLayout.astro
git commit -m "feat(layouts): add ContentPageLayout, ListPageLayout, DirectoryPageLayout"
```

---

### Task 5: Rewrite Footer

**Files:** Modify `src/components/Footer.astro`.

- [ ] **Step 1: Read the current Footer first to understand its structure, then rewrite to use `footerNav` + `footerLegal` + the new section count (5 columns instead of 2).** The new copyright tagline is "© 2026 Elysée Irrigation Ltd. Streaming Water, Streaming Life." Keep the existing LinkedIn social icon. Don't introduce any visual regressions: the existing dark footer treatment, the brand divider, and the responsive collapse to a single column on mobile must all stay.

If the existing `Footer.astro` already iterates `footerNav` and `footerLegal`, the rewrite is just changing the column count (`grid-cols-2 md:grid-cols-5`) and the copyright string. If it hard-codes the old 2 columns, restructure to iterate.

- [ ] **Step 2: Run `pnpm dev`** and visually confirm at 1440 and 390 widths.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(footer): expand to 5-column layout mirroring elysee.com.cy"
```

---

### Task 6: Rewrite the homepage

**Files:** Modify `src/pages/index.astro` (full rewrite).

Use the homepage content already crawled (embedded above in the briefing): hero heading "THE LEADING GREEN COMPANY WITH INNOVATIVE & SMART PIPING & FITTING SYSTEMS", 4 sector cards (Agriculture, Landscape, Building & Infrastructure, Industry), Green Elysée + Innovation pillar callouts, stats (1979 / 215+ / 5000+ / 65+), 4-step ProcessSteps, featured products strip, certifications callout, "Find Us" CTA, contact block (Head Office address, phone, email).

- [ ] **Step 1: Replace `src/pages/index.astro` with:**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import StatGrid from '../components/StatGrid.astro';
import ProcessSteps from '../components/ProcessSteps.astro';

const sectors = [
  { label: 'Agriculture', href: '/our-services/agriculture/' },
  { label: 'Landscape', href: '/our-services/landscape/' },
  { label: 'Building & Infrastructure', href: '/our-services/building-infrastructure/' },
  { label: 'Industry', href: '/our-services/industry/' },
];

const stats = [
  { label: 'Founded in', value: '1979' },
  { label: 'Employees', value: '215+' },
  { label: 'Product Codes', value: '5000+' },
  { label: 'Countries Worldwide', value: '65+' },
];

const steps = [
  { title: 'Conceptual Design & Testing', description: 'Providing innovative solutions.' },
  { title: 'Production', description: 'of Plastic Fittings & Pipes.' },
  { title: 'Distribution', description: 'In more than 65 countries worldwide.' },
  { title: 'Application', description: 'For industrial, agricultural & domestic use.' },
];
---
<BaseLayout
  title="Elysée — The Leading Green Company in Innovative & Smart Piping Systems"
  description="Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, serving 65+ destinations."
>
  <Hero
    heading="The leading green company"
    subheading="With innovative & smart piping & fitting systems"
  />

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {sectors.map((s) => (
        <li class="aspect-[4/3] bg-brand-500/5 border border-brand-500/10 rounded-sm flex items-end p-6">
          <a href={s.href} class="group block w-full">
            <h3 class="text-xl font-heavy text-ink group-hover:text-brand-500 transition-colors duration-fast">{s.label}</h3>
            <span class="mt-2 inline-block text-xs uppercase tracking-widest text-brand-500">Discover more →</span>
          </a>
        </li>
      ))}
    </ul>
  </section>

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <article class="p-8 bg-brand-500/5 rounded-sm">
        <p class="text-xs uppercase tracking-widest text-brand-500 font-medium">Pillar</p>
        <h2 class="mt-2 text-3xl font-heavy text-ink">Green Elysée</h2>
        <p class="mt-4 text-base text-ink/85">We are committed to protecting the earth in every possible way, making it a better place to live, while maintaining our business-driven innovation, green thinking, and continuous improvement.</p>
        <a href="/green-elysee/" class="mt-6 inline-block text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent">Discover more →</a>
      </article>
      <article class="p-8 bg-brand-500/5 rounded-sm">
        <p class="text-xs uppercase tracking-widest text-brand-500 font-medium">Innovation Matters</p>
        <h2 class="mt-2 text-3xl font-heavy text-ink">Innovation Pillar</h2>
        <p class="mt-4 text-base text-ink/85">Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy to use Piping Systems. Today's competitive perspective relies on scientific and technical research and innovation activities.</p>
        <a href="/innovation/why-innovation/" class="mt-6 inline-block text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent">Discover more →</a>
      </article>
    </div>
  </section>

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <h2 class="text-center text-2xl md:text-3xl font-heavy text-ink">With knowledge and experience</h2>
    <StatGrid items={stats} />
    <div class="text-center">
      <a href="/about-us/" class="inline-block text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent">Learn more →</a>
    </div>
  </section>

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <h2 class="text-2xl md:text-3xl font-heavy text-ink">From Design to Application</h2>
    <ProcessSteps items={steps} />
  </section>

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <h2 class="text-2xl md:text-3xl font-heavy text-ink">Quality & Certifications</h2>
    <p class="mt-3 text-base text-ink/85 max-w-2xl">Proven to be the best by the most important organizations in Europe.</p>
    <a href="/about-us/quality-certifications/" class="mt-6 inline-block text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent">See our certifications →</a>
  </section>

  <section data-light-bg class="mx-auto max-w-screen-xl px-4 md:px-8 py-16">
    <h2 class="text-2xl md:text-3xl font-heavy text-ink">Contact us</h2>
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-ink/85">
      <div>
        <p class="font-heavy text-ink">Head Office & Factory</p>
        <p class="mt-2 whitespace-pre-line">5, Pentadaktylou street{"\n"}2643 Ergates Industrial Zone{"\n"}Nicosia, Cyprus</p>
      </div>
      <div>
        <p>Tel: <a href="tel:+35722455000" class="hover:text-brand-500">+357 22 455 000</a></p>
        <p>Fax: +357 22 455 055</p>
        <p>Email: <a href="mailto:info@elysee.com.cy" class="hover:text-brand-500">info@elysee.com.cy</a></p>
      </div>
    </div>
  </section>
</BaseLayout>
```

If `Hero.astro` currently expects different prop names, adapt to its actual interface — read it first.

- [ ] **Step 2: Run `pnpm dev`, open the homepage, confirm the page renders without errors at desktop and mobile widths.**

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): rewrite homepage with elysee.com.cy content"
```

---

### Task 7: Update 4 sector pages

**Files:** Modify `src/pages/our-services/{agriculture,landscape,building-infrastructure,industry}.astro`.

For **agriculture** the content is embedded above in this plan — use it directly. For the other three, the implementer runs `WebFetch` against `/landscape`, `/building-infastructure`, `/industry` with the standard content-extraction prompt.

- [ ] **Step 1: Add four sector entries to `src/data/site-content.ts`:**

```typescript
/* =========================================================================
 * Industry sectors (consumed by /our-services/*)
 * ========================================================================= */

export const sectorAgriculture: ContentPage = {
  title: 'Agriculture',
  eyebrow: 'Sectors',
  subtitle: 'A reliable supplier of Irrigation systems from the pump to the plant. Main, sub-main and laterals.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements.",
    },
    {
      kind: 'paragraph',
      text:
        'Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.',
    },
    {
      kind: 'callout',
      title: 'Maximize your investment with Elysée',
      body:
        'World-class products. Innovative solutions. Adapted to customer needs. Guaranteed minimum impact to the environment.',
    },
    { kind: 'heading', level: 2, text: 'Star products' },
    {
      kind: 'list',
      items: [
        'Ledra (No. 182)',
        'PVC Riser 3" (No. 580)',
        'Adaptor Flanged Set (No. 330D)',
        'No. 2 (No. 442B)',
        'Single 4 Bolts (No. 550B)',
        'Venturi Injectors (No. 190)',
        'Coupling (No. 381)',
        'Mini Valve Gromet with Rubber × Dripline (No. 127D)',
      ],
    },
    { kind: 'heading', level: 2, text: 'Applicable projects' },
    {
      kind: 'list',
      items: [
        'Open-field: row crops, tree crops, orchards, industrial plants',
        'Greenhouses & glasshouses',
        'Nurseries',
      ],
    },
  ],
};

// sectorLandscape, sectorBuildingInfrastructure, sectorIndustry to be added
// by the implementer using WebFetch on /landscape, /building-infastructure,
// /industry respectively — same ContentPage shape as sectorAgriculture above.
```

- [ ] **Step 2: For each of the three remaining sectors (landscape, building-infrastructure, industry):**

```text
WebFetch(
  url: 'https://elysee.com.cy/landscape',  // or /building-infastructure  or /industry
  prompt: '<standard content-extraction prompt from "Content sourcing pattern" above>'
)
```

Transcribe each into a `ContentPage` object named `sectorLandscape`, `sectorBuildingInfrastructure`, `sectorIndustry` and add to `site-content.ts`.

- [ ] **Step 3: Rewrite each of the 4 sector page files** to be 6-line consumers:

```astro
---
import ContentPageLayout from '../../layouts/ContentPageLayout.astro';
import { sectorAgriculture } from '../../data/site-content';
---
<ContentPageLayout content={sectorAgriculture} />
```

(With the appropriate `sectorLandscape` / `sectorBuildingInfrastructure` / `sectorIndustry` import per file.)

- [ ] **Step 4: Run `pnpm astro check && pnpm build`** — expect 0 errors and all 4 sector pages to build.

- [ ] **Step 5: Commit**

```bash
git add src/data/site-content.ts src/pages/our-services/
git commit -m "feat(sectors): replace marine-energy copy with real Elysée sector content"
```

---

### Task 8: Delete obsolete pages and update tests; verify

**Files:**
- Delete: `src/pages/about-us/your-marine-energy-provider.astro`, `src/pages/contact.astro`, `src/pages/press-room/news/index.astro` (move it to `/insights/news/` in Phase 5)
- Modify: `tests/a11y.spec.ts` (route list), `tests/nav.spec.ts` (EXPECTED_GROUPS in desktop describe block)

- [ ] **Step 1: Update `tests/nav.spec.ts` EXPECTED_GROUPS to the new 6 categories:**

```typescript
const EXPECTED_GROUPS = [
  'About Us',
  'Green Elysée',
  'Innovation',
  'Products',
  'Insights',
  'Contact Us',
];
```

The `toHaveCount(8)` assertion must change to `toHaveCount(6)`. Update the mobile describe block's `toHaveCount(8)` to `toHaveCount(6)` as well. Update test data anywhere it references the old categories (e.g., the `Responsible Partner` / `Compliance` / `Sustainability` strings used in dropdown tests). Replace those with: open Green Elysée → confirm "About Green Elysée" and "Certifications" appear; open Innovation → confirm "Why Innovation" and "Innovate with Us" appear.

- [ ] **Step 2: Update `tests/a11y.spec.ts` ROUTES list:**

```typescript
const ROUTES = [
  '/',
  '/about-us/',
  '/our-services/agriculture/',
  '/our-services/landscape/',
  '/our-services/building-infrastructure/',
  '/our-services/industry/',
  '/legal/privacy-policy/',
  '/legal/terms-of-use/',
];
```

Routes from Phase 2+ will be added to this list by their respective phases.

- [ ] **Step 3: Delete the three obsolete pages:**

```bash
git rm src/pages/about-us/your-marine-energy-provider.astro
git rm src/pages/contact.astro
git rm src/pages/press-room/news/index.astro
rmdir src/pages/press-room/news src/pages/press-room 2>/dev/null || true
```

- [ ] **Step 4: Run `pnpm astro check && pnpm build && pnpm exec playwright test`** — expect all green.

- [ ] **Step 5: Commit**

```bash
git add tests/ src/pages/
git commit -m "chore(rebuild): delete obsolete pages and align tests with new nav"
```

---

## Phase 2 — About Us section (Tasks 9–13)

5 sub-pages. The Corporate Profile content lives at the section index (`/about-us/`); the other 4 are sub-routes.

### Task 9: `/about-us/` (Corporate Profile)

**Files:** Modify `src/pages/about-us/index.astro`.

- [ ] **Step 1: Replace `src/pages/about-us/index.astro` with:**

```astro
---
import ContentPageLayout from '../../layouts/ContentPageLayout.astro';
import { aboutUsCorporateProfile } from '../../data/site-content';
---
<ContentPageLayout content={aboutUsCorporateProfile} />
```

- [ ] **Step 2: Add `/about-us/` to `tests/a11y.spec.ts` ROUTES** (already there from Phase 1 — confirm).

- [ ] **Step 3: Run `pnpm astro check && pnpm exec playwright test tests/a11y.spec.ts -g "/about-us/"` — expect green.**

- [ ] **Step 4: Commit**

```bash
git add src/pages/about-us/index.astro tests/a11y.spec.ts
git commit -m "feat(about-us): render Corporate Profile at /about-us/"
```

### Task 10: `/about-us/history/`

**Files:** Create `src/pages/about-us/history/index.astro`.

- [ ] **Step 1: Create the file:**

```astro
---
import ContentPageLayout from '../../../layouts/ContentPageLayout.astro';
import { aboutUsHistory } from '../../../data/site-content';
---
<ContentPageLayout content={aboutUsHistory} />
```

- [ ] **Step 2: Append `'/about-us/history/'` to the ROUTES array in `tests/a11y.spec.ts`.**

- [ ] **Step 3: Run `pnpm astro check && pnpm exec playwright test tests/a11y.spec.ts` — expect all routes green.**

- [ ] **Step 4: Commit**

```bash
git add src/pages/about-us/history/ tests/a11y.spec.ts
git commit -m "feat(about-us): add /about-us/history/ page"
```

### Task 11: `/about-us/company-structure/`

**Files:** Modify `src/data/site-content.ts` (append entry); create `src/pages/about-us/company-structure/index.astro`.

- [ ] **Step 1: Run WebFetch with the standard content-extraction prompt against `https://elysee.com.cy/company-elysee-en` and transcribe into a new `ContentPage` named `aboutUsCompanyStructure` in `src/data/site-content.ts`.** Add a `/* About Us — Company Structure */` divider comment before the entry. If the live page renders an organizational chart image, describe its rough shape in a `paragraph` block and place a `callout` listing the named divisions/departments below it.

- [ ] **Step 2: Create `src/pages/about-us/company-structure/index.astro`:**

```astro
---
import ContentPageLayout from '../../../layouts/ContentPageLayout.astro';
import { aboutUsCompanyStructure } from '../../../data/site-content';
---
<ContentPageLayout content={aboutUsCompanyStructure} />
```

- [ ] **Step 3: Append `'/about-us/company-structure/'` to `tests/a11y.spec.ts` ROUTES.**

- [ ] **Step 4: Verify and commit:**

```bash
pnpm astro check && pnpm exec playwright test tests/a11y.spec.ts
git add src/data/site-content.ts src/pages/about-us/company-structure/ tests/a11y.spec.ts
git commit -m "feat(about-us): add /about-us/company-structure/ page"
```

### Task 12: `/about-us/vision-mission-values/`

**Files:** Create `src/pages/about-us/vision-mission-values/index.astro`. The content entry `aboutUsVisionMissionValues` already exists in `site-content.ts` from Task 2.

- [ ] **Step 1: Create the page:**

```astro
---
import ContentPageLayout from '../../../layouts/ContentPageLayout.astro';
import { aboutUsVisionMissionValues } from '../../../data/site-content';
---
<ContentPageLayout content={aboutUsVisionMissionValues} />
```

- [ ] **Step 2: Append `'/about-us/vision-mission-values/'` to ROUTES.**

- [ ] **Step 3: Verify and commit:**

```bash
pnpm astro check && pnpm exec playwright test tests/a11y.spec.ts
git add src/pages/about-us/vision-mission-values/ tests/a11y.spec.ts
git commit -m "feat(about-us): add /about-us/vision-mission-values/ page"
```

### Task 13: `/about-us/quality-certifications/`

**Files:** Modify `src/data/site-content.ts`; create `src/pages/about-us/quality-certifications/index.astro`.

- [ ] **Step 1: WebFetch `https://elysee.com.cy/quality-certifications-en` with the standard prompt.** Transcribe into `aboutUsQualityCertifications: ContentPage`. The live page has a grid of certification logos (ISO 9001, DVGW, KIWA, WRAS, SII, OVGW) — represent these as a `callout` with a `list` block of the certification names, OR (preferred) add the certifications to `aboutUsQualityCertifications.blocks` as a custom block type if the schema allows. Easiest: list them inside a `list` block titled "Our Certifications".

- [ ] **Step 2: Create the page:**

```astro
---
import ContentPageLayout from '../../../layouts/ContentPageLayout.astro';
import { aboutUsQualityCertifications } from '../../../data/site-content';
---
<ContentPageLayout content={aboutUsQualityCertifications} />
```

- [ ] **Step 3: Append `'/about-us/quality-certifications/'` to ROUTES, verify, commit:**

```bash
pnpm astro check && pnpm exec playwright test tests/a11y.spec.ts
git add src/data/site-content.ts src/pages/about-us/quality-certifications/ tests/a11y.spec.ts
git commit -m "feat(about-us): add /about-us/quality-certifications/ page"
```

---

## Phase 3 — Green Elysée + Innovation sections (Tasks 14–23)

10 pages total. All follow the same pattern as Phase 2: content goes into `site-content.ts`, page file is a 5-line wrapper, route gets added to `tests/a11y.spec.ts`.

### Task 14: `/green-elysee/` (already in content)

**Files:** Create `src/pages/green-elysee/index.astro`. Entry `greenElyseeAbout` exists in `site-content.ts` from Task 2.

```astro
---
import ContentPageLayout from '../../layouts/ContentPageLayout.astro';
import { greenElyseeAbout } from '../../data/site-content';
---
<ContentPageLayout content={greenElyseeAbout} />
```

Append `/green-elysee/` to ROUTES. Verify. Commit `feat(green-elysee): add /green-elysee/ landing page`.

### Task 15: `/green-elysee/certifications/`

WebFetch `/certifications-green-elysee-en`. Add `greenElyseeCertifications` to `site-content.ts`. Create page wrapper. Append to ROUTES. Commit.

### Task 16: `/green-elysee/reports/`

WebFetch `/reports-ebooks-green-elysee-en`. Add `greenElyseeReports`. If the live page exposes downloadable PDF reports, list each as a `list` item with a parenthetical year/format. Commit.

### Task 17: `/green-elysee/insights/`

WebFetch `/insights-green-elysee-en`. Likely a list of blog-post-style insight cards. Use `ListPageLayout` instead of `ContentPageLayout`. Create `greenElyseeInsightsItems: ListItem[]` array in `site-content.ts` and a page like:

```astro
---
import ListPageLayout from '../../../layouts/ListPageLayout.astro';
import { greenElyseeInsightsItems } from '../../../data/site-content';
---
<ListPageLayout
  title="Green Elysée Insights"
  eyebrow="Green Elysée"
  items={greenElyseeInsightsItems}
/>
```

Commit.

### Task 18: `/innovation/why-innovation/` (already in content)

Create wrapper using `innovationWhy`. Commit.

### Tasks 19–23: remaining Innovation pages

For each of `/innovation/research-development/`, `/innovation/funded-research-projects/`, `/innovation/insights/`, `/innovation/network-partners/`, `/innovation/innovate-with-us/`:

1. WebFetch the corresponding live URL (`/research-and-development-innovation-en`, `/funded-research-projects-innovation-en`, `/innovation-insights-innovation-en`, `/network-partners-innovation-en`, `/innovate-with-us-innovation-en`).
2. Add a `ContentPage` (or `ListItem[]` for `/insights/`) export to `site-content.ts`.
3. Create the page wrapper file (`src/pages/innovation/<slug>/index.astro`) following the Task 12 template.
4. Append route to `tests/a11y.spec.ts` ROUTES.
5. Verify, commit one task per page.

The `/innovation/innovate-with-us/` page is a partnerships/CTA page — if the live page has a contact form, render the same set of fields using existing `Input.astro` / `Textarea.astro` components (read them first to confirm props) wired to a `<form action="mailto:innovation@elysee.com.cy">` fallback; do NOT wire to a real backend.

---

## Phase 4 — Products section (Tasks 24–25)

### Task 24: Product categories data + grid

**Files:** Create `src/data/product-categories.ts`.

- [ ] **Step 1: Create the data file:**

```typescript
export interface ProductCategory {
  name: string;
  slug: string;
  pdf?: string;
}

/** 13 product categories from elysee.com.cy/products-catalogue-en. */
export const productCategories: ProductCategory[] = [
  { name: 'Compression Fittings', slug: 'compression-fittings' },
  { name: 'Hydraulic Fittings', slug: 'hydraulic-fittings' },
  { name: 'Saddles', slug: 'saddles' },
  { name: 'Light-Weight Fittings', slug: 'light-weight-fittings' },
  { name: 'Valves', slug: 'valves' },
  { name: 'Filters & Dosers', slug: 'filters-dosers' },
  { name: 'Micro Irrigation & Sprinklers', slug: 'micro-irrigation-sprinklers' },
  { name: 'Turf', slug: 'turf' },
  { name: 'Polyethylene Pipes', slug: 'polyethylene-pipes' },
  { name: 'PVC Pressure Pipes & Fittings', slug: 'pvc-pressure-pipes-fittings' },
  { name: 'Network Drainage', slug: 'network-drainage' },
  { name: 'Cable Applications', slug: 'cable-applications' },
  { name: 'Building Sewerage', slug: 'building-sewerage' },
];
```

PDF links are out of scope for this rebuild (live PDFs are hosted on the live CMS). Leave `pdf` undefined; the `ProductCategoryGrid` component conditionally renders the PDF link only when present.

- [ ] **Step 2: Create `src/pages/products/index.astro`:**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import ProductCategoryGrid from '../../components/ProductCategoryGrid.astro';
---
<BaseLayout title="Product Categories — Elysée" description="13 categories of piping, fittings, valves, and irrigation products from Elysée.">
  <PageHero title="Categories" eyebrow="Products" />
  <section class="mx-auto max-w-screen-xl px-4 md:px-8 py-12 md:py-16">
    <ProductCategoryGrid />
  </section>
</BaseLayout>
```

- [ ] **Step 3: Append `/products/` to ROUTES; verify; commit.**

### Task 25: `/products/catalogues/`

**Files:** Create `src/pages/products/catalogues/index.astro`. WebFetch `/catalogues-leaflets-en` for the catalogue/leaflet list. Render with `ListPageLayout` using the catalogue names as items; `href` and `image` undefined since we don't have the PDFs. Append to ROUTES; verify; commit.

---

## Phase 5 — Insights section (Tasks 26–30)

5 pages, all list-style. Live site likely has many posts; for this rebuild we seed each with 3–5 representative entries.

### Tasks 26–30: News, Blog, Exhibitions, Media, eBooks

For each: WebFetch the corresponding live URL. Extract up to 5 entries. For each entry capture (title, date if present, excerpt of first paragraph). Add the array to `site-content.ts` (e.g., `insightsNewsItems: ListItem[]`). Create page file:

```astro
---
import ListPageLayout from '../../../layouts/ListPageLayout.astro';
import { insightsNewsItems } from '../../../data/site-content';
---
<ListPageLayout title="News" eyebrow="Insights" items={insightsNewsItems} />
```

Repeat for `/insights/blog/`, `/insights/exhibitions/`, `/insights/media/`, `/insights/ebooks/`. Append each route to ROUTES. Commit one per page.

If a list page has no published entries on the live site, leave the items array empty — `ListPageLayout` renders the configured `emptyMessage`.

---

## Phase 6 — Contact section + sub-brands (Tasks 31–35)

5 directory pages.

### Task 31: `/contact/local/`

**Files:** Append `localOffices: Office[]` to `site-content.ts`; create `src/pages/contact/local/index.astro`.

- [ ] **Step 1:** Extend `site-content.ts` with an `Office` re-export from the layout, OR import the type from the layout in the data module (cleaner: define `Office` interface in `site-content.ts` and import in `DirectoryPageLayout.astro` — adjust Task 4 if needed). Add:

```typescript
export const localOffices: Array<{
  name: string; region?: string; address?: string; phone?: string; email?: string; hours?: string; notes?: string;
}> = [
  {
    name: 'Strovolos Shop',
    region: 'Nicosia',
    address: '32 Solomou Solomou Street, 2032',
    phone: '+357 22 455 100',
    hours: 'Monday–Friday 07:00–13:00 & 13:30–16:30\nSaturday 07:30–13:00',
    notes: 'Alt phone: +357 22 317 913',
  },
  { name: 'Ergates Shop', region: 'Nicosia', notes: 'Contact head office for details.' },
  { name: 'Larnaca Shop', region: 'Larnaca', notes: 'Contact head office for details.' },
  { name: 'Frenaros Shop', region: 'Famagusta district', notes: 'Contact head office for details.' },
  { name: 'Limassol Shop', region: 'Limassol', notes: 'Contact head office for details.' },
  { name: 'Paphos Shop', region: 'Paphos', notes: 'Contact head office for details.' },
];
```

- [ ] **Step 2:** Create `src/pages/contact/local/index.astro`:

```astro
---
import DirectoryPageLayout from '../../../layouts/DirectoryPageLayout.astro';
import { localOffices } from '../../../data/site-content';
---
<DirectoryPageLayout
  title="Local Network"
  eyebrow="Contact Us"
  subtitle="Find your nearest Elysée shop in Cyprus."
  offices={localOffices}
/>
```

- [ ] **Step 3:** Append `/contact/local/` to ROUTES. Verify, commit.

### Task 32: `/contact/worldwide/`

WebFetch `/contact-world-en`. Build `worldwideOffices: Office[]`. The live page likely groups distributors by region/country; preserve that grouping by using the `region` field. Create page wrapper similarly. Commit.

### Tasks 33–35: Sub-brand pages

For each of `/contact/wise/`, `/contact/prime/`, `/contact/rohrsysteme/`:

1. WebFetch the corresponding live URL (`/elysee-wise`, `/elysee-prime-egypt-factory`, `/elysee-rohrsysteme`).
2. Determine whether the page is informational (use `ContentPageLayout`) or contact-directory (use `DirectoryPageLayout`). Likely informational with a contact panel at the bottom — use `ContentPageLayout` and end with a `callout` block listing address/phone/email.
3. Add `subBrandWise`, `subBrandPrime`, `subBrandRohrsysteme` `ContentPage` exports to `site-content.ts`.
4. Create page wrappers, append routes to ROUTES, verify, commit one per page.

---

## Phase 7 — Final verification (Task 36)

### Task 36: Full-suite verification

- [ ] **Step 1: Run `pnpm astro check`** — 0 errors.
- [ ] **Step 2: Run `pnpm build`** — all 35+ pages build.
- [ ] **Step 3: Run `pnpm exec playwright test`** — all suites green, including the now-extended `a11y.spec.ts` covering every new route, and `nav.spec.ts` with the 6 new categories.
- [ ] **Step 4: Manual smoke at `pnpm dev`:** Walk through the new nav at 1440 and 390 widths. Open one dropdown per category; click one sub-link in each; confirm the page renders without 404 and the breadcrumb / hero look reasonable. Check the footer at the bottom of any page.
- [ ] **Step 5: If anything regressed, fix it. Otherwise nothing to commit.**

---

## Self-Review

**Spec coverage:**
- "Check that all the subpages we have are existed" — Audit table at the top maps all 18 broken nav links to their replacements. ✓
- "Crawl all info from elysee.com.cy and recreate those pages" — Live URLs listed for every page; standardized WebFetch prompt provided; 9 representative pages embedded with full content; remaining 18 pages get fetched at task execution time. ✓
- "Get all the texts and informations from there" — Implementer transcribes verbatim text from each live page into typed `ContentPage` objects. No invented copy. ✓
- "Be analytic and detailed" — 36 tasks across 7 phases. File structure, schema, layouts, components, per-page templates all laid out concretely. ✓

**Placeholder scan:**
- No "TBD"/"implement later"/"appropriate X" entries.
- "Similar to Task N" is replaced by concrete 5-line wrapper templates that engineers can copy verbatim per page; the per-page tasks include the exact code block.
- Per-page tasks for routes whose live content isn't embedded say exactly what to fetch and how to transcribe, with the schema visible in Task 2 — that's enough HOW.

**Type consistency:**
- `ContentPage`, `ContentBlock`, `RichBlock`, etc. defined once in Task 2 and referenced consistently in Tasks 4, 7, 9–35.
- `Office` interface duplicated in Task 4 (layout) and Task 31 (data) — flagged in Task 31 step 1 with the cleaner option (define once in data, import in layout). Implementer should resolve to the cleaner option.
- `productCategories` in Task 24 matches the type used by `ProductCategoryGrid` in Task 3.
- Route slugs in `navigation.ts` (Task 1) exactly match the page paths created in Tasks 9–35. Spot-check: nav says `/innovation/research-development/`; Task 19 creates `src/pages/innovation/research-development/index.astro`. Match. Spot-check: nav says `/insights/news/`; Task 26 creates `src/pages/insights/news/index.astro`. Match.

**Risks called out for executors:**
1. Phase 1 leaves an intermediate state where the nav points at routes not yet built. The implementer should run Phase 1's smoke (homepage) but expect 404s on dropdown sub-links until Phase 2+ lands. Acceptable because tests are sequenced: each per-page task adds its route to `a11y.spec.ts` only after the page exists.
2. The `Office` interface duplication noted above. Recommended fix in Task 4 itself: export `Office` from `src/layouts/DirectoryPageLayout.astro` AND import it in `site-content.ts` when defining `localOffices`/`worldwideOffices`.
3. The `Footer.astro` rewrite in Task 5 is described conditionally because the existing file's structure isn't fully read in the plan. Implementer must read it first.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-25-elysee-cy-rebuild.md`. Two execution options:**

**1. Subagent-Driven (recommended for the foundation + Phase 2)** — Dispatch a fresh subagent per task, two-stage review. Best for Phase 1 (Tasks 1–8) where mistakes compound, and Phase 2 where the patterns get established. Subsequent phases are mechanical enough they could be batched.

**2. Inline Execution** — Use `superpowers:executing-plans` to run through tasks in this session with batch checkpoints. Best for Phases 3–6 once the templates are well-established.

**Recommended hybrid:** subagent-driven for Phase 1 (3 batches: Tasks 1–4 foundations, Tasks 5–6 homepage + footer, Tasks 7–8 sectors + cleanup); then inline for Phases 2–6 batched per-section, with a final reviewer pass at the end.

**Which approach?**
