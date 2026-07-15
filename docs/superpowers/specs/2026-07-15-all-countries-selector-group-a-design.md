# Load all ISO 3166-1 countries into the selector (group A)

**Date:** 2026-07-15
**Status:** Approved (design), pending implementation plan

## Goal

Make the public "Select your country" modal list **every ISO 3166-1
alpha-2 country (all 249 officially-assigned codes)**, with every country
that is not already assigned to a pricing group mapped to **group A**. The
featured five (Cyprus, Austria, Egypt, Lebanon, Greece) stay pinned at the
top; the rest follow alphabetically, as today.

## Background — how the selector decides what to show

A country appears in the modal only when its code exists in **both**:

1. **`group_countries`** (Supabase) — maps a country to a pricing group
   (`group_code`). The modal builds a set of `country_code`s from this table.
2. **`src/data/catalog-countries.ts`** (`COUNTRIES`) — a hardcoded list of
   `{ code, label, region }`. The modal renders `COUNTRIES.filter(c => codes.has(c.code))`.

So filling only the database, or only the hardcoded list, is insufficient —
both must contain a code for it to show. `catalog-countries.ts` also backs:

- `CountryCode` union (`src/scripts/catalog/types.ts` → `Country`) used across
  the catalog (e.g. `CatalogProduct.availableCountries`).
- the `VALID` set in `src/scripts/catalog/country.ts` that validates the
  visitor's stored pick.

A third, **separate** list — the `countries` master table (97 rows, drives
the worldwide-network/contact map) — is **out of scope**; no foreign key ties
`group_countries` to it, and the goal is the selector, not the map.

## Relevant current state (verified live)

- `product_groups`: A (Black Caps), B (Blue Caps), C, D, E.
- `group_countries`: 16 rows total — A: eg, gr, lb, za, es, zw; B: at, bg, de,
  it, pl, ro; C: cy; D: au; E: ie, gb. **`country` column is UNIQUE**, so a
  country can be in only one group.
- `catalog-countries.ts`: ~33 countries with a 4-value `region`
  (`europe | middle-east-africa | asia-pacific | americas`).
- `content.config.ts`: a **duplicated** `COUNTRY_CODES` Zod enum (25 codes),
  commented "Kept in sync with catalog-countries.ts", validates product
  `availableCountries`.
- `region` / `REGIONS` / `countriesByRegion` / `COUNTRY_REGION` exports of
  `catalog-countries.ts` are **not consumed** by any rendering code (the modal
  uses a featured-then-alphabetical layout, not region grouping).

## Changes

### 1. Canonical ISO dataset
Produce the full ISO 3166-1 alpha-2 set (249): `{ code (lowercase), label
(English short name), region (one of the four existing buckets) }`. Region is
assigned best-effort by continent (Africa → middle-east-africa, all Asia +
Oceania → asia-pacific, Europe → europe, Americas → americas, edge cases →
nearest bucket). Region is internal metadata only; it has no visible effect.

### 2. DB migration `0047_group_countries_all_iso.sql`
Insert into `group_countries` one row per ISO country **whose lowercased code
is not already present**, with `group_code = 'A'`, `country = <ISO label>`,
`country_code = <lowercase code>`, and a `sort_order`. ~233 new rows.

- Idempotent: guarded by `where lower(country_code) not in (select
  lower(country_code) from group_countries)` (or `not exists` per row), so
  re-running inserts nothing.
- Existing B–E and A assignments are untouched; the UNIQUE(`country`)
  constraint is respected because we skip already-mapped codes/names.
- Applied live via the Management API after review.

### 3. Regenerate `catalog-countries.ts`
Replace `COUNTRIES` with all 249 entries (code + label + region). No change to
`REGIONS`, the helper exports, or the `CountryDef`/`Region` types. The modal's
featured-5-on-top + separator + alphabetical layout
(`CountryModal.astro`) is unchanged — it simply renders a longer tail. Featured
codes cy/at/eg/lb/gr remain present.

### 4. Sync `content.config.ts` `COUNTRY_CODES`
Regenerate the duplicated Zod enum to the full 249 codes so the two hardcoded
lists don't diverge (the documented "hardcoded list" trap). If
`src/content/config.ts` carries the same enum, sync it too.

## Non-goals

- The `countries` master table / worldwide-network map.
- Re-designing the modal (no region grouping; featured+alphabetical stays).
- Moving any existing B–E country into A.

## Verification

1. Apply `0047` live; assert `group_countries` total = 249 and group A = 239
   (6 existing + 233 new). Re-run once to confirm idempotency (0 new rows).
2. `npm test` and `npx astro check` pass (only the pre-existing
   `catalogues.test.ts` error remains).
3. Browser: open `/catalog/<category>/` selector, confirm ~249 options with the
   5 featured pinned on top; pick a brand-new country (e.g. Japan, Brazil),
   confirm it persists (24h) and the catalog initializes and resolves it to
   group A.

## Risks

- **List divergence:** three code lists (`catalog-countries.ts`,
  `content.config.ts` enum, and now the DB) must agree. Mitigation: generate
  all from the one ISO dataset in the same change; verification step 2 catches
  a mismatch via `astro check`.
- **Name collisions on UNIQUE(`country`):** avoided by skipping already-mapped
  codes and using canonical ISO names for the rest.
