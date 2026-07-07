# Image Column Retirement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the family-owned-images redesign by retiring every vestigial image reference: the legacy `set_family_images(uuid,text,text,text[])` RPC, the `products.image_url` / `product_families.image_url` columns, and the inert per-country image override.

**Architecture:** Two migrations with a deploy gate between them. 0039 (safe against the *currently deployed* frontend) drops the legacy RPC and rewrites the three DB functions that still read the vestigial columns (`delete_library_image`, `run_product_data_checks`, `search_site`) so nothing references them anymore. The code pass then removes every read/write of `image_url` from the app. 0040 (apply **only after** the code pass is deployed, because the deployed ProductForm still writes `image_url` on product save) snapshots both columns into a backup table and drops them.

**Tech Stack:** Postgres (Supabase, applied via Management API), Astro + React admin, vitest.

## Global Constraints

- NO git commits — the user reviews everything first (feedback_no_commit_until_review).
- Migration 0040 must NOT be applied until the code changes from Tasks 2–3 are deployed to Vercel; the deployed ProductForm inserts/updates products with an `image_url` key, which errors once the column is gone.
- Migration 0039 must keep the return shape of `search_site` and the response semantics of `delete_library_image` compatible with the currently deployed frontend (`deleteBlockedMessage` guards every count with `> 0`, so omitted keys are safe).
- The `data-for-country` CSS rules in `src/styles/catalog.css` MUST stay — `SkuTable.astro` still uses them. Only the ProductCard per-country image branch goes.
- Never write the Supabase management token into a repo-tracked file.

## Verified Facts (research, 2026-07-07)

- Live DB has BOTH `set_family_images` overloads; deployed FamiliesTab calls the jsonb one (`p_family_id, p_images`).
- Functions whose source mentions `image_url`: `delete_library_image`, `run_product_data_checks`, `set_family_images` (legacy overload), `search_site` (returns `p.image_url` as the product thumbnail — must switch to the gallery primary).
- No views, indexes, policies, or triggers depend on either column. pg_cron job `product-data-checks-daily` calls `run_product_data_checks()` by name (unaffected by `create or replace`).
- Every family with a mirror value has gallery rows (parity backfill held). 14 distinct `products.image_url` URLs exist in no gallery (Zero-Force Z380/381–384 per-product images) — unread by the site; preserved by the 0040 backup table.
- No products/families with `coupling-*` codes exist in the DB → the per-country override can never match → truly inert.
- xlsx import drops unknown headers (`normalizeHeaderRow`), so removing the `Image_url` column from the format keeps old exported files importable.

---

### Task 1: Migration 0039 — drop legacy RPC, de-vestigialize DB functions

**Files:**
- Create: `supabase/migrations/0039_retire_image_mirrors_functions.sql`

**Interfaces:**
- Produces: `set_family_images(uuid, jsonb)` as the ONLY overload; `delete_library_image` in_use response `{deleted:false, reason:'in_use', gallery_rows, families}`; checker v4 `broken_image_ref` watching gallery+library only; `search_site` product `image` = series-aware gallery primary (same resolution order as `resolveSeriesImages`: tagged-for-series → untagged → any, by `sort_order`).

- [x] **Step 1: Write the migration file** — four statements:
  1. `drop function if exists public.set_family_images(uuid, text, text, text[]);`
  2. `create or replace function public.delete_library_image(p_id uuid)` — same as 0037 minus `v_products`/`v_mirrors`; blocks only on `product_family_images` rows; in_use payload `jsonb_build_object('deleted', false, 'reason', 'in_use', 'gallery_rows', v_gallery, 'families', to_jsonb(v_fams))`.
  3. `create or replace function public.run_product_data_checks()` — full 0038 body with ONLY the `broken_image_ref` block changed: reference sources reduced to gallery + library, message "referenced by N gallery image(s), N library entry(ies)", raw keys `url, object, gallery_rows, library_rows`.
  4. `create or replace function public.search_site(...)` — full 0035 body with `img` removed from `prod_hits`/`prod_cfg` and the product branch selecting the gallery primary via a correlated subquery over `product_family_images` ordered by `case when h.sub_cat <> '' and i.series = h.sub_cat then 0 when i.series is null then 1 else 2 end, i.sort_order limit 1`, applied AFTER the `limit p_limit` subselect so it runs for at most `p_limit` rows.
  (Full SQL lives in the migration file — it is the deliverable.)

- [x] **Step 2: Apply to prod via the Management API** (Python + urllib, token from env; jq on this machine is broken). User consent: covered by the explicit "do it" instruction for this retirement pass.

- [x] **Step 3: Verify** — query `pg_proc` (exactly one `set_family_images` overload; no function source in `public` mentions `products.image_url`), run `select public.run_product_data_checks();`, `select * from search_site('adaptor','en',5);` (product rows carry gallery URLs), and a `delete_library_image` dry-run on a gallery-referenced image id (expect `in_use` with `gallery_rows`).

### Task 2: Code pass — remove every `image_url` read/write

**Files:**
- Modify: `src/types/product.ts` (drop `Product.image_url`, collapse `ProductDraft`)
- Modify: `src/lib/families.ts` (drop `ProductFamily.image_url`)
- Modify: `src/lib/image-refs.ts` + `src/lib/image-refs.test.ts` (ImageUsage → `{gallery_rows, families}`, message text)
- Modify: `src/components/admin/ProductForm.tsx` (EMPTY draft, managedFamilies select/type, `pickFamilyCode` no longer copies the family image)
- Modify: `src/components/admin/FamiliesTab.tsx` (row thumb = `primaryByFam[fam.id]` only)
- Modify: `src/components/admin/ProductBulkBar.tsx` (comment only)
- Modify: `src/lib/product-xlsx.ts` (drop `image_url` from PRODUCT_COLUMNS/COLUMN_LABELS/productToRow/template + header comment)
- Modify: `src/lib/product-xlsx.test.ts` (fixture, export-shape test), `src/lib/products.test.ts` (fixture), `src/lib/products.ts` (comment)

- [x] **Step 1: Apply the edits** (mechanical removals; `pickFamilyCode` becomes `setD((p) => ({ ...p, family_code: v }))`).
- [x] **Step 2: Update the xlsx export test** — `productToRow` result must NOT contain an `image_url` key; import-inert tests stay (unknown header → dropped).
- [x] **Step 3: Run `npm test`** — all vitest suites pass.

### Task 3: Remove the inert per-country image override

**Files:**
- Modify: `src/components/catalog/ProductCard.astro` (drop import + `perCountryEntries` branch; keep fallback `<img>` + placeholder)
- Delete: `src/scripts/catalog/per-country-images.ts`
- Delete: `public/images/products/coupling-{epsilon-pn16,transition}-{elysee,rohrsysteme}.png` (only if grep shows no other reference)

- [x] **Step 1: Edit ProductCard, delete the module, grep for stragglers** (`per-country`, `imagesForProduct`, the four PNG filenames).
- [x] **Step 2: Keep `catalog.css` untouched** (SkuTable still renders `data-for-country` spans).

### Task 4: Migration 0040 — backup + drop the columns (AUTHOR ONLY, apply after deploy)

**Files:**
- Create: `supabase/migrations/0040_retire_image_mirror_columns.sql`

- [x] **Step 1: Write the migration**: create `public._retired_image_urls` (`source text, code text, image_url text, retired_at timestamptz default now()`) populated from both tables where `image_url is not null`; RLS enabled with no policies + revoke from anon/authenticated (not readable via Data API); `alter table ... drop column if exists image_url` on both tables; `notify pgrst, 'reload schema';`
- [x] **Step 2: Applied 2026-07-07 after the Vercel deploy went live** (verified via a deleted-asset probe flipping 200→404, ~70s after push). Post-apply verification: both columns gone; `_retired_image_urls` holds exactly 2759 products + 225 family rows, RLS on, anon/authenticated denied (REST returns 401); checker runs (54 open, unchanged); `search_site` returns gallery thumbnails; PostgREST schema cache fresh (`select=image_url` → 42703 on both tables — the PGRST204 stale-cache risk for admin saves is confirmed cleared); live catalog listing renders 393 storage images and the 550F detail page shows its series-tagged primary. (A service-role write probe was denied by the permission classifier — correctly out of scope; the read-only cache probes cover the same risk.)

### Task 5: Verification

- [x] `npm test` (vitest) — 242/242 green.
- [x] `npx tsc --noEmit --ignoreDeprecations 6.0` — only the 2 pre-existing errors also present on HEAD (Button.test.ts astro resolution, catalogues.test.ts); zero new.
- [x] `npm run build` — green; `dist` contains no `per-country-images` code.
- [x] Re-run DB inspection: no `public` function source mentions `image_url`; exactly one `set_family_images`; checker runs (54 open, pre-existing); `search_site` returns gallery URLs; guard dry-run blocks with the new payload.
- [x] e2e (`astro dev` on :4321): `catalog-images` 3/3, `a11y` + `mobile-search-smoke` 29/29.

**Found during verification (unrelated to this change):** the
`catalog-images.spec.ts` multi-series fixture (family 380) went stale — its
gallery was re-tagged in the admin down to ONE untagged image, so both series
resolve the same primary on any code version. Fixture moved to saddles/550F
("4 Bolts"-tagged + untagged, distinct URLs), per the spec's own instruction.
Also pre-existing: `playwright.config.ts` webServer uses `pnpm astro preview`,
which the Vercel adapter rejects — e2e needs a manually-started server on 4321
(`reuseExistingServer: true` picks it up). Left as-is.

## Self-Review

- Legacy RPC wipe hazard → closed immediately in Task 1 (drop, not deprecate). ✓
- Search thumbnails: only consumer of `products.image_url` found in the DB — switched to gallery primary with identical return shape. ✓
- Deploy gate: the ONLY change that can break the deployed frontend is the column drop → isolated in 0040, gated. ✓
- Data safety: 14 gallery-orphan URLs + all mirrors snapshotted into `_retired_image_urls` before the drop; storage files untouched. ✓
- Old xlsx exports keep importing (unknown headers dropped); importer inertness tests retained. ✓
