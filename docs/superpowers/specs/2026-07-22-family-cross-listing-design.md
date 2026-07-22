# Family cross-listing: show a card in a second category

**Date:** 2026-07-22
**Status:** Approved (design)

## Goal

Let a catalog card (a product configuration / catalogue No., i.e. a **family**)
appear in one or more **additional** categories besides its own — e.g. a
Compression Fittings family also shown on the Turf category page. Products,
codes, the Excel flow, and the family's home category stay untouched; the extra
placement is display-only.

## Decisions (agreed with the user)

- **Unit:** the whole card — a `product_families` row (catalogue No. with all
  its sizes). Not per-SKU, not per-series.
- **Click-through:** the borrowed card links to the product's existing page
  under its **home** category (e.g. `/catalog/compression-fittings/330a/`).
  No second URL is created under the extra category.
- **Series sidebar:** the borrowed card's series (its `sub_category`) is
  appended to the extra category's series list, with its translations, and the
  existing series filters work on it.
- **Admin surface:** the Families tab. No change to the product form or the
  Excel import/export.

## Data model — migration `0050`

New table `product_family_extra_categories`:

| column          | type        | notes                                                        |
| --------------- | ----------- | ------------------------------------------------------------ |
| `family_id`     | uuid        | not null → `product_families(id)` **on delete cascade**      |
| `category_slug` | text        | not null → `product_categories(slug)` **on delete cascade**  |
| `created_at`    | timestamptz | not null default `now()`                                     |

- Primary key `(family_id, category_slug)` — no duplicate placements.
- RLS mirrors `product_families`: public (anon) **read** — the live site
  renders with the anon key; **write** only for `authenticated`. Explicitly
  revoke anon write. No new SQL functions are needed, so the anon-EXECUTE
  default-ACL trap doesn't apply here — but if any helper fn is added later it
  must revoke anon EXECUTE per the 0041 convention.
- A listing pointing at the family's **own** category is meaningless; the DB
  cannot cheaply enforce this cross-table, so the admin UI never offers the
  home category and the data checker flags any such row (below).

### Data checker

Extend `run_product_data_checks()` (edit based on the repo migration, which is
the authoritative source since 0036/0038) with two new checks:

1. **`cross_listing_empty`** (warning): a cross-listing whose family currently
   matches zero active, non-hidden products — the placement renders nothing.
2. **`cross_listing_self`** (error): `category_slug` equals the family's own
   `category_slug` — should be impossible via the UI.

## Site rendering

All changes live in the build/fetch layer (`src/lib/products.ts`) plus the
category page's series handling; the grid, filters, country modal, and product
detail pages are untouched.

- **Fetching borrowed cards:** for category page `/catalog/<slug>/`, after the
  native products load, fetch `product_family_extra_categories` rows for this
  `category_slug`, join to `product_families` to get each family's home
  `category_slug` + `code`, map home slug → `product_category_name`, then fetch
  the matching products (`category_name` = home name, `family_code` = code,
  active, not hidden). Reuse the existing configuration-collapsing pipeline so
  the borrowed card is built exactly like a native one.
- **Canonical links:** borrowed `CatalogProduct`s are built with the **home**
  category slug so the card's href resolves to the existing product page.
- **Ordering:** native cards first, in today's order; borrowed cards appended
  after them, grouped per family, in their home catalogue order.
- **Series sidebar:** borrowed series are appended after the native series.
  Their display names/translations come from the **home** category's
  `product_subcategories` overlay rows; if the home overlay hides that series,
  its borrowed cards don't render in the extra category either (visibility
  always follows the home category).
- **Countries filter:** already keyed on product codes and fetched
  category-independently — works for borrowed cards with no change.
- **Images:** family-owned (`product_family_images`) — the borrowed card shows
  the same image as at home with no change.
- **Search / search index:** unchanged; the product surfaces once, linking to
  its canonical page.
- **Caching:** unchanged (`s-maxage=60`) — placements go live within a minute.

## Admin (Families tab)

- **FamilyForm:** new field **"Also show in…"** — a checkbox per active
  category, excluding the family's home category. On load it reflects the
  existing rows; on save it diffs (inserts added, deletes removed). Saved
  together with the rest of the form.
- **Families list:** each row shows a compact badge per extra placement
  (e.g. `+ Turf`), so cross-listed families are visible at a glance.
- **Tab search:** the extra category names join the row's `matchesFields`
  haystack (existing admin search idiom), so searching "turf" finds them.

## Out of scope (YAGNI)

- A second product URL / breadcrumb under the extra category.
- Per-SKU or per-series cross-listing.
- Mapping a borrowed card into one of the extra category's own series.
- Catalogue PDFs (`catalogues` table) — the extra category's PDF button keeps
  showing its own catalogue only.

## Verification

- Unit tests for the new fetch/merge logic (borrowed cards appended, canonical
  home hrefs, home-overlay hiding respected, self/duplicate listings ignored).
- `npm test` green; `npx astro check` clean.
- Browser: cross-list a Compression Fittings family into Turf → card appears
  on `/catalog/turf/` with its series in the sidebar and the correct image;
  clicking opens `/catalog/compression-fittings/<slug>/`; removing the
  placement makes it disappear within a minute.
- Admin: save/remove roundtrip in the Families tab; badge and search behave;
  Data Errors shows `cross_listing_empty` when the family's products are
  hidden.
