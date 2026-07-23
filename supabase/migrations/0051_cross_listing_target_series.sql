-- 0051_cross_listing_target_series.sql — add a destination series to a
-- cross-listing.
--
-- A cross-listing row now says: family <family_id> appears on category
-- <category_slug>'s page UNDER series <sub_category> (a managed subcategory of
-- that destination category). The home category still owns the product page,
-- image and country gating. The live table is empty, so no backfill.
-- Spec: docs/superpowers/specs/2026-07-22-cross-listing-target-series-design.md

alter table public.product_family_extra_categories
  add column if not exists sub_category text not null;

-- The destination series must be a managed subcategory of the destination
-- category. product_subcategories has unique (category_slug, name).
alter table public.product_family_extra_categories
  drop constraint if exists pfec_dest_series_fk;
alter table public.product_family_extra_categories
  add constraint pfec_dest_series_fk
  foreign key (category_slug, sub_category)
  references public.product_subcategories (category_slug, name)
  on delete cascade;
