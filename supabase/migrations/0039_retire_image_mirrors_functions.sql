-- 0039_retire_image_mirrors_functions.sql — image-mirror retirement, part 1 of 2.
--
-- Part 1 removes every FUNCTION-level dependency on the vestigial
-- products.image_url / product_families.image_url columns, so that part 2
-- (0040, applied only after the matching frontend deploy) can drop the
-- columns without breaking any function at call time:
--
--   1. DROP the legacy set_family_images(uuid,text,text,text[]) overload
--      (0034). It still mirrored the primary into the vestigial columns, and
--      worse: a stale admin deploy calling it rewrites the gallery WITHOUT
--      series tags — silently wiping them (repair: docs/superpowers/plans/
--      2026-07-06-image-backfill.sql part B). The deployed admin has called
--      the jsonb overload (0038) since 2026-07-06; any stale caller now gets
--      a loud "function does not exist" instead of silent data loss.
--
--   2. delete_library_image v2: blocks only on family-gallery references.
--      The mirror columns are unread by the site, so counting them only
--      blocked deletes for no user-visible reason. Response keys 'products' /
--      'family_mirrors' are gone; the deployed deleteBlockedMessage guards
--      every count with `> 0`, so omitted keys render fine until the next
--      deploy removes them from the client type too.
--
--   3. run_product_data_checks v4 (authoritative source, supersedes 0038):
--      broken_image_ref now watches the two real reference sources (family
--      galleries + image library). The vestigial columns are no longer
--      scanned — they are about to be dropped.
--
--   4. search_site v2 (authoritative source, supersedes 0035): the product
--      thumbnail was the LAST reader of products.image_url anywhere (it went
--      stale the moment 0038 stopped mirroring). It now resolves the same
--      series-aware gallery primary the catalog shows, mirroring
--      resolveSeriesImages (src/lib/family-images.ts) for the first image:
--      tagged-for-this-series first, then untagged, then any, by sort_order.
--      Return shape is unchanged — no client change needed.

-- ── 1. legacy RPC ──────────────────────────────────────────────────────────

drop function if exists public.set_family_images(uuid, text, text, text[]);

-- ── 2. delete_library_image v2 ─────────────────────────────────────────────
-- Reference-aware image-library delete: refuses (atomically) while the URL is
-- still in any family gallery, returning usage for the admin UI. The storage
-- object is removed by the client AFTER a successful row delete; an orphaned
-- file on a failed removal is harmless because nothing references it.
-- SECURITY INVOKER (default): RLS applies; execute granted to authenticated.

create or replace function public.delete_library_image(p_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_url     text;
  v_gallery int;
  v_fams    text[];
begin
  select url into v_url from public.product_images where id = p_id;
  if v_url is null then
    return jsonb_build_object('deleted', false, 'reason', 'not_found');
  end if;

  select count(*), coalesce(array_agg(distinct f.code), '{}')
    into v_gallery, v_fams
  from public.product_family_images i
  join public.product_families f on f.id = i.family_id
  where i.url = v_url;

  if v_gallery > 0 then
    return jsonb_build_object(
      'deleted', false, 'reason', 'in_use',
      'gallery_rows', v_gallery, 'families', to_jsonb(v_fams));
  end if;

  delete from public.product_images where id = p_id;
  return jsonb_build_object('deleted', true, 'url', v_url);
end;
$$;

revoke all on function public.delete_library_image(uuid) from public;
grant execute on function public.delete_library_image(uuid) to authenticated;

-- ── 3. checker v4 ──────────────────────────────────────────────────────────
-- Identical to 0038 except broken_image_ref: gallery + library sources only.

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

-- ── 4. search_site v2 ──────────────────────────────────────────────────────
-- Identical to 0035 except the product thumbnail: was p.image_url (stale since
-- 0038 stopped mirroring), now the series-aware family-gallery primary. The
-- correlated subquery runs AFTER the per-branch `limit p_limit`, so it
-- executes for at most p_limit product rows per call.

create or replace function public.search_site(
  p_q     text,
  p_lang  text default 'en',
  p_limit int  default 8
)
returns table (
  kind          text,
  title         text,
  subtitle      text,
  url           text,
  image         text,
  category_slug text,
  sub_category  text,
  family_code   text,
  rank          int
)
language sql
stable
as $$
with params as (
  select
    '%' || e.esc || '%' as pat_any,
    e.esc || '%'        as pat_pre,
    lower(e.q)          as q_lower,
    length(e.q)         as q_len
  from (
    select trim(coalesce(p_q, '')) as q,
           replace(replace(replace(trim(coalesce(p_q, '')), '\', '\\'), '%', '\%'), '_', '\_') as esc
  ) e
),

prod_hits as (
  select
    pc.slug                                                    as cat_slug,
    coalesce(nullif(pc.name_i18n->>p_lang, ''), pc.name)       as cat_name,
    coalesce(p.sub_category, '')                               as sub_cat,
    coalesce(p.family_code, p.code)                            as fam,
    coalesce(nullif(p.name_i18n->>p_lang, ''), p.configuration,
             p.description, p.code)                            as cfg_name,
    greatest(
      case when lower(p.code) = pr.q_lower                                  then 100 else 0 end,
      case when p.code ilike pr.pat_pre                                     then  90 else 0 end,
      case when coalesce(p.configuration, '') ilike pr.pat_any
             or coalesce(p.name_i18n->>p_lang, '') ilike pr.pat_any         then  70 else 0 end,
      case when p.code ilike pr.pat_any                                     then  60 else 0 end,
      case when coalesce(p.sub_category, '') ilike pr.pat_any               then  55 else 0 end,
      case when coalesce(p.description, '') ilike pr.pat_any
             or coalesce(p.description_i18n->>p_lang, '') ilike pr.pat_any  then  50 else 0 end,
      case when coalesce(p.size, '') ilike pr.pat_any                       then  45 else 0 end
    ) as score
  from products p
  join product_categories pc
    on pc.product_category_name = p.category_name and pc.is_active
  cross join params pr
  where pr.q_len >= 2
    and p.is_active
    and not coalesce(p.is_hidden, false)
    and (
      p.code ilike pr.pat_any
      or coalesce(p.configuration, '')             ilike pr.pat_any
      or coalesce(p.sub_category, '')              ilike pr.pat_any
      or coalesce(p.description, '')               ilike pr.pat_any
      or coalesce(p.size, '')                      ilike pr.pat_any
      or coalesce(p.name_i18n->>p_lang, '')        ilike pr.pat_any
      or coalesce(p.description_i18n->>p_lang, '') ilike pr.pat_any
    )
),
prod_cfg as (
  -- Best-scoring size row represents each configuration.
  select distinct on (cat_slug, sub_cat, fam)
    cat_slug, cat_name, sub_cat, fam, cfg_name, score
  from prod_hits
  order by cat_slug, sub_cat, fam, score desc
)

select * from (

  (select 'product'::text, h.cfg_name, h.cat_name, null::text,
          (select i.url
             from product_family_images i
             join product_families f on f.id = i.family_id
            where f.category_slug = h.cat_slug and f.code = h.fam
            order by case when h.sub_cat <> '' and i.series = h.sub_cat then 0
                          when i.series is null then 1
                          else 2 end,
                     i.sort_order
            limit 1),
          h.cat_slug, nullif(h.sub_cat, ''), h.fam, h.score
   from (select * from prod_cfg order by score desc, cfg_name limit p_limit) h
   order by h.score desc, h.cfg_name)

  union all

  (select 'category', coalesce(nullif(c.name_i18n->>p_lang, ''), c.name),
          coalesce(nullif(c.blurb_i18n->>p_lang, ''), c.blurb),
          null, c.image, c.slug, null, null,
          case when c.name ilike pr.pat_pre
                 or coalesce(c.name_i18n->>p_lang, '') ilike pr.pat_pre then 95
               when c.name ilike pr.pat_any
                 or coalesce(c.name_i18n->>p_lang, '') ilike pr.pat_any then 75
               else 45 end
   from product_categories c
   cross join params pr
   where pr.q_len >= 2 and c.is_active
     and (c.name ilike pr.pat_any
          or coalesce(c.name_i18n->>p_lang, '')  ilike pr.pat_any
          or coalesce(c.blurb, '')               ilike pr.pat_any
          or coalesce(c.blurb_i18n->>p_lang, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'subcategory', coalesce(nullif(s.name_i18n->>p_lang, ''), s.name),
          coalesce(nullif(c.name_i18n->>p_lang, ''), c.name),
          null, c.image, c.slug, s.name, null,
          case when s.name ilike pr.pat_pre
                 or coalesce(s.name_i18n->>p_lang, '') ilike pr.pat_pre then 88
               else 68 end
   from product_subcategories s
   join product_categories c on c.slug = s.category_slug and c.is_active
   cross join params pr
   where pr.q_len >= 2 and s.is_active
     and (s.name ilike pr.pat_any
          or coalesce(s.name_i18n->>p_lang, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'post', t.title, t.excerpt, '/insights/blog/' || t.slug || '/', t.cover_image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from posts t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'news', t.title, t.excerpt, '/insights/news/' || t.slug || '/', t.cover_image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from news t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'exhibition', t.title, t.excerpt, '/insights/exhibitions/' || t.slug || '/', t.image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from exhibitions t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any
          or coalesce(t.venue, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'media', t.title, t.excerpt, '/insights/media/' || t.slug || '/', t.poster_image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from media t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'ebook', t.title, t.excerpt, '/insights/ebooks/' || t.slug || '/', t.cover_image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from ebooks t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'certification', t.name, coalesce(t.scope, t.description),
          case when t.cert_group = 'green' then '/green-elysee/certifications/'
               when t.category is not null then '/about-us/quality-certifications/' || t.category || '/'
               else '/about-us/quality-certifications/' end,
          t.logo, null, null, null,
          case when t.name ilike pr.pat_pre then 70
               when t.name ilike pr.pat_any then 55
               else 35 end
   from certifications t cross join params pr
   where pr.q_len >= 2 and t.is_active
     and (t.name ilike pr.pat_any or coalesce(t.description, '') ilike pr.pat_any
          or coalesce(t.scope, '') ilike pr.pat_any or coalesce(t.tag, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'catalogue', t.name, t.description, '/products/catalogues/', null,
          null, null, null,
          case when t.name ilike pr.pat_pre then 60
               when t.name ilike pr.pat_any then 48
               else 32 end
   from catalogues t cross join params pr
   where pr.q_len >= 2 and t.is_active
     and (t.name ilike pr.pat_any or coalesce(t.description, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

  union all

  (select 'job', t.title, concat_ws(' — ', t.department, t.location), '/contact/careers/', null,
          null, null, null,
          case when t.title ilike pr.pat_pre then 65
               when t.title ilike pr.pat_any then 50
               else 35 end
   from jobs t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.title ilike pr.pat_any or coalesce(t.department, '') ilike pr.pat_any
          or coalesce(t.location, '') ilike pr.pat_any or coalesce(t.description, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

) hits (kind, title, subtitle, url, image, category_slug, sub_category, family_code, rank)
order by hits.rank desc, hits.kind, hits.title
$$;

comment on function public.search_site(text, text, int) is
  'Site-wide search across products (per configuration), categories, subcategories and published content. Client builds product/category/subcategory URLs. Product thumbnails come from the family gallery (series-aware primary).';

grant execute on function public.search_site(text, text, int) to anon, authenticated;
