# Animation Notes

Engineering reference for motion and interaction behavior in the Astro rebuild.
Synthesized from `recon/output/motion.json` (5 sample pages, 158 animated
elements) and the screenshots under `recon/screenshots/`. Cross-references
`DESIGN.md` and `RESPONSIVE_NOTES.md`.

## Libraries used by source site

(From `recon/output/motion.json` `scripts` arrays — identical across all 5
sampled pages.)

- **fullPage.js** — section-scroll engine, loaded with parallax extension
  (`fullpage.parallax.min.js`), `scrollOverflowReset`, and `scrolloverflow`
  vendor.
- **ScrollReveal** — scroll-triggered fade/translate reveals (loaded from
  `unpkg.com/scrollreveal`, no pinned version).
- **jQuery 3.5.1** + **Bootstrap 4.5.3 bundle** — base DOM/animation host
  (Bootstrap-style transitions on its components: collapse, dropdown,
  progress, spinner).
- **Select2 4.1.0-beta.1** — form-control transitions (`0.18s` /
  `0.3s, 0.3s, 0.3s, 0.2s` compound durations seen in motion.json).
- Site script: `scripts/main.js` (init + ScrollReveal configuration).

## Choice for rebuild

The legacy stack is replaced with leaner equivalents:

- **Hover / focus / active states:** pure CSS transitions on Tailwind
  utility classes — no JS.
- **Scroll reveals:** **MotionOne** `animate()` driven by
  `IntersectionObserver`. (MotionOne accepted earlier; no library swap.)
- **Section-scroll (fullPage.js replacement):** decide per-page whether
  full-viewport snap is essential UX or a legacy choice. Default to native
  CSS `scroll-snap-type: y mandatory` on the homepage hero region if the
  visual-narrative requires it; otherwise drop it entirely.
  **Note for Task 27:** read the homepage source and confirm whether every
  screenful is a fullPage.js "section" — if yes, that's an architectural
  decision that affects page composition (each section = its own slot in
  the Astro page).
- **Slider:** **Embla** (per plan Task 23) — only on pages that actually
  use one.
- **Mobile / hamburger menu** (note: hamburger at **every** breakpoint per
  RESPONSIVE_NOTES.md): CSS `transform` + JS `aria-expanded` toggle. No
  library.

## Timing tokens

Mapping observed timings to Tailwind tokens (defined in
`tailwind-tokens.draft.mjs`):

| Observed | Token | Use case |
|----------|-------|----------|
| `0.1s ease-in-out` (38×) | `duration-micro` (100ms ease-in-out) | Bootstrap-style focus rings, select2 micro-acks |
| `0.3s ease` (5× compound) | `duration-fast` (200ms) — round down for snappier feel | Button hover, link color change |
| `0.5s ease` (60×) | `duration-base` (500ms ease) | Mobile menu open/close, scroll reveals, header bg shift |
| `1s ease` (10×) | `duration-slow` (1000ms) | Hero parallax `background-position`, large image transitions |
| `2s ease` (8×) | `duration-slower` (2000ms) | Hero H1/H2 opacity fade-in (delay 0.5s) — decorative loops only; use sparingly |

Observed easings (frequency-ranked):

- `ease` — default; most frequent on `transition`.
- `ease-in-out` — 16× (mostly Bootstrap / select2 internals).
- `cubic-bezier(0.1, 0.57, 0.1, 1)` — 9× (Material-style decelerate).

For the rebuild, prefer `cubic-bezier(0.22, 1, 0.36, 1)` (a calmer
out-quint) for reveals; reserve `ease-in-out` for hover toggles and
`linear` for marquees only.

## Per-element timing (rebuild target)

### Buttons / CTAs (Task 18)

Source uses `transition: all 0.5s ease` on every `.button-c1`, `.button-c2`,
`.button-c3` (`motion.json`, 60+ button hits). All-property is wasteful.

- Default → hover: bg shift, no translate. Transition:
  `transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease`.
- Active: no transform shift (flat design — see DESIGN.md §7).
- Focus-visible: 2px outline in brand navy `#274380`, offset 2px (per
  RESPONSIVE_NOTES + tailwind-tokens).
- "MESSAGE +" / "DISCOVER SONAN" trailing glyph stays static — no
  animated arrow on hover.

### Hamburger menu trigger (Task 20)

Hamburger is the **only** nav pattern at every breakpoint (see
RESPONSIVE_NOTES.md "Header / navigation"). No collapse threshold.

- Icon → X morph: 3 bars rotate/translate, 240ms ease.
- Drawer open: slide from right, 500ms ease (matches source's 0.5s
  default).
- Backdrop fade: 0 → 0.5 opacity, 300ms.
- Focus trap on open; `aria-expanded` toggled on the trigger.

### Scroll reveals (Task 29)

Source uses ScrollReveal with library defaults (no custom config detected
in the motion.json output beyond the script include). Reproduce as:

```js
animate(
  el,
  { opacity: [0, 1], y: [16, 0] },
  { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
);
```

- Stagger children by 80ms when parent has multiple revealable children.
- Threshold: 0.15 (15% of element in view before triggering).
- Reveal once per element (no replay on re-enter).
- Disable under `prefers-reduced-motion: reduce`.

### Header (Task 20)

`motion.json` first row: `header { transition: background-color 0.5s ease }`.

- Sticky from top; height matches source header **80px** (DESIGN.md §5).
- Transparent over hero; on scroll past `y = 80`, toggle `data-scrolled`
  on `<header>` → applies `backdrop-blur-md`, `bg-surface/80`, `shadow-sm`.
- Transition: `background-color 320ms ease, backdrop-filter 320ms ease`
  (snappier than source 500ms — see Source observations).

### Hero H1 / H2 fade-in (homepage)

`motion.json`: `transition: opacity 2s ease 0.5s` on `h1.hc1`, `h2.hc2`.
This is the most distinctive single piece of motion on the source.

- Reproduce as a one-shot reveal on page mount: `opacity 0 → 1`, 1200ms
  with 300ms delay. Source's 2s is too slow for modern feel — compressing
  to 1.2s keeps the "deliberate" tone.
- No translate; pure opacity.
- Trigger only on first paint, not on every hero return (don't re-fire if
  fullPage-style snap is in use).

### Service detail sidebar (Tasks 22 / 27)

- Active item: brand navy `#274380` background + white text (per DESIGN.md
  §2). Hover: subtle bg lift, `bg-surface/40 → bg-surface/70`, 200ms.
- On mobile (per RESPONSIVE_NOTES §"Service detail pages"): renders
  **below** main content, not in hamburger.

### Slider (Task 23) — only if a page actually uses one

`PAGE_MAP.md` shows no carousels are confirmed; the hero pagination dots
(right edge on home + about) suggest a fullPage section indicator, not a
slider. Treat slider work as conditional on Task 23 confirming a real use.

- Autoplay: 5–6s (heuristic; check actual source if Task 23 confirms a
  carousel).
- Slide transition: 500ms ease.
- Drag-free swipe enabled on touch.

### Sticky / fixed elements

- Header is the only sticky element (height 80; see Task 20).
- No detected sticky sidebars or floating CTAs in the source samples
  (motion.json's `markers` arrays are empty across all 158 entries).
- The "back-to-top" arrow chip (RESPONSIVE_NOTES §Cross-page) appears
  above the footer — show via `position: fixed` + IntersectionObserver
  on a footer sentinel; fade in/out 200ms.

### Parallax (Task 30)

The source uses `fullpage.parallax.min.js` plus
`background-position 1s ease` transitions on `.frontpage-section` and
`.fp-section` (10 occurrences in `motion.json`). This is the section
parallax behavior of fullPage.js, not an arbitrary parallax engine.

For the rebuild:

- Add parallax **only** to hero backgrounds where it adds clear value —
  most interior pages don't need it.
- Use a single `[data-parallax="0.3"]` element if any, driven by
  IntersectionObserver + `transform: translate3d(0, var(--parallax-y), 0)`.
- Pause under `prefers-reduced-motion: reduce`.

### Reduce-motion

- All non-essential transitions wrapped in
  `@media (prefers-reduced-motion: no-preference) { ... }`.
- Global fallback: a `@media (prefers-reduced-motion: reduce)` rule in
  `src/styles/global.css` (already in Task 14 spec) that sets
  `animation-duration: 0.001ms` / `transition-duration: 0.001ms` on
  `*, *::before, *::after`.
- The `anim-1` infinite loop (see below) MUST be hard-disabled under
  reduced motion — looping motion is a known vestibular trigger.

## Custom keyframes found in source

Exactly **one** site-authored keyframe was detected (`motion.json`
`keyframes` arrays, repeated across all 5 sampled pages). All other
keyframes (`progress-bar-stripes`, `spinner-border`, `spinner-grow`,
`mdc-ripple-*`) are vendor (Bootstrap + Material ripple residue).

### `anim-1` — homepage city-strip bob

Used on `a.section-1-cities-move-content` (the
"ROTTERDAM · OSLO · RIO DE JANEIRO · SINGAPORE · DUBAI · PANAMA" strip
under the hero — see RESPONSIVE_NOTES §Hero).

```
@keyframes anim-1 {
  0%, 2.5%, 6%, 10%, 27.5%, 31%, 35%,
  50%, 52.5%, 56%, 60%,
  77.5%, 81%, 85%                        { transform: translateY(0px); }
  4%, 29%, 54%, 79%                      { transform: translateY(10px); }
  8.5%, 33.5%, 58.5%, 83.5%              { transform: translateY(5px); }
}
```

- Applied via `animation: anim-1 10s ease-in-out 5s infinite` (per the
  inline `animation` block in motion.json on the same element).
- Behavior: a subtle 4-beat "drop and settle" bob — drops 10px, settles
  to 5px, returns to 0 — repeats 4 times per 10s loop (at 0%, 25%, 50%,
  75% markers). It's a decorative attention-pull on the city names.
- Rebuild verdict: **drop unless explicitly requested.** The motion is
  subtle and non-functional. If kept, gate behind
  `prefers-reduced-motion: no-preference` and consider reducing to a
  single subtler 2s ease-in-out loop with `5px` amplitude.

## Source observations

- Source's `0.5s ease` default (60 of 158 transitions) is heavy by modern
  standards. The rebuild can compress to 320–400ms for a snappier feel
  without sacrificing legibility. Note the deliberate compression in the
  commit message when changing.
- Source uses `transition: all 0.5s ease` indiscriminately on buttons and
  sections — this animates layout-affecting properties (width, padding)
  if they ever change, causing jank. Rebuild **always** enumerates
  properties (`background-color`, `color`, `transform`, `opacity`).
- The 2s hero H1/H2 opacity fade with 0.5s delay is the source's most
  recognizable motion signature. Preserve the *feel* (slow, deliberate)
  but compress duration as noted in "Hero H1 / H2 fade-in".
- The site is photography-heavy (DESIGN.md §1). Image fade-in on
  lazy-load is good practice: `loading="lazy"` + a 200ms opacity
  transition on `[data-loaded]` (toggled by an `onload` listener).
- `background-position 1s ease` on every `.fp-section` is the fullPage
  parallax extension's signature. Without fullPage.js, this transition
  has no driver; do not port the CSS as-is.
- No `box-shadow` motion (no elevation changes on hover) — consistent
  with the flat design system in DESIGN.md §7.
- Select2 and Bootstrap account for ~40 of 158 transitions
  (`0.1s ease-in-out`, `0.18s`, compound `0.3s, 0.3s, 0.3s, 0.2s`). These
  evaporate when those libraries are removed — no rebuild work required.
