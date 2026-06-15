-- public.products + group model: backs the /catalog/[category] product pages.
--
-- Data is imported from the Excel master (DBM sheet). The product page lets a
-- visitor pick a country; the country resolves to a group (A-E) via
-- group_countries, and the page shows every product that belongs to that group
-- via product_group_memberships.
--
-- Tables:
--   products                    one row per Excel Code (text primary key)
--   product_groups              the fixed groups A-E (editable label/description)
--   group_countries             country -> group map (dashboard-managed)
--   product_group_memberships   product <-> group join (the Excel "Y" matrix)
--   product_import_issues       review queue for rows that failed validation

-- ============================================================ products
create table if not exists public.products (
  code          text primary key,
  category      text,                 -- Excel "Category" letter: A | B | C
  category_name text,                 -- Excel "Category Description"
  sub_category  text,
  family_code   text,
  configuration text,
  size          text,                 -- Excel "Size - Characteristics"
  packing_bag   integer,
  packing_box   integer,
  moq           integer,
  box_size      text,
  description   text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_sort_idx
  on public.products (category_name, sub_category, sort_order);

-- ============================================================ product_groups
create table if not exists public.product_groups (
  code        text primary key,       -- 'A' .. 'E'
  label       text,                   -- 'Black Caps' / 'Blue Caps'
  description text,                    -- human summary of the countries
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================ group_countries
create table if not exists public.group_countries (
  id           uuid primary key default gen_random_uuid(),
  group_code   text not null references public.product_groups(code) on delete cascade,
  country      text not null,         -- display name, e.g. 'Australia'
  country_code text,                   -- ISO 3166-1 alpha-2, e.g. 'au' (nullable)
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (country)                     -- a country resolves to exactly one group
);

create index if not exists group_countries_group_idx
  on public.group_countries (group_code, sort_order);

-- ============================================================ memberships
create table if not exists public.product_group_memberships (
  product_code text not null references public.products(code) on delete cascade,
  group_code   text not null references public.product_groups(code) on delete cascade,
  primary key (product_code, group_code)
);

create index if not exists pgm_group_idx
  on public.product_group_memberships (group_code, product_code);

-- ============================================================ import issues
create table if not exists public.product_import_issues (
  id          uuid primary key default gen_random_uuid(),
  code        text,                    -- code as given (may be blank/duplicate)
  raw         jsonb not null,          -- all original columns, nothing lost
  issue_type  text not null,           -- duplicate_code | missing_code | missing_field | missing_group | invalid_value
  severity    text not null default 'error',  -- error | warning
  message     text,
  status      text not null default 'open',   -- open | resolved | ignored
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists product_import_issues_status_idx
  on public.product_import_issues (status, severity, issue_type);

-- ============================================================ updated_at triggers
-- Reuse public.set_updated_at() from 0001_jobs.sql.
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_product_groups_updated_at on public.product_groups;
create trigger set_product_groups_updated_at
  before update on public.product_groups
  for each row execute function public.set_updated_at();

drop trigger if exists set_group_countries_updated_at on public.group_countries;
create trigger set_group_countries_updated_at
  before update on public.group_countries
  for each row execute function public.set_updated_at();

drop trigger if exists set_product_import_issues_updated_at on public.product_import_issues;
create trigger set_product_import_issues_updated_at
  before update on public.product_import_issues
  for each row execute function public.set_updated_at();

-- ============================================================ RLS
alter table public.products                  enable row level security;
alter table public.product_groups            enable row level security;
alter table public.group_countries           enable row level security;
alter table public.product_group_memberships enable row level security;
alter table public.product_import_issues     enable row level security;

-- products: public reads active rows
drop policy if exists "public read active products" on public.products;
create policy "public read active products"
on public.products for select to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on products" on public.products;
create policy "authenticated full access on products"
on public.products for all to authenticated
using (true) with check (true);

-- product_groups: public reads active rows
drop policy if exists "public read active product_groups" on public.product_groups;
create policy "public read active product_groups"
on public.product_groups for select to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on product_groups" on public.product_groups;
create policy "authenticated full access on product_groups"
on public.product_groups for all to authenticated
using (true) with check (true);

-- group_countries: public read (needed to resolve country -> group)
drop policy if exists "public read group_countries" on public.group_countries;
create policy "public read group_countries"
on public.group_countries for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on group_countries" on public.group_countries;
create policy "authenticated full access on group_countries"
on public.group_countries for all to authenticated
using (true) with check (true);

-- product_group_memberships: public read (needed to list a group's products)
drop policy if exists "public read product_group_memberships" on public.product_group_memberships;
create policy "public read product_group_memberships"
on public.product_group_memberships for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_group_memberships" on public.product_group_memberships;
create policy "authenticated full access on product_group_memberships"
on public.product_group_memberships for all to authenticated
using (true) with check (true);

-- product_import_issues: authenticated only (no public read)
drop policy if exists "authenticated full access on product_import_issues" on public.product_import_issues;
create policy "authenticated full access on product_import_issues"
on public.product_import_issues for all to authenticated
using (true) with check (true);

-- ============================================================ seed: groups
insert into public.product_groups (code, label, description, sort_order) values
  ('A', 'Black Caps', 'Greece, Lebanon, Egypt, South Africa, Spain', 1),
  ('B', 'Blue Caps',  'Austria, Germany, Italy, Bulgaria, Romania',  2),
  ('C', 'Black Caps', 'Cyprus',                                      3),
  ('D', 'Black Caps', 'Australia',                                   4),
  ('E', 'Black Caps', 'United Kingdom, Ireland',                     5)
on conflict (code) do nothing;

-- ============================================================ seed: group_countries
insert into public.group_countries (group_code, country, country_code, sort_order) values
  ('A', 'Greece',         'gr', 1),
  ('A', 'Lebanon',        'lb', 2),
  ('A', 'Egypt',          'eg', 3),
  ('A', 'South Africa',   'za', 4),
  ('A', 'Spain',          'es', 5),
  ('B', 'Austria',        'at', 1),
  ('B', 'Germany',        'de', 2),
  ('B', 'Italy',          'it', 3),
  ('B', 'Bulgaria',       'bg', 4),
  ('B', 'Romania',        'ro', 5),
  ('C', 'Cyprus',         'cy', 1),
  ('D', 'Australia',      'au', 1),
  ('E', 'United Kingdom', 'gb', 1),
  ('E', 'Ireland',        'ie', 2)
on conflict (country) do nothing;
