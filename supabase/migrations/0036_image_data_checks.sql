-- Image data checks: broken storage references, image-less families, mirror drift.
--
-- Root cause of the 2026-07-06 "disappearing images" incident: storage files
-- were deleted (outside the app) while products / product_families /
-- product_family_images still referenced them — and no daily check noticed.
-- This migration adds three checks to run_product_data_checks (daily pg_cron,
-- surfaced in the admin Data Errors tab):
--
--   broken_image_ref     (error)   one issue per referenced product-images URL
--                                  whose storage object no longer exists.
--   family_gallery_empty (warning) ONE summary row: active families with
--                                  active products but no image anywhere.
--   mirror_drift         (warning) family cover (product_families.image_url)
--                                  out of sync with its gallery primary.
--                                  Deliberately family-level only: per-product
--                                  image_url differences are intentional
--                                  (per-configuration images set in ImagesTab).
--
-- NOTE: the checker previously existed ONLY in the live DB. From this
-- migration on, this file is the authoritative source of the full function.
-- The pg_cron job (product-data-checks-daily) calls it by name and is
-- untouched by CREATE OR REPLACE.

-- Percent-decoding for storage object names ('%20' → ' ', UTF-8 aware).
-- Public URLs store encoded paths; storage.objects.name is decoded.
create or replace function public.url_decode(p text)
returns text
language sql immutable strict
as $$
  select convert_from(decode(string_agg(
    coalesce(t.m[1], encode(convert_to(t.m[2], 'UTF8'), 'hex')), '' order by t.ord), 'hex'), 'UTF8')
  from regexp_matches(p, '%([0-9a-fA-F]{2})|(.)', 'g') with ordinality as t(m, ord)
$$;

CREATE OR REPLACE FUNCTION public.run_product_data_checks()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_open integer;
begin
  create temporary table _detected on commit drop as
  select 'missing_group:'||p.code as check_key, p.code as code,
         'missing_group' as issue_type, 'error' as severity,
         'Active product has no group — invisible to every country.' as message,
         jsonb_build_object('category_name', p.category_name) as raw
  from products p
  where p.is_active and not p.is_hidden
    and not exists (select 1 from product_group_memberships m where m.product_code = p.code)
  union all
  select 'missing_field:'||p.code||':category_name', p.code,
         'missing_field','error','Category name is blank — cannot link to a category.','{}'::jsonb
  from products p where coalesce(btrim(p.category_name),'') = ''
  union all
  select 'orphan_category:'||p.code, p.code,
         'orphan_category','error',
         'Category "'||p.category_name||'" matches no category — never shows on any category page.',
         jsonb_build_object('category_name', p.category_name)
  from products p
  where coalesce(btrim(p.category_name),'') <> ''
    and not exists (select 1 from product_categories c where c.product_category_name = p.category_name)
  union all
  select 'invalid_value:'||m.product_code||':grp_'||m.group_code, m.product_code,
         'invalid_value','error','Assigned to group "'||m.group_code||'" which does not exist.',
         jsonb_build_object('group_code', m.group_code)
  from product_group_memberships m
  where not exists (select 1 from product_groups g where g.code = m.group_code)
  union all
  select 'invalid_value:'||p.code||':'||f.field, p.code,
         'invalid_value','error', f.field||' is negative ('||f.val||').',
         jsonb_build_object(f.field, f.val)
  from products p
  cross join lateral (values
    ('packing_bag', p.packing_bag),
    ('packing_box', p.packing_box),
    ('moq', p.moq)
  ) as f(field, val)
  where f.val is not null and f.val < 0
  union all
  select 'duplicate_category_link:'||c.product_category_name, null::text,
         'duplicate_category_link','error',
         'Category link "'||c.product_category_name||'" is used by more than one category.',
         jsonb_build_object('product_category_name', c.product_category_name,
                            'slugs', (select array_agg(c2.slug) from product_categories c2
                                      where c2.product_category_name = c.product_category_name))
  from product_categories c
  where c.product_category_name is not null
  group by c.product_category_name
  having count(*) > 1
  union all
  select 'no_visible_country:'||p.code, p.code,
         'no_visible_country','warning',
         'Belongs to group(s) with no countries — still invisible on the site.','{}'::jsonb
  from products p
  where p.is_active and not p.is_hidden
    and exists (select 1 from product_group_memberships m where m.product_code = p.code)
    and not exists (
      select 1 from product_group_memberships m
      join group_countries gc on gc.group_code = m.group_code
      where m.product_code = p.code and coalesce(btrim(gc.country_code),'') <> '')
  union all
  select 'orphan_series:'||p.code, p.code,
         'orphan_series','warning',
         'Series "'||p.sub_category||'" is not in the managed series for its category.',
         jsonb_build_object('sub_category', p.sub_category)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where coalesce(btrim(p.sub_category),'') <> ''
    and exists (select 1 from product_subcategories s2 where s2.category_slug = c.slug)
    and not exists (select 1 from product_subcategories s
                    where s.category_slug = c.slug and s.name = p.sub_category)
  union all
  select 'orphan_family:'||p.code, p.code,
         'orphan_family','warning',
         'Family code "'||p.family_code||'" is not in the managed families for its category.',
         jsonb_build_object('family_code', p.family_code)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where coalesce(btrim(p.family_code),'') <> ''
    and exists (select 1 from product_families f2 where f2.category_slug = c.slug)
    and not exists (select 1 from product_families f
                    where f.category_slug = c.slug and f.code = p.family_code)
  union all
  select 'letter_mismatch:'||p.code, p.code,
         'letter_mismatch','warning',
         'Letter "'||coalesce(p.category,'∅')||'" does not match category letter "'||coalesce(c.category_letter,'∅')||'".',
         jsonb_build_object('product_letter', p.category, 'category_letter', c.category_letter)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where c.category_letter is not null
    and coalesce(btrim(p.category),'') <> ''
    and upper(btrim(p.category)) <> upper(c.category_letter)
  union all
  select 'missing_field:'||p.code||':'||f.field, p.code,
         'missing_field','warning', f.field||' is blank.','{}'::jsonb
  from products p
  cross join lateral (values
    ('configuration', p.configuration),
    ('description', p.description)
  ) as f(field, val)
  where coalesce(btrim(f.val),'') = ''
  union all
  select 'invalid_value:'||p.code||':inactive_category', p.code,
         'invalid_value','warning','Active product is under an inactive category.',
         jsonb_build_object('category_name', p.category_name)
  from products p
  join product_categories c on c.product_category_name = p.category_name
  where p.is_active and not p.is_hidden and not c.is_active
  union all
  select 'orphan_membership:'||m.product_code||':'||m.group_code, m.product_code,
         'orphan_membership','warning','Group membership references a product that no longer exists.',
         jsonb_build_object('group_code', m.group_code)
  from product_group_memberships m
  where not exists (select 1 from products p where p.code = m.product_code)
  union all
  -- Image references whose storage object no longer exists (one issue per URL;
  -- per-row issues would repeat the same broken file dozens of times).
  select 'img_broken:'||md5(b.url), b.fam_code,
         'broken_image_ref','error',
         'Image file missing from storage: '||b.obj||' — referenced by '
           ||b.n_products||' product(s), '||b.n_mirrors||' family cover(s), '
           ||b.n_gallery||' gallery image(s), '||b.n_library||' library entry(ies). '
           ||'Re-upload the file or clear these references.',
         jsonb_build_object('url', b.url, 'object', b.obj,
                            'products', b.n_products, 'family_mirrors', b.n_mirrors,
                            'gallery_rows', b.n_gallery, 'library_rows', b.n_library)
  from (
    select r.url,
           public.url_decode(split_part(r.url, '/storage/v1/object/public/product-images/', 2)) as obj,
           count(*) filter (where r.src = 'product') as n_products,
           count(*) filter (where r.src = 'mirror') as n_mirrors,
           count(*) filter (where r.src = 'gallery') as n_gallery,
           count(*) filter (where r.src = 'library') as n_library,
           max(r.fam) as fam_code
    from (
      select image_url as url, 'product' as src, family_code as fam
        from products where image_url is not null
      union all
      select image_url, 'mirror', code from product_families where image_url is not null
      union all
      select i.url, 'gallery', f.code
        from product_family_images i join product_families f on f.id = i.family_id
      union all
      select url, 'library', family_code from product_images
    ) r
    where r.url like '%/storage/v1/object/public/product-images/%'
      and not exists (
        select 1 from storage.objects o
        where o.bucket_id = 'product-images'
          and o.name = public.url_decode(split_part(r.url, '/storage/v1/object/public/product-images/', 2)))
    group by r.url
  ) b
  union all
  -- Content gap, ONE summary row (per-family rows would flood the tab).
  select 'img_gallery_empty:summary', null::text,
         'family_gallery_empty','warning',
         s.n||' active families have no image anywhere (first 15: '||s.sample||').',
         jsonb_build_object('count', s.n, 'families', s.all_codes)
  from (
    select count(*) as n,
           string_agg(x.label, ', ' order by x.label) filter (where x.rn <= 15) as sample,
           jsonb_agg(x.label order by x.label) as all_codes
    from (
      select f.category_slug||'/'||f.code as label,
             row_number() over (order by f.category_slug, f.code) as rn
      from product_families f
      where f.is_active
        and exists (
          select 1 from product_categories c
          join products p on p.category_name = c.product_category_name
          where c.slug = f.category_slug and p.family_code = f.code
            and p.is_active and not coalesce(p.is_hidden, false))
        and not exists (select 1 from product_family_images i where i.family_id = f.id)
        and not exists (
          select 1 from product_categories c
          join products p on p.category_name = c.product_category_name
          where c.slug = f.category_slug and p.family_code = f.code
            and p.is_active and not coalesce(p.is_hidden, false)
            and p.image_url is not null)
    ) x
  ) s
  where s.n > 0
  union all
  -- Family cover out of sync with its gallery primary. Family-level ONLY:
  -- per-product image_url differences are intentional per-configuration images.
  select 'img_mirror_drift:'||f.id, f.code,
         'mirror_drift','warning',
         'Family cover image is out of sync with its gallery primary (No.'||f.code||', '||f.category_slug||').',
         jsonb_build_object('family_id', f.id, 'category_slug', f.category_slug,
                            'mirror', f.image_url, 'gallery_primary', g.url)
  from product_families f
  left join lateral (
    select i.url from product_family_images i
    where i.family_id = f.id order by i.sort_order limit 1
  ) g on true
  where f.image_url is distinct from g.url
    and (f.image_url is not null or g.url is not null);

  insert into product_import_issues (check_key, code, raw, issue_type, severity, message, status)
  select d.check_key, d.code, d.raw, d.issue_type, d.severity, d.message, 'open'
  from _detected d
  on conflict (check_key) where status <> 'resolved'
  do update set message = excluded.message, severity = excluded.severity,
                raw = excluded.raw, code = excluded.code, updated_at = now(),
                status = case when product_import_issues.status = 'ignored' then 'ignored' else 'open' end;

  update product_import_issues i
  set status = 'resolved', resolved_at = now(), updated_at = now()
  where i.status = 'open'
    and i.issue_type <> 'duplicate_code'
    and (i.check_key is null or i.check_key not in (select check_key from _detected));

  select count(*) into v_open from product_import_issues where status = 'open';
  update data_check_state set
    last_run_at = now(),
    open_errors = (select count(*) from product_import_issues where status='open' and severity='error'),
    open_warnings = (select count(*) from product_import_issues where status='open' and severity='warning')
  where id = 1;

  return v_open;
end;
$function$;
