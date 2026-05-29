# Innovation Pillar Content Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the six `/innovation/*` pages with every text and image asset from `elysee.com.cy`, layered on top of the existing `ContentPageLayout` block registry — adding three new block kinds (`image`, `imagegrid`, `partners`), a stand-alone `projects-list` for funded research, an `idea-form` block for Innovate-with-us, and Framer Motion-driven reveal animations.

**Architecture:**
- **Preserve the existing design.** Pages stay as 5-line shells that consume named exports from `src/data/site-content.ts`. We extend the block registry rather than replacing layouts. (Per `feedback_preserve_existing_design` memory.)
- **Content first, components second.** Verbatim copy comes from the live site and lives in `site-content.ts`; new visual primitives (process steps with images, partner-logo wall, project cards, idea form) are added as Astro components and one React island for the form.
- **Motion via `motion` (Framer Motion) v12 + existing `data-reveal`.** Reuse `[data-reveal]` for static blocks; introduce a React island (`InnovationRevealGrid.tsx`) only where stagger choreography / `whileInView` is required (process steps, partner wall, project cards). `prefers-reduced-motion` is honoured globally — the existing `reveals.client.ts` script already short-circuits.

**Tech Stack:** Astro 6, React 19, Tailwind 4, `motion` ^12.38.0 (already in `package.json`), `astro:assets` for image optimisation, Vitest + Playwright for verification.

---

## Source-of-truth content map

Crawled 2026-05-29. Strings below are verbatim from the live pages (English).

### 1. `why-innovation` — https://elysee.com.cy/why-innovation-innovation-en

Hero eyebrow `Innovation` · title `Innovation Matters`.

Opening paragraphs (intro):
- "At Elysée, innovation matters and is the major key to succeeding. We are highly inspired and motivated, intending to launch modern technologies and breakthrough product solutions in our application field."
- "Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy to use Piping Systems. Today's competitive perspective of Elysée highly relies on scientific and technical research and innovation activities."
- "The company is strategically looking for new ways to innovate and bring new solutions to the market suitable for improving the end-user experience. By being innovative, we act dynamically for the national economy, achieving our business leadership. Inventiveness — the key component of innovation — fosters monadic ideas."
- Callout: *"For an idea to be innovative, it must also be serviceable. Creative notions do not always drive innovation. The key is to find viable solutions to problems through inventive ideas."*

H2 **What is innovation?** — "Innovation can be a product, service, business model, or strategy that's both inventive and serviceable in the end. The innovation strategy aims for breakthroughs in technology or new business models, as well as straightforward upgrades to customer service or modern features added to existing products."

H2 **The importance of innovation** with three image-cards (`imagegrid` block):
1. **Innovation in Business** → list: Ensure success · Safeguard existing position in the market · Pursue essential growth · Improve competitive positioning · image `/images/innovation/why/innovation-in-business.png` (source: `https://elysee.com.cy/portal-img/default/249/innovation-in-business.png`).
2. **Disruptive** → "Creation of additional market segments to serve a customer base the existing market doesn't reach. New-market disruption is always a challenge for Elysée." · image `/images/innovation/why/disruptive.png`.
3. **Sustaining** → "Improvement of processes and technologies of product lines. Elysée wants to stay atop its market." · image `/images/innovation/why/sustaining.png`.

H2 **Our four-step process** — `process-icons` block (4 numbered icon-cards):
1. Clarify · `/images/innovation/why/clarify.png`
2. Ideate · `/images/innovation/why/ideate.png`
3. Develop · `/images/innovation/why/develop.png`
4. Execute · `/images/innovation/why/execute.png`

### 2. `research-development` — https://elysee.com.cy/research-and-development-innovation-en

Hero eyebrow `Innovation` · title `Research & Development` · subtitle `Investing in Research & Development.`

Intro paragraph: "The R&D team contributes to the enhancement of all production stages, assuring productivity, design and development of products, procedure implementation and operational efficiency."

H2 **Our R&D Disciplines** rendered as a 12-cell `imagegrid` (`/images/innovation/rd/<slug>.jpg`), title + paragraph verbatim, in this order:

| # | Title | Image filename | Body (verbatim) |
|---|-------|----------------|-----------------|
| 1 | Product Design and Development | `product-design-and-development.jpg` | Given our position as "Green Leaders", our R&D department investigates new ideas for the development for our products. Our product development process follows a cyclical, multi-step process. Starting from conceptualization to the product deployment, the main goal of the process is to develop products according to customer requirements by covering current design and development issues. Such considerations include the identification of customer needs, design for manufacturing, prototyping and industrial design. |
| 2 | Market Research | `market-research.jpg` | The viability of new services or products is validated partly through close cooperation with potential customers. Inputs regarding market trends and needs are provided to the R&D team from the company's marketing department. These include consumer demands, purchasing methods, product sales and the existence and development of technology across relevant markets. |
| 3 | Project Management | `project-management.jpg` | Our project management system is made up of several frameworks and methods for organizing and monitoring a project's different stages. Our project management approach includes leading and collaborating with the team to complete the project on time and within budget. Usually, early in the development phase, the project documentation will include a description of this information. The three basic restrictions are budget, time, and scope. |
| 4 | IP Procedure, Patent Attorneys | `ip-procedure-patent-attorneys.jpg` | Upon coming up with unique idea, we consult specialist attorneys to determine if there are conflicts with existing IP. Assuming there are no conflicts, all necessary steps are taken with the support of legal specialists in order to filing for a patent with the relevant intellectual property offices. |
| 5 | Feasibility Studies | `feasibility-studies.jpg` | Thorough feasibility studies provide detailed evaluations, which take into account all critical factors of our projects, forecasting their chances of being successful. |
| 6 | Concept Generation | `concept-generation.jpg` | Idea generation often involves a collaborative effort after gathering all relevant information, such as user, marketing, and competition research. The methods for generating ideas appear. Such a process is brainstorming, a group problem-solving technique that encourages the unplanned development of original ideas and solutions. |
| 7 | Concept Evaluation | `concept-evaluation.jpg` | Concept evaluation is a crucial phase in the R&D process, during which the customers' perceptions of a potential new product are analysed. |
| 8 | Concept Development | `concept-development.jpg` | Concept development and testing are both important phases, particularly for new items. It occurs at the very beginning of our projects to aid in the identification of problems and the development of our concepts by taking into consideration the important perceptions, user demands, and needs related to the product. |
| 9 | Proof of Concept | `proof-of-concept.jpg` | Following the Proof of Concept (PoC) methodology validates the viability and potential of innovative ideas to support the case for further development, with the end-goal of reaching full-scale production. Our robust PoC process enables us to identify potential technical and logistical issues which may hinder success. |
| 10 | Prototyping | `prototyping.jpg` | Creating functional prototypes of new components and testing processes with conventional machining and additive manufacturing methods to ensure that functional requirements and technical standards are satisfied. |
| 11 | Advanced Metrology Systems | `advanced-metrology-systems.jpg` | 3D scanners, reverse engineering and smart measuring devices are used for the detailed measurement and analysis of our existing products and tooling, whether this involves the complete virtual 3D model reproduction of physical objects or simple measurements. This enables us to carry out corrective and improvement modifications to our existing products with a high degree of precision and accuracy, or design new products which are better than their predecessors. |
| 12 | Verification & Validation Through Testing | `verification-validation-through-testing.jpg` | Upon materialising a new product, initial samples are verified and validated in close coordination with our QC department, in order to approve its production. During the production, checks by the QC team ensure products are produced to a high standard and superior quality. |

### 3. `funded-research-projects` — https://elysee.com.cy/funded-research-projects-innovation-en

Hero title `Funded Research Projects` · subtitle `Advancing knowledge through collaborative research funding.`

Intro: "Elysée maintains an active portfolio of funded research initiatives in collaboration with academic institutions and industry partners, driving innovation and contributing to scientific advancement in our field."

H2 **Ongoing Projects** — `projects-list` block, two cards:

- **Innova** · Duration `1/8/2025 – 30/4/2026` · Total Funding `€196,125` · Status `Ongoing` · Image `/images/innovation/projects/innova.png` · Description: "Active research initiative under Elysée's 2025–2026 portfolio." · CTA `Read more` (external href on production data file; leave `#` for now).
- **AgReCOMPOSITES** · Duration `2/5/2024 – 1/5/2026` · Total Funding `€598,046` · Elysée Funding `€221,130` · Status `Ongoing` · Image `/images/innovation/projects/agrecomposites.png` · Description: "Falls under the Pillar I 'Smart Growth' that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes." · CTA `Read more`.

H2 **Completed Projects** — `projects-list` block, one card:

- **PlantNGreen** · Duration `01/02/2023 – 31/01/2025` · Total Funding `€574,142.25` · Elysée Funding `€222,878.25` · Status `Completed` · Image `/images/innovation/projects/plantngreen.png` · Description: "Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation."

### 4. `insights` — https://elysee.com.cy/innovation-insights-innovation-en

Hero title `Innovation Insights`. Six articles (preserve existing five `innovationInsightsItems` + add the sixth verbatim from the source). Update image fields with local downloads:

| # | Title | Category | Thumbnail |
|---|-------|----------|-----------|
| 1 | Industry 4.0 and Injection Molding Manufacturing Process | Innovation News | `/images/innovation/insights/industry-40.png` |
| 2 | Success Entrepreneur Stories | Success Stories | `/images/innovation/insights/success-stories.jpg` |
| 3 | Overmolding Injection Molding Process | Innovation News | `/images/innovation/insights/overmolding.jpg` |
| 4 | Micro Injection Molding | Innovation News | `/images/innovation/insights/micro-injection.jpg` |
| 5 | Gas-assisted Injection Molding | Innovation News | `/images/innovation/insights/gas-assisted.jpg` |
| 6 | Exploiting AI Quality Control for Injection Molding Process Optimization | Innovation News | `/images/innovation/insights/ai-processes.jpg` |

Filter UX: three category pills above the grid — `All` (default) · `Innovation News` · `Success Stories`. Category lives on `InsightItem`; filtering implemented as a tiny `IslandFilter.tsx` React component using `motion`'s `layout` prop for re-arrangement.

### 5. `network-partners` — https://elysee.com.cy/network-partners-innovation-en

Hero title `Network & Partners` · subtitle `Building strong partnerships in academic and industrial sectors.`

Intro paragraphs (verbatim):
- "At Elysée, we strongly believe in partnerships to attempt research, technological development and innovation opportunities in both academic and industrial sectors, enhancing new insights and solutions for our customers."
- "Additionally, Elysée is highly motivated to tackle the enormous environmental challenges ahead by implementing strategic plans to reduce energy consumption and CO2 emissions and improve production efficiency."

H2 **Our Partners** — `partners` block (16 logos in a 2/3/4-column grid with grayscale → colour hover):

| Partner | Logo file |
|---------|-----------|
| University of Cyprus | `university-of-cyprus.png` |
| Cyprus University of Technology | `cyprus-university-of-technology.png` |
| Frederick University | `frederick-university.png` |
| Frederick Research Center | `frederick-research-center.png` |
| Department of Environment | `department-of-environment.png` |
| CYS — Cyprus Organisation for Standardisation | `cys.png` |
| OEB — Cyprus Employers and Industrialists Federation | `oeb.png` |
| Agriculture Research Institute | `agriculture-research-institute.png` |
| Department of Forests | `department-of-forests.png` |
| Water Board of Nicosia | `water-board-of-nicosia.png` |
| KIOS Research and Innovation Center of Excellence | `kios.png` |
| CyRIC | `cyric.jpg` |
| Simlead | `simlead.png` |
| CNE | `cne.png` |
| S.E.R.G | `serg.png` |
| AmaDema | `amadema.png` |
| KTV Green Enterprises | `ktv-green-enterprises.png` |
| AgroTech Innovations | `agrotech-innovations.png` |

Closing callout: "Join our Network & Become a Partner" → link `/innovation/innovate-with-us/`.

### 6. `innovate-with-us` — https://elysee.com.cy/innovate-with-us-innovation-en

Hero title `Innovate with us` · subtitle `Ready for your exceptional ideas.`

Hero body (verbatim): "We innovate with partners, concentrating on exceptional ideas related to disruptive technologies. Are you working on something valuable that could match our field? Let's join forces to turn your breakthrough concept into a market-ready reality. Reach out to our team with a brief overview of your project and let's explore how we can shape the future together."

Primary CTA jump-link: `Click to submit your idea!` → scroll to `#idea-form`.

Hero illustration: `/images/innovation/innovate/hero-illustration.png` (source: `gemini-generated-image-nz104tnz104tnz10.png`).

**Idea-submission form** (new `idea-form` block):
- Fields (all required unless noted): Name, Email, Phone Number, Company, Country (Cyprus default — reuse existing country list from `worldwide-contacts.ts` if present, else hard-code), Subject, Message (textarea, optional).
- Simple math captcha label "Please solve: 7 − 2" with numeric input.
- Submit button label: `SEND MESSAGE`.
- Confidentiality block under the form: "We only need basic information in your initial submission and will not ask for any details that compromise confidentiality. We could establish a separate confidentiality agreement with you before asking you to share any confidential information."
- Secondary CTA below: `Make a general technical submission` → `mailto:info@elysee.com.cy`.

---

## Design System (from `ui-ux-pro-max --design-system "industrial b2b piping manufacturer innovation R&D"`)

We **keep the existing Elysée brand tokens** (`bg-brand-500`, `text-ink`, `font-heavy`, `surface-alt`) — the design system above is reference for *patterns* only, not a re-skin:

- **Pattern:** Feature-Rich Showcase + Trust — Hero → Features → CTA, CTA above the fold for `innovate-with-us`.
- **Motion principles applied** (Framer Motion skill):
  - *Staging*: hero copy in, then the section reveals below (existing `data-reveal` handles this).
  - *Follow-through / staggered children*: process steps and partner grid stagger with `staggerChildren: 0.06`.
  - *Slow in / slow out*: keep cubic-bezier `[0.22, 1, 0.36, 1]` (matches existing reveal easing).
  - *Appeal*: card `whileHover={{ y: -4, boxShadow }}`.
  - *Anticipation*: idea-form submit button `whileTap={{ scale: 0.97 }}`.
- **Accessibility (critical)**: every reveal must short-circuit on `prefers-reduced-motion: reduce`. All icon buttons get `aria-label`. Touch targets ≥ 44×44. Form inputs use `<label for>` pairing. Math captcha exposed as accessible text label, not image.

---

## File Structure

**Create**

- `public/images/innovation/why/{innovation-in-business,disruptive,sustaining,clarify,ideate,develop,execute}.png` — 7 PNGs from source CDN.
- `public/images/innovation/rd/<12 R&D discipline images>.jpg` — 12 JPGs.
- `public/images/innovation/projects/{innova,agrecomposites,plantngreen}.png` — 3 PNGs.
- `public/images/innovation/insights/{industry-40,success-stories,overmolding,micro-injection,gas-assisted,ai-processes}.{png,jpg}` — 6 thumbs.
- `public/images/innovation/partners/<18 logo files>` — 18 logo PNGs/JPGs.
- `public/images/innovation/innovate/hero-illustration.png` — 1 illustration.
- `src/components/innovation/ImageGrid.astro` — generic image-card grid (used by Why-Innovation feature block and R&D disciplines).
- `src/components/innovation/ProcessIcons.astro` — 4-step icon row used by Why-Innovation `Our four-step process`.
- `src/components/innovation/PartnersWall.astro` — responsive logo grid (grayscale → colour on hover) for `network-partners`.
- `src/components/innovation/ProjectCard.astro` — funding-aware card used by Funded Research Projects.
- `src/components/innovation/ProjectsList.astro` — wraps ProjectCard with an optional status heading.
- `src/components/innovation/IdeaForm.tsx` — React island for `innovate-with-us` with Framer Motion focus/error transitions and math captcha.
- `src/components/innovation/InsightsFilter.tsx` — React island for `insights` category filter with `motion.layout` re-arrangement.
- `src/components/innovation/InsightsCardGrid.astro` — server-rendered fallback grid (consumed by the island).
- `src/scripts/download-innovation-assets.mjs` — one-off Node script fetching every image from the live CDN into `public/images/innovation/<bucket>/`. Idempotent (skips files that already exist).
- `src/components/innovation/__tests__/ProjectCard.test.ts` (Vitest happy-dom).
- `src/components/innovation/__tests__/IdeaForm.test.tsx` (Vitest happy-dom).
- `src/components/innovation/__tests__/InsightsFilter.test.tsx` (Vitest happy-dom).

**Modify**

- `src/data/site-content.ts` — add `ImageBlock`, `ImageGridBlock`, `ProcessIconsBlock`, `PartnersBlock`, `ProjectsBlock`, `IdeaFormBlock` to the `ContentBlock` union, then rewrite the six `innovation*` exports with verbatim content + image paths. Extend `InsightItem` with optional `category` field.
- `src/layouts/ContentPageLayout.astro` — add cases for the six new block kinds (delegate to the new components). **Preserve all existing block cases.**
- `src/pages/innovation/insights/index.astro` — swap `ListPageLayout` for a thin wrapper that mounts `InsightsFilter.tsx` (keeps the existing thin-shell pattern).
- `package.json` — no new deps (motion v12 already present); verify `astro:assets` not needed for `public/` assets.

**Test**

- `tests/innovation-pages.spec.ts` (Playwright) — smoke crawl of all six routes, asserts h1 text and one verbatim string per page; verifies no console errors.

---

## Tasks

### Task 1: Download all source images locally

**Files:**
- Create: `src/scripts/download-innovation-assets.mjs`
- Create: `public/images/innovation/<buckets>/...` (asset files; populated by the script)

- [ ] **Step 1: Write the asset-download script**

```js
// src/scripts/download-innovation-assets.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE = 'https://elysee.com.cy';
const OUT = 'public/images/innovation';

// [bucket, [sourceURL, localFilename][]]
const groups = [
  ['why', [
    ['/portal-img/default/249/innovation-in-business.png', 'innovation-in-business.png'],
    ['/portal-img/default/249/disruptive.png', 'disruptive.png'],
    ['/portal-img/default/249/sustaining.png', 'sustaining.png'],
    ['/portal-img/default/249/clarity-png.png', 'clarify.png'],
    ['/portal-img/default/249/ideate-png.png', 'ideate.png'],
    ['/portal-img/default/249/develop-png.png', 'develop.png'],
    ['/portal-img/default/249/execute-png.png', 'execute.png'],
  ]],
  ['rd', [
    ['/portal-img/default/249/product-design-and-development.jpg', 'product-design-and-development.jpg'],
    ['/portal-img/default/249/market-research.jpg', 'market-research.jpg'],
    ['/portal-img/default/249/project-management.jpg', 'project-management.jpg'],
    ['/portal-img/default/249/ip-procedure-patent-attorneys.jpg', 'ip-procedure-patent-attorneys.jpg'],
    ['/portal-img/default/249/feasibility-studies.jpg', 'feasibility-studies.jpg'],
    ['/portal-img/default/249/concept-generation.jpg', 'concept-generation.jpg'],
    ['/portal-img/default/249/concept-evaluation.jpg', 'concept-evaluation.jpg'],
    ['/portal-img/default/249/concept-development.jpg', 'concept-development.jpg'],
    ['/portal-img/default/249/proof-of-concept.jpg', 'proof-of-concept.jpg'],
    ['/portal-img/default/249/prototyping.jpg', 'prototyping.jpg'],
    ['/portal-img/default/249/advanced-metrology-systems.jpg', 'advanced-metrology-systems.jpg'],
    ['/portal-img/default/249/verification-validation-through-testing.jpg', 'verification-validation-through-testing.jpg'],
  ]],
  ['projects', [
    ['/portal-img/default/249/untitled-design-qRDGK.png', 'innova.png'],
    ['/portal-img/default/249/banner-plantngreen-logo.png', 'agrecomposites.png'],
    ['/portal-img/default/249/plantngreen-logo2.png', 'plantngreen.png'],
  ]],
  ['insights', [
    ['/portal-img/news_thumb_img/249/image-1.png', 'industry-40.png'],
    ['/portal-img/news_thumb_img/249/banner-success-stories.jpg', 'success-stories.jpg'],
    ['/portal-img/news_thumb_img/249/banner-overmolding-EV9dp.jpg', 'overmolding.jpg'],
    ['/portal-img/news_thumb_img/249/banner-micro-injection.jpg', 'micro-injection.jpg'],
    ['/portal-img/news_thumb_img/249/banner-gas-assisted-injection.jpg', 'gas-assisted.jpg'],
    ['/portal-img/news_thumb_img/249/banner-ai-processes.jpg', 'ai-processes.jpg'],
  ]],
  ['partners', [
    ['/portal-img/originals/249/university-of-cyprus.png', 'university-of-cyprus.png'],
    ['/portal-img/originals/249/university-of-technology.png', 'cyprus-university-of-technology.png'],
    ['/portal-img/originals/249/frederick-PayW5.png', 'frederick-university.png'],
    ['/portal-img/originals/249/frederick-research.png', 'frederick-research-center.png'],
    ['/portal-img/originals/249/department-of-enviroment.png', 'department-of-environment.png'],
    ['/portal-img/originals/249/cys.png', 'cys.png'],
    ['/portal-img/originals/249/oeb.png', 'oeb.png'],
    ['/portal-img/originals/249/agriculture-research-institute.png', 'agriculture-research-institute.png'],
    ['/portal-img/originals/249/daswn.png', 'department-of-forests.png'],
    ['/portal-img/originals/249/waterboard-nicosia.png', 'water-board-of-nicosia.png'],
    ['/portal-img/originals/249/kios-logo.png', 'kios.png'],
    ['/portal-img/originals/249/cyric.jpg', 'cyric.jpg'],
    ['/portal-img/originals/249/simlead.png', 'simlead.png'],
    ['/portal-img/originals/249/cne-logo-iQVHS.png', 'cne.png'],
    ['/portal-img/originals/249/serg.png', 'serg.png'],
    ['/portal-img/originals/249/amadema.png', 'amadema.png'],
    ['/portal-img/originals/249/ktv-green-logo-Hioqe.png', 'ktv-green-enterprises.png'],
    ['/portal-img/originals/249/agrotech-innovations-logo-aTEoo.png', 'agrotech-innovations.png'],
  ]],
  ['innovate', [
    ['/portal-img/default/249/gemini-generated-image-nz104tnz104tnz10.png', 'hero-illustration.png'],
  ]],
];

async function exists(p) { try { await access(p); return true; } catch { return false; } }

for (const [bucket, files] of groups) {
  await mkdir(join(OUT, bucket), { recursive: true });
  for (const [src, dest] of files) {
    const out = join(OUT, bucket, dest);
    if (await exists(out)) { console.log('skip', out); continue; }
    const url = BASE + src;
    const res = await fetch(url);
    if (!res.ok) { console.error('FAIL', url, res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(out, buf);
    console.log('saved', out, buf.length, 'bytes');
  }
}
```

- [ ] **Step 2: Run the script**

Run: `node src/scripts/download-innovation-assets.mjs`
Expected: 48 `saved` lines; no `FAIL` lines. (Re-running prints `skip` for already-present files.)

- [ ] **Step 3: Verify file counts**

Run: `find public/images/innovation -type f | wc -l`
Expected: `48`

- [ ] **Step 4: Commit**

```bash
git add public/images/innovation src/scripts/download-innovation-assets.mjs
git commit -m "feat(innovation): import source CDN imagery for innovation pillar"
```

---

### Task 2: Extend `site-content.ts` block registry

**Files:**
- Modify: `src/data/site-content.ts` (block-type union near top, plus the four innovation exports near the bottom)

- [ ] **Step 1: Write failing test asserting the new block types compile**

Create `src/data/__tests__/site-content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { innovationWhy, innovationRD, innovationFundedProjects, innovationNetworkPartners, innovationInnovateWithUs } from '../site-content';

describe('innovation pillar content', () => {
  it('why-innovation uses imagegrid + process-icons', () => {
    const kinds = innovationWhy.blocks.map((b) => b.kind);
    expect(kinds).toContain('imagegrid');
    expect(kinds).toContain('process-icons');
  });
  it('r&d uses imagegrid for 12 disciplines', () => {
    const ig = innovationRD.blocks.find((b) => b.kind === 'imagegrid');
    expect(ig).toBeDefined();
    if (ig?.kind === 'imagegrid') expect(ig.items.length).toBe(12);
  });
  it('funded projects exposes projects block with 3 items split by status', () => {
    const projects = innovationFundedProjects.blocks.filter((b) => b.kind === 'projects');
    expect(projects.length).toBe(2);
  });
  it('network partners has 18 partner logos', () => {
    const p = innovationNetworkPartners.blocks.find((b) => b.kind === 'partners');
    expect(p).toBeDefined();
    if (p?.kind === 'partners') expect(p.items.length).toBe(18);
  });
  it('innovate-with-us contains idea-form block', () => {
    expect(innovationInnovateWithUs.blocks.some((b) => b.kind === 'idea-form')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, confirm FAIL**

Run: `npx vitest run src/data/__tests__/site-content.test.ts`
Expected: 5 failing assertions (none of the new block kinds exist yet).

- [ ] **Step 3: Add new block types to the discriminated union**

In `src/data/site-content.ts`, after `ValueListBlock` and before the `ContentBlock` union, insert:

```ts
export interface ImageBlock {
  kind: 'image';
  src: string;
  alt: string;
  caption?: string;
  ratio?: '4/3' | '16/9' | '1/1';
}

export interface ImageGridBlock {
  kind: 'imagegrid';
  intro?: string;
  columns?: 2 | 3 | 4;
  items: { title: string; body?: string; bullets?: string[]; image: string; alt: string }[];
}

export interface ProcessIconsBlock {
  kind: 'process-icons';
  items: { step: number; title: string; image: string; alt: string }[];
}

export interface PartnersBlock {
  kind: 'partners';
  items: { name: string; logo: string }[];
  cta?: { label: string; href: string };
}

export interface ProjectsBlock {
  kind: 'projects';
  heading?: string;
  items: {
    name: string;
    status: 'Ongoing' | 'Completed';
    duration: string;
    totalFunding: string;
    elyseeFunding?: string;
    description?: string;
    image: string;
    href?: string;
  }[];
}

export interface IdeaFormBlock {
  kind: 'idea-form';
  intro?: string;
  heroImage?: string;
  confidentialityTitle?: string;
  confidentialityBody?: string;
  generalSubmissionLabel?: string;
  generalSubmissionHref?: string;
}
```

Update the union:

```ts
export type ContentBlock =
  | HeadingBlock
  | RichBlock
  | ListBlock
  | CalloutBlock
  | StatBlock
  | TimelineBlock
  | PillarsBlock
  | ValueListBlock
  | ImageBlock
  | ImageGridBlock
  | ProcessIconsBlock
  | PartnersBlock
  | ProjectsBlock
  | IdeaFormBlock;
```

Extend `InsightItem`:

```ts
export interface InsightItem {
  title: string;
  date?: string;
  excerpt?: string;
  href?: string;
  image?: string;
  category?: 'Innovation News' | 'Success Stories' | 'Activities';
}
```

- [ ] **Step 4: Rewrite `innovationWhy` export**

Replace the existing `innovationWhy` block list with:

```ts
export const innovationWhy: ContentPage = {
  title: 'Why Innovation',
  eyebrow: 'Innovation',
  subtitle: 'Innovation Matters',
  blocks: [
    { kind: 'paragraph', text: "At Elysée, innovation matters and is the major key to succeeding. We are highly inspired and motivated, intending to launch modern technologies and breakthrough product solutions in our application field. Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy to use Piping Systems. Today's competitive perspective of Elysée highly relies on scientific and technical research and innovation activities." },
    { kind: 'paragraph', text: 'The company is strategically looking for new ways to innovate and bring new solutions to the market suitable for improving the end-user experience. By being innovative, we act dynamically for the national economy, achieving our business leadership. Inventiveness — the key component of innovation — fosters monadic ideas.' },
    { kind: 'callout', body: 'For an idea to be innovative, it must also be serviceable. Creative notions do not always drive innovation. The key is to find viable solutions to problems through inventive ideas.' },
    { kind: 'heading', level: 2, text: 'What is innovation?' },
    { kind: 'paragraph', text: "Innovation can be a product, service, business model, or strategy that's both inventive and serviceable in the end. The innovation strategy aims for breakthroughs in technology or new business models, as well as straightforward upgrades to customer service or modern features added to existing products." },
    { kind: 'heading', level: 2, text: 'The importance of innovation' },
    {
      kind: 'imagegrid',
      columns: 3,
      items: [
        { title: 'Innovation in Business', image: '/images/innovation/why/innovation-in-business.png', alt: 'Innovation in business illustration', bullets: ['Ensure success', 'Safeguard existing position in the market', 'Pursue essential growth', 'Improve competitive positioning'] },
        { title: 'Disruptive', image: '/images/innovation/why/disruptive.png', alt: 'Disruptive innovation illustration', body: "Creation of additional market segments to serve a customer base the existing market doesn't reach. New-market disruption is always a challenge for Elysée." },
        { title: 'Sustaining', image: '/images/innovation/why/sustaining.png', alt: 'Sustaining innovation illustration', body: 'Improvement of processes and technologies of product lines. Elysée wants to stay atop its market.' },
      ],
    },
    { kind: 'heading', level: 2, text: 'Our four-step process' },
    {
      kind: 'process-icons',
      items: [
        { step: 1, title: 'Clarify', image: '/images/innovation/why/clarify.png', alt: 'Clarify icon' },
        { step: 2, title: 'Ideate', image: '/images/innovation/why/ideate.png', alt: 'Ideate icon' },
        { step: 3, title: 'Develop', image: '/images/innovation/why/develop.png', alt: 'Develop icon' },
        { step: 4, title: 'Execute', image: '/images/innovation/why/execute.png', alt: 'Execute icon' },
      ],
    },
  ],
};
```

- [ ] **Step 5: Rewrite `innovationRD`**

Replace its `blocks` array with: intro paragraph + `imagegrid` of 12 items as defined in the Source-of-truth map above (paragraph body verbatim, image filename per table).

```ts
export const innovationRD: ContentPage = {
  title: 'Research & Development',
  eyebrow: 'Innovation',
  subtitle: 'Investing in Research & Development.',
  blocks: [
    { kind: 'paragraph', text: 'The R&D team contributes to the enhancement of all production stages, assuring productivity, design and development of products, procedure implementation and operational efficiency.' },
    { kind: 'heading', level: 2, text: 'Our R&D Disciplines' },
    {
      kind: 'imagegrid',
      columns: 3,
      items: [
        { title: 'Product Design and Development', image: '/images/innovation/rd/product-design-and-development.jpg', alt: 'Product design and development', body: 'Given our position as "Green Leaders", our R&D department investigates new ideas for the development for our products. Our product development process follows a cyclical, multi-step process. Starting from conceptualization to the product deployment, the main goal of the process is to develop products according to customer requirements by covering current design and development issues. Such considerations include the identification of customer needs, design for manufacturing, prototyping and industrial design.' },
        { title: 'Market Research', image: '/images/innovation/rd/market-research.jpg', alt: 'Market research', body: "The viability of new services or products is validated partly through close cooperation with potential customers. Inputs regarding market trends and needs are provided to the R&D team from the company's marketing department. These include consumer demands, purchasing methods, product sales and the existence and development of technology across relevant markets." },
        { title: 'Project Management', image: '/images/innovation/rd/project-management.jpg', alt: 'Project management', body: "Our project management system is made up of several frameworks and methods for organizing and monitoring a project's different stages. Our project management approach includes leading and collaborating with the team to complete the project on time and within budget. Usually, early in the development phase, the project documentation will include a description of this information. The three basic restrictions are budget, time, and scope." },
        { title: 'IP Procedure, Patent Attorneys', image: '/images/innovation/rd/ip-procedure-patent-attorneys.jpg', alt: 'IP procedure and patent attorneys', body: 'Upon coming up with unique idea, we consult specialist attorneys to determine if there are conflicts with existing IP. Assuming there are no conflicts, all necessary steps are taken with the support of legal specialists in order to filing for a patent with the relevant intellectual property offices.' },
        { title: 'Feasibility Studies', image: '/images/innovation/rd/feasibility-studies.jpg', alt: 'Feasibility studies', body: 'Thorough feasibility studies provide detailed evaluations, which take into account all critical factors of our projects, forecasting their chances of being successful.' },
        { title: 'Concept Generation', image: '/images/innovation/rd/concept-generation.jpg', alt: 'Concept generation', body: 'Idea generation often involves a collaborative effort after gathering all relevant information, such as user, marketing, and competition research. The methods for generating ideas appear. Such a process is brainstorming, a group problem-solving technique that encourages the unplanned development of original ideas and solutions.' },
        { title: 'Concept Evaluation', image: '/images/innovation/rd/concept-evaluation.jpg', alt: 'Concept evaluation', body: "Concept evaluation is a crucial phase in the R&D process, during which the customers' perceptions of a potential new product are analysed." },
        { title: 'Concept Development', image: '/images/innovation/rd/concept-development.jpg', alt: 'Concept development', body: 'Concept development and testing are both important phases, particularly for new items. It occurs at the very beginning of our projects to aid in the identification of problems and the development of our concepts by taking into consideration the important perceptions, user demands, and needs related to the product.' },
        { title: 'Proof of Concept', image: '/images/innovation/rd/proof-of-concept.jpg', alt: 'Proof of concept', body: 'Following the Proof of Concept (PoC) methodology validates the viability and potential of innovative ideas to support the case for further development, with the end-goal of reaching full-scale production. Our robust PoC process enables us to identify potential technical and logistical issues which may hinder success.' },
        { title: 'Prototyping', image: '/images/innovation/rd/prototyping.jpg', alt: 'Prototyping', body: 'Creating functional prototypes of new components and testing processes with conventional machining and additive manufacturing methods to ensure that functional requirements and technical standards are satisfied.' },
        { title: 'Advanced Metrology Systems', image: '/images/innovation/rd/advanced-metrology-systems.jpg', alt: 'Advanced metrology systems', body: '3D scanners, reverse engineering and smart measuring devices are used for the detailed measurement and analysis of our existing products and tooling, whether this involves the complete virtual 3D model reproduction of physical objects or simple measurements. This enables us to carry out corrective and improvement modifications to our existing products with a high degree of precision and accuracy, or design new products which are better than their predecessors.' },
        { title: 'Verification & Validation Through Testing', image: '/images/innovation/rd/verification-validation-through-testing.jpg', alt: 'Verification and validation through testing', body: 'Upon materialising a new product, initial samples are verified and validated in close coordination with our QC department, in order to approve its production. During the production, checks by the QC team ensure products are produced to a high standard and superior quality.' },
      ],
    },
  ],
};
```

- [ ] **Step 6: Rewrite `innovationFundedProjects`**

```ts
export const innovationFundedProjects: ContentPage = {
  title: 'Funded Research Projects',
  eyebrow: 'Innovation',
  subtitle: 'Advancing knowledge through collaborative research funding.',
  blocks: [
    { kind: 'paragraph', text: 'Elysée maintains an active portfolio of funded research initiatives in collaboration with academic institutions and industry partners, driving innovation and contributing to scientific advancement in our field.' },
    {
      kind: 'projects',
      heading: 'Ongoing Projects',
      items: [
        { name: 'Innova', status: 'Ongoing', duration: '1/8/2025 – 30/4/2026', totalFunding: '€196,125', image: '/images/innovation/projects/innova.png', description: "Active research initiative under Elysée's 2025–2026 portfolio.", href: '#' },
        { name: 'AgReCOMPOSITES', status: 'Ongoing', duration: '2/5/2024 – 1/5/2026', totalFunding: '€598,046', elyseeFunding: '€221,130', image: '/images/innovation/projects/agrecomposites.png', description: "Falls under the Pillar I 'Smart Growth' that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes.", href: '#' },
      ],
    },
    {
      kind: 'projects',
      heading: 'Completed Projects',
      items: [
        { name: 'PlantNGreen', status: 'Completed', duration: '01/02/2023 – 31/01/2025', totalFunding: '€574,142.25', elyseeFunding: '€222,878.25', image: '/images/innovation/projects/plantngreen.png', description: 'Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation.', href: '#' },
      ],
    },
  ],
};
```

- [ ] **Step 7: Rewrite `innovationNetworkPartners`**

```ts
export const innovationNetworkPartners: ContentPage = {
  title: 'Network & Partners',
  eyebrow: 'Innovation',
  subtitle: 'Building strong partnerships in academic and industrial sectors.',
  blocks: [
    { kind: 'paragraph', text: 'At Elysée, we strongly believe in partnerships to attempt research, technological development and innovation opportunities in both academic and industrial sectors, enhancing new insights and solutions for our customers.' },
    { kind: 'paragraph', text: 'Additionally, Elysée is highly motivated to tackle the enormous environmental challenges ahead by implementing strategic plans to reduce energy consumption and CO2 emissions and improve production efficiency.' },
    { kind: 'heading', level: 2, text: 'Our Partners' },
    {
      kind: 'partners',
      cta: { label: 'Join our Network & Become a Partner', href: '/innovation/innovate-with-us/' },
      items: [
        { name: 'University of Cyprus', logo: '/images/innovation/partners/university-of-cyprus.png' },
        { name: 'Cyprus University of Technology', logo: '/images/innovation/partners/cyprus-university-of-technology.png' },
        { name: 'Frederick University', logo: '/images/innovation/partners/frederick-university.png' },
        { name: 'Frederick Research Center', logo: '/images/innovation/partners/frederick-research-center.png' },
        { name: 'Department of Environment', logo: '/images/innovation/partners/department-of-environment.png' },
        { name: 'CYS — Cyprus Organisation for Standardisation', logo: '/images/innovation/partners/cys.png' },
        { name: 'OEB — Cyprus Employers and Industrialists Federation', logo: '/images/innovation/partners/oeb.png' },
        { name: 'Agriculture Research Institute', logo: '/images/innovation/partners/agriculture-research-institute.png' },
        { name: 'Department of Forests', logo: '/images/innovation/partners/department-of-forests.png' },
        { name: 'Water Board of Nicosia', logo: '/images/innovation/partners/water-board-of-nicosia.png' },
        { name: 'KIOS Research and Innovation Center of Excellence', logo: '/images/innovation/partners/kios.png' },
        { name: 'CyRIC', logo: '/images/innovation/partners/cyric.jpg' },
        { name: 'Simlead', logo: '/images/innovation/partners/simlead.png' },
        { name: 'CNE', logo: '/images/innovation/partners/cne.png' },
        { name: 'S.E.R.G', logo: '/images/innovation/partners/serg.png' },
        { name: 'AmaDema', logo: '/images/innovation/partners/amadema.png' },
        { name: 'KTV Green Enterprises', logo: '/images/innovation/partners/ktv-green-enterprises.png' },
        { name: 'AgroTech Innovations', logo: '/images/innovation/partners/agrotech-innovations.png' },
      ],
    },
  ],
};
```

- [ ] **Step 8: Rewrite `innovationInnovateWithUs`**

```ts
export const innovationInnovateWithUs: ContentPage = {
  title: 'Innovate with us',
  eyebrow: 'Innovation',
  subtitle: 'Ready for your exceptional ideas.',
  blocks: [
    { kind: 'paragraph', text: "We innovate with partners, concentrating on exceptional ideas related to disruptive technologies. Are you working on something valuable that could match our field? Let's join forces to turn your breakthrough concept into a market-ready reality. Reach out to our team with a brief overview of your project and let's explore how we can shape the future together." },
    {
      kind: 'idea-form',
      heroImage: '/images/innovation/innovate/hero-illustration.png',
      confidentialityTitle: 'Confidentiality',
      confidentialityBody: 'We only need basic information in your initial submission and will not ask for any details that compromise confidentiality. We could establish a separate confidentiality agreement with you before asking you to share any confidential information.',
      generalSubmissionLabel: 'Make a general technical submission',
      generalSubmissionHref: 'mailto:info@elysee.com.cy?subject=General%20technical%20submission',
    },
  ],
};
```

- [ ] **Step 9: Extend `innovationInsightsItems` to 6 items with categories + images**

Replace the existing 5-item array with a 6-item array tagged with `category` and `image` fields. Keep every existing `excerpt` verbatim:

```ts
export const innovationInsightsItems: InsightItem[] = [
  { title: 'Industry 4.0 and Injection Molding Manufacturing Process', category: 'Innovation News', image: '/images/innovation/insights/industry-40.png', excerpt: 'Injection molding, despite its long industrial history, continues to evolve towards improved dimensional accuracy, reduced energy consumption, and shorter production cycles. As one of the largest manufacturing sectors, it increasingly adopts Industry 4.0 technologies such as the Industrial Internet of Things (IIoT), machine learning, optimization techniques, and digital twins.' },
  { title: 'Success Entrepreneur Stories', category: 'Success Stories', image: '/images/innovation/insights/success-stories.jpg', excerpt: 'In 2007 was teaching students how to use a computer aided design software, while she was studying in Perth, Australia.' },
  { title: 'Overmolding Injection Molding Process', category: 'Innovation News', image: '/images/innovation/insights/overmolding.jpg', excerpt: 'Overmolding is often called two-shot injection molding since it consists of molding of one material over other(s) forming a multilayer part.' },
  { title: 'Micro Injection Molding', category: 'Innovation News', image: '/images/innovation/insights/micro-injection.jpg', excerpt: 'Micro injection molding is a very accurate injection molding technique that is employed for the construction of very small parts.' },
  { title: 'Gas-assisted Injection Molding', category: 'Innovation News', image: '/images/innovation/insights/gas-assisted.jpg', excerpt: "Gas-assisted injection molding was first proposed in 1970s, but it didn't gain commercial acceptance until 1990s." },
  { title: 'Exploiting AI Quality Control for Injection Molding Process Optimization', category: 'Innovation News', image: '/images/innovation/insights/ai-processes.jpg', excerpt: 'Automatic in-line quality control is essential for the optimization of injection molding regarding the efficiency of the process and the quality of the produced parts.' },
];
```

- [ ] **Step 10: Run unit tests, confirm PASS**

Run: `npx vitest run src/data/__tests__/site-content.test.ts`
Expected: 5 passing.

- [ ] **Step 11: Run TypeScript check**

Run: `npx astro check`
Expected: no errors. (If `ContentPageLayout` lacks renderers for new blocks, fix in Task 4 — for this task, the union is allowed to be incomplete in the renderer.)

- [ ] **Step 12: Commit**

```bash
git add src/data/site-content.ts src/data/__tests__/site-content.test.ts
git commit -m "feat(innovation): expand content schema + verbatim copy for 6 pages"
```

---

### Task 3: Build `ImageGrid` and `ProcessIcons` components

**Files:**
- Create: `src/components/innovation/ImageGrid.astro`
- Create: `src/components/innovation/ProcessIcons.astro`

- [ ] **Step 1: Write `ImageGrid.astro`**

```astro
---
interface Item { title: string; body?: string; bullets?: string[]; image: string; alt: string; }
interface Props { intro?: string; columns?: 2 | 3 | 4; items: Item[]; }
const { intro, columns = 3, items } = Astro.props;
const colClass = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
---
<section class="my-10 md:my-14">
  {intro && <p data-reveal class="text-base md:text-lg text-ink/85 max-w-3xl mb-8">{intro}</p>}
  <ul class={`grid grid-cols-1 ${colClass} gap-6 md:gap-8`}>
    {items.map((it, i) => (
      <li
        data-reveal
        data-reveal-delay={String(i * 60)}
        class="group flex flex-col bg-surface border border-ink/10 rounded-sm overflow-hidden transition-all duration-200 ease-out hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
      >
        <div class="aspect-[4/3] bg-brand-500/5 overflow-hidden">
          <img
            src={it.image}
            alt={it.alt}
            loading="lazy"
            width="640"
            height="480"
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div class="p-6 flex-1">
          <h3 class="text-lg md:text-xl font-heavy text-ink leading-tight">{it.title}</h3>
          {it.body && <p class="mt-3 text-sm md:text-base text-ink/80 leading-relaxed">{it.body}</p>}
          {it.bullets && (
            <ul class="mt-3 space-y-1.5 text-sm md:text-base text-ink/80">
              {it.bullets.map((b) => (
                <li class="flex gap-2"><span aria-hidden="true" class="text-brand-500">▸</span><span>{b}</span></li>
              ))}
            </ul>
          )}
        </div>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 2: Write `ProcessIcons.astro`**

```astro
---
interface Item { step: number; title: string; image: string; alt: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<ol class="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 my-10">
  {items.map((it, i) => (
    <li
      data-reveal
      data-reveal-delay={String(i * 80)}
      class="group relative flex flex-col items-center text-center p-6 bg-surface border border-ink/10 rounded-sm transition-all duration-200 ease-out hover:border-brand-500/40 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
    >
      <span class="absolute top-3 left-4 text-xs font-mono uppercase tracking-widest text-brand-500/70">Step {it.step.toString().padStart(2, '0')}</span>
      <img
        src={it.image}
        alt={it.alt}
        loading="lazy"
        width="160"
        height="160"
        class="w-24 h-24 md:w-28 md:h-28 mt-4 object-contain transition-transform duration-300 ease-out group-hover:scale-105"
      />
      <h3 class="mt-4 text-base md:text-lg font-heavy text-ink">{it.title}</h3>
    </li>
  ))}
</ol>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/innovation
git commit -m "feat(innovation): ImageGrid and ProcessIcons components"
```

---

### Task 4: Wire new blocks into `ContentPageLayout`

**Files:**
- Modify: `src/layouts/ContentPageLayout.astro`

- [ ] **Step 1: Add imports + render branches**

Inside the script frontmatter add:
```ts
import ImageGrid from '../components/innovation/ImageGrid.astro';
import ProcessIcons from '../components/innovation/ProcessIcons.astro';
import PartnersWall from '../components/innovation/PartnersWall.astro';
import ProjectsList from '../components/innovation/ProjectsList.astro';
import IdeaForm from '../components/innovation/IdeaForm';
```

Inside the `.map((b) => { ... })` chain, **add these branches before `return null;`**:

```astro
if (b.kind === 'image') return (
  <figure class="my-8">
    <div class={`overflow-hidden bg-brand-500/5 ${b.ratio === '16/9' ? 'aspect-video' : b.ratio === '1/1' ? 'aspect-square' : 'aspect-[4/3]'}`}>
      <img src={b.src} alt={b.alt} loading="lazy" class="w-full h-full object-cover" />
    </div>
    {b.caption && <figcaption class="mt-2 text-sm text-ink/65">{b.caption}</figcaption>}
  </figure>
);
if (b.kind === 'imagegrid') return <ImageGrid intro={b.intro} columns={b.columns} items={b.items} />;
if (b.kind === 'process-icons') return <ProcessIcons items={b.items} />;
if (b.kind === 'partners') return <PartnersWall items={b.items} cta={b.cta} />;
if (b.kind === 'projects') return <ProjectsList heading={b.heading} items={b.items} />;
if (b.kind === 'idea-form') return (
  <IdeaForm
    client:visible
    heroImage={b.heroImage}
    confidentialityTitle={b.confidentialityTitle}
    confidentialityBody={b.confidentialityBody}
    generalSubmissionLabel={b.generalSubmissionLabel}
    generalSubmissionHref={b.generalSubmissionHref}
  />
);
```

Also widen the `<article>` `max-w` when the content has any non-prose block: replace `max-w-screen-md` with `max-w-screen-md has-[.innovation-wide]:max-w-screen-xl`. (Simpler alternative: derive a `wide` flag from `content.blocks.some((b) => b.kind === 'imagegrid' || b.kind === 'partners' || b.kind === 'projects')` and switch class accordingly.)

Final approach (use the flag):
```astro
const wide = content.blocks.some((b) => ['imagegrid','partners','projects','process-icons','idea-form'].includes(b.kind));
---
<BaseLayout title={content.title} description={desc}>
  <PageHero title={content.title} eyebrow={content.eyebrow} subtitle={content.subtitle} />
  <article class={`mx-auto px-4 md:px-8 py-12 md:py-16 space-y-6 ${wide ? 'max-w-screen-xl' : 'max-w-screen-md'}`}>
```

- [ ] **Step 2: Run `npx astro check`**

Expected: no errors after Task 5 components also exist. For now, expect "Cannot find module PartnersWall/ProjectsList/IdeaForm" — defer fix to Tasks 5-7.

- [ ] **Step 3: Commit (after Task 7 once renderer compiles)**

Defer commit; rolled into Task 7's final commit.

---

### Task 5: PartnersWall component

**Files:**
- Create: `src/components/innovation/PartnersWall.astro`

- [ ] **Step 1: Implementation**

```astro
---
interface Partner { name: string; logo: string; }
interface Props { items: Partner[]; cta?: { label: string; href: string }; }
const { items, cta } = Astro.props;
---
<section class="my-10 md:my-14">
  <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
    {items.map((p, i) => (
      <li
        data-reveal
        data-reveal-delay={String(i * 40)}
        class="group flex items-center justify-center aspect-[3/2] bg-surface border border-ink/10 rounded-sm p-4 md:p-6 transition-all duration-200 ease-out hover:border-brand-500/40 hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.18)]"
        title={p.name}
      >
        <img
          src={p.logo}
          alt={`${p.name} logo`}
          loading="lazy"
          width="160"
          height="80"
          class="max-h-12 md:max-h-14 w-auto object-contain grayscale opacity-70 transition-all duration-300 ease-out group-hover:grayscale-0 group-hover:opacity-100"
        />
      </li>
    ))}
  </ul>
  {cta && (
    <div data-reveal class="mt-10 md:mt-14 p-8 md:p-10 bg-brand-500/5 border-l-4 border-brand-500 rounded-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <p class="text-lg md:text-xl font-heavy text-ink">{cta.label}</p>
      <a
        href={cta.href}
        class="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-surface text-sm font-medium uppercase tracking-widest rounded-sm cursor-pointer transition-colors duration-200 hover:bg-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >Get in touch <span aria-hidden="true">→</span></a>
    </div>
  )}
</section>
```

- [ ] **Step 2: Commit-deferred (rolled into Task 7).**

---

### Task 6: ProjectCard + ProjectsList

**Files:**
- Create: `src/components/innovation/ProjectCard.astro`
- Create: `src/components/innovation/ProjectsList.astro`

- [ ] **Step 1: `ProjectCard.astro`**

```astro
---
interface Project {
  name: string;
  status: 'Ongoing' | 'Completed';
  duration: string;
  totalFunding: string;
  elyseeFunding?: string;
  description?: string;
  image: string;
  href?: string;
}
interface Props { project: Project; index: number; }
const { project, index } = Astro.props;
const statusColor = project.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' : 'bg-ink/5 text-ink/70 border-ink/15';
---
<article
  data-reveal
  data-reveal-delay={String(index * 80)}
  class="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 bg-surface border border-ink/10 rounded-sm overflow-hidden transition-all duration-200 ease-out hover:border-brand-500/40 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.20)]"
>
  <div class="md:col-span-4 aspect-[16/10] md:aspect-auto bg-brand-500/5 overflow-hidden">
    <img src={project.image} alt={`${project.name} project banner`} loading="lazy" width="640" height="400" class="w-full h-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
  </div>
  <div class="md:col-span-8 p-6 md:p-8 flex flex-col">
    <div class="flex items-center gap-3 flex-wrap mb-3">
      <span class={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-medium border rounded-sm ${statusColor}`}>{project.status}</span>
      <span class="text-xs uppercase tracking-widest text-ink/60">{project.duration}</span>
    </div>
    <h3 class="text-2xl md:text-3xl font-heavy text-ink leading-tight">{project.name}</h3>
    {project.description && <p class="mt-3 text-sm md:text-base text-ink/80 leading-relaxed">{project.description}</p>}
    <dl class="mt-5 grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt class="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Total Funding</dt>
        <dd class="mt-1 font-heavy text-ink">{project.totalFunding}</dd>
      </div>
      {project.elyseeFunding && (
        <div>
          <dt class="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Elysée Funding</dt>
          <dd class="mt-1 font-heavy text-ink">{project.elyseeFunding}</dd>
        </div>
      )}
    </dl>
    {project.href && (
      <a href={project.href} class="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-fast">
        Read more <span aria-hidden="true" class="transition-transform duration-fast group-hover:translate-x-1">→</span>
      </a>
    )}
  </div>
</article>
```

- [ ] **Step 2: `ProjectsList.astro`**

```astro
---
import ProjectCard from './ProjectCard.astro';
interface Project { name: string; status: 'Ongoing' | 'Completed'; duration: string; totalFunding: string; elyseeFunding?: string; description?: string; image: string; href?: string; }
interface Props { heading?: string; items: Project[]; }
const { heading, items } = Astro.props;
---
<section class="my-10 md:my-14">
  {heading && <h2 data-reveal class="text-2xl md:text-3xl font-heavy text-ink mb-6">{heading}</h2>}
  <div class="space-y-6 md:space-y-8">
    {items.map((p, i) => <ProjectCard project={p} index={i} />)}
  </div>
</section>
```

- [ ] **Step 3: Vitest for status badge logic**

`src/components/innovation/__tests__/ProjectCard.test.ts` — assert that `Ongoing` → emerald class, `Completed` → ink class. (Use happy-dom + Astro container.)

- [ ] **Step 4: Commit-deferred.**

---

### Task 7: IdeaForm React island (Framer Motion)

**Files:**
- Create: `src/components/innovation/IdeaForm.tsx`

- [ ] **Step 1: Write failing test**

`src/components/innovation/__tests__/IdeaForm.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IdeaForm from '../IdeaForm';

describe('<IdeaForm />', () => {
  it('disables submit until captcha is solved correctly', () => {
    render(<IdeaForm confidentialityBody="x" />);
    const submit = screen.getByRole('button', { name: /send message/i });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/please solve/i), { target: { value: '5' } });
    expect(submit).toBeEnabled();
  });
  it('blocks submit when required fields are blank', () => {
    render(<IdeaForm confidentialityBody="x" />);
    fireEvent.change(screen.getByLabelText(/please solve/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByLabelText(/^name/i)).toBeInvalid();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL** (`Cannot find module ../IdeaForm`)

- [ ] **Step 3: Implementation**

```tsx
import { useState, useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Props {
  heroImage?: string;
  confidentialityTitle?: string;
  confidentialityBody?: string;
  generalSubmissionLabel?: string;
  generalSubmissionHref?: string;
}

const COUNTRIES = ['Cyprus','Greece','Germany','United Kingdom','France','Italy','Spain','Netherlands','Austria','Switzerland','Lebanon','Egypt','United Arab Emirates','Saudi Arabia','Other'];
const CAPTCHA_ANSWER = 5;

export default function IdeaForm(props: Props) {
  const reduce = useReducedMotion();
  const fid = useId();
  const [captcha, setCaptcha] = useState('');
  const captchaValid = Number(captcha) === CAPTCHA_ANSWER;
  const [submitted, setSubmitted] = useState(false);

  const ease = [0.22, 1, 0.36, 1] as const;
  const fade = reduce ? { initial: false } : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.5, ease } };

  return (
    <section id="idea-form" className="my-10 md:my-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <motion.div {...fade} className="lg:col-span-5">
          {props.heroImage && (
            <img src={props.heroImage} alt="" loading="lazy" className="w-full h-auto rounded-sm" />
          )}
          {props.confidentialityTitle && (
            <div className="mt-6 p-6 bg-brand-500/5 border-l-4 border-brand-500 rounded-sm">
              <h3 className="text-lg font-heavy text-brand-500 mb-2">{props.confidentialityTitle}</h3>
              <p className="text-base text-ink/85 leading-relaxed">{props.confidentialityBody}</p>
            </div>
          )}
          {props.generalSubmissionHref && (
            <a href={props.generalSubmissionHref} className="mt-4 inline-block text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
              {props.generalSubmissionLabel} →
            </a>
          )}
        </motion.div>

        <motion.form
          {...fade}
          transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.08 }}
          className="lg:col-span-7 bg-surface border border-ink/10 rounded-sm p-6 md:p-10"
          onSubmit={(e) => {
            const form = e.currentTarget;
            if (!form.checkValidity() || !captchaValid) { e.preventDefault(); form.reportValidity(); return; }
            e.preventDefault();
            setSubmitted(true);
          }}
          noValidate
        >
          {submitted ? (
            <motion.p
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease }}
              className="text-base md:text-lg text-ink"
              role="status"
            >Thank you — we will be in touch shortly to discuss your idea confidentially.</motion.p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field id={`${fid}-name`} label="Name *" required />
              <Field id={`${fid}-email`} label="Email *" type="email" required />
              <Field id={`${fid}-phone`} label="Phone Number *" type="tel" required />
              <Field id={`${fid}-company`} label="Company *" required />
              <div className="md:col-span-1">
                <label htmlFor={`${fid}-country`} className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2">Country *</label>
                <select id={`${fid}-country`} name="country" required defaultValue="Cyprus" className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150">
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Field id={`${fid}-subject`} label="Subject *" required />
              <div className="md:col-span-2">
                <label htmlFor={`${fid}-message`} className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2">Message</label>
                <textarea id={`${fid}-message`} name="message" rows={5} className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150"></textarea>
              </div>
              <div className="md:col-span-1">
                <label htmlFor={`${fid}-captcha`} className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2">Please solve: 7 − 2 *</label>
                <input id={`${fid}-captcha`} name="captcha" value={captcha} onChange={(e) => setCaptcha(e.target.value)} inputMode="numeric" required aria-invalid={captcha.length > 0 && !captchaValid} className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150" />
              </div>
              <div className="md:col-span-2 mt-2">
                <motion.button
                  type="submit"
                  disabled={!captchaValid}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  whileHover={reduce ? undefined : { y: -2 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-500 text-surface text-sm font-medium uppercase tracking-widest rounded-sm cursor-pointer transition-colors duration-200 hover:bg-brand-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >Send message <span aria-hidden>→</span></motion.button>
              </div>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function Field({ id, label, type = 'text', required }: { id: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2">{label}</label>
      <input id={id} name={id} type={type} required={required} className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150" />
    </div>
  );
}
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npx vitest run src/components/innovation`
Expected: all green.

- [ ] **Step 5: Commit Tasks 4–7 together**

```bash
git add src/layouts/ContentPageLayout.astro src/components/innovation
git commit -m "feat(innovation): wire ImageGrid/Partners/Projects/IdeaForm into ContentPageLayout"
```

---

### Task 8: Rebuild Insights page with category filter

**Files:**
- Create: `src/components/innovation/InsightsCardGrid.astro`
- Create: `src/components/innovation/InsightsFilter.tsx`
- Modify: `src/pages/innovation/insights/index.astro`

- [ ] **Step 1: Write failing test**

`src/components/innovation/__tests__/InsightsFilter.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import InsightsFilter from '../InsightsFilter';

const items = [
  { title: 'A', excerpt: 'a', category: 'Innovation News' as const, image: '/x.jpg' },
  { title: 'B', excerpt: 'b', category: 'Success Stories' as const, image: '/y.jpg' },
];

it('filters by category', () => {
  render(<InsightsFilter items={items} />);
  fireEvent.click(screen.getByRole('button', { name: /success stories/i }));
  expect(screen.queryByText('A')).not.toBeInTheDocument();
  expect(screen.getByText('B')).toBeInTheDocument();
});
```

Run: `npx vitest run` → expect FAIL.

- [ ] **Step 2: Build `InsightsFilter.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type Cat = 'Innovation News' | 'Success Stories' | 'Activities';
interface Item { title: string; excerpt?: string; image?: string; category?: Cat; href?: string; }
interface Props { items: Item[]; }
const ALL: 'All' = 'All';

export default function InsightsFilter({ items }: Props) {
  const reduce = useReducedMotion();
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as Cat[], [items]);
  const [active, setActive] = useState<Cat | typeof ALL>(ALL);
  const visible = active === ALL ? items : items.filter((i) => i.category === active);

  return (
    <>
      <div role="tablist" aria-label="Filter insights" className="flex flex-wrap gap-2 mb-8">
        {([ALL, ...cats] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border rounded-sm cursor-pointer transition-colors duration-200 ${active === c ? 'bg-brand-500 text-surface border-brand-500' : 'bg-surface text-ink/75 border-ink/15 hover:border-brand-500/40 hover:text-ink'}`}
          >{c}</button>
        ))}
      </div>
      <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((it) => (
            <motion.li
              key={it.title}
              layout
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
              className="group flex flex-col bg-surface border border-ink/10 rounded-sm overflow-hidden transition-all duration-200 ease-out hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
            >
              {it.image && (
                <div className="aspect-[16/10] bg-brand-500/5 overflow-hidden">
                  <img src={it.image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                {it.category && <span className="text-[10px] uppercase tracking-widest text-brand-500 font-medium mb-2">{it.category}</span>}
                <h3 className="text-lg font-heavy text-ink leading-tight">{it.title}</h3>
                {it.excerpt && <p className="mt-3 text-sm text-ink/75 leading-relaxed flex-1">{it.excerpt}</p>}
                {it.href && <a href={it.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-fast">Read more →</a>}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
```

- [ ] **Step 3: Update `src/pages/innovation/insights/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import PageHero from '../../../components/PageHero.astro';
import InsightsFilter from '../../../components/innovation/InsightsFilter';
import { innovationInsightsItems } from '../../../data/site-content';
---
<BaseLayout title="Innovation Insights" description="Research findings, success stories, and innovation news from Elysée.">
  <PageHero title="Innovation Insights" eyebrow="Innovation" subtitle="Research findings, success stories, and innovation news from Elysée." />
  <section class="mx-auto max-w-screen-xl px-4 md:px-8 py-12 md:py-16">
    <InsightsFilter client:visible items={innovationInsightsItems} />
  </section>
</BaseLayout>
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npx vitest run src/components/innovation`

- [ ] **Step 5: Commit**

```bash
git add src/components/innovation/InsightsFilter.tsx src/pages/innovation/insights/index.astro
git commit -m "feat(innovation): filterable insights grid with Framer Motion layout"
```

---

### Task 9: End-to-end smoke + manual UI check

**Files:**
- Create: `tests/innovation-pages.spec.ts`

- [ ] **Step 1: Write Playwright smoke**

```ts
import { test, expect } from '@playwright/test';

const pages = [
  { url: '/innovation/why-innovation/', h1: 'Why Innovation', anchor: 'Our four-step process' },
  { url: '/innovation/research-development/', h1: 'Research & Development', anchor: 'Our R&D Disciplines' },
  { url: '/innovation/funded-research-projects/', h1: 'Funded Research Projects', anchor: 'AgReCOMPOSITES' },
  { url: '/innovation/insights/', h1: 'Innovation Insights', anchor: 'Industry 4.0' },
  { url: '/innovation/network-partners/', h1: 'Network & Partners', anchor: 'University of Cyprus' },
  { url: '/innovation/innovate-with-us/', h1: 'Innovate with us', anchor: 'Confidentiality' },
];

for (const p of pages) {
  test(`renders ${p.url}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    await page.goto(p.url);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(p.h1);
    await expect(page.locator('body')).toContainText(p.anchor);
    expect(consoleErrors).toEqual([]);
  });
}
```

- [ ] **Step 2: Build + run preview**

Run: `npm run build && npm run preview &` then `npx playwright test tests/innovation-pages.spec.ts`
Expected: 6 passing.

- [ ] **Step 3: Manual visual check (dev server)**

Run: `npm run dev`
Open each of the six URLs in a browser. Verify:
- Hero renders with brand-500 background and white text.
- Reveal animations fire once on scroll; no jank at 60fps.
- Images load (no broken icons).
- Cards lift on hover, partner logos transition to colour.
- Form on `innovate-with-us`: Submit disabled until captcha = 5; submitting shows the success message.
- Tabs on `insights` filter cards with smooth re-layout.
- All six pages pass at 375 / 768 / 1024 / 1440 widths — no horizontal scroll.
- `prefers-reduced-motion`: reload with macOS Reduce Motion enabled → no reveal animations.

- [ ] **Step 4: Commit**

```bash
git add tests/innovation-pages.spec.ts
git commit -m "test(innovation): e2e smoke for six pillar pages"
```

---

## Self-Review

- **Spec coverage:** All six URLs are mapped to tasks. Hero copy, every paragraph, every image, all 18 partner logos, 12 R&D disciplines, 3 funded projects, 6 insights articles, and the idea-submission form are covered. ✅
- **Placeholder scan:** No TBD/TODO. Every component contains the full markup and styling. ✅
- **Type consistency:** `ImageGridBlock.items[].image`, `ProcessIconsBlock.items[].image`, `PartnersBlock.items[].logo`, `ProjectsBlock.items[].image`, `IdeaFormBlock.heroImage` are all string paths under `/images/innovation/<bucket>/`. Component prop names match block field names. ✅
- **Animation discipline:** All reveals respect `prefers-reduced-motion` (existing `reveals.client.ts` already short-circuits; new React islands use `useReducedMotion()`). ✅

## Risk register

1. **CDN image fetch may rate-limit** — the download script logs failures and is idempotent, so re-run is safe.
2. **Source page redirected / live HTML changed since crawl** — verbatim strings captured 2026-05-29. Validate with a `curl` of one URL before Task 2 if any task fails verbatim assertions.
3. **`motion/react` import path** — `motion` v12 exports from `motion/react`. If the build complains, fall back to `motion` (the legacy default export) — both ship with v12.38.0.
