# Admin — Product Families tab

**Date:** 2026-06-23
**Status:** Approved design, pending spec review

## Summary

Add a new **Family** tab to the admin dashboard (under the *Products* group) that
lets an editor manage the **family codes** that products belong to, and allocate a
shared image to each one. A "family" in the user's language is a **category**
(e.g. *Compression Fittings*); the "family codes" are the `products.family_code`
values under it (`330`, `331`, `330A`, `330T`, …) — numbers with an optional
trailing letter.

Today `family_code` is free-text on each product, and the product form's *Family
code* dropdown only offers codes that already exist on products — so a code can't
be created before a product uses it, and there's no managed place to hold a code's
image or display order. This feature introduces a managed list, mirroring the
existing **series overlay** (`product_subcategories`) and the **image picker**
(`product_images`) patterns already in the codebase.

## Goals

- A **Family** tab listing each category and the family codes under it.
- Create / rename / hide / delete family codes (delete blocked while products use it).
- Allocate an image to a family code from the existing image library; it applies to
  every product with that code and is remembered on the family for future products.
- The product form's *Family code* dropdown reads from this managed list, so newly
  created codes are immediately selectable (even with zero products yet).
- Nothing in the existing Images / Categories tabs is removed.

## Non-goals (YAGNI)

- No series assignment when creating a code. A code's series (`sub_category`) is set
  later, when products carry it; the catalog derives series from products regardless.
  *(Confirmed with user.)*
- No new image upload UI in the Family tab — uploads stay in the Images tab; the
  Family tab only **picks** from the shared `product_images` library.
- No change to the product primary `code` (SKU) flow. The dropdown selects
  `family_code`, not the product's own `code`.
- No nesting of families under series in the UI (Category → Code only).

## Data model

### New table `public.product_families`

One row per family code, scoped to a category.

| column          | type        | notes                                                |
|-----------------|-------------|------------------------------------------------------|
| `id`            | uuid PK     | `gen_random_uuid()`                                  |
| `category_slug` | text        | FK → `product_categories(slug)` on delete cascade    |
| `code`          | text        | the family code, e.g. `330`, `330A`, `330T`          |
| `image_url`     | text null   | allocated image (from `product_images` library)      |
| `sort_order`    | integer     | default 0                                            |
| `is_active`     | boolean     | default true                                         |
| `created_at`    | timestamptz | default now()                                        |
| `updated_at`    | timestamptz | default now(), `set_updated_at()` trigger            |

- `unique (category_slug, code)`.
- Index on `(category_slug, sort_order)`.
- RLS: public read all rows (so the build/live site can read with the anon key,
  consistent with `product_subcategories`); authenticated full access. Mirror the
  policy block from migration `0019`.

### Migration `0023_product_families.sql`

1. Create the table, index, trigger, RLS policies (copy the shape of `0019`).
2. **Seed** from existing products so the tab is populated on day one:
   - For each distinct `(category_name, family_code)` in `products` where
     `family_code` is non-empty, join `product_categories` on
     `product_category_name = category_name` to get `category_slug`.
   - `image_url` = any one existing `products.image_url` for that code (they share it).
   - `sort_order` = rank of the code within its category by first appearance
     (`min(sort_order)` of its products), so the tab lists codes in catalogue order.
   - `on conflict (category_slug, code) do nothing`.

Relationship key: images and product matching are keyed on **`family_code` within a
category**. The data shows a `family_code` belongs to exactly one category and one
series, so `(category_name, family_code)` uniquely identifies the set of products to
update — we don't need `sub_category` in the match.

## Library — `src/lib/families.ts`

New module, parallel to `src/lib/categories.ts`.

```ts
export interface ProductFamily {
  id: string;
  category_slug: string;
  code: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// Families ordered by (category_slug, sort_order). Active-only unless includeHidden.
export async function getFamilies(opts?: { includeHidden?: boolean }): Promise<ProductFamily[]>;
```

The admin tab queries Supabase directly (like `CategoriesTab`); `getFamilies` exists
for any future server/catalog use and keeps the type in one place.

## UI — `src/components/admin/FamiliesTab.tsx`

Registered in `Dashboard.tsx`:
- Add `'families'` to the `Tab` union and `HEADINGS` (`'Families.'`).
- Add `{ id: 'families', label: 'Families' }` to the *Products* group, placed
  **after Categories** and before Country Groups.
- Render `{tab === 'families' && <FamiliesTab />}`.

### Layout (follows `CategoriesTab` visual language)

For **every** category (active or hidden, rendered dimmed when hidden — same as
`CategoriesTab`; a category with no codes still renders so the editor can add the
first one):

```
Compression Fittings            /compression-fittings
  Family codes                              [ + Add code ]
  ┌──────────────────────────────────────────────────────┐
  │ [img] 330    Epsilon Series PN 16 bar   128 prod      │  Allocate image · Rename · Hide · ×
  │ [img] 330A   Epsilon Series PN 16 bar    24 prod      │  ...
  │ [  ] 331A    Epsilon Series PN 16 bar     6 prod      │  ...
  └──────────────────────────────────────────────────────┘
```

- **Thumbnail**: 40×40 of `family.image_url`, or a "None" placeholder.
- **Series label**: derived from products for that code (informational; blank for a
  pre-created code with no products yet).
- **Product count**: number of products with that `family_code` (paginated count,
  same approach as `CategoriesTab` / `ImagesTab`).
- **Actions** per row:
  - **Allocate image** → opens the image picker modal (see below).
  - **Rename** → `prompt()` for a new code; updates the family row and, if products
    exist, `update products set family_code = <new> where category_name = <excel> and
    family_code = <old>` (guard: warn if the new code already exists in the category).
  - **Hide / Show** → toggles `is_active`.
  - **Delete (×)** → blocked with a message if `count > 0` ("still has N products —
    hide it instead"); otherwise confirm + delete. Same guardrail as series.
- **+ Add code**: inline text input (like *Add subcategory*). Validates the code is
  non-empty and not already present in the category. Inserts a `product_families` row
  with `sort_order` = current count.
- Every mutation calls `triggerPublish()` after reloading, matching the other tabs.

### Image picker modal

Reuse the **exact pattern** from `ImagesTab` (`LibraryGrid` + `ImageCard` with
`onPick`). On allocate to family `F` in category with excel name `E`:

1. `update product_families set image_url = <picked.url> where id = F.id`
2. `update products set image_url = <picked.url> where category_name = E and family_code = F.code`
3. Reload + `triggerPublish()`.

**Clear** sets both back to `null` the same way. The picked image is never moved or
deleted from `product_images`, so it stays in the Images tab library.

> Extract the shared image-picker grid (`ImageCard` / `LibraryGrid`) into
> `src/components/admin/ImageLibraryGrid.tsx` and import it from both `ImagesTab` and
> `FamiliesTab`, so the two tabs can't drift. This is the one small refactor of
> existing code the feature justifies.

## Product form wiring — `src/components/admin/ProductForm.tsx`

- Add a query (like the existing `managedSubs` effect) that loads `product_families`
  (active) joined to category names, into `managedFamilies: { category_name, code,
  image_url }[]`.
- `familyCodeOpts` becomes the union of:
  - distinct `family_code` from existing products filtered by the selected category
    (and series, as today), **plus**
  - `managedFamilies` codes for the selected `category_name`.
  De-duplicated and sorted (existing `uniqSorted` helper).
- **Auto-fill image**: when the user picks a `family_code` and that managed family has
  an `image_url`, default the draft's `image_url` to it **only if** the draft has none
  yet (don't clobber an explicit choice). Ensure `EMPTY` includes `image_url: null`.

## Error handling

- All Supabase errors surface in the existing red inline `role="alert"` banners (copy
  the pattern already in `CategoriesTab` / `ImagesTab`).
- Delete / rename guardrails prevent orphaning products.
- Image allocation updates two tables; if the second update fails, surface "Image
  saved on the family, but updating products failed: <msg>" so the editor knows the
  catalog wasn't refreshed.

## Testing

- `src/lib/families.test.ts` — `getFamilies` ordering and active-only filtering
  (follow `categories`/`products` test style, mocking Supabase).
- Pure-helper unit tests for any new derivation (e.g. merging product-derived +
  managed family codes, de-dupe/sort) extracted as a small function so it's testable
  without the DB, mirroring `applySubcategoryOverlay`.
- Manual: run the dev server, open `/admin`, add a code, allocate an image, confirm it
  appears on the catalog and in the product-form dropdown, and that the image is still
  in the Images tab.

## Rollout / files touched

**New**
- `supabase/migrations/0023_product_families.sql`
- `src/lib/families.ts`
- `src/lib/families.test.ts`
- `src/components/admin/FamiliesTab.tsx`
- `src/components/admin/ImageLibraryGrid.tsx` (extracted from `ImagesTab`)

**Edited**
- `src/components/admin/Dashboard.tsx` (register tab)
- `src/components/admin/ImagesTab.tsx` (use extracted grid)
- `src/components/admin/ProductForm.tsx` (managed family codes + image auto-fill)

Migration is applied via the Supabase Management API (per project convention).

## Open questions

None outstanding. Series-on-create and image-scope both confirmed with the user.
