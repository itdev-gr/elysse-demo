-- 0046_search_funded_projects.sql — extend the site-wide search RPC to cover the
-- new public.funded_projects table (Funded Research Projects listing/detail at
-- /innovation/funded-research-projects/). Full CREATE OR REPLACE of the CURRENT
-- live public.search_site (identical to 0043) with one added UNION branch
-- ('funded') mirroring the research/posts/news branches.

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

  (select 'research', t.title, t.excerpt, '/innovation/research-development/' || t.slug || '/', t.cover_image,
          null, null, null,
          case when t.title ilike pr.pat_pre then 75
               when t.title ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from research_posts t cross join params pr
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

  union all

  (select 'funded', t.name, t.excerpt, '/innovation/funded-research-projects/' || t.slug || '/', t.image,
          null, null, null,
          case when t.name ilike pr.pat_pre then 75
               when t.name ilike pr.pat_any then 58
               when coalesce(t.excerpt, '') ilike pr.pat_any then 42
               else 30 end
   from funded_projects t cross join params pr
   where pr.q_len >= 2 and t.is_published
     and (t.name ilike pr.pat_any or coalesce(t.excerpt, '') ilike pr.pat_any
          or coalesce(t.body, '') ilike pr.pat_any)
   order by 9 desc
   limit p_limit)

) hits (kind, title, subtitle, url, image, category_slug, sub_category, family_code, rank)
order by hits.rank desc, hits.kind, hits.title
$$;

comment on function public.search_site(text, text, int) is
  'Site-wide search across products (per configuration), categories, subcategories and published content. Client builds product/category/subcategory URLs.';

grant execute on function public.search_site(text, text, int) to anon, authenticated;
