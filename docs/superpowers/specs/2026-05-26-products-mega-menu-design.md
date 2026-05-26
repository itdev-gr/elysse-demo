# Products Mega-Menu — Design Spec

**Date:** 2026-05-26
**Scope:** The `Products` entry of the primary navigation only. Other L1 dropdowns (`About Us`, `Green Elysée`, `Innovation`, `Insights`, `Contact Us`) are out of scope for this spec and continue to use the existing `MegaPanel` treatment.
**Pattern reference:** A common 3-column mega-menu pattern (pill tabs → leaf links → contextual image). The pattern itself is structural inspiration; all visual treatment uses Elysée's existing brand tokens.

---

## 1. Information architecture

The `productCategories` list in `src/data/product-categories.ts` contains 13 leaf categories. The mega-menu surfaces them through **5 pill tabs**:

| Pill tab | Leaf categories (`slug`) |
|---|---|
| **Pipes** | `polyethylene-pipes`, `pvc-pressure-pipes-fittings` |
| **Fittings** | `compression-fittings`, `hydraulic-fittings`, `saddles`, `light-weight-fittings` |
| **Valves & Control** | `valves`, `filters-dosers` |
| **Irrigation** | `micro-irrigation-sprinklers`, `turf` |
| **Drainage & Cable** | `network-drainage`, `cable-applications`, `building-sewerage` |

Pill order is the order shown above. Default active pill is **Pipes**. If the current page URL matches a leaf under another pill, that pill opens by default instead.

The current `Products` entry in `navigation.ts` carries three utility children (`Categories`, `Catalogues & Leaflets`, `BIM Designs`). They are retained as a **footer strip** inside the mega panel, rendered below the 3-column grid: a single horizontal row of small text links separated by a thin top divider (`1px solid var(--c-surface-divider)`, `padding-top: 16px`, `margin-top: 24px`). This keeps existing routes reachable without competing with the pill tabs visually.

A new typed structure expresses this:

```ts
// src/data/product-megamenu.ts
export interface ProductPillTab {
  id: string;                // 'pipes' | 'fittings' | ...
  label: string;             // 'Pipes'
  icon: string;              // icon key from MegaThumb registry
  imageSrc: string;          // /images/products/megamenu/<id>.jpg
  imageAlt: string;
  leafSlugs: string[];       // references into productCategories
}

export const productPillTabs: ProductPillTab[] = [ ... ];
```

Leaf labels are looked up from `productCategories` to preserve a single source of truth — the mega-menu data only owns the grouping and the per-pill image, never the leaf names.

---

## 2. Visual treatment

All values reference existing tokens from `src/styles/tokens.css`. No new brand primitives are introduced.

| Surface | Token / value |
|---|---|
| Header background | `var(--c-brand)` `#4c6830` |
| L1 link colour (idle) | `#ffffff`, 92% opacity |
| L1 link colour (hover/active) | `var(--c-accent)` `#f37021` |
| Active L1 chevron | rotates 180° on open |
| Mega-panel surface | `var(--c-surface)` `#ffffff` |
| Mega-panel radius | `24px` |
| Mega-panel shadow | `0 20px 60px rgba(0, 0, 0, 0.12)` |
| Mega-panel ring | `1px solid rgba(0, 0, 0, 0.04)` |
| Pill (idle) | bg `#ffffff`, border `1px solid var(--c-surface-divider)`, label `var(--c-ink-muted)` |
| Pill (hover) | bg `#f5f5f5` (`--c-surface-alt`) |
| Pill (active) | bg `var(--c-accent)`, label `#ffffff`, no border |
| Pill icon | stroke `var(--c-brand)` when idle, `#ffffff` when active, `1.5` weight, `20px` |
| Leaf link (idle) | `var(--c-ink)`, `font-medium`, `15px / 22px` |
| Leaf link (hover) | translateX `4px`, underline grows from `scaleX 0 → 1` in `var(--c-brand)` |
| Right image card | radius `20px`, `aspect-ratio: 16/10`, `object-fit: cover` |
| Top-right CTA | pill button, bg `var(--c-accent)`, white label + phone icon |

Typography is unchanged: `var(--font-sans)` (Effra/Roboto) for labels.

---

## 3. Layout & dimensions

Desktop (≥ `1024px`):

- Header `height: 80px`, sticky, full-width.
- Mega panel mounts `16px` below the header bottom, `z-index: 50`.
- Panel `width: min(1200px, calc(100vw - 48px))`, horizontally centred.
- Panel `padding: 32px`.
- Internal grid: `grid-template-columns: 220px 320px 1fr; gap: 32px;`.
  - Column 1 — vertical stack of pill buttons, `gap: 8px`.
  - Column 2 — vertical stack of leaf links, `gap: 14px`.
  - Column 3 — single image card filling the column, `min-height: 280px`.
- Backdrop scrim sits below the panel, above page content: `rgba(10, 33, 63, 0.45)` (`--c-accent-navy` at 45%), pointer-events: none on the panel area.

Mobile (`< 1024px`):

- Existing `MobileMegaNav.tsx` accordion stays.
- The new pill grouping is reflected: each pill becomes an accordion section, leaf links nested below.

---

## 4. Components

New files inside `src/components/nav/`:

| File | Purpose |
|---|---|
| `ProductsMegaPanel.tsx` | Top-level panel for the `Products` L1. Owns active-pill state, keyboard handling, intent-delay timers. |
| `ProductPillTab.tsx` | Single pill button. Shares `layoutId="products-active-pill"` for the sliding orange indicator. |
| `ProductLeafList.tsx` | Middle column. Reads leaf labels from `productCategories` by slug. |
| `ProductContextImage.tsx` | Right column. Image swap on tab change. |
| `ProductUtilityStrip.tsx` | Bottom strip rendering the 3 utility links (`Categories`, `Catalogues & Leaflets`, `BIM Designs`) sourced from `navigation.ts`. |

Touched:

| File | Change |
|---|---|
| `MegaNav.tsx` | When the active L1 is `Products`, render `ProductsMegaPanel` instead of the generic `MegaPanel`. All other L1s still use `MegaPanel`. |
| `MobileMegaNav.tsx` | Add the pill-grouped accordion view for `Products`. |
| `data/product-megamenu.ts` | New file (defined in §1). |
| `data/navigation.ts` | The `Products` entry in `primaryNav` gains a `variant: 'pill-tabs'` marker so `MegaNav` can branch. |

No other component or page file is modified by this spec.

---

## 5. Motion

Already on `motion@^12`. `useReducedMotion` is already imported in `MegaNav.tsx`. All animations below collapse to instant when reduced motion is requested.

| Interaction | Animation |
|---|---|
| Panel open | `opacity 0 → 1`, `y: -8 → 0`, `200ms`, `easeOut`. Backdrop fades in parallel. |
| Panel close | Reverse, `150ms`. |
| Tab switch (middle + right columns) | `AnimatePresence` keyed by active pill `id`. Outgoing: `opacity 1 → 0`, `y: 0 → -6`, `120ms`. Incoming: `opacity 0 → 1`, `y: 6 → 0`, `160ms`, with `60ms` delay so the swap reads as one beat. |
| Active pill indicator | `motion.div` with `layoutId="products-active-pill"`, `spring { stiffness: 400, damping: 32 }`. The orange fill physically slides between pills. |
| Pill hover (idle pills) | `bg-color` transitions `180ms`, `easeOut`. |
| Leaf link hover | `x: 0 → 4px` and underline `scaleX: 0 → 1` from `transform-origin: left`, both `180ms`. |
| Top-right CTA hover | `scale: 1 → 1.03`, `120ms`. |

All durations are sourced from the `--dur-*` tokens in `tokens.css` where they match; otherwise they are local constants in `megaAnim.ts`.

---

## 6. Behaviour

- **Open trigger:** hover (with the existing 120ms intent delay in `MegaNav.tsx`) **or** click/focus on the L1 trigger.
- **Close:** mouse leave (120ms grace), `Escape`, or click outside the panel.
- **Default active pill:** `pipes`. If `window.location.pathname` matches a leaf slug under a different pill, that pill is selected instead.
- **Keyboard:** `Tab` reaches the L1 trigger → `ArrowDown` opens the panel and focuses the first pill → `ArrowUp/Down` cycles pills → `Tab` moves focus into the leaf list → `Shift+Tab` walks back. `Enter` activates the focused link.
- **Focus trap:** while the panel is open, `Tab` does NOT escape the panel until the user presses `Escape` or clicks outside.
- **Hit-area:** pills are full-width within their column, `min-height: 44px`.

---

## 7. Out of scope

- The other 5 L1 mega-panels (no changes).
- Any page-level template work (product detail, category landing, etc.).
- Search overlay, language switcher, account widgets.
- Adding new categories or renaming existing ones in `product-categories.ts`.

---

## 8. Open assumptions

1. Per-pill imagery files will live at `/public/images/products/megamenu/{pipes,fittings,valves-control,irrigation,drainage-cable}.jpg`. If the assets are not yet available, the `MegaThumb` placeholder is used (icon keyed by pill).
2. The `Products` L1 trigger remains labelled `Products` (current value in `primaryNav`).
3. `MobileMegaNav.tsx` already supports nested accordion children; if not, that work is added to the implementation plan as a prerequisite step.
