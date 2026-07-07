-- 0040_retire_image_mirror_columns.sql — image-mirror retirement, part 2 of 2.
--
-- ⚠ DEPLOY GATE: apply ONLY after the frontend containing the 0039-era code
-- pass (ProductForm/ProductDraft without image_url) is live on Vercel. The
-- previous deploy inserts/updates products with an image_url key on every
-- product save, which errors (PGRST204) once the column is gone.
--
-- Drops the vestigial mirror columns that caused the July-2026 "disappearing
-- images" incident (four denormalized copies of every image URL). Since 0038
-- nothing reads them, and since 0039 no DB function references them; the
-- family gallery (product_family_images) is the single source of truth.
--
-- Safety snapshot: both columns are copied into _retired_image_urls first.
-- At retirement time, 14 distinct products.image_url values existed in no
-- family gallery (per-product Zero-Force Z380/381–384 images) — unread by the
-- site, but preserved here in case a future per-configuration image feature
-- wants them. The table is not exposed: RLS enabled with no policies, all
-- Data API grants revoked. Drop it whenever it stops being useful.

create table if not exists public._retired_image_urls (
  source     text not null check (source in ('products', 'product_families')),
  code       text not null,
  image_url  text not null,
  retired_at timestamptz not null default now()
);

comment on table public._retired_image_urls is
  'One-time snapshot of products.image_url / product_families.image_url taken by 0040 before dropping the columns. Reference only — safe to drop once nobody wants the legacy per-product image links.';

insert into public._retired_image_urls (source, code, image_url)
select 'products', p.code, p.image_url
from public.products p where p.image_url is not null
union all
select 'product_families', f.category_slug || '/' || f.code, f.image_url
from public.product_families f where f.image_url is not null;

alter table public._retired_image_urls enable row level security;
revoke all on table public._retired_image_urls from anon, authenticated;

-- The drops. No views, indexes, policies, or triggers depend on either
-- column (verified 2026-07-07), and 0039 removed every function reference.
alter table public.products drop column if exists image_url;
alter table public.product_families drop column if exists image_url;

-- Make PostgREST pick up the narrowed schemas immediately (Supabase's DDL
-- event trigger usually does this; explicit is harmless and certain).
notify pgrst, 'reload schema';
