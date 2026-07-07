# Series Images Restore + Admin Visibility Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zeta configurations of the 17 shared compression-fittings codes show their own (restored) photos, and the admin gets a per-category, per-size visibility checklist.

**Architecture:** Part 1 is data-only: map the 0040 snapshot's per-product Zeta URLs back onto family galleries as series-tagged rows (storage-verified first). Part 2 adds a `visibility` Dashboard tab backed by pure tree/toggle helpers in `src/lib/visibility.ts`; checkboxes drive the existing `products.is_hidden` flag with chunked updates.

**Tech Stack:** Postgres via Management API (Part 1), React admin island + supabase-js + vitest (Part 2).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-07-series-images-and-category-visibility-design.md`.
- One checkbox per SIZE code (user chose option B). Checkbox = NOT `is_hidden`.
- `is_active` and country groups untouched. Hidden rows always listed.
- Never insert a gallery URL whose storage object is missing (checker guards this class).
- Zeta series literal: `ζ - Zeta Series PN 16 bar`; gallery cap `MAX_FAMILY_IMAGES = 5`.
- `triggerPublish()` after successful visibility saves (matches other tabs).
- Restore + one-product live toggle test on prod were approved in the design walkthrough.

---

### Task 1: Zeta photo restore (data)

**Files:** none (Management API SQL); scratch scripts only.

- [x] **Step 1: Build + review the mapping (read-only).** For `_retired_image_urls` `source='products'` rows joined to `products` on code, keep rows where `sub_category = 'ζ - Zeta Series PN 16 bar'` and `category_name = 'Compression Fittings'`; group to distinct (family_code, url); join `product_families` (category_slug `compression-fittings`) for family_id; LEFT JOIN `storage.objects` (bucket `product-images`, `url_decode`d object path) to flag missing files; flag families already ≥ 5 images or already Zeta-tagged. Print the table.
- [x] **Step 2: Insert (write).** For each verified (family_id, url): `insert into product_family_images (family_id, url, series, sort_order) values (..., 'ζ - Zeta Series PN 16 bar', <max(sort_order)+1 per family>)`, skipping missing-storage rows. Single statement with CTEs; `returning` count.
- [x] **Step 3: Verify.** (a) per-family tag listing for the 17 codes; (b) `run_product_data_checks()` still 0 errors; (c) live: `/catalog/compression-fittings/epsilon-series-pn-16-bar-380` vs `zeta-series-pn-16-bar-380` primaries differ (browser, images decode); (d) report the shared codes still lacking a Zeta image (manual upload list for the user).

### Task 2: Pure visibility helpers (TDD)

**Files:**
- Create: `src/lib/visibility.ts`
- Test: `src/lib/visibility.test.ts`

**Interfaces — Produces:**
```ts
export interface VisibilityRow {            // subset of products
  code: string; sub_category: string | null; family_code: string | null;
  configuration: string | null; size: string | null;
  sort_order: number; is_hidden: boolean;
}
export interface SizeNode { code: string; size: string | null; hidden: boolean; }
export interface ConfigNode {
  key: string;                              // `${series}||${family_code ?? code}`
  series: string | null; familyCode: string | null; name: string;
  sizes: SizeNode[]; visible: number; total: number;
}
export interface SeriesNode {
  series: string | null; configs: ConfigNode[]; visible: number; total: number;
}
export type TriState = 'all' | 'none' | 'mixed';
export function buildVisibilityTree(rows: VisibilityRow[]): SeriesNode[];
export function triState(visible: number, total: number): TriState;
export function codesForConfig(node: ConfigNode): string[];
export function codesForSeries(node: SeriesNode): string[];
export function matchesQuery(row: VisibilityRow, q: string): boolean;
```

- [x] **Step 1: Write the failing tests** (`src/lib/visibility.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import {
  buildVisibilityTree, triState, codesForConfig, codesForSeries, matchesQuery,
  type VisibilityRow,
} from './visibility';

const row = (over: Partial<VisibilityRow>): VisibilityRow => ({
  code: 'X', sub_category: 'Epsilon', family_code: '330', configuration: 'Adaptor',
  size: '16', sort_order: 0, is_hidden: false, ...over,
});

describe('buildVisibilityTree', () => {
  const rows = [
    row({ code: 'A1', sort_order: 2 }),
    row({ code: 'A2', sort_order: 1, is_hidden: true }),
    row({ code: 'B1', family_code: '340', configuration: 'Elbow', sort_order: 5 }),
    row({ code: 'C1', sub_category: 'Zeta', family_code: '330', sort_order: 0 }),
  ];
  const tree = buildVisibilityTree(rows);
  it('groups series → configuration and counts visibility', () => {
    expect(tree.map((s) => s.series)).toEqual(['Epsilon', 'Zeta']);
    const eps = tree[0];
    expect(eps.configs.map((c) => c.familyCode)).toEqual(['330', '340']);
    expect(eps.configs[0].visible).toBe(1);
    expect(eps.configs[0].total).toBe(2);
    expect(eps.visible).toBe(2); expect(eps.total).toBe(3);
  });
  it('orders sizes by sort_order inside a configuration', () => {
    expect(tree[0].configs[0].sizes.map((s) => s.code)).toEqual(['A2', 'A1']);
  });
  it('falls back to the code when family_code is null (own card)', () => {
    const t = buildVisibilityTree([row({ code: 'F1', family_code: null })]);
    expect(t[0].configs[0].familyCode).toBeNull();
    expect(t[0].configs[0].key).toBe('Epsilon||F1');
  });
  it('groups blank series under null last', () => {
    const t = buildVisibilityTree([row({}), row({ code: 'N1', sub_category: null })]);
    expect(t.map((s) => s.series)).toEqual(['Epsilon', null]);
  });
});

describe('triState', () => {
  it('classifies all / none / mixed', () => {
    expect(triState(3, 3)).toBe('all');
    expect(triState(0, 3)).toBe('none');
    expect(triState(1, 3)).toBe('mixed');
  });
});

describe('bulk code collection', () => {
  const tree = buildVisibilityTree([
    row({ code: 'A1' }), row({ code: 'A2', is_hidden: true }),
    row({ code: 'B1', family_code: '340' }),
  ]);
  it('codesForConfig returns every size code of the card', () => {
    expect(codesForConfig(tree[0].configs[0])).toEqual(['A1', 'A2']);
  });
  it('codesForSeries returns every size code of the series', () => {
    expect(codesForSeries(tree[0]).sort()).toEqual(['A1', 'A2', 'B1']);
  });
});

describe('matchesQuery', () => {
  it('matches code, configuration name and size, case-insensitively', () => {
    expect(matchesQuery(row({ code: '330001610' }), '33000')).toBe(true);
    expect(matchesQuery(row({ configuration: 'Adaptor Male' }), 'adaptor')).toBe(true);
    expect(matchesQuery(row({ size: '16 x ⅜"' }), '16 x')).toBe(true);
    expect(matchesQuery(row({}), 'zzz')).toBe(false);
  });
  it('empty query matches everything', () => {
    expect(matchesQuery(row({}), '')).toBe(true);
  });
});
```

- [x] **Step 2: Run to verify failure.** `npx vitest run src/lib/visibility.test.ts` → FAIL (module not found).
- [x] **Step 3: Implement `src/lib/visibility.ts`:**

```ts
/** Pure helpers for the admin Visibility tab (checkbox = NOT is_hidden). */

export interface VisibilityRow {
  code: string; sub_category: string | null; family_code: string | null;
  configuration: string | null; size: string | null;
  sort_order: number; is_hidden: boolean;
}
export interface SizeNode { code: string; size: string | null; hidden: boolean; }
export interface ConfigNode {
  key: string; series: string | null; familyCode: string | null; name: string;
  sizes: SizeNode[]; visible: number; total: number;
}
export interface SeriesNode {
  series: string | null; configs: ConfigNode[]; visible: number; total: number;
}
export type TriState = 'all' | 'none' | 'mixed';

/** series → configuration (site card grain: sub_category + family_code) → sizes. */
export function buildVisibilityTree(rows: VisibilityRow[]): SeriesNode[] {
  const seriesMap = new Map<string, Map<string, VisibilityRow[]>>();
  for (const r of rows) {
    const s = r.sub_category ?? ' none';
    const cfg = `${r.sub_category ?? ''}||${r.family_code ?? r.code}`;
    const bySeries = seriesMap.get(s) ?? new Map();
    const list = bySeries.get(cfg) ?? [];
    list.push(r);
    bySeries.set(cfg, list);
    seriesMap.set(s, bySeries);
  }
  const seriesKeys = [...seriesMap.keys()].sort((a, b) =>
    a === ' none' ? 1 : b === ' none' ? -1 : a.localeCompare(b));
  return seriesKeys.map((sk) => {
    const configs = [...seriesMap.get(sk)!.entries()].map(([key, list]) => {
      const sizes = [...list].sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => ({ code: r.code, size: r.size, hidden: r.is_hidden }));
      const visible = sizes.filter((s) => !s.hidden).length;
      const first = list[0];
      return {
        key, series: first.sub_category, familyCode: first.family_code,
        name: first.configuration ?? first.family_code ?? first.code,
        sizes, visible, total: sizes.length,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return {
      series: sk === ' none' ? null : sk,
      configs,
      visible: configs.reduce((n, c) => n + c.visible, 0),
      total: configs.reduce((n, c) => n + c.total, 0),
    };
  });
}

export function triState(visible: number, total: number): TriState {
  if (total > 0 && visible === total) return 'all';
  if (visible === 0) return 'none';
  return 'mixed';
}

export function codesForConfig(node: ConfigNode): string[] {
  return node.sizes.map((s) => s.code);
}

export function codesForSeries(node: SeriesNode): string[] {
  return node.configs.flatMap(codesForConfig);
}

/** Case-insensitive match on code, configuration name, or size text. */
export function matchesQuery(row: VisibilityRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [row.code, row.configuration ?? '', row.size ?? '']
    .some((h) => h.toLowerCase().includes(needle));
}
```

- [x] **Step 4: Run to verify pass.** `npx vitest run src/lib/visibility.test.ts` → all green (then full `npm test`).
- [x] **Step 5: Commit.** `feat(admin): pure visibility-tree helpers for the checklist tab`

### Task 3: VisibilityTab component + Dashboard wiring

**Files:**
- Create: `src/components/admin/VisibilityTab.tsx`
- Modify: `src/components/admin/Dashboard.tsx` (import; `Tab` union + `HEADINGS` + Products group entry `{ id: 'visibility', label: 'Visibility' }` after `products`; render `{tab === 'visibility' && <VisibilityTab />}`)

**Interfaces — Consumes:** all Task 2 exports; `supabase` (`../../lib/supabase`); `triggerPublish` (`../../lib/publish`).

- [x] **Step 1: Component.** State: categories (`product_categories` slug+name+product_category_name, ordered by sort_order), picked slug, rows (`products` select `code, sub_category, family_code, configuration, size, sort_order, is_hidden` filtered `category_name = <picked>`, NO is_hidden filter, order `sort_order`), query, busy, error. Render: category pill buttons → search input → counter `${visible} of ${total} sizes visible` → `buildVisibilityTree(rows.filter(r => matchesQuery(r, query)))` mapped to: series header row (tri-state checkbox via `ref` `indeterminate = triState(...) === 'mixed'` + label + `visible/total`), config card row (same pattern + name + `No.<familyCode>`), size rows (checkbox + code + size). Toggle handlers: single code → `setHidden([code], !checked)`; config/series → `setHidden(codesForConfig(node)|codesForSeries(node), targetHidden)` where `targetHidden = triState !== 'all' ? false : true` (mixed/none → show all; all → hide all). `setHidden` = optimistic local update, then chunked (500) `supabase.from('products').update({ is_hidden }).in('code', chunkCodes)`; on any error re-fetch rows and show message; on success `triggerPublish()`. Match admin styling of FamiliesTab (font/heavy headers, `text-[11px] uppercase tracking` buttons).
- [x] **Step 2: Verify build + types.** `npm test` (unchanged green), `npx tsc --noEmit --ignoreDeprecations 6.0` (only the 2 pre-existing errors), `npm run build` green.
- [x] **Step 3: Commit.** `feat(admin): per-category visibility checklist tab (one checkbox per size)`

### Task 4: Live verification

- [x] **Step 1: Public loop with one product (approved in design).** Pick one size code (e.g. a 550F saddle size), `update products set is_hidden = true where code = '<code>'` via Management API → live category page count drops / size row gone from detail table → set back `false` → restored. Checker rerun: no new issues.
- [ ] **Step 2: Deploy + user click-through.** Push; after Vercel deploy the user opens Admin → Visibility, unticks/re-ticks a size, watches the site. (Admin login is the user's.)

### Task 5: Docs + memory

- [ ] Update `project_family_owned_images` memory (Zeta restore done; visibility tab exists) and tick plan checkboxes.

## Self-Review

- Spec §Part 1 (mapping via snapshot join, storage-verified, tagged inserts, untagged fallback intact, leftovers report) → Task 1. ✓
- Spec §Part 2 UI (tab, picker, tree, tri-state bulk, search, counter, always-shows-hidden) → Task 3; pure logic + tests → Task 2. ✓
- Spec semantics (is_hidden only, chunked writes, triggerPublish, SSR instant) → Tasks 2–3. ✓
- Verification (unit + one-product live loop + user UI pass) → Tasks 2/4. ✓
- Type consistency: `VisibilityRow/SeriesNode/ConfigNode/SizeNode/TriState` used identically in Tasks 2–3. ✓
