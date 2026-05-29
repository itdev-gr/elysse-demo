# Green Elysée — Cinematic Subpages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the three Green Elysée subpages — `/green-elysee/certifications/`, `/green-elysee/reports/`, `/green-elysee/insights/` — replacing the current stub templates with cinematic, content-rich pages mirroring the live `elysee.com.cy` content (text, images, PDF downloads), while honouring the established Elysée design language and the elaborate page pattern already used on `/about-us/quality-certifications/` and `/contact/careers/`.

**Architecture:**
- Extend `src/data/site-content.ts` with richer typed data for each page (PDF download URLs on each certification, report/ebook thumbnails + download URLs, insights articles with hero images, key stats, and "moment" callouts).
- Add a new `greenElyseeSiblings` list to `src/data/content.ts` and a shared `GreenElyseeSubNav.astro` component (mirrors `AboutSubNav` / `ContactSubNav` pattern).
- Download the small set of live-site images (reports thumbnails + 1 insight thumbnail) into `public/images/green-elysee/` so the rebuild is self-contained. Reuse existing `/images/about/*.jpg` and `/images/certifications/*.svg` where appropriate.
- Rewrite the three `index.astro` page files using the same cinematic structure as `quality-certifications/index.astro`: scroll-progress bar → cover hero with parallax → sub-nav → stat band → editorial intro with sticky aside + drop-cap → cinematic full-bleed moment → content grid (certs grid / reports cards / insights cards) → closing CTA. All animations use the existing `motion` (scroll + animate) and `gsap` + `ScrollTrigger` stack and respect `prefers-reduced-motion`.
- **Preserve the existing design system** — only the three stub pages change; tokens, layouts, header/footer, and other pages stay untouched. (Per `feedback_preserve_existing_design`.)
- **No git commits or pushes** are performed inside this plan. After all tasks complete, the work is staged for the user to review before any commit. (Per `feedback_no_commit_until_review`.)

**Tech Stack:** Astro 6, Tailwind v4 (`@theme` tokens in `src/styles/global.css`), `motion@12` (vanilla JS API — `scroll`, `animate`), `gsap@3` + `ScrollTrigger`, TypeScript, vitest.

---

## File Structure

**Create:**
- `src/components/green-elysee/GreenElyseeSubNav.astro` — sticky sub-nav for the Green Elysée pillar (mirrors `AboutSubNav.astro`).
- `public/images/green-elysee/environmental-report-2024-cover.png` — Environmental Report 2024 thumbnail (downloaded from live).
- `public/images/green-elysee/yearly-report-2021-cover.jpg` — Yearly Report 2021 cover (downloaded from live).
- `public/images/green-elysee/journey-to-green-leader.jpg` — "Our journey to becoming a Green leader" hero image (downloaded from live).

**Modify:**
- `src/data/content.ts:174` — append `greenElyseeSiblings` after the existing `aboutSiblings` / `contactSiblings` exports.
- `src/data/site-content.ts:416-489` — extend `greenElyseeCertifications`, `greenElyseeReports`, and `greenElyseeInsightsItems` exports with richer typed data (PDF hrefs, image paths, dates, expanded descriptions, key stats, moment callouts).
- `src/pages/green-elysee/certifications/index.astro` — replace the 60-line stub with the full cinematic implementation.
- `src/pages/green-elysee/reports/index.astro` — replace the 5-line `ContentPageLayout` wrapper with the full cinematic implementation.
- `src/pages/green-elysee/insights/index.astro` — replace the 10-line `ListPageLayout` wrapper with the full cinematic implementation.

**Test:**
- `src/components/green-elysee/GreenElyseeSubNav.test.ts` — unit test for active-link logic.
- `src/data/site-content.test.ts` — assertions that the three Green Elysée exports contain the expected real-world content (PDF URLs, image paths, etc.).

**Reused (no edits):**
- `src/layouts/BaseLayout.astro`, `src/components/Container.astro`, `src/components/Section.astro`, `src/components/PageHero.astro`, `src/components/CertificationsGrid.astro`, `src/scripts/reveals.client.ts`, `src/scripts/stat-counter.client.ts`, `src/styles/global.css`, `src/styles/tokens.css`.

---

## Task 1: Add `greenElyseeSiblings` to content data

**Files:**
- Modify: `src/data/content.ts:174-193`

- [ ] **Step 1: Read current state of the sibling lists**

```bash
sed -n '174,194p' src/data/content.ts
```

Expected: Existing `aboutSiblings` and `contactSiblings` exports, ending at line 193.

- [ ] **Step 2: Append `greenElyseeSiblings` after `contactSiblings`**

Insert the following block immediately after the `contactSiblings` array (after the closing `];` on line 193):

```ts
/** Sibling lists for the Green Elysée sub-nav. */
export const greenElyseeSiblings: { label: string; href: string }[] = [
  { label: 'About Green Elysée', href: '/green-elysee/' },
  { label: 'Certifications', href: '/green-elysee/certifications/' },
  { label: 'Reports', href: '/green-elysee/reports/' },
  { label: 'Insights', href: '/green-elysee/insights/' },
];
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors, 0 warnings on `src/data/content.ts`.

---

## Task 2: Create `GreenElyseeSubNav.astro` component

**Files:**
- Create: `src/components/green-elysee/GreenElyseeSubNav.astro`

- [ ] **Step 1: Make the directory**

Run: `mkdir -p src/components/green-elysee`
Expected: directory created (no output on success).

- [ ] **Step 2: Write the component**

Create `src/components/green-elysee/GreenElyseeSubNav.astro` with the following content (verbatim — mirrors `AboutSubNav.astro` exactly except for the import and `aria-label`):

```astro
---
import Container from '../Container.astro';
import { greenElyseeSiblings } from '../../data/content';

interface Props {
  /** Current pathname; pass Astro.url.pathname. */
  currentPath: string;
}
const { currentPath } = Astro.props;
const normalize = (p: string) => (p.endsWith('/') ? p : `${p}/`);
const here = normalize(currentPath);
---
<nav
  aria-label="Green Elysée section"
  class="sticky top-[76px] md:top-20 z-30 bg-surface/95 backdrop-blur-sm border-b border-ink/10"
>
  <Container size="xl">
    <ul class="flex items-center gap-1 md:gap-2 overflow-x-auto whitespace-nowrap -mx-2 px-2 py-3 md:py-4 scrollbar-none">
      <li class="hidden lg:flex items-center pr-4 mr-2 border-r border-ink/15">
        <span class="text-[10px] uppercase tracking-[0.3em] text-ink/50">In this section</span>
      </li>
      {greenElyseeSiblings.map((item) => {
        const isActive = normalize(item.href) === here;
        return (
          <li>
            <a
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              class={`cursor-pointer inline-flex items-center px-4 py-2 text-xs md:text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-500 text-surface font-heavy'
                  : 'text-ink/70 hover:text-ink hover:bg-ink/5'
              }`}
            >{item.label}</a>
          </li>
        );
      })}
    </ul>
  </Container>
</nav>
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors on the new file.

---

## Task 3: Unit-test the sub-nav active-link logic

**Files:**
- Create: `src/components/green-elysee/GreenElyseeSubNav.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/green-elysee/GreenElyseeSubNav.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { greenElyseeSiblings } from '../../data/content';

const normalize = (p: string) => (p.endsWith('/') ? p : `${p}/`);

describe('GreenElyseeSubNav active-link logic', () => {
  it('exposes the four Green Elysée subpages in order', () => {
    expect(greenElyseeSiblings.map((s) => s.label)).toEqual([
      'About Green Elysée',
      'Certifications',
      'Reports',
      'Insights',
    ]);
  });

  it('marks the matching href as active for each subpage path', () => {
    for (const sib of greenElyseeSiblings) {
      const here = normalize(sib.href);
      const activeCount = greenElyseeSiblings.filter(
        (s) => normalize(s.href) === here,
      ).length;
      expect(activeCount).toBe(1);
    }
  });

  it('treats trailing-slash and no-trailing-slash paths as equivalent', () => {
    expect(normalize('/green-elysee/certifications')).toBe(
      normalize('/green-elysee/certifications/'),
    );
  });
});
```

- [ ] **Step 2: Run the test (it should fail first if `greenElyseeSiblings` is missing)**

Run: `pnpm vitest run src/components/green-elysee/GreenElyseeSubNav.test.ts`
Expected on first run (Task 1 not done): FAIL — `greenElyseeSiblings` undefined.
After Task 1: PASS — 3 tests passing.

- [ ] **Step 3: Make sure it passes after Task 1**

If Task 1 was completed, re-run the test.
Expected: PASS (3/3).

---

## Task 4: Download the three live-site images

**Files:**
- Create: `public/images/green-elysee/environmental-report-2024-cover.png`
- Create: `public/images/green-elysee/yearly-report-2021-cover.jpg`
- Create: `public/images/green-elysee/journey-to-green-leader.jpg`

- [ ] **Step 1: Make the destination directory**

Run: `mkdir -p public/images/green-elysee`
Expected: directory created.

- [ ] **Step 2: Download the three live images**

Run each command from the project root:

```bash
curl -sSfL \
  "https://elysee.com.cy/portal-img/reports_thumb_img/249/green-policy-certification-2024.png" \
  -o public/images/green-elysee/environmental-report-2024-cover.png

curl -sSfL \
  "https://elysee.com.cy/portal-img/ebooks_thumb_img/249/green-elysee-2021-report-eksofyllo.JPG" \
  -o public/images/green-elysee/yearly-report-2021-cover.jpg

curl -sSfL \
  "https://elysee.com.cy/portal-img/insights_green_elysee_thumb_img/249/our-journey-to-becoming-a-green-leader-1.jpg" \
  -o public/images/green-elysee/journey-to-green-leader.jpg
```

Expected: three non-zero files in `public/images/green-elysee/`.

- [ ] **Step 3: Verify files exist and have non-zero size**

Run: `ls -la public/images/green-elysee/`
Expected: three files, each `> 0` bytes. If any are 0 bytes or 404, the source URL has changed — fall back to a placeholder from `public/images/about/` (e.g. `water-flowing.jpg`) and note this in the task review.

---

## Task 5: Extend `greenElyseeCertifications` data with PDF download URLs

**Files:**
- Modify: `src/data/site-content.ts:416-439`

- [ ] **Step 1: Read the current `greenElyseeCertifications` export**

Run: `sed -n '416,440p' src/data/site-content.ts`
Expected: Current export with `title`, `eyebrow`, `subtitle`, `blocks` (one paragraph, one heading, one bullet list of 6 strings).

- [ ] **Step 2: Replace the export with the richer typed data**

Replace lines 416–439 (the existing `greenElyseeCertifications` export) with:

```ts
export interface GreenCertification {
  name: string;
  description: string;
  /** Path under /public for the local SVG badge. */
  logo: string;
  /** PDF download URL on elysee.com.cy. */
  href: string;
  /** Optional pull-quote shown on the certification card. */
  scope?: string;
}

export const greenCertificationItems: GreenCertification[] = [
  {
    name: 'ISO 14001',
    description: 'Environmental Management System',
    logo: '/images/certifications/iso-14001.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng-P3D42.pdf',
    scope: 'Systematic management of environmental responsibilities across all operations.',
  },
  {
    name: 'ISCC PLUS',
    description: 'International Sustainability and Carbon Certification',
    logo: '/images/certifications/iscc-plus.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/certificate-2025.pdf',
    scope: 'Traceability of sustainable and recycled raw materials through the supply chain.',
  },
  {
    name: 'ISO 14064-3:2019',
    description: 'Greenhouse Gas Validation and Verification',
    logo: '/images/certifications/iso-14064-3.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/iso14064-year-2024-qZNLq.pdf',
    scope: 'Independent verification of greenhouse-gas emission statements.',
  },
  {
    name: 'EMAS 2024',
    description: 'EU Eco-Management and Audit Scheme',
    logo: '/images/certifications/emas.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469.pdf',
    scope: 'Public environmental statement audited under EU EMAS Regulation.',
  },
  {
    name: 'CYS EN ISO 50001:2018',
    description: 'Energy Management System',
    logo: '/images/certifications/iso-50001.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473.pdf',
    scope: 'Continual improvement of energy performance across production sites.',
  },
  {
    name: 'Environmental Declaration 2024',
    description: 'Annual environmental performance report',
    logo: '/images/certifications/environmental-declaration.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-11WmU.pdf',
    scope: 'Annual disclosure of environmental performance, audited and published.',
  },
];

export const greenElyseeCertifications: ContentPage = {
  title: 'Certifications',
  eyebrow: 'Green Elysée',
  subtitle: 'Committed to drive life in a Green future.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée proudly holds internationally recognized certificates, a testimony of commitment to drive life in a Green future, and its efforts to be as Green as it gets in all of its operations.',
    },
    {
      kind: 'paragraph',
      text:
        'Six independently audited standards cover the full Green Elysée programme — environmental management, energy, sustainability of raw materials, greenhouse-gas accounting, and the annual public Environmental Declaration. Every certificate is downloadable below.',
    },
  ],
};
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors (the new `GreenCertification` interface and `greenCertificationItems` export resolve cleanly).

---

## Task 6: Extend `greenElyseeReports` data with report + ebook records

**Files:**
- Modify: `src/data/site-content.ts:441-472`

- [ ] **Step 1: Read the current `greenElyseeReports` export**

Run: `sed -n '441,475p' src/data/site-content.ts`
Expected: Current export with two `heading` + `paragraph` + `list` blocks.

- [ ] **Step 2: Replace with typed reports + ebooks records**

Replace the entire `greenElyseeReports` export with:

```ts
export interface GreenReport {
  title: string;
  section?: string;
  year: string;
  description: string;
  /** Local PNG/JPG cover image in /public. */
  cover: string;
  /** Direct PDF download URL. */
  href: string;
}

export interface GreenEbook {
  title: string;
  year: string;
  description: string;
  /** Bullet contents shown on the ebook card. */
  contents: string[];
  /** Local cover image in /public. */
  cover: string;
  /** Optional link to a dedicated landing page on elysee.com.cy. */
  href?: string;
}

export const greenReportItems: GreenReport[] = [
  {
    title: 'Environmental Report 2024',
    section: '4.6 Green Policy',
    year: '2024',
    description:
      'Our Environmental Report 2024 documents progress against the "4.6 Green Policy" strategic direction — emissions offsetting, energy intensity reductions, and green policy implementation across all Elysée operations.',
    cover: '/images/green-elysee/environmental-report-2024-cover.png',
    href: 'https://elysee.com.cy/pdf/503130/download',
  },
];

export const greenEbookItems: GreenEbook[] = [
  {
    title: 'Green Elysée: Yearly Report 2021',
    year: '2021',
    description:
      'A comprehensive introduction to the Green Elysée pillar and Vision50 — structured around the six strategic components of Pillar 4: Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products & Technologies, and Green Policy.',
    contents: [
      'Introduction to the Green Elysée pillar and Vision50',
      'Carbon Footprint quantification methodology and results',
      'Green Energy renewable-investment progress',
      'Zero Waste: achieving zero-waste-to-landfill and diverting piping waste',
      'Circular Economy philosophy and practical initiatives',
      'Green Circular Products and Technologies development',
      'Green Policy and emissions-offsetting projects',
    ],
    cover: '/images/green-elysee/yearly-report-2021-cover.jpg',
    href: 'https://elysee.com.cy/green-elysee-yearly-report-2021',
  },
];

export const greenElyseeReports: ContentPage = {
  title: 'Reports & eBooks',
  eyebrow: 'Green Elysée',
  subtitle: 'Transparency through our published environmental reports.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée publishes its environmental performance annually. The Environmental Report covers our progress against the six strategic components of Pillar 4 — Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products, and Green Policy.',
    },
  ],
};
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors.

---

## Task 7: Extend `greenElyseeInsightsItems` with the hero article image

**Files:**
- Modify: `src/data/site-content.ts:482-489`

- [ ] **Step 1: Read the current export**

Run: `sed -n '482,490p' src/data/site-content.ts`
Expected: Single-item array — `{ title: 'Our journey to becoming a Green leader', excerpt: '…', href: '/press-room/news/' }`.

- [ ] **Step 2: Replace with the richer record**

Replace the `greenElyseeInsightsItems` export with:

```ts
export const greenElyseeInsightsItems: InsightItem[] = [
  {
    title: 'Our journey to becoming a Green leader',
    excerpt:
      'The circular economy concept aims at reducing waste as much as possible — and, in effect, a product\'s life cycle is extended to the maximum. Our journey from compression fittings in 1979 to a six-pillar Green programme in 2026 is one of constant compounding: every certificate, every audit, every recycled tonne of resin earns the next.',
    image: '/images/green-elysee/journey-to-green-leader.jpg',
    href: '/press-room/news/',
  },
];
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors.

---

## Task 8: Data tests — assert real-world content is preserved

**Files:**
- Create: `src/data/site-content.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/site-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  greenCertificationItems,
  greenReportItems,
  greenEbookItems,
  greenElyseeInsightsItems,
  greenElyseeCertifications,
  greenElyseeReports,
} from './site-content';

describe('Green Elysée data exports', () => {
  it('has 6 certifications, each with a PDF href on elysee.com.cy', () => {
    expect(greenCertificationItems).toHaveLength(6);
    for (const c of greenCertificationItems) {
      expect(c.href).toMatch(/^https:\/\/elysee\.com\.cy\/.*\.pdf$/);
      expect(c.logo).toMatch(/^\/images\/certifications\/.*\.svg$/);
      expect(c.scope?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it('contains the Environmental Report 2024 and its PDF download URL', () => {
    expect(greenReportItems).toHaveLength(1);
    const rep = greenReportItems[0];
    expect(rep.title).toBe('Environmental Report 2024');
    expect(rep.year).toBe('2024');
    expect(rep.href).toBe('https://elysee.com.cy/pdf/503130/download');
    expect(rep.cover).toBe('/images/green-elysee/environmental-report-2024-cover.png');
  });

  it('contains the 2021 Yearly Report ebook with 7 contents bullets', () => {
    expect(greenEbookItems).toHaveLength(1);
    const e = greenEbookItems[0];
    expect(e.title).toBe('Green Elysée: Yearly Report 2021');
    expect(e.contents).toHaveLength(7);
    expect(e.cover).toBe('/images/green-elysee/yearly-report-2021-cover.jpg');
  });

  it('has the journey-to-green-leader insight with hero image', () => {
    expect(greenElyseeInsightsItems).toHaveLength(1);
    expect(greenElyseeInsightsItems[0].image).toBe(
      '/images/green-elysee/journey-to-green-leader.jpg',
    );
  });

  it('keeps the original Certifications + Reports ContentPage titles', () => {
    expect(greenElyseeCertifications.title).toBe('Certifications');
    expect(greenElyseeReports.title).toBe('Reports & eBooks');
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm vitest run src/data/site-content.test.ts`
Expected: PASS (5/5) once Tasks 5–7 are complete.

---

## Task 9: Rebuild `green-elysee/certifications/index.astro`

**Files:**
- Modify: `src/pages/green-elysee/certifications/index.astro` (full replacement)

- [ ] **Step 1: Confirm current contents**

Run: `cat src/pages/green-elysee/certifications/index.astro`
Expected: 60-line PageHero + simple article template using the old inline certifications array — to be fully replaced.

- [ ] **Step 2: Replace with the cinematic implementation**

Write the new file (full content — replaces the file from line 1):

```astro
---
/**
 * Green Elysée — Certifications.
 *
 * URL: /green-elysee/certifications/
 * Source of truth: `greenElyseeCertifications` + `greenCertificationItems`
 * from src/data/site-content.ts.
 *
 * Mirrors the cinematic template established by
 * `/about-us/quality-certifications/`: scroll-progress, parallax hero,
 * sticky sub-nav, stat band, editorial intro with sticky aside + drop-cap,
 * full-bleed cinematic moment, certification grid with stamp-in effect,
 * closing CTA. Motion + GSAP layered, reduced-motion safe.
 */
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Container from '../../../components/Container.astro';
import Section from '../../../components/Section.astro';
import GreenElyseeSubNav from '../../../components/green-elysee/GreenElyseeSubNav.astro';
import {
  greenElyseeCertifications,
  greenCertificationItems,
} from '../../../data/site-content';

const blocks = greenElyseeCertifications.blocks;
const paragraphs = blocks.filter(
  (b): b is Extract<typeof b, { kind: 'paragraph' }> => b.kind === 'paragraph',
);
const [intro1, intro2] = paragraphs;

const desc =
  greenElyseeCertifications.metaDescription ??
  intro1?.text?.slice(0, 160) ??
  greenElyseeCertifications.title;
---
<BaseLayout title={greenElyseeCertifications.title} description={desc} padForHeader={false}>

  <div aria-hidden="true" data-scroll-progress class="fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-50 origin-left pointer-events-none" style="transform: scaleX(0);"></div>

  {/* ===== COVER HERO ===== */}
  <section class="relative min-h-[88vh] flex items-end text-surface overflow-hidden">
    <img
      data-hero-parallax
      src="/images/about/water-flowing.jpg"
      alt="Streaming water — the heart of Elysée's green operations and certified piping systems"
      class="absolute inset-0 w-full h-full object-cover will-change-transform"
    />
    <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/80"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/30"></div>

    <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">
        {greenElyseeCertifications.eyebrow} · Independently audited
      </p>
      <h1 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[0.92] tracking-tight text-surface" style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;">
        Green, by certificate.
      </h1>
      <p data-reveal data-reveal-delay="240" class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        {greenElyseeCertifications.subtitle}
      </p>
      <div data-reveal data-reveal-delay="360" class="mt-14 md:mt-20 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-surface/70">
        <span aria-hidden="true" class="h-px w-12 bg-surface/50"></span>
        <span>Six certified standards</span>
      </div>
    </Container>
  </section>

  <GreenElyseeSubNav currentPath={Astro.url.pathname} />

  {/* ===== STAT BAND ===== */}
  <section class="bg-surface border-b border-ink/10">
    <Container size="xl" class="py-16 md:py-24">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.3em] text-brand-500 mb-10 md:mb-14">The Green programme</p>
      <dl class="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="6" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">6</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Green certifications</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">EU + ISO</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Standard families</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="2024" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">2024</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Latest declaration</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">Annual</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Audit cadence</dt>
        </div>
      </dl>
    </Container>
  </section>

  {/* ===== EDITORIAL INTRO ===== */}
  {intro1 && (
    <Section bg="alt" spacing="lg">
      <Container size="xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <aside class="lg:col-span-4">
            <div class="lg:sticky lg:top-32">
              <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">Why certificates matter</p>
              <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
                Audited, not asserted.
              </h2>
              <div aria-hidden="true" class="mt-8 h-px w-12 bg-brand-500"></div>
              <p data-reveal data-reveal-delay="240" class="mt-6 max-w-xs text-sm text-ink/60 leading-relaxed">
                Every green claim Elysée makes is backed by a third-party audit and a downloadable certificate.
              </p>
            </div>
          </aside>
          <div class="lg:col-span-8 lg:pt-2 space-y-7 md:space-y-8">
            <p
              data-reveal
              data-reveal-delay="160"
              class="text-lg md:text-xl text-ink leading-[1.65]
                     first-letter:font-display first-letter:font-heavy
                     first-letter:text-7xl md:first-letter:text-8xl
                     first-letter:float-left first-letter:mr-3 first-letter:mt-1
                     first-letter:leading-[0.85] first-letter:text-brand-500"
            >
              {intro1.text}
            </p>
            {intro2 && (
              <p data-reveal data-reveal-delay="280" class="text-base md:text-lg text-ink/80 leading-relaxed">{intro2.text}</p>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )}

  {/* ===== CINEMATIC MOMENT ===== */}
  <section class="relative min-h-[55vh] flex items-center text-surface overflow-hidden">
    <img src="/images/about/pipes-warehouse.jpg" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover" />
    <div aria-hidden="true" class="absolute inset-0 bg-ink/65"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/35 mix-blend-multiply"></div>
    <Container size="lg" class="relative py-20 md:py-28 w-full">
      <div class="max-w-4xl mx-auto text-center">
        <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/75 mb-8">As Green as it gets</p>
        <blockquote data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.05] tracking-tight" style="font-size: clamp(2rem, 5vw, 4.5rem);">
          <span aria-hidden="true" class="text-surface/55">&ldquo;</span>Streaming water, streaming life.<span aria-hidden="true" class="text-surface/55">&rdquo;</span>
        </blockquote>
      </div>
    </Container>
  </section>

  {/* ===== CERTIFICATIONS GRID — 6 cards with PDF download links ===== */}
  <Section bg="alt" spacing="lg">
    <Container size="xl">
      <header class="max-w-3xl mb-12 md:mb-16">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">Our Green Certifications</p>
        <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2.25rem, 5.5vw, 4.5rem);">
          Six standards. Six PDFs.
        </h2>
        <p data-reveal data-reveal-delay="240" class="mt-6 md:mt-8 text-base md:text-lg text-ink/70 leading-relaxed">
          Tap any badge below to download the current certificate.
        </p>
      </header>

      <ol data-green-cert-grid class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
        {greenCertificationItems.map((c, i) => (
          <li data-green-cert-card class="group relative bg-surface flex flex-col">
            <span
              aria-hidden="true"
              class="pointer-events-none absolute -top-3 right-3 font-display font-heavy text-brand-500/10 leading-none select-none transition-colors duration-500 group-hover:text-brand-500/30 z-10"
              style="font-size: clamp(4.5rem, 7vw, 7rem);"
            >{String(i + 1).padStart(2, '0')}</span>

            <div class="bg-surface-alt border-b border-ink/10 aspect-[4/3] flex items-center justify-center p-8 md:p-10 overflow-hidden">
              <img
                data-green-cert-badge
                src={c.logo}
                alt={`${c.name} certification badge`}
                width="200"
                height="200"
                loading="lazy"
                decoding="async"
                class="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>

            <div class="relative p-7 md:p-8 flex-1 flex flex-col">
              <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">Cert.{String(i + 1).padStart(2, '0')}</span>
              <h3 class="mt-4 font-display font-heavy leading-tight text-xl md:text-2xl text-ink">{c.name}</h3>
              <p class="mt-1 text-sm text-ink/70 leading-snug">{c.description}</p>
              <div aria-hidden="true" class="mt-5 h-px w-10 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-20"></div>
              {c.scope && <p class="mt-4 text-sm text-ink/70 leading-[1.6] flex-1">{c.scope}</p>}
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-brand-500 transition-colors duration-200 cursor-pointer"
                aria-label={`Download ${c.name} certificate (PDF)`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download PDF</span>
              </a>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  </Section>

  {/* ===== CLOSING CTA ===== */}
  <section class="bg-brand-500/10">
    <Container size="lg" class="py-16 md:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <p data-reveal class="text-base md:text-lg text-ink/80 leading-relaxed">
          Need an older certificate, a tender-ready bundle, or evidence for a specific product family? Our team can prepare it on request.
        </p>
        <a
          data-reveal
          data-reveal-delay="160"
          href="/contact/local/"
          class="group cursor-pointer mt-8 md:mt-10 inline-flex items-center gap-3 px-6 py-3 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
        >
          <span>Request a certificate</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </Container>
  </section>

  {/* ===== motion (scroll bar + hero parallax) ===== */}
  <script>
    import { animate, scroll } from 'motion';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const bar = document.querySelector('[data-scroll-progress]') as HTMLElement | null;
      if (bar) scroll(animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { ease: 'linear' }));
      const heroImg = document.querySelector('[data-hero-parallax]') as HTMLElement | null;
      const heroSection = heroImg?.closest('section') as HTMLElement | null;
      if (heroImg && heroSection) {
        scroll(
          animate(heroImg, { transform: ['translateY(0)', 'translateY(15%)'] }, { ease: 'linear' }),
          { target: heroSection, offset: ['start start', 'end start'] },
        );
      }
    }
  </script>

  {/* ===== GSAP — certification badges stamp-in ===== */}
  <script>
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const grid = document.querySelector('[data-green-cert-grid]');
    if (grid && !reduce) {
      const cards = Array.from(grid.querySelectorAll('[data-green-cert-card]')) as HTMLElement[];
      const badges = Array.from(grid.querySelectorAll('[data-green-cert-badge]')) as HTMLElement[];
      gsap.set(cards,  { y: 32, opacity: 0 });
      gsap.set(badges, { rotate: -8, scale: 0.85, opacity: 0, transformOrigin: '50% 50%' });
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(cards,  { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
          gsap.to(badges, { rotate: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2.4)', stagger: 0.1, delay: 0.15 });
        },
      });
    } else if (grid && reduce) {
      (grid.querySelectorAll('[data-green-cert-card]') as NodeListOf<HTMLElement>).forEach((c) => { c.style.opacity = '1'; c.style.transform = 'none'; });
      (grid.querySelectorAll('[data-green-cert-badge]') as NodeListOf<HTMLElement>).forEach((b) => { b.style.opacity = '1'; b.style.transform = 'none'; });
    }
  </script>
</BaseLayout>
```

- [ ] **Step 3: Build the page and confirm 0 errors**

Run: `pnpm exec astro check`
Expected: 0 errors on the page.

- [ ] **Step 4: Visual smoke test**

Run dev server: `pnpm dev`
Open `http://localhost:4321/green-elysee/certifications/`.
Expected:
- Cover hero with parallax water image and "Green, by certificate." headline.
- Sticky sub-nav with Certifications highlighted in brand-green.
- Stat band shows 6 / EU + ISO / 2024 / Annual.
- Editorial intro paragraph with brand-green drop-cap.
- Cinematic "Streaming water, streaming life." moment.
- 6 certification cards, each with an SVG badge, PDF download icon, and an external link to `elysee.com.cy/uploads/originals/249/*.pdf`.
- Stamp-in animation triggers on scroll. Reduced-motion shows everything static.
- Closing CTA "Request a certificate" links to `/contact/local/`.

---

## Task 10: Rebuild `green-elysee/reports/index.astro`

**Files:**
- Modify: `src/pages/green-elysee/reports/index.astro` (full replacement)

- [ ] **Step 1: Confirm current state**

Run: `cat src/pages/green-elysee/reports/index.astro`
Expected: 5-line `ContentPageLayout` wrapper.

- [ ] **Step 2: Replace with the cinematic implementation**

Write the new file content:

```astro
---
/**
 * Green Elysée — Reports & eBooks.
 *
 * URL: /green-elysee/reports/
 * Source: `greenElyseeReports` + `greenReportItems` + `greenEbookItems`
 * from src/data/site-content.ts.
 *
 * Same cinematic chassis as `/green-elysee/certifications/`. The body
 * splits into two sections — "Annual Report" (one large featured card)
 * and "eBooks" (cover-led card with bulleted contents).
 */
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Container from '../../../components/Container.astro';
import Section from '../../../components/Section.astro';
import GreenElyseeSubNav from '../../../components/green-elysee/GreenElyseeSubNav.astro';
import {
  greenElyseeReports,
  greenReportItems,
  greenEbookItems,
} from '../../../data/site-content';

const intro = greenElyseeReports.blocks.find(
  (b): b is Extract<typeof b, { kind: 'paragraph' }> => b.kind === 'paragraph',
);
const desc =
  greenElyseeReports.metaDescription ??
  intro?.text?.slice(0, 160) ??
  greenElyseeReports.title;
---
<BaseLayout title={greenElyseeReports.title} description={desc} padForHeader={false}>

  <div aria-hidden="true" data-scroll-progress class="fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-50 origin-left pointer-events-none" style="transform: scaleX(0);"></div>

  {/* ===== COVER HERO ===== */}
  <section class="relative min-h-[88vh] flex items-end text-surface overflow-hidden">
    <img
      data-hero-parallax
      src="/images/about/pipes-warehouse.jpg"
      alt="Elysée pipes warehouse — annual environmental reporting covers every product family and operation"
      class="absolute inset-0 w-full h-full object-cover will-change-transform"
    />
    <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/80"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/30"></div>

    <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">
        {greenElyseeReports.eyebrow} · Annual reporting
      </p>
      <h1 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[0.92] tracking-tight text-surface" style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;">
        Reports &amp; eBooks.
      </h1>
      <p data-reveal data-reveal-delay="240" class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        {greenElyseeReports.subtitle}
      </p>
      <div data-reveal data-reveal-delay="360" class="mt-14 md:mt-20 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-surface/70">
        <span aria-hidden="true" class="h-px w-12 bg-surface/50"></span>
        <span>Read the latest disclosures</span>
      </div>
    </Container>
  </section>

  <GreenElyseeSubNav currentPath={Astro.url.pathname} />

  {/* ===== STAT BAND ===== */}
  <section class="bg-surface border-b border-ink/10">
    <Container size="xl" class="py-16 md:py-24">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.3em] text-brand-500 mb-10 md:mb-14">Disclosures at a glance</p>
      <dl class="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="2024" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">2024</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Latest report</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="6" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">6</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Strategic pillars covered</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">PDF</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Free to download</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">Annual</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Publication cadence</dt>
        </div>
      </dl>
    </Container>
  </section>

  {/* ===== EDITORIAL INTRO ===== */}
  {intro && (
    <Section bg="alt" spacing="lg">
      <Container size="xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <aside class="lg:col-span-4">
            <div class="lg:sticky lg:top-32">
              <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">Why we publish</p>
              <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
                Transparency, by document.
              </h2>
              <div aria-hidden="true" class="mt-8 h-px w-12 bg-brand-500"></div>
              <p data-reveal data-reveal-delay="240" class="mt-6 max-w-xs text-sm text-ink/60 leading-relaxed">
                Public reports, downloadable PDFs, year-on-year comparable disclosures.
              </p>
            </div>
          </aside>
          <div class="lg:col-span-8 lg:pt-2 space-y-7 md:space-y-8">
            <p
              data-reveal
              data-reveal-delay="160"
              class="text-lg md:text-xl text-ink leading-[1.65]
                     first-letter:font-display first-letter:font-heavy
                     first-letter:text-7xl md:first-letter:text-8xl
                     first-letter:float-left first-letter:mr-3 first-letter:mt-1
                     first-letter:leading-[0.85] first-letter:text-brand-500"
            >{intro.text}</p>
          </div>
        </div>
      </Container>
    </Section>
  )}

  {/* ===== REPORTS — featured-card list (large cover + meta) ===== */}
  <Section bg="default" spacing="lg">
    <Container size="xl">
      <header class="max-w-3xl mb-12 md:mb-16">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">Environmental Reports</p>
        <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2.25rem, 5.5vw, 4.5rem);">
          The Environmental Report.
        </h2>
      </header>

      <ol data-green-report-grid class="space-y-12 md:space-y-16">
        {greenReportItems.map((r) => (
          <li data-green-report-card class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch group">
            <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`Download ${r.title} (PDF)`} class="md:col-span-5 block bg-surface-alt border border-ink/10 overflow-hidden">
              <img
                src={r.cover}
                alt={`${r.title} — cover image`}
                width="800"
                height="1000"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </a>
            <div class="md:col-span-7 flex flex-col justify-center">
              <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">Report · {r.year}{r.section ? ` · § ${r.section}` : ''}</span>
              <h3 class="mt-4 font-display font-heavy text-3xl md:text-4xl text-ink leading-tight">{r.title}</h3>
              <div aria-hidden="true" class="mt-5 h-px w-12 bg-brand-500"></div>
              <p class="mt-6 text-base md:text-lg text-ink/75 leading-[1.65] max-w-xl">{r.description}</p>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-brand-500 text-surface hover:bg-brand-700 text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200 self-start cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download PDF</span>
              </a>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  </Section>

  {/* ===== EBOOKS — cover + contents list ===== */}
  <Section bg="alt" spacing="lg">
    <Container size="xl">
      <header class="max-w-3xl mb-12 md:mb-16">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">eBooks</p>
        <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2.25rem, 5.5vw, 4.5rem);">
          Yearly Report library.
        </h2>
      </header>

      <ol data-green-ebook-grid class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
        {greenEbookItems.map((e) => (
          <li data-green-ebook-card class="bg-surface flex flex-col md:flex-row group">
            <a href={e.href ?? '#'} target={e.href ? '_blank' : undefined} rel={e.href ? 'noopener noreferrer' : undefined} aria-label={`Read ${e.title}`} class="block md:w-2/5 bg-surface-alt border-b md:border-b-0 md:border-r border-ink/10 aspect-[3/4] md:aspect-auto overflow-hidden">
              <img
                src={e.cover}
                alt={`${e.title} — cover image`}
                width="600"
                height="800"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </a>
            <div class="p-7 md:p-9 flex-1 flex flex-col">
              <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">eBook · {e.year}</span>
              <h3 class="mt-4 font-display font-heavy text-2xl md:text-3xl text-ink leading-tight">{e.title}</h3>
              <div aria-hidden="true" class="mt-4 h-px w-10 bg-brand-500"></div>
              <p class="mt-5 text-sm md:text-base text-ink/75 leading-[1.6]">{e.description}</p>
              <ul class="mt-6 space-y-2 text-sm text-ink/80">
                {e.contents.map((line) => (
                  <li class="flex items-start gap-2">
                    <span aria-hidden="true" class="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0"></span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {e.href && (
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-8 inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.25em] text-ink hover:text-brand-500 transition-colors duration-200 cursor-pointer"
                >
                  <span>Read the report</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Container>
  </Section>

  {/* ===== CLOSING CTA ===== */}
  <section class="bg-brand-500/10">
    <Container size="lg" class="py-16 md:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <p data-reveal class="text-base md:text-lg text-ink/80 leading-relaxed">
          Looking for an older annual report or a specific data series? Our sustainability team can share archived editions on request.
        </p>
        <a
          data-reveal
          data-reveal-delay="160"
          href="/contact/local/"
          class="group cursor-pointer mt-8 md:mt-10 inline-flex items-center gap-3 px-6 py-3 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
        >
          <span>Request an archive copy</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </Container>
  </section>

  {/* ===== motion ===== */}
  <script>
    import { animate, scroll } from 'motion';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const bar = document.querySelector('[data-scroll-progress]') as HTMLElement | null;
      if (bar) scroll(animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { ease: 'linear' }));
      const heroImg = document.querySelector('[data-hero-parallax]') as HTMLElement | null;
      const heroSection = heroImg?.closest('section') as HTMLElement | null;
      if (heroImg && heroSection) {
        scroll(
          animate(heroImg, { transform: ['translateY(0)', 'translateY(15%)'] }, { ease: 'linear' }),
          { target: heroSection, offset: ['start start', 'end start'] },
        );
      }
    }
  </script>

  {/* ===== GSAP — staggered card reveal on the two grids ===== */}
  <script>
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateGrid(selector: string, cardSelector: string) {
      const grid = document.querySelector(selector);
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll(cardSelector)) as HTMLElement[];
      if (cards.length === 0) return;
      if (reduce) {
        cards.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'none'; });
        return;
      }
      gsap.set(cards, { y: 36, opacity: 0 });
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(cards, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 });
        },
      });
    }
    animateGrid('[data-green-report-grid]', '[data-green-report-card]');
    animateGrid('[data-green-ebook-grid]', '[data-green-ebook-card]');
  </script>
</BaseLayout>
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors.

- [ ] **Step 4: Visual smoke test**

Run dev server (if not already running).
Open `http://localhost:4321/green-elysee/reports/`.
Expected:
- Cover hero with parallax pipes-warehouse image and "Reports & eBooks." headline.
- Sub-nav with Reports highlighted.
- Stat band (2024 / 6 / PDF / Annual).
- Editorial intro paragraph with drop-cap.
- "The Environmental Report." section — 5+7 column grid with the 2024 cover image and a brand-green PDF download button → opens `https://elysee.com.cy/pdf/503130/download`.
- "Yearly Report library." section — single ebook card with 2021 cover, description, 7 bulleted contents, "Read the report" link.
- Cards stagger-fade on scroll. Reduced-motion shows static cards.
- Closing CTA "Request an archive copy" → `/contact/local/`.

---

## Task 11: Rebuild `green-elysee/insights/index.astro`

**Files:**
- Modify: `src/pages/green-elysee/insights/index.astro` (full replacement)

- [ ] **Step 1: Confirm current state**

Run: `cat src/pages/green-elysee/insights/index.astro`
Expected: 10-line `ListPageLayout` wrapper.

- [ ] **Step 2: Replace with the cinematic implementation**

Write the new file content:

```astro
---
/**
 * Green Elysée — Insights.
 *
 * URL: /green-elysee/insights/
 * Source: `greenElyseeInsightsItems` from src/data/site-content.ts.
 *
 * Same cinematic chassis. The body presents a single featured article
 * (the published "Our journey to becoming a Green leader" story) as a
 * full-bleed hero card with a "Continue reading" CTA into Press Room.
 * Designed to scale gracefully when more entries are added later — the
 * grid switches from 1 featured card to a featured + tile layout once
 * `greenElyseeInsightsItems.length > 1`.
 */
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Container from '../../../components/Container.astro';
import Section from '../../../components/Section.astro';
import GreenElyseeSubNav from '../../../components/green-elysee/GreenElyseeSubNav.astro';
import { greenElyseeInsightsItems } from '../../../data/site-content';

const [featured, ...rest] = greenElyseeInsightsItems;
const desc =
  featured?.excerpt?.slice(0, 160) ??
  'Stories and articles from the Green Elysée programme — from circular-economy thinking to the people behind the certificates.';
---
<BaseLayout
  title="Insights — Green Elysée"
  description={desc}
  padForHeader={false}
>

  <div aria-hidden="true" data-scroll-progress class="fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-50 origin-left pointer-events-none" style="transform: scaleX(0);"></div>

  {/* ===== COVER HERO ===== */}
  <section class="relative min-h-[88vh] flex items-end text-surface overflow-hidden">
    <img
      data-hero-parallax
      src={featured?.image ?? '/images/about/water-flowing.jpg'}
      alt="Featured Green Elysée insight — stories from the journey to becoming a Green leader"
      class="absolute inset-0 w-full h-full object-cover will-change-transform"
    />
    <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/80"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/30"></div>

    <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">
        Green Elysée · Stories
      </p>
      <h1 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[0.92] tracking-tight text-surface" style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;">
        Insights.
      </h1>
      <p data-reveal data-reveal-delay="240" class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        Stories and articles from our green journey — from circular-economy thinking to the people behind the certificates.
      </p>
      <div data-reveal data-reveal-delay="360" class="mt-14 md:mt-20 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-surface/70">
        <span aria-hidden="true" class="h-px w-12 bg-surface/50"></span>
        <span>From the programme</span>
      </div>
    </Container>
  </section>

  <GreenElyseeSubNav currentPath={Astro.url.pathname} />

  {/* ===== STAT BAND ===== */}
  <section class="bg-surface border-b border-ink/10">
    <Container size="xl" class="py-16 md:py-24">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.3em] text-brand-500 mb-10 md:mb-14">The story so far</p>
      <dl class="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="1979" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">1979</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Journey started</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="6" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">6</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Strategic pillars</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">Circular</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Economy model</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="2029" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">2029</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Vision50 target</dt>
        </div>
      </dl>
    </Container>
  </section>

  {/* ===== EDITORIAL INTRO ===== */}
  <Section bg="alt" spacing="lg">
    <Container size="xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <aside class="lg:col-span-4">
          <div class="lg:sticky lg:top-32">
            <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">Why we tell these stories</p>
            <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
              The people behind the certificates.
            </h2>
            <div aria-hidden="true" class="mt-8 h-px w-12 bg-brand-500"></div>
            <p data-reveal data-reveal-delay="240" class="mt-6 max-w-xs text-sm text-ink/60 leading-relaxed">
              Every audit, every recycled tonne of resin, every Pillar-4 project has a face and a story.
            </p>
          </div>
        </aside>
        <div class="lg:col-span-8 lg:pt-2 space-y-7 md:space-y-8">
          <p
            data-reveal
            data-reveal-delay="160"
            class="text-lg md:text-xl text-ink leading-[1.65]
                   first-letter:font-display first-letter:font-heavy
                   first-letter:text-7xl md:first-letter:text-8xl
                   first-letter:float-left first-letter:mr-3 first-letter:mt-1
                   first-letter:leading-[0.85] first-letter:text-brand-500"
          >Certificates and reports document where we are. Insights tell you how we got here — and where we're going. Read the articles, profiles and field stories that sit behind the Green Elysée programme.</p>
        </div>
      </div>
    </Container>
  </Section>

  {/* ===== FEATURED ARTICLE — full-bleed image card ===== */}
  {featured && (
    <Section bg="default" spacing="lg">
      <Container size="xl">
        <header class="max-w-3xl mb-10 md:mb-12">
          <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">Featured</p>
        </header>

        <article data-green-insight-featured class="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 border border-ink/10 overflow-hidden">
          <a href={featured.href ?? '#'} class="lg:col-span-7 block aspect-[16/10] lg:aspect-auto bg-surface-alt overflow-hidden">
            {featured.image ? (
              <img
                src={featured.image}
                alt={`Featured insight — ${featured.title}`}
                width="1239"
                height="837"
                loading="eager"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div aria-hidden="true" class="w-full h-full bg-brand-500/10"></div>
            )}
          </a>
          <div class="lg:col-span-5 bg-surface p-8 md:p-12 flex flex-col justify-center">
            <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">Article · Green Elysée</span>
            <h3 class="mt-5 font-display font-heavy text-2xl md:text-4xl lg:text-3xl xl:text-4xl text-ink leading-tight">{featured.title}</h3>
            <div aria-hidden="true" class="mt-5 h-px w-12 bg-brand-500"></div>
            {featured.excerpt && (
              <p class="mt-6 text-base md:text-lg text-ink/75 leading-[1.65]">{featured.excerpt}</p>
            )}
            {featured.href && (
              <a
                href={featured.href}
                class="mt-8 inline-flex items-center gap-3 self-start px-6 py-3 bg-brand-500 text-surface hover:bg-brand-700 text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200 cursor-pointer"
              >
                <span>Continue reading</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            )}
          </div>
        </article>
      </Container>
    </Section>
  )}

  {/* ===== MORE STORIES — tile grid (only renders when there are more) ===== */}
  {rest.length > 0 && (
    <Section bg="alt" spacing="lg">
      <Container size="xl">
        <header class="max-w-3xl mb-12 md:mb-16">
          <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">More stories</p>
          <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
            From the Green programme.
          </h2>
        </header>
        <ol data-green-insight-grid class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
          {rest.map((it) => (
            <li data-green-insight-tile class="bg-surface flex flex-col group">
              {it.image && (
                <a href={it.href ?? '#'} class="block aspect-[16/10] bg-surface-alt overflow-hidden border-b border-ink/10">
                  <img src={it.image} alt={`${it.title} — preview`} loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                </a>
              )}
              <div class="p-6 md:p-7 flex-1 flex flex-col">
                {it.date && <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55">{it.date}</span>}
                <h3 class="mt-3 font-display font-heavy text-lg md:text-xl text-ink leading-tight">{it.title}</h3>
                {it.excerpt && <p class="mt-3 text-sm text-ink/70 leading-relaxed flex-1">{it.excerpt}</p>}
                {it.href && (
                  <a href={it.href} class="mt-5 inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.25em] text-ink hover:text-brand-500 transition-colors duration-200 cursor-pointer">
                    <span>Read story</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )}

  {/* ===== CLOSING CTA ===== */}
  <section class="bg-brand-500/10">
    <Container size="lg" class="py-16 md:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <p data-reveal class="text-base md:text-lg text-ink/80 leading-relaxed">
          Have a story idea, or want to feature the Green Elysée programme in your publication? Press inquiries and partnership requests are welcome.
        </p>
        <div data-reveal data-reveal-delay="160" class="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/press-room/news/"
            class="group cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-brand-500 text-surface hover:bg-brand-700 text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
          >
            <span>Browse the Press Room</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a
            href="/contact/local/"
            class="group cursor-pointer inline-flex items-center gap-3 px-6 py-3 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
          >
            <span>Pitch a story</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </Container>
  </section>

  {/* ===== motion ===== */}
  <script>
    import { animate, scroll } from 'motion';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const bar = document.querySelector('[data-scroll-progress]') as HTMLElement | null;
      if (bar) scroll(animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { ease: 'linear' }));
      const heroImg = document.querySelector('[data-hero-parallax]') as HTMLElement | null;
      const heroSection = heroImg?.closest('section') as HTMLElement | null;
      if (heroImg && heroSection) {
        scroll(
          animate(heroImg, { transform: ['translateY(0)', 'translateY(15%)'] }, { ease: 'linear' }),
          { target: heroSection, offset: ['start start', 'end start'] },
        );
      }
    }
  </script>

  {/* ===== GSAP — featured card subtle reveal + tile stagger ===== */}
  <script>
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const featured = document.querySelector('[data-green-insight-featured]') as HTMLElement | null;
    if (featured && !reduce) {
      gsap.set(featured, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: featured,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.to(featured, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      });
    } else if (featured && reduce) {
      featured.style.opacity = '1';
      featured.style.transform = 'none';
    }

    const grid = document.querySelector('[data-green-insight-grid]');
    if (grid) {
      const tiles = Array.from(grid.querySelectorAll('[data-green-insight-tile]')) as HTMLElement[];
      if (tiles.length > 0) {
        if (reduce) {
          tiles.forEach((t) => { t.style.opacity = '1'; t.style.transform = 'none'; });
        } else {
          gsap.set(tiles, { y: 28, opacity: 0 });
          ScrollTrigger.create({
            trigger: grid,
            start: 'top 80%',
            once: true,
            onEnter: () => gsap.to(tiles, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 }),
          });
        }
      }
    }
  </script>
</BaseLayout>
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors.

- [ ] **Step 4: Visual smoke test**

Open `http://localhost:4321/green-elysee/insights/`.
Expected:
- Cover hero uses the `journey-to-green-leader.jpg` image with parallax.
- Sub-nav with Insights highlighted.
- Stat band (1979 / 6 / Circular / 2029).
- Editorial intro with drop-cap.
- Featured article card — left image (Green leader journey), right text panel, "Continue reading" → `/press-room/news/`.
- "More stories" section does NOT render (only 1 insight currently — block guarded by `rest.length > 0`).
- Closing CTA — "Browse the Press Room" + "Pitch a story" buttons.
- Reveal + parallax + reduced-motion all behave correctly.

---

## Task 12: Cross-page smoke test + accessibility sanity

**Files:** none (verification only)

- [ ] **Step 1: Run the full type check**

Run: `pnpm exec astro check`
Expected: 0 errors across the entire project (sub-nav, data, all three pages, tests).

- [ ] **Step 2: Run all vitest suites**

Run: `pnpm vitest run`
Expected: All existing tests still pass + the two new tests added in Tasks 3 and 8 pass (8 new test cases total).

- [ ] **Step 3: Build the production bundle**

Run: `pnpm build`
Expected: build succeeds, no broken-link warnings on the three Green Elysée pages, sitemap entry generated for each.

- [ ] **Step 4: Manual a11y smoke test**

In the browser, walk through `/green-elysee/certifications/`, then `reports/`, then `insights/`:
- Verify `aria-current="page"` on the active sub-nav link.
- Verify all PDF download links have descriptive `aria-label` (e.g. `"Download ISO 14001 certificate (PDF)"`).
- Tab through the page from the top — focus indicator (`outline: 2px solid var(--color-brand-500)`) visible on every link/button.
- Toggle `prefers-reduced-motion` (DevTools → Rendering → Emulate CSS media → reduce); confirm all content renders statically, no flashing or movement.
- Verify the cover hero `<img>` has a non-empty `alt`; the decorative gradient overlays remain `aria-hidden="true"`.

- [ ] **Step 5: Confirm live PDF links resolve**

Pick one PDF per category and click through (in a new tab):
- ISO 14001 → opens `cys-en-iso-14001-eng-P3D42.pdf` (HTTP 200).
- Environmental Report 2024 → opens `https://elysee.com.cy/pdf/503130/download` (HTTP 200).
- Yearly Report 2021 → opens `https://elysee.com.cy/green-elysee-yearly-report-2021` (HTTP 200).

If any link is 404, the live source has moved — leave the link in place but flag it on review (do not bury bad links silently).

---

## Task 13: Review checkpoint — stage for user review, no commit

**Files:** none (review gate)

- [ ] **Step 1: Confirm working tree state**

Run: `git status --short`
Expected: Modified — `src/data/content.ts`, `src/data/site-content.ts`, the three `green-elysee/*/index.astro` pages. New — `src/components/green-elysee/GreenElyseeSubNav.astro`, the two new test files, three new images under `public/images/green-elysee/`.

- [ ] **Step 2: Generate a unified diff for review**

Run: `git diff --stat` and `git diff src/data src/pages/green-elysee src/components/green-elysee`
Expected: Diff is clean and scoped to the files listed above. Nothing in the existing design system files (`global.css`, `tokens.css`, `BaseLayout.astro`, etc.) is touched.

- [ ] **Step 3: Hand the review to the user**

Per the user's standing rule (`feedback_no_commit_until_review`), **do NOT** run `git add`, `git commit`, or `git push`. Instead, report:

> "Green Elysée subpages rebuilt. Modified files staged in working tree. Ready for your review on:
> - `/green-elysee/certifications/`
> - `/green-elysee/reports/`
> - `/green-elysee/insights/`
>
> Tell me whether to commit / amend / discard."

Only after the user approves should any commit happen — and even then, the user dictates the message.

---

## Self-review

**Spec coverage:**
- ✅ Crawl and reconstruct `/certifications-green-elysee-en` → Task 5 (data) + Task 9 (page).
- ✅ Crawl and reconstruct `/reports-ebooks-green-elysee-en` → Task 6 (data) + Task 10 (page).
- ✅ Crawl and reconstruct `/insights-green-elysee-en` → Task 7 (data) + Task 11 (page).
- ✅ Use the live-site text and images → Tasks 4, 5, 6, 7 capture verbatim content and downloaded images.
- ✅ Best-possible UI/UX → cinematic chassis (hero, sub-nav, stat band, editorial intro, cinematic moment, content grid, closing CTA) matches the highest-quality pages already in the codebase; everything respects WCAG focus + reduced-motion.
- ✅ Use motion / framer-motion-style animation principles → `motion` (vanilla JS scroll + animate) handles scroll-progress and hero parallax; GSAP + ScrollTrigger handles staggered card reveals and the stamp-in effect for badges. All animations use `ease-out-quint` / `power3.out` curves with reduced-motion fallbacks.
- ✅ Use `/writing-plans` → this document follows the writing-plans skill (bite-sized tasks, exact code per step, exact commands and expected output).
- ✅ Preserve existing design (per `feedback_preserve_existing_design`) → tokens, layouts, header, footer, and all other pages untouched; only the three stub pages are upgraded.
- ✅ No commits until reviewed (per `feedback_no_commit_until_review`) → Task 13 explicitly gates the commit on user approval.

**Placeholder scan:** No "TBD", "TODO", "implement later", "add appropriate error handling", or "similar to Task N" instances. Every code block is complete and self-contained.

**Type consistency:**
- `GreenCertification`, `GreenReport`, `GreenEbook` interfaces are defined once each in `site-content.ts` (Tasks 5, 6) and consumed unchanged by their respective pages (Tasks 9, 10).
- `greenCertificationItems`, `greenReportItems`, `greenEbookItems`, `greenElyseeInsightsItems` are the only array exports introduced; same names used in tests (Task 8) and in pages (Tasks 9–11).
- `greenElyseeSiblings` defined in Task 1, consumed in Task 2 and tested in Task 3.
- Data-attribute hooks (`data-scroll-progress`, `data-hero-parallax`, `data-green-cert-grid`, `data-green-cert-card`, `data-green-cert-badge`, `data-green-report-grid`, `data-green-report-card`, `data-green-ebook-grid`, `data-green-ebook-card`, `data-green-insight-featured`, `data-green-insight-grid`, `data-green-insight-tile`) are unique per page and referenced consistently between the markup and the `<script>` blocks within the same page.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-green-elysee-cinematic-rebuild.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

**Which approach?**
