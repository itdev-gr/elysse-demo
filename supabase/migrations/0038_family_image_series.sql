-- Combined family-owned images: series tags + mirror-free save + checker v3.
--
-- End state of the 2026-07-06 image-system redesign: the family gallery
-- (product_family_images) is the ONLY place image links live. A gallery image
-- may carry a `series` tag (a products.sub_category value) meaning "show this
-- image for that series' configurations"; untagged images are general. The
-- site resolves a configuration's images as tagged-for-its-series first, then
-- untagged (src/lib/family-images.ts resolveSeriesImages).
--
-- products.image_url and product_families.image_url become vestigial: no
-- longer read by the site, no longer written by the new save path. They are
-- kept (and still watched by broken_image_ref) until a later retirement
-- migration drops them.

alter table public.product_family_images
  add column if not exists series text;

comment on column public.product_family_images.series is
  'products.sub_category this image is specific to; null = shown for every series.';

-- v2 save: ordered jsonb array of {"url": text, "series": text|null}.
-- No mirroring — the gallery is the single source of truth. The legacy
-- text[] overload (0034) remains for not-yet-deployed admin code and still
-- mirrors; nothing calls it after the next deploy, and it is dropped by the
-- future retirement migration.
create or replace function public.set_family_images(
  p_family_id uuid,
  p_images    jsonb
) returns void
language plpgsql
as $$
begin
  delete from public.product_family_images where family_id = p_family_id;

  if p_images is not null and jsonb_typeof(p_images) = 'array' and jsonb_array_length(p_images) >= 1 then
    insert into public.product_family_images (family_id, url, series, sort_order)
    select p_family_id, t.elem->>'url', nullif(btrim(coalesce(t.elem->>'series', '')), ''), t.ord - 1
    from jsonb_array_elements(p_images) with ordinality as t(elem, ord)
    where coalesce(t.elem->>'url', '') <> '';
  end if;
end;
$$;

revoke all on function public.set_family_images(uuid, jsonb) from public;
grant execute on function public.set_family_images(uuid, jsonb) to authenticated;

-- Checker v3 (supersedes 0036 as the authoritative source of the function):
--   * family_gallery_empty now means "active family with active products and
--     NO gallery rows" — products.image_url no longer counts as having an
--     image, because the site no longer reads it.
--   * mirror_drift is retired: the mirror columns are vestigial, drift is
--     expected and meaningless. (Existing open mirror_drift issues auto-
--     resolve on the next run via the stale-issue sweep.)
--   * broken_image_ref still watches ALL four reference sources (including
--     the vestigial columns) until they are dropped.
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
  -- Image references whose storage object no longer exists (one issue per URL).
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
  -- Content gap, ONE summary row. v3: only the gallery counts as "has an
  -- image" — the site no longer reads products.image_url.
  select 'img_gallery_empty:summary', null::text,
         'family_gallery_empty','warning',
         s.n||' active families have no gallery images (first 15: '||s.sample||').',
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
    ) x
  ) s
  where s.n > 0;

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
