# Product Data Checker — Design

Date: 2026-06-24
Status: Approved (design); pending implementation

## Goal

Surface every data-entry mistake an admin can make on products in the existing
**Data Errors** tab, kept continuously up to date. Replaces the currently-empty
`product_import_issues` queue with an actively-maintained error list.

Triggers (all run the same checker):
1. **After every Excel upload** — the bulk importer calls the checker when an import finishes.
2. **Every 24 hours** — a `pg_cron` job, so the list is always current even with no uploads.
3. **On demand** — a "Run now" button in the Data Errors tab.

Scope: **data-integrity checks only**. Out of scope (explicitly): RLS/auth
hardening, blocking saves in the product form, soft-delete.

## Architecture (Approach A)

A single Postgres function is the source of truth; everything calls it.

```
pg_cron (daily) ─┐
ProductBulkBar ──┼─► rpc('run_product_data_checks') ─► reconciles product_import_issues ─► DataErrorsTab reads
DataErrors "Run" ┘
```

- **`run_product_data_checks()`** — `security definer` SQL function. Computes the
  full set of current DB-state problems with set-based SQL over `products`,
  `product_group_memberships`, `product_groups`, `group_countries`,
  `product_categories`, `product_subcategories`, `product_families`, then
  reconciles `product_import_issues` (see below). Returns the open-issue count.
- **`pg_cron`** — enable the extension; schedule `select run_product_data_checks();`
  once per day.
- **Importer** — after a successful Excel import, `ProductBulkBar` (a) detects
  duplicate codes *within the uploaded file* and records them, then (b) calls
  `supabase.rpc('run_product_data_checks')`.
- **DataErrorsTab** — add a "Run now" button (calls the RPC then reloads) and a
  "Last checked" timestamp.

## Schema changes (migration)

1. `product_import_issues.check_key text` — deterministic identity for an issue,
   e.g. `'<issue_type>:<code-or-id>[:<detail>]'`. Unique index
   `where status <> 'resolved'` so an open/ignored issue is reconciled in place
   while historical resolved rows are kept.
2. `data_check_state(id int primary key default 1, last_run_at timestamptz)` —
   single row; the function stamps `last_run_at` each run. Drives the UI timestamp.
3. Extend the `issue_type` vocabulary (text column; TS union updated to match):
   `duplicate_code | missing_code | missing_field | missing_group | invalid_value`
   plus `orphan_category | orphan_series | orphan_family | letter_mismatch |
   no_visible_country | orphan_membership | duplicate_category_link`.

## Checks

Severity: **error** = product is broken/invisible; **warning** = works but likely a mistake.

| # | issue_type | sev | Condition | check_key |
|---|-----------|-----|-----------|-----------|
| 1 | `missing_group` | error | `is_active` & not `is_hidden` & 0 memberships | `missing_group:<code>` |
| 2 | `missing_field` | error | `category_name` blank | `missing_field:<code>:category_name` |
| 3 | `orphan_category` | error | `category_name` matches no `product_categories.product_category_name` | `orphan_category:<code>` |
| 4 | `invalid_value` | error | membership `group_code` not in `product_groups` | `invalid_value:<code>:<group>` |
| 5 | `invalid_value` | error | `packing_bag`/`packing_box`/`moq` < 0 | `invalid_value:<code>:<field>` |
| 6 | `duplicate_category_link` | error | two categories share a `product_category_name` | `duplicate_category_link:<name>` |
| 7 | `duplicate_code` | error | duplicate codes within an uploaded Excel (import-time only) | `duplicate_code:<code>` |
| 8 | `no_visible_country` | warning | has group(s) but none map to any country | `no_visible_country:<code>` |
| 9 | `orphan_series` | warning | `sub_category` set but not in `product_subcategories` for its category | `orphan_series:<code>` |
| 10 | `orphan_family` | warning | `family_code` set but not in `product_families` for its category | `orphan_family:<code>` |
| 11 | `letter_mismatch` | warning | `category` letter ≠ category's `category_letter` | `letter_mismatch:<code>` |
| 12 | `missing_field` | warning | blank `description` / `configuration` / `sub_category` / `family_code` | `missing_field:<code>:<field>` |
| 13 | `invalid_value` | warning | active product under an inactive category | `invalid_value:<code>:inactive_category` |
| 14 | `orphan_membership` | warning | membership `product_code` not in `products` | `orphan_membership:<code>:<group>` |

`raw` stores a small JSON snapshot (the offending value + relevant fields) for the
"Raw row" disclosure. `message` is a human sentence ("In group A only, which has
no countries — invisible on the site").

Checks 1–6 and 8–14 are DB-state (the SQL function owns them). Check 7 is
file-level (the importer owns it); the function never touches `duplicate_code`.

## Reconciliation

Per run, inside the function:
1. Build the detected set (CTEs → a temp set of `(check_key, code, issue_type, severity, message, raw)`).
2. **Upsert** on `check_key`: insert new rows as `open`; for an existing row, refresh
   `message/severity/raw/updated_at` and set `status = open` **unless it is `ignored`**
   (ignored stays ignored — a permanent dismissal).
3. **Auto-resolve**: any `open` row whose `issue_type` is one the function owns and
   whose `check_key` is **not** in the detected set → `status='resolved', resolved_at=now()`.
4. Stamp `data_check_state.last_run_at`.

Importer duplicate-code handling mirrors this for `duplicate_code` only: resolve
prior open `duplicate_code` issues, then insert the current file's duplicates.

## UI (DataErrorsTab, extends existing)

- Header: "Last checked: <relative time>" + **Run now** button (disabled while running).
- Keep the existing error/warning split, per-row Mark fixed / Ignore / Delete, and Raw row.
- Group rows by `issue_type` with a count badge; keep severity colour bar.
- No redesign — additive only.

## Permissions

- Function is `security definer`, owned by a role that can read the product tables
  and write `product_import_issues`. `pg_cron` runs it as the scheduling role
  (postgres in Supabase). Client `rpc()` is granted to `authenticated` (admin).

## Testing

- Unit (vitest): the importer's in-file duplicate-code detector (pure function).
- SQL verification: seed one product per failure mode on a branch / via
  `execute_sql` and assert each produces exactly its expected `check_key`; assert
  fixing it auto-resolves on the next run; assert an `ignored` row is not re-opened.
- Regression: a clean product produces zero issues.

## Out of scope

RLS/access hardening, save-time blocking in the product form, scheduled emails,
soft-delete. (Can be follow-ups.)
