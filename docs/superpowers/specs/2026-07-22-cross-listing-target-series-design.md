# Cross-listing: choose a target series in the destination category

**Date:** 2026-07-22
**Status:** Proposed (design) — awaiting user approval
**Supersedes behaviour from:** `2026-07-22-family-cross-listing-design.md` (shipped as commits 9a27df0..00c082e)

## Goal

When cross-listing a card (family) into another category, the admin also picks a
**series (subcategory) of the destination category**, and the borrowed card
appears under **that** series — instead of carrying over its original home
series and landing at the end of the sidebar.

Example: a Compression Fittings family cross-listed into Turf is placed under a
Turf series the admin chooses (e.g. "Turf Drippers"), and shows in that section
of the Turf page — not under "Compression Fittings PN16".

## Decisions (defaults — user may override)

- **Series is required.** Every placement targets one specific destination
  series. There is no "whole category / no series" placement anymore.
- **One series per (family, destination category).** The admin modal offers one
  series `<select>` per category, so a family maps to at most one Turf series.
  (Prevents the same card rendering twice with a duplicate slug.)
- **A family that spans multiple home series (multiple cards) → all its cards go
  under the chosen destination series.** The unit stays "the family", as today.
- **Selectable series = the destination category's ACTIVE managed
  subcategories** (`product_subcategories`, `is_active`). Enforced by a DB
  foreign key, so a placement can only point at a real managed series.

## What changes vs. the shipped feature

The shipped model was `(family_id, category_slug)` and the card kept its home
series. This design adds a **destination series** to the placement and makes the
borrowed card display under it. The home category still owns the card's product
page, its image, and its country gating — none of that changes.

## Data model — migration `0051`

`product_family_extra_categories` gains a destination-series column. The live
table is empty, so this is a plain `ALTER` (no backfill):

```sql
alter table public.product_family_extra_categories
  add column sub_category text not null;   -- destination series name

-- The destination series must be a managed subcategory of the destination
-- category. product_subcategories has unique (category_slug, name) — FK to it.
alter table public.product_family_extra_categories
  add constraint pfec_dest_series_fk
  foreign key (category_slug, sub_category)
  references public.product_subcategories (category_slug, name) on delete cascade;
```

- **Primary key stays `(family_id, category_slug)`** — one destination series per
  (family, destination category). Re-listing under a different series is an
  UPDATE of `sub_category`, not a second row.
- The new composite FK makes the pre-existing standalone `category_slug →
  product_categories(slug)` FK redundant (kept; harmless) and guarantees the
  series exists and is spelled exactly as the managed subcategory.
- **`on delete cascade`**: deleting/renaming-away the destination series (which
  in this app is a delete + re-create of the `product_subcategories` row)
  removes the now-dangling placements automatically.
- RLS and the `pfec_category_idx` index are unchanged (still anon-read /
  authenticated-write).

### Data checker

No change needed. The two checks from `0050` still hold:
`cross_listing_self` (self-listing into the family's own category) and
`cross_listing_empty` (family with no active home products) are both
series-independent, and with one row per (family, category) their check_keys
stay unique. A bad destination series can no longer occur — the FK rejects it
at write time, so no orphan-series check is required here.

## Rendering (`src/lib/cross-listings.ts` + category page)

The category page flow is unchanged in shape; the borrowed card's **series
label** now comes from the placement, not from home:

- `fetchCrossListedCards(extraSlug)` fetches placements
  `(family_id, category_slug = extraSlug, sub_category = destinationSeries)`,
  joins to families for each one's home `(category_slug, code)`, groups by home
  category, fetches each home category's cards once via
  `fetchCatalogConfigurations`, then for every borrowed code sets the card's
  `material` (series facet) to the **destination series**, `categorySlug =
  extraSlug`, `detailCategorySlug = home slug` (canonical link unchanged).
- Home-hidden series are still dropped (visibility follows the home category).
- **No more borrowed `seriesI18n`.** The destination series is a real managed
  subcategory of the destination category, so its name + translations already
  come from that category's own overlay (built by the page today). The
  `crossSeriesI18n` merge added to the category page in the shipped version is
  **removed**.
- Because `material` is now a destination-category series, the borrowed card
  slots into that series' correct position in the sidebar/grid (via the existing
  `applySubcategoryOverlay`), not appended at the end. A destination series with
  no native products still appears (populated purely by borrowed cards) in its
  managed position.
- Country gating, images, canonical detail link, search: unchanged.

## Admin (Families tab)

The per-row **"Also in…"** modal changes from category checkboxes to a
**series picker per category**:

- One row per active category except the family's home category. Each row has a
  `<select>` listing that category's **active** subcategories, plus a
  "— not shown —" empty option.
- Choosing a series places the card there; choosing "— not shown —" removes the
  placement. Pre-filled from the family's current placements.
- **Save** diffs the draft against current placements: upsert `(family_id,
  category_slug, sub_category)` on conflict `(family_id, category_slug)` for
  chosen/changed rows; delete rows set back to "— not shown —". Then reload +
  `triggerPublish()`.
- **Row badges** now read `+ <Category> / <Series>` so the destination series is
  visible at a glance.
- **Tab search** matches the destination category name AND the destination
  series name (extends the existing `extraFieldsFor`).

## Out of scope (unchanged from before)

- A second product URL / breadcrumb under the destination category.
- Per-SKU cross-listing.
- Multiple destination series per category for one family.
- Catalogue PDFs.

## Verification

- Unit tests for the reshaped helpers (placement grouping, the new diff, card
  `material` override to the destination series, home-hidden still dropped).
- `npm test` green; `npx astro check` clean (bar the pre-existing
  `catalogues.test.ts:5`).
- Live: migration applied; admin modal places a Compression Fittings family
  under a chosen Turf series; the card appears in **that** Turf section on
  `/catalog/turf/` (not appended at the end), links to its
  `/catalog/compression-fittings/<slug>/` page; changing the series moves it;
  "— not shown —" removes it.
- Data checker still returns cleanly; self/empty checks unaffected.
