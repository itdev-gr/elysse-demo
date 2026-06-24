# Product Data Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continuously surface every product data-entry mistake in the Data Errors tab via one server-side checker run after each Excel import, every 24h via `pg_cron`, and on demand.

**Architecture:** A single `security definer` Postgres function `run_product_data_checks()` computes all DB-state problems with set-based SQL and reconciles `product_import_issues` (insert new, auto-resolve fixed, preserve "ignored") keyed by a deterministic `check_key`. `pg_cron` runs it daily; `ProductBulkBar` calls it via `rpc()` after import (and records in-file duplicate codes); `DataErrorsTab` gets a "Run now" button + last-checked time.

**Tech Stack:** Supabase Postgres (plpgsql, pg_cron), Astro + React (TS) admin, Supabase JS, vitest.

Spec: `docs/superpowers/specs/2026-06-24-product-data-checker-design.md`

---

### Task 1: Schema migration (check_key, state table, grants)

**Files:**
- Apply via Supabase `apply_migration` name `product_data_checker_schema`.

- [ ] **Step 1: Apply DDL**

```sql
-- Deterministic identity for an issue so re-runs reconcile in place.
alter table public.product_import_issues
  add column if not exists check_key text;

-- One open/ignored row per check_key; resolved rows kept as history.
-- Predicate kept simple so it matches the ON CONFLICT clause for inference.
-- (NULL check_key rows are naturally excluded from the unique index.)
create unique index if not exists product_import_issues_check_key_uniq
  on public.product_import_issues (check_key)
  where status <> 'resolved';

-- Single-row table holding the last checker run time (for the UI).
create table if not exists public.data_check_state (
  id          integer primary key default 1,
  last_run_at timestamptz,
  open_errors   integer not null default 0,
  open_warnings integer not null default 0,
  constraint data_check_state_singleton check (id = 1)
);
insert into public.data_check_state (id) values (1) on conflict (id) do nothing;
```

- [ ] **Step 2: Verify** — `execute_sql`: `select * from data_check_state;` → one row, nulls.

---

### Task 2: The `run_product_data_checks()` function

**Files:**
- Apply via `apply_migration` name `product_data_checker_function`.

- [ ] **Step 1: Create function**

```sql
create or replace function public.run_product_data_checks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open integer;
begin
  -- All DB-state problems, one row per (check_key). issue_type 'duplicate_code'
  -- is intentionally NOT produced here (the importer owns it).
  create temporary table _detected on commit drop as
  -- 1. no groups (error)
  select 'missing_group:'||p.code as check_key, p.code as code,
         'missing_group' as issue_type, 'error' as severity,
         'Active product has no group — invisible to every country.' as message,
         jsonb_build_object('category_name', p.category_name) as raw
  from products p
  where p.is_active and not p.is_hidden
    and not exists (select 1 from product_group_memberships m where m.product_code = p.code)
  -- 2. blank category_name (error)
  union all
  select 'missing_field:'||p.code||':category_name', p.code,
         'missing_field','error','Category name is blank — cannot link to a category.','{}'::jsonb
  from products p where coalesce(btrim(p.category_name),'') = ''
  -- 3. orphan category (error)
  union all
  select 'orphan_category:'||p.code, p.code,
         'orphan_category','error',
         'Category "'||p.category_name||'" matches no category — never shows on any category page.',
         jsonb_build_object('category_name', p.category_name)
  from products p
  where coalesce(btrim(p.category_name),'') <> ''
    and not exists (select 1 from product_categories c where c.product_category_name = p.category_name)
  -- 4. membership to non-existent group (error)
  union all
  select 'invalid_value:'||m.product_code||':grp_'||m.group_code, m.product_code,
         'invalid_value','error','Assigned to group "'||m.group_code||'" which does not exist.',
         jsonb_build_object('group_code', m.group_code)
  from product_group_memberships m
  where not exists (select 1 from product_groups g where g.code = m.group_code)
  -- 5. negative numbers (error)
  union all
  select 'invalid_value:'||p.code||':'||f.field, p.code,
         'invalid_value','error', f.field||' is negative ('||f.val||').',
         jsonb_build_object(f.field, f.val)
  from products p
  cross join lateral (values
    ('packing_bag', p.packing_bag),
    ('packing_box', p.packing_box),
    ('moq', p.moq)
  ) as f(field, val)
  where f.val is not null and f.val < 0
  -- 6. duplicate category link (error)
  union all
  select 'duplicate_category_link:'||c.product_category_name, null::text,
         'duplicate_category_link','error',
         'Category link "'||c.product_category_name||'" is used by more than one category.',
         jsonb_build_object('product_category_name', c.product_category_name,
                            'slugs', (select array_agg(c2.slug) from product_categories c2
                                      where c2.product_category_name = c.product_category_name))
  from product_categories c
  where c.product_category_name is not null
  group by c.product_category_name
  having count(*) > 1
  -- 8. has group(s) but no country (warning)
  union all
  select 'no_visible_country:'||p.code, p.code,
         'no_visible_country','warning',
         'Belongs to group(s) with no countries — still invisible on the site.','{}'::jsonb
  from products p
  where p.is_active and not p.is_hidden
    and exists (select 1 from product_group_memberships m where m.product_code = p.code)
    and not exists (
      select 1 from product_group_memberships m
      join group_countries gc on gc.group_code = m.group_code
      where m.product_code = p.code and coalesce(btrim(gc.country_code),'') <> '')
  -- 9. orphan series (warning) — only when the category actually manages series
  union all
  select 'orphan_series:'||p.code, p.code,
         'orphan_series','warning',
         'Series "'||p.sub_category||'" is not in the managed series for its category.',
         jsonb_build_object('sub_category', p.sub_category)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where coalesce(btrim(p.sub_category),'') <> ''
    and exists (select 1 from product_subcategories s2 where s2.category_slug = c.slug)
    and not exists (select 1 from product_subcategories s
                    where s.category_slug = c.slug and s.name = p.sub_category)
  -- 10. orphan family (warning) — only when the category manages families
  union all
  select 'orphan_family:'||p.code, p.code,
         'orphan_family','warning',
         'Family code "'||p.family_code||'" is not in the managed families for its category.',
         jsonb_build_object('family_code', p.family_code)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where coalesce(btrim(p.family_code),'') <> ''
    and exists (select 1 from product_families f2 where f2.category_slug = c.slug)
    and not exists (select 1 from product_families f
                    where f.category_slug = c.slug and f.code = p.family_code)
  -- 11. category letter mismatch (warning)
  union all
  select 'letter_mismatch:'||p.code, p.code,
         'letter_mismatch','warning',
         'Letter "'||coalesce(p.category,'∅')||'" ≠ category letter "'||coalesce(c.category_letter,'∅')||'".',
         jsonb_build_object('product_letter', p.category, 'category_letter', c.category_letter)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where c.category_letter is not null
    and coalesce(btrim(p.category),'') <> ''
    and upper(btrim(p.category)) <> upper(c.category_letter)
  -- 12. blank display fields (warning) — configuration + description only (low-noise)
  union all
  select 'missing_field:'||p.code||':'||f.field, p.code,
         'missing_field','warning', f.field||' is blank.','{}'::jsonb
  from products p
  cross join lateral (values
    ('configuration', p.configuration),
    ('description', p.description)
  ) as f(field, val)
  where coalesce(btrim(f.val),'') = ''
  -- 13. active product under inactive category (warning)
  union all
  select 'invalid_value:'||p.code||':inactive_category', p.code,
         'invalid_value','warning','Active product is under an inactive category.',
         jsonb_build_object('category_name', p.category_name)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where p.is_active and not p.is_hidden and not c.is_active
  -- 14. orphan membership (warning)
  union all
  select 'orphan_membership:'||m.product_code||':'||m.group_code, m.product_code,
         'orphan_membership','warning','Group membership references a product that no longer exists.',
         jsonb_build_object('group_code', m.group_code)
  from product_group_memberships m
  where not exists (select 1 from products p where p.code = m.product_code);

  -- Upsert detected issues. Reopen resolved ones; never reopen 'ignored'.
  insert into product_import_issues (check_key, code, raw, issue_type, severity, message, status)
  select d.check_key, d.code, d.raw, d.issue_type, d.severity, d.message, 'open'
  from _detected d
  on conflict (check_key) where status <> 'resolved'
  do update set message = excluded.message, severity = excluded.severity,
                raw = excluded.raw, code = excluded.code, updated_at = now(),
                status = case when product_import_issues.status = 'ignored' then 'ignored' else 'open' end;

  -- Auto-resolve owned issue types that are no longer detected.
  update product_import_issues i
  set status = 'resolved', resolved_at = now(), updated_at = now()
  where i.status = 'open'
    and i.issue_type <> 'duplicate_code'
    and (i.check_key is null or i.check_key not in (select check_key from _detected));

  -- Stamp state.
  select count(*) into v_open from product_import_issues where status = 'open';
  update data_check_state set
    last_run_at = now(),
    open_errors = (select count(*) from product_import_issues where status='open' and severity='error'),
    open_warnings = (select count(*) from product_import_issues where status='open' and severity='warning')
  where id = 1;

  return v_open;
end;
$$;

grant execute on function public.run_product_data_checks() to authenticated;

-- Record duplicate codes found WITHIN an uploaded Excel file. Done server-side
-- (raw SQL) so the partial unique index works; PostgREST upsert can't infer it.
create or replace function public.record_file_duplicate_codes(p_codes text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Clear the previous upload's open file-dup issues.
  update product_import_issues
  set status = 'resolved', resolved_at = now(), updated_at = now()
  where issue_type = 'duplicate_code' and status = 'open';
  -- Record this upload's duplicates, skipping ones already dismissed.
  insert into product_import_issues (check_key, code, raw, issue_type, severity, message, status)
  select 'duplicate_code:'||c, c, '{}'::jsonb, 'duplicate_code', 'error',
         'Code "'||c||'" appears more than once in the uploaded file.', 'open'
  from unnest(p_codes) as c
  where c is not null and btrim(c) <> ''
    and not exists (select 1 from product_import_issues i
                    where i.check_key = 'duplicate_code:'||c and i.status = 'ignored')
  on conflict (check_key) where status <> 'resolved'
  do update set status = 'open', updated_at = now();
end;
$$;

grant execute on function public.record_file_duplicate_codes(text[]) to authenticated;
```

- [ ] **Step 2: Run it** — `execute_sql`: `select public.run_product_data_checks();` → returns an integer ≥ 0, no error.
- [ ] **Step 3: Inspect** — `select issue_type, severity, count(*) from product_import_issues where status='open' group by 1,2 order by 1;` Sanity-check counts (expect `missing_group` for the test product `1111111111` if it lacks a group, etc.). Confirm no single check floods (thousands).

---

### Task 3: Enable pg_cron + schedule daily

**Files:**
- Apply via `apply_migration` name `product_data_checker_cron`.

- [ ] **Step 1: Enable + schedule**

```sql
create extension if not exists pg_cron;
-- Re-create idempotently: unschedule if it already exists, then schedule.
do $$
begin
  perform cron.unschedule('product-data-checks-daily')
  where exists (select 1 from cron.job where jobname = 'product-data-checks-daily');
end $$;
select cron.schedule('product-data-checks-daily', '17 3 * * *',
                     $$select public.run_product_data_checks();$$);
```

- [ ] **Step 2: Verify** — `execute_sql`: `select jobname, schedule, active from cron.job where jobname='product-data-checks-daily';` → one active row.

---

### Task 4: Extend the IssueType union (TS)

**Files:**
- Modify: `src/types/product.ts:52-53`

- [ ] **Step 1: Update union**

```ts
export type IssueType =
  | 'duplicate_code' | 'missing_code' | 'missing_field' | 'missing_group' | 'invalid_value'
  | 'orphan_category' | 'orphan_series' | 'orphan_family' | 'letter_mismatch'
  | 'no_visible_country' | 'duplicate_category_link' | 'orphan_membership';
```

Also add `check_key: string | null;` to the `ProductImportIssue` interface (after `id`).

- [ ] **Step 2: Verify** — `npx astro check --minimumSeverity error` → 0 errors.

---

### Task 5: In-file duplicate-code detection + importer hook

**Files:**
- Modify: `src/lib/product-xlsx.ts` (add pure `findDuplicateCodes`)
- Test: `src/lib/product-xlsx.test.ts`
- Modify: `src/components/admin/ProductBulkBar.tsx`

- [ ] **Step 1: Write failing test** in `product-xlsx.test.ts`

```ts
import { findDuplicateCodes } from './product-xlsx';
describe('findDuplicateCodes', () => {
  it('reports codes that appear more than once (trimmed)', () => {
    expect(findDuplicateCodes(['A1', 'A2', 'A1', ' A2 ', 'A3'])).toEqual(['A1', 'A2']);
  });
  it('ignores blanks and returns [] when unique', () => {
    expect(findDuplicateCodes(['A1', '', '  ', 'A2'])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run** — `npx vitest run src/lib/product-xlsx.test.ts` → FAIL (not exported).

- [ ] **Step 3: Implement** in `src/lib/product-xlsx.ts`

```ts
/** Codes that appear more than once in the uploaded sheet (trimmed, blanks ignored). */
export function findDuplicateCodes(codes: string[]): string[] {
  const seen = new Map<string, number>();
  for (const raw of codes) {
    const c = (raw ?? '').trim();
    if (!c) continue;
    seen.set(c, (seen.get(c) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([c]) => c);
}
```

- [ ] **Step 4: Run** — `npx vitest run src/lib/product-xlsx.test.ts` → PASS.

- [ ] **Step 5: Wire into ProductBulkBar `onFile`** — after the existing success block (right before `setResult(...)` at ~line 166), persist file duplicates and trigger the server checker:

```ts
// Record duplicate codes within the uploaded file (PK collapses stored dupes),
// then run the full server-side data check so the Data Errors tab is current.
const dupes = findDuplicateCodes(rows.map((r) => String((r as Record<string, unknown>).code ?? '')));
await supabase.rpc('record_file_duplicate_codes', { p_codes: dupes });
await supabase.rpc('run_product_data_checks');
```

Add the import: `import { /* …existing… */ findDuplicateCodes } from '../../lib/product-xlsx';`

- [ ] **Step 6: Verify** — `npx astro check --minimumSeverity error` → 0 errors. `npx vitest run` → all pass.

---

### Task 6: DataErrorsTab — Run now + last-checked + grouping

**Files:**
- Modify: `src/components/admin/DataErrorsTab.tsx`

- [ ] **Step 1: Add state + run handler** (after existing `useState`s):

```tsx
const [running, setRunning] = useState(false);
const [lastRun, setLastRun] = useState<string | null>(null);

const loadState = async () => {
  const { data } = await supabase.from('data_check_state').select('last_run_at').eq('id', 1).maybeSingle();
  setLastRun((data as { last_run_at: string | null } | null)?.last_run_at ?? null);
};

const runCheck = async () => {
  setRunning(true); setError(null);
  const { error: err } = await supabase.rpc('run_product_data_checks');
  setRunning(false);
  if (err) return setError(err.message);
  await Promise.all([load(), loadState()]);
};
```

Call `loadState()` inside the existing mount `useEffect` (alongside `load()`).

- [ ] **Step 2: Add the header UI** above the counts line:

```tsx
<div className="flex items-center justify-between gap-4 mb-4">
  <p className="text-[11px] text-ink/55">
    {lastRun ? `Last checked ${new Date(lastRun).toLocaleString()}` : 'Never checked'}
  </p>
  <button type="button" onClick={runCheck} disabled={running}
    className="text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-ink/15 hover:border-brand-500 hover:text-brand-500 disabled:opacity-50">
    {running ? 'Checking…' : 'Run check now'}
  </button>
</div>
```

- [ ] **Step 3: Verify** — `npx astro check --minimumSeverity error` → 0 errors. Manually trigger from the admin (or rely on Task 7 SQL verification).

---

### Task 7: Verification

- [ ] **Step 1: Seed-and-check** (on the live DB via `execute_sql`, cleaning up after): temporarily insert a product with no group / a bad category, run `select run_product_data_checks();`, assert the expected `check_key` appears, then delete the seed and re-run to assert it auto-resolves. Document results.
- [ ] **Step 2: Ignore-preservation** — mark one open issue `ignored`, re-run, assert it stays `ignored` (not reopened).
- [ ] **Step 3: Full suite** — `npx vitest run` → all pass; `npx astro check --minimumSeverity error` → 0 errors.

---

## Notes / deviations from spec

- Blank-field warnings limited to `configuration` + `description` (the two that affect what shows on the page); `sub_category`/`family_code` blanks are excluded as too common to be signal. `orphan_series`/`orphan_family` only fire when the category actually manages a series/family list (typo detection, not noise).
