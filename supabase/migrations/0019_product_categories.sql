-- public.product_categories + public.product_subcategories
--
-- product_categories replaces the old Astro markdown collection
-- (src/content/categories/*.md) as the single source of truth for the 13
-- product categories. It backs the Products mega-nav, the /products/ grid, and
-- the /catalog/<slug> routes. `product_category_name` links a category to the
-- Excel `products.category_name` value for the catalogue-backed categories
-- (Compression Fittings, Hydraulic Fittings, Saddles); it is null for the rest.
--
-- product_subcategories is an OVERLAY over the series that already exist as
-- products.sub_category values. It only stores display order + visibility (and
-- lets the admin rename a series). The catalog still derives the real set of
-- series from products, then applies this overlay, so no product is ever
-- orphaned by a missing overlay row.

-- ============================================================ product_categories
create table if not exists public.product_categories (
  slug                  text primary key,
  name                  text not null,
  sort_order            integer not null default 0,
  image                 text not null,
  source_image          text,
  leaflet_pdf           text,
  blurb                 text,
  product_category_name text,        -- Excel products.category_name (nullable)
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================ product_subcategories
create table if not exists public.product_subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.product_categories(slug) on delete cascade,
  name          text not null,       -- matches products.sub_category
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category_slug, name)
);

create index if not exists product_subcategories_cat_idx
  on public.product_subcategories (category_slug, sort_order);

-- ============================================================ updated_at triggers
-- Reuse public.set_updated_at() from 0001_jobs.sql.
drop trigger if exists set_product_categories_updated_at on public.product_categories;
create trigger set_product_categories_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_product_subcategories_updated_at on public.product_subcategories;
create trigger set_product_subcategories_updated_at
  before update on public.product_subcategories
  for each row execute function public.set_updated_at();

-- ============================================================ RLS
alter table public.product_categories    enable row level security;
alter table public.product_subcategories enable row level security;

-- product_categories: public reads active rows (build + live site use anon key)
drop policy if exists "public read active product_categories" on public.product_categories;
create policy "public read active product_categories"
on public.product_categories for select to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on product_categories" on public.product_categories;
create policy "authenticated full access on product_categories"
on public.product_categories for all to authenticated
using (true) with check (true);

-- product_subcategories: public reads ALL rows (catalog needs hidden rows too,
-- so it can remove hidden series from the derived list)
drop policy if exists "public read product_subcategories" on public.product_subcategories;
create policy "public read product_subcategories"
on public.product_subcategories for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_subcategories" on public.product_subcategories;
create policy "authenticated full access on product_subcategories"
on public.product_subcategories for all to authenticated
using (true) with check (true);

-- ============================================================ seed: categories
-- Transcribed from src/content/categories/*.md (order = sort_order).
insert into public.product_categories
  (slug, name, sort_order, image, source_image, blurb, product_category_name) values
  ('compression-fittings', 'Compression Fittings', 0,
   '/images/products/categories/compression-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/a-11000-compression-fittings.png?ver=20201216085420',
   'Quick-fit re-usable fittings for PE pipes — Epsilon, Lambda, Zeta, Omicron, Eta series.',
   'Compression Fittings'),
  ('hydraulic-fittings', 'Hydraulic Fittings', 1,
   '/images/products/categories/hydraulic-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/b-11100-hydraulic-fittings.png?ver=20201216085420',
   'Flanged adaptors and high-pressure connectors for PE mains and metallic infrastructure.',
   'Hydraulic Fittings'),
  ('saddles', 'Saddles', 2,
   '/images/products/categories/saddles.png',
   'https://elysee.com.cy/portal-img/default/246/c-11200-saddles.png?ver=20201216085420',
   'Tapping saddles for PE mains — fast branch connections without cutting the line.',
   'Saddles'),
  ('light-weight-fittings', 'Light-Weight Fittings', 3,
   '/images/products/categories/light-weight-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/d-11300-light-weight-fittings.png?ver=20201216085420',
   'Compact fittings for low-pressure irrigation and drainage runs.',
   null),
  ('valves', 'Valves', 4,
   '/images/products/categories/valves.png',
   'https://elysee.com.cy/portal-img/default/246/e-11400-valves.png?ver=20201216085420',
   'PVC ball valves, double-union valves, gate valves for water and chemical lines.',
   null),
  ('filters-and-dosers', 'Filters & Dosers', 5,
   '/images/products/categories/filters-and-dosers.png',
   'https://elysee.com.cy/portal-img/default/246/f-11500-filters-dosers.png?ver=20201216085420',
   'Disc and screen filters, fertigation dosers for irrigation networks.',
   null),
  ('micro-irrigation-and-sprinklers', 'Micro-Irrigation & Sprinklers', 6,
   '/images/products/categories/micro-irrigation-and-sprinklers.png',
   'https://elysee.com.cy/portal-img/default/246/g-11600-micro-irrigation-sprinklers.png?ver=20201216085420',
   'Drippers, micro-sprinklers, and emitters for precision agriculture and landscape.',
   null),
  ('turf', 'Turf', 7,
   '/images/products/categories/turf.png',
   'https://elysee.com.cy/portal-img/default/246/h-11700-turf.png?ver=20201216085420',
   'Pop-up sprinklers and turf irrigation systems for sports fields and landscapes.',
   null),
  ('polyethylene-pipes', 'Polyethylene Pipes', 8,
   '/images/products/categories/polyethylene-pipes.png',
   'https://elysee.com.cy/portal-img/default/246/i-11800-polyethylene-pipes.png?ver=20201216085420',
   'PE pipes for water mains, gas distribution, and industrial fluid transport.',
   null),
  ('pvc-pressure-pipes-and-fittings', 'PVC Pressure Pipes & Fittings', 9,
   '/images/products/categories/pvc-pressure-pipes-and-fittings.png',
   'https://elysee.com.cy/portal-img/default/249/pvc-pressure-pipes-fittings-B2tsX.png?ver=20201216085420',
   'PVC pressure pipes and solvent-weld fittings for water supply and chemical lines.',
   null),
  ('network-drainage', 'Network Drainage', 10,
   '/images/products/categories/network-drainage.png',
   'https://elysee.com.cy/portal-img/default/246/k-12000-network-drainage.png?ver=20201216085420',
   'Drainage pipes and fittings for stormwater and surface runoff networks.',
   null),
  ('cable-applications', 'Cable Applications', 11,
   '/images/products/categories/cable-applications.png',
   'https://elysee.com.cy/portal-img/default/246/l-12100-cable-applications.png?ver=20201216085420',
   'Cable conduit and protection systems for buried utility runs.',
   null),
  ('building-sewerage', 'Building Sewerage', 12,
   '/images/products/categories/building-sewerage.png',
   'https://elysee.com.cy/portal-img/default/246/m-12200-building-sewerage.png?ver=20201216085420',
   'Soil and waste pipe systems for residential and commercial buildings.',
   null)
on conflict (slug) do nothing;

-- ============================================================ seed: subcategories
-- One overlay row per distinct (category, series) already present in products,
-- ordered by the series' first appearance (min sort_order) in the catalogue.
insert into public.product_subcategories (category_slug, name, sort_order)
select pc.slug, sub.sub_category, sub.ord
from (
  select category_name, sub_category, min(sort_order) as ord
  from public.products
  where sub_category is not null and sub_category <> ''
  group by category_name, sub_category
) sub
join public.product_categories pc on pc.product_category_name = sub.category_name
on conflict (category_slug, name) do nothing;
