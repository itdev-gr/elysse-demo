# Admin blog dashboard — design spec

**Date:** 2026-06-01
**Status:** Draft — pending user approval
**Author:** Marios + Claude

---

## 1. Goal

Extend the existing `/admin` dashboard with a "Posts" tab for managing full blog posts. Published posts render on `/insights/blog/` as cards and at `/insights/blog/<slug>/` as full article pages.

The 5 existing hardcoded blog teasers in `site-content.ts` are pre-seeded into the new database table (with expanded body content) and removed from the data file, so the database becomes the single source of truth.

Builds on top of the jobs feature shipped in `docs/superpowers/specs/2026-05-31-admin-jobs-dashboard-design.md`. Reuses the same Supabase client, auth model, RLS pattern, and admin auth gate.

## 2. Non-goals

- Comments, reactions, likes
- Draft preview links (drafts visible only to authenticated admins)
- Scheduled-future-publish enforcement (a future-dated `published_at` does not hide a post in v1)
- Multi-image upload inside the body (only one cover image per post)
- Categories / tag filtering UI
- RSS feed
- Related-posts widget or recommendation engine
- Email notifications on publish
- Multi-author profiles or author pages

## 3. Architecture

```
┌──────────────────────────┐         ┌──────────────────────────────────┐
│  /admin                  │         │ /insights/blog/  (existing page) │
│  ┌──────────┬─────────┐  │  reads  │ - static shell                   │
│  │  Jobs    │  Posts  │  │ ◄────── │ - <BlogList client:visible />    │
│  ├──────────┴─────────┤  │         │   fetches posts via anon key     │
│  │  PostsTab          │  │         └──────────────┬───────────────────┘
│  │  • table + actions │  │                        │
│  │  • <PostForm/>     │  │                        ▼
│  │  • image upload    │  │         ┌──────────────────────────────────┐
│  └────────┬───────────┘  │         │ /insights/blog/[slug].astro      │
└───────────┼──────────────┘         │ - <BlogPostView client:load />   │
            │                        │   fetches one post by slug       │
            ▼                        └──────────────────────────────────┘
   ┌─────────────────────────────────────────────────────────────────┐
   │  Supabase                                                       │
   │  • public.posts (RLS-protected)                                 │
   │  • storage bucket `blog-covers` (public read, authed write)     │
   └─────────────────────────────────────────────────────────────────┘
```

- The site stays SSG. No Astro adapter.
- The detail page `[slug].astro` mounts a `client:load` React island that fetches by slug. This avoids regenerating the site on every new post. SEO trade-off accepted for the demo.
- Public anon key is used everywhere on the client; RLS enforces auth boundaries.
- Storage bucket has public read so the cover URL works directly in `<img>` tags. Uploads go through the authenticated client, gated by RLS-equivalent storage policies.

## 4. Data model

### Table: `public.posts`

| column            | type          | constraints                                                    |
|-------------------|---------------|----------------------------------------------------------------|
| `id`              | uuid          | PK, `default gen_random_uuid()`                                |
| `slug`            | text          | UNIQUE NOT NULL — URL segment, lowercase ASCII + hyphens       |
| `title`           | text          | NOT NULL                                                       |
| `excerpt`         | text          | NOT NULL — 1-2 sentence summary, used on card + meta description |
| `body`            | text          | NOT NULL — markdown                                            |
| `cover_image`     | text          | NULL — public URL from Supabase Storage                        |
| `author`          | text          | NULL — defaults to "Elysée Group" at render time when null     |
| `published_at`    | timestamptz   | NULL — auto-set to `now()` on first publish, admin-editable    |
| `reading_minutes` | int           | NULL — computed from word count of `body` on save              |
| `is_published`    | boolean       | NOT NULL, `default true`                                       |
| `created_at`      | timestamptz   | NOT NULL, `default now()`                                      |
| `updated_at`      | timestamptz   | NOT NULL, `default now()`, refreshed by trigger                |

Indexes:
- `posts_published_published_at_idx` on `(is_published, published_at desc)` — supports the public list query.
- `posts_slug_idx` — covered by the UNIQUE constraint.

Trigger `set_posts_updated_at` keeps `updated_at` current on UPDATE (separate function from jobs; the existing `set_updated_at()` function can be reused).

### RLS policies

```sql
alter table public.posts enable row level security;

-- Public: only published posts
create policy "public read published posts"
on public.posts for select
to anon, authenticated
using (is_published = true);

-- Admin (any signed-in user): full access
create policy "authenticated full access on posts"
on public.posts for all
to authenticated
using (true) with check (true);
```

### Storage bucket: `blog-covers`

- **Public read** so `<img src="...">` works without signed URLs.
- **Insert/Update/Delete** restricted to authenticated role via storage RLS policy.
- Uploaded files keyed as `<post-id>/<random>.<ext>`.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Max file size enforced by Supabase (default 50 MB; we won't tune this in v1).

```sql
-- Storage policies for the bucket
insert into storage.buckets (id, name, public) values ('blog-covers', 'blog-covers', true)
  on conflict (id) do nothing;

create policy "public read blog-covers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'blog-covers');

create policy "authenticated write blog-covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'blog-covers');

create policy "authenticated update blog-covers"
on storage.objects for update to authenticated
using (bucket_id = 'blog-covers');

create policy "authenticated delete blog-covers"
on storage.objects for delete to authenticated
using (bucket_id = 'blog-covers');
```

## 5. File layout

### New files

```
supabase/migrations/0002_posts.sql            schema + RLS + trigger + index + storage bucket + policies
supabase/migrations/0003_seed_blog_posts.sql  seed the 5 existing teasers as full posts

src/types/post.ts                             Post TS type
src/lib/posts.ts                              pure helpers (slugify, calcReadingMinutes,
                                              renderPostBody, uploadCoverImage)
src/lib/posts.test.ts                         vitest unit tests

src/components/blog/BlogList.tsx              public island — fetch + render cards
src/components/blog/BlogCard.tsx              single card (cover, title, meta, excerpt)
src/components/blog/BlogPostView.tsx          detail-page island — fetch by slug + render

src/components/admin/PostsTab.tsx             table of posts + create/edit/delete/publish
src/components/admin/PostForm.tsx             create/edit form with image upload widget
src/components/admin/JobsTab.tsx              jobs table extracted from current Dashboard

src/pages/insights/blog/[slug].astro          dynamic detail page wrapper
```

### Modified files

```
src/components/admin/Dashboard.tsx            tabbed layout: Jobs | Posts; delegates to JobsTab + PostsTab
src/pages/insights/blog/index.astro           replace ListPageLayout call with the section shell + <BlogList client:visible />
src/data/site-content.ts                      delete `insightsBlogItems` and any imports
```

### Untouched

`src/data/site-content.ts` apart from removing `insightsBlogItems`. All other pages, components, navigation, and layouts stay the same. Existing jobs flow continues to work — `Dashboard.tsx` refactor moves its body into `JobsTab.tsx` without behavior change.

## 6. Migration of existing 5 teaser items

`supabase/migrations/0003_seed_blog_posts.sql` contains 5 INSERTs.

For each of the 5 existing posts in `insightsBlogItems`:
- `title`: verbatim from the existing data
- `excerpt`: verbatim from the existing data
- `body`: 3-5 paragraphs of expanded marketing-style content authored to match the rest of the site's tone. Each post body draws on the public Elysée product information that the excerpt summarises. Bodies are intentionally short (200-400 words) — admin can extend/edit via the admin form afterward.
- `slug`: auto-derived from title via `slugify` (defined in `src/lib/posts.ts`); committed in the migration as literals to avoid runtime drift.
- `author`: `'Elysée Group'`
- `is_published`: `true`
- `published_at`: `now()` (back-fill any specific historical dates later from admin)
- `cover_image`: `null` (admin adds via form afterward)
- `reading_minutes`: pre-calculated and committed as a literal

The matching code change removes `insightsBlogItems` from `site-content.ts` and the import in `src/pages/insights/blog/index.astro`.

## 7. Public list page

`/insights/blog/` is restructured:
- Existing page chrome (hero / eyebrow) is preserved per the "preserve existing design" rule.
- The previous `<ListPageLayout items={insightsBlogItems} />` call is replaced by the layout shell + `<BlogList client:visible />`.
- States (mirrors JobsList from the jobs feature):
  - loading → 3 skeleton cards (1-col mobile / 2-col tablet+)
  - empty → single full-width card: "No posts yet — check back soon." + ContactSubNav-style link back to insights
  - error → "Posts are temporarily unavailable" + the same fallback link
  - ready → grid of `<BlogCard>` sorted by `published_at desc`

### `BlogCard` layout

```
┌────────────────────────────────────────────────┐
│ ┌─────────────────────────┐                    │
│ │     cover image         │                    │
│ │   (or branded SVG       │                    │
│ │    placeholder)         │                    │
│ └─────────────────────────┘                    │
│ Elysée R&D Team · 1 Jun 2026 · 4 min read     │ ← meta line
│ The Ultimate Solution for Pool Plumbing.       │ ← title (display, brand on hover)
│ ─                                              │ ← brand-500 hairline
│ Excerpt rendered as plain text, 2 lines max,   │ ← excerpt
│ clamped with ellipsis.                         │
│                                                │
│ [Read article →]                               │ ← link to /insights/blog/<slug>/
└────────────────────────────────────────────────┘
```

- Whole card is clickable; `[Read article]` is the visual affordance.
- Cover image area maintains a 16:9 aspect ratio (CSS aspect-ratio).
- If `cover_image` is null, render a branded SVG placeholder (one of the existing `MegaThumb` icons reused, or a flat brand-500/10 block with the Elysée mark).

## 8. Public detail page

**Approach:** `src/pages/insights/blog/[slug].astro` uses `getStaticPaths()` at build time to read all currently-published slugs from Supabase and emit one HTML file per slug. The page body itself renders `<BlogPostView slug={Astro.params.slug} client:load />`, which re-fetches the full post row at runtime. This means edits to title/body/cover propagate without a rebuild, but **brand-new posts require a Vercel rebuild** before their detail URL becomes reachable.

This trade-off is acceptable because:
- The list page (`/insights/blog/`) fetches dynamically and always shows new posts immediately.
- Editing existing posts (the most frequent operation) requires no rebuild.
- The admin can trigger a Vercel redeploy from the dashboard, or via a deploy hook, when they want a new post live at its own URL.
- Pure SSG keeps the site fast and adapter-free — no infra changes needed.

File template:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import BlogPostView from '../../../components/blog/BlogPostView.tsx';

export async function getStaticPaths() {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  );
  const { data } = await sb
    .from('posts')
    .select('slug')
    .eq('is_published', true);
  // If env vars are missing during build, emit an empty set so the build
  // still succeeds. The list page renders independently.
  return (data ?? []).map((row) => ({ params: { slug: row.slug } }));
}

const { slug } = Astro.params;
---
<BaseLayout title="Article — Elysée" description="" padForHeader={false}>
  <BlogPostView slug={slug ?? ''} client:load />
</BaseLayout>
```

### `BlogPostView` layout

```
┌──────────────────────────────────────────────────────┐
│ ████████████████████████████████████████████████████ │  ← full-bleed cover (if present)
│ ████████████████████████████████████████████████████ │     16:9 max-height
│ ████████████████████████████████████████████████████ │
└──────────────────────────────────────────────────────┘
   Insights · Blog                                     ← eyebrow
   The Ultimate Solution for Pool Plumbing.            ← display heading
   ─                                                   ← brand hairline
   Elysée R&D Team · 1 Jun 2026 · 4 min read           ← meta line

   First paragraph of sanitised markdown body…

   ## H2 section
   Body content with **bold**, lists, links…

   [← Back to all posts]
```

Rendered through `renderPostBody(body)` — same pipeline as `renderJobDescription` (marked + DOMPurify allowlist). Allowed tags expanded to: `p, br, strong, em, ul, ol, li, a, h2, h3, blockquote, code, pre`.

Loading state: header skeleton + 3 paragraph skeletons.
Not-found state: "Post not found." card + link back to `/insights/blog/`.

## 9. Admin dashboard integration

`src/components/admin/Dashboard.tsx` becomes a thin shell:

```tsx
type Tab = 'jobs' | 'posts';

const [tab, setTab] = useState<Tab>('jobs');
// header with Sign out
// nav: two buttons "Jobs" | "Posts"
// {tab === 'jobs' ? <JobsTab /> : <PostsTab />}
```

`JobsTab` is the existing jobs UI extracted as-is — same table, same JobForm, same actions. No behaviour change.

`PostsTab` mirrors `JobsTab`:
- Header: `[+ New post]`
- Table columns: Title · Author · Published · Status · Actions (Edit · Toggle publish · Delete)
- Create/edit opens `<PostForm initial={post} onSaved={reload} onCancel={...} />`
- Delete uses the same `confirm()` dialog pattern

## 10. `PostForm`

Fields in order:
1. **Title** * — text
2. **Slug** * — text; auto-fills from title on first focus-blur of Title field; admin can override. On save, validated against `/^[a-z0-9-]+$/`; if duplicate, Supabase returns a unique-constraint error → surfaced inline.
3. **Author** — text, optional, placeholder "Elysée Group"
4. **Excerpt** * — textarea (2 rows, max 300 chars enforced via `maxLength` + visible counter)
5. **Cover image** — file picker:
   - Drag-and-drop OR click to select
   - Preview shown after select; "Remove" button before save
   - On save (or on select, debounced):
     - Upload to `blog-covers/<post-id>/<random>.<ext>` (use `crypto.randomUUID()` for the filename)
     - For new posts: upload happens after the post row is INSERTed, so we have an ID
     - Returned public URL is written to `cover_image`
   - Max client-side check: 4 MB, MIME in (jpeg/png/webp) — show error if violated
6. **Body** * — textarea (15 rows), monospace, "Markdown supported (headings, lists, bold, links)"
7. **Publish date** — datetime-local, optional. Auto-set to `now()` on first save when empty.
8. **Published** — checkbox, default `true`

On save:
- `reading_minutes = Math.max(1, Math.ceil(body.split(/\s+/).length / 200))` — computed client-side, sent as part of the payload.
- Trim slug. Lowercase slug. Reject if empty.
- `published_at`: if empty on a published post → use `now()`. If not published, leave null.

## 11. Pure helpers — `src/lib/posts.ts`

```ts
slugify(title: string): string                  // strip diacritics, lowercase, replace non-[a-z0-9] with -, collapse, trim
calcReadingMinutes(body: string): number        // max(1, ceil(wordCount/200))
renderPostBody(markdown: string): string        // marked + dompurify, expanded ALLOWED_TAGS list
uploadCoverImage(file: File, postId: string):   // returns public URL
  Promise<{ url: string }>
```

Unit-tested in `src/lib/posts.test.ts`:
- `slugify`: handles diacritics, punctuation, multi-spaces, leading/trailing dashes, unicode
- `calcReadingMinutes`: empty body → 1, exactly 200 words → 1, 201 words → 2, very long
- `renderPostBody`: h2/h3 render, blockquote preserved, scripts stripped, anchor rel/target enforced

`uploadCoverImage` is integration-tested manually (Supabase Storage round-trip) since it's a thin wrapper over `supabase.storage.from(...).upload(...)`.

## 12. Environment + setup

No new env vars. Reuses:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Manual one-time steps (documented in this spec; can be automated via Management API since the same PAT-based flow works):
1. Run `supabase/migrations/0002_posts.sql` (table + RLS + bucket + storage policies)
2. Run `supabase/migrations/0003_seed_blog_posts.sql` (seed 5 posts)

If using Management API automation: I can run both migrations during implementation rather than asking you to copy-paste again.

## 13. Security model

- **Anon key remains public.** RLS + storage policies enforce all writes.
- **No service-role key in code.** Same as jobs.
- **Cover image URLs are public** by design — the bucket is public-read. Don't upload anything sensitive.
- **XSS:** `renderPostBody` uses the same sanitize pipeline as `renderJobDescription` with an expanded allowlist for headings/blockquote/code. Anchor `rel`/`target` enforcement keeps cross-origin links safe.
- **Slug validation:** server-side via the UNIQUE constraint + CHECK (we'll add `check (slug ~ '^[a-z0-9-]+$')` in the migration).

## 14. Edge cases

| scenario                                | behavior                                                                 |
|-----------------------------------------|--------------------------------------------------------------------------|
| No posts in DB                          | List shows empty-state card                                              |
| All posts are drafts                    | Same as no posts                                                         |
| Visiting a non-existent slug            | `BlogPostView` shows "Post not found." card with link back to list page  |
| New post created but site not rebuilt   | List page shows it; detail page returns 404 until next build (documented)|
| Cover image upload fails                | Form shows inline error; post is NOT created/updated (atomic flow)       |
| Cover image succeeds but DB write fails | Orphan file in bucket (acceptable; cleanup is a future concern)          |
| Description has malformed markdown      | `marked` is forgiving; DOMPurify strips anything dangerous               |
| Admin two-tab edit                      | Last-save wins (no optimistic locking); auto-`updated_at` reflects this  |
| Admin uploads non-image file            | Client-side MIME check rejects with inline error before upload starts    |
| Supabase storage quota exceeded         | Upload errors surface in form; admin retries with smaller file           |

## 15. Testing

- **Unit tests** for `slugify`, `calcReadingMinutes`, `renderPostBody` (vitest, colocated in `src/lib/posts.test.ts`)
- **Manual smoke test** end-to-end via Playwright after implementation:
  1. Sign in to /admin
  2. Switch to Posts tab → table populated with 5 seeded posts
  3. Create new post with cover image upload
  4. Verify it appears on /insights/blog/
  5. Visit detail page → 404 (rebuild required) — document this in the smoke notes
  6. Rebuild → detail page renders body
  7. Edit + unpublish + re-publish + delete

Build verification: `npm run build` + `npx astro check` + `npm test` all clean.

## 16. Rollout

1. Implement and verify locally with the existing Supabase project
2. Run migrations 0002 and 0003 (via Management API, since the workflow is established)
3. Push commits to main → Vercel rebuilds → public list page goes live; detail page handles all 5 seeded slugs
4. Smoke test on production URL
5. For future posts: admin creates post → list page shows it instantly. Detail page needs a Vercel rebuild to be reachable. Mitigation: a "Republish" button in Vercel hooked to a deploy hook, or a manual redeploy on the Vercel dashboard.

## 17. Open questions

None at design time. Implementation may surface small ones (image MIME edge cases, slug collision UX) — handled in the writing-plans phase.
