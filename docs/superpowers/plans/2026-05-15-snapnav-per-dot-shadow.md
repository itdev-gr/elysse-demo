# SnapNav Per-Dot Shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the column-wide pill backdrop behind the SnapNav dots with an individual circular shadow/backdrop around each dot, so the visual reads as discrete dots with their own glow rather than a continuous vertical bar.

**Architecture:** Single-file CSS-only change in `src/components/SnapNav.astro`. Strip `bg-ink/40 backdrop-blur-sm rounded-full px-2 py-4` from the `<nav>` (keep flex/gap/positioning utilities), and add a circular dark backdrop + soft drop-shadow to each `<button>` so each dot reads as an independent island. No script changes, no token changes, no other components affected. The existing Playwright spec at `tests/home-snapnav.spec.ts` continues to assert dot count + click behavior and will be re-run as the regression gate.

**Tech Stack:** Astro + Tailwind v4 (existing). No new deps.

**Working directory:** `/Users/marios/Desktop/Cursor/elysse demo`

---

## Task 1: Move backdrop from the nav pill onto each individual dot

**Files:**
- Modify: `src/components/SnapNav.astro:15-33`

- [ ] **Step 1: Read the current SnapNav markup**

Run:

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
sed -n '15,33p' src/components/SnapNav.astro
```

Expected to show the current `<nav>` with the continuous pill backdrop and the `<button>` template with no backdrop.

- [ ] **Step 2: Edit `<nav>` — drop the pill background, keep layout utilities**

Open `src/components/SnapNav.astro`. Find the `<nav>` opening tag (around line 15–19) which currently reads:

```astro
<nav
  data-snapnav
  class="pointer-events-none fixed right-3 md:right-6 top-1/2 z-30 hidden md:flex -translate-y-1/2 flex-col items-center gap-4 rounded-full bg-ink/40 px-2 py-4 backdrop-blur-sm"
  aria-label="Page sections"
>
```

Replace with:

```astro
<nav
  data-snapnav
  class="pointer-events-none fixed right-3 md:right-6 top-1/2 z-30 hidden md:flex -translate-y-1/2 flex-col items-center gap-4"
  aria-label="Page sections"
>
```

Removed: `rounded-full bg-ink/40 px-2 py-4 backdrop-blur-sm`. Kept everything else (positioning, flex, gap, accessibility).

- [ ] **Step 3: Edit each `<button>` — add a circular backdrop + soft drop shadow**

Find the `<button>` template inside `items.map(...)` (around line 21–32) which currently reads:

```astro
<button
  type="button"
  data-snapnav-dot
  data-target={item.id}
  data-active="false"
  class="pointer-events-auto group relative inline-flex h-6 w-6 items-center justify-center"
  aria-label={`Go to ${item.label}`}
>
```

Replace the `class` attribute with:

```astro
class="pointer-events-auto group relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/40 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.35)] transition-shadow duration-base ease-out-quint hover:shadow-[0_0_14px_rgba(0,0,0,0.5)]"
```

Added: `rounded-full bg-ink/40 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.35)] transition-shadow duration-base ease-out-quint hover:shadow-[0_0_14px_rgba(0,0,0,0.5)]`. The `shadow-[…]` arbitrary value renders a soft 10–14px black glow centered on the 24px button hit-target, giving each dot its own halo without spilling into neighboring dots.

- [ ] **Step 4: Typecheck**

Run:

```bash
pnpm astro check
```

Expected: exit 0, 0 errors, 0 warnings. (Pre-existing hints in `recon/scripts/extract-motion.ts` and `tests/a11y.spec.ts` remain — unrelated.)

- [ ] **Step 5: Build**

Run:

```bash
pnpm astro build
```

Expected: 10 pages built, no errors. The `dist/_astro/*.css` bundle now contains the arbitrary `shadow-[…]` rules.

- [ ] **Step 6: Re-run the SnapNav regression test**

Run:

```bash
pnpm exec playwright test tests/home-snapnav.spec.ts
```

Expected: **2 passed**. The test asserts dot count + click navigation + mobile-hidden — none of those depend on the backdrop style, so the cosmetic change should not affect the suite.

- [ ] **Step 7: Live smoke test**

If the dev server is running, refresh `http://localhost:4321/` and verify visually:
- The continuous vertical pill is gone
- Each dot has its own subtle dark circular halo (~24px wide)
- The halo intensifies slightly on hover
- Dots remain readable over both dark hero images and the light news section
- Spacing between dots is unchanged (the `gap-4` on `<nav>` still controls it)

If the halo looks too heavy on dark backgrounds, dial it down in `src/components/SnapNav.astro` by changing the shadow alphas (e.g. `0.25` and `0.4` instead of `0.35` and `0.5`).

If the halo looks too weak on light backgrounds (news panel), increase the bg opacity from `bg-ink/40` to `bg-ink/55`.

- [ ] **Step 8: Commit**

```bash
git add src/components/SnapNav.astro
git commit -m "feat(snapnav): replace column pill with per-dot circular backdrop + glow"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Remove continuous pill backdrop → Step 2 strips `rounded-full bg-ink/40 px-2 py-4 backdrop-blur-sm` from `<nav>`
- ✅ Add shadow only around each circle → Step 3 adds `rounded-full bg-ink/40 backdrop-blur-sm shadow-[…]` to each `<button>` (24×24 hit-target with circular fill = halo per dot)
- ✅ Don't break existing behavior → Step 6 re-runs the Playwright regression
- ✅ Visual verification → Step 7

**2. Placeholder scan:**
- No `TBD`, `<...>`, "implement later". Both color/opacity tuning suggestions in Step 7 are conditional ("if too heavy / if too weak") and ship with concrete fallback values — they're not required placeholders.

**3. Type consistency:**
- No new types or interfaces introduced. All identifiers (`data-snapnav`, `data-snapnav-dot`, `data-active`, `data-target`) are unchanged. The IntersectionObserver script and the click handlers continue to work since selectors are untouched.
