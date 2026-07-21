-- Admin-managed "top of the country picker": null = normal country; 1..n =
-- pinned position above the separator in the catalog's country popup.
-- Seeded with the previously hardcoded TOP_CODES (CountryModal.astro) so the
-- popup is unchanged at deploy time.
alter table public.group_countries
  add column if not exists featured_order integer;

update public.group_countries gc
set featured_order = v.ord
from (values ('cy', 1), ('at', 2), ('eg', 3), ('lb', 4), ('gr', 5)) as v(code, ord)
where lower(gc.country_code) = v.code;
