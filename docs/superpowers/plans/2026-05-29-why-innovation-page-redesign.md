# Why Innovation — Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/innovation/why-innovation/` as a cinematic editorial page — full-bleed hero, kinetic manifesto reveal, animated 3-up importance cards, and a scroll-linked 4-step process — replacing the generic `ContentPageLayout` dispatch with a hand-composed Astro page + React (`motion`) islands that apply the Disney 12 animation principles.

**Architecture:** The page file `src/pages/innovation/why-innovation/index.astro` stops delegating to `ContentPageLayout` and instead composes six self-contained sections: `WhyHero` (Astro, parallax + Container/Section conventions), `WhyManifesto` (Astro, drop-cap + brand-accent callout), `WhyDefinition` (React island, line-by-line kinetic reveal with `motion`), `WhyImportance` (React island, 3 image-background cards with stagger-in and hover lift), `WhyProcess` (React island, horizontal stepper with scroll-linked progress line + per-step anticipation/arc easing), and `WhyClosing` (Astro, brand-tinted closing band linking to `/innovation/research-development/` and `/innovation/innovate-with-us/`). The data layer (`innovationWhy` in `src/data/site-content.ts`) is unchanged — each section reads a named selection of its blocks so the single source of truth is preserved.

**Tech Stack:** Astro 6 · React 19 · `motion` v12 (Framer Motion's renamed package, same API) · Tailwind 4 · existing project conventions (`Container`, `Section`, brand tokens `--color-brand-500: #4c6830`, the `data-reveal` IntersectionObserver fade-ins). All `motion` islands gate animations on `prefers-reduced-motion`.

---

## File Structure

- **Modify:** `src/pages/innovation/why-innovation/index.astro` — stop delegating to `ContentPageLayout`; compose the six sections directly, derive named slices of `innovationWhy.blocks` at the top of the frontmatter.
- **Create:** `src/components/innovation/why/WhyHero.astro` — full-bleed parallax hero, eyebrow + headline + sub + scroll cue. Uses the existing `data-reveal` pattern.
- **Create:** `src/components/innovation/why/WhyManifesto.astro` — two-column editorial intro: sticky aside (eyebrow + 2-line summary) + drop-cap prose, then a brand-accent callout with a vertical brand-500 bar.
- **Create:** `src/components/innovation/why/WhyDefinition.tsx` — React island, hydrates with `client:visible`. Splits the "What is innovation?" paragraph into lines and reveals each line with `motion`'s stagger (Disney: timing, slow-in/slow-out, follow-through).
- **Create:** `src/components/innovation/why/WhyImportance.tsx` — React island, `client:visible`. Three image-background cards (Innovation in Business / Disruptive / Sustaining), staggered entrance using `motion`'s `staggerChildren`, hover lift + image scale (Disney: secondary action, appeal).
- **Create:** `src/components/innovation/why/WhyProcess.tsx` — React island, `client:visible`. Horizontal stepper with a brand-500 progress line whose `scaleX` is driven by `motion`'s `useScroll` + `useTransform` (Disney: arc, slow-in/slow-out). Each step badge animates in with `whileInView` and a spring (anticipation + overshoot).
- **Create:** `src/components/innovation/why/WhyClosing.astro` — closing band: small heading + two CTA buttons linking to `/innovation/research-development/` and `/innovation/innovate-with-us/`.
- **Create:** `tests/innovation-why-process-progress.spec.ts` — Playwright spec that asserts the process progress bar's `scaleX` reaches ≥ 0.99 when the section's bottom enters the viewport and is < 0.05 before scroll.
- **Asset note:** All referenced images already live under `public/images/innovation/why/` (verified at plan time: `clarify.png`, `develop.png`, `disruptive.png`, `execute.png`, `ideate.png`, `innovation-in-business.png`, `sustaining.png`). The hero falls back to `src/assets/images/background-6-new.jpg` if no innovation-specific hero asset is added.

---

## Task 1: Scaffold the new section directory + asset confirmation

**Files:**
- Create: `src/components/innovation/why/` (empty directory)

- [ ] **Step 1: Create the directory**

```bash
mkdir -p "src/components/innovation/why"
```

- [ ] **Step 2: Verify all referenced assets exist**

Run:
```bash
ls public/images/innovation/why/{clarify,develop,disruptive,execute,ideate,innovation-in-business,sustaining}.png
```
Expected: all 7 files listed, no `ls: ... No such file` errors.

- [ ] **Step 3: Confirm `motion` is installed**

Run:
```bash
node -e "console.log(require('./package.json').dependencies.motion)"
```
Expected output: a version starting with `^12.`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(innovation): scaffold why-innovation redesign directory"
```

---

## Task 2: Build `WhyHero.astro`

**Files:**
- Create: `src/components/innovation/why/WhyHero.astro`

- [ ] **Step 1: Write the component**

```astro
---
/**
 * Cinematic full-bleed hero for /innovation/why-innovation/.
 * Pattern mirrors the worldwide-contact hero: 88vh image with a vertical
 * gradient overlay, brand-tinted wash, parallax via the existing
 * `data-hero-parallax` hook in BaseLayout's scripts.
 */
import Container from '../../Container.astro';
import heroImg from '../../../assets/images/background-6-new.jpg';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}
const { eyebrow, title, subtitle } = Astro.props;
---
<section class="relative min-h-[88vh] flex items-end text-surface overflow-hidden">
  <img
    data-hero-parallax
    src={heroImg.src}
    alt=""
    aria-hidden="true"
    class="absolute inset-0 w-full h-full object-cover will-change-transform"
  />
  <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/85"></div>
  <div aria-hidden="true" class="absolute inset-0 bg-brand-500/25"></div>

  <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
    {eyebrow && (
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">{eyebrow}</p>
    )}
    <h1
      data-reveal
      data-reveal-delay="120"
      class="font-display font-heavy leading-[0.92] tracking-tight text-surface"
      style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;"
    >
      {title}
    </h1>
    {subtitle && (
      <p data-reveal data-reveal-delay="240" class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        {subtitle}
      </p>
    )}
    <div data-reveal data-reveal-delay="360" class="mt-14 md:mt-20 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-surface/70">
      <span aria-hidden="true" class="h-px w-12 bg-surface/50"></span>
      <span>Scroll to read</span>
    </div>
  </Container>
</section>
```

- [ ] **Step 2: Use it temporarily in the page**

Replace the body of `src/pages/innovation/why-innovation/index.astro` with:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import WhyHero from '../../../components/innovation/why/WhyHero.astro';
import { innovationWhy } from '../../../data/site-content';
---
<BaseLayout title={innovationWhy.title} description={innovationWhy.subtitle ?? ''} padForHeader={false}>
  <WhyHero eyebrow={innovationWhy.eyebrow} title={innovationWhy.title} subtitle={innovationWhy.subtitle} />
</BaseLayout>
```

- [ ] **Step 3: Run the dev server (if not running) and visually verify**

```bash
npm run dev   # if not already running on port 4325
```
Then open `http://localhost:4325/innovation/why-innovation/`.
Expected: full-bleed 88vh hero with the background image, brand-green wash, white headline "Why Innovation", eyebrow "Innovation" above, subtitle "Innovation Matters" below, "Scroll to read" caption at the bottom-left. Headline fades up via `data-reveal`.

- [ ] **Step 4: Run Astro typecheck**

```bash
npx astro check
```
Expected: no new errors; the only error is the pre-existing `3d-globe-demo.tsx` import (do not fix it in this task).

- [ ] **Step 5: Commit**

```bash
git add src/components/innovation/why/WhyHero.astro src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): cinematic hero (replaces ContentPageLayout dispatch)"
```

---

## Task 3: Build `WhyManifesto.astro` (drop-cap intro + callout)

**Files:**
- Create: `src/components/innovation/why/WhyManifesto.astro`
- Modify: `src/pages/innovation/why-innovation/index.astro`

- [ ] **Step 1: Write the component**

```astro
---
/**
 * Editorial intro section for Why Innovation. Mirrors the "One workshop.
 * Sixty-five destinations." pattern from the worldwide contact page:
 * a sticky brand-eyebrow + summary on the left, drop-cap prose on the right,
 * followed by a brand-accent callout.
 */
import Container from '../../Container.astro';
import Section from '../../Section.astro';

interface Props {
  eyebrow?: string;
  heading: string;
  summary?: string;
  paragraphs: string[];
  callout?: string;
}
const { eyebrow = 'Why innovation', heading, summary, paragraphs, callout } = Astro.props;
---
<Section bg="surface" spacing="lg">
  <Container size="xl">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <aside class="lg:col-span-4">
        <div class="lg:sticky lg:top-32">
          <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">{eyebrow}</p>
          <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
            {heading}
          </h2>
          <div aria-hidden="true" class="mt-8 h-px w-12 bg-brand-500"></div>
          {summary && (
            <p data-reveal data-reveal-delay="240" class="mt-6 max-w-xs text-sm text-ink/60 leading-relaxed">{summary}</p>
          )}
        </div>
      </aside>

      <div class="lg:col-span-8 lg:pt-2 space-y-7 md:space-y-8">
        {paragraphs.map((p, i) => (
          <p
            data-reveal
            data-reveal-delay={String(160 + i * 120)}
            class={
              i === 0
                ? "text-lg md:text-xl text-ink leading-[1.65] first-letter:font-display first-letter:font-heavy first-letter:text-7xl md:first-letter:text-8xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.85] first-letter:text-brand-500"
                : "text-base md:text-lg text-ink/80 leading-relaxed"
            }
          >
            {p}
          </p>
        ))}

        {callout && (
          <aside data-reveal data-reveal-delay="500" class="mt-10 md:mt-12 p-6 md:p-8 bg-brand-500/5 border-l-4 border-brand-500">
            <p class="text-base md:text-lg text-ink/90 leading-relaxed italic">{callout}</p>
          </aside>
        )}
      </div>
    </div>
  </Container>
</Section>
```

- [ ] **Step 2: Wire it into the page**

Replace the body of `src/pages/innovation/why-innovation/index.astro` with:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import WhyHero from '../../../components/innovation/why/WhyHero.astro';
import WhyManifesto from '../../../components/innovation/why/WhyManifesto.astro';
import { innovationWhy } from '../../../data/site-content';

const paragraphs = innovationWhy.blocks
  .filter((b): b is Extract<typeof b, { kind: 'paragraph' }> => b.kind === 'paragraph')
  .slice(0, 2)
  .map((b) => b.text);
const callout = innovationWhy.blocks
  .find((b): b is Extract<typeof b, { kind: 'callout' }> => b.kind === 'callout')?.body;
---
<BaseLayout title={innovationWhy.title} description={innovationWhy.subtitle ?? ''} padForHeader={false}>
  <WhyHero eyebrow={innovationWhy.eyebrow} title={innovationWhy.title} subtitle={innovationWhy.subtitle} />
  <WhyManifesto
    eyebrow="Why innovation"
    heading="Innovation is how we stay ahead."
    summary="From R&D bench to factory floor — invention only counts when it ships."
    paragraphs={paragraphs}
    callout={callout}
  />
</BaseLayout>
```

- [ ] **Step 3: Visually verify**

Reload `http://localhost:4325/innovation/why-innovation/`.
Expected: below the hero, a two-column section with sticky aside (eyebrow "WHY INNOVATION", heading "Innovation is how we stay ahead.", brand-500 underline, summary). On the right, the first paragraph starts with a large brand-500 drop-cap; second paragraph in muted ink. Below both columns: a brand-tinted callout box with a vertical brand bar.

- [ ] **Step 4: Commit**

```bash
git add src/components/innovation/why/WhyManifesto.astro src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): editorial manifesto with drop cap + callout"
```

---

## Task 4: Build `WhyDefinition.tsx` (kinetic line reveal)

**Files:**
- Create: `src/components/innovation/why/WhyDefinition.tsx`
- Modify: `src/pages/innovation/why-innovation/index.astro`

This is the first `motion` island. Applies Disney principles: timing (per-line stagger), slow-in/slow-out (custom cubic-bezier), follow-through (each line offset slightly more than the previous).

- [ ] **Step 1: Write a unit test for the line-splitter**

```tsx
// tests/why-definition-split.spec.ts
import { describe, it, expect } from 'vitest';
import { splitIntoLines } from '../src/components/innovation/why/splitLines';

describe('splitIntoLines', () => {
  it('keeps a single short sentence as one line', () => {
    expect(splitIntoLines('Innovation matters.')).toEqual(['Innovation matters.']);
  });
  it('splits on sentence boundaries', () => {
    const result = splitIntoLines('First sentence. Second sentence!');
    expect(result).toEqual(['First sentence.', 'Second sentence!']);
  });
  it('groups very short fragments with their neighbour', () => {
    const result = splitIntoLines('A. B. This is a longer sentence.');
    expect(result.length).toBeLessThan(3);
    expect(result.join(' ')).toBe('A. B. This is a longer sentence.');
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

```bash
npx vitest run tests/why-definition-split.spec.ts
```
Expected: FAIL — `Cannot find module '...splitLines'`.

- [ ] **Step 3: Implement the helper**

Create `src/components/innovation/why/splitLines.ts`:

```ts
/**
 * Splits a paragraph into "lines" for kinetic reveal — one sentence per line,
 * with very short fragments (< 12 chars) merged into the next sentence so the
 * stagger animation doesn't read as choppy.
 */
export function splitIntoLines(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].length < 12 && i + 1 < raw.length) {
      raw[i + 1] = `${raw[i]} ${raw[i + 1]}`;
    } else {
      out.push(raw[i]);
    }
  }
  return out.length ? out : [text];
}
```

- [ ] **Step 4: Re-run the test and watch it pass**

```bash
npx vitest run tests/why-definition-split.spec.ts
```
Expected: PASS (3 specs).

- [ ] **Step 5: Write the React component**

Create `src/components/innovation/why/WhyDefinition.tsx`:

```tsx
'use client';
import { motion, useReducedMotion } from 'motion/react';
import { splitIntoLines } from './splitLines';

interface Props {
  /** Section eyebrow (e.g. "Definition"). */
  eyebrow?: string;
  /** Section heading (e.g. "What is innovation?"). */
  heading: string;
  /** The paragraph that gets line-by-line revealed. */
  body: string;
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const line = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export default function WhyDefinition({ eyebrow = 'Definition', heading, body }: Props) {
  const reduce = useReducedMotion();
  const lines = splitIntoLines(body);

  return (
    <section className="bg-surface-alt">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-20 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">{eyebrow}</p>
        <h2 className="font-display font-heavy leading-[1.02] tracking-tight text-ink mb-10 md:mb-14" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
          {heading}
        </h2>
        <motion.p
          variants={reduce ? undefined : container}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-ink leading-[1.45] max-w-4xl"
        >
          {lines.map((l, i) => (
            <motion.span key={i} variants={reduce ? undefined : line} className="block">
              {l}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Wire it into the page**

Add the import and the slot in `src/pages/innovation/why-innovation/index.astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import WhyHero from '../../../components/innovation/why/WhyHero.astro';
import WhyManifesto from '../../../components/innovation/why/WhyManifesto.astro';
import WhyDefinition from '../../../components/innovation/why/WhyDefinition.tsx';
import { innovationWhy } from '../../../data/site-content';

const paragraphs = innovationWhy.blocks
  .filter((b): b is Extract<typeof b, { kind: 'paragraph' }> => b.kind === 'paragraph');
const callout = innovationWhy.blocks
  .find((b): b is Extract<typeof b, { kind: 'callout' }> => b.kind === 'callout')?.body;

// The "What is innovation?" heading is the first H2 in the block list; the
// paragraph immediately after it is the definition body.
const definitionHeadingIdx = innovationWhy.blocks.findIndex((b) => b.kind === 'heading' && b.text === 'What is innovation?');
const definitionBody = (innovationWhy.blocks[definitionHeadingIdx + 1] as { kind: 'paragraph'; text: string } | undefined)?.text ?? '';
---
<BaseLayout title={innovationWhy.title} description={innovationWhy.subtitle ?? ''} padForHeader={false}>
  <WhyHero eyebrow={innovationWhy.eyebrow} title={innovationWhy.title} subtitle={innovationWhy.subtitle} />
  <WhyManifesto
    eyebrow="Why innovation"
    heading="Innovation is how we stay ahead."
    summary="From R&D bench to factory floor — invention only counts when it ships."
    paragraphs={paragraphs.slice(0, 2).map((b) => b.text)}
    callout={callout}
  />
  <WhyDefinition client:visible heading="What is innovation?" body={definitionBody} />
</BaseLayout>
```

- [ ] **Step 7: Visually verify**

Reload the page; scroll until the "What is innovation?" panel comes into view.
Expected: each sentence of the definition fades up + un-blurs in sequence (~0.12s apart). With OS "Reduce motion" on, all lines render at once with no transform.

- [ ] **Step 8: Commit**

```bash
git add src/components/innovation/why/WhyDefinition.tsx src/components/innovation/why/splitLines.ts tests/why-definition-split.spec.ts src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): kinetic line-by-line definition reveal"
```

---

## Task 5: Build `WhyImportance.tsx` (3-card stagger + hover lift)

**Files:**
- Create: `src/components/innovation/why/WhyImportance.tsx`
- Modify: `src/pages/innovation/why-innovation/index.astro`

Applies Disney principles: staging (cards entering one at a time draws focus to each in turn), secondary action (image scales on hover while card lifts), appeal (subtle shadow + color shift).

- [ ] **Step 1: Write the component**

Create `src/components/innovation/why/WhyImportance.tsx`:

```tsx
'use client';
import { motion, useReducedMotion } from 'motion/react';

interface ImportanceItem {
  title: string;
  image: string;
  alt: string;
  /** Bullet list (used for "Innovation in Business"). */
  bullets?: string[];
  /** Paragraph body (used for "Disruptive" / "Sustaining"). */
  body?: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  items: ImportanceItem[];
}

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 22 },
  },
};

export default function WhyImportance({ eyebrow = 'Importance', heading, items }: Props) {
  const reduce = useReducedMotion();
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-20 md:py-28">
        <header className="max-w-3xl mb-12 md:mb-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">{eyebrow}</p>
          <h2 className="font-display font-heavy leading-[1.02] tracking-tight text-ink" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
            {heading}
          </h2>
        </header>

        <motion.ol
          variants={reduce ? undefined : grid}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 list-none"
        >
          {items.map((it, i) => (
            <motion.li
              key={it.title}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative bg-surface-alt overflow-hidden cursor-default"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                <motion.img
                  src={it.image}
                  alt={it.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={reduce ? undefined : { scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                />
                <span aria-hidden="true" className="absolute top-4 left-4 inline-flex items-center justify-center h-7 min-w-7 px-2 bg-brand-500 text-surface text-[10px] uppercase tracking-[0.25em] font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-6 md:p-7">
                <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{it.title}</h3>
                <div aria-hidden="true" className="mt-3 h-px w-10 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-20" />
                {it.bullets && (
                  <ul className="mt-5 space-y-2 text-sm md:text-base text-ink/75">
                    {it.bullets.map((b) => (
                      <li key={b} className="flex gap-2 leading-relaxed">
                        <span aria-hidden="true" className="text-brand-500">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {it.body && (
                  <p className="mt-5 text-sm md:text-base text-ink/75 leading-relaxed">{it.body}</p>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the page**

In `src/pages/innovation/why-innovation/index.astro`, add the import + extract items:

```astro
import WhyImportance from '../../../components/innovation/why/WhyImportance.tsx';
// ... existing extractors ...
const importanceBlock = innovationWhy.blocks
  .find((b): b is Extract<typeof b, { kind: 'imagegrid' }> => b.kind === 'imagegrid');
```

And below `<WhyDefinition .../>`:

```astro
{importanceBlock && (
  <WhyImportance
    client:visible
    heading="The importance of innovation"
    items={importanceBlock.items}
  />
)}
```

- [ ] **Step 3: Visually verify**

Reload, scroll to "The importance of innovation".
Expected: three cards (Innovation in Business with 4 bullets, Disruptive with a body paragraph, Sustaining with a body paragraph) enter with a soft spring stagger (~180ms apart). On hover, each card lifts 6 px and its image scales to 1.05; the brand underline widens from 40 px → 80 px.

- [ ] **Step 4: Commit**

```bash
git add src/components/innovation/why/WhyImportance.tsx src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): three-up importance cards with stagger + hover lift"
```

---

## Task 6: Build `WhyProcess.tsx` (scroll-linked stepper)

**Files:**
- Create: `src/components/innovation/why/WhyProcess.tsx`
- Modify: `src/pages/innovation/why-innovation/index.astro`

Disney principles: arc (the progress line traces a horizontal arc as the user scrolls), slow-in/slow-out (the `useTransform` clamps both ends), anticipation (each step badge scales down briefly before scaling up to its rest state), staging (only one badge is "current" — the one the progress line has just reached).

- [ ] **Step 1: Write the component**

Create `src/components/innovation/why/WhyProcess.tsx`:

```tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

interface Step {
  step: number;
  title: string;
  image: string;
  alt: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  items: Step[];
}

const badgeVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 18 },
  },
};

export default function WhyProcess({ eyebrow = 'Process', heading, items }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 30%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} data-testid="why-process" className="bg-surface-alt">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-20 md:py-28">
        <header className="max-w-3xl mb-14 md:mb-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">{eyebrow}</p>
          <h2 className="font-display font-heavy leading-[1.02] tracking-tight text-ink" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
            {heading}
          </h2>
        </header>

        <div className="relative">
          {/* Progress track */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-10 md:top-12 h-px bg-ink/10" />
          {/* Filled progress line — scaled by scroll */}
          <motion.div
            aria-hidden="true"
            data-testid="why-process-progress"
            className="absolute left-0 right-0 top-10 md:top-12 h-[2px] bg-brand-500 origin-left"
            style={{ scaleX: reduce ? 1 : lineScale }}
          />

          <ol className="relative grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-y-0 gap-x-6 list-none">
            {items.map((s, i) => (
              <li key={s.step} className="flex flex-col items-center text-center">
                <motion.div
                  variants={reduce ? undefined : badgeVariants}
                  initial={reduce ? undefined : 'hidden'}
                  whileInView={reduce ? undefined : 'show'}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ delay: reduce ? 0 : i * 0.08 }}
                  className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-surface ring-2 ring-brand-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <img src={s.image} alt={s.alt} className="w-12 h-12 md:w-14 md:h-14 object-contain" loading="lazy" />
                </motion.div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-brand-500 font-medium">
                  Step {String(s.step).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-display font-heavy text-xl md:text-2xl text-ink">{s.title}</h3>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the page**

Add the import + slot:

```astro
import WhyProcess from '../../../components/innovation/why/WhyProcess.tsx';
// ...
const processBlock = innovationWhy.blocks
  .find((b): b is Extract<typeof b, { kind: 'process-icons' }> => b.kind === 'process-icons');
```

Below `<WhyImportance .../>`:

```astro
{processBlock && (
  <WhyProcess
    client:visible
    heading="Our four-step process"
    items={processBlock.items}
  />
)}
```

- [ ] **Step 3: Write the Playwright spec**

Create `tests/innovation-why-process-progress.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('process progress line fills as the section enters the viewport', async ({ page }) => {
  await page.goto('/innovation/why-innovation/');

  // Find the stepper.
  const stepper = page.getByTestId('why-process');
  const progress = page.getByTestId('why-process-progress');

  // Scroll the stepper just into view from below. The fill should still be near zero.
  await stepper.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(100);

  const scaleXEarly = await progress.evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return m.a; // scaleX
  });
  expect(scaleXEarly).toBeLessThan(0.35);

  // Scroll well past the section. Fill should be ~1.
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
  await page.waitForTimeout(150);

  const scaleXLate = await progress.evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return m.a;
  });
  expect(scaleXLate).toBeGreaterThan(0.95);
});
```

- [ ] **Step 4: Run the spec**

```bash
npx playwright test tests/innovation-why-process-progress.spec.ts
```
Expected: PASS. If it fails because the dev server isn't running, start it (`npm run dev`) and re-run.

- [ ] **Step 5: Visually verify**

Reload the page, scroll slowly through the stepper. The brand-500 line under the four step badges should fill from left to right in sync with the scroll. Each badge pops in with a brief overshoot (anticipation).

- [ ] **Step 6: Commit**

```bash
git add src/components/innovation/why/WhyProcess.tsx tests/innovation-why-process-progress.spec.ts src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): scroll-linked four-step process with progress line"
```

---

## Task 7: Build `WhyClosing.astro` and finalise the page

**Files:**
- Create: `src/components/innovation/why/WhyClosing.astro`
- Modify: `src/pages/innovation/why-innovation/index.astro`

- [ ] **Step 1: Write the component**

```astro
---
/**
 * Closing band for /innovation/why-innovation/ — invites the reader to
 * either dive deeper into R&D or submit an idea.
 */
import Container from '../../Container.astro';
---
<section class="bg-brand-500/8">
  <Container size="lg" class="py-16 md:py-20">
    <div class="mx-auto max-w-2xl text-center">
      <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">Keep going</p>
      <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-tight tracking-tight text-ink" style="font-size: clamp(1.5rem, 3.5vw, 2.5rem);">
        See how the process plays out in the lab — or bring us your idea.
      </h2>
      <div data-reveal data-reveal-delay="240" class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="/innovation/research-development/" class="inline-flex items-center justify-center gap-2 bg-brand-500 text-surface px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200">
          Visit R&amp;D
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
        <a href="/innovation/innovate-with-us/" class="inline-flex items-center justify-center gap-2 border border-ink/30 text-ink px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-ink hover:text-surface hover:border-ink transition-colors duration-200">
          Submit an idea
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </Container>
</section>
```

- [ ] **Step 2: Add it to the page**

Below `<WhyProcess .../>`:

```astro
<WhyClosing />
```

And add the import line in the frontmatter:

```astro
import WhyClosing from '../../../components/innovation/why/WhyClosing.astro';
```

- [ ] **Step 3: Verify CTA targets exist (interlinking)**

```bash
for u in /innovation/research-development/ /innovation/innovate-with-us/; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4325$u");
  echo "  $code  $u";
done
```
Expected: both lines say `200`.

- [ ] **Step 4: Commit**

```bash
git add src/components/innovation/why/WhyClosing.astro src/pages/innovation/why-innovation/index.astro
git commit -m "feat(innovation/why): closing CTA band linking R&D + Innovate with us"
```

---

## Task 8: Full-page polish & sweep

**Files:**
- Modify: `src/pages/innovation/why-innovation/index.astro` (only if minor fixes surface)

- [ ] **Step 1: Run Astro typecheck**

```bash
npx astro check
```
Expected: zero new errors. The pre-existing `3d-globe-demo.tsx` error is the only allowed regression.

- [ ] **Step 2: Run all vitest specs**

```bash
npx vitest run
```
Expected: PASS (the new `splitLines` spec plus any existing ones).

- [ ] **Step 3: Run the Playwright spec for this page**

```bash
npx playwright test tests/innovation-why-process-progress.spec.ts
```
Expected: PASS.

- [ ] **Step 4: Capture before/after desktop screenshots for the record**

```bash
# Take a full-page screenshot at 1440×900 via the Playwright MCP browser OR a one-off Playwright script.
# Save as: docs/superpowers/plans/screenshots/why-innovation-after.png
mkdir -p docs/superpowers/plans/screenshots
```

Use a quick Playwright capture script (paste into a temp file `scripts/_capture.mjs`, then delete):

```mjs
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4325/innovation/why-innovation/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'docs/superpowers/plans/screenshots/why-innovation-after.png', fullPage: true });
await browser.close();
```

Run:
```bash
node scripts/_capture.mjs && rm scripts/_capture.mjs
```

- [ ] **Step 5: Mobile screenshot (375 × 812)**

Same as Step 4 but with `viewport: { width: 375, height: 812 }` and filename `why-innovation-after-mobile.png`.

- [ ] **Step 6: A11y sanity check**

Tab through the page from the top — focus rings must be visible on every link/button (`focus-visible:ring-brand-500` is the project default; the new CTAs in `WhyClosing` use the same patterns).

Set the OS-level "Reduce motion" preference and reload. Confirm:
- `WhyDefinition` lines appear instantly, no fade/blur.
- `WhyImportance` cards appear instantly, no spring.
- `WhyProcess` progress line is fully filled (`scaleX: 1`) and step badges are immediately at rest.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/plans/screenshots/
git commit -m "docs(innovation/why): capture after-redesign reference screenshots"
```

---

## Self-Review (done at plan time)

1. **Spec coverage:**
   - Hero ✓ (Task 2)
   - Intro paragraphs + callout ✓ (Task 3)
   - "What is innovation?" ✓ (Task 4)
   - "The importance of innovation" 3-up ✓ (Task 5)
   - "Our four-step process" 4-up ✓ (Task 6)
   - Closing CTA (new — adds onward navigation that the current `ContentPageLayout` doesn't surface) ✓ (Task 7)

2. **Placeholder scan:** No `TBD` / `TODO` / "add appropriate" / "similar to" — every step has the exact code or command it needs.

3. **Type consistency:**
   - `splitIntoLines(text: string): string[]` defined Task 4 step 3, used Task 4 step 5.
   - `Props.heading: string` consistently spelled `heading` across `WhyDefinition`, `WhyImportance`, `WhyProcess`.
   - `ImportanceItem` matches the existing `imagegrid` block shape in `src/data/site-content.ts` (`title`, `image`, `alt`, `bullets?`, `body?`).
   - `Step` matches the `process-icons` block shape (`step: number`, `title`, `image`, `alt`).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-why-innovation-page-redesign.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session using `superpowers:executing-plans`, batching with checkpoints for review.

**Which approach?**
