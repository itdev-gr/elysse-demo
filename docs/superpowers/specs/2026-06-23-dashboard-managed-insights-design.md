# Dashboard-managed Insights: Exhibitions, Media & eBooks

**Date:** 2026-06-23
**Status:** Design — awaiting review

## Summary

Three Insights sub-pages — **Exhibitions**, **Media**, and **eBooks** — are
currently hardcoded as static arrays in `src/data/site-content.ts` and can only
be changed by editing code and redeploying. This brings them in line with the
already-dashboard-managed **News** and **Blog (Posts)** sections: each becomes a
Supabase table with full CRUD in the admin dashboard, and the public pages read
live from the database so changes go live with no rebuild.

The existing 11 items (6 exhibitions, 3 media, 2 eBooks) are migrated into the
tables so the site looks identical on day one.

## Goals

- Editors can create, edit, publish/unpublish, and delete Exhibitions, Media,
  and eBooks from the admin dashboard.
- Each type keeps its **rich, type-specific detail page**: Media = inline
  YouTube player, eBooks = cover + PDF download (or "Request a copy"),
  Exhibitions = date / venue / stand.
- Public list + detail pages reflect dashboard changes immediately (no rebuild).
- No visitor-facing change on day one (existing content migrated faithfully).

## Non-goals

- No change to News, Blog, Jobs, or any other section.
- No PDF/file upload for eBooks — `download_url` is a pasted external link
  (matches current data, e.g. `https://elysee.com.cy/pdf/.../download`).
- No rich block editor — bodies become Markdown (today's `blocks` are, in
  practice, single paragraphs), edited with the existing `MarkdownEditor`.
- No reuse of the product Image Library (`ImageLibraryGrid`) — it is
  product-code specific. We follow the News per-bucket upload pattern instead.

## Chosen approach

**Three separate tables** (`exhibitions`, `media`, `ebooks`), each with its own
type-safe columns, type, lib, admin tab/form, and page wiring. This mirrors the
established `jobs` / `news` / `posts` convention exactly (each is its own table).

Rejected alternatives:
- *One polymorphic `insights` table with a JSONB `meta`* — discards column
  constraints and type-safety, forces heavy form branching, breaks the
  one-table-per-section convention.
- *Shared base table + per-type detail tables* — joins and over-engineering for
  11 rows across 3 types. YAGNI.

## Data model

Each table shares the News-style spine and adds type-specific columns. RLS on
all three: **public (anon + authenticated) read where `is_published = true`**;
**authenticated full access**. All three reuse the existing
`public.set_updated_at()` trigger function (created in `0001_jobs.sql`).

**Common columns**

| column | type | notes |
|---|---|---|
| `id` | uuid pk | `default gen_random_uuid()` |
| `slug` | text | `not null unique`, check `slug ~ '^[a-z0-9-]+$'` |
| `title` | text | `not null` |
| `excerpt` | text | `not null` — card + meta description |
| `body` | text | `not null default ''` — Markdown (replaces `blocks`) |
| `is_published` | boolean | `not null default true` |
| `created_at` | timestamptz | `not null default now()` — list order key |
| `updated_at` | timestamptz | `not null default now()` (trigger) |

**`exhibitions`** extra columns

| column | type | notes |
|---|---|---|
| `event_date` | text not null | full human date, e.g. `"10–14 November 2026"` (detail) |
| `card_date` | text | short label, e.g. `"Nov 2026"` (list card); falls back to `event_date` |
| `venue` | text | |
| `stand` | text | e.g. `"Hall 21, Stand B28"` |
| `image` | text | nullable — most have none |
| `image_alt` | text | |

**`media`** extra columns

| column | type | notes |
|---|---|---|
| `video_url` | text not null | YouTube embed URL `https://www.youtube.com/embed/<id>` |
| `poster_image` | text | serves both card image and detail poster |
| `image_alt` | text | |

**`ebooks`** extra columns

| column | type | notes |
|---|---|---|
| `year` | text | |
| `cover_image` | text | serves both card image and detail cover |
| `image_alt` | text | |
| `download_url` | text | external PDF link; null → "Request a copy" CTA |

List ordering: `is_published = true` rows by `created_at desc`. Seeds stagger
`created_at` (as `0015_news.sql` does with `now() - interval 'N days'`) so the
migrated items keep their current on-page order. Indexes:
`(is_published, created_at desc)` per table.

## Storage

One shared **public** bucket `insights` with type-prefixed object paths
(`exhibitions/…`, `media/…`, `ebooks/…`). Policy set mirrors `news-covers`:
public read; authenticated insert/update/delete. Per-lib upload helper modeled
on `uploadNewsCover` (path `<type>/<rowId>/<uuid>.<ext>`, returns public URL).
Accepts JPEG/PNG/WebP, ≤ 4 MB (same validation as `NewsForm`).

## Types & libs

- `src/types/exhibition.ts`, `media.ts`, `ebook.ts` — row interface + `*Draft`
  (`Omit<Row, 'id' | 'created_at' | 'updated_at'>`), mirroring `src/types/job.ts`.
- `src/lib/exhibitions.ts`, `media.ts`, `ebooks.ts` — each exporting:
  - `list<Type>()` — published rows, `created_at desc`.
  - `get<Type>BySlug(slug)` — single published row or null.
  - `upload<Type>Image(file, rowId)` — storage helper.
  - re-export `slugify` from `./posts` (single source of truth).
  - Markdown→HTML via the existing `renderPostBody` from `./posts`.

## Admin dashboard

- Tabs: `ExhibitionsTab.tsx`, `MediaTab.tsx`, `EbooksTab.tsx` — list with
  **+ New**, row edit, publish/unpublish toggle, delete; modeled on `NewsTab`.
- Forms: `ExhibitionForm.tsx`, `MediaForm.tsx`, `EbookForm.tsx` — type-specific
  fields, slug auto-generated from title (editable), image upload with preview,
  `MarkdownEditor` for `body`; modeled on `NewsForm` / `JobForm`.
- `Dashboard.tsx`: rename the **"Blog & News"** group to **"Insights"** and add
  `exhibitions`, `media`, `ebooks` alongside `posts` and `news`. Adds entries to
  the `Tab` union, `HEADINGS`, `GROUPS`, the imports, and the render switch.

## Public pages (read from DB)

These three index pages currently use the simple `ListPageLayout` (PageHero +
card grid) — **not** the cinematic client-island chassis News uses. To preserve
that exact look with the fewest new parts, we fetch **server-side** in a
`prerender = false` page rather than adding client islands.

> **Refinement vs. the brainstormed design:** I originally proposed client
> islands (mirroring News). On reflection, server-side fetch in a
> `prerender = false` page preserves the current `ListPageLayout` appearance
> exactly, needs no new list components, and is the codebase's documented
> pattern for data-driven routes (`astro.config.mjs`). News only uses an island
> for its featured-first interactivity, which these grids don't have.

- `insights/<type>/index.astro`: `export const prerender = false`;
  `Cache-Control: public, s-maxage=60, stale-while-revalidate=86400`. Fetch
  published rows via the lib, map to `ListPageLayout`'s `ListItem`
  (`title`, `date`=`card_date ?? event_date` for exhibitions, `excerpt`,
  `href`=`/insights/<type>/<slug>/`, `image`). On fetch error, fall back to the
  retained static card array so the page never breaks.
- `insights/<type>/[slug].astro`: `export const prerender = false` + same
  cache header. Fetch the row by slug via the lib; if missing/unpublished →
  `return Astro.redirect('/insights/<type>/', 302)` to the section index. Render the
  **existing** `*Detail.astro` component, which keeps all type-specific chrome
  and now renders `body` as Markdown→HTML instead of `blocks`.
- `*Detail.astro` (`ExhibitionDetail`, `MediaDetail`, `EbookDetail`): updated to
  accept the DB row shape and `set:html` the rendered Markdown body; all layout,
  the YouTube embed, the PDF/"Request a copy" CTA, and venue/stand chrome stay.

## Data migration

Idempotent seed inside each table's migration (guarded by
`where not exists (select 1 from public.<table>)`, like `0015_news.sql`),
loading the current items from `site-content.ts`:
- `exhibitionDetails` (6) → `exhibitions` (event_date, venue, stand, image, body
  from the detail's paragraph blocks joined as Markdown; `card_date` matched
  from `insightsExhibitionsItems` by slug).
- `mediaDetails` (3) → `media` (video_url, poster_image, body).
- `ebookDetails` (2) → `ebooks` (year, cover_image, download_url, body).

Migrations are applied via the **Supabase Management API** (per project
convention; build the JSON payload in Python, not jq).

## site-content.ts changes

- **Remove:** `ExhibitionDetail`, `MediaDetail`, `EbookDetail` interfaces and
  the `exhibitionDetails` / `mediaDetails` / `ebookDetails` arrays (now in the DB).
- **Keep:** `insightsExhibitionsItems`, `insightsMediaItems`,
  `insightsEbooksItems` — used **only** as the index pages' offline fallback,
  exactly as `insightsNewsItems` backs the News island.

## Testing

- `src/lib/exhibitions.test.ts`, `media.test.ts`, `ebooks.test.ts`: slug
  generation, draft shape, row→`ListItem` mapping, and the `card_date ??
  event_date` fallback (exhibitions). Mirror `src/lib/contact.test.ts`.
- Smoke: each `index.astro` builds and each `[slug].astro` resolves a seeded
  slug. `npx vitest run` + `npx astro build` green.

## File inventory

**New**
- `supabase/migrations/00NN_insights_exhibitions.sql` (+ media, + ebooks, + shared `insights` bucket/storage migration)
- `src/types/{exhibition,media,ebook}.ts`
- `src/lib/{exhibitions,media,ebooks}.ts` (+ `.test.ts`)
- `src/components/admin/{ExhibitionsTab,ExhibitionForm,MediaTab,MediaForm,EbooksTab,EbookForm}.tsx`

**Edited**
- `src/components/admin/Dashboard.tsx` (register tabs, rename group)
- `src/pages/insights/{exhibitions,media,ebooks}/index.astro` and `[slug].astro`
- `src/components/insights/{ExhibitionDetail,MediaDetail,EbookDetail}.astro`
- `src/data/site-content.ts` (remove detail arrays/interfaces; keep card arrays)

## Rollout

1. Apply migrations (tables + storage + seed) via Management API.
2. Ship types, libs, admin tabs/forms, page + detail-component changes.
3. Verify: dashboard CRUD round-trips; public pages render seeded items; build
   green. Existing URLs (`/insights/<type>/<slug>/`) still resolve.

Migration numbers are assigned sequentially after the current highest at
implementation time.
