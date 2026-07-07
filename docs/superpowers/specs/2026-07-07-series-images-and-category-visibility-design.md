# Series-Specific Images (Epsilon/Zeta) + Category Visibility Checklist — Design

Approved by the user 2026-07-07 (plain-English walkthrough in-session).

## Problem

1. **Epsilon/Zeta shared codes show one photo.** 17 compression-fittings
   family codes (380, 380A–D, 381, 381A, 382, 382A–D, 383, 383A, 384,
   384A–B) carry products in BOTH "έ - Epsilon Series PN 16 bar" and
   "ζ - Zeta Series PN 16 bar". Every one of them currently has exactly one
   untagged gallery image, so both series render the same photo. The Zeta
   ("zero-force") photos existed on the old per-product image system and
   survive only in the `_retired_image_urls` snapshot taken by migration 0040.

2. **No single place to control what shows per category.** Visibility today
   is per-product `is_hidden` edited one product at a time in the form. The
   user wants a per-category checklist — **one checkbox per size/code**
   (option B, user's explicit choice) — controlling site visibility.

## Part 1 — Zeta photo restore (data only, no code)

- Source of truth for placement: `_retired_image_urls` rows with
  `source='products'` joined to `products` on `code` → gives each old URL its
  `family_code` and `sub_category`. Only rows whose sub_category is the Zeta
  series are restored.
- For each (family, url): verify the storage object still exists (never
  create a broken ref), then insert into `product_family_images` with
  `series = 'ζ - Zeta Series PN 16 bar'` and the next free `sort_order`.
  Existing untagged images stay untagged — Epsilon (and any other series)
  keeps its current look via the untagged fallback; Zeta configurations pick
  the tagged image first (`resolveSeriesImages` order).
- Cap respected: every target family currently has 1 image (max 5).
- Output: list of shared codes still lacking a Zeta image (user uploads those
  manually via Families → Manage images → series dropdown).
- Verification: live pages `/catalog/compression-fittings/epsilon-series-pn-16-bar-380`
  vs `zeta-series-pn-16-bar-380` show different primaries; checker stays at
  0 broken_image_ref errors.

## Part 2 — Admin "Visibility" tab

**Placement:** new dedicated tab `visibility` in `Dashboard.tsx` (rejected:
folding into ProductsTab — that tab already carries editing/import/export and
mixing edit with show/hide invites mistakes; CategoriesTab — categories are
structure, not stock).

**UI (`src/components/admin/VisibilityTab.tsx`):**
- Category picker (buttons like other tabs).
- Tree for the picked category: series → configuration (card) → size rows,
  one checkbox per size (products.code). Checked = visible.
- Tri-state bulk checkboxes on configuration and series headers
  (indeterminate when mixed); ticking/unticking cascades.
- Search box filtering by code / configuration name / size text.
- Counter: "N of M sizes visible" for the picked category.
- The list ALWAYS shows hidden rows (query ignores is_hidden) so anything can
  be re-ticked.

**Semantics:** checkbox drives `products.is_hidden` (existing flag already
respected by every public query: catalog, search, checker). `is_active` and
country groups untouched — this is the site-wide switch only. Catalog pages
are SSR (`prerender = false`) so changes appear on next page load;
`triggerPublish()` is still called after successful saves, matching the other
tabs.

**Writes:** `update products set is_hidden = X where code in (...)`, chunked
(reuse the CHUNK pattern from ProductBulkBar) for series-level bulk ops.
Optimistic UI; on error re-fetch and surface the message.

**Pure logic** in `src/lib/visibility.ts` (vitest-covered):
- `buildVisibilityTree(rows)` → series → configuration → sizes structure with
  per-node visible/total counts.
- `codesForNode(tree, nodeRef)` → the size codes a bulk toggle affects.
- Tri-state derivation (`all | none | mixed`) per node.

**Testing/verification:**
- Unit tests for the tree/toggle helpers.
- Full site loop verified with one real product (hide → confirm gone from
  category page + search → unhide → confirm back). UI clicked through by the
  user after deploy (admin login is theirs).

## Out of scope

- Per-country visibility (Groups system remains as-is).
- Deleting products; the checklist only hides/shows.
- Site-wide a11y color-contrast debt, stale nav specs (tracked separately).

## Amendment (2026-07-07, user request after first release)

Zeta series size rows additionally carry two market-group checkmarks —
**Group A** and **Group B** (`product_group_memberships`): ticking adds the
size to that group's countries, unticking removes it. Scoped to Zeta rows
only (user's explicit choice over all-series or all-groups variants);
detection is name-based (`isZetaSeries`). Groups C/D/E and all other series
stay managed via the Country Groups tab / bulk import. Duplicate-insert
races (23505) are treated as success.
