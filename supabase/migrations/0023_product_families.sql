-- public.product_families
--
-- A managed list of the family codes (products.family_code, e.g. 330, 330A, 330T)
-- that sit under each product category. In the admin's language a "family" is a
-- category (Compression Fittings) and the "family codes" are the codes under it.
--
-- Purpose:
--   * pre-register a code before any product uses it (so the product form's
--     Family code dropdown can offer it);
--   * hold the image allocated to that code (shared by every product in it);
--   * give the code a display order / visibility, like product_subcategories does
--     for series.
--
-- Image + product matching is keyed on (category, family_code): a family_code
-- belongs to exactly one category, so that pair uniquely identifies the set of
-- products that share the code's image.

-- ============================================================ product_families
create table if not exists public.product_families (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.product_categories(slug) on delete cascade,
  code          text not null,        -- matches products.family_code
  image_url     text,                 -- allocated from the product_images library
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category_slug, code)
);

create index if not exists product_families_cat_idx
  on public.product_families (category_slug, sort_order);

-- ============================================================ updated_at trigger
-- Reuse public.set_updated_at() from 0001_jobs.sql.
drop trigger if exists set_product_families_updated_at on public.product_families;
create trigger set_product_families_updated_at
  before update on public.product_families
  for each row execute function public.set_updated_at();

-- ============================================================ RLS
alter table public.product_families enable row level security;

-- public reads all rows (build + live site use the anon key), like product_subcategories
drop policy if exists "public read product_families" on public.product_families;
create policy "public read product_families"
on public.product_families for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_families" on public.product_families;
create policy "authenticated full access on product_families"
on public.product_families for all to authenticated
using (true) with check (true);

-- ============================================================ seed
-- One row per distinct (category, family_code) already present in products.
-- sort_order is a dense 0-based rank within the category, ordered by the code's
-- first appearance in the catalogue. image_url copies the code's existing image.
insert into public.product_families (category_slug, code, image_url, sort_order)
select pc.slug, f.family_code, f.image_url,
       (row_number() over (partition by pc.slug order by f.ord, f.family_code))::int - 1
from (
  select
    category_name,
    family_code,
    min(sort_order) as ord,
    (array_agg(image_url order by sort_order) filter (where image_url is not null))[1] as image_url
  from public.products
  where family_code is not null and family_code <> ''
  group by category_name, family_code
) f
join public.product_categories pc on pc.product_category_name = f.category_name
on conflict (category_slug, code) do nothing;
