-- Up to 5 images per product family, ordered; the lowest sort_order is the primary.
-- product_families.image_url stays as a mirror of the primary (kept in sync by the
-- admin), so listing cards and products.image_url propagation are unaffected.

create table if not exists public.product_family_images (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.product_families(id) on delete cascade,
  url         text not null,               -- an uploaded product-images library URL
  sort_order  integer not null default 0,  -- 0 = primary, then 1..4
  created_at  timestamptz not null default now()
);

create index if not exists product_family_images_family_idx
  on public.product_family_images (family_id, sort_order);

-- RLS mirrors product_families (0023): public reads, authenticated full access.
alter table public.product_family_images enable row level security;

drop policy if exists "public read product_family_images" on public.product_family_images;
create policy "public read product_family_images"
on public.product_family_images for select to anon, authenticated using (true);

drop policy if exists "authenticated full access on product_family_images" on public.product_family_images;
create policy "authenticated full access on product_family_images"
on public.product_family_images for all to authenticated using (true) with check (true);

-- Backfill: today's single family image becomes the primary (sort_order 0).
insert into public.product_family_images (family_id, url, sort_order)
select f.id, f.image_url, 0
from public.product_families f
where f.image_url is not null and f.image_url <> ''
  and not exists (
    select 1 from public.product_family_images i where i.family_id = f.id
  );
