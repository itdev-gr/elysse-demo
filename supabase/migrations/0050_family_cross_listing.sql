-- 0050_family_cross_listing.sql — cross-list a family (catalogue No.) into
-- additional categories.
--
-- A row says: family <family_id> ALSO appears on category <category_slug>'s
-- catalog page. Display-only — products stay under their home category (the
-- category_name link, Excel flow and product URLs are untouched); the page
-- for the extra category appends the family's cards after its native ones.
-- Spec: docs/superpowers/specs/2026-07-22-family-cross-listing-design.md

-- ============================================== product_family_extra_categories
create table if not exists public.product_family_extra_categories (
  family_id     uuid not null references public.product_families(id) on delete cascade,
  category_slug text not null references public.product_categories(slug) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (family_id, category_slug)
);

-- The catalog page looks listings up by the extra category.
create index if not exists pfec_category_idx
  on public.product_family_extra_categories (category_slug);

-- ============================================================ RLS
alter table public.product_family_extra_categories enable row level security;

-- public reads all rows (the live site renders with the anon key), like product_families
drop policy if exists "public read product_family_extra_categories" on public.product_family_extra_categories;
create policy "public read product_family_extra_categories"
on public.product_family_extra_categories for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_family_extra_categories" on public.product_family_extra_categories;
create policy "authenticated full access on product_family_extra_categories"
on public.product_family_extra_categories for all to authenticated
using (true) with check (true);

-- ============================================================ checker v5
-- Identical to 0039's v4 plus two cross-listing checks (self / empty).
-- This file is now the authoritative source for run_product_data_checks.
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
  -- Cross-listing hygiene (0050): a listing into the family's OWN category is
  -- meaningless — the admin UI never offers it, so a row here means bad data.
  select 'cross_listing_self:'||f.category_slug||'/'||f.code, f.code,
         'cross_listing_self','error',
         'Family "'||f.code||'" is cross-listed into its own category "'||f.category_slug||'".',
         jsonb_build_object('category_slug', x.category_slug, 'family_code', f.code)
  from product_family_extra_categories x
  join product_families f on f.id = x.family_id
  where x.category_slug = f.category_slug
  union all
  -- A cross-listing that renders nothing: the family has no active, visible
  -- products in its home category, so the extra placement shows no cards.
  select 'cross_listing_empty:'||f.category_slug||'/'||f.code||':'||x.category_slug, f.code,
         'cross_listing_empty','warning',
         'Family "'||f.code||'" is cross-listed into "'||x.category_slug||'" but has no active products — the placement shows nothing.',
         jsonb_build_object('extra_category_slug', x.category_slug,
                            'home_category_slug', f.category_slug, 'family_code', f.code)
  from product_family_extra_categories x
  join product_families f on f.id = x.family_id
  join product_categories home on home.slug = f.category_slug
  where x.category_slug <> f.category_slug
    and not exists (
      select 1 from products p
      where p.category_name = home.product_category_name
        and p.family_code = f.code
        and p.is_active and not coalesce(p.is_hidden, false))
  union all
  -- Image references whose storage object no longer exists (one issue per
  -- URL). v4: the family gallery and the image library are the only reference
  -- sources — the vestigial mirror columns are gone (0039/0040).
  select 'img_broken:'||md5(b.url), b.fam_code,
         'broken_image_ref','error',
         'Image file missing from storage: '||b.obj||' — referenced by '
           ||b.n_gallery||' gallery image(s), '||b.n_library||' library entry(ies). '
           ||'Re-upload the file or clear these references.',
         jsonb_build_object('url', b.url, 'object', b.obj,
                            'gallery_rows', b.n_gallery, 'library_rows', b.n_library)
  from (
    select r.url,
           public.url_decode(split_part(r.url, '/storage/v1/object/public/product-images/', 2)) as obj,
           count(*) filter (where r.src = 'gallery') as n_gallery,
           count(*) filter (where r.src = 'library') as n_library,
           max(r.fam) as fam_code
    from (
      select i.url, 'gallery' as src, f.code as fam
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
  -- Content gap, ONE summary row: only the gallery counts as "has an image".
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

-- Belt & braces: CREATE OR REPLACE keeps existing ACLs, but re-assert the
-- 0041 hardening so the function can never be callable by anon.
revoke all on function public.run_product_data_checks() from public, anon;
grant execute on function public.run_product_data_checks() to authenticated;
