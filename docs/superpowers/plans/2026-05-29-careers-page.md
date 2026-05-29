# Careers Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **User preference (memory):** NO `git commit` / `git push` is performed until the user explicitly reviews and approves. Treat every "Commit" step as **stage only** — run `git add` if useful, but **skip the commit** until the user OKs the diff. Steps are kept for symmetry with the standard plan template.

**Goal:** Add a sixth entry — **Careers** — to the Contact Us pillar (mega-menu card, footer column, primary nav, contact sub-nav) and ship `/contact/careers/` as a new sub-page that matches the existing PRIME / WISE / Rohrsysteme cinematic template one-for-one.

**Architecture:** Content lives in `src/data/site-content.ts` as a new `contactCareers: ContentPage` export, identical in shape to `subBrandPrime` / `subBrandWise` / `subBrandRohrsysteme` (eyebrow + title + subtitle + paragraph blocks + `Get in touch` callout). The page at `src/pages/contact/careers/index.astro` is a structural twin of `prime/index.astro` (cover hero with parallax → `ContactSubNav` → stat band → about → cinematic moment → contact card → closing CTA). Nav surfaces — `src/data/navigation.ts` (megaNav, primaryNav, footerNav) and `src/data/content.ts` (`contactSiblings`) — gain one Careers entry each. The mega-menu card reuses `/images/about/engineers-meeting.jpg` (already verified to exist) so the Contact Us dropdown stays photo-uniform with the fix shipped earlier today.

**Tech Stack:** Astro 6, Tailwind, `motion` (scroll + parallax), Vitest for data-level checks. No new dependencies.

---

## File Structure

| Path | Action | Responsibility |
|------|--------|----------------|
| `src/data/site-content.ts` | Modify (append) | Add `contactCareers: ContentPage` with subtitle, paragraphs, callout |
| `src/data/content.ts` | Modify | Append Careers to `contactSiblings` |
| `src/data/navigation.ts` | Modify | Append Careers to `megaNav` Contact Us group, `primaryNav` Contact Us children, `footerNav` Contact us column |
| `src/data/nav-careers.test.ts` | Create | Vitest data check: nav surfaces expose `/contact/careers/` |
| `src/pages/contact/careers/index.astro` | Create | Cinematic Careers page (twin of `prime/index.astro`) |
| `src/pages/contact/rohrsysteme/index.astro` | Modify | Update closing-CTA "next" link from old terminus to point to Careers |

---

## Task 1: Add Careers content data

**Files:**
- Modify: `src/data/site-content.ts` (append after `subBrandRohrsysteme`, after line 1086)

- [ ] **Step 1: Append `contactCareers` export at the end of `site-content.ts`**

```ts
export const contactCareers: ContentPage = {
  title: 'Careers',
  eyebrow: 'Contact Us',
  subtitle:
    'Build your career with Elysée — engineering, manufacturing, R&D, and commercial roles across Cyprus, Lebanon, Egypt and Austria.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Since 1968 Elysée has grown from a single Cypriot workshop into a four-country group of piping and irrigation specialists. The people behind that growth — engineers, machine operators, quality technicians, sales managers, R&D scientists — are what we hire for, not the seat we put them in.',
    },
    { kind: 'heading', level: 2, text: 'Why Elysée' },
    {
      kind: 'paragraph',
      text:
        'We invest in long careers, not short stints. Joining the group means working alongside materials labs in Strovolos, hose extrusion lines in the 10th of Ramadan, distribution teams in Ennsdorf, and PE manufacturing in Byblos — with internal moves between subsidiaries treated as a feature, not an exception.',
    },
    {
      kind: 'callout',
      title: 'How to apply',
      body:
        'Address: 7 Vasileos Konstantinou, 2008 Strovolos, Nicosia, Cyprus\nPhone: +357 22 462 462\nEmail: careers@elysee.com.cy\nWebsite: www.elysee.com.cy',
    },
  ],
};
```

- [ ] **Step 2: Verify the file still type-checks**

Run: `pnpm astro check`
Expected: No new TypeScript errors. (If `astro check` is slow, `pnpm exec tsc --noEmit` on the data file is fine too.)

- [ ] **Step 3: Stage (do not commit yet)**

```bash
git add src/data/site-content.ts
```

---

## Task 2: Add Careers to the contact sub-nav siblings

**Files:**
- Modify: `src/data/content.ts:186-192`

- [ ] **Step 1: Append Careers to `contactSiblings`**

Replace:

```ts
export const contactSiblings: { label: string; href: string }[] = [
  { label: 'Local Network', href: '/contact/local/' },
  { label: 'Worldwide Network', href: '/contact/worldwide/' },
  { label: 'Elysée WISE', href: '/contact/wise/' },
  { label: 'Elysée PRIME', href: '/contact/prime/' },
  { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
];
```

With:

```ts
export const contactSiblings: { label: string; href: string }[] = [
  { label: 'Local Network', href: '/contact/local/' },
  { label: 'Worldwide Network', href: '/contact/worldwide/' },
  { label: 'Elysée WISE', href: '/contact/wise/' },
  { label: 'Elysée PRIME', href: '/contact/prime/' },
  { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
  { label: 'Careers', href: '/contact/careers/' },
];
```

- [ ] **Step 2: Stage**

```bash
git add src/data/content.ts
```

---

## Task 3: Add Careers to all three nav surfaces

**Files:**
- Modify: `src/data/navigation.ts` (three locations: lines ~73-82 primaryNav, ~161-170 megaNav Contact Us, ~219-228 footerNav Contact us)

- [ ] **Step 1: Add Careers to `primaryNav` Contact Us children**

Replace:

```ts
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
```

With:

```ts
  {
    label: 'Contact Us',
    href: '/contact/local/',
    children: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
      { label: 'Careers', href: '/contact/careers/' },
    ],
  },
```

- [ ] **Step 2: Add Careers card to `megaNav` Contact Us group**

Replace (the items array we just updated in the earlier session):

```ts
      items: [
        { label: 'Local Network', href: '/contact/local/', image: '/images/about/facility-exterior.jpg', caption: 'Cyprus offices & dealers' },
        { label: 'Worldwide Network', href: '/contact/worldwide/', image: '/images/about/hq-aerial.jpg', caption: 'Export representatives' },
        { label: 'Elysée WISE', href: '/contact/wise/', image: '/images/about/water-flowing.jpg', caption: 'Smart-water solutions' },
        { label: 'Elysée PRIME', href: '/contact/prime/', image: '/images/about/pipes-warehouse.jpg', caption: 'Premium product line' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/', image: '/images/about/pipe-stack.jpg', caption: 'Austrian subsidiary' },
      ],
```

With:

```ts
      items: [
        { label: 'Local Network', href: '/contact/local/', image: '/images/about/facility-exterior.jpg', caption: 'Cyprus offices & dealers' },
        { label: 'Worldwide Network', href: '/contact/worldwide/', image: '/images/about/hq-aerial.jpg', caption: 'Export representatives' },
        { label: 'Elysée WISE', href: '/contact/wise/', image: '/images/about/water-flowing.jpg', caption: 'Smart-water solutions' },
        { label: 'Elysée PRIME', href: '/contact/prime/', image: '/images/about/pipes-warehouse.jpg', caption: 'Premium product line' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/', image: '/images/about/pipe-stack.jpg', caption: 'Austrian subsidiary' },
        { label: 'Careers', href: '/contact/careers/', image: '/images/about/engineers-meeting.jpg', caption: 'Join the group' },
      ],
```

- [ ] **Step 3: Add Careers row to `footerNav` Contact us column**

Replace:

```ts
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
```

With:

```ts
  {
    title: 'Contact us',
    items: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
      { label: 'Careers', href: '/contact/careers/' },
    ],
  },
```

- [ ] **Step 4: Stage**

```bash
git add src/data/navigation.ts
```

---

## Task 4: Data-shape test for the Careers nav entry

**Files:**
- Create: `src/data/nav-careers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, test, expect } from 'vitest';
import { primaryNav, megaNav, footerNav } from './navigation';
import { contactSiblings } from './content';

describe('Careers entry in Contact Us surfaces', () => {
  const CAREERS_HREF = '/contact/careers/';

  test('primaryNav Contact Us children include Careers', () => {
    const contact = primaryNav.find((n) => n.label === 'Contact Us');
    expect(contact?.children?.some((c) => c.href === CAREERS_HREF)).toBe(true);
  });

  test('megaNav Contact Us group includes Careers with an image and caption', () => {
    const groups = megaNav.flat();
    const contact = groups.find((g) => g.title === 'Contact Us');
    const careers = contact?.items.find((i) => i.href === CAREERS_HREF);
    expect(careers).toBeDefined();
    expect(careers?.image).toBeTruthy();
    expect(careers?.caption).toBeTruthy();
  });

  test('footerNav Contact us column includes Careers', () => {
    const contact = footerNav.find((c) => c.title === 'Contact us');
    expect(contact?.items.some((i) => i.href === CAREERS_HREF)).toBe(true);
  });

  test('contactSiblings includes Careers (so the sub-nav renders the tab)', () => {
    expect(contactSiblings.some((s) => s.href === CAREERS_HREF)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm it passes (Tasks 2–3 already added the entries)**

Run: `pnpm vitest run src/data/nav-careers.test.ts`
Expected: 4 tests pass.

- [ ] **Step 3: Stage**

```bash
git add src/data/nav-careers.test.ts
```

---

## Task 5: Create `/contact/careers/index.astro` (cinematic page)

**Files:**
- Create: `src/pages/contact/careers/index.astro`

This file is a structural twin of `src/pages/contact/prime/index.astro` (verified at 229 lines). Same hero parallax, same `ContactSubNav`, same stat band layout, same about section with drop-cap, same cinematic moment, same callout card, same closing CTA, same `motion` script block. Only content, hero image, stat values, quote, and CTA targets change.

- [ ] **Step 1: Create the file with the full template below**

```astro
---
/**
 * Contact — Careers (group-wide).
 *
 * URL: /contact/careers/
 * Source: `contactCareers` from src/data/site-content.ts.
 */
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Container from '../../../components/Container.astro';
import Section from '../../../components/Section.astro';
import ContactSubNav from '../../../components/contact/ContactSubNav.astro';
import { contactCareers } from '../../../data/site-content';

const paragraphs = contactCareers.blocks.filter((b): b is Extract<typeof b, { kind: 'paragraph' }> => b.kind === 'paragraph');
const [intro1, intro2] = paragraphs;
const callout = contactCareers.blocks.find((b): b is Extract<typeof b, { kind: 'callout' }> => b.kind === 'callout');

const contactLines = (callout?.body ?? '').split('\n').map((l) => {
  const m = l.match(/^([^:]+):\s*(.+)$/);
  return m ? { label: m[1].trim(), value: m[2].trim() } : null;
}).filter((x): x is { label: string; value: string } => Boolean(x));
---
<BaseLayout
  title={`${contactCareers.title} — Contact — Elysée`}
  description={contactCareers.subtitle}
  padForHeader={false}
>

  <div aria-hidden="true" data-scroll-progress class="fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-50 origin-left pointer-events-none" style="transform: scaleX(0);"></div>

  {/* ===== COVER HERO ===== */}
  <section class="relative min-h-[88vh] flex items-end text-surface overflow-hidden">
    <img
      data-hero-parallax
      src="/images/about/engineers-meeting.jpg"
      alt="Elysée engineers in a working session — the group hires engineers, technicians, and commercial staff across Cyprus, Lebanon, Egypt and Austria"
      class="absolute inset-0 w-full h-full object-cover will-change-transform"
    />
    <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/80"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/30"></div>

    <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">
        Contact Us · Group-wide
      </p>
      <h1 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[0.92] tracking-tight text-surface" style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;">
        Careers.
      </h1>
      <p data-reveal data-reveal-delay="240" class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        {contactCareers.subtitle}
      </p>
      <div data-reveal data-reveal-delay="360" class="mt-14 md:mt-20 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-surface/70">
        <span aria-hidden="true" class="h-px w-12 bg-surface/50"></span>
        <span>Join Elysée</span>
      </div>
    </Container>
  </section>

  <ContactSubNav currentPath={Astro.url.pathname} />

  {/* ===== STAT BAND ===== */}
  <section class="bg-surface border-b border-ink/10">
    <Container size="xl" class="py-16 md:py-24">
      <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.3em] text-brand-500 mb-10 md:mb-14">By the group</p>
      <dl class="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="1968" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">1968</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Family-owned since</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd data-counter="4" class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2.5rem, 6vw, 5rem);">4</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Countries we hire from</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">Engineering</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Core disciplines</dt>
        </div>
        <div class="bg-surface p-8 md:p-10">
          <dd class="font-display font-heavy leading-none tracking-tight text-brand-500" style="font-size: clamp(2rem, 5vw, 4rem);">Year-round</dd>
          <dt class="mt-4 md:mt-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink/60">Applications open</dt>
        </div>
      </dl>
    </Container>
  </section>

  {/* ===== ABOUT ===== */}
  <Section bg="alt" spacing="lg">
    <Container size="xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <aside class="lg:col-span-4">
          <div class="lg:sticky lg:top-32">
            <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">About Careers at Elysée</p>
            <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
              Long careers, four countries.
            </h2>
            <div aria-hidden="true" class="mt-8 h-px w-12 bg-brand-500"></div>
            <p data-reveal data-reveal-delay="240" class="mt-6 max-w-xs text-sm text-ink/60 leading-relaxed">
              Engineering, manufacturing, R&D and commercial roles across the group.
            </p>
          </div>
        </aside>
        <div class="lg:col-span-8 lg:pt-2 space-y-7 md:space-y-8">
          {intro1 && (
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
          )}
          {intro2 && (
            <p data-reveal data-reveal-delay="280" class="text-base md:text-lg text-ink/80 leading-relaxed">{intro2.text}</p>
          )}
        </div>
      </div>
    </Container>
  </Section>

  {/* ===== CINEMATIC MOMENT ===== */}
  <section class="relative min-h-[55vh] flex items-center text-surface overflow-hidden">
    <img
      src="/images/about/qa-lab.jpg"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div aria-hidden="true" class="absolute inset-0 bg-ink/65"></div>
    <div aria-hidden="true" class="absolute inset-0 bg-brand-500/35 mix-blend-multiply"></div>
    <Container size="lg" class="relative py-20 md:py-28 w-full">
      <div class="max-w-4xl mx-auto text-center">
        <p data-reveal class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/75 mb-8">Join the group</p>
        <blockquote data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.05] tracking-tight" style="font-size: clamp(2rem, 5vw, 4.5rem);">
          <span aria-hidden="true" class="text-surface/55">&ldquo;</span>We hire people, not seats.<span aria-hidden="true" class="text-surface/55">&rdquo;</span>
        </blockquote>
      </div>
    </Container>
  </section>

  {/* ===== CONTACT CARD ===== */}
  {callout && (
    <Section bg="alt" spacing="lg">
      <Container size="xl">
        <header class="max-w-3xl mb-10 md:mb-12">
          <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">How to apply</p>
          <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
            Send us your CV.
          </h2>
        </header>
        <div data-reveal data-reveal-delay="240" class="max-w-4xl bg-surface border-l-4 border-brand-500 p-8 md:p-10">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {contactLines.map((line) => {
              const isFullWidth = line.label.toLowerCase() === 'address';
              const k = line.label.toLowerCase();
              const isLink = k === 'phone' || k === 'email' || k === 'website';
              const href =
                k === 'phone' ? `tel:${line.value.replace(/[^+\d]/g, '')}` :
                k === 'email' ? `mailto:${line.value}` :
                k === 'website' ? `https://${line.value.replace(/^https?:\/\//, '')}` :
                undefined;
              return (
                <div class={isFullWidth ? 'sm:col-span-2' : ''}>
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-ink/55 mb-1.5">{line.label}</dt>
                  <dd class="font-display font-heavy text-lg text-ink leading-snug">
                    {isLink && href ? (
                      <a href={href} target={k === 'website' ? '_blank' : undefined} rel={k === 'website' ? 'noopener noreferrer' : undefined} class="hover:text-brand-500 transition-colors duration-200">{line.value}</a>
                    ) : (
                      line.value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </Container>
    </Section>
  )}

  {/* ===== CLOSING CTA ===== */}
  <section class="bg-brand-500/10">
    <Container size="lg" class="py-16 md:py-20">
      <div class="mx-auto max-w-2xl text-center">
        <p data-reveal class="text-base md:text-lg text-ink/80 leading-relaxed">
          Prefer to start a conversation in person? Visit the Cyprus head office on the Local Network page, or step back to the group's worldwide subsidiaries.
        </p>
        <div data-reveal data-reveal-delay="160" class="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:careers@elysee.com.cy"
            class="group cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-brand-500 text-surface hover:bg-brand-700 text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
          >
            <span>Email careers@elysee.com.cy</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a
            href="/contact/local/"
            class="group cursor-pointer inline-flex items-center gap-3 px-6 py-3 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
          >
            <span>Back to Local Network</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </Container>
  </section>

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
</BaseLayout>
```

- [ ] **Step 2: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes; `/contact/careers/` appears in the route summary; no Astro errors.

- [ ] **Step 3: Visual smoke-test in dev**

Run: `pnpm dev` (or reuse the running session on http://localhost:4323), open `/contact/careers/`, and confirm:
- Hero parallax behaves like `/contact/prime/`
- `ContactSubNav` shows six tabs with **Careers** active
- Stat band, drop-cap intro, cinematic quote, callout card, and closing CTA all render
- `mailto:careers@elysee.com.cy` opens the OS mail client
- Re-open `/contact/prime/` to confirm the Careers tab also appears there (and the existing pages still look identical)

- [ ] **Step 4: Stage**

```bash
git add src/pages/contact/careers/index.astro
```

---

## Task 6: Update Rohrsysteme's closing CTA to point onward to Careers

**Files:**
- Modify: `src/pages/contact/rohrsysteme/index.astro` (closing CTA block; existing "next" link currently terminates the sequence)

This keeps the section's narrative chain intact (Local → Worldwide → WISE → PRIME → Rohrsysteme → **Careers**) so a visitor stepping through reaches the new page.

- [ ] **Step 1: Inspect the current closing-CTA block**

Read `src/pages/contact/rohrsysteme/index.astro` lines ~180–215 and locate the secondary "back / next" anchor.

- [ ] **Step 2: Update the secondary link to point to `/contact/careers/`**

Change the label to `Next · Careers` and the `href` to `/contact/careers/`. Preserve all surrounding markup, classes, and the arrow SVG — content edit only, no restyling. (Matches user feedback memory: preserve existing design.)

- [ ] **Step 3: Re-build and visually verify**

Run: `pnpm build`
Expected: success. Visit `/contact/rohrsysteme/`, click the new CTA, land on Careers.

- [ ] **Step 4: Stage**

```bash
git add src/pages/contact/rohrsysteme/index.astro
```

---

## Task 7: Final verification gate (before review)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: All tests pass, including the new `nav-careers.test.ts`.

- [ ] **Step 2: Type-check + build**

Run: `pnpm astro check && pnpm build`
Expected: zero TS errors; build green; `/contact/careers/` listed.

- [ ] **Step 3: Manual cross-surface check**

In the browser, confirm Careers appears in:
- Top-nav mega-menu Contact Us column (with the engineers-meeting photo card)
- Mobile nav Contact Us section
- Footer Contact us column
- Contact sub-nav on every contact sub-page (Local / Worldwide / WISE / PRIME / Rohrsysteme / Careers)

- [ ] **Step 4: Hand off for user review**

Per the standing memory ([feedback_no_commit_until_review]), DO NOT commit. Surface `git status` + a one-line diff summary and wait for the user to approve before any `git commit` / push.

---

## Self-Review (performed against this plan)

**1. Spec coverage:**
- "Add Careers to Contact Us mega menu" → Task 3 step 2 ✅
- "Add Careers to footer + nav" → Task 3 steps 1 and 3 ✅
- "Build /contact/careers/ page consistent with existing sub-pages" → Task 5 (twin of `prime/index.astro`) ✅
- Sub-nav tab visible on the new page AND on its siblings → Task 2 ✅
- Image parity with the photo fix shipped today → Task 3 step 2 uses `/images/about/engineers-meeting.jpg` ✅
- Narrative chain doesn't dead-end at Rohrsysteme → Task 6 ✅

**2. Placeholder scan:** No "TBD" / "implement later" / "similar to" / vague handling lines. Every code block is full and ready to paste.

**3. Type consistency:**
- `ContentPage` shape (title / eyebrow / subtitle / blocks) matches `subBrandPrime` exactly.
- Block discriminator (`'paragraph'` / `'heading'` / `'callout'`) matches existing code.
- Nav `NavItem` (label / href / image / caption) matches the items extended in the previous session's image fix.
- `contactSiblings` shape `{ label, href }` matches existing entries.

No drift detected — plan is implementation-ready.
