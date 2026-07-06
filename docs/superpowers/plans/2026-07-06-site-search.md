# Site-Wide Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the header search fully functional: visitors can search products, product categories, sub-categories (series), static pages + their content blocks, and all Supabase-managed content (news, blog, exhibitions, media, ebooks, certifications, catalogues, jobs), in English and Greek.

**Architecture:** Three layers. (1) A Postgres RPC `search_site(p_q, p_lang, p_limit)` searches all Supabase tables server-side in one round-trip and returns unified, ranked rows — products are grouped to one row per configuration (the grain of a catalog detail page). (2) A build-time static index of the static pages' text (from `src/data/site-content.ts` and `src/data/content.ts`, with Greek via the `EL` dictionary) is emitted as a prerendered `/search-index.json` and searched client-side. (3) React islands consume both through one client lib `src/lib/search.ts`: a live-dropdown `NavSearch` island in the header, a full `/search` results page, a search form in the mobile drawer, and (bonus) re-activating the dormant in-catalog search input.

**Tech Stack:** Astro 6 + React 19 islands, Supabase (PostgREST RPC, anon key, RLS), Tailwind 4, vitest.

## Global Constraints

- **No `git commit` / `git push` until the user explicitly reviews and approves.** The commit steps below prepare the exact command, but the executor must confirm the commit policy with the user before the first commit (user's standing instruction).
- **Applying the SQL migration to the live Supabase DB requires explicit user consent** each time. The Management API pattern is: `POST https://api.supabase.com/v1/projects/hsamhykaqmiiheneonxz/database/query`, Bearer token from the `SUPABASE_MGMT_TOKEN` env var (ask the user for it; it must NEVER be written into any repo-tracked file — GitHub push protection auto-revokes it), header `User-Agent: curl/8.7.1`. `jq` is broken on this machine — build JSON payloads with Python (`json.dumps`).
- **Never put `data-i18n` / `data-i18n-attr` attributes on React-island DOM nodes** (causes hydration mismatches). Islands self-translate with `tFor(lang, en)` from `src/lib/i18n.ts`, initialising `lang` to `'en'` and reading `localStorage['elysee.lang']` only after mount, plus listening for the `elysee:lang` CustomEvent (copy the pattern in `src/components/nav/MegaNav.tsx:34-66`).
- **Preserve the existing NavSearch visual design** (magnifier + hairline baseline + green underline sweep on focus, `hidden lg:flex`, `currentColor` inheritance). The React island must reproduce the exact markup/classes of the current `src/components/NavSearch.astro`.
- **No hardcoded category lists.** All category/subcategory data flows from `product_categories` / `product_subcategories` at query time.
- Node >= 22.12.0. Run tests with `npm test` (vitest, colocated `src/**/*.test.ts`). Build with `npx astro build`.
- Supabase project ref: `hsamhykaqmiiheneonxz`. Client env vars (already in `.env`): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`.

## Key existing facts (verified 2026-07-06)

- `src/components/NavSearch.astro` is a **decorative demo** — form submit is blocked, nothing is queried. It is mounted at `src/components/Header.astro:20`.
- Live DB row counts: products 3,821 (active, not hidden), categories 13, subcategories 62, families 534, posts 46, news 9, ebooks 2, exhibitions 6, media 3, certifications 44, catalogues 79, jobs 0. → products must be searched **server-side**.
- Product detail URL: `/catalog/<category_slug>/<configSlug(sub_category, family_code)>` where `configSlug` lives in `src/lib/product-configurations.ts:38` (slugify = lowercase → `[^a-z0-9]+` → `-` → trim `-`).
- `products.category_name` joins to `product_categories.product_category_name` to get the URL slug.
- Catalog listing pages already **decode `?q=` and `?materials=` from the URL** (`src/scripts/catalog/page-init.ts:35` + `url-state.ts`), and `page-init.ts:30` already wires an input `[data-catalog-search]` that **no component renders** — adding the input re-activates in-catalog search for free.
- Static page content: `src/data/site-content.ts` (ContentPage/ContentBlock, one export per route) and `src/data/content.ts` (PageContent/Section — services, legal, home). Greek for static text comes from the `EL` dictionary (`src/data/i18n/el/index.ts`), keyed by the English string.
- `certifications.category` values map 1:1 to `/about-us/quality-certifications/<category>/` pages; `cert_group='green'` → `/green-elysee/certifications/`.
- `pg_trgm` is NOT installed. Plain `ilike` + CASE ranking is used — no new extensions needed; at these row counts sequential scans are fine, so no new indexes either.
- Migrations `0001`–`0034` exist; the new one is `0035_search.sql`.
- Existing Greek keys `'Search…': 'Αναζήτηση…'` and `'Site search'` already live in `src/data/i18n/el/shared.ts:11-12`.

---

### Task 1: `search_site` Postgres RPC

**Files:**
- Create: `supabase/migrations/0035_search.sql`

**Interfaces:**
- Consumes: existing tables `products`, `product_categories`, `product_subcategories`, `posts`, `news`, `exhibitions`, `media`, `ebooks`, `certifications`, `catalogues`, `jobs`.
- Produces: RPC `public.search_site(p_q text, p_lang text default 'en', p_limit int default 8)` returning rows `(kind text, title text, subtitle text, url text, image text, category_slug text, sub_category text, family_code text, rank int)`. Callable by `anon` via `supabase.rpc('search_site', { p_q, p_lang, p_limit })`. Kinds emitted: `product`, `category`, `subcategory`, `post`, `news`, `exhibition`, `media`, `ebook`, `certification`, `catalogue`, `job`. For `product`/`category`/`subcategory`, `url` is NULL and the client builds it from `category_slug`/`sub_category`/`family_code` (keeps slug logic in one place — the TS `configSlug`). For all other kinds `url` is complete.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0035_search.sql` with exactly:

```sql
-- 0035_search.sql — site-wide search RPC.
--
-- One round-trip search across products (grouped per configuration =
-- category + series + family, the grain of a catalog detail page),
-- categories, subcategories, and all published content tables.
-- Plain ILIKE + CASE ranking: pg_trgm is not installed and row counts
-- (~4k products) make seq scans cheap, so no extension / index needed.
-- SECURITY INVOKER: RLS still applies; every table searched is already
-- anon-readable (the public site reads them with the anon key).
--
-- For kind='product'/'category'/'subcategory' the url column is NULL and
-- the client builds the URL (configSlug lives in TS; duplicating slugify
-- in SQL risks drift). Other kinds return a complete site-relative url.

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
    p.image_url                                                as img,
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
    cat_slug, cat_name, sub_cat, fam, cfg_name, img, score
  from prod_hits
  order by cat_slug, sub_cat, fam, score desc
)

select * from (

  (select 'product'::text, h.cfg_name, h.cat_name, null::text, h.img,
          h.cat_slug, nullif(h.sub_cat, ''), h.fam, h.score
   from prod_cfg h
   order by h.score desc, h.cfg_name
   limit p_limit)

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
  'Site-wide search across products (per configuration), categories, subcategories and published content. Client builds product/category/subcategory URLs.';

grant execute on function public.search_site(text, text, int) to anon, authenticated;
```

- [ ] **Step 2: Ask the user for consent + token, then apply to the live DB**

Tell the user: "Task 1 needs to create the `search_site` function on the live Supabase DB — OK to apply migration 0035? I need `SUPABASE_MGMT_TOKEN` set in the environment." Then run:

```bash
SUPABASE_MGMT_TOKEN="$SUPABASE_MGMT_TOKEN" python3 - <<'EOF'
import json, os, urllib.request
sql = open('supabase/migrations/0035_search.sql').read()
req = urllib.request.Request(
    "https://api.supabase.com/v1/projects/hsamhykaqmiiheneonxz/database/query",
    data=json.dumps({"query": sql}).encode(),
    headers={"Authorization": f"Bearer {os.environ['SUPABASE_MGMT_TOKEN']}",
             "Content-Type": "application/json", "User-Agent": "curl/8.7.1"},
    method="POST")
print(urllib.request.urlopen(req).read().decode())
EOF
```

Expected: `[]` (DDL returns an empty result set). An error object means the SQL failed — fix and re-apply.

- [ ] **Step 3: Verify the RPC as the anon role via PostgREST**

```bash
set -a; source .env; set +a
curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_q":"epsilon","p_lang":"en","p_limit":5}' | python3 -m json.tool | head -60
```

Expected: JSON array containing `kind":"subcategory"` rows (the Epsilon series) and `kind":"product"` rows with `category_slug":"compression-fittings"`, `sub_category":"έ - Epsilon Series PN 16 bar"`, non-null `family_code`, and NULL `url`. Then verify the other kinds and both languages:

```bash
# exact product code → rank 100 product first
curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"p_q":"902000300"}' | python3 -m json.tool | head -20
# category name → kind":"category" with rank 95, plus Greek title when p_lang=el
curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"p_q":"irrigation","p_lang":"el"}' | python3 -m json.tool | head -40
# a published blog-post word → kind":"post" with url "/insights/blog/<slug>/"
curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"p_q":"pipe"}' | python3 -m json.tool | grep -m5 '"kind"'
# under-2-char query → []
curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"p_q":"a"}'
```

If any kind never appears for a term you can see in the admin dashboard, check that table's RLS allows anon `select` before touching the function.

- [ ] **Step 4: Stage the migration (commit only after user approval — see Global Constraints)**

```bash
git add supabase/migrations/0035_search.sql
git commit -m "feat(search): search_site RPC — unified ranked site search"
```

---

### Task 2: Static pages index + `/search-index.json` endpoint

**Files:**
- Create: `src/lib/search-pages.ts`
- Create: `src/lib/search-pages.test.ts`
- Create: `src/pages/search-index.json.ts`

**Interfaces:**
- Consumes: `ContentBlock`, `ContentPage`, exports from `src/data/site-content.ts`; `Section`, `PageContent`, exports from `src/data/content.ts`; `EL` from `src/data/i18n/el`.
- Produces: `interface PageIndexEntry { path: string; title: string; titleEl?: string; section: string; text: string; textEl?: string }`; `blockText(b: ContentBlock): string[]`; `sectionText(s: Section): string[]`; `buildPagesIndex(): PageIndexEntry[]`; GET `/search-index.json` → `PageIndexEntry[]` (prerendered static JSON).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/search-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { blockText, sectionText, buildPagesIndex } from './search-pages';

describe('blockText', () => {
  it('extracts heading and paragraph text', () => {
    expect(blockText({ kind: 'heading', level: 2, text: 'Who we are' })).toEqual(['Who we are']);
    expect(blockText({ kind: 'paragraph', text: 'Body copy.' })).toEqual(['Body copy.']);
  });
  it('extracts list items and callout title+body', () => {
    expect(blockText({ kind: 'list', items: ['a', 'b'] })).toEqual(['a', 'b']);
    expect(blockText({ kind: 'callout', title: 'T', body: 'B' })).toEqual(['T', 'B']);
  });
  it('extracts pillars intro, titles and bodies', () => {
    expect(blockText({ kind: 'pillars', intro: 'I', items: [{ number: 1, title: 'T', body: 'B' }] }))
      .toEqual(['I', 'T', 'B']);
  });
  it('returns only present copy for image blocks', () => {
    expect(blockText({ kind: 'image', src: '/x.jpg', alt: 'x' })).toEqual(['']);
  });
});

describe('sectionText', () => {
  it('extracts text-section heading and body', () => {
    expect(sectionText({ kind: 'text', heading: 'H', body: 'B' })).toEqual(['', 'H', 'B']);
  });
  it('extracts list-section items', () => {
    expect(sectionText({ kind: 'list', items: ['x'] })).toEqual(['', '', 'x']);
  });
});

describe('buildPagesIndex', () => {
  const index = buildPagesIndex();

  it('indexes the corporate profile page with its body text', () => {
    const e = index.find((x) => x.path === '/about-us/');
    expect(e).toBeDefined();
    expect(e!.title).toBe('Corporate Profile');
    expect(e!.section).toBe('About Us');
    expect(e!.text).toContain('Elysée manufactures and supplies piping');
  });

  it('indexes services pages from the legacy content registry', () => {
    const e = index.find((x) => x.path === '/our-services/agriculture/');
    expect(e).toBeDefined();
    expect(e!.title).toBe('Agriculture');
  });

  it('indexes innovation insight articles and funded projects by slug', () => {
    expect(index.some((x) => x.path.startsWith('/innovation/insights/') && x.path.length > '/innovation/insights/'.length)).toBe(true);
    expect(index.some((x) => x.path.startsWith('/innovation/funded-research-projects/') && x.path.length > '/innovation/funded-research-projects/'.length)).toBe(true);
  });

  it('includes manual entries for listing pages', () => {
    expect(index.some((x) => x.path === '/insights/news/')).toBe(true);
    expect(index.some((x) => x.path === '/products/catalogues/')).toBe(true);
    expect(index.some((x) => x.path === '/about-us/quality-certifications/pe-pipes/')).toBe(true);
  });

  it('uses normalized paths (leading + trailing slash)', () => {
    for (const e of index) expect(e.path).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it('has no duplicate paths and no empty haystacks', () => {
    expect(new Set(index.map((e) => e.path)).size).toBe(index.length);
    for (const e of index) expect(e.text.length).toBeGreaterThan(0);
  });

  it('only sets Greek fields when a translation exists', () => {
    for (const e of index) {
      if (e.titleEl !== undefined) expect(e.titleEl.trim().length).toBeGreaterThan(0);
      if (e.textEl !== undefined) expect(e.textEl.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/search-pages.test.ts`
Expected: FAIL — `Cannot find module './search-pages'` (or equivalent).

- [ ] **Step 3: Implement `src/lib/search-pages.ts`**

```ts
import type { ContentBlock, ContentPage } from '../data/site-content';
import {
  aboutUsCorporateProfile, aboutUsHistory, aboutUsVisionMissionValues,
  aboutUsCompanyStructure, aboutUsQualityCertifications,
  greenElyseeAbout, greenElyseeCertifications, greenElyseeReports,
  innovationWhy, innovationRD, innovationFundedProjects,
  innovationNetworkPartners, innovationInnovateWithUs,
  innovationInsightDetails, fundedProjectDetails,
  subBrandWise, subBrandPrime, subBrandRohrsysteme, contactCareers,
} from '../data/site-content';
import type { Section, PageContent } from '../data/content';
import {
  agriculturePage, landscapePage, buildingInfrastructurePage, industryPage,
  privacyPolicyPage, termsOfUsagePage, termsOfSupplyPage,
} from '../data/content';
import { EL } from '../data/i18n/el';

/**
 * Build-time index of the static pages (routes whose copy lives in the two
 * content registries rather than Supabase). Emitted as /search-index.json by
 * src/pages/search-index.json.ts and searched client-side by src/lib/search.ts.
 * Greek haystacks come from the EL dictionary, which is keyed by the English
 * string — chunks without a translation simply don't contribute to textEl.
 */
export interface PageIndexEntry {
  /** Site-relative route with leading + trailing slash. */
  path: string;
  title: string;
  titleEl?: string;
  /** Parent section shown as the result subtitle (English; tFor'd at render). */
  section: string;
  /** English haystack — newline-joined readable text chunks. */
  text: string;
  /** Greek haystack from EL-translated chunks (absent when none translate). */
  textEl?: string;
}

/** Readable text chunks (EN) on a site-content ContentBlock. */
export function blockText(b: ContentBlock): string[] {
  switch (b.kind) {
    case 'heading': return [b.text];
    case 'paragraph': return [b.text];
    case 'list': return b.items;
    case 'callout': return [b.title ?? '', b.body];
    case 'stats': return b.items.flatMap((i) => [i.label, i.value]);
    case 'timeline': return b.items.flatMap((i) => [i.title ?? '', i.body]);
    case 'pillars': return [b.intro ?? '', ...b.items.flatMap((i) => [i.title, i.body])];
    case 'valuelist': return b.items.flatMap((i) => [i.label, i.body ?? '']);
    case 'image': return [b.caption ?? ''];
    case 'imagegrid': return [b.intro ?? '', ...b.items.flatMap((i) => [i.title, i.body ?? '', ...(i.bullets ?? [])])];
    case 'process-icons': return b.items.map((i) => i.title);
    case 'partners': return b.items.map((i) => i.name);
    case 'projects': return [b.heading ?? '', ...b.items.flatMap((i) => [i.name, i.description ?? ''])];
    case 'idea-form': return [b.intro ?? '', b.confidentialityTitle ?? '', b.confidentialityBody ?? ''];
    default: return [];
  }
}

/** Readable text chunks (EN) on a legacy content.ts Section. */
export function sectionText(s: Section): string[] {
  switch (s.kind) {
    case 'text': return [s.eyebrow ?? '', s.heading ?? '', s.body];
    case 'feature-grid': return [s.heading ?? '', ...s.items.flatMap((i) => [i.title, i.body ?? ''])];
    case 'list': return [s.heading ?? '', s.intro ?? '', ...s.items];
    case 'offices': return [s.heading ?? '', ...s.offices.flatMap((o) => [o.city, o.region ?? ''])];
    case 'news-list': return [s.heading ?? ''];
    default: return [];
  }
}

function entry(path: string, title: string, section: string, chunks: string[]): PageIndexEntry {
  const clean = chunks.map((c) => c.trim()).filter(Boolean);
  const el = clean.map((c) => EL[c]).filter((t): t is string => Boolean(t && t.trim()));
  const titleEl = EL[title];
  return {
    path,
    title,
    ...(titleEl && titleEl.trim() ? { titleEl } : {}),
    section,
    text: clean.join('\n'),
    ...(el.length ? { textEl: el.join('\n') } : {}),
  };
}

const CONTENT_PAGES: { path: string; section: string; page: ContentPage }[] = [
  { path: '/about-us/', section: 'About Us', page: aboutUsCorporateProfile },
  { path: '/about-us/history/', section: 'About Us', page: aboutUsHistory },
  { path: '/about-us/vision-mission-values/', section: 'About Us', page: aboutUsVisionMissionValues },
  { path: '/about-us/company-structure/', section: 'About Us', page: aboutUsCompanyStructure },
  { path: '/about-us/quality-certifications/', section: 'About Us', page: aboutUsQualityCertifications },
  { path: '/green-elysee/', section: 'Green Elysée', page: greenElyseeAbout },
  { path: '/green-elysee/certifications/', section: 'Green Elysée', page: greenElyseeCertifications },
  { path: '/green-elysee/reports/', section: 'Green Elysée', page: greenElyseeReports },
  { path: '/innovation/why-innovation/', section: 'Innovation', page: innovationWhy },
  { path: '/innovation/research-development/', section: 'Innovation', page: innovationRD },
  { path: '/innovation/funded-research-projects/', section: 'Innovation', page: innovationFundedProjects },
  { path: '/innovation/network-partners/', section: 'Innovation', page: innovationNetworkPartners },
  { path: '/innovation/innovate-with-us/', section: 'Innovation', page: innovationInnovateWithUs },
  { path: '/contact/wise/', section: 'Contact', page: subBrandWise },
  { path: '/contact/prime/', section: 'Contact', page: subBrandPrime },
  { path: '/contact/rohrsysteme/', section: 'Contact', page: subBrandRohrsysteme },
  { path: '/contact/careers/', section: 'Contact', page: contactCareers },
];

const LEGACY_PAGES: { section: string; page: PageContent }[] = [
  { section: 'Our Services', page: agriculturePage },
  { section: 'Our Services', page: landscapePage },
  { section: 'Our Services', page: buildingInfrastructurePage },
  { section: 'Our Services', page: industryPage },
  { section: 'Legal', page: privacyPolicyPage },
  { section: 'Legal', page: termsOfUsagePage },
  { section: 'Legal', page: termsOfSupplyPage },
];

/** Listing/dynamic pages with no structured copy — title + keyword haystack. */
const MANUAL_PAGES: { path: string; title: string; section: string; keywords: string }[] = [
  { path: '/', title: 'Home', section: 'Elysée', keywords: 'Elysée piping irrigation systems Cyprus' },
  { path: '/products/', title: 'Products', section: 'Products', keywords: 'product categories catalog browse' },
  { path: '/products/catalogues/', title: 'Catalogues & Leaflets', section: 'Products', keywords: 'download product catalogues leaflets PDF' },
  { path: '/insights/news/', title: 'News', section: 'Insights', keywords: 'company news press announcements' },
  { path: '/insights/blog/', title: 'Blog', section: 'Insights', keywords: 'blog articles engineering piping' },
  { path: '/insights/exhibitions/', title: 'Exhibitions', section: 'Insights', keywords: 'trade fairs exhibitions events' },
  { path: '/insights/media/', title: 'Media', section: 'Insights', keywords: 'videos media gallery' },
  { path: '/insights/ebooks/', title: 'eBooks', section: 'Insights', keywords: 'ebooks guides downloads' },
  { path: '/green-elysee/insights/', title: 'Green Insights', section: 'Green Elysée', keywords: 'sustainability environment insights' },
  { path: '/innovation/insights/', title: 'Innovation Insights', section: 'Innovation', keywords: 'innovation news success stories activities' },
  { path: '/contact/local/', title: 'Local Network', section: 'Contact', keywords: 'contact shops Cyprus Strovolos Limassol Paphos' },
  { path: '/contact/worldwide/', title: 'Worldwide Network', section: 'Contact', keywords: 'export distributors worldwide countries' },
  { path: '/about-us/quality-certifications/compression-fittings/', title: 'Compression Fittings Certificates', section: 'Quality & Certifications', keywords: 'compression fittings quality certificates standards' },
  { path: '/about-us/quality-certifications/pe-pipes/', title: 'PE Pipes Certificates', section: 'Quality & Certifications', keywords: 'polyethylene PE pipes quality certificates standards' },
  { path: '/about-us/quality-certifications/pvc-pipes/', title: 'PVC Pipes Certificates', section: 'Quality & Certifications', keywords: 'PVC pipes quality certificates standards' },
  { path: '/about-us/quality-certifications/management-system/', title: 'Management System Certificates', section: 'Quality & Certifications', keywords: 'ISO management system certificates EMAS ISCC' },
  { path: '/about-us/quality-certifications/general/', title: 'General Certificates', section: 'Quality & Certifications', keywords: 'general quality certificates awards' },
];

export function buildPagesIndex(): PageIndexEntry[] {
  const out: PageIndexEntry[] = [];
  for (const { path, section, page } of CONTENT_PAGES) {
    out.push(entry(path, page.title, section, [
      page.eyebrow ?? '', page.subtitle ?? '', page.metaDescription ?? '',
      ...page.blocks.flatMap(blockText),
    ]));
  }
  for (const { section, page } of LEGACY_PAGES) {
    out.push(entry(page.slug, page.meta.title.split('—')[0].trim(), section, [
      page.meta.description, page.hero?.headline ?? '', page.hero?.sub ?? '',
      ...page.sections.flatMap(sectionText),
    ]));
  }
  for (const a of innovationInsightDetails) {
    out.push(entry(`/innovation/insights/${a.slug}/`, a.title, 'Innovation Insights',
      [a.excerpt, ...a.blocks.flatMap(blockText)]));
  }
  for (const p of fundedProjectDetails) {
    out.push(entry(`/innovation/funded-research-projects/${p.slug}/`, p.name, 'Funded Research Projects',
      [p.excerpt, ...p.blocks.flatMap(blockText)]));
  }
  for (const m of MANUAL_PAGES) out.push(entry(m.path, m.title, m.section, [m.title, m.keywords]));
  return out;
}
```

- [ ] **Step 4: Run tests until they pass**

Run: `npm test -- src/lib/search-pages.test.ts`
Expected: PASS. If a test fails on an import name (e.g. `fundedProjectDetails`), check the actual export in `src/data/site-content.ts` (it is defined at line ~1241) — fix the import, not the test.

- [ ] **Step 5: Create the prerendered JSON endpoint**

Create `src/pages/search-index.json.ts`:

```ts
import { buildPagesIndex } from '../lib/search-pages';

// Static-pages search index, baked at build time. Fetched lazily by the
// search islands so the content registries never enter the client JS bundle.
export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(buildPagesIndex()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
```

- [ ] **Step 6: Verify the endpoint renders**

Run: `npx astro build 2>&1 | tail -5` then `python3 -m json.tool dist/client/search-index.json > /dev/null && grep -c '"path"' dist/client/search-index.json || ls dist`
Expected: build succeeds; the JSON file exists in the build output (under `dist/client/` with the Vercel adapter — if the adapter nests it elsewhere, `find dist -name 'search-index.json'`) and contains ~45 entries. If build output is server-rendered only, confirm `prerender = true` took effect (the file must be static).

- [ ] **Step 7: Stage (commit only after user approval)**

```bash
git add src/lib/search-pages.ts src/lib/search-pages.test.ts src/pages/search-index.json.ts
git commit -m "feat(search): static pages index + prerendered /search-index.json"
```

---

### Task 3: Client search lib (`src/lib/search.ts`)

**Files:**
- Create: `src/lib/search.ts`
- Create: `src/lib/search.test.ts`

**Interfaces:**
- Consumes: `configSlug(subCategory: string | null, familyCode: string): string` from `./product-configurations`; `PageIndexEntry` from `./search-pages`; RPC `search_site` (Task 1) via dynamic `import('./supabase')`; `/search-index.json` (Task 2) via `fetch`.
- Produces (used by Tasks 4 & 5):
  - `type SearchKind = 'category' | 'subcategory' | 'product' | 'page' | 'news' | 'post' | 'exhibition' | 'media' | 'ebook' | 'certification' | 'catalogue' | 'job'`
  - `interface SearchRpcRow { kind: string; title: string; subtitle: string | null; url: string | null; image: string | null; category_slug: string | null; sub_category: string | null; family_code: string | null; rank: number }`
  - `interface SearchResult { kind: SearchKind; title: string; subtitle?: string; url: string; image?: string | null; rank: number }`
  - `KIND_ORDER: SearchKind[]`, `KIND_LABELS: Record<SearchKind, string>` (English labels, translated at render via `tFor`)
  - `resultUrl(r: SearchRpcRow): string`
  - `rpcRowToResult(r: SearchRpcRow): SearchResult | null`
  - `searchStaticPages(index: PageIndexEntry[], q: string, lang: string, limit?: number): SearchResult[]`
  - `groupResults(results: SearchResult[]): { kind: SearchKind; label: string; items: SearchResult[] }[]`
  - `searchSite(q: string, lang: string, perType?: number): Promise<SearchResult[]>`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/search.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  resultUrl, rpcRowToResult, searchStaticPages, groupResults,
  KIND_ORDER, KIND_LABELS, type SearchRpcRow,
} from './search';
import type { PageIndexEntry } from './search-pages';

const row = (over: Partial<SearchRpcRow>): SearchRpcRow => ({
  kind: 'product', title: 'T', subtitle: null, url: null, image: null,
  category_slug: null, sub_category: null, family_code: null, rank: 50, ...over,
});

describe('resultUrl', () => {
  it('builds product config URLs with configSlug parity (incl. Greek series names)', () => {
    expect(resultUrl(row({
      kind: 'product', category_slug: 'compression-fittings',
      sub_category: 'έ - Epsilon Series PN 16 bar', family_code: '330',
    }))).toBe('/catalog/compression-fittings/epsilon-series-pn-16-bar-330');
  });
  it('builds subcategory deep links via the materials filter param', () => {
    expect(resultUrl(row({
      kind: 'subcategory', category_slug: 'compression-fittings',
      sub_category: 'έ - Epsilon Series PN 16 bar',
    }))).toBe(`/catalog/compression-fittings/?materials=${encodeURIComponent('έ - Epsilon Series PN 16 bar')}`);
  });
  it('builds category URLs from the slug', () => {
    expect(resultUrl(row({ kind: 'category', category_slug: 'micro-irrigation' })))
      .toBe('/catalog/micro-irrigation/');
  });
  it('passes through server-built URLs untouched', () => {
    expect(resultUrl(row({ kind: 'post', url: '/insights/blog/foo/' }))).toBe('/insights/blog/foo/');
  });
});

describe('rpcRowToResult', () => {
  it('maps a valid row and nullifies empty subtitles', () => {
    const r = rpcRowToResult(row({ kind: 'category', category_slug: 'x', subtitle: null }));
    expect(r).toEqual({ kind: 'category', title: 'T', url: '/catalog/x/', image: null, rank: 50 });
  });
  it('drops rows with unknown kinds', () => {
    expect(rpcRowToResult(row({ kind: 'bogus' }))).toBeNull();
  });
  it('drops product rows missing URL ingredients', () => {
    expect(rpcRowToResult(row({ kind: 'product', category_slug: null }))).toBeNull();
  });
});

describe('searchStaticPages', () => {
  const index: PageIndexEntry[] = [
    { path: '/about-us/', title: 'Corporate Profile', section: 'About Us', text: 'Who we are\npiping systems' },
    { path: '/about-us/history/', title: 'History', titleEl: 'Ιστορία', section: 'About Us', text: 'From 1968', textEl: 'Από το 1968' },
    { path: '/contact/careers/', title: 'Careers', section: 'Contact', text: 'join the team' },
  ];
  it('matches by title prefix above body text', () => {
    const r = searchStaticPages(index, 'corp', 'en');
    expect(r[0]!.url).toBe('/about-us/');
    expect(r[0]!.rank).toBe(85);
  });
  it('matches body text with a lower rank', () => {
    const r = searchStaticPages(index, 'piping', 'en');
    expect(r).toHaveLength(1);
    expect(r[0]!.rank).toBe(40);
  });
  it('matches Greek queries against titleEl/textEl and localizes the title', () => {
    const r = searchStaticPages(index, 'Ιστορ', 'el');
    expect(r).toHaveLength(1);
    expect(r[0]!.title).toBe('Ιστορία');
  });
  it('still matches English text when lang=el (bilingual users)', () => {
    expect(searchStaticPages(index, 'careers', 'el')).toHaveLength(1);
  });
  it('returns [] under 2 characters and respects the limit', () => {
    expect(searchStaticPages(index, 'a', 'en')).toEqual([]);
    expect(searchStaticPages(index, 'e', 'en')).toEqual([]);
    expect(searchStaticPages(index, 'the', 'en', 1)).toHaveLength(1);
  });
});

describe('groupResults', () => {
  it('groups by kind in KIND_ORDER with labels, preserving item order', () => {
    const mk = (kind: string, title: string, rank: number) =>
      ({ kind: kind as never, title, url: '/x/', rank });
    const groups = groupResults([mk('page', 'P1', 80), mk('product', 'A', 90), mk('page', 'P2', 40), mk('category', 'C', 95)]);
    expect(groups.map((g) => g.kind)).toEqual(['category', 'product', 'page']);
    expect(groups[2]!.items.map((i) => i.title)).toEqual(['P1', 'P2']);
    expect(groups[0]!.label).toBe(KIND_LABELS.category);
  });
  it('KIND_ORDER covers every label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...KIND_ORDER].sort());
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/search.test.ts`
Expected: FAIL — `Cannot find module './search'`.

- [ ] **Step 3: Implement `src/lib/search.ts`**

```ts
import { configSlug } from './product-configurations';
import type { PageIndexEntry } from './search-pages';

/**
 * Client entry point for site-wide search: merges the `search_site` RPC
 * (products + categories + subcategories + Supabase content, ranked in SQL)
 * with the static-pages index (/search-index.json, ranked here). Product /
 * category / subcategory URLs are built client-side so slug logic stays in
 * one place (configSlug).
 */
export type SearchKind =
  | 'category' | 'subcategory' | 'product' | 'page'
  | 'news' | 'post' | 'exhibition' | 'media' | 'ebook'
  | 'certification' | 'catalogue' | 'job';

export interface SearchRpcRow {
  kind: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  image: string | null;
  category_slug: string | null;
  sub_category: string | null;
  family_code: string | null;
  rank: number;
}

export interface SearchResult {
  kind: SearchKind;
  title: string;
  subtitle?: string;
  url: string;
  image?: string | null;
  rank: number;
}

/** Display order of result groups on the /search page. */
export const KIND_ORDER: SearchKind[] = [
  'category', 'subcategory', 'product', 'page',
  'news', 'post', 'exhibition', 'media', 'ebook',
  'certification', 'catalogue', 'job',
];

/** English group labels — render with tFor(lang, label). */
export const KIND_LABELS: Record<SearchKind, string> = {
  category: 'Categories', subcategory: 'Series', product: 'Products', page: 'Pages',
  news: 'News', post: 'Blog', exhibition: 'Exhibitions', media: 'Media', ebook: 'eBooks',
  certification: 'Certifications', catalogue: 'Catalogues', job: 'Careers',
};

const KINDS = new Set<string>(KIND_ORDER);

export function resultUrl(r: SearchRpcRow): string {
  if (r.url) return r.url;
  if (r.kind === 'product' && r.category_slug && r.family_code) {
    return `/catalog/${r.category_slug}/${configSlug(r.sub_category, r.family_code)}`;
  }
  if (r.kind === 'subcategory' && r.category_slug && r.sub_category) {
    return `/catalog/${r.category_slug}/?materials=${encodeURIComponent(r.sub_category)}`;
  }
  if (r.kind === 'category' && r.category_slug) return `/catalog/${r.category_slug}/`;
  return '';
}

export function rpcRowToResult(r: SearchRpcRow): SearchResult | null {
  if (!KINDS.has(r.kind)) return null;
  const url = resultUrl(r);
  if (!url) return null;
  return {
    kind: r.kind as SearchKind,
    title: r.title,
    ...(r.subtitle ? { subtitle: r.subtitle } : {}),
    url,
    image: r.image,
    rank: r.rank,
  };
}

export function searchStaticPages(
  index: PageIndexEntry[], q: string, lang: string, limit = 8,
): SearchResult[] {
  const ql = q.trim().toLowerCase();
  if (ql.length < 2) return [];
  const out: SearchResult[] = [];
  for (const e of index) {
    const titles = [e.title, e.titleEl].filter((t): t is string => Boolean(t)).map((t) => t.toLowerCase());
    const texts = [e.text, e.textEl].filter((t): t is string => Boolean(t)).map((t) => t.toLowerCase());
    const rank = titles.some((t) => t.startsWith(ql)) ? 85
      : titles.some((t) => t.includes(ql)) ? 65
      : texts.some((t) => t.includes(ql)) ? 40
      : 0;
    if (!rank) continue;
    out.push({
      kind: 'page',
      title: lang === 'el' && e.titleEl ? e.titleEl : e.title,
      subtitle: e.section,
      url: e.path,
      rank,
    });
  }
  return out.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title)).slice(0, limit);
}

export function groupResults(
  results: SearchResult[],
): { kind: SearchKind; label: string; items: SearchResult[] }[] {
  return KIND_ORDER
    .map((kind) => ({ kind, label: KIND_LABELS[kind], items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length > 0);
}

// --- live data plumbing (browser only) --------------------------------------

let pagesIndexPromise: Promise<PageIndexEntry[]> | null = null;
function loadPagesIndex(): Promise<PageIndexEntry[]> {
  if (!pagesIndexPromise) {
    pagesIndexPromise = fetch('/search-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`search-index.json ${r.status}`);
        return r.json() as Promise<PageIndexEntry[]>;
      })
      .catch((err) => {
        pagesIndexPromise = null; // allow a retry on the next keystroke
        throw err;
      });
  }
  return pagesIndexPromise;
}

/**
 * Search everything. Resilient: if one source fails the other's results are
 * still returned; only throws when both fail.
 */
export async function searchSite(q: string, lang: string, perType = 8): Promise<SearchResult[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const rpcPromise = import('./supabase').then(({ supabase }) =>
    supabase.rpc('search_site', { p_q: query, p_lang: lang, p_limit: perType }),
  );
  const [rpcOut, staticOut] = await Promise.allSettled([rpcPromise, loadPagesIndex()]);

  const results: SearchResult[] = [];
  let rpcError: unknown = null;
  if (rpcOut.status === 'fulfilled' && !rpcOut.value.error) {
    for (const r of (rpcOut.value.data ?? []) as SearchRpcRow[]) {
      const mapped = rpcRowToResult(r);
      if (mapped) results.push(mapped);
    }
  } else {
    rpcError = rpcOut.status === 'rejected' ? rpcOut.reason : rpcOut.value.error;
  }
  if (staticOut.status === 'fulfilled') {
    results.push(...searchStaticPages(staticOut.value, query, lang, perType));
  } else if (rpcError) {
    throw rpcError; // both sources down
  }
  return results.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title));
}
```

- [ ] **Step 4: Run tests until they pass**

Run: `npm test -- src/lib/search.test.ts`
Expected: PASS. The `resultUrl` parity test proves the client reproduces the exact slug the catalog page expects (`epsilon-series-pn-16-bar-330` for the Greek-lettered series name).

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: all suites PASS (no regressions).

- [ ] **Step 6: Stage (commit only after user approval)**

```bash
git add src/lib/search.ts src/lib/search.test.ts
git commit -m "feat(search): client search lib — RPC + static index merge, URL building"
```

---

### Task 4: Header NavSearch island (desktop live search)

**Files:**
- Create: `src/components/search/NavSearch.tsx`
- Modify: `src/components/NavSearch.astro` (replace demo form with the island mount)
- Modify: `src/data/i18n/el/shared.ts` (add missing Greek keys)

**Interfaces:**
- Consumes: `searchSite`, `KIND_LABELS`, `SearchResult` from `../../lib/search`; `tFor` from `../../lib/i18n`.
- Produces: `<NavSearch />` React island (default export, no props), mounted `client:load` from `NavSearch.astro`. Submits to `/search?q=<query>`.

- [ ] **Step 1: Implement `src/components/search/NavSearch.tsx`**

Reproduces the exact editorial look of the demo form (magnifier, hairline, green underline sweep, `hidden lg:flex`, `currentColor`) and adds a live dropdown. No `data-i18n` attributes — the island self-translates (see Global Constraints).

```tsx
import { useEffect, useRef, useState } from 'react';
import { tFor } from '../../lib/i18n';
import { searchSite, KIND_LABELS, type SearchResult } from '../../lib/search';

/**
 * Header search island. Renders the same editorial field as the old demo
 * NavSearch.astro (hairline baseline + brand-green underline sweep) and wires
 * it live: debounced top results in a dropdown, Enter → /search?q=.
 * Desktop-only (hidden lg:flex) — the mobile drawer has its own form.
 */
export default function NavSearch() {
  const [lang, setLang] = useState('en');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const seq = useRef(0);
  const rootRef = useRef<HTMLFormElement>(null);

  // Language: start as 'en' to match the server HTML, then apply the stored
  // choice and follow the toggle. Same pattern as MegaNav.tsx.
  useEffect(() => {
    try { setLang(localStorage.getItem('elysee.lang') || 'en'); } catch { /* keep en */ }
  }, []);
  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
      if (next) setLang(next);
    };
    document.addEventListener('elysee:lang', onLang);
    return () => document.removeEventListener('elysee:lang', onLang);
  }, []);

  // Debounced live search with a stale-response guard.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchSite(query, lang, 5);
        if (seq.current !== id) return;
        setResults(r.slice(0, 8));
        setFailed(false);
        setOpen(true);
        setActive(-1);
      } catch {
        if (seq.current !== id) return;
        setResults([]);
        setFailed(true);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, lang]);

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const goAll = () => {
    const query = q.trim();
    if (query.length >= 2) window.location.assign(`/search?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }
  };

  return (
    <form
      ref={rootRef}
      role="search"
      aria-label={tFor(lang, 'Site search')}
      className="group relative hidden lg:flex items-center gap-2.5 w-44 xl:w-56 shrink-0"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && results[active]) window.location.assign(results[active].url);
        else goAll();
      }}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 text-current/55 transition-colors duration-200 group-focus-within:text-brand-500"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="search"
        name="q"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="nav-search-listbox"
        aria-autocomplete="list"
        placeholder={tFor(lang, 'Search…')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results.length > 0 || failed) setOpen(true); }}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent py-1.5 text-[12px] leading-none tracking-wide text-current placeholder:text-current/50 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />

      {/* Resting hairline baseline. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-current/25"></span>
      {/* Brand-green underline — sweeps in from the left on focus. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-out-quint group-focus-within:scale-x-100"
      ></span>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-md border border-surface-divider bg-surface text-ink shadow-lg z-50">
          {failed ? (
            <p className="px-4 py-3 text-[12px] text-ink/65">
              {tFor(lang, 'Search is temporarily unavailable. Please try again.')}
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-[12px] text-ink/65">
              {tFor(lang, 'No results for')} “{q.trim()}”
            </p>
          ) : (
            <ul id="nav-search-listbox" role="listbox" className="max-h-96 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.url}-${i}`} role="option" aria-selected={i === active}>
                  <a
                    href={r.url}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors duration-150 ${i === active ? 'bg-surface-alt' : ''} hover:bg-surface-alt`}
                  >
                    {r.image ? (
                      <img src={r.image} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded-sm object-cover bg-ink/5" />
                    ) : (
                      <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-sm bg-ink/5" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-[11px] text-ink/60">{r.subtitle}</span>}
                    </span>
                    <span className="shrink-0 text-[9px] uppercase tracking-wider text-ink/45">
                      {tFor(lang, KIND_LABELS[r.kind])}
                    </span>
                  </a>
                </li>
              ))}
              <li className="border-t border-surface-divider">
                <button
                  type="button"
                  onClick={goAll}
                  className="w-full px-3 py-2 text-left text-[12px] font-medium text-brand-500 hover:bg-surface-alt transition-colors duration-150 cursor-pointer"
                >
                  {tFor(lang, 'View all results')} →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Replace the demo form in `NavSearch.astro`**

Replace the ENTIRE contents of `src/components/NavSearch.astro` with:

```astro
---
// Header search — real site-wide search. The island reproduces the original
// editorial field design (hairline + green underline) and adds live results;
// see src/components/search/NavSearch.tsx. Keeping this .astro wrapper means
// Header.astro's import stays unchanged.
import NavSearchIsland from './search/NavSearch.tsx';
---
<NavSearchIsland client:load />
```

- [ ] **Step 3: Add the missing Greek strings**

For each key below, first check it doesn't already exist: `grep -rn "'<key>'" src/data/i18n/el/`. Add only the missing ones to the exported record in `src/data/i18n/el/shared.ts` (`'Search…'` and `'Site search'` already exist — skip those):

```ts
  'View all results': 'Όλα τα αποτελέσματα',
  'No results for': 'Κανένα αποτέλεσμα για',
  'Search is temporarily unavailable. Please try again.': 'Η αναζήτηση δεν είναι διαθέσιμη αυτή τη στιγμή. Δοκιμάστε ξανά.',
  'Categories': 'Κατηγορίες',
  'Series': 'Σειρές',
  'Products': 'Προϊόντα',
  'Pages': 'Σελίδες',
  'News': 'Νέα',
  'Blog': 'Ιστολόγιο',
  'Exhibitions': 'Εκθέσεις',
  'Media': 'Πολυμέσα',
  'eBooks': 'eBooks',
  'Certifications': 'Πιστοποιήσεις',
  'Catalogues': 'Κατάλογοι',
  'Careers': 'Καριέρα',
```

(Several nav labels like `'News'`, `'Blog'`, `'Careers'` very likely exist in other dictionary files — the grep decides; a duplicate key across files would silently override, so never add one that greps positive.)

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, open `http://localhost:4321/`.
Expected:
- The header field looks identical to before (hairline, green sweep on focus).
- Typing `epsilon` shows a dropdown within ~1s with series/product rows; ↓/↑ + Enter navigates to a `/catalog/compression-fittings/epsilon-…` page that renders (not 404) — this proves client/SQL slug parity end-to-end.
- Typing an exact product code (e.g. `902000300`) puts that product first.
- Enter with nothing highlighted goes to `/search?q=epsilon` (404 until Task 5 — fine).
- Switch language to GR: placeholder becomes `Αναζήτηση…`, kind chips become Greek, and searching `Ιστορία` (or another EL-dictionary word) returns the History page result via the static index.
- No hydration warnings in the browser console.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npx astro build 2>&1 | tail -3`
Expected: tests PASS, build succeeds.

- [ ] **Step 6: Stage (commit only after user approval)**

```bash
git add src/components/search/NavSearch.tsx src/components/NavSearch.astro src/data/i18n/el/shared.ts
git commit -m "feat(search): live header search island with results dropdown"
```

---

### Task 5: `/search` results page

**Files:**
- Create: `src/pages/search/index.astro`
- Create: `src/components/search/SearchResults.tsx`
- Modify: `src/data/i18n/el/shared.ts` (a few more keys)

**Interfaces:**
- Consumes: `searchSite`, `groupResults`, `SearchResult`, `SearchKind` from `../../lib/search`; `tFor` from `../../lib/i18n`; `BaseLayout` (props: `title`, `description`, `padForHeader`).
- Produces: route `/search?q=<query>` rendering grouped, localized results.

- [ ] **Step 1: Create the page shell**

Create `src/pages/search/index.astro`:

```astro
---
/**
 * Site search results. Static shell + a client island that reads ?q=,
 * queries the search_site RPC + static pages index, and renders grouped
 * results. Client-rendered so results are always live (and to keep DB
 * content out of SSR, matching the insights pages' pattern).
 */
import BaseLayout from '../../layouts/BaseLayout.astro';
import SearchResults from '../../components/search/SearchResults.tsx';
export const prerender = true;
---
<BaseLayout
  title="Search — Elysée"
  description="Search Elysée products, categories, pages, news and insights."
  padForHeader={false}
>
  <section class="pt-28 md:pt-32 pb-16 md:pb-24 px-4 md:px-8">
    <div class="max-w-screen-lg mx-auto min-h-[60vh]">
      <SearchResults client:load />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Implement `src/components/search/SearchResults.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { tFor } from '../../lib/i18n';
import { searchSite, groupResults, type SearchKind, type SearchResult } from '../../lib/search';

type Group = { kind: SearchKind; label: string; items: SearchResult[] };

/**
 * /search page island. Reads ?q= on mount, live-searches as the visitor
 * refines the query (debounced), keeps the URL shareable via replaceState,
 * and renders results grouped by kind. Self-translates via tFor — no
 * data-i18n on island DOM.
 */
export default function SearchResults() {
  const [lang, setLang] = useState('en');
  const [q, setQ] = useState('');
  const [entered, setEntered] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setLang(localStorage.getItem('elysee.lang') || 'en'); } catch { /* keep en */ }
    setQ(new URLSearchParams(window.location.search).get('q') ?? '');
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
      if (next) setLang(next);
    };
    document.addEventListener('elysee:lang', onLang);
    return () => document.removeEventListener('elysee:lang', onLang);
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setGroups([]); setEntered(''); setState('idle'); return; }
    setState('loading');
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const results = await searchSite(query, lang, 25);
        if (seq.current !== id) return;
        setGroups(groupResults(results));
        setEntered(query);
        setState('done');
        const url = new URL(window.location.href);
        url.searchParams.set('q', query);
        history.replaceState({}, '', url);
      } catch {
        if (seq.current === id) setState('error');
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, lang]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-heavy text-ink">{tFor(lang, 'Search')}</h1>

      <form role="search" aria-label={tFor(lang, 'Site search')} className="mt-6 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="group relative flex items-center gap-3">
          <svg className="h-4 w-4 shrink-0 text-ink/50 group-focus-within:text-brand-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            placeholder={tFor(lang, 'Search products, pages, insights…')}
            className="w-full bg-transparent py-2 text-base text-ink placeholder:text-ink/45 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-ink/25"></span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-out-quint group-focus-within:scale-x-100"></span>
        </div>
      </form>

      <div className="mt-8" aria-live="polite">
        {state === 'idle' && (
          <p className="text-ink/60">{tFor(lang, 'Type at least 2 characters to search.')}</p>
        )}
        {state === 'loading' && <p className="text-ink/60">{tFor(lang, 'Searching…')}</p>}
        {state === 'error' && (
          <p className="text-ink/70">{tFor(lang, 'Search is temporarily unavailable. Please try again.')}</p>
        )}
        {state === 'done' && total === 0 && (
          <p className="text-ink/70">{tFor(lang, 'No results for')} “{entered}”</p>
        )}
        {state === 'done' && total > 0 && (
          <>
            <p className="text-sm text-ink/60">
              {total} — {tFor(lang, 'Results for')} “{entered}”
            </p>
            <div className="mt-6 space-y-10">
              {groups.map((g) => (
                <section key={g.kind}>
                  <h2 className="text-xs uppercase tracking-widest font-semibold text-ink/50 border-b border-ink/10 pb-2">
                    {tFor(lang, g.label)} <span className="text-ink/35">({g.items.length})</span>
                  </h2>
                  <ul className="mt-3 divide-y divide-ink/5">
                    {g.items.map((r, i) => (
                      <li key={`${r.url}-${i}`}>
                        <a href={r.url} className="group flex items-center gap-4 py-3">
                          {r.image ? (
                            <img src={r.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-sm object-cover bg-ink/5" />
                          ) : (
                            <span aria-hidden="true" className="h-14 w-14 shrink-0 rounded-sm bg-ink/5" />
                          )}
                          <span className="min-w-0">
                            <span className="block text-[15px] font-medium text-ink group-hover:text-brand-500 transition-colors duration-150">
                              {r.title}
                            </span>
                            {r.subtitle && (
                              <span className="block text-[13px] text-ink/60 line-clamp-1">{r.subtitle}</span>
                            )}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add the remaining Greek strings**

Same grep-first procedure as Task 4 Step 3, into `src/data/i18n/el/shared.ts`:

```ts
  'Search': 'Αναζήτηση',
  'Results for': 'Αποτελέσματα για',
  'Searching…': 'Γίνεται αναζήτηση…',
  'Type at least 2 characters to search.': 'Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες για αναζήτηση.',
  'Search products, pages, insights…': 'Αναζήτηση σε προϊόντα, σελίδες, άρθρα…',
```

- [ ] **Step 4: Verify in the browser**

With `npm run dev`:
- `http://localhost:4321/search?q=epsilon` → grouped results: Series, Products (with images), each linking correctly; product links open working catalog detail pages.
- `?q=irrigation` → Categories group + Pages group (e.g. services pages) + products.
- `?q=zzzznope` → "No results for “zzzznope”".
- Editing the input re-searches and updates the URL (`?q=` follows along; reload reproduces the same results).
- `/search` with no `q` → the "type at least 2 characters" prompt.
- Toggle GR: headings, group labels, prompts switch to Greek; searching a Greek word (e.g. `Ιστορία` or a Greek series name like `έψιλον`… use `Σειρά` if unsure) returns localized titles.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npx astro build 2>&1 | tail -3`
Expected: PASS / build succeeds.

- [ ] **Step 6: Stage (commit only after user approval)**

```bash
git add src/pages/search/index.astro src/components/search/SearchResults.tsx src/data/i18n/el/shared.ts
git commit -m "feat(search): /search results page with grouped, localized results"
```

---

### Task 6: Mobile drawer search + re-activate in-catalog search input

**Files:**
- Modify: `src/components/nav/MobileMegaNav.tsx` (insert a search form between the drawer header and the nav, i.e. between the closing `</div>` of the sticky header block at line ~161 and `<nav aria-label={tFor(lang, 'Mobile primary')} …>` at line ~163)
- Modify: `src/components/catalog/UtilityBar.astro` (render the `[data-catalog-search]` input the filter engine already listens for)
- Modify: `src/scripts/catalog/page-init.ts` (seed the input's value from the URL-decoded filters)
- Modify: `src/data/i18n/el/shared.ts` (one key)

**Interfaces:**
- Consumes: `tFor` (already imported in MobileMegaNav), the dormant wiring in `src/scripts/catalog/page-init.ts:30` + `128-135` (`[data-catalog-search]` → 200ms-debounced `filters.search` → re-render + URL sync), `i18nAttrFor` from `src/lib/i18n` (UtilityBar is Astro-rendered, so `data-i18n-attr` is correct there).
- Produces: mobile search entry navigating to `/search?q=…`; a working search box on `/catalog/<category>/` pages that filters the grid and round-trips through `?q=`.

- [ ] **Step 1: Add the search form to the mobile drawer**

In `src/components/nav/MobileMegaNav.tsx`, directly after the sticky drawer header `</div>` (the block containing the `Menu` label and close button) and before `<nav aria-label={tFor(lang, 'Mobile primary')} className="px-2 py-2">`, insert:

```tsx
              <form
                role="search"
                aria-label={tFor(lang, 'Site search')}
                className="px-6 py-4 border-b border-ink/10"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector('input');
                  const query = input?.value.trim() ?? '';
                  if (query.length >= 2) window.location.assign(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                <div className="flex items-center gap-2 border-b border-ink/20 focus-within:border-brand-500 transition-colors duration-200">
                  <svg className="h-4 w-4 shrink-0 text-ink/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="search"
                    name="q"
                    autoComplete="off"
                    placeholder={tFor(lang, 'Search…')}
                    className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-ink/50 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                  />
                </div>
              </form>
```

- [ ] **Step 2: Render the in-catalog search input**

In `src/components/catalog/UtilityBar.astro`: add `import { i18nAttrFor } from '../../lib/i18n';` to the frontmatter, then inside `<div class="flex items-center gap-3">` (before the view-mode group) insert:

```astro
      <label class="relative hidden sm:flex items-center">
        <svg class="pointer-events-none absolute left-2 h-3 w-3 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          data-catalog-search
          placeholder="Search in category…"
          data-i18n-attr={i18nAttrFor({ placeholder: 'Search in category…' })}
          class="w-40 md:w-52 border border-ink/10 rounded-sm bg-transparent pl-7 pr-2 py-1 font-mono text-[11px] text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500 [&::-webkit-search-cancel-button]:appearance-none"
        />
      </label>
```

Add to `src/data/i18n/el/shared.ts` (grep first, as before): `'Search in category…': 'Αναζήτηση στην κατηγορία…',`

- [ ] **Step 3: Seed the input from URL state**

In `src/scripts/catalog/page-init.ts`, find where `searchInput` is captured (`const searchInput = root.querySelector<HTMLInputElement>('[data-catalog-search]');`, line ~30) and where `filters` is initialised from the URL (`let filters: Filters = { ...decodeFilters(window.location.search.slice(1)) };`, line ~35). After BOTH lines have run, add:

```ts
  if (searchInput && filters.search) searchInput.value = filters.search;
```

(Read the surrounding code first — if it already seeds the value, skip this step.)

- [ ] **Step 4: Verify in the browser**

With `npm run dev`:
- Mobile viewport (≤ lg): open the drawer → search field at the top; submitting `epsilon` lands on `/search?q=epsilon`.
- `/catalog/compression-fittings/` (pick a country when the modal asks): typing in the new toolbar input filters the grid live and writes `?q=` into the URL; the "Showing X of Y products" count updates.
- Deep link `/catalog/compression-fittings/?q=adaptor` → grid arrives pre-filtered AND the input shows `adaptor`.
- A `subcategory` search result from `/search` (e.g. the Epsilon series) lands on `/catalog/…/?materials=…` with the series filter applied.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npx astro build 2>&1 | tail -3`
Expected: PASS / build succeeds.

- [ ] **Step 6: Stage (commit only after user approval)**

```bash
git add src/components/nav/MobileMegaNav.tsx src/components/catalog/UtilityBar.astro src/scripts/catalog/page-init.ts src/data/i18n/el/shared.ts
git commit -m "feat(search): mobile drawer search + re-activate in-catalog search input"
```

---

### Task 7: End-to-end verification pass

**Files:** none (verification only).

- [ ] **Step 1: Full automated pass**

Run: `npm test && npx astro build 2>&1 | tail -3`
Expected: every vitest suite PASS; build completes with no errors.

- [ ] **Step 2: RPC spot-checks per kind (as anon)**

Re-run the Task 1 Step 3 curls plus one term per remaining kind, picking real titles first, e.g.:

```bash
set -a; source .env; set +a
for q in "epsilon" "irrigation" "sprinkler" "ISO" "catalogue"; do
  echo "== $q"; curl -s "$PUBLIC_SUPABASE_URL/rest/v1/rpc/search_site" \
    -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $PUBLIC_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" -d "{\"p_q\":\"$q\"}" | python3 -c 'import json,sys; [print(r["kind"], "|", r["title"][:50]) for r in json.load(sys.stdin)[:8]]'
done
```

Expected: kinds `product`, `category`, `subcategory`, `certification`, `catalogue` all appear across the runs; every printed title is sensible.

- [ ] **Step 3: Browser walkthrough (use the `verify` skill if executing with it available)**

On `npm run dev`:
1. Header search `epsilon` → dropdown → Enter on a product row → working catalog detail page.
2. Header search Enter (nothing highlighted) → `/search?q=…` grouped page; click one result per group; none 404.
3. Greek toggle ON: repeat 1-2; labels and placeholders in Greek; `Ιστορία` finds the History page.
4. Mobile drawer search → `/search`.
5. `/catalog/<cat>/` toolbar search filters live; `?q=` deep link pre-filters.
6. Console clean: no hydration warnings, no failed network calls (other than expected empty-result queries).

- [ ] **Step 4: Report**

Summarize to the user: what was verified, any RLS/data anomalies found (e.g. kinds whose tables returned nothing), and remind that all commits above were prepared/staged per their review policy.

---

## Self-Review (done at planning time)

- **Spec coverage:** products ✓ (Task 1 RPC + Task 3 URL building), categories ✓, sub-categories ✓ (own kind + `?materials=` deep links), pages ✓ (Task 2 static index), blocks ✓ (blockText/sectionText feed every block kind's copy into the haystack), "everything" ✓ (news/blog/exhibitions/media/ebooks/certifications/catalogues/jobs arms), bilingual ✓, mobile ✓, in-catalog search ✓.
- **Type consistency:** `SearchRpcRow` fields = SQL output columns (kind, title, subtitle, url, image, category_slug, sub_category, family_code, rank); `configSlug(subCategory, familyCode)` matches `src/lib/product-configurations.ts:38`; `PageIndexEntry` produced by Task 2 = consumed by Task 3; `searchSite(q, lang, perType)` consumed by Tasks 4-5; `groupResults` → `{kind,label,items}` consumed by Task 5.
- **Known risks called out:** RLS visibility per table is verified as anon in Task 1 Step 3 / Task 7 Step 2; slug parity is pinned by a unit test (Task 3) and an end-to-end click-through (Task 4 Step 4); prerender location of `search-index.json` is checked in Task 2 Step 6.
