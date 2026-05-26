# History Timeline — Hover-Image Tooltip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **User preference — commits:** Per saved memory, do NOT run `git commit` until the user explicitly approves. Stage with `git add` if helpful; the user reviews before any commit.

**Goal:** When the user hovers over an item in the "A timeline of forty-seven years" section on `/about-us/history/demo`, show a small image tooltip anchored to that item, displaying an image relevant to the hovered year.

**Architecture:** Each timeline `<li>` is tagged with `data-timeline-trigger` + `data-timeline-image` attributes server-side in `demo.astro`. A single fixed-position tooltip `<div>` is rendered once at the end of the timeline section. A small TypeScript client script (loaded via `<script>` in the .astro file) listens for `mouseenter` / `mouseleave` on the triggers, swaps the tooltip's `<img>` src, computes the tooltip's screen position from the trigger's `getBoundingClientRect()`, and fades it in. Tooltip is disabled on viewports `< 1024px` (pointer-coarse / hover-none).

**Tech Stack:** Astro 6 · TypeScript · Tailwind v4 · **GSAP** (for tooltip enter/exit fade + scale and smooth position transitions when moving between items) · vanilla DOM API (no React island — the feature is event-handler + animation only).

---

## File Map

**Create:**
- `src/data/history-timeline-images.ts` — year → image-src map, plus a small lookup helper.
- `src/scripts/history-timeline-hover.client.ts` — hover wiring + positioning logic.

**Modify:**
- `src/pages/about-us/history/demo.astro` — add `data-timeline-trigger`, `data-timeline-year`, and `data-timeline-image` attributes to each milestone `<li>`; render the floating tooltip element once at the end of the timeline `<section>`; load the client script.

**Dependency added:** `gsap` (production, latest stable — currently `3.12.x`).

**No tests in this plan** — the behaviour is visual/interaction-only and the project's test setup uses Playwright at `tests/`. A Playwright smoke test can be added later if the user asks; not included here to keep scope tight.

---

## Task 0: Install GSAP

**Files:**
- Modify: `package.json` (via `pnpm add`)

- [ ] **Step 1: Install**

Run: `pnpm add gsap`
Expected: `gsap` added to `dependencies` in `package.json`, lockfile updated.

- [ ] **Step 2: Verify**

Run: `pnpm list gsap | grep gsap`
Expected: outputs the installed version (e.g. `gsap 3.12.x`).

- [ ] **Step 3: Pause for user commit approval**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add gsap for history timeline tooltip animation"
```

---

## Task 1: Year → image data file

**Files:**
- Create: `src/data/history-timeline-images.ts`

- [ ] **Step 1: Implement the data file**

Create `src/data/history-timeline-images.ts`:

```ts
/**
 * Maps each timeline year (or year-range string) on the history page to an
 * image rendered by the hover-tooltip on /about-us/history/demo.
 *
 * Keys must match the `year` string used by the milestone items in
 * `src/data/site-content.ts` (aboutUsHistory.blocks → timeline.items).
 *
 * Images are pulled from /public/images/about — pick the best contextual
 * match for each milestone.
 */
export const historyTimelineImages: Record<string, { src: string; alt: string }> = {
  '1979': {
    src: '/images/about/founder-vintage.jpg',
    alt: 'Elysée founder Antonis Protopapas in the early years of the company',
  },
  '1980': {
    src: '/images/about/water-flowing.jpg',
    alt: 'Water flowing from an irrigation outlet — the first export markets',
  },
  '1989': {
    src: '/images/about/facility-exterior.jpg',
    alt: 'Exterior of the Ergates Industrial Area facility',
  },
  '1991': {
    src: '/images/about/pipes-warehouse.jpg',
    alt: 'Polyethylene pipe stock arranged in the Ergates warehouse',
  },
  '1998': {
    src: '/images/about/qa-lab.jpg',
    alt: 'Elysée quality-assurance laboratory',
  },
  '2001': {
    src: '/images/about/hq-aerial.jpg',
    alt: 'Aerial view of the Elysée Ergates headquarters',
  },
  '2002': {
    src: '/images/about/engineers-meeting.jpg',
    alt: 'Engineers and consultants in an R&D working session',
  },
  '2003 – 2016': {
    src: '/images/about/pipe-stack.jpg',
    alt: 'Stacks of pipe ready for outbound international shipment',
  },
  'Today': {
    src: '/images/about/facility-exterior.jpg',
    alt: 'The Elysée Ergates facility today',
  },
};

export function getTimelineImage(year: string): { src: string; alt: string } | null {
  return historyTimelineImages[year] ?? null;
}
```

- [ ] **Step 2: Verify the file exists**

Run: `ls -la src/data/history-timeline-images.ts`
Expected: file exists, non-zero size.

- [ ] **Step 3: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 4: Pause for user commit approval**

Per user preference, ask the user before running:

```bash
git add src/data/history-timeline-images.ts
git commit -m "feat(history): add year→image data map for timeline hover tooltip"
```

---

## Task 2: Wire data attributes onto each timeline milestone

**Files:**
- Modify: `src/pages/about-us/history/demo.astro` (the timeline section — currently around lines 233–248)

- [ ] **Step 1: Import the image map**

In the frontmatter (top of `demo.astro`), add:

```ts
import { getTimelineImage } from '../../../data/history-timeline-images';
```

(Place this import alongside the other imports near the top of the file.)

- [ ] **Step 2: Add data attributes to each `<li>` in the timeline**

Find this block in `demo.astro` (currently around lines 234–247):

```astro
{d.items.map((item, i) => (
  <li data-reveal data-reveal-delay={String(i * 60)} class="group">
    <div class="flex items-baseline gap-4 mb-3">
      <span class="font-display font-heavy text-2xl md:text-3xl text-brand-500 tracking-tight">
        {item.year}
      </span>
      <span aria-hidden="true" class="flex-1 h-px bg-ink/15"></span>
    </div>
    {item.title && (
      <h4 class="font-display font-heavy text-lg md:text-xl text-ink mb-2 max-w-2xl">{item.title}</h4>
    )}
    <p class="text-base md:text-lg text-ink/80 leading-[1.7] max-w-2xl">{item.body}</p>
  </li>
))}
```

Replace it with:

```astro
{d.items.map((item, i) => {
  const img = getTimelineImage(item.year);
  return (
    <li
      data-reveal
      data-reveal-delay={String(i * 60)}
      data-timeline-trigger
      data-timeline-year={item.year}
      data-timeline-image={img?.src ?? ''}
      data-timeline-image-alt={img?.alt ?? ''}
      class="group cursor-default"
    >
      <div class="flex items-baseline gap-4 mb-3">
        <span class="font-display font-heavy text-2xl md:text-3xl text-brand-500 tracking-tight">
          {item.year}
        </span>
        <span aria-hidden="true" class="flex-1 h-px bg-ink/15"></span>
      </div>
      {item.title && (
        <h4 class="font-display font-heavy text-lg md:text-xl text-ink mb-2 max-w-2xl">{item.title}</h4>
      )}
      <p class="text-base md:text-lg text-ink/80 leading-[1.7] max-w-2xl">{item.body}</p>
    </li>
  );
})}
```

(Only the wrapper `<li>` gains the four `data-timeline-*` attributes and a `cursor-default`; the inner markup is unchanged.)

- [ ] **Step 3: Add the floating tooltip element to the timeline section**

Find the closing `</Container>` of the timeline section (around line 252) and the closing `</section>` (around line 253). Just **before** the `</section>` tag (so the tooltip is a child of the timeline section), add this markup:

```astro
{/* ===== Hover image tooltip (desktop only, fixed-positioned) ===== */}
<div
  data-timeline-tooltip
  aria-hidden="true"
  class="pointer-events-none fixed z-50 hidden lg:block opacity-0 transition-opacity duration-200 ease-out"
  style="width: 280px; height: 210px;"
>
  <div class="relative h-full w-full overflow-hidden rounded-[14px] bg-surface shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
    <img
      data-timeline-tooltip-img
      src=""
      alt=""
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover"
    />
  </div>
</div>
```

(The `hidden` class hides it on mobile entirely. The `opacity-0` keeps it transparent on desktop until the client script activates it. `pointer-events-none` ensures it never blocks hovers on items beneath.)

- [ ] **Step 4: Load the client script at the end of the .astro file**

At the very bottom of `demo.astro` (after the final `</BaseLayout>` closing tag), add:

```astro
<script>
  import '../../../scripts/history-timeline-hover.client';
</script>
```

- [ ] **Step 5: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 6: Pause for user commit approval**

```bash
git add src/pages/about-us/history/demo.astro
git commit -m "feat(history): wire data attrs + tooltip slot onto timeline items"
```

---

## Task 3: Client-side hover script

**Files:**
- Create: `src/scripts/history-timeline-hover.client.ts`

- [ ] **Step 1: Implement the script**

Create `src/scripts/history-timeline-hover.client.ts`:

```ts
/**
 * Hover-tooltip for the history-page timeline.
 *
 * Wires `mouseenter` / `mouseleave` (and `focusin` / `focusout` for keyboard)
 * on every `[data-timeline-trigger]` element to a single fixed-position
 * `[data-timeline-tooltip]` element rendered once in /about-us/history/demo.
 *
 * Animation is driven by GSAP:
 *   - enter:  opacity 0 → 1, scale 0.96 → 1, duration 0.22, ease 'power2.out'
 *   - exit:   opacity → 0, scale → 0.96, duration 0.16, ease 'power2.in'
 *   - move:   when the user slides from one item to another while the tooltip
 *             is already visible, GSAP tweens `left` / `top` over 0.18s with
 *             ease 'power3.out' so the card glides into its new anchor point.
 *
 * Disabled on viewports < 1024px and on coarse-pointer devices.
 */

import { gsap } from 'gsap';

type TooltipState = {
  tooltip: HTMLElement;
  img: HTMLImageElement;
  triggers: HTMLElement[];
  visible: boolean;
};

const HORIZONTAL_OFFSET = 24; // gap between trigger and tooltip

function shouldEnable(): boolean {
  if (typeof window === 'undefined') return false;
  const lg = window.matchMedia('(min-width: 1024px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return lg && !coarse;
}

function setup(): TooltipState | null {
  const tooltip = document.querySelector<HTMLElement>('[data-timeline-tooltip]');
  const img = document.querySelector<HTMLImageElement>('[data-timeline-tooltip-img]');
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-timeline-trigger]'),
  );
  if (!tooltip || !img || triggers.length === 0) return null;

  // Initial state — fully hidden, slightly scaled down. GSAP owns these from now on.
  gsap.set(tooltip, { opacity: 0, scale: 0.96, transformOrigin: '50% 50%' });

  return { tooltip, img, triggers, visible: false };
}

function computeAnchor(tooltip: HTMLElement, trigger: HTMLElement): { left: number; top: number } {
  const rect = trigger.getBoundingClientRect();
  const tipW = tooltip.offsetWidth;
  const tipH = tooltip.offsetHeight;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let left = rect.right + HORIZONTAL_OFFSET;
  let top = rect.top + rect.height / 2 - tipH / 2;

  // Flip to the left side if right side would overflow.
  if (left + tipW > viewportW - 16) {
    left = rect.left - tipW - HORIZONTAL_OFFSET;
  }
  // Clamp vertically inside the viewport.
  if (top < 16) top = 16;
  if (top + tipH > viewportH - 16) top = viewportH - tipH - 16;

  return { left, top };
}

function show(state: TooltipState, trigger: HTMLElement): void {
  const src = trigger.dataset.timelineImage ?? '';
  const alt = trigger.dataset.timelineImageAlt ?? '';
  if (!src) return; // no image mapped → don't show anything

  // Swap image content if it changed (avoid a flicker if the user re-hovers the same item).
  if (state.img.getAttribute('src') !== src) {
    state.img.src = src;
    state.img.alt = alt;
  }

  const anchor = computeAnchor(state.tooltip, trigger);

  if (state.visible) {
    // Already visible — slide to the new position.
    gsap.to(state.tooltip, {
      left: anchor.left,
      top: anchor.top,
      duration: 0.18,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  } else {
    // First show — snap to position, then fade + scale in.
    gsap.set(state.tooltip, { left: anchor.left, top: anchor.top });
    gsap.to(state.tooltip, {
      opacity: 1,
      scale: 1,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    state.visible = true;
  }
}

function hide(state: TooltipState): void {
  if (!state.visible) return;
  gsap.to(state.tooltip, {
    opacity: 0,
    scale: 0.96,
    duration: 0.16,
    ease: 'power2.in',
    overwrite: 'auto',
    onComplete: () => {
      state.visible = false;
    },
  });
}

function attach(state: TooltipState): void {
  for (const trigger of state.triggers) {
    trigger.addEventListener('mouseenter', () => show(state, trigger));
    trigger.addEventListener('mouseleave', () => hide(state));
    trigger.addEventListener('focusin', () => show(state, trigger));
    trigger.addEventListener('focusout', () => hide(state));
  }

  // Re-anchor on scroll/resize while visible — keeps the card glued to the trigger.
  let raf = 0;
  const reAnchor = () => {
    if (!state.visible) return;
    const hovered = state.triggers.find((t) => t.matches(':hover, :focus-within'));
    if (!hovered) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const a = computeAnchor(state.tooltip, hovered);
      gsap.set(state.tooltip, { left: a.left, top: a.top });
    });
  };
  window.addEventListener('scroll', reAnchor, { passive: true });
  window.addEventListener('resize', reAnchor);
}

function init(): void {
  if (!shouldEnable()) return;
  const state = setup();
  if (!state) return;
  attach(state);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**Note:** because GSAP now owns the `opacity`, `scale`, `left`, and `top` style properties on the tooltip, **remove the Tailwind `opacity-0 transition-opacity duration-200 ease-out` classes from the tooltip markup in Task 2** — they'd conflict with GSAP's inline styles. The tooltip element ends up with just:

```astro
<div
  data-timeline-tooltip
  aria-hidden="true"
  class="pointer-events-none fixed z-50 hidden lg:block"
  style="width: 280px; height: 210px;"
>
```

Update Task 2 step 3 accordingly when implementing.

- [ ] **Step 2: Verify file exists and type-checks**

Run: `ls -la src/scripts/history-timeline-hover.client.ts && pnpm astro check`
Expected: file present, 0 errors.

- [ ] **Step 3: Manual smoke-test in dev**

Run: `pnpm dev`
Open `http://localhost:4321/about-us/history/demo` (or whichever port your dev server is on) and:
- Scroll to the "A timeline of forty-seven years" section
- Hover over the 1979 milestone → tooltip pops in to the right of the item with the founder-vintage image
- Move to a different milestone → tooltip moves and the image swaps with a 200ms fade
- Move outside any milestone → tooltip fades out
- Resize the browser to `<1024px` → tooltip should no longer appear when hovering

- [ ] **Step 4: Pause for user commit approval**

```bash
git add src/scripts/history-timeline-hover.client.ts
git commit -m "feat(history): client script for timeline hover-image tooltip"
```

---

## Task 4: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Type-check**

Run: `pnpm astro check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Production build sanity check**

Run: `pnpm build`
Expected: build completes with no errors.

- [ ] **Step 3: Manual walkthrough**

In `pnpm dev`, walk through:
- (a) Open `/about-us/history/demo` → tooltip is invisible by default
- (b) Hover over each of the 9 milestone items in turn — verify the correct image appears (1979 = founder, 1980 = water, 1989 = facility, 1991 = pipe-warehouse, 1998 = qa-lab, 2001 = hq-aerial, 2002 = engineers-meeting, 2003–2016 = pipe-stack, Today = facility)
- (c) Hover an item near the right edge of the viewport — verify the tooltip flips to the left side instead of overflowing
- (d) Tab through milestone items with the keyboard — tooltip should appear on focus, hide on blur
- (e) Switch the browser to a `prefers-reduced-motion` setting (DevTools → Rendering → Emulate CSS prefers-reduced-motion) — the 200ms fade is OK to keep (subtle); confirm no large motion is introduced
- (f) Resize to `<1024px` → tooltip never appears

- [ ] **Step 4: Report back**

Hand off to the user with a one-line summary of what was built and the commit list still awaiting user approval.

---

## Spec self-review

| Requirement (from user message) | Covered by |
|---|---|
| Hover any part of the timeline section → image pops out | Task 2 (data attrs on each `<li>`), Task 3 (mouseenter/leave wiring) |
| Image matches the hovered text (e.g. 1979 → 1979 image) | Task 1 (year→image map), Task 3 (`show()` reads `data-timeline-image` per trigger) |
| Tooltip position | Task 3 (`positionTooltip()` — right side default, flip to left if overflow, vertically clamped) |
| Fade / scale animation | Task 0 (install `gsap`), Task 3 (GSAP tweens on opacity + scale for enter/exit; tweens on left/top for move-between-items) |
| Mobile behaviour | Task 2 (`hidden lg:block`), Task 3 (`shouldEnable()` gates by viewport + pointer type) |
| Keyboard accessibility | Task 3 (also listens for `focusin`/`focusout`) |
| Existing page design preserved | Tasks 1–3 only ADD attributes/elements; no existing styles or layout modified |

No placeholders. All file paths and code are concrete. No spec gaps.

---

## Out of scope

- Real period-correct photography per year — the plan uses existing `/public/images/about/*.jpg` files mapped contextually. Swapping in better images later is a one-line edit per year in `history-timeline-images.ts`.
- A Playwright smoke test for the interaction — can be added later if needed.
- Mobile fallback rendering (e.g. inline thumbnails in the milestone copy) — tooltip is desktop-only by user agreement.
- Applying the same hover behaviour to the non-demo `/about-us/history/` page — only the `/demo` route is in scope.
