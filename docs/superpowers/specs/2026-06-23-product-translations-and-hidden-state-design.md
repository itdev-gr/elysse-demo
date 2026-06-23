# Per-product translations + a "Hidden" product state

**Date:** 2026-06-23
**Status:** Approved (design), pending spec review

## Problem

A catalog product page (e.g. `/catalog/compression-fittings/epsilon-series-pn-16-bar-330/`)
renders **one configuration**, which is a group of size rows (SKUs) in the
`products` table sharing `(category_name, sub_category, family_code)`. For No.330
that is **35 size rows**.

Two requests, which are connected:

1. **Translations should be editable once per product, from the admin dashboard.**
   Today translations live on each *size row* (`products.name_i18n` /
   `description_i18n`) and the page shows whichever size's translation comes first
   (`fetchConfigurationDetails`, "first non-empty wins"). Editing them is fiddly
   and tied to a specific size.

2. **Hide one size — `330001610` (`16 x ⅜"`) — from the public site *and* the
   admin list, without deleting it.**

The connection: `330001610` is the `sort_order = 1` row and the **only** row
carrying the DE/ES/FR translations for the whole configuration. Hiding it today
would silently strip those translations off the page. Lifting translations to the
product level removes that coupling.

## Decisions (confirmed with user)

- Translations stored **once per product (configuration)**; a small schema change is acceptable.
- A **dedicated `is_hidden` flag**, separate from the existing `is_active` toggle.
- Include an optional **English display-name / description override** at the product level.
- The migration itself flips `330001610` to hidden.

## Part A — translations stored once per product

### New table `public.product_configurations`

Keyed by the exact pair the URL resolves a config by.

| column | type | notes |
|---|---|---|
| `category_slug` | text not null | FK → `product_categories(slug)` on delete cascade |
| `config_slug` | text not null | `configSlug(sub_category, family_code ?? code)` |
| `name` | text | optional **English display-name override** (e.g. `Adaptor Male Epsilon Series PN 16 bar`); blank → fall back to derived configuration name |
| `description` | text | optional English description override |
| `name_i18n` | jsonb not null default `'{}'` | EL/DE/ES/FR name translations |
| `description_i18n` | jsonb not null default `'{}'` | EL/DE/ES/FR description translations |
| `created_at` / `updated_at` | timestamptz | `updated_at` via existing `public.set_updated_at()` trigger |
| PK | `(category_slug, config_slug)` | |

- **RLS** mirrors `product_families` (migration 0023): `public read` for `anon, authenticated`; `authenticated full access`.
- **Migration file:** `supabase/migrations/0025_product_configurations.sql`.

### Backfill (in 0025)

For every configuration, copy the current per-row translations (same first-wins
merge) into the new table so **nothing currently displayed is lost**. Computed in
SQL by replicating the JS `slugify`:

- `slugify(s)` ≡ `btrim(regexp_replace(lower(s), '[^a-z0-9]+', '-', 'g'), '-')`
- `config_slug` ≡ `btrim(slugify(coalesce(sub_category,'')) || '-' || slugify(coalesce(family_code, code)), '-')`
- `category_slug` via join `product_categories.product_category_name = products.category_name`.
- First-non-empty-per-language wins, ordered by `sort_order`
  (`distinct on (category_slug, config_slug, key) ... order by ..., sort_order`),
  over **all** rows (incl. soon-to-be-hidden ones) so the hidden row's
  translations are preserved on the configuration record.
- Only insert configs that actually have ≥1 translation (`on conflict do nothing`).
  Configs with no translations get no record and use the per-row fallback (which is empty anyway).

### Public read — `src/lib/products.ts`

- `fetchConfigurationDetails` loads the `product_configurations` rows for the
  category once (`category_slug` from `CATEGORY_SLUG_BY_NAME`), into a
  `Map<config_slug, record>`.
- The per-row first-wins merge stays, but becomes the **fallback**. After each
  `ConfigurationDetail` is built, overlay the record (record wins):
  - English display name: `cfg.configuration = record.name?.trim() || derivedEn`,
    and `nameI18n.en = cfg.configuration`.
  - `nameI18n` = `{ en, ...(record ? record.name_i18n : perRowNameMerge) }`.
  - English description: `record.description?.trim() || derived`; mirror into `descriptionI18n.en`.
  - `descriptionI18n` = `{ ...(en ? {en} : {}), ...(record ? record.description_i18n : perRowDescMerge) }`.
- The overlay/merge precedence is extracted into **pure, unit-testable helpers**
  in `src/lib/product-configurations.ts` (no Supabase dependency), e.g.
  `resolveConfigName(derivedEn, perRowNameI18n, record?)` and the description equivalent.

### New module `src/lib/product-configurations.ts`

- `ProductConfiguration` type (mirrors the table).
- `configKey({ category_slug, sub_category, family_code, code })` →
  `{ category_slug, config_slug }` (reuses `configSlug`).
- `fetchConfigTranslations(key)` — single-row read for the admin form.
- `upsertConfigTranslations(key, { name, description, name_i18n, description_i18n })`
  — `cleanI18n` applied (reuse from `categories.ts`); upsert on the PK.
- Pure merge/resolve helpers used by both the public read and tests.

### Admin editing — `src/components/admin/ProductForm.tsx`

- The existing **Translations** fieldset is re-pointed to read/write
  `product_configurations` instead of the row, relabelled
  *"Translations — apply to the whole product (all sizes)"*.
- It becomes a symmetric **5-language editor**: an **English** row at the top
  (display-name override + description override, mapped to record `name` /
  `description`) followed by EL/DE/ES/FR (mapped to `name_i18n` /
  `description_i18n`). Helper note: "Leave the English display name blank to use
  the Configuration value."
- The per-row `Configuration` and `Description (English)` fields stay — still the
  row's data, used for the admin list column, search, and the English fallback.
- **Load:** in edit mode fetch the config record on open (key from the row's
  `category → slug`, `sub_category`, `family_code ?? code`); in create mode load
  when `sub_category`/`family_code` are chosen, else start empty.
- **Save:** after the existing row insert/update succeeds, `upsertConfigTranslations`.
  Stop writing the row's `name_i18n` / `description_i18n` from this form (old
  per-row data is left in place, just ignored — no destructive change).
- `category_slug` from `category_name`: invert the `nameBySlug` map the form
  already builds from `product_categories`.

## Part B — "Hidden" state

### Schema — `supabase/migrations/0026_products_hidden.sql`

- `alter table public.products add column if not exists is_hidden boolean not null default false;`
- `update public.products set is_hidden = true where code = '330001610';` (fulfils the hide request).

### Public — `src/lib/products.ts`

- `loadCategory` adds `.eq('is_hidden', false)` alongside the existing
  `.eq('is_active', true)`. This single chokepoint feeds `fetchCatalogProducts`,
  `fetchCatalogConfigurations`, and `fetchConfigurationDetails` — so it covers
  catalog cards, config cards, and the size table. A configuration whose every
  size is hidden disappears entirely.
- Translations are unaffected because they now come from `product_configurations`
  (backfilled before the hide).

### Admin — `src/components/admin/ProductsTab.tsx`

- Default list excludes `is_hidden = true`.
- A **"Show hidden"** checkbox includes them (visually marked when shown).
- Per-row **Hide / Unhide** action (updates `is_hidden`, then `triggerPublish()`).
- A **"Hidden"** checkbox in `ProductForm` alongside the existing "Active" checkbox.

### Type — `src/types/product.ts`

- Add `is_hidden: boolean` to `Product` (and therefore `ProductDraft`).

## Scope boundaries (explicitly NOT doing)

- Per-row `name_i18n` / `description_i18n` columns are left in place (ignored for
  display) — no data destruction.
- xlsx export / bulk import (`product-xlsx.ts`, `ProductBulkBar.tsx`) untouched.
- Other admin tools that query `products` (`FamiliesTab`, `CategoriesTab`,
  `ImagesTab`, `SubcategoryEditForm`, `ProductBulkBar`) keep seeing all rows —
  they are management views, not the public catalog.
- No change to the client-side language-swap script in `ConfigDetail.astro`
  (it already reads the per-config `data-i18n-*` map, which now carries the
  product-level translations).

## Testing

- `src/lib/product-configurations.test.ts` (new): `configKey` / `config_slug`
  derivation (incl. `family_code` null → `code`, and the `Epsilon Series PN 16 bar`
  + `330` → `epsilon-series-pn-16-bar-330` case), and the pure
  `resolveConfigName` / description merge precedence (record wins; English
  override; fallback to per-row map when no record).
- `src/lib/products.test.ts`: add `is_hidden: false` to the existing `Product`
  fixture (type change); no behavioural change to `toCatalogProduct`.
- Manual verification (`/verify` or local `astro dev`):
  - No.330 page still shows DE/ES/FR after `330001610` is hidden.
  - `16 x ⅜"` no longer in the size table; the other 34 sizes remain.
  - Admin list hides `330001610` by default; "Show hidden" reveals it; Unhide restores it.
  - Editing the product's translations (any size) changes the page for all sizes.

## Migration / commit policy

- Migrations `0025` and `0026` run against prod via the Supabase Management API
  and require **explicit user consent at run time** (per project rule).
- **No git commits** until the user reviews and approves (standing rule) — the
  brainstorming default to commit the spec is overridden; this doc is written but
  not committed.

## Order of work

1. Migrations 0025 + 0026 (schema + RLS + backfill + hide `330001610`) — after user go-ahead.
2. `src/lib/product-configurations.ts` + `products.ts` read path + `types/product.ts`.
3. `ProductForm` + `ProductsTab` admin changes.
4. Tests, then local verification.
