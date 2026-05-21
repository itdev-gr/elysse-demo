# Home Snap-Nav Dots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fullPage.js-style vertical dot navigation, fixed to the right edge on the homepage, that highlights the active section as the user scrolls and smooth-scrolls to the targeted panel on click.

**Architecture:** A new `SnapNav.astro` component renders a fixed-position vertical column of 6 buttons (one per home panel) and ships a small client script that uses `IntersectionObserver` to track which `[data-snap]` panel is most in-view, toggles `data-active="true"` on the corresponding button, and handles clicks via `scrollIntoView({ behavior: 'smooth' })`. The Hero component is extended with an `id` prop so panels can be referenced uniformly; the rest of the panels already accept `id` (`SnapSection`) or have it inline (news). The component is rendered only on the homepage and hidden below `md` to avoid screen-edge clutter on phones.

**Tech Stack:** Astro 6 + Tailwind v4 (existing). No new dependencies. Uses native `IntersectionObserver`, `Element.scrollIntoView`, and Tailwind's `data-[active=true]:` variants.

**Working directory:** `/Users/marios/Desktop/Cursor/elysse demo`

---

## Task 1: Add `id` prop to Hero so panels can be referenced uniformly

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Read current Hero component**

Run: `head -50 src/components/Hero.astro`

Confirm the `Props` interface currently includes `eyebrow`, `headline`, `sub`, `image`, `imageAlt`, `cta`, `ctaSecondary`, `align`, `height`, `overlay` — but **not** `id`.

- [ ] **Step 2: Extend the `Props` interface + destructuring + root element**

Edit `src/components/Hero.astro`. Add `id?: string` to the Props interface, pull it out of `Astro.props`, and apply it to the root `<section>`.

```ts
interface Props {
  id?: string;
  eyebrow?: string;
  // ... existing props
}
const {
  id,
  eyebrow,
  // ... existing destructures
} = Astro.props;
```

And in the markup:

```astro
<section id={id} class={`relative ${heights[height]} ...`}>
```

- [ ] **Step 3: Typecheck**

Run: `pnpm astro check`
Expected: 0 errors. (Pre-existing hints in `recon/scripts/extract-motion.ts` and `tests/a11y.spec.ts` are unrelated and acceptable.)

- [ ] **Step 4: Build**

Run: `pnpm astro build`
Expected: 10 pages built, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat(hero): forward optional id prop to root section"
```

---

## Task 2: Build the `SnapNav` component

**Files:**
- Create: `src/components/SnapNav.astro`

- [ ] **Step 1: Write the component**

Create `src/components/SnapNav.astro` with the exact content below.

```astro
---
export interface SnapNavItem {
  /** id of the target panel — must match the id of a [data-snap] element on the page */
  id: string;
  /** Accessible name for the button, e.g. "Hero", "Services", "News" */
  label: string;
}

interface Props {
  items: SnapNavItem[];
}

const { items } = Astro.props;
---
<nav
  data-snapnav
  class="pointer-events-none fixed right-3 md:right-6 top-1/2 z-30 hidden md:flex -translate-y-1/2 flex-col items-center gap-4 rounded-full bg-ink/40 px-2 py-4 backdrop-blur-sm"
  aria-label="Page sections"
>
  {items.map((item) => (
    <button
      type="button"
      data-snapnav-dot
      data-target={item.id}
      data-active="false"
      class="pointer-events-auto group relative inline-flex h-6 w-6 items-center justify-center"
      aria-label={`Go to ${item.label}`}
    >
      <span
        class="block h-2.5 w-2.5 rounded-full bg-surface/50 transition-all duration-base ease-out-quint group-hover:bg-surface group-data-[active=true]:bg-brand-accent group-data-[active=true]:scale-125"
      ></span>
    </button>
  ))}
</nav>

<script>
  type Cleanup = () => void;

  function init(): Cleanup {
    const nav = document.querySelector<HTMLElement>('[data-snapnav]');
    if (!nav) return () => {};
    const dots = Array.from(
      nav.querySelectorAll<HTMLButtonElement>('[data-snapnav-dot]'),
    );

    // Map dot → target element
    const targets = new Map<HTMLButtonElement, HTMLElement>();
    for (const d of dots) {
      const id = d.dataset.target;
      const target = id ? document.getElementById(id) : null;
      if (target) targets.set(d, target);
    }

    const setActive = (activeId: string | null) => {
      for (const d of dots) {
        d.dataset.active = d.dataset.target === activeId ? 'true' : 'false';
        d.setAttribute('aria-current', d.dataset.active === 'true' ? 'true' : 'false');
      }
    };

    // Click → smooth scroll to target
    const onClick = (e: Event) => {
      const btn = (e.currentTarget as HTMLButtonElement);
      const target = targets.get(btn);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    for (const d of dots) d.addEventListener('click', onClick);

    // Active-state sync via IntersectionObserver
    // Use a threshold that fires when most of a section is in view.
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersectionRatio among intersecting entries
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0].target as HTMLElement;
        setActive(top.id || null);
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: '-15% 0px -15% 0px' },
    );
    for (const target of targets.values()) observer.observe(target);

    return () => {
      for (const d of dots) d.removeEventListener('click', onClick);
      observer.disconnect();
    };
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
</script>
```

- [ ] **Step 2: Verify the `--color-brand-accent` token exists**

Run: `grep 'color-brand-accent\|color-accent' src/styles/global.css | head`
Expected: a `--color-brand-accent: <hex>;` declaration in the `@theme` block.

If it's missing, add it to the `@theme` block in `src/styles/global.css`. Use the brand orange/accent established for active highlights — pick the value already in the existing palette (look for an orange or warm-accent color in DESIGN.md). If absolutely no accent color is defined, add:

```css
--color-brand-accent: #ec6608;
```

(Hex chosen to match the orange dot tone from the source visual reference. Adjust if DESIGN.md specifies a different accent.)

- [ ] **Step 3: Typecheck + build**

Run: `pnpm astro check && pnpm astro build`
Expected: 10 pages built, 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/SnapNav.astro src/styles/global.css
git commit -m "feat(components): SnapNav — fixed vertical dot navigation with active-state sync"
```

---

## Task 3: Give each home panel an `id` and render `SnapNav` on the homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read current homepage**

Run: `cat src/pages/index.astro`

Confirm the page renders, in order: Hero → 4× SnapSection (from `textSections.map`) → 1 inline `<section>` for news.

- [ ] **Step 2: Add `id` to each panel and render `SnapNav`**

Replace the contents of `src/pages/index.astro` with this:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import SnapSection from '../components/SnapSection.astro';
import SnapNav, { type SnapNavItem } from '../components/SnapNav.astro';
import Container from '../components/Container.astro';
import Card from '../components/Card.astro';
import { homePage as page } from '../data/content';

// Split sections so text sections become full-screen image panels
// and the news list becomes its own snap panel.
const textSections = page.sections.filter(
  (s): s is Extract<typeof s, { kind: 'text' }> => s.kind === 'text',
);
const newsSection = page.sections.find(
  (s): s is Extract<typeof s, { kind: 'news-list' }> => s.kind === 'news-list',
);

// Stable kebab-case id per panel
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const HERO_ID = 'panel-hero';
const NEWS_ID = 'panel-news';

const textIds = textSections.map((s) => `panel-${slugify(s.eyebrow ?? s.heading ?? 'section')}`);

const navItems: SnapNavItem[] = [
  { id: HERO_ID, label: 'Top' },
  ...textSections.map((s, i) => ({
    id: textIds[i],
    label: s.eyebrow ?? s.heading ?? `Section ${i + 1}`,
  })),
  ...(newsSection ? [{ id: NEWS_ID, label: newsSection.heading ?? 'News' }] : []),
];
---
<BaseLayout
  title={page.meta.title}
  description={page.meta.description}
  padForHeader={false}
>
  <script is:inline>
    document.documentElement.setAttribute('data-snap-page', '');
    addEventListener('beforeunload', () => {
      document.documentElement.removeAttribute('data-snap-page');
    });
  </script>

  <SnapNav items={navItems} />

  {/* Panel 1 — Hero */}
  {page.hero && <Hero id={HERO_ID} {...page.hero} height="screen" />}

  {/* Panels 2..N — one full-screen image per text section */}
  {textSections.map((s, i) => (
    <SnapSection
      id={textIds[i]}
      eyebrow={s.eyebrow}
      heading={s.heading ?? ''}
      body={s.body}
      image={s.image!}
      imageAlt={s.heading}
      cta={s.cta}
    />
  ))}

  {/* Final panel — Latest News (3-up grid, full screen) */}
  {newsSection && (
    <section
      id={NEWS_ID}
      data-snap
      class="relative min-h-screen snap-start snap-always bg-surface-alt flex items-center py-20 md:py-28"
    >
      <Container size="xl" class="w-full">
        {newsSection.eyebrow && (
          <p data-reveal class="text-xs uppercase tracking-widest text-brand-500 mb-3">
            {newsSection.eyebrow}
          </p>
        )}
        {newsSection.heading && (
          <h2
            data-reveal
            data-reveal-delay="80"
            class="font-display text-4xl md:text-5xl lg:text-6xl"
          >
            {newsSection.heading}
          </h2>
        )}
        <div class="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {newsSection.articles.map((a, i) => (
            <Card
              title={a.title}
              eyebrow={a.date ?? a.eyebrow}
              image={a.image}
              data-reveal
              data-reveal-delay={String(160 + i * 80)}
            />
          ))}
        </div>
      </Container>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: Typecheck + build**

Run: `pnpm astro check && pnpm astro build`
Expected: 10 pages built, 0 errors.

- [ ] **Step 4: Live smoke test**

Start the dev server if not already running:

```bash
pnpm dev
```

Open http://localhost:4321/ in a browser and verify:
- A column of 6 dots appears on the right edge of the viewport
- The top dot is active on first load (filled, accent color)
- Scrolling down advances the active dot
- Clicking a dot smooth-scrolls the page to the matching panel
- Active dot updates after the scroll settles

Resize the window below ~768px wide — the dots should disappear on mobile.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): id every snap panel and render SnapNav on homepage"
```

---

## Task 4: Playwright test for active-state + click navigation

**Files:**
- Create: `tests/home-snapnav.spec.ts`

This guards against regressions in the active-state sync or click handlers.

- [ ] **Step 1: Write the failing test**

Create `tests/home-snapnav.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('home: snap-nav dots reflect active section and scroll on click', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  const dots = page.locator('[data-snapnav-dot]');
  await expect(dots).toHaveCount(6);

  // First dot active on initial load
  await expect(dots.nth(0)).toHaveAttribute('data-active', 'true');

  // Click the third dot — should activate it after smooth scroll settles
  await dots.nth(2).click();
  await page.waitForTimeout(900); // allow smooth scroll + observer to fire
  await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
  await expect(dots.nth(0)).toHaveAttribute('data-active', 'false');

  // Click the last dot — news panel becomes active
  await dots.nth(5).click();
  await page.waitForTimeout(900);
  await expect(dots.nth(5)).toHaveAttribute('data-active', 'true');
});

test('home: snap-nav hidden on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-snapnav]')).toBeHidden();
});
```

- [ ] **Step 2: Build the site so `astro preview` (used by playwright.config.ts webServer) has fresh output**

Run: `pnpm astro build`
Expected: clean build, 10 pages.

- [ ] **Step 3: Run the test**

Run: `pnpm exec playwright test tests/home-snapnav.spec.ts`
Expected: 2/2 passed.

If the test fails on the active-state assertion, check:
- The observer's `rootMargin` may need adjustment (try `'-25% 0px -25% 0px'`)
- The click might race with the observer — increase the timeout from 900ms to 1500ms

- [ ] **Step 4: Commit**

```bash
git add tests/home-snapnav.spec.ts
git commit -m "test(home): snap-nav active-state + click navigation"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Vertical dot visual on the right center of the homepage → Task 2 renders fixed right + top-1/2 + flex-col
- ✅ Active dot reflects current section → Task 2's IntersectionObserver
- ✅ Click each dot moves to corresponding section → Task 2's click handler + scrollIntoView
- ✅ One dot per home panel → Task 3 builds the 6-item `navItems` array
- ✅ Accessibility (aria-label per dot, aria-current on active) → Task 2 sets aria-current in setActive
- ✅ Hidden on mobile (not in the screenshot context, but the user said "right center of the website" implying desktop) → `hidden md:flex`
- ✅ Smooth scroll + reduced-motion respected → scrollIntoView honors `prefers-reduced-motion` natively
- ✅ Regression coverage → Task 4

**2. Placeholder scan:**
- The accent color fallback (`#ec6608`) is a documented heuristic with a clear "adjust if DESIGN.md specifies" note — concrete value provided.
- No `TBD`, `<...>`, or "implement later".

**3. Type consistency:**
- `SnapNavItem` interface is declared in Task 2 and consumed in Task 3 with `import type { SnapNavItem }`.
- `id`, `label`, `data-target`, `data-active`, `data-snapnav-dot`, `data-snapnav`, `data-snap` — all spelled consistently across tasks.
- `HERO_ID`, `NEWS_ID`, `textIds` are defined and used in the same file (Task 3) with no drift.

---
