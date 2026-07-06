-- One-time backfill for the family-owned image migration (run AFTER 0038).
-- Idempotent: every insert is guarded by NOT EXISTS.
--
-- A) Families with NO gallery rows get seeded from their products' legacy
--    image_url values: single-image families get one untagged row; families
--    whose products use different images per series get one TAGGED row per
--    (series, url) so the site keeps showing exactly what it shows today.
-- B) Families that already HAVE a gallery get tagged rows appended (after the
--    existing rows, so the primary is unchanged) for any series whose products
--    showed a different image than the gallery's untagged primary.
--
-- After A+B, the parity check (bottom) must report 0 mismatches before the
-- read-path flip is deployed.

-- ---------------------------------------------------------------- A: seed
with cat as (
  select slug, product_category_name from product_categories
),
fam_urls as (
  select f.id as family_id, p.sub_category, p.image_url, min(p.sort_order) as ord
  from product_families f
  join cat c on c.slug = f.category_slug
  join products p on p.category_name = c.product_category_name
                 and coalesce(p.family_code, p.code) = f.code
  where p.image_url is not null
    and not exists (select 1 from product_family_images i where i.family_id = f.id)
  group by f.id, p.sub_category, p.image_url
),
cand as (
  select family_id, image_url as url,
         case when multi then sub_category else null end as series,
         min(ord) as ord
  from (
    select fu.*,
           count(distinct fu.image_url) over (partition by fu.family_id) > 1 as multi
    from fam_urls fu
  ) z
  group by family_id, image_url, (case when multi then sub_category else null end)
),
ranked as (
  select *, row_number() over (partition by family_id order by ord, series nulls first, url) as rn
  from cand
)
insert into product_family_images (family_id, url, series, sort_order)
select r.family_id, r.url, r.series, r.rn - 1
from ranked r
where r.rn <= 5
  and not exists (select 1 from product_family_images i where i.family_id = r.family_id);

-- ------------------------------------------------- B: per-series overrides
with cat as (
  select slug, product_category_name from product_categories
),
rep as (
  select f.id as family_id, p.sub_category as series,
         (array_agg(p.image_url order by p.sort_order, p.code)
            filter (where p.image_url is not null))[1] as url
  from product_families f
  join cat c on c.slug = f.category_slug
  join products p on p.category_name = c.product_category_name
                 and coalesce(p.family_code, p.code) = f.code
  where p.is_active and not coalesce(p.is_hidden, false)
    and p.sub_category is not null
  group by f.id, p.sub_category
),
gal as (
  select family_id,
         (array_agg(url order by sort_order) filter (where series is null))[1] as untagged_primary,
         max(sort_order) as max_ord
  from product_family_images
  group by family_id
)
insert into product_family_images (family_id, url, series, sort_order)
select r.family_id, r.url, r.series,
       g.max_ord + row_number() over (partition by r.family_id order by r.series)
from rep r
join gal g on g.family_id = r.family_id
where r.url is not null
  and r.url is distinct from g.untagged_primary
  and not exists (
    select 1 from product_family_images i
    where i.family_id = r.family_id and i.url = r.url
      and i.series is not distinct from r.series);

-- ------------------------------------------------------------ Parity gate
-- current_effective (what the live site shows): products.image_url, else the
--   untagged gallery primary.
-- new_effective (what the flipped code will show): tagged-for-series primary,
--   else untagged primary, else any gallery image (resolver fallback).
-- MUST return mismatches = 0 before deploying the flip.
with cat as (
  select slug, product_category_name from product_categories
),
eff as (
  select p.code, f.id as family_id, p.sub_category,
         p.image_url as cur_url,
         (select i.url from product_family_images i
          where i.family_id = f.id and i.series is null
          order by i.sort_order limit 1) as untagged_primary,
         (select i.url from product_family_images i
          where i.family_id = f.id and i.series = p.sub_category
          order by i.sort_order limit 1) as tagged_primary,
         (select i.url from product_family_images i
          where i.family_id = f.id
          order by i.sort_order limit 1) as any_primary
  from products p
  join cat c on c.product_category_name = p.category_name
  join product_families f on f.category_slug = c.slug
                         and f.code = coalesce(p.family_code, p.code)
  where p.is_active and not coalesce(p.is_hidden, false)
)
select count(*) as checked,
       count(*) filter (
         where coalesce(cur_url, untagged_primary)
           is distinct from coalesce(tagged_primary, untagged_primary, any_primary)
       ) as mismatches
from eff;
