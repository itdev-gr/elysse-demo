# Country Picker Featured Countries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-21-country-picker-featured-countries-design.md`

**Goal:** Let the admin manage which countries appear (and in what order) above the separator in the catalog's "Select your country" popup, from the Country Groups dashboard tab.

**Architecture:** A nullable `featured_order` column on `group_countries` (seeded with the currently hardcoded five) replaces `TOP_CODES` in `CountryModal.astro`; pure helpers in a new `src/lib/picker-countries.ts` do the ordering/partitioning for both the SSR modal and a new management panel at the top of `GroupsTab.tsx`.

**Tech Stack:** Astro SSR + React islands (TypeScript, Tailwind), Supabase (Postgres + RLS), Vitest.

## Global Constraints

- **NO `git commit` at any step** — the user reviews and approves first. Where a plan would normally commit, stop; the final task presents the diff.
- Seed exactly the current hardcoded list so the popup is unchanged at deploy: cy=1, at=2, eg=3, lb=4, gr=5.
- No RLS changes: `authenticated full access` (ALL) and `public read` on `group_countries` already cover the new column.
- The popup's "rest" section stays alphabetical by label; empty featured list → no separator; Supabase-unreachable fallback renders the full static `COUNTRIES` list with no top section.
- Admin mutations renumber 1..n, persist, reload, and call `triggerPublish()` (tab convention). The tab's search does not filter the new panel.
- Tests: `npm test` (vitest). Typecheck: `npx astro check` (baseline has 1 pre-existing error in `src/lib/catalogues.test.ts` — no NEW errors allowed).
- Migrations are applied to the live project with the Supabase MCP `apply_migration` tool (project `hsamhykaqmiiheneonxz`), name `0048_group_countries_featured_order`, after the file is written to the repo.

## File Structure

- Create: `supabase/migrations/0048_group_countries_featured_order.sql` — column + seed.
- Create: `src/lib/picker-countries.ts` — pure ordering/partition/move helpers.
- Create: `src/lib/picker-countries.test.ts` — their tests.
- Modify: `src/types/product.ts:42-51` — `GroupCountry.featured_order`.
- Modify: `src/components/catalog/CountryModal.astro:1-20` — DB-driven top section.
- Modify: `src/components/admin/GroupsTab.tsx` — "top countries" panel.

---

### Task 1: Pure helpers — `src/lib/picker-countries.ts` (TDD)

**Files:**
- Create: `src/lib/picker-countries.ts`
- Test: `src/lib/picker-countries.test.ts`

**Interfaces:**
- Consumes: nothing from this repo (pure module).
- Produces (later tasks import these exact names):
  - `interface PickerFeaturedRow { country_code: string | null; featured_order: number | null }`
  - `featuredCodes(rows: PickerFeaturedRow[]): Map<string, number>` — lowercased code → order; skips null codes/orders; lowest order wins on duplicates.
  - `partitionPickerCountries<T extends { code: string; label: string }>(pool: T[], featured: Map<string, number>): { top: T[]; rest: T[] }` — `top` sorted by the map's order, `rest` alphabetical by `label`.
  - `featuredPickerList<T extends PickerFeaturedRow>(rows: T[]): T[]` — rows with a non-null `featured_order`, sorted by it.
  - `moveFeatured<T>(list: T[], index: number, dir: 'up' | 'down'): T[]` — swap one step, clamped at the edges (returns the same array contents when clamped or out of range).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/picker-countries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  featuredCodes, partitionPickerCountries, featuredPickerList, moveFeatured,
} from './picker-countries';

const row = (country_code: string | null, featured_order: number | null) =>
  ({ country_code, featured_order });

describe('featuredCodes', () => {
  it('maps lowercased codes to their order, skipping unfeatured and null codes', () => {
    const m = featuredCodes([row('CY', 1), row('gr', 5), row('au', null), row(null, 2)]);
    expect([...m.entries()]).toEqual([['cy', 1], ['gr', 5]]);
  });
  it('keeps the lowest order when a code appears twice', () => {
    const m = featuredCodes([row('cy', 4), row('cy', 1)]);
    expect(m.get('cy')).toBe(1);
  });
});

describe('partitionPickerCountries', () => {
  const pool = [
    { code: 'at', label: 'Austria' },
    { code: 'cy', label: 'Cyprus' },
    { code: 'eg', label: 'Egypt' },
    { code: 'gr', label: 'Greece' },
  ];
  it('splits pool into featured (by order) and the rest (alphabetical)', () => {
    const { top, rest } = partitionPickerCountries(pool, new Map([['cy', 1], ['at', 2]]));
    expect(top.map((c) => c.code)).toEqual(['cy', 'at']);
    expect(rest.map((c) => c.code)).toEqual(['eg', 'gr']);
  });
  it('returns an empty top when nothing is featured', () => {
    const { top, rest } = partitionPickerCountries(pool, new Map());
    expect(top).toEqual([]);
    expect(rest.map((c) => c.code)).toEqual(['at', 'cy', 'eg', 'gr']);
  });
});

describe('featuredPickerList', () => {
  it('keeps only featured rows, sorted by featured_order', () => {
    const rows = [row('gr', 5), row('cy', 1), row('au', null)];
    expect(featuredPickerList(rows).map((r) => r.country_code)).toEqual(['cy', 'gr']);
  });
});

describe('moveFeatured', () => {
  const list = ['a', 'b', 'c'];
  it('moves an item up and down', () => {
    expect(moveFeatured(list, 2, 'up')).toEqual(['a', 'c', 'b']);
    expect(moveFeatured(list, 0, 'down')).toEqual(['b', 'a', 'c']);
  });
  it('clamps at the edges', () => {
    expect(moveFeatured(list, 0, 'up')).toEqual(['a', 'b', 'c']);
    expect(moveFeatured(list, 2, 'down')).toEqual(['a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- src/lib/picker-countries.test.ts`
Expected: FAIL — cannot resolve `./picker-countries`.

- [ ] **Step 3: Implement**

Create `src/lib/picker-countries.ts`:

```ts
/** The slice of a group_countries row the picker helpers need. */
export interface PickerFeaturedRow {
  country_code: string | null;
  featured_order: number | null;
}

/** Lowercased ISO code → featured position. Lowest order wins on duplicates. */
export function featuredCodes(rows: PickerFeaturedRow[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.featured_order == null || !r.country_code) continue;
    const code = r.country_code.toLowerCase();
    const cur = m.get(code);
    if (cur === undefined || r.featured_order < cur) m.set(code, r.featured_order);
  }
  return m;
}

/**
 * Split the picker's country pool into the admin-pinned top section (in the
 * admin's order) and the rest (alphabetical) — the popup renders a separator
 * between the two when both are non-empty.
 */
export function partitionPickerCountries<T extends { code: string; label: string }>(
  pool: T[],
  featured: Map<string, number>,
): { top: T[]; rest: T[] } {
  const top = pool
    .filter((c) => featured.has(c.code))
    .sort((a, b) => featured.get(a.code)! - featured.get(b.code)!);
  const rest = pool
    .filter((c) => !featured.has(c.code))
    .sort((a, b) => a.label.localeCompare(b.label));
  return { top, rest };
}

/** Featured rows only, in featured_order — the admin panel's list. */
export function featuredPickerList<T extends PickerFeaturedRow>(rows: T[]): T[] {
  return rows
    .filter((r) => r.featured_order != null)
    .sort((a, b) => a.featured_order! - b.featured_order!);
}

/** Swap one step up/down, clamped at the edges. */
export function moveFeatured<T>(list: T[], index: number, dir: 'up' | 'down'): T[] {
  const to = dir === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list];
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test -- src/lib/picker-countries.test.ts`
Expected: 7 tests PASS.

- [ ] **Step 5: Full suite**

Run: `npm test`
Expected: all PASS. (Do NOT commit — user reviews at the end.)

---

### Task 2: Migration 0048 + `GroupCountry` type

**Files:**
- Create: `supabase/migrations/0048_group_countries_featured_order.sql`
- Modify: `src/types/product.ts:42-51`

**Interfaces:**
- Produces: `group_countries.featured_order integer null` in the live DB; `GroupCountry.featured_order: number | null` for Tasks 3–4. `GroupCountryDraft` keeps `featured_order` OPTIONAL so existing inserts (`GroupCountryForm`) stay valid.

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/0048_group_countries_featured_order.sql`:

```sql
-- Admin-managed "top of the country picker": null = normal country; 1..n =
-- pinned position above the separator in the catalog's country popup.
-- Seeded with the previously hardcoded TOP_CODES (CountryModal.astro) so the
-- popup is unchanged at deploy time.
alter table public.group_countries
  add column if not exists featured_order integer;

update public.group_countries gc
set featured_order = v.ord
from (values ('cy', 1), ('at', 2), ('eg', 3), ('lb', 4), ('gr', 5)) as v(code, ord)
where lower(gc.country_code) = v.code;
```

- [ ] **Step 2: Apply it to the live project**

Use the Supabase MCP tool `apply_migration` with project id `hsamhykaqmiiheneonxz`, name `0048_group_countries_featured_order`, and the file's SQL.

- [ ] **Step 3: Verify the seed**

Run via MCP `execute_sql`:

```sql
select lower(country_code) as code, featured_order
from group_countries where featured_order is not null order by featured_order;
```

Expected: exactly `cy 1, at 2, eg 3, lb 4, gr 5`.

- [ ] **Step 4: Update the type**

In `src/types/product.ts`, change the `GroupCountry` block (lines 42-51) to:

```ts
export interface GroupCountry {
  id: string;
  group_code: string;
  country: string;
  country_code: string | null;
  sort_order: number;
  /** null = normal; 1..n = position in the country picker's pinned top section. */
  featured_order: number | null;
  created_at: string;
  updated_at: string;
}
export type GroupCountryDraft =
  Omit<GroupCountry, 'id' | 'created_at' | 'updated_at' | 'featured_order'>
  & { featured_order?: number | null };
```

- [ ] **Step 5: Verify types**

Run: `npx astro check`
Expected: no NEW errors (baseline: 1 pre-existing in `src/lib/catalogues.test.ts`).

---

### Task 3: `CountryModal.astro` — DB-driven top section

**Files:**
- Modify: `src/components/catalog/CountryModal.astro:1-20` (frontmatter only; the template already renders `groups` with a separator between non-empty groups)

**Interfaces:**
- Consumes: `featuredCodes`, `partitionPickerCountries` from Task 1; `featured_order` column from Task 2.

- [ ] **Step 1: Replace the frontmatter**

Replace lines 1-20 of `src/components/catalog/CountryModal.astro` with:

```astro
---
import { COUNTRIES } from '../../data/catalog-countries';
import { supabase } from '../../lib/supabase';
import { featuredCodes, partitionPickerCountries } from '../../lib/picker-countries';

const { data: mapped } = await supabase
  .from('group_countries')
  .select('country_code, country, featured_order')
  .order('country', { ascending: true });
const rows = (mapped ?? []) as { country_code: string | null; country: string; featured_order: number | null }[];
const codes = new Set(rows.map((m) => m.country_code?.toLowerCase()).filter(Boolean));
// Fallback: the full static list (no pinned section) when Supabase is unreachable.
const pool = codes.size > 0 ? COUNTRIES.filter((c) => codes.has(c.code)) : COUNTRIES;

// Admin-pinned markets above a separator (group_countries.featured_order),
// managed in the dashboard's Country Groups tab.
const { top, rest } = partitionPickerCountries([...pool], featuredCodes(rows));
const groups = [top, rest].filter((g) => g.length > 0);
---
```

(Everything from `<div` down is untouched. The hardcoded `TOP_CODES` is gone.)

- [ ] **Step 2: Verify SSR output locally**

Run: `npm run dev` (background), then:

```bash
curl -s "http://localhost:4322/catalog/turf/" \
  | grep -o 'data-value="[^"]*"' | head -7
```

Expected: first five are `cy, at, eg, lb, gr` (the seed), then the alphabetical rest begins (`af`, …). Also confirm one separator:

```bash
curl -s "http://localhost:4322/catalog/turf/" | grep -c 'role="separator"'
```

Expected: `1`.

- [ ] **Step 3: Tests + typecheck**

Run: `npm test` and `npx astro check`
Expected: all PASS; no new check errors.

---

### Task 4: GroupsTab — "Country picker — top countries" panel

**Files:**
- Modify: `src/components/admin/GroupsTab.tsx`

**Interfaces:**
- Consumes: `featuredPickerList`, `moveFeatured` from Task 1; `GroupCountry.featured_order` from Task 2; existing `load()`, `setError`, `triggerPublish`.

- [ ] **Step 1: Add imports and state**

In `src/components/admin/GroupsTab.tsx`, extend the imports:

```ts
import { featuredPickerList, moveFeatured } from '../../lib/picker-countries';
```

Inside the component add state (next to the existing `useState` calls):

```ts
  const [addId, setAddId] = useState('');
  const [savingFeatured, setSavingFeatured] = useState(false);
```

- [ ] **Step 2: Add derived lists + persistence**

After the `load` definition (below the `useEffect` that calls it), add:

```ts
  // ── Country picker top list (group_countries.featured_order) ─────────────
  const featured = featuredPickerList(countries);
  // One entry per ISO code, alphabetical, excluding the already-pinned ones.
  const addPool = countries
    .filter((c) => c.country_code && c.featured_order == null)
    .filter((c, i, arr) => arr.findIndex((x) => x.country_code === c.country_code) === i)
    .sort((a, b) => a.country.localeCompare(b.country));

  // Persist the full new top list: renumber 1..n, null-out anything dropped.
  const persistFeatured = async (next: GroupCountry[]) => {
    if (savingFeatured) return;
    setSavingFeatured(true);
    setError(null);
    const dropped = featured.filter((f) => !next.some((n) => n.id === f.id));
    const results = await Promise.all([
      ...next.map((r, i) =>
        supabase.from('group_countries').update({ featured_order: i + 1 }).eq('id', r.id)),
      ...dropped.map((r) =>
        supabase.from('group_countries').update({ featured_order: null }).eq('id', r.id)),
    ]);
    const failed = results.find((r) => r.error);
    if (failed?.error) setError(failed.error.message);
    await load();
    setSavingFeatured(false);
    triggerPublish();
  };
```

- [ ] **Step 3: Render the panel**

In the returned JSX, directly BEFORE the search block (`{groups !== null && (<div className="mb-6"> <SearchInput …`), insert:

```tsx
      {groups !== null && (
        <section className="border border-ink/10 p-5 mb-8">
          <h3 className="font-heavy text-lg">Country picker — top countries</h3>
          <p className="text-xs text-ink/55 mb-4">
            Pinned above the separator in the catalog&rsquo;s &ldquo;Select your country&rdquo; popup, in this order.
          </p>
          {featured.length === 0 ? (
            <p className="text-sm text-ink/50 mb-4">None — the popup shows one flat alphabetical list.</p>
          ) : (
            <ol className="flex flex-col gap-1 mb-4 max-w-md">
              {featured.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-[10px] text-ink/40 w-4 text-right">{i + 1}</span>
                  <span>{c.country}</span>
                  <span className="font-mono text-[10px] text-ink/50 uppercase">{c.country_code}</span>
                  <span className="ml-auto inline-flex items-center gap-1">
                    <button type="button" aria-label={`Move ${c.country} up`} disabled={savingFeatured || i === 0}
                      onClick={() => persistFeatured(moveFeatured(featured, i, 'up'))}
                      className="px-1.5 text-ink/60 hover:text-brand-500 disabled:opacity-30 cursor-pointer">↑</button>
                    <button type="button" aria-label={`Move ${c.country} down`} disabled={savingFeatured || i === featured.length - 1}
                      onClick={() => persistFeatured(moveFeatured(featured, i, 'down'))}
                      className="px-1.5 text-ink/60 hover:text-brand-500 disabled:opacity-30 cursor-pointer">↓</button>
                    <button type="button" aria-label={`Remove ${c.country} from the top list`} disabled={savingFeatured}
                      onClick={() => persistFeatured(featured.filter((x) => x.id !== c.id))}
                      className="px-1.5 text-red-600 hover:text-red-800 disabled:opacity-30 cursor-pointer">×</button>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="flex items-center gap-3">
            <select value={addId} onChange={(e) => setAddId(e.currentTarget.value)} disabled={savingFeatured}
              className="bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="">— add country —</option>
              {addPool.map((c) => (
                <option key={c.id} value={c.id}>{c.country}</option>
              ))}
            </select>
            <button type="button" disabled={savingFeatured || !addId}
              onClick={() => {
                const chosen = countries.find((c) => c.id === addId);
                if (chosen) { persistFeatured([...featured, chosen]); setAddId(''); }
              }}
              className="text-[11px] text-brand-500 uppercase tracking-[0.2em] disabled:opacity-40 cursor-pointer">
              Add
            </button>
          </div>
        </section>
      )}
```

- [ ] **Step 4: Tests + typecheck**

Run: `npm test` and `npx astro check`
Expected: all PASS; no new check errors.

---

### Task 5: End-to-end verification + user review (NO commit)

**Files:** none (verification only)

- [ ] **Step 1: Full suite + typecheck**

Run: `npm test` and `npx astro check` → all PASS / no new errors.

- [ ] **Step 2: Local SSR check**

With `npm run dev` running, repeat Task 3 Step 2's curl checks (top five = seeded order, exactly one separator).

- [ ] **Step 3: Browser verification (after the user approves deploy)**

1. Admin → Country Groups: the panel lists Cyprus, Austria, Egypt, Lebanon, Greece (1-5).
2. Reorder one (↑/↓), unpin one (×), add one via the select — each persists after reload.
3. Catalog page (fresh incognito or cleared pick): the popup's top section matches the panel within ~1 minute (s-maxage=60); the separator disappears if the list is emptied (restore the list afterwards).

- [ ] **Step 4: Present the diff to the user**

Show `git status` + diff summary. **Do not commit** — wait for explicit approval.
