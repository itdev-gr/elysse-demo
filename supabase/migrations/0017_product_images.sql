-- Product images: an uploadable image library + a per-product image assignment.
--
--   products.image_url      the image a product (and its configuration card) shows
--   product_images          the library of uploaded images (reusable, dashboard-managed)
--   storage bucket 'product-images'  holds the files
--
-- Images are matched to products by family_code at ingest time; the dashboard
-- lets an editor upload more and re-allocate which image each configuration uses.

alter table public.products add column if not exists image_url text;

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  filename    text,
  family_code text,          -- parsed from the filename at ingest (nullable)
  source      text,          -- source folder / series, for reference
  created_at  timestamptz not null default now()
);

create index if not exists product_images_family_idx on public.product_images (family_code);

-- RLS
alter table public.product_images enable row level security;

drop policy if exists "public read product_images" on public.product_images;
create policy "public read product_images"
on public.product_images for select to anon, authenticated using (true);

drop policy if exists "authenticated full access on product_images" on public.product_images;
create policy "authenticated full access on product_images"
on public.product_images for all to authenticated using (true) with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images"
on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "auth write product-images" on storage.objects;
create policy "auth write product-images"
on storage.objects for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "auth update product-images" on storage.objects;
create policy "auth update product-images"
on storage.objects for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "auth delete product-images" on storage.objects;
create policy "auth delete product-images"
on storage.objects for delete to authenticated using (bucket_id = 'product-images');
