# Family images (up to 5 per family, primary + ordered others) — Design

**Date:** 2026-07-03
**Status:** Approved (design), pending implementation plan

## Overview

Today each product **family** (a `product_families` row, keyed by `category_slug` +
`code`) carries a single image (`product_families.image_url`), which is propagated
to every member product row (`products.image_url`) and rendered as one image on the
catalog card and the product detail page.

This feature lets a family hold **up to 5 images**, with the admin choosing the
**primary** image (shown wherever one image is shown today) and ordering the rest.
The product detail page renders the primary plus the others as a small thumbnail
gallery. Images continue to be uploaded once into the shared library and allocated
per family in the admin — there are **no Excel import/export changes**.

Non-goals / out of scope:
- No Excel columns for images (the sheet keeps its single per-size `Image_url`).
- No per-size (SKU) galleries — images remain a **family**-level concept.
- No per-series galleries — a family spanning two series shows the same gallery on
  both (consistent with today's shared family image).

## Data model

New table, keyed to a family by FK, ordered by `sort_order` with the lowest =
primary:

```sql
create table public.product_family_images (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.product_families(id) on delete cascade,
  url         text not null,          -- an uploaded product-images library URL
  sort_order  integer not null default 0,   -- 0 = primary, then 1..4
  created_at  timestamptz not null default now()
);
create index on public.product_family_images (family_id, sort_order);
```

- **Primary = the row with the lowest `sort_order`.** No separate `is_primary`
  flag: "set as primary" moves an image to the front; "reorder" shuffles the rest.
  This keeps a single source of truth for order and avoids a "exactly one primary"
  invariant.
- **RLS** mirrors `product_families` (0023): public `select` for `anon` +
  `authenticated`; full access for `authenticated`.
- **Max 5** is enforced in application logic via a `MAX_FAMILY_IMAGES = 5`
  constant (add/append is a no-op once 5 exist). Not a DB constraint.
- **Backfill:** for every `product_families` row with a non-null `image_url`,
  insert one `product_family_images` row at `sort_order 0`. The current single
  image becomes the primary; nothing is lost.

### Relationship to the existing single-image columns

`product_families.image_url` is **kept as a mirror of the primary**, and
`products.image_url` continues to be set to the primary for every member product.
This means:
- Catalog **listing cards** (which read `CatalogProduct.image` from the
  representative product's `image_url`) keep working with **zero changes**.
- The config-card representative image path is unchanged.

Whenever the family's image set changes (add / remove / set-primary / reorder), the
admin re-syncs `product_families.image_url` and `products.image_url` to the new
primary (or `null` when the family has no images) — the same cascade the current
`applyImage` already performs.

## Admin UX — FamiliesTab "Manage images" modal

The current per-family single-pick "Allocate image" modal
(`FamiliesTab.tsx` `applyImage`, L225–239 + modal L415–450) becomes a **manager**:

- A horizontal strip shows the family's selected images **in order**; the first
  carries a **"Primary"** badge.
- Per image: **★ Set primary** (moves it to front), **remove (×)**, and **← / →**
  reorder controls.
- Below the strip, the existing `LibraryGrid` lets the admin **add** more from the
  uploaded library. Clicking a library image **appends** it; the add affordance is
  **disabled once 5 images are selected**.
- The family-row thumbnail keeps showing the **primary**, with a small count badge
  (e.g. "3") when more than one image is set.

Each mutation rewrites that family's `product_family_images` rows (densifying
`sort_order`), then syncs the primary mirror as described above, then
`triggerPublish()` — matching the existing tab's write→reload→publish pattern.

Removing the last image clears back to the placeholder, exactly like today's
"Clear" (`applyImage(null)`).

## Public rendering — product detail gallery

- `ConfigurationDetail` gains `images: string[]` (primary first). `image` stays and
  is defined as `images[0] ?? null` (or the existing single fallback), so existing
  consumers are unaffected.
- `products.ts` builds a `Map<family_code, string[]>` for the category and attaches
  the ordered array to each configuration in `fetchConfigurationDetails`. Because
  `product_family_images` keys off `family_id` (not `family_code`), the join is:
  fetch the category's `product_families` rows (`id`, `code`) + their
  `product_family_images`, group images by `family_id`, then re-key by `code`. A
  family that appears in two series shares the same gallery on both detail pages.
- `ConfigDetail.astro` (L47–61) changes from a single sticky `<img>` to a **main
  image + a thumbnail strip**. When a family has ≤1 image it renders exactly as
  today (no thumbnails). Swap behavior is a small **inline vanilla `<script>`**
  (following the existing back-link script pattern in `[product].astro`): all
  images are server-rendered; the script toggles the main image `src` and the
  active-thumbnail state on click. No React island — keeps it SSR-simple and avoids
  hydration concerns.
- **Accessibility:** thumbnails are focusable `<button>`s with `alt` text and an
  `aria-current`/pressed state for the active image; keyboard-operable.
- **Listing cards are unchanged** — they already render the primary via `image`.

## Testing (TDD)

Pure, testable helpers in a new `src/lib/family-images.ts`, each returning a new
ordered list with **densified `sort_order`** and the ≤5 guard:

- `orderFamilyImages(rows)` → `string[]` (URLs, primary first).
- `addFamilyImage(list, url)` → appends unless already 5 (or URL already present).
- `removeFamilyImage(list, index|url)` → removes and re-densifies.
- `setPrimaryFamilyImage(list, index)` → moves the chosen image to the front,
  others keep relative order.
- `reorderFamilyImage(list, from, to)` (or move up/down) → reorders.

Plus a `products.ts` test: given a family-images map, a configuration for that
family_code receives the correct ordered `images` array (and `image` = primary).

The admin modal and the Astro gallery wire these helpers up; their DB writes and
markup are covered by the pure helpers plus existing patterns (no new test
framework needed for the component).

## Files touched

- **New migration** — `product_family_images` table + RLS + index + backfill.
- **New** `src/lib/family-images.ts` (+ `family-images.test.ts`) — pure helpers +
  `MAX_FAMILY_IMAGES`.
- `src/lib/families.ts` / types — a `FamilyImage` type, a `fetchFamilyImages()` that
  returns all rows grouped by `family_id` (the admin loads every family's images at
  once, like it already loads `facts`), and a `familyImagesByCode(categorySlug)`
  helper that produces the `Map<family_code, string[]>` the build path needs.
- `src/lib/products.ts` — attach `images: string[]` to `ConfigurationDetail`
  (+ test).
- `src/components/admin/FamiliesTab.tsx` — replace the single-pick modal with the
  image manager; update the row thumbnail/count.
- `src/components/catalog/ConfigDetail.astro` — main image + thumbnail gallery +
  inline swap script.

No changes to: `product-xlsx.ts` (Excel), listing cards, `ProductForm.tsx`
(the family-image default still reads `product_families.image_url` = primary).

## Open questions

None outstanding — data model (new table), Excel scope (admin-only), primary
semantics (lowest `sort_order`), and rendering surface (detail-page gallery) are
all decided.
