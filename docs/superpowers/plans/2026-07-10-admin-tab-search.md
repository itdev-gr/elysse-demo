# Admin Tab Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a text search box to the nine `/admin/` tabs that don't have one: Jobs, Messages, Certifications, Catalogues, Categories, Families, Country Groups, Data Errors, Images.

**Architecture:** All nine tabs already load their full datasets client-side, so search is pure in-memory, case-insensitive substring filtering. One shared `SearchInput` component (the admin's existing underline style) + one shared `matchesFields()` predicate. Structured tabs (Catalogues, Categories, Families, Groups) get pure tree/group-aware filter helpers in their existing `src/lib/<domain>.ts` files, each TDD'd with vitest. Flat tabs filter inline behind `useMemo`, like ProductsTab does.

**Tech Stack:** Astro 6 + React 19 islands, Tailwind 4, Supabase (reads already in place — untouched), vitest.

**Spec:** `docs/superpowers/specs/2026-07-10-admin-tab-search-design.md`

## Global Constraints

- **NO `git commit` / `git push` at any point.** The user reviews and approves all changes first (standing user rule — overrides this plan template's usual commit steps). Leave everything in the working tree.
- Preserve the existing admin design: new inputs reproduce the exact underline idiom `w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500`.
- Do not touch tabs that already have search (Products, Countries, Visibility, the six Insights tabs) and do not refactor their inline inputs.
- Matching rule everywhere: `query.trim().toLowerCase()`; empty/whitespace query = no filtering; `null`/`undefined` fields never crash.
- Filtering must never mutate source arrays (bulk actions and counts operate on full data).
- Tests: `npx vitest run <file>` per task; full `npm test` + `npm run build` at the end.
- `curly` quotes in user-facing empty states follow existing copy style: `No countries match &ldquo;{query}&rdquo;.` uses HTML entities in JSX text — reuse that pattern (`&ldquo;`/`&rdquo;`).

---

### Task 1: Shared predicate `matchesFields` + `SearchInput` component

**Files:**
- Create: `src/lib/admin-search.ts`
- Create: `src/lib/admin-search.test.ts`
- Create: `src/components/admin/SearchInput.tsx`

**Interfaces:**
- Produces: `matchesFields(query: string, fields: (string | null | undefined)[]): boolean` — used by every later task.
- Produces: `SearchInput` React component, default export, props `{ value: string; onChange: (value: string) => void; placeholder: string }` — used by every later task.

- [ ] **Step 1: Write the failing test**

Create `src/lib/admin-search.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { matchesFields } from './admin-search';

describe('matchesFields', () => {
  it('matches everything when the query is empty', () => {
    expect(matchesFields('', ['abc'])).toBe(true);
  });
  it('matches everything when the query is whitespace', () => {
    expect(matchesFields('   ', ['abc'])).toBe(true);
  });
  it('matches case-insensitive substrings', () => {
    expect(matchesFields('WELD', ['Machine Welding'])).toBe(true);
    expect(matchesFields('weld', ['MACHINE WELDING'])).toBe(true);
  });
  it('matches when any one field hits', () => {
    expect(matchesFields('sales', ['Engineer', 'Sales Department'])).toBe(true);
  });
  it('skips null and undefined fields without crashing', () => {
    expect(matchesFields('x', [null, undefined, 'ax'])).toBe(true);
    expect(matchesFields('x', [null, undefined])).toBe(false);
  });
  it('returns false when nothing matches', () => {
    expect(matchesFields('zzz', ['abc', 'def'])).toBe(false);
  });
  it('trims the query before matching', () => {
    expect(matchesFields('  sales  ', ['Sales'])).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/admin-search.test.ts`
Expected: FAIL — cannot resolve `./admin-search`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/admin-search.ts`:

```ts
/** Case-insensitive substring match across a row's searchable fields.
 *  Empty/whitespace query matches everything; null fields are skipped. */
export function matchesFields(query: string, fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return fields.some((v) => v?.toLowerCase().includes(q));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/admin-search.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Create the SearchInput component**

Create `src/components/admin/SearchInput.tsx`:

```tsx
interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** The admin's standard underline search box (same idiom as ProductsTab / CountriesTab). */
export default function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
    />
  );
}
```

No component test — the repo has no DOM test setup; the component is pure presentation and is exercised by the build in Task 11.

---

### Task 2: Jobs tab search

**Files:**
- Modify: `src/components/admin/JobsTab.tsx`

**Interfaces:**
- Consumes: `matchesFields` from `../../lib/admin-search`, `SearchInput` from `./SearchInput` (Task 1).

- [ ] **Step 1: Add imports and state**

In `src/components/admin/JobsTab.tsx`, change the react import (line 1) and add two imports after the existing ones:

```tsx
import { useEffect, useMemo, useState } from 'react';
```

```tsx
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';
```

Below `const [mode, setMode] = useState<Mode>({ kind: 'list' });` add:

```tsx
  const [query, setQuery] = useState('');
```

- [ ] **Step 2: Add the filtered list**

After the `remove` function, before `return`, add:

```tsx
  const visible = useMemo(
    () => (jobs ?? []).filter((j) => matchesFields(query, [j.title, j.department, j.location, j.employment_type])),
    [jobs, query],
  );
```

- [ ] **Step 3: Render the search box and filter the table**

Directly after the closing `</div>` of the `mb-6` block containing the "+ New job" button, add:

```tsx
          <div className="mb-6">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title, department, location…" />
          </div>
```

Change the list branch from:

```tsx
          {jobs === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-ink/60">No jobs yet. Create the first one.</p>
          ) : (
```

to:

```tsx
          {jobs === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-ink/60">No jobs yet. Create the first one.</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-ink/60">No jobs match &ldquo;{query}&rdquo;.</p>
          ) : (
```

and change the row source from `{jobs.map((j) => {` to `{visible.map((j) => {`.

- [ ] **Step 4: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 3: Messages tab search

**Files:**
- Modify: `src/components/admin/MessagesTab.tsx`

**Interfaces:**
- Consumes: `matchesFields`, `SearchInput` (Task 1).

- [ ] **Step 1: Add imports and state**

Add after the existing imports:

```tsx
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';
```

Below `const [sourceFilter, setSourceFilter] = useState<string>('all');` add:

```tsx
  const [query, setQuery] = useState('');
```

- [ ] **Step 2: AND the text query into the existing filter**

Change the `visible` memo from:

```tsx
  const visible = useMemo(() => {
    if (!rows) return [];
    return rows.filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (sourceFilter === 'all' || r.source === sourceFilter),
    );
  }, [rows, statusFilter, sourceFilter]);
```

to:

```tsx
  const visible = useMemo(() => {
    if (!rows) return [];
    return rows.filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (sourceFilter === 'all' || r.source === sourceFilter) &&
        matchesFields(query, [r.name, r.email, r.company, r.phone, r.message]),
    );
  }, [rows, statusFilter, sourceFilter, query]);
```

- [ ] **Step 3: Render the search box and fix the empty state**

Inside the `mb-6 flex flex-wrap items-center gap-x-6 gap-y-3` filter row, add the search input as the FIRST child (before the status-button group):

```tsx
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, company, message…" />
```

Change the empty state from:

```tsx
        <p className="text-sm text-ink/60">No enquiries{statusFilter !== 'all' || sourceFilter !== 'all' ? ' match this filter' : ' yet'}.</p>
```

to:

```tsx
        <p className="text-sm text-ink/60">No enquiries{statusFilter !== 'all' || sourceFilter !== 'all' || query.trim() !== '' ? ' match this filter' : ' yet'}.</p>
```

- [ ] **Step 4: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 4: Certifications tab search

**Files:**
- Modify: `src/components/admin/CertificationsTab.tsx`

**Interfaces:**
- Consumes: `matchesFields`, `SearchInput` (Task 1).

- [ ] **Step 1: Add imports and state**

Add after the existing imports:

```tsx
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';
```

Below `const [category, setCategory] = useState<string>('all');` add:

```tsx
  const [query, setQuery] = useState('');
```

- [ ] **Step 2: AND the text query into the `visible` memo**

Change:

```tsx
  const visible = useMemo(
    () =>
      sortCertifications(
        (certs ?? []).filter(
          (c) =>
            c.cert_group === group &&
            (group !== 'quality' || category === 'all' || c.category === category),
        ),
      ),
    [certs, group, category],
  );
```

to:

```tsx
  const visible = useMemo(
    () =>
      sortCertifications(
        (certs ?? []).filter(
          (c) =>
            c.cert_group === group &&
            (group !== 'quality' || category === 'all' || c.category === category) &&
            matchesFields(query, [c.name, c.description, c.scope, c.tag]),
        ),
      ),
    [certs, group, category, query],
  );
```

- [ ] **Step 3: Render the search box and fix the empty state**

After the group-toggle/`+ New certificate` header block (the `mb-4 flex items-center justify-between gap-4 flex-wrap` div) — and after the conditional quality-category chips block that follows it — add, immediately before the `{certs === null ? (` branch:

```tsx
          <div className="mb-6">
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, description, scope…" />
          </div>
```

Change the empty state from:

```tsx
            <p className="text-sm text-ink/60">No certifications in this group yet. Create the first one.</p>
```

to:

```tsx
            <p className="text-sm text-ink/60">
              {query.trim() !== ''
                ? <>No certifications match &ldquo;{query}&rdquo;.</>
                : 'No certifications in this group yet. Create the first one.'}
            </p>
```

- [ ] **Step 4: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 5: Data Errors tab search

**Files:**
- Modify: `src/components/admin/DataErrorsTab.tsx`

**Interfaces:**
- Consumes: `matchesFields`, `SearchInput` (Task 1).

- [ ] **Step 1: Add imports and state**

Add after the existing imports:

```tsx
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';
```

Below `const [lastRun, setLastRun] = useState<string | null>(null);` add:

```tsx
  const [query, setQuery] = useState('');
```

- [ ] **Step 2: Filter the list — headline counts stay global**

The `errors` / `warnings` headline derives from ALL open rows and must not change. After those two lines:

```tsx
  const errors = rows.filter((r) => r.severity === 'error');
  const warnings = rows.filter((r) => r.severity === 'warning');
```

add:

```tsx
  const visible = rows.filter((r) => matchesFields(query, [r.code, r.issue_type, r.message]));
```

- [ ] **Step 3: Render the search box and switch the list**

After the `X errors · Y warnings open.` paragraph, add:

```tsx
      <div className="mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search code, issue type, message…" />
      </div>
```

Change the list branch from:

```tsx
      {rows.length === 0 ? (
        <p className="text-sm text-ink/60">No open data issues.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
```

to:

```tsx
      {rows.length === 0 ? (
        <p className="text-sm text-ink/60">No open data issues.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-ink/60">No issues match &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
```

- [ ] **Step 4: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 6: Images tab search

**Files:**
- Modify: `src/components/admin/ImagesTab.tsx`

**Interfaces:**
- Consumes: `matchesFields`, `SearchInput` (Task 1). Only the Images tab's own LibraryGrid is filtered — the Families-modal picker is untouched.

- [ ] **Step 1: Add imports and state**

Change the react import to include `useMemo`:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

Add after the existing imports:

```tsx
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';
```

Below `const [libError, setLibError] = useState<string | null>(null);` add:

```tsx
  const [query, setQuery] = useState('');
```

- [ ] **Step 2: Add the filtered list**

After the `loadImages` callback definition, add:

```tsx
  const visible = useMemo(
    () => (images ?? []).filter((img) => matchesFields(query, [img.filename, img.family_code])),
    [images, query],
  );
```

- [ ] **Step 3: Render the search box, count, and filtered grid**

In the Library section, change the count span from:

```tsx
          {images && (
            <span className="text-xs text-ink/55">{images.length} image{images.length !== 1 ? 's' : ''}</span>
          )}
```

to:

```tsx
          {images && (
            <span className="text-xs text-ink/55">
              {query.trim() !== ''
                ? `${visible.length} of ${images.length}`
                : `${images.length} image${images.length !== 1 ? 's' : ''}`}
            </span>
          )}
```

Directly after the `flex items-center justify-between mb-4` header div (before the `{libError && …}` block), add:

```tsx
        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search filename or family code…" />
        </div>
```

Change the grid render from:

```tsx
          <LibraryGrid images={images} onDelete={handleDelete} />
```

to:

```tsx
          <LibraryGrid
            images={visible}
            onDelete={handleDelete}
            emptyLabel={query.trim() !== '' ? `No images match “${query}”.` : 'No images in the library yet.'}
          />
```

- [ ] **Step 4: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 7: Catalogues — tree filter helper + wire-up

**Files:**
- Modify: `src/lib/catalogues.ts`
- Modify: `src/lib/catalogues.test.ts`
- Modify: `src/components/admin/CataloguesTab.tsx`

**Interfaces:**
- Consumes: `matchesFields` (Task 1), existing `CatalogueNode` / `buildCatalogueTree`.
- Produces: `filterCatalogueTree(tree: CatalogueNode[], query: string): CatalogueNode[]`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/catalogues.test.ts` (it already imports `buildCatalogueTree` and has a module-scope `row()` builder — extend the import line to also pull `filterCatalogueTree`):

```ts
describe('filterCatalogueTree', () => {
  const tree = () =>
    buildCatalogueTree([
      row({ id: 'c1', name: 'Compression Fittings', sort_order: 1 }),
      row({ id: 's1', parent_id: 'c1', name: 'Zeta Series', sort_order: 1 }),
      row({ id: 's2', parent_id: 'c1', name: 'Epsilon Series', description: 'PN 16', sort_order: 2 }),
      row({ id: 'c2', name: 'Valves', sort_order: 2 }),
      row({ id: 's3', parent_id: 'c2', name: 'Ball Valves', sort_order: 1 }),
    ]);

  it('returns the whole tree for an empty query', () => {
    expect(filterCatalogueTree(tree(), '')).toEqual(tree());
  });
  it('a matching category keeps ALL its children', () => {
    const out = filterCatalogueTree(tree(), 'compression');
    expect(out.map((c) => c.id)).toEqual(['c1']);
    expect(out[0].children.map((s) => s.id)).toEqual(['s1', 's2']);
  });
  it('a matching subcategory keeps its parent, siblings drop', () => {
    const out = filterCatalogueTree(tree(), 'zeta');
    expect(out.map((c) => c.id)).toEqual(['c1']);
    expect(out[0].children.map((s) => s.id)).toEqual(['s1']);
  });
  it('matches on description too', () => {
    const out = filterCatalogueTree(tree(), 'pn 16');
    expect(out[0].children.map((s) => s.id)).toEqual(['s2']);
  });
  it('categories with no match drop out entirely', () => {
    expect(filterCatalogueTree(tree(), 'ball').map((c) => c.id)).toEqual(['c2']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterCatalogueTree(tree(), 'zzz')).toEqual([]);
  });
  it('does not mutate the input tree', () => {
    const input = tree();
    filterCatalogueTree(input, 'zeta');
    expect(input[0].children.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/catalogues.test.ts`
Expected: FAIL — `filterCatalogueTree` is not exported.

- [ ] **Step 3: Write the implementation**

In `src/lib/catalogues.ts`, add `import { matchesFields } from './admin-search';` and, after `buildCatalogueTree`:

```ts
/** Admin search over the catalogue tree. A category that matches keeps all its
 *  children; otherwise only its matching children remain, and categories left
 *  with no matches drop out entirely. */
export function filterCatalogueTree(tree: CatalogueNode[], query: string): CatalogueNode[] {
  if (query.trim() === '') return tree;
  const matches = (row: Catalogue) => matchesFields(query, [row.name, row.description]);
  return tree.flatMap((cat) => {
    if (matches(cat)) return [cat];
    const children = cat.children.filter(matches);
    return children.length > 0 ? [{ ...cat, children }] : [];
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/catalogues.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into CataloguesTab**

In `src/components/admin/CataloguesTab.tsx`:

Change the lib import to include the new helper:

```tsx
import { buildCatalogueTree, filterCatalogueTree } from '../../lib/catalogues';
```

Add `import SearchInput from './SearchInput';` after the other component imports.

Below `const [mode, setMode] = useState<Mode>({ kind: 'list' });` add:

```tsx
  const [query, setQuery] = useState('');
```

After the `tree` memo, add:

```tsx
  const shownTree = useMemo(() => filterCatalogueTree(tree, query), [tree, query]);
```

Directly after the `mb-6 flex items-center justify-between gap-4 flex-wrap` header div (description + "+ New category"), add:

```tsx
          <div className="mb-6">
            <SearchInput value={query} onChange={setQuery} placeholder="Search category or subcategory…" />
          </div>
```

Change the list branch from:

```tsx
          {rows === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : tree.length === 0 ? (
            <p className="text-sm text-ink/60">No catalogues yet. Create the first category.</p>
          ) : (
```

to:

```tsx
          {rows === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : tree.length === 0 ? (
            <p className="text-sm text-ink/60">No catalogues yet. Create the first category.</p>
          ) : shownTree.length === 0 ? (
            <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
          ) : (
```

and the table body source from `{tree.map((cat) => (` to `{shownTree.map((cat) => (`.

- [ ] **Step 6: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 8: Categories — card filter helper + wire-up

**Files:**
- Modify: `src/lib/categories.ts`
- Create: `src/lib/categories.test.ts`
- Modify: `src/components/admin/CategoriesTab.tsx`

**Interfaces:**
- Consumes: `matchesFields` (Task 1), existing `ProductCategory` / `ProductSubcategory` types.
- Produces: `filterCategoryCards(cats: ProductCategory[], subs: ProductSubcategory[], query: string): { cat: ProductCategory; subs: ProductSubcategory[] }[]` (exported interface name: `CategoryCardMatch`).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/categories.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterCategoryCards } from './categories';
import type { ProductCategory, ProductSubcategory } from './categories';

const cat = (over: Partial<ProductCategory>): ProductCategory => ({
  slug: 'x', name: 'X', sort_order: 0, image: '', source_image: null, leaflet_pdf: null,
  blurb: null, product_category_name: null, category_letter: null, is_active: true,
  name_i18n: null, blurb_i18n: null, ...over,
});
const sub = (over: Partial<ProductSubcategory>): ProductSubcategory => ({
  id: 'id', category_slug: 'x', name: 'S', sort_order: 0, is_active: true, name_i18n: null, ...over,
});

const cats = [
  cat({ slug: 'compression', name: 'Compression Fittings' }),
  cat({ slug: 'valves', name: 'Valves' }),
];
const subs = [
  sub({ id: 's1', category_slug: 'compression', name: 'Zeta Series' }),
  sub({ id: 's2', category_slug: 'compression', name: 'Epsilon Series' }),
  sub({ id: 's3', category_slug: 'valves', name: 'Ball Valves' }),
];

describe('filterCategoryCards', () => {
  it('empty query returns every category with its full series list', () => {
    const out = filterCategoryCards(cats, subs, '');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression', 'valves']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(out[1].subs.map((s) => s.id)).toEqual(['s3']);
  });
  it('a category matching by name keeps its full series list', () => {
    const out = filterCategoryCards(cats, subs, 'fittings');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1', 's2']);
  });
  it('matches by slug too', () => {
    expect(filterCategoryCards(cats, subs, 'compr').map((m) => m.cat.slug)).toEqual(['compression']);
  });
  it('when only a series matches, the series list narrows to the matches', () => {
    const out = filterCategoryCards(cats, subs, 'zeta');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1']);
  });
  it('a series match in one category does not resurrect another', () => {
    expect(filterCategoryCards(cats, subs, 'ball').map((m) => m.cat.slug)).toEqual(['valves']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterCategoryCards(cats, subs, 'zzz')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/categories.test.ts`
Expected: FAIL — `filterCategoryCards` is not exported.

- [ ] **Step 3: Write the implementation**

In `src/lib/categories.ts`, add `import { matchesFields } from './admin-search';` and, after the `ProductSubcategory` interface:

```ts
export interface CategoryCardMatch {
  cat: ProductCategory;
  subs: ProductSubcategory[];
}

/** Admin search over the Categories tab cards. A category whose name or slug
 *  matches keeps its full series list; otherwise only matching series remain,
 *  and categories with no match at all drop out. */
export function filterCategoryCards(
  cats: ProductCategory[],
  subs: ProductSubcategory[],
  query: string,
): CategoryCardMatch[] {
  const subsFor = (cat: ProductCategory) => subs.filter((s) => s.category_slug === cat.slug);
  if (query.trim() === '') return cats.map((cat) => ({ cat, subs: subsFor(cat) }));
  const out: CategoryCardMatch[] = [];
  for (const cat of cats) {
    const all = subsFor(cat);
    if (matchesFields(query, [cat.name, cat.slug])) {
      out.push({ cat, subs: all });
      continue;
    }
    const matching = all.filter((s) => matchesFields(query, [s.name]));
    if (matching.length > 0) out.push({ cat, subs: matching });
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/categories.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Wire into CategoriesTab**

In `src/components/admin/CategoriesTab.tsx`:

Extend the categories import:

```tsx
import { filterCategoryCards } from '../../lib/categories';
import type { ProductCategory, ProductSubcategory } from '../../lib/categories';
```

Add `import SearchInput from './SearchInput';` after the other component imports.

Below `const [editingSub, setEditingSub] = useState<string | null>(null);` add:

```tsx
  const [query, setQuery] = useState('');
```

Directly after the `flex justify-end mb-4` div holding "+ New category" (and before the `{creating && …}` line), add:

```tsx
      <div className="mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search category or series…" />
      </div>
```

Change the list rendering. From:

```tsx
      {cats !== null && (
        <div className="space-y-6">
          {cats.map((cat) => {
            const catSubs = subs.filter((s) => s.category_slug === cat.slug);
```

to:

```tsx
      {cats !== null && filterCategoryCards(cats, subs, query).length === 0 && query.trim() !== '' && (
        <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
      )}
      {cats !== null && (
        <div className="space-y-6">
          {filterCategoryCards(cats, subs, query).map(({ cat, subs: catSubs }) => {
```

The rest of the map body already uses `cat` and `catSubs` — leave it untouched. Mutations (`addSub` duplicate check, `rescan`) read the full `subs` state directly, so filtering the render source is safe.

Note: the empty-series line `{catSubs.length === 0 && addingSubFor !== cat.slug && <p ...>No series.</p>}` now also shows when a query filtered all series away but the category name matched — that is correct only when the category has no series at all. Change that line to:

```tsx
                {catSubs.length === 0 && addingSubFor !== cat.slug && (
                  <p className="text-sm text-ink/50">{query.trim() !== '' ? 'No matching series.' : 'No series.'}</p>
                )}
```

- [ ] **Step 6: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 9: Families — code filter helper + wire-up

**Files:**
- Modify: `src/lib/families.ts`
- Modify: `src/lib/families.test.ts`
- Modify: `src/components/admin/FamiliesTab.tsx`

**Interfaces:**
- Consumes: `matchesFields` (Task 1), existing `ProductFamily` / `CodeFacts` types.
- Produces: `filterFamilies(fams: ProductFamily[], query: string, factsFor: (fam: ProductFamily) => CodeFacts): ProductFamily[]`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/families.test.ts` (extend the top import to also pull `filterFamilies` and the types):

```ts
import { filterFamilies, type ProductFamily, type CodeFacts } from './families';
```

(Merge into the existing `./families` import line rather than duplicating it.)

```ts
describe('filterFamilies', () => {
  const fam = (code: string): ProductFamily =>
    ({ id: code, category_slug: 'compression', code, sort_order: 0, is_active: true });
  const facts = (configuration: string | null, perSeries: [string, string | null][] = []): CodeFacts => ({
    count: 1,
    configuration,
    series: perSeries.map(([s]) => s),
    perSeries: new Map(perSeries.map(([s, c]) => [s, { count: 1, configuration: c }])),
  });
  const factsByCode: Record<string, CodeFacts> = {
    '330': facts('Male Adaptor'),
    '330T': facts(null, [['Zeta', 'Tee Connector']]),
    '382B': facts('Elbow', [['Zeta', 'Elbow'], ['Epsilon', 'Reducing Elbow']]),
  };
  const fams = [fam('330'), fam('330T'), fam('382B')];
  const factsFor = (f: ProductFamily) => factsByCode[f.code];

  it('returns everything for an empty query', () => {
    expect(filterFamilies(fams, '', factsFor)).toEqual(fams);
  });
  it('matches by family code (case-insensitive)', () => {
    expect(filterFamilies(fams, '330t', factsFor).map((f) => f.code)).toEqual(['330T']);
  });
  it('a bare-number query matches every code containing it', () => {
    expect(filterFamilies(fams, '330', factsFor).map((f) => f.code)).toEqual(['330', '330T']);
  });
  it('matches by the overall configuration name', () => {
    expect(filterFamilies(fams, 'male adaptor', factsFor).map((f) => f.code)).toEqual(['330']);
  });
  it('matches by a per-series configuration name', () => {
    expect(filterFamilies(fams, 'reducing', factsFor).map((f) => f.code)).toEqual(['382B']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterFamilies(fams, 'zzz', factsFor)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/families.test.ts`
Expected: FAIL — `filterFamilies` is not exported.

- [ ] **Step 3: Write the implementation**

In `src/lib/families.ts`, add `import { matchesFields } from './admin-search';` and, after `buildCodeFacts`:

```ts
/** Admin search over family codes: matches the code itself or any of the
 *  family's configuration names (overall or per-series). */
export function filterFamilies(
  fams: ProductFamily[],
  query: string,
  factsFor: (fam: ProductFamily) => CodeFacts,
): ProductFamily[] {
  if (query.trim() === '') return fams;
  return fams.filter((fam) => {
    const f = factsFor(fam);
    const configs = [f.configuration, ...[...f.perSeries.values()].map((s) => s.configuration)];
    return matchesFields(query, [fam.code, ...configs]);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/families.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into FamiliesTab**

In `src/components/admin/FamiliesTab.tsx`:

Extend the families import (line 7) from:

```tsx
import { buildCodeFacts } from '../../lib/families';
```

to:

```tsx
import { buildCodeFacts, filterFamilies } from '../../lib/families';
```

Add `import SearchInput from './SearchInput';` after the other component imports.

Below `const [error, setError] = useState<string | null>(null);` (the first error state, line ~33) add:

```tsx
  const [query, setQuery] = useState('');
```

In the render, directly after the intro `<p className="text-sm text-ink/60 mb-6 max-w-2xl">…</p>` paragraph, add:

```tsx
      <div className="mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search family code or configuration…" />
      </div>
```

Change the section mapping. From:

```tsx
      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && (
        <div className="space-y-6">
          {cats.map((cat) => {
            const codes = families.filter((f) => f.category_slug === cat.slug);
```

to:

```tsx
      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && sections.length === 0 && query.trim() !== '' && (
        <p className="text-sm text-ink/60">No family codes match &ldquo;{query}&rdquo;.</p>
      )}
      {cats !== null && (
        <div className="space-y-6">
          {sections.map(({ cat, codes }) => {
```

and add the `sections` computation in the component body, after the `famKey` helper (line ~154):

```tsx
  // Admin search: keep a category section when it still has matching codes, or
  // when the admin is mid-add there (so the add-code input can't vanish).
  const sections = (cats ?? [])
    .map((cat) => ({
      cat,
      codes: filterFamilies(
        families.filter((f) => f.category_slug === cat.slug),
        query,
        (fam) => factsFor(cat, fam.code),
      ),
    }))
    .filter(({ cat, codes }) => query.trim() === '' || codes.length > 0 || addingFor === cat.slug);
```

The rest of the 150-line section body already uses `cat` and `codes` — leave it untouched.

- [ ] **Step 6: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 10: Country Groups — group filter helper + wire-up

**Files:**
- Modify: `src/lib/product-groups.ts`
- Create: `src/lib/product-groups.test.ts`
- Modify: `src/components/admin/GroupsTab.tsx`

**Interfaces:**
- Consumes: `matchesFields` (Task 1), existing `ProductGroup` / `GroupCountry` types from `src/types/product.ts`.
- Produces: `filterGroups(groups: ProductGroup[], countries: GroupCountry[], query: string): { group: ProductGroup; countries: GroupCountry[] }[]` (exported interface name: `GroupMatch`).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/product-groups.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterGroups } from './product-groups';
import type { ProductGroup, GroupCountry } from '../types/product';

const group = (code: string, label: string | null): ProductGroup =>
  ({ code, label, description: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' });
const country = (id: string, group_code: string, name: string, cc: string | null): GroupCountry =>
  ({ id, group_code, country: name, country_code: cc, sort_order: 0, created_at: '', updated_at: '' });

const groups = [group('A', 'Europe'), group('B', 'Middle East')];
const countries = [
  country('1', 'A', 'Germany', 'de'),
  country('2', 'A', 'Spain', 'es'),
  country('3', 'B', 'United Arab Emirates', 'ae'),
];

describe('filterGroups', () => {
  it('empty query returns every group with its full country list', () => {
    const out = filterGroups(groups, countries, '');
    expect(out.map((m) => m.group.code)).toEqual(['A', 'B']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['1', '2']);
  });
  it('a group matching by label keeps all its countries', () => {
    const out = filterGroups(groups, countries, 'europe');
    expect(out.map((m) => m.group.code)).toEqual(['A']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['1', '2']);
  });
  it('a country match narrows the group to matching chips only', () => {
    const out = filterGroups(groups, countries, 'spain');
    expect(out.map((m) => m.group.code)).toEqual(['A']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['2']);
  });
  it('matches by country code', () => {
    const out = filterGroups(groups, countries, 'ae');
    expect(out.map((m) => m.group.code)).toEqual(['B']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterGroups(groups, countries, 'zzz')).toEqual([]);
  });
});
```

Note: querying a single letter like `a` will match group codes and many country names — that is expected substring behavior, not a bug.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/product-groups.test.ts`
Expected: FAIL — `filterGroups` is not exported.

- [ ] **Step 3: Write the implementation**

In `src/lib/product-groups.ts`, extend the type import to `import type { GroupCountry, ProductGroup } from '../types/product';`, add `import { matchesFields } from './admin-search';`, and append:

```ts
export interface GroupMatch {
  group: ProductGroup;
  countries: GroupCountry[];
}

/** Admin search over the Country Groups tab. A group matching by code or label
 *  keeps its full country list; otherwise only matching country chips remain,
 *  and groups with no match at all drop out. */
export function filterGroups(
  groups: ProductGroup[],
  countries: GroupCountry[],
  query: string,
): GroupMatch[] {
  const forGroup = (g: ProductGroup) => countries.filter((c) => c.group_code === g.code);
  if (query.trim() === '') return groups.map((g) => ({ group: g, countries: forGroup(g) }));
  const out: GroupMatch[] = [];
  for (const g of groups) {
    const all = forGroup(g);
    if (matchesFields(query, [g.code, g.label])) {
      out.push({ group: g, countries: all });
      continue;
    }
    const matching = all.filter((c) => matchesFields(query, [c.country, c.country_code]));
    if (matching.length > 0) out.push({ group: g, countries: matching });
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/product-groups.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Wire into GroupsTab**

In `src/components/admin/GroupsTab.tsx`:

Add imports:

```tsx
import { filterGroups } from '../../lib/product-groups';
import SearchInput from './SearchInput';
```

Below `const [adding, setAdding] = useState<string | null>(null);` add:

```tsx
  const [query, setQuery] = useState('');
```

Change the render. From:

```tsx
      {groups === null && <p className="text-sm text-ink/60">Loading…</p>}
      {groups !== null && (
        <div className="space-y-8">
          {groups.map((g) => (
```

to:

```tsx
      {groups === null && <p className="text-sm text-ink/60">Loading…</p>}
      {groups !== null && (
        <div className="mb-6">
          <SearchInput value={query} onChange={setQuery} placeholder="Search group or country…" />
        </div>
      )}
      {groups !== null && shown.length === 0 && query.trim() !== '' && (
        <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
      )}
      {groups !== null && (
        <div className="space-y-8">
          {shown.map(({ group: g, countries: cs }) => (
```

Add the `shown` computation in the component body, after `load`/`removeCountry` (before `return`):

```tsx
  const shown = filterGroups(groups ?? [], countries, query);
```

Inside the section body, change the chip source from:

```tsx
                {countries.filter((c) => c.group_code === g.code).map((c) => (
```

to:

```tsx
                {cs.map((c) => (
```

Everything else in the section body keeps using `g` — untouched.

Note the `mb-6` search wrapper sits between the error paragraph and the group sections; the sections' own `space-y-8` container is unchanged.

- [ ] **Step 6: Verify no test regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 11: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: every suite PASS, including the four new/extended lib test files.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build completes with no TypeScript/JSX errors.

- [ ] **Step 3: Manual smoke check (dev server)**

Run: `npm run dev`, open `http://localhost:4321/admin/`, sign in, and for each of the nine tabs type a query that should hit and one that shouldn't:

- Jobs: part of a job title → row remains; `zzz` → "No jobs match".
- Messages: a sender name → row remains; combine with the `new`/`read` buttons.
- Certifications: a certificate name; switch group toggles — search still ANDs.
- Catalogues: a subcategory name → parent row stays visible above it.
- Categories: a series name → category card shows only that series.
- Families: a family code (e.g. `330`) and a configuration word → sections collapse to matches.
- Country Groups: a country (e.g. `spain`) → only its group, only that chip.
- Data Errors: an issue type → list filters, headline counts unchanged.
- Images: a filename fragment → grid filters, count shows "x of y".

**Do not commit.** Report results and hand the working tree to the user for review.
