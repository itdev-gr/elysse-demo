-- public.product_configurations
--
-- Product-level (configuration) display name + translations, lifted off the
-- individual size rows. A "configuration" is the set of products.* rows that
-- share (category, sub_category, family_code) and is what a single catalog
-- detail page renders. Keyed by (category_slug, config_slug) — the exact pair
-- the URL /catalog/<category_slug>/<config_slug>/ resolves a configuration by.
--
-- English lives in `name` / `description` (optional overrides; blank falls back
-- to the derived configuration name / representative description). Non-English
-- translations are JSONB keyed by language code: el | de | es | fr.
--
-- Before this, translations were stored per size row (products.name_i18n /
-- description_i18n) and aggregated "first non-empty wins". That coupled a
-- configuration's translations to whichever size happened to carry them, so
-- hiding a size could drop translations. This table decouples the two; the
-- per-row columns stay as a fallback for any configuration with no row here.

create table if not exists public.product_configurations (
  category_slug    text not null references public.product_categories(slug) on delete cascade,
  config_slug      text not null,
  name             text,
  description      text,
  name_i18n        jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (category_slug, config_slug)
);

-- ============================================================ updated_at trigger
-- Reuse public.set_updated_at() from 0001_jobs.sql.
drop trigger if exists set_product_configurations_updated_at on public.product_configurations;
create trigger set_product_configurations_updated_at
  before update on public.product_configurations
  for each row execute function public.set_updated_at();

-- ============================================================ RLS
-- public reads all rows (build + live site use the anon key); authenticated
-- (admin) has full access. Mirrors product_families (0023).
alter table public.product_configurations enable row level security;

drop policy if exists "public read product_configurations" on public.product_configurations;
create policy "public read product_configurations"
on public.product_configurations for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_configurations" on public.product_configurations;
create policy "authenticated full access on product_configurations"
on public.product_configurations for all to authenticated
using (true) with check (true);

-- ============================================================ backfill
-- Copy the current per-row translations up to the configuration, replicating
-- the app's first-non-empty-per-language-wins merge (ordered by sort_order).
-- slugify(s)    == btrim(regexp_replace(lower(s), '[^a-z0-9]+', '-', 'g'), '-')
-- config_slug   == btrim(slugify(sub_category) || '-' || slugify(family_code ?? code), '-')
-- Every row is considered (incl. ones about to be hidden) so no translation is
-- lost. Only configurations that actually have a translation get a row.
with rows as (
  select pc.slug as category_slug,
         btrim(
           btrim(regexp_replace(lower(coalesce(p.sub_category, '')), '[^a-z0-9]+', '-', 'g'), '-')
           || '-' ||
           btrim(regexp_replace(lower(coalesce(p.family_code, p.code)), '[^a-z0-9]+', '-', 'g'), '-')
         , '-') as config_slug,
         p.sort_order, p.name_i18n, p.description_i18n
  from public.products p
  join public.product_categories pc on pc.product_category_name = p.category_name
),
name_kv as (
  select distinct on (category_slug, config_slug, kv.key)
         category_slug, config_slug, kv.key, kv.value
  from rows, lateral jsonb_each_text(rows.name_i18n) kv
  where btrim(coalesce(kv.value, '')) <> ''
  order by category_slug, config_slug, kv.key, sort_order
),
desc_kv as (
  select distinct on (category_slug, config_slug, kv.key)
         category_slug, config_slug, kv.key, kv.value
  from rows, lateral jsonb_each_text(rows.description_i18n) kv
  where btrim(coalesce(kv.value, '')) <> ''
  order by category_slug, config_slug, kv.key, sort_order
),
keys as (
  select distinct category_slug, config_slug from rows
),
agg as (
  select k.category_slug, k.config_slug,
    coalesce((select jsonb_object_agg(n.key, n.value) from name_kv n
              where n.category_slug = k.category_slug and n.config_slug = k.config_slug), '{}'::jsonb) as name_i18n,
    coalesce((select jsonb_object_agg(d.key, d.value) from desc_kv d
              where d.category_slug = k.category_slug and d.config_slug = k.config_slug), '{}'::jsonb) as description_i18n
  from keys k
)
insert into public.product_configurations (category_slug, config_slug, name_i18n, description_i18n)
select category_slug, config_slug, name_i18n, description_i18n
from agg
where name_i18n <> '{}'::jsonb or description_i18n <> '{}'::jsonb
on conflict (category_slug, config_slug) do nothing;
