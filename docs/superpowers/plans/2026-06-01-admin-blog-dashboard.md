# Admin Blog Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing `/admin` dashboard with a "Posts" tab for managing full blog posts. Published posts render on `/insights/blog/` as a card grid and at `/insights/blog/<slug>/` as full article pages.

**Architecture:** Site stays SSG. Public list and detail pages use React islands with `@supabase/supabase-js` (anon key). Detail-page URLs are emitted at build time via `getStaticPaths` reading published slugs from Supabase. Cover images live in a Supabase Storage bucket (`blog-covers`) with public read + authenticated write.

**Tech Stack:** Astro 6, React 19, Supabase (Postgres + Auth + Storage), `marked`, `isomorphic-dompurify`, TailwindCSS 4.

**Spec:** `docs/superpowers/specs/2026-06-01-admin-blog-dashboard-design.md`

---

## Manual prerequisites

These must be done before Task 13 (verification). They can run in parallel with code Tasks 3–12.

1. **Apply migration 0002** in Supabase (creates `public.posts` + RLS + storage bucket + storage policies). After Task 1 lands the SQL file, run it via the SQL editor at
   `https://supabase.com/dashboard/project/hsamhykaqmiiheneonxz/sql/new` — or, since the PAT-based Management API flow is established, the implementer can apply it directly via `curl` to `/v1/projects/{ref}/database/query`.
2. **Apply migration 0003** (seed the 5 existing blog teasers as full posts). Same workflow as 0002.
3. **Verify the storage bucket** is `public = true` at
   `https://supabase.com/dashboard/project/hsamhykaqmiiheneonxz/storage/buckets`

---

## File map

**Created:**
- `supabase/migrations/0002_posts.sql` — table + RLS + trigger + indexes + storage bucket + storage policies
- `supabase/migrations/0003_seed_blog_posts.sql` — 5 INSERTs with expanded bodies
- `src/types/post.ts` — Post / PostDraft / PostStatus TS types
- `src/lib/posts.ts` — pure helpers: `slugify`, `calcReadingMinutes`, `renderPostBody`, `uploadCoverImage`
- `src/lib/posts.test.ts` — vitest unit tests
- `src/components/blog/BlogCard.tsx` — single card
- `src/components/blog/BlogList.tsx` — public island, fetches + renders list with states
- `src/components/blog/BlogPostView.tsx` — detail-page island, fetches by slug
- `src/components/admin/JobsTab.tsx` — current jobs UI extracted as-is
- `src/components/admin/PostsTab.tsx` — posts table + actions
- `src/components/admin/PostForm.tsx` — shared create/edit form with cover upload
- `src/pages/insights/blog/[slug].astro` — dynamic detail-page wrapper

**Modified:**
- `src/components/admin/Dashboard.tsx` — becomes a thin tabbed shell delegating to JobsTab + PostsTab
- `src/pages/insights/blog/index.astro` — replace static ListPageLayout call with hero + `<BlogList client:visible />`
- `src/data/site-content.ts` — remove `insightsBlogItems` and any internal references

**Untouched:** all other pages, the existing jobs feature, navigation, layouts, env vars.

---

## Task 1: DB migration — `posts` table + RLS + storage bucket

**Files:**
- Create: `supabase/migrations/0002_posts.sql`

- [ ] **Step 1: Write the migration**

Write to `supabase/migrations/0002_posts.sql`:

```sql
-- public.posts: backing table for the admin blog dashboard.
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique
                    check (slug ~ '^[a-z0-9-]+$'),
  title           text not null,
  excerpt         text not null,
  body            text not null,
  cover_image     text,
  author          text,
  published_at    timestamptz,
  reading_minutes int,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_published_published_at_idx
  on public.posts (is_published, published_at desc);

-- Reuse the set_updated_at() trigger function created in 0001_jobs.sql.
drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.posts enable row level security;

drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts"
on public.posts for select
to anon, authenticated
using (is_published = true);

drop policy if exists "authenticated full access on posts" on public.posts;
create policy "authenticated full access on posts"
on public.posts for all
to authenticated
using (true) with check (true);

-- Storage: bucket for cover images.
insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read blog-covers" on storage.objects;
create policy "public read blog-covers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'blog-covers');

drop policy if exists "authenticated write blog-covers" on storage.objects;
create policy "authenticated write blog-covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'blog-covers');

drop policy if exists "authenticated update blog-covers" on storage.objects;
create policy "authenticated update blog-covers"
on storage.objects for update to authenticated
using (bucket_id = 'blog-covers');

drop policy if exists "authenticated delete blog-covers" on storage.objects;
create policy "authenticated delete blog-covers"
on storage.objects for delete to authenticated
using (bucket_id = 'blog-covers');
```

- [ ] **Step 2: Apply the migration via the Management API**

Set the PAT in a local shell variable (do not commit) and run:

```bash
SBP_TOKEN="<PAT from user>"
PROJECT_REF="hsamhykaqmiiheneonxz"
SQL_BODY=$(python3 -c "import json,sys; print(json.dumps({'query': open(sys.argv[1]).read()}))" supabase/migrations/0002_posts.sql)
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SQL_BODY"
```

Expected: `[]` (empty result on a DDL statement).

- [ ] **Step 3: Verify the table + bucket**

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"select count(*) from public.posts"}'
```

Expected: `[{"count":0}]`

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"select id, public from storage.buckets where id='blog-covers'\"}"
```

Expected: `[{"id":"blog-covers","public":true}]`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_posts.sql
git commit -m "feat(db): posts table + RLS + blog-covers storage bucket"
```

---

## Task 2: Seed the 5 existing teasers as full posts

**Files:**
- Create: `supabase/migrations/0003_seed_blog_posts.sql`

These bodies are written in the marketing-explainer voice that matches the rest of the site. They're seeds — the admin will edit them via the dashboard if needed.

- [ ] **Step 1: Write the seed migration**

Write to `supabase/migrations/0003_seed_blog_posts.sql`:

```sql
-- Seed the 5 blog teasers from site-content.ts as full posts.
-- Idempotent: re-running this against existing rows is a no-op (slug is unique).
insert into public.posts (slug, title, excerpt, body, author, published_at, reading_minutes, is_published)
values
(
  'zeeflex-fittings-pool-plumbing',
  'The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings',
  'ZEEFLEX fittings by Elysée offer a reliable, leak-free solution for connecting flexible PVC pool hoses. Designed for 50 mm and 63 mm hoses, they combine easy installation with exceptional durability in demanding pool environments.',
  E'Pool installations live and die by the seal at every joint. A drip behind a tile, a slow weep at a manifold — small leaks compound into expensive callbacks and unhappy customers. ZEEFLEX fittings were designed to remove that risk.\n\nDeveloped specifically for **flexible PVC pool hoses** in 50 mm and 63 mm sizes, ZEEFLEX uses a barbed inner profile that locks into the hose wall, paired with a captive clamp that distributes pressure evenly around the full circumference. The result is a connection that resists creep under thermal cycling and chlorine exposure — the two failure modes most common in pool plumbing.\n\nWhat makes ZEEFLEX different in practice:\n\n- Single-pass installation: no separate primer, no two-part adhesive cure window\n- Compatible with both rigid PVC fittings and flexible hose runs\n- Field-serviceable: the captive clamp can be released and re-tensioned without cutting the hose\n- Tested for continuous service in chlorinated and salt-treated water\n\nFor pool builders working through tight installation windows in the high season, ZEEFLEX cuts the time per joint to under a minute while raising the confidence interval on every connection. For the homeowner downstream, it means a pool circuit that simply works — for years.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'elysee-zero-force-range-improved',
  'Meet the New and Improved Elysée Zero Force Range',
  'The new Elysée Zero Force range (75mm–110mm) has been upgraded with refined technology designed to make pipe installation faster, easier and more efficient. Its innovative semi push-fit system allows installers to insert pipes with zero insertion force after loosening the cap just one turn.',
  E'Installing large-diameter pipes has always been a wrestling match. Forcing a 110 mm pipe end into a tight rubber gasket takes leverage, patience, and a steady knee. The Elysée Zero Force range was created to end that fight — and the new generation makes it dramatically better.\n\nThe principle is simple. Loosen the cap one turn. The internal gasket relaxes. The pipe slides in with zero insertion force. Tighten the cap back. Done.\n\n## What is new in the upgraded range\n\n- **Refined gasket geometry** in the 75 mm, 90 mm and 110 mm sizes — sealing pressure is higher, but insertion force in the open position is now effectively zero\n- **Re-machined cap thread** for smoother engagement and a defined torque stop, so installers know when they are fully seated\n- **Updated body profile** that fits a wider range of fitting walls without the need for adapters\n\n## Why it matters on site\n\nA single Zero Force joint now takes seconds rather than minutes. On a multi-storey riser or a long horizontal manifold, that compounds across hundreds of joints into days of saved labour. And because the seal compression is independent of how hard the pipe was pushed in, the leak rate on commissioning drops to near zero — the seal is set by the cap, not by the installer.\n\nThe range is fully compatible with Elysée''s existing PVC product family. Drop-in replacement for legacy fittings; no system redesign needed.',
  'Elysée R&D Team',
  now(),
  3,
  true
),
(
  'elysee-global-transition-range',
  'The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer',
  'The Elysée Global Transition Range offers a universal solution for connecting different pipe materials, eliminating the need for multiple adapters and simplifying installations.',
  E'Real-world piping systems are never made of one material. Mains might be ductile iron, the rising pipe steel, the in-building distribution PE, the final connection PVC. Every interface between materials has historically meant a different adapter, a different gasket profile, a different inventory line.\n\nThe Elysée Global Transition Range collapses that complexity into a single family of fittings designed to **connect across material boundaries**.\n\n## What it covers\n\nOne range, multiple transitions:\n\n- PE to PVC\n- PE to ductile iron\n- PVC to steel\n- PE / PVC to copper for the final tail-piece on building services\n\nEach fitting in the range uses a common body geometry with material-specific inserts and seals, calibrated to the wall thickness and surface finish of the partner pipe. The installer carries one range, not five.\n\n## Why this is a game-changer\n\n- **Inventory:** distributors and installers reduce their SKU count substantially\n- **Field time:** no time lost identifying the right adapter from a confused mix on the van\n- **Reliability:** all transitions share the same proven seal architecture, which means a single quality bar across every connection in the system\n- **Engineering:** designers can specify a continuous Elysée system from the property boundary all the way to the appliance, with documented transition fittings at every material change\n\nThe Global Transition Range is what happens when a manufacturer stops thinking in product silos and starts thinking in installed systems.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'pvc-fittings-for-waste-and-soil-systems',
  'PVC Fittings and Pipes for Waste and Soil Systems',
  'Elysée Piping offers a comprehensive range of uPVC pipes and fittings designed for safe, hygienic and long-lasting soil and waste disposal systems. Manufactured from lead-free PVC-U and fully compliant with European standards EN 1329 and EN 1401.',
  E'Soil and waste systems are infrastructure you never want to think about — and that is exactly why they have to be designed and built to outlast everything else in a building. Elysée''s uPVC range exists for that brief.\n\n## What is in the range\n\nA full system, from house drainage through to underground sewer connection:\n\n- **Above-ground soil pipes and fittings** in the dimensions required by EN 1329, for stack and branch installations inside the building\n- **Underground sewer pipes and fittings** built to EN 1401, with SDR and stiffness classes selected for the trench loads typical of residential and light-commercial sites\n- **Inspection and access fittings** — rodding eyes, access chambers, single and double junctions — for the maintenance points that every code-compliant system needs\n\n## Material and compliance\n\nAll pipes and fittings are manufactured from **lead-free PVC-U**. This matters for two reasons:\n\n1. **Hygiene and environment:** lead-free formulation removes a long-standing concern about leachate and end-of-life handling\n2. **Compliance:** the range meets both EN 1329 (above-ground) and EN 1401 (below-ground) — covering the full range of relevant European standards in one product family\n\n## Why it lasts\n\nuPVC has been the workhorse material of drainage for decades because it does not corrode, does not scale, and does not depend on protective coatings to do its job. Elysée''s formulation is tuned for high-temperature greywater resistance and impact toughness at low ambient temperatures, so the same pipe stack performs from southern Cyprus through to northern installations.\n\nThe net result: a quietly invisible drainage system that does its job for the full design life of the building.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'elysee-irrigation-great-place-to-work',
  'Elysée Irrigation Certified as a Great Place To Work',
  'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment, where trust, respect, and the development of its people are at the core.',
  E'We are proud to announce that **Elysée Irrigation** has been officially certified as a *Great Place To Work®*. The certification is awarded after an independent assessment of company culture against a strict set of trust-based criteria, anchored in the experience of the employees themselves.\n\n## What the certification recognises\n\nThe assessment looks at the company from the inside out. It is the staff who fill in the survey, and it is their lived experience that determines whether the certification is granted. For Elysée Irrigation, the result confirms what we work for every day:\n\n- **Trust** between teams and across hierarchy levels\n- **Respect** for the role every individual plays in the success of the business\n- **Development** through training, internal moves, and long careers within the group\n- **Safety** as a non-negotiable across every site and every shift\n- **A modern working environment** that supports both the technical complexity of irrigation manufacturing and the human side of long careers\n\n## What this means for the wider group\n\nElysée Irrigation is one of several subsidiaries inside the Elysée Group. The certification is a milestone for the irrigation business specifically — and a benchmark we are committed to extending across every part of the group, from manufacturing in Cyprus to subsidiaries in Lebanon, Egypt and Austria.\n\nWe hire people, not seats. This certification is independent confirmation that the people who join us experience exactly that.',
  'Elysée Group',
  now(),
  3,
  true
)
on conflict (slug) do nothing;
```

- [ ] **Step 2: Apply the seed migration**

```bash
SBP_TOKEN="<PAT>"
PROJECT_REF="hsamhykaqmiiheneonxz"
SQL_BODY=$(python3 -c "import json,sys; print(json.dumps({'query': open(sys.argv[1]).read()}))" supabase/migrations/0003_seed_blog_posts.sql)
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SQL_BODY"
```

Expected: `[]`.

- [ ] **Step 3: Verify the seed**

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"select slug, title, reading_minutes from public.posts order by created_at\"}"
```

Expected: 5 rows with the slugs above.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0003_seed_blog_posts.sql
git commit -m "feat(db): seed 5 blog posts from existing site-content"
```

---

## Task 3: Post type + pure helpers (TDD)

**Files:**
- Create: `src/types/post.ts`
- Create: `src/lib/posts.ts`
- Create: `src/lib/posts.test.ts`

- [ ] **Step 1: Write the failing tests**

Write to `src/lib/posts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { slugify, calcReadingMinutes, renderPostBody } from './posts';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('strips diacritics', () => {
    expect(slugify('Élysée Group')).toBe('elysee-group');
  });
  it('strips punctuation and collapses dashes', () => {
    expect(slugify('Foo! @bar -- baz?')).toBe('foo-bar-baz');
  });
  it('trims leading and trailing dashes', () => {
    expect(slugify('  - Hello -  ')).toBe('hello');
  });
  it('handles empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('calcReadingMinutes', () => {
  it('returns 1 for empty', () => {
    expect(calcReadingMinutes('')).toBe(1);
  });
  it('returns 1 for short text', () => {
    expect(calcReadingMinutes('one two three')).toBe(1);
  });
  it('returns 1 for exactly 200 words', () => {
    const body = Array(200).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(1);
  });
  it('returns 2 for 201 words', () => {
    const body = Array(201).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(2);
  });
  it('returns 5 for 1000 words', () => {
    const body = Array(1000).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(5);
  });
});

describe('renderPostBody', () => {
  it('renders h2 and h3 headings', () => {
    const html = renderPostBody('## Section\n\n### Subsection');
    expect(html).toContain('<h2>Section</h2>');
    expect(html).toContain('<h3>Subsection</h3>');
  });
  it('renders blockquotes', () => {
    const html = renderPostBody('> Quoted text');
    expect(html).toContain('<blockquote>');
  });
  it('strips script tags', () => {
    const html = renderPostBody('hi <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
  it('adds rel and target to anchors', () => {
    const html = renderPostBody('[link](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});
```

- [ ] **Step 2: Run tests — they must fail**

```bash
npm test -- src/lib/posts.test.ts
```

Expected: FAIL — `src/lib/posts.ts` does not exist.

- [ ] **Step 3: Create the Post type**

Write to `src/types/post.ts`:

```ts
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  author: string | null;
  published_at: string | null;
  reading_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type PostDraft = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

export type PostStatus = 'Live' | 'Draft';
```

- [ ] **Step 4: Implement the helpers**

Write to `src/lib/posts.ts`:

```ts
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { supabase } from './supabase';

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calcReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

marked.setOptions({ gfm: true, breaks: true });

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a',
  'h2', 'h3', 'blockquote', 'code', 'pre',
];

export function renderPostBody(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'rel', 'target'],
  });
  // Force safe link attrs on any surviving anchor (dedupe existing ones).
  return sanitized.replace(
    /<a\s+([^>]*?)>/g,
    (_m, attrs) => {
      const clean = attrs.replace(/\s*(rel|target)="[^"]*"/g, '').trim();
      return `<a ${clean} rel="noopener noreferrer" target="_blank">`;
    },
  );
}

/** Upload a cover image and return its public URL. */
export async function uploadCoverImage(
  file: File,
  postId: string,
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('blog-covers')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 5: Run tests — they must pass**

```bash
npm test -- src/lib/posts.test.ts
```

Expected: 15+ tests passing across 3 describe blocks.

- [ ] **Step 6: Commit**

```bash
git add src/types/post.ts src/lib/posts.ts src/lib/posts.test.ts
git commit -m "feat(blog): Post type + pure helpers (slugify, reading minutes, render, upload) + tests"
```

---

## Task 4: `BlogCard` component

**Files:**
- Create: `src/components/blog/BlogCard.tsx`

- [ ] **Step 1: Build the component**

Write to `src/components/blog/BlogCard.tsx`:

```tsx
import type { Post } from '../../types/post';

type Props = { post: Post };

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ post }: Props) {
  const author = post.author?.trim() || 'Elysée Group';
  const date = formatDate(post.published_at);
  const minutes = post.reading_minutes ?? 1;

  return (
    <a
      href={`/insights/blog/${post.slug}/`}
      className="group bg-surface border-l-4 border-brand-500 flex flex-col transition-colors duration-300 hover:bg-surface-alt"
    >
      <div className="relative w-full aspect-video bg-surface-alt overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/5">
            <span className="font-display font-heavy text-brand-500/30 text-4xl">E</span>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
          {[author, date, `${minutes} min read`].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-3 font-display font-heavy text-xl md:text-2xl text-ink leading-tight group-hover:text-brand-500 transition-colors duration-300">
          {post.title}
        </h3>
        <div aria-hidden="true" className="mt-4 h-px w-10 bg-brand-500"></div>
        <p className="mt-5 text-sm md:text-base text-ink/70 leading-[1.6] line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-brand-500 font-medium">
          Read article
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 61 pages, no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogCard.tsx
git commit -m "feat(blog): BlogCard with cover image and meta line"
```

---

## Task 5: `BlogList` component

**Files:**
- Create: `src/components/blog/BlogList.tsx`

- [ ] **Step 1: Build the component**

Write to `src/components/blog/BlogList.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Post } from '../../types/post';
import BlogCard from './BlogCard';

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; posts: Post[] };

export default function BlogList() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (cancelled) return;

      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data || data.length === 0) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'ready', posts: data as Post[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-alt border-l-4 border-brand-500/40 min-h-[420px] animate-pulse">
            <div className="aspect-video bg-ink/10"></div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="h-3 w-32 bg-ink/10 rounded"></div>
              <div className="h-6 w-3/4 bg-ink/10 rounded"></div>
              <div className="h-3 w-full bg-ink/10 rounded"></div>
              <div className="h-3 w-2/3 bg-ink/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.kind === 'empty' || state.kind === 'error') {
    const heading = state.kind === 'empty'
      ? 'No posts yet.'
      : 'Posts are temporarily unavailable.';
    const body = state.kind === 'empty'
      ? 'Check back soon — we publish new pieces from across the group regularly.'
      : 'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.';
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {state.kind === 'empty' ? 'Nothing yet' : 'Temporarily unavailable'}
        </p>
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{heading}</h3>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">{body}</p>
        <a
          href="/insights/news/"
          className="mt-6 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Visit the newsroom
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {state.posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 61 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogList.tsx
git commit -m "feat(blog): BlogList with loading/empty/error/ready states"
```

---

## Task 6: Wire `BlogList` into `/insights/blog/` + remove old data

**Files:**
- Modify: `src/pages/insights/blog/index.astro`
- Modify: `src/data/site-content.ts`

- [ ] **Step 1: Replace the blog page body**

The current file has 10 lines. Overwrite `src/pages/insights/blog/index.astro` entirely:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Container from '../../../components/Container.astro';
import Section from '../../../components/Section.astro';
import BlogList from '../../../components/blog/BlogList.tsx';
---
<BaseLayout
  title="Blog — Insights — Elysée"
  description="In-depth articles on piping technology, installation best practices, and sustainable solutions."
  padForHeader={false}
>
  <section class="relative min-h-[60vh] flex items-end text-surface overflow-hidden bg-ink">
    <Container size="xl" class="relative pt-40 md:pt-48 pb-16 md:pb-24 w-full">
      <p class="text-[11px] md:text-xs uppercase tracking-[0.4em] text-surface/85 mb-8">
        Insights · Blog
      </p>
      <h1 class="font-display font-heavy leading-[0.92] tracking-tight text-surface" style="font-size: clamp(3rem, 9vw, 8rem); max-width: 14ch;">
        Blog.
      </h1>
      <p class="mt-8 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">
        In-depth articles on piping technology, installation best practices, and sustainable solutions.
      </p>
    </Container>
  </section>

  <Section bg="default" spacing="lg">
    <Container size="xl">
      <BlogList client:visible />
    </Container>
  </Section>
</BaseLayout>
```

- [ ] **Step 2: Remove `insightsBlogItems` from site-content.ts**

In `src/data/site-content.ts`, locate the block starting at `export const insightsBlogItems: InsightItem[] = [` (around line 1066) through to the closing `];` (around line 1102). Delete the entire block including the empty line after.

- [ ] **Step 3: Verify nothing else imports it**

```bash
grep -rn "insightsBlogItems" "/Users/marios/Desktop/Cursor/elysse demo/src"
```

Expected: no output (file fully removed everywhere).

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: 61 pages, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/insights/blog/index.astro src/data/site-content.ts
git commit -m "feat(blog): mount BlogList on /insights/blog/ + remove legacy hardcoded teasers"
```

---

## Task 7: `BlogPostView` component

**Files:**
- Create: `src/components/blog/BlogPostView.tsx`

- [ ] **Step 1: Build the component**

Write to `src/components/blog/BlogPostView.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Post } from '../../types/post';
import { renderPostBody } from '../../lib/posts';

type Props = { slug: string };

type State =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; post: Post };

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostView({ slug }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data) {
        setState({ kind: 'not-found' });
        return;
      }
      setState({ kind: 'ready', post: data as Post });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.kind === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 animate-pulse">
        <div className="h-4 w-32 bg-ink/10 rounded"></div>
        <div className="mt-6 h-12 w-3/4 bg-ink/10 rounded"></div>
        <div className="mt-6 h-4 w-1/3 bg-ink/10 rounded"></div>
        <div className="mt-10 space-y-3">
          <div className="h-3 bg-ink/10 rounded"></div>
          <div className="h-3 bg-ink/10 rounded"></div>
          <div className="h-3 w-5/6 bg-ink/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    const heading = state.kind === 'not-found' ? 'Post not found.' : 'Article temporarily unavailable.';
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {state.kind === 'not-found' ? 'Not found' : 'Temporarily unavailable'}
        </p>
        <h1 className="font-display font-heavy text-3xl md:text-4xl text-ink leading-tight">{heading}</h1>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">
          The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.
        </p>
        <a
          href="/insights/blog/"
          className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Back to all posts
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  const post = state.post;
  const author = post.author?.trim() || 'Elysée Group';
  const date = formatDate(post.published_at);
  const minutes = post.reading_minutes ?? 1;

  return (
    <article>
      {post.cover_image && (
        <div className="w-full aspect-video bg-surface-alt overflow-hidden max-h-[60vh]">
          <img
            src={post.cover_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 font-semibold">Insights · Blog</p>
        <h1
          className="mt-6 font-display font-heavy leading-[1.05] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
        >
          {post.title}
        </h1>
        <div aria-hidden="true" className="mt-8 h-px w-12 bg-brand-500"></div>
        <p className="mt-6 text-sm text-ink/65">
          {[author, date, `${minutes} min read`].filter(Boolean).join(' · ')}
        </p>

        <div
          className="mt-10 text-base md:text-lg text-ink/85 leading-[1.7] [&_h2]:font-display [&_h2]:font-heavy [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-5 [&_h3]:font-display [&_h3]:font-heavy [&_h3]:text-xl [&_h3]:text-ink [&_h3]:mt-8 [&_h3]:mb-4 [&_p]:mb-5 [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6 [&_strong]:font-semibold [&_strong]:text-ink"
          // Sanitized via DOMPurify in renderPostBody.
          dangerouslySetInnerHTML={{ __html: renderPostBody(post.body) }}
        />

        <a
          href="/insights/blog/"
          className="mt-14 inline-flex items-center gap-2 px-5 py-2.5 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] uppercase tracking-[0.25em] transition-colors duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to all posts
        </a>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 61 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/BlogPostView.tsx
git commit -m "feat(blog): BlogPostView detail-page island with cover + sanitized body"
```

---

## Task 8: Dynamic detail page `/insights/blog/[slug]`

**Files:**
- Create: `src/pages/insights/blog/[slug].astro`

- [ ] **Step 1: Build the page**

Write to `src/pages/insights/blog/[slug].astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import BlogPostView from '../../../components/blog/BlogPostView.tsx';

export async function getStaticPaths() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Build without env vars: emit no paths; list page still works at runtime.
    return [];
  }
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, anon);
  const { data } = await sb
    .from('posts')
    .select('slug')
    .eq('is_published', true);
  return (data ?? []).map((row) => ({ params: { slug: row.slug as string } }));
}

const { slug } = Astro.params;
---
<BaseLayout
  title="Article — Elysée"
  description=""
  padForHeader={false}
>
  <BlogPostView slug={slug ?? ''} client:load />
</BaseLayout>
```

- [ ] **Step 2: Verify build emits 5 detail pages (one per seeded post)**

```bash
npm run build 2>&1 | grep -E "blog/.+\.html|page\(s\)" | tail -10
```

Expected: 5 lines matching `blog/<slug>/index.html` (one per seeded post) AND a line `66 page(s) built` (61 + 5 new dynamic routes).

- [ ] **Step 3: Commit**

```bash
git add src/pages/insights/blog/\[slug\].astro
git commit -m "feat(blog): dynamic [slug] detail route via getStaticPaths"
```

---

## Task 9: Extract `JobsTab` from `Dashboard`

This is a pure refactor — copy the existing Dashboard body into a new component, then make Dashboard render it. No behavior changes.

**Files:**
- Create: `src/components/admin/JobsTab.tsx`
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Create JobsTab as a verbatim copy of the current Dashboard body**

Open `src/components/admin/Dashboard.tsx`. Copy its current body (everything from the `export default function Dashboard()` declaration through the closing `}` of the component, plus its imports) into a new file `src/components/admin/JobsTab.tsx`. Rename the exported function from `Dashboard` to `JobsTab`. **Remove** the top-level `<div className="min-h-screen bg-surface-alt">` and the wrapping `<div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">` — the new tabbed Dashboard will own the screen-level layout. Also **remove** the `<header>` element with the "Admin / Jobs." heading + "Sign out" button — the new Dashboard provides the tabbed header.

The resulting `JobsTab.tsx` should look like this:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types/job';
import { getStatus } from '../../lib/jobs';
import JobForm from './JobForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; job: Job };

export default function JobsTab() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setJobs((data ?? []) as Job[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (job: Job) => {
    const { error: err } = await supabase
      .from('jobs')
      .update({ is_published: !job.is_published })
      .eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('jobs').delete().eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New job
            </button>
          </div>

          {jobs === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-ink/60">No jobs yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => {
                    const status = getStatus(j);
                    return (
                      <tr key={j.id} className="border-b border-ink/5 last:border-b-0">
                        <td className="px-4 py-3 text-ink">{j.title}</td>
                        <td className="px-4 py-3 text-ink/75">{j.department}</td>
                        <td className="px-4 py-3 text-ink/75">{j.employment_type}</td>
                        <td className="px-4 py-3 text-ink/75">{j.deadline ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              status === 'Live'
                                ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                                : status === 'Draft'
                                ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                                : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-red-100 text-red-700'
                            }
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                            <button onClick={() => setMode({ kind: 'edit', job: j })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              Edit
                            </button>
                            <button onClick={() => togglePublish(j)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              {j.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => remove(j)} className="text-red-600 hover:text-red-800 cursor-pointer">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <JobForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <JobForm
          initial={mode.job}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Make Dashboard a thin wrapper temporarily delegating to JobsTab**

Overwrite `src/components/admin/Dashboard.tsx`:

```tsx
import { supabase } from '../../lib/supabase';
import JobsTab from './JobsTab';

export default function Dashboard() {
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">Jobs.</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>
        <JobsTab />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: 66 pages, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/JobsTab.tsx src/components/admin/Dashboard.tsx
git commit -m "refactor(admin): extract JobsTab from Dashboard (no behavior change)"
```

---

## Task 10: `PostForm` (with cover upload)

**Files:**
- Create: `src/components/admin/PostForm.tsx`

- [ ] **Step 1: Build the form**

Write to `src/components/admin/PostForm.tsx`:

```tsx
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { slugify, calcReadingMinutes, uploadCoverImage } from '../../lib/posts';
import type { Post, PostDraft } from '../../types/post';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  initial?: Post;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): PostDraft {
  return {
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    cover_image: null,
    author: null,
    published_at: null,
    reading_minutes: null,
    is_published: true,
  };
}

function toDraft(p: Post): PostDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = p;
  return rest;
}

export default function PostForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<PostDraft>(() => initial ? toDraft(initial) : emptyDraft());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.cover_image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onTitleBlur = () => {
    if (draft.slug.trim() === '' && draft.title.trim() !== '') {
      update('slug', slugify(draft.title));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      setError('Image must be JPEG, PNG or WebP.');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Image must be 4 MB or smaller.');
      e.target.value = '';
      return;
    }
    setPendingFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const removeCover = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    update('cover_image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const slug = slugify(draft.slug.trim()) || slugify(draft.title.trim());
      if (!slug) throw new Error('Slug is required.');

      const reading_minutes = calcReadingMinutes(draft.body);
      const published_at = draft.is_published
        ? (draft.published_at && draft.published_at.trim() !== ''
            ? draft.published_at
            : new Date().toISOString())
        : draft.published_at || null;

      // Step 1: create or update the post WITHOUT the new file URL.
      // We need the row id to namespace the storage path.
      let post: Post;
      const payload: PostDraft = {
        ...draft,
        slug,
        author: draft.author?.trim() || null,
        published_at,
        reading_minutes,
      };

      if (initial) {
        const { data, error: err } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', initial.id)
          .select()
          .single();
        if (err) throw err;
        post = data as Post;
      } else {
        const { data, error: err } = await supabase
          .from('posts')
          .insert(payload)
          .select()
          .single();
        if (err) throw err;
        post = data as Post;
      }

      // Step 2: if there's a new file, upload it and update the row with the URL.
      if (pendingFile) {
        const { url } = await uploadCoverImage(pendingFile, post.id);
        const { error: err } = await supabase
          .from('posts')
          .update({ cover_image: url })
          .eq('id', post.id);
        if (err) throw err;
      }

      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const excerptCount = draft.excerpt.length;
  const excerptOver = excerptCount > 300;

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit post' : 'New post'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          {error}
        </p>
      )}

      <Field label="Title" required>
        <input
          type="text"
          required
          value={draft.title}
          onChange={(e) => update('title', e.currentTarget.value)}
          onBlur={onTitleBlur}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" required hint="Lowercase letters, digits, hyphens.">
        <input
          type="text"
          required
          pattern="[a-z0-9-]+"
          value={draft.slug}
          onChange={(e) => update('slug', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Author" hint="Defaults to 'Elysée Group' if empty.">
        <input
          type="text"
          value={draft.author ?? ''}
          onChange={(e) => update('author', e.currentTarget.value)}
          placeholder="Elysée Group"
          className={inputClass}
        />
      </Field>

      <Field label="Excerpt" required hint={`${excerptCount}/300 characters`}>
        <textarea
          required
          rows={2}
          maxLength={300}
          value={draft.excerpt}
          onChange={(e) => update('excerpt', e.currentTarget.value)}
          className={`${inputClass} resize-y ${excerptOver ? 'border-red-500' : ''}`}
        />
      </Field>

      <Field label="Cover image" hint="JPEG, PNG, or WebP. Max 4 MB.">
        <div className="mt-2 flex items-center gap-4">
          {previewUrl ? (
            <div className="relative w-40 aspect-video bg-surface-alt rounded overflow-hidden border border-ink/10">
              <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-40 aspect-video bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No image</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="text-sm text-ink/80"
            />
            {(previewUrl || pendingFile) && (
              <button
                type="button"
                onClick={removeCover}
                className="text-[11px] uppercase tracking-[0.25em] text-red-600 hover:text-red-800 cursor-pointer text-left"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Body" required hint="Markdown supported (headings ##, lists, links, **bold**).">
        <textarea
          required
          rows={15}
          value={draft.body}
          onChange={(e) => update('body', e.currentTarget.value)}
          className={`${inputClass} font-mono resize-y`}
        />
      </Field>

      <Field label="Publish date" hint="Defaults to now when first published.">
        <input
          type="datetime-local"
          value={draft.published_at ? draft.published_at.slice(0, 16) : ''}
          onChange={(e) => update('published_at', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_published}
          onChange={(e) => update('is_published', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Published</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create post'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">
        {label}{required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/PostForm.tsx
git commit -m "feat(admin): PostForm with cover upload, slug auto-fill, markdown body"
```

---

## Task 11: `PostsTab`

**Files:**
- Create: `src/components/admin/PostsTab.tsx`

- [ ] **Step 1: Build the tab**

Write to `src/components/admin/PostsTab.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../types/post';
import PostForm from './PostForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; post: Post };

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostsTab() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setPosts((data ?? []) as Post[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post: Post) => {
    const { error: err } = await supabase
      .from('posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('posts').delete().eq('id', post.id);
    if (err) return setError(err.message);
    await load();
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New post
            </button>
          </div>

          {posts === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ink/60">No posts yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => {
                    const status = p.is_published ? 'Live' : 'Draft';
                    return (
                      <tr key={p.id} className="border-b border-ink/5 last:border-b-0">
                        <td className="px-4 py-3 text-ink">{p.title}</td>
                        <td className="px-4 py-3 text-ink/75">{p.author?.trim() || 'Elysée Group'}</td>
                        <td className="px-4 py-3 text-ink/75">{formatDate(p.published_at)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              status === 'Live'
                                ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                                : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                            }
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                            <button onClick={() => setMode({ kind: 'edit', post: p })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              Edit
                            </button>
                            <button onClick={() => togglePublish(p)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              {p.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => remove(p)} className="text-red-600 hover:text-red-800 cursor-pointer">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <PostForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <PostForm
          initial={mode.post}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/PostsTab.tsx
git commit -m "feat(admin): PostsTab table with create/edit/delete/toggle publish"
```

---

## Task 12: Dashboard tabbed shell — wire in PostsTab

**Files:**
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Replace Dashboard with the tabbed shell**

Overwrite `src/components/admin/Dashboard.tsx`:

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import JobsTab from './JobsTab';
import PostsTab from './PostsTab';

type Tab = 'jobs' | 'posts';

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('jobs');

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const tabClass = (which: Tab) =>
    `px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-colors duration-200 ${
      tab === which
        ? 'bg-ink text-surface'
        : 'text-ink/70 hover:text-brand-500'
    }`;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">
              {tab === 'jobs' ? 'Jobs.' : 'Posts.'}
            </h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        <nav className="mb-8 flex items-center gap-2 border-b border-ink/10 pb-4" aria-label="Admin sections">
          <button type="button" onClick={() => setTab('jobs')} className={tabClass('jobs')}>
            Jobs
          </button>
          <button type="button" onClick={() => setTab('posts')} className={tabClass('posts')}>
            Posts
          </button>
        </nav>

        {tab === 'jobs' ? <JobsTab /> : <PostsTab />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/Dashboard.tsx
git commit -m "feat(admin): tabbed Dashboard wiring Jobs + Posts"
```

---

## Task 13: End-to-end verification

Runs only after Tasks 1 & 2 manual prerequisites are applied (migrations + seed in Supabase).

- [ ] **Step 1: Static checks**

```bash
npx astro check
```

Expected: 0 errors.

```bash
npm test
```

Expected: all unit tests pass.

```bash
npm run build
```

Expected: 66 pages (61 base + 5 dynamic blog slug pages).

- [ ] **Step 2: Local smoke test**

```bash
npm run dev
```

In the browser:

1. **`/insights/blog/`** — verify all 5 seeded posts render as cards, sorted newest-first. Each card shows: title, eyebrow with author + date + reading minutes, excerpt clamped to 3 lines, "Read article →".
2. Click a card → navigates to **`/insights/blog/<slug>/`** → full article renders. Cover area is the empty placeholder (no cover yet). Markdown body shows h2 sections, lists, bold, etc.
3. Click "← Back to all posts" → returns to list.
4. **`/admin`** → sign in → Dashboard. Tab nav shows "Jobs" and "Posts". Default tab "Jobs"; existing jobs flow still works.
5. Switch to **Posts** tab → table populated with 5 seeded rows, all "Live".
6. Click **+ New post** → form opens. Fill title "Test Post"; slug auto-fills "test-post". Fill excerpt, body with `## A heading\n\n**bold**\n\n- a list\n- item`. Upload a small JPEG/PNG (under 4 MB). Preview thumbnail shows. Click "Create post".
7. Table now shows 6 rows. Test post is "Live".
8. **`/insights/blog/`** → "Test Post" appears (with cover image). Cards laid out 2-up on desktop.
9. **`/insights/blog/test-post/`** → expected 404 page (slug not in build's `getStaticPaths`). This is documented behavior. **Restart `npm run dev`** — page now resolves and the post renders.
10. Back in admin → **Edit** the test post → change body → save. Public detail page reflects the change without rebuild.
11. **Unpublish** → public list hides the row. Detail page returns the "Post not found." card (the runtime fetch filters published only).
12. **Delete** with confirm → row gone from admin table. Cover image file remains in the bucket (acceptable per spec).
13. **Sign out** → back to login form.

- [ ] **Step 3: Push to production**

After local verification:

- Confirm Vercel env vars `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are still set for Production + Preview.
- Push to `main`. Vercel rebuilds.
- Re-run steps 1–13 on the production URL. The build-time `getStaticPaths` will pick up the 5 seeded posts plus anything else live in Supabase at deploy time.

---

## Self-review

**Spec coverage:**
- §1 goal → entire plan
- §3 architecture → Tasks 5, 7, 8 (client islands + getStaticPaths)
- §4 data model + storage bucket + RLS → Task 1
- §5 file layout → mirrored in "File map" above
- §6 migration of 5 items → Task 2
- §7 public list page → Tasks 5, 6
- §8 public detail page → Tasks 7, 8
- §9 admin integration → Tasks 9, 12
- §10 PostForm → Task 10
- §11 pure helpers → Task 3
- §12 env + setup → reuses existing vars; documented in Manual Prerequisites
- §13 security → Task 1 (RLS + storage policies) + sanitizer in Task 3
- §14 edge cases → Tasks 5, 7, 10
- §15 testing → Task 3 (units) + Task 13 (manual)
- §16 rollout → Task 13 Step 3

**Placeholder scan:** No TBDs. Every code step shows full code. Every command has expected output. The blog body text in Task 2 is committed verbatim as part of the seed.

**Type consistency:** `Post`, `PostDraft`, `PostStatus`, `slugify`, `calcReadingMinutes`, `renderPostBody`, `uploadCoverImage` are all defined in Task 3 and consumed under the exact same names in Tasks 4–11. `JobsTab` (Task 9) and `PostsTab` (Task 11) follow the same `Mode` discriminated union pattern. `Dashboard` (Task 12) uses `Tab = 'jobs' | 'posts'` consistently.
