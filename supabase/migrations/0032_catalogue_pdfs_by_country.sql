-- Two PDF slots (Black + Blue) per catalogue row, each gated by a subset
-- of country groups (A–E). Plus explicit linkage from a catalogue row to
-- a product category page (or product series, for subcategory rows).
-- Additive only; the legacy pdf_url column is kept for one release.

alter table public.catalogues
  add column if not exists pdf_url_black        text,
  add column if not exists pdf_url_blue         text,
  add column if not exists groups_black         text[],
  add column if not exists groups_blue          text[],
  add column if not exists category_slug        text,
  add column if not exists product_sub_category text;

-- Backfill: the existing single pdf_url becomes Black, visible to every market.
update public.catalogues
set pdf_url_black = coalesce(pdf_url_black, pdf_url),
    groups_black  = coalesce(groups_black, array['A','B','C','D','E']),
    groups_blue   = coalesce(groups_blue, array[]::text[])
where pdf_url is not null and pdf_url_black is null;

create index if not exists idx_catalogues_category_slug
  on public.catalogues (category_slug);
