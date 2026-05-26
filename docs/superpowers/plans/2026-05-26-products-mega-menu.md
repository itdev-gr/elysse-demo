# Products Mega-Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **User preference — commits:** Per the user's saved memory, do NOT run `git commit` until the user explicitly approves the change set. The commit steps below are written ready-to-run, but the executing agent must pause and ask before executing them.

**Goal:** Add a 3-column pill-tab mega-menu to the `Products` entry of the primary navigation — pills (left), leaf links (middle), contextual image (right) — restyled entirely to Elysée's brand tokens. Other L1 dropdowns continue to use the existing `MegaPanel`.

**Architecture:** New `ProductsMegaPanel` React island renders only when the active L1 is `Products`. State (active pill) lives in the panel; data (`pillTabs`, `leafSlugs`) lives in a new `src/data/product-megamenu.ts` so the panel is purely presentational. Animation uses `motion@^12` with `layoutId` for the sliding pill indicator and `AnimatePresence` for tab-switch cross-fade. `MegaNav.tsx` branches on a new `variant: 'pill-tabs'` marker added to the `Products` entry in `navigation.ts`.

**Tech Stack:** Astro 6 · React 19 · `motion@^12` · Tailwind v4 · vitest (data/unit) · Playwright (interaction)

**Spec:** `docs/superpowers/specs/2026-05-26-products-mega-menu-design.md`

---

## File Map

**Create:**
- `src/data/product-megamenu.ts` — pill tab structure + leaf resolver
- `src/data/product-megamenu.test.ts` — vitest unit tests
- `src/components/nav/ProductsMegaPanel.tsx` — top-level panel
- `src/components/nav/ProductPillTab.tsx` — single pill button (shared `layoutId`)
- `src/components/nav/ProductLeafList.tsx` — middle column
- `src/components/nav/ProductContextImage.tsx` — right column
- `src/components/nav/ProductUtilityStrip.tsx` — bottom strip (Categories / Catalogues / BIM)
- `tests/products-megamenu.spec.ts` — Playwright smoke

**Modify:**
- `src/data/navigation.ts` — add `variant?` field to `NavItem`; mark Products entry with `variant: 'pill-tabs'`
- `src/components/nav/megaAnim.ts` — add `tabSwitchVariants` + `pillSpring`
- `src/components/nav/MegaNav.tsx` — branch to `ProductsMegaPanel` when active group is Products
- `src/components/nav/MobileMegaNav.tsx` — pill-grouped accordion for Products

---

## Task 1: Extend `NavItem` with `variant` and tag Products

**Files:**
- Modify: `src/data/navigation.ts` (interface + the `Products` entry inside `primaryNav` / `megaNav`)

- [ ] **Step 1: Add `variant` to `NavItem` interface**

In `src/data/navigation.ts` at the top, change the `NavItem` interface to add the field:

```ts
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  image?: string;
  caption?: string;
  icon?: 'sparkles' | 'chart' | 'lightbulb' | 'handshake' | 'newspaper' | 'pencil' | 'marquee' | 'play' | 'book' | 'pin' | 'globe' | 'dot';
  /** Mega-panel variant. Defaults to the standard `MegaPanel`. */
  variant?: 'pill-tabs';
}
```

- [ ] **Step 2: Add `variant: 'pill-tabs'` to the Products entry**

In the same file, find the `Products` entry inside `primaryNav` and add the marker:

```ts
{
  label: 'Products',
  href: '/products/',
  variant: 'pill-tabs',
  children: [
    { label: 'Categories', href: '/products/' },
    { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
    { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/' },
  ],
},
```

Also add the same `variant: 'pill-tabs'` to the matching `Products` group inside `megaNav` (Column 2, the `Products` `MegaGroup` — add it as a property on the group object by extending `MegaGroup`):

In the same file extend the `MegaGroup` interface:

```ts
export interface MegaGroup {
  title: string;
  href?: string;
  items: NavItem[];
  /** Optional variant flag matching `NavItem.variant`. */
  variant?: 'pill-tabs';
}
```

Then add `variant: 'pill-tabs'` to the existing `{ title: 'Products', ... }` group in `megaNav`.

- [ ] **Step 3: Build to verify the types still compile**

Run: `pnpm astro check`
Expected: passes with 0 errors related to `navigation.ts`.

- [ ] **Step 4: Pause for user commit approval**

Per user preference, ask the user before running:

```bash
git add src/data/navigation.ts
git commit -m "feat(nav): add variant marker to NavItem and tag Products as pill-tabs"
```

---

## Task 2: Build the data layer (`product-megamenu.ts`)

**Files:**
- Create: `src/data/product-megamenu.ts`
- Create: `src/data/product-megamenu.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/product-megamenu.test.ts`:

```ts
import { describe, test, expect } from 'vitest';
import {
  productPillTabs,
  getLeavesForTab,
  resolveDefaultTab,
} from './product-megamenu';
import { productCategories } from './product-categories';

describe('product-megamenu data', () => {
  test('exposes exactly 5 pill tabs in fixed order', () => {
    expect(productPillTabs.map((t) => t.id)).toEqual([
      'pipes',
      'fittings',
      'valves-control',
      'irrigation',
      'drainage-cable',
    ]);
  });

  test('every pill references valid category slugs', () => {
    const known = new Set(productCategories.map((c) => c.slug));
    for (const tab of productPillTabs) {
      for (const slug of tab.leafSlugs) {
        expect(known.has(slug), `unknown slug "${slug}" in tab "${tab.id}"`).toBe(true);
      }
    }
  });

  test('every category slug belongs to exactly one pill (no orphans, no dupes)', () => {
    const allSlugs = productCategories.map((c) => c.slug).sort();
    const pillSlugs = productPillTabs.flatMap((t) => t.leafSlugs).sort();
    expect(pillSlugs).toEqual(allSlugs);
  });

  test('getLeavesForTab returns category objects in the order declared on the tab', () => {
    const leaves = getLeavesForTab('fittings');
    expect(leaves.map((l) => l.slug)).toEqual([
      'compression-fittings',
      'hydraulic-fittings',
      'saddles',
      'light-weight-fittings',
    ]);
  });

  test('resolveDefaultTab picks the tab whose leaf matches the current pathname', () => {
    expect(resolveDefaultTab('/catalog/saddles/')).toBe('fittings');
    expect(resolveDefaultTab('/catalog/turf/')).toBe('irrigation');
  });

  test('resolveDefaultTab falls back to "pipes" when no match', () => {
    expect(resolveDefaultTab('/about-us/')).toBe('pipes');
    expect(resolveDefaultTab('/')).toBe('pipes');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/data/product-megamenu.test.ts`
Expected: FAIL with "Cannot find module './product-megamenu'".

- [ ] **Step 3: Implement the data file**

Create `src/data/product-megamenu.ts`:

```ts
import { productCategories, type ProductCategory } from './product-categories';

export type ProductPillId =
  | 'pipes'
  | 'fittings'
  | 'valves-control'
  | 'irrigation'
  | 'drainage-cable';

export interface ProductPillTab {
  id: ProductPillId;
  label: string;
  icon: 'pipe' | 'fitting' | 'valve' | 'sprinkler' | 'drain';
  imageSrc: string;
  imageAlt: string;
  leafSlugs: string[];
}

/**
 * Grouping of the 13 `productCategories` slugs into 5 pill tabs.
 * Order here is the order shown in the mega-menu (top to bottom).
 */
export const productPillTabs: ProductPillTab[] = [
  {
    id: 'pipes',
    label: 'Pipes',
    icon: 'pipe',
    imageSrc: '/images/products/megamenu/pipes.jpg',
    imageAlt: 'Coils of polyethylene pipe in the Elysée warehouse',
    leafSlugs: ['polyethylene-pipes', 'pvc-pressure-pipes-fittings'],
  },
  {
    id: 'fittings',
    label: 'Fittings',
    icon: 'fitting',
    imageSrc: '/images/products/megamenu/fittings.jpg',
    imageAlt: 'Assortment of Elysée compression and hydraulic fittings',
    leafSlugs: [
      'compression-fittings',
      'hydraulic-fittings',
      'saddles',
      'light-weight-fittings',
    ],
  },
  {
    id: 'valves-control',
    label: 'Valves & Control',
    icon: 'valve',
    imageSrc: '/images/products/megamenu/valves-control.jpg',
    imageAlt: 'Brass and polymer valves on an Elysée test rig',
    leafSlugs: ['valves', 'filters-dosers'],
  },
  {
    id: 'irrigation',
    label: 'Irrigation',
    icon: 'sprinkler',
    imageSrc: '/images/products/megamenu/irrigation.jpg',
    imageAlt: 'Field installation of micro-irrigation tubing',
    leafSlugs: ['micro-irrigation-sprinklers', 'turf'],
  },
  {
    id: 'drainage-cable',
    label: 'Drainage & Cable',
    icon: 'drain',
    imageSrc: '/images/products/megamenu/drainage-cable.jpg',
    imageAlt: 'Stacks of corrugated drainage and cable conduit pipe',
    leafSlugs: ['network-drainage', 'cable-applications', 'building-sewerage'],
  },
];

const slugToCategory = new Map<string, ProductCategory>(
  productCategories.map((c) => [c.slug, c]),
);

export function getLeavesForTab(id: ProductPillId): ProductCategory[] {
  const tab = productPillTabs.find((t) => t.id === id);
  if (!tab) return [];
  const out: ProductCategory[] = [];
  for (const slug of tab.leafSlugs) {
    const cat = slugToCategory.get(slug);
    if (cat) out.push(cat);
  }
  return out;
}

export function resolveDefaultTab(pathname: string): ProductPillId {
  const match = pathname.match(/\/catalog\/([^/]+)\/?/);
  const slug = match?.[1];
  if (slug) {
    const hit = productPillTabs.find((t) => t.leafSlugs.includes(slug));
    if (hit) return hit.id;
  }
  return 'pipes';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/data/product-megamenu.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Pause for user commit approval**

```bash
git add src/data/product-megamenu.ts src/data/product-megamenu.test.ts
git commit -m "feat(nav): add Products mega-menu pill grouping data + tests"
```

---

## Task 3: Extend `megaAnim.ts` with tab-switch + pill-spring variants

**Files:**
- Modify: `src/components/nav/megaAnim.ts`

- [ ] **Step 1: Append new variants**

Add at the end of `src/components/nav/megaAnim.ts`:

```ts
/**
 * Tab-switch cross-fade for the Products mega-panel middle + image columns.
 * Outgoing exits up-and-out, incoming enters up-and-in.
 */
export const tabSwitchVariants: Variants = {
  enter: { opacity: 0, y: 6 },
  active: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE_OUT, delay: 0.06 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.12, ease: EASE_IN },
  },
};

/** Spring used by the sliding pill indicator (shared `layoutId`). */
export const pillSpring = { type: 'spring', stiffness: 400, damping: 32 } as const;
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/megaAnim.ts
git commit -m "feat(nav): add tabSwitchVariants and pillSpring for Products panel"
```

---

## Task 4: `ProductPillTab.tsx`

**Files:**
- Create: `src/components/nav/ProductPillTab.tsx`

- [ ] **Step 1: Implement the pill button**

Create `src/components/nav/ProductPillTab.tsx`:

```tsx
import { motion } from 'motion/react';
import type { ProductPillTab as PillTabData } from '../../data/product-megamenu';
import { pillSpring } from './megaAnim';

type Props = {
  tab: PillTabData;
  isActive: boolean;
  onActivate: () => void;
  onFocus: () => void;
};

const PILL_ICON_PATHS: Record<PillTabData['icon'], string> = {
  pipe: 'M3 8h14a4 4 0 0 1 0 8H3M3 6v12',
  fitting: 'M4 12h6m4 0h6M10 8a4 4 0 0 1 4 0v8a4 4 0 0 1-4 0z',
  valve: 'M12 4v4M12 16v4M4 12h4M16 12h4M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  sprinkler: 'M12 3v5M5 9l3 2M19 9l-3 2M4 14c2-1 4-1 8-1s6 0 8 1M6 19h12',
  drain: 'M4 7h16M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v4M14 11v4',
};

export default function ProductPillTab({ tab, isActive, onActivate, onFocus }: Props) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`product-tabpanel-${tab.id}`}
      id={`product-tab-${tab.id}`}
      data-product-pill={tab.id}
      onClick={onActivate}
      onFocus={onFocus}
      className={`relative flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-fast min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        isActive ? 'text-white' : 'text-ink-muted hover:bg-surface-alt border border-surface-divider'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="products-active-pill"
          transition={pillSpring}
          className="absolute inset-0 rounded-full bg-brand-accent"
          aria-hidden="true"
        />
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`relative h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-brand-500'}`}
        aria-hidden="true"
      >
        <path d={PILL_ICON_PATHS[tab.icon]} />
      </svg>
      <span className="relative">{tab.label}</span>
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors related to this file.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/ProductPillTab.tsx
git commit -m "feat(nav): add ProductPillTab with shared layoutId indicator"
```

---

## Task 5: `ProductLeafList.tsx`

**Files:**
- Create: `src/components/nav/ProductLeafList.tsx`

- [ ] **Step 1: Implement**

Create `src/components/nav/ProductLeafList.tsx`:

```tsx
import { motion } from 'motion/react';
import { getLeavesForTab, type ProductPillId } from '../../data/product-megamenu';
import { tabSwitchVariants } from './megaAnim';

type Props = { activeTabId: ProductPillId };

export default function ProductLeafList({ activeTabId }: Props) {
  const leaves = getLeavesForTab(activeTabId);
  return (
    <motion.ul
      key={activeTabId}
      role="tabpanel"
      id={`product-tabpanel-${activeTabId}`}
      aria-labelledby={`product-tab-${activeTabId}`}
      variants={tabSwitchVariants}
      initial="enter"
      animate="active"
      exit="exit"
      className="flex flex-col gap-3.5"
    >
      {leaves.map((leaf) => (
        <li key={leaf.slug}>
          <a
            href={`/catalog/${leaf.slug}/`}
            data-product-leaf={leaf.slug}
            className="group inline-flex items-center text-[15px] font-medium leading-[22px] text-ink transition-transform duration-fast hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            <span className="relative">
              {leaf.name}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-fast group-hover:scale-x-100"
                aria-hidden="true"
              />
            </span>
          </a>
        </li>
      ))}
    </motion.ul>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/ProductLeafList.tsx
git commit -m "feat(nav): add ProductLeafList middle column with hover micro-interaction"
```

---

## Task 6: `ProductContextImage.tsx`

**Files:**
- Create: `src/components/nav/ProductContextImage.tsx`

- [ ] **Step 1: Implement**

Create `src/components/nav/ProductContextImage.tsx`:

```tsx
import { motion } from 'motion/react';
import { productPillTabs, type ProductPillId } from '../../data/product-megamenu';
import { tabSwitchVariants } from './megaAnim';
import MegaThumb from './MegaThumb';

type Props = { activeTabId: ProductPillId };

export default function ProductContextImage({ activeTabId }: Props) {
  const tab = productPillTabs.find((t) => t.id === activeTabId);
  if (!tab) return null;
  return (
    <motion.div
      key={activeTabId}
      variants={tabSwitchVariants}
      initial="enter"
      animate="active"
      exit="exit"
      className="relative aspect-[16/10] w-full min-h-[280px] overflow-hidden rounded-[20px] bg-ink/5"
    >
      <img
        src={tab.imageSrc}
        alt={tab.imageAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 -z-10">
        <MegaThumb label={tab.label} icon="dot" />
      </div>
    </motion.div>
  );
}
```

(The `onError` + layered `MegaThumb` provides the spec's graceful fallback when the JPG asset is not yet on disk.)

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/ProductContextImage.tsx
git commit -m "feat(nav): add ProductContextImage with MegaThumb fallback"
```

---

## Task 7: `ProductUtilityStrip.tsx`

**Files:**
- Create: `src/components/nav/ProductUtilityStrip.tsx`

- [ ] **Step 1: Implement**

Create `src/components/nav/ProductUtilityStrip.tsx`:

```tsx
import type { NavItem } from '../../data/navigation';

type Props = { items: NavItem[] };

export default function ProductUtilityStrip({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-surface-divider pt-4">
      {items.map((it) => {
        const external = /^https?:\/\//.test(it.href);
        return (
          <a
            key={it.href}
            href={it.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            data-product-utility={it.href}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors duration-fast hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            {it.label}
          </a>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/ProductUtilityStrip.tsx
git commit -m "feat(nav): add ProductUtilityStrip retaining Categories/Catalogues/BIM links"
```

---

## Task 8: `ProductsMegaPanel.tsx` (compose)

**Files:**
- Create: `src/components/nav/ProductsMegaPanel.tsx`

- [ ] **Step 1: Implement**

Create `src/components/nav/ProductsMegaPanel.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup } from '../../data/navigation';
import {
  productPillTabs,
  resolveDefaultTab,
  type ProductPillId,
} from '../../data/product-megamenu';
import { panelVariants } from './megaAnim';
import ProductPillTab from './ProductPillTab';
import ProductLeafList from './ProductLeafList';
import ProductContextImage from './ProductContextImage';
import ProductUtilityStrip from './ProductUtilityStrip';

type Props = { group: MegaGroup };

export default function ProductsMegaPanel({ group }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ProductPillId>(() =>
    typeof window === 'undefined' ? 'pipes' : resolveDefaultTab(window.location.pathname),
  );
  const tabListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActive(resolveDefaultTab(window.location.pathname));
  }, []);

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = productPillTabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = productPillTabs[(idx + 1) % productPillTabs.length];
      setActive(next.id);
      tabListRef.current?.querySelector<HTMLButtonElement>(`[data-product-pill="${next.id}"]`)?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = productPillTabs[(idx - 1 + productPillTabs.length) % productPillTabs.length];
      setActive(prev.id);
      tabListRef.current?.querySelector<HTMLButtonElement>(`[data-product-pill="${prev.id}"]`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(productPillTabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(productPillTabs[productPillTabs.length - 1].id);
    }
  };

  return (
    <motion.div
      key={group.title}
      variants={panelVariants}
      initial={reduce ? false : 'closed'}
      animate="open"
      exit="closed"
      className="w-full"
      data-products-mega-panel
    >
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="rounded-[24px] bg-surface p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_320px_1fr]">
            <div
              ref={tabListRef}
              role="tablist"
              aria-orientation="vertical"
              aria-label="Product categories"
              onKeyDown={onTabKey}
              className="flex flex-col gap-2"
            >
              {productPillTabs.map((tab) => (
                <ProductPillTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === active}
                  onActivate={() => setActive(tab.id)}
                  onFocus={() => setActive(tab.id)}
                />
              ))}
            </div>

            <div className="min-h-[280px]">
              <AnimatePresence mode="wait" initial={false}>
                <ProductLeafList key={active} activeTabId={active} />
              </AnimatePresence>
            </div>

            <div className="min-h-[280px]">
              <AnimatePresence mode="wait" initial={false}>
                <ProductContextImage key={active} activeTabId={active} />
              </AnimatePresence>
            </div>
          </div>

          <ProductUtilityStrip items={group.items} />
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors related to this file.

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add src/components/nav/ProductsMegaPanel.tsx
git commit -m "feat(nav): compose ProductsMegaPanel with pill tablist + AnimatePresence"
```

---

## Task 9: Wire `MegaNav.tsx` to branch on variant

**Files:**
- Modify: `src/components/nav/MegaNav.tsx`

- [ ] **Step 1: Import `ProductsMegaPanel`**

Near the top of `src/components/nav/MegaNav.tsx`, add the import (right after the existing `MegaPanel` import):

```tsx
import ProductsMegaPanel from './ProductsMegaPanel';
```

- [ ] **Step 2: Branch in the render**

Find where `MegaPanel` is rendered inside `MegaNav.tsx` (typically inside the `AnimatePresence` block that mounts the active group's panel). Replace the single line:

```tsx
<MegaPanel group={group} />
```

with:

```tsx
{group.variant === 'pill-tabs' ? (
  <ProductsMegaPanel group={group} />
) : (
  <MegaPanel group={group} />
)}
```

(The exact line numbers depend on the current `MegaNav.tsx`; locate the `MegaPanel` usage and swap as shown.)

- [ ] **Step 3: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 4: Start dev server + smoke check**

Run: `pnpm dev`
In a browser, open `http://localhost:4321/`, hover the `Products` L1 trigger. Confirm the panel that mounts is the new 3-column pill layout (not the old `MegaPanel`). Confirm other dropdowns (`About Us`, etc.) still render with the old `MegaPanel`.

- [ ] **Step 5: Commit (pause for user approval)**

```bash
git add src/components/nav/MegaNav.tsx
git commit -m "feat(nav): route Products L1 to ProductsMegaPanel via variant flag"
```

---

## Task 10: Pill-grouped accordion in `MobileMegaNav.tsx`

**Files:**
- Modify: `src/components/nav/MobileMegaNav.tsx`

- [ ] **Step 1: Add pill-grouped section**

Inside `MobileMegaNav.tsx`, find the loop that renders each `MegaGroup`. For the group whose `variant === 'pill-tabs'`, render its leaves grouped by pill instead of as a flat list. Add this conditional inside the existing per-group render:

```tsx
import {
  productPillTabs,
  getLeavesForTab,
} from '../../data/product-megamenu';

// ... inside the per-group render block, replace the standard items list when
// group.variant === 'pill-tabs' with:

{group.variant === 'pill-tabs' ? (
  <div className="flex flex-col gap-4">
    {productPillTabs.map((pill) => (
      <section key={pill.id} className="border-l-2 border-brand-accent pl-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
          {pill.label}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          {getLeavesForTab(pill.id).map((leaf) => (
            <li key={leaf.slug}>
              <a
                href={`/catalog/${leaf.slug}/`}
                className="text-sm font-medium text-ink hover:text-brand-accent"
              >
                {leaf.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}
    {/* Keep the 3 utility children (Categories / Catalogues / BIM) below the pill sections */}
    <ul className="mt-4 border-t border-surface-divider pt-3 flex flex-col gap-2">
      {group.items.map((it) => (
        <li key={it.href}>
          <a href={it.href} className="text-xs uppercase tracking-wide text-ink-muted hover:text-brand-accent">
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
) : (
  // ... existing per-item render path stays unchanged here
)}
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Mobile smoke**

Run: `pnpm dev`
In a browser at viewport `<1024px` (DevTools device toolbar), open the mobile drawer, expand `Products`. Confirm 5 pill sections render with their leaf links, followed by the utility strip.

- [ ] **Step 4: Commit (pause for user approval)**

```bash
git add src/components/nav/MobileMegaNav.tsx
git commit -m "feat(nav): pill-grouped accordion for Products in MobileMegaNav"
```

---

## Task 11: Playwright smoke test

**Files:**
- Create: `tests/products-megamenu.spec.ts`

- [ ] **Step 1: Write the test**

Create `tests/products-megamenu.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };

test.describe('Products mega-menu (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  });

  test('opens pill panel when Products trigger is activated', async ({ page }) => {
    const products = page.locator('[data-nav-group]', { hasText: 'Products' });
    await products.locator('[data-nav-trigger]').click();
    const panel = page.locator('[data-products-mega-panel]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[role="tab"]')).toHaveCount(5);
  });

  test('default active pill is "pipes" on the home page', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    const pipesPill = page.locator('[data-product-pill="pipes"]');
    await expect(pipesPill).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking a different pill swaps the leaf list', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    await page.locator('[data-product-pill="fittings"]').click();
    await expect(page.locator('[data-product-pill="fittings"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-product-leaf="compression-fittings"]')).toBeVisible();
    await expect(page.locator('[data-product-leaf="saddles"]')).toBeVisible();
  });

  test('utility strip exposes Categories / Catalogues / BIM links', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    const panel = page.locator('[data-products-mega-panel]');
    await expect(panel.locator('[data-product-utility="/products/"]')).toBeVisible();
    await expect(panel.locator('[data-product-utility="/products/catalogues/"]')).toBeVisible();
    await expect(panel.locator('[data-product-utility="https://elysee.partcommunity.com/"]')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec playwright test tests/products-megamenu.spec.ts`
Expected: PASS (4 tests). (Requires dev server running on `:4321` — start it in another terminal first with `pnpm dev`.)

- [ ] **Step 3: Commit (pause for user approval)**

```bash
git add tests/products-megamenu.spec.ts
git commit -m "test(nav): Playwright smoke for Products mega-menu"
```

---

## Task 12: Final verification + handoff

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit suite**

Run: `pnpm vitest run`
Expected: all tests pass.

- [ ] **Step 2: Run the full Playwright suite**

Run: `pnpm exec playwright test`
Expected: all tests pass, including pre-existing `nav.spec.ts`.

- [ ] **Step 3: Type-check + build**

Run: `pnpm astro check && pnpm build`
Expected: build completes with no errors.

- [ ] **Step 4: Manual visual check**

In `pnpm dev`, walk through:
- (a) Hover `Products` → panel opens with green header, white rounded panel, 5 pills, default `Pipes` active in orange
- (b) Click `Fittings` pill → orange indicator slides; middle column + right image cross-fade
- (c) Hover a leaf link → text slides 4px right; green underline grows
- (d) Press `Escape` → panel closes
- (e) Open with keyboard: `Tab` to Products trigger → `ArrowDown` → focus enters tablist → `ArrowDown` cycles pills → `Tab` moves into leaf list
- (f) Toggle `prefers-reduced-motion` in DevTools (Rendering tab) → confirm animations collapse to instant
- (g) Resize to 1023px width → confirm panel hides and `MobileMegaNav` accordion appears with pill sections

- [ ] **Step 5: Report back to the user**

Hand off with a one-sentence summary of what was built and the commit list still awaiting user approval.

---

## Spec self-review

Checked against `2026-05-26-products-mega-menu-design.md`:

| Spec section | Covered by |
|---|---|
| §1 IA — 5 pills, 13 leaves | Task 2 (data + tests) |
| §1 Utility strip (Categories / Catalogues / BIM) | Task 7 + Task 8 composition |
| §2 Visual treatment — all brand tokens | Tasks 4–8 (Tailwind classes use `brand-500`, `brand-accent`, `ink`, `ink-muted`, `surface`, `surface-alt`, `surface-divider`) |
| §3 Layout `220px / 320px / 1fr`, 24px radius, 1200px max | Task 8 |
| §4 Components (5 new + 4 touched) | Tasks 4–10 |
| §5 Motion — open/close, tab switch, layoutId pill, link hover | Tasks 3, 4, 5, 6, 8 |
| §6 Behaviour — keyboard, default-pill, focus | Task 8 (key handler), Task 4 (focus styles) |
| §7 Out of scope | Honoured — no other L1, no page-template, no search |
| §8 Open assumptions — image fallback, mobile accordion prereq | Task 6 (onError fallback), Task 10 (accordion build-out) |

No gaps. No placeholders. Method names consistent across tasks (`resolveDefaultTab`, `getLeavesForTab`, `productPillTabs`).
