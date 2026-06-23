# Dashboard-managed Insights (Exhibitions, Media, eBooks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the three static Insights types (Exhibitions, Media, eBooks) into Supabase tables with full admin CRUD, so editors manage them from the dashboard and the public pages read live with no rebuild.

**Architecture:** Three independent tables mirroring the existing `news`/`jobs` pattern (own columns, type, lib, admin tab+form). Public index + detail pages become `prerender = false` and fetch server-side via the anon client (RLS exposes only published rows). Existing 11 items are migrated by a script that emits an idempotent seed migration (same pattern as `scripts/import-blog.mjs`). Heavy detail arrays are removed from `site-content.ts`; thin card arrays remain as offline fallbacks.

**Tech Stack:** Astro 5 (Vercel adapter, on-demand routes), React islands for admin, Supabase (Postgres + Storage + RLS), Tailwind, Vitest. Migrations applied via the Supabase Management API (Python JSON payload — `jq` is broken here).

**Spec:** `docs/superpowers/specs/2026-06-23-dashboard-managed-insights-design.md`

**Migration numbers:** current highest is `0026`. This plan adds `0027`–`0030` (tables + storage) and an emitted `0031_seed_insights.sql`.

---

## File Structure

**New**
- `supabase/migrations/0027_insights_exhibitions.sql` — exhibitions table, index, RLS
- `supabase/migrations/0028_insights_media.sql` — media table, index, RLS
- `supabase/migrations/0029_insights_ebooks.sql` — ebooks table, index, RLS
- `supabase/migrations/0030_insights_storage.sql` — shared public `insights` bucket + policies
- `supabase/migrations/0031_seed_insights.sql` — emitted by the seed script (do not hand-write)
- `src/types/exhibition.ts`, `src/types/media.ts`, `src/types/ebook.ts`
- `src/lib/exhibitions.ts`, `src/lib/media.ts`, `src/lib/ebooks.ts`
- `src/lib/insights-cards.ts` — pure row→card mappers (unit-tested, no Supabase import)
- `src/lib/insights-cards.test.ts`
- `scripts/seed-insights.mjs` — imports source arrays, converts blocks→markdown, emits `0031_seed_insights.sql`
- `src/components/admin/ExhibitionsTab.tsx`, `ExhibitionForm.tsx`
- `src/components/admin/MediaTab.tsx`, `MediaForm.tsx`
- `src/components/admin/EbooksTab.tsx`, `EbookForm.tsx`

**Modified**
- `src/components/insights/ExhibitionDetail.astro`, `MediaDetail.astro`, `EbookDetail.astro` — accept DB row, render Markdown body
- `src/pages/insights/exhibitions/index.astro` + `[slug].astro` (and media, ebooks equivalents)
- `src/components/admin/Dashboard.tsx` — register tabs, rename group
- `src/data/site-content.ts` — remove `*Details` arrays + their interfaces; keep card arrays

---

## Phase 0 — Database schema

### Task 0.1: Exhibitions table migration

**Files:**
- Create: `supabase/migrations/0027_insights_exhibitions.sql`

- [ ] **Step 1: Write the migration**

```sql
-- public.exhibitions: backing table for the admin Exhibitions dashboard.
-- Mirrors public.news; type-specific columns for event date / venue / stand.
create table if not exists public.exhibitions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  excerpt      text not null,
  body         text not null default '',
  event_date   text not null,          -- full human date, e.g. '10–14 November 2026'
  card_date    text,                   -- short label, e.g. 'Nov 2026' (falls back to event_date)
  venue        text,
  stand        text,
  image        text,
  image_alt    text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists exhibitions_published_created_idx
  on public.exhibitions (is_published, created_at desc);

-- Reuse the set_updated_at() trigger function created in 0001_jobs.sql.
drop trigger if exists set_exhibitions_updated_at on public.exhibitions;
create trigger set_exhibitions_updated_at
  before update on public.exhibitions
  for each row execute function public.set_updated_at();

alter table public.exhibitions enable row level security;

drop policy if exists "public read published exhibitions" on public.exhibitions;
create policy "public read published exhibitions"
  on public.exhibitions for select to anon, authenticated
  using (is_published = true);

drop policy if exists "authenticated full access on exhibitions" on public.exhibitions;
create policy "authenticated full access on exhibitions"
  on public.exhibitions for all to authenticated
  using (true) with check (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0027_insights_exhibitions.sql
git commit -m "feat(insights): exhibitions table migration"
```

### Task 0.2: Media table migration

**Files:**
- Create: `supabase/migrations/0028_insights_media.sql`

- [ ] **Step 1: Write the migration** (identical spine to 0.1; type-specific columns differ)

```sql
-- public.media: backing table for the admin Media dashboard. YouTube video per row.
create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  excerpt      text not null,
  body         text not null default '',
  video_url    text not null,          -- https://www.youtube.com/embed/<id>
  poster_image text,
  image_alt    text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists media_published_created_idx
  on public.media (is_published, created_at desc);

drop trigger if exists set_media_updated_at on public.media;
create trigger set_media_updated_at
  before update on public.media
  for each row execute function public.set_updated_at();

alter table public.media enable row level security;

drop policy if exists "public read published media" on public.media;
create policy "public read published media"
  on public.media for select to anon, authenticated
  using (is_published = true);

drop policy if exists "authenticated full access on media" on public.media;
create policy "authenticated full access on media"
  on public.media for all to authenticated
  using (true) with check (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0028_insights_media.sql
git commit -m "feat(insights): media table migration"
```

### Task 0.3: eBooks table migration

**Files:**
- Create: `supabase/migrations/0029_insights_ebooks.sql`

- [ ] **Step 1: Write the migration**

```sql
-- public.ebooks: backing table for the admin eBooks dashboard.
create table if not exists public.ebooks (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  excerpt      text not null,
  body         text not null default '',
  year         text,
  cover_image  text,
  image_alt    text,
  download_url text,                    -- external PDF link; null => "Request a copy" CTA
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists ebooks_published_created_idx
  on public.ebooks (is_published, created_at desc);

drop trigger if exists set_ebooks_updated_at on public.ebooks;
create trigger set_ebooks_updated_at
  before update on public.ebooks
  for each row execute function public.set_updated_at();

alter table public.ebooks enable row level security;

drop policy if exists "public read published ebooks" on public.ebooks;
create policy "public read published ebooks"
  on public.ebooks for select to anon, authenticated
  using (is_published = true);

drop policy if exists "authenticated full access on ebooks" on public.ebooks;
create policy "authenticated full access on ebooks"
  on public.ebooks for all to authenticated
  using (true) with check (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0029_insights_ebooks.sql
git commit -m "feat(insights): ebooks table migration"
```

### Task 0.4: Shared `insights` storage bucket

**Files:**
- Create: `supabase/migrations/0030_insights_storage.sql`

- [ ] **Step 1: Write the migration** (mirrors the `news-covers` policy set in 0015)

```sql
-- Shared public bucket for insights imagery (type-prefixed paths:
-- exhibitions/<id>/..., media/<id>/..., ebooks/<id>/...).
insert into storage.buckets (id, name, public)
values ('insights', 'insights', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read insights" on storage.objects;
create policy "public read insights"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'insights');

drop policy if exists "authenticated write insights" on storage.objects;
create policy "authenticated write insights"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'insights');

drop policy if exists "authenticated update insights" on storage.objects;
create policy "authenticated update insights"
  on storage.objects for update to authenticated
  using (bucket_id = 'insights');

drop policy if exists "authenticated delete insights" on storage.objects;
create policy "authenticated delete insights"
  on storage.objects for delete to authenticated
  using (bucket_id = 'insights');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0030_insights_storage.sql
git commit -m "feat(insights): shared insights storage bucket"
```

### Task 0.5: Apply migrations 0027–0030 via the Management API

**Files:** none (live DB change)

- [ ] **Step 1: Apply each migration**

Use the reference in `memory/reference_supabase_mgmt_api.md`. Build the JSON payload in Python (not `jq`). For each of `0027`–`0030`, POST the file's SQL to the Management API `query` endpoint with the project ref + access token. Pattern:

```python
import os, json, urllib.request, pathlib
ref   = os.environ["SUPABASE_PROJECT_REF"]
token = os.environ["SUPABASE_ACCESS_TOKEN"]
for f in ["0027_insights_exhibitions","0028_insights_media","0029_insights_ebooks","0030_insights_storage"]:
    sql = pathlib.Path(f"supabase/migrations/{f}.sql").read_text()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    print(f, urllib.request.urlopen(req).read().decode()[:200])
```

- [ ] **Step 2: Verify the tables exist**

Run the same endpoint with `select table_name from information_schema.tables where table_name in ('exhibitions','media','ebooks');`
Expected: three rows. And `select id, public from storage.buckets where id='insights';` → one row, `public = true`.

---

## Phase 1 — Types, libs, card mappers (TDD)

### Task 1.1: Row + Draft types

**Files:**
- Create: `src/types/exhibition.ts`, `src/types/media.ts`, `src/types/ebook.ts`

- [ ] **Step 1: Write `src/types/exhibition.ts`**

```ts
export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  event_date: string;
  card_date: string | null;
  venue: string | null;
  stand: string | null;
  image: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type ExhibitionDraft = Omit<Exhibition, 'id' | 'created_at' | 'updated_at'>;
```

- [ ] **Step 2: Write `src/types/media.ts`**

```ts
export interface Media {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  video_url: string;
  poster_image: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type MediaDraft = Omit<Media, 'id' | 'created_at' | 'updated_at'>;
```

- [ ] **Step 3: Write `src/types/ebook.ts`**

```ts
export interface Ebook {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  year: string | null;
  cover_image: string | null;
  image_alt: string | null;
  download_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type EbookDraft = Omit<Ebook, 'id' | 'created_at' | 'updated_at'>;
```

- [ ] **Step 4: Commit**

```bash
git add src/types/exhibition.ts src/types/media.ts src/types/ebook.ts
git commit -m "feat(insights): row + draft types"
```

### Task 1.2: Pure card mappers + failing test

**Files:**
- Create: `src/lib/insights-cards.ts`
- Test: `src/lib/insights-cards.test.ts`

These map a DB row to the `ListItem` shape `ListPageLayout` expects. Kept Supabase-free so they unit-test cleanly.

- [ ] **Step 1: Write the failing test** (`src/lib/insights-cards.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { exhibitionToCard, mediaToCard, ebookToCard } from './insights-cards';
import type { Exhibition } from '../types/exhibition';
import type { Media } from '../types/media';
import type { Ebook } from '../types/ebook';

const base = { id: '1', body: '', is_published: true, created_at: '', updated_at: '' };

it('exhibition card uses card_date, falling back to event_date', () => {
  const row = { ...base, slug: 'eima-2026', title: 'EIMA', excerpt: 'x',
    event_date: '10–14 November 2026', card_date: 'Nov 2026',
    venue: null, stand: null, image: '/i.png', image_alt: null } as Exhibition;
  expect(exhibitionToCard(row)).toEqual({
    title: 'EIMA', date: 'Nov 2026', excerpt: 'x',
    href: '/insights/exhibitions/eima-2026/', image: '/i.png',
  });
  expect(exhibitionToCard({ ...row, card_date: null }).date).toBe('10–14 November 2026');
});

it('media card maps poster_image to image', () => {
  const row = { ...base, slug: 'anniv', title: 'Anniv', excerpt: 'y',
    video_url: 'https://www.youtube.com/embed/x', poster_image: '/p.jpg', image_alt: null } as Media;
  expect(mediaToCard(row)).toEqual({
    title: 'Anniv', excerpt: 'y', href: '/insights/media/anniv/', image: '/p.jpg',
  });
});

it('ebook card maps cover_image to image', () => {
  const row = { ...base, slug: 'rep-2020', title: 'Report', excerpt: 'z',
    year: '2020', cover_image: '/c.png', image_alt: null, download_url: null } as Ebook;
  expect(ebookToCard(row)).toEqual({
    title: 'Report', excerpt: 'z', href: '/insights/ebooks/rep-2020/', image: '/c.png',
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/lib/insights-cards.test.ts`
Expected: FAIL — `exhibitionToCard is not a function` / module not found.

- [ ] **Step 3: Implement `src/lib/insights-cards.ts`**

```ts
import type { Exhibition } from '../types/exhibition';
import type { Media } from '../types/media';
import type { Ebook } from '../types/ebook';

export interface InsightCard {
  title: string;
  date?: string;
  excerpt?: string;
  href: string;
  image?: string;
}

export function exhibitionToCard(e: Exhibition): InsightCard {
  return {
    title: e.title,
    date: e.card_date ?? e.event_date,
    excerpt: e.excerpt,
    href: `/insights/exhibitions/${e.slug}/`,
    image: e.image ?? undefined,
  };
}

export function mediaToCard(m: Media): InsightCard {
  return {
    title: m.title,
    excerpt: m.excerpt,
    href: `/insights/media/${m.slug}/`,
    image: m.poster_image ?? undefined,
  };
}

export function ebookToCard(b: Ebook): InsightCard {
  return {
    title: b.title,
    excerpt: b.excerpt,
    href: `/insights/ebooks/${b.slug}/`,
    image: b.cover_image ?? undefined,
  };
}
```

Note: omit `date`/`image` keys when undefined so `toEqual` matches — return objects literally as above (undefined keys are dropped by `toEqual`'s structural compare only if absent). Build the object conditionally if a test mismatch on extra `undefined` keys appears:

```ts
const card: InsightCard = { title: e.title, excerpt: e.excerpt, href: `...` };
if (e.card_date ?? e.event_date) card.date = e.card_date ?? e.event_date;
if (e.image) card.image = e.image;
return card;
```

- [ ] **Step 4: Run it, verify pass**

Run: `npx vitest run src/lib/insights-cards.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/insights-cards.ts src/lib/insights-cards.test.ts
git commit -m "feat(insights): pure row->card mappers + tests"
```

### Task 1.3: Data-access libs

**Files:**
- Create: `src/lib/exhibitions.ts`, `src/lib/media.ts`, `src/lib/ebooks.ts`

Each exposes `list*`, `get*BySlug`, `upload*Image`, and re-exports `slugify`/`renderPostBody`. (Async Supabase functions aren't unit-tested — they're covered by the build + manual smoke; the pure mappers in 1.2 hold the testable logic.)

- [ ] **Step 1: Write `src/lib/exhibitions.ts`**

```ts
import { supabase } from './supabase';
import type { Exhibition } from '../types/exhibition';
export { slugify, renderPostBody } from './posts';

export async function listExhibitions(): Promise<Exhibition[]> {
  const { data, error } = await supabase
    .from('exhibitions').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Exhibition[];
}

export async function getExhibitionBySlug(slug: string): Promise<Exhibition | null> {
  const { data, error } = await supabase
    .from('exhibitions').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Exhibition;
}

export async function uploadExhibitionImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `exhibitions/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 2: Write `src/lib/media.ts`** — same as above with `from('media')`, type `Media`, path prefix `media/`, function names `listMedia`/`getMediaBySlug`/`uploadMediaImage`.

```ts
import { supabase } from './supabase';
import type { Media } from '../types/media';
export { slugify, renderPostBody } from './posts';

export async function listMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Media[];
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const { data, error } = await supabase
    .from('media').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Media;
}

export async function uploadMediaImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `media/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 3: Write `src/lib/ebooks.ts`** — same with `from('ebooks')`, type `Ebook`, path prefix `ebooks/`, function names `listEbooks`/`getEbookBySlug`/`uploadEbookImage`.

```ts
import { supabase } from './supabase';
import type { Ebook } from '../types/ebook';
export { slugify, renderPostBody } from './posts';

export async function listEbooks(): Promise<Ebook[]> {
  const { data, error } = await supabase
    .from('ebooks').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Ebook[];
}

export async function getEbookBySlug(slug: string): Promise<Ebook | null> {
  const { data, error } = await supabase
    .from('ebooks').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Ebook;
}

export async function uploadEbookImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `ebooks/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npx vitest run` (ensures imports resolve) — Expected: existing suite still green.
```bash
git add src/lib/exhibitions.ts src/lib/media.ts src/lib/ebooks.ts
git commit -m "feat(insights): data-access libs"
```

---

## Phase 2 — Migrate existing items

### Task 2.1: Seed script that emits the seed migration

**Files:**
- Create: `scripts/seed-insights.mjs`
- Emits: `supabase/migrations/0031_seed_insights.sql`

The script imports the source arrays from `src/data/site-content.ts`, converts each item's `blocks` to Markdown, matches `card_date` from the card arrays by slug, and writes idempotent `insert … on conflict (slug) do update` statements. Run with `npx tsx` (one-off dev dep, like `import-blog.mjs` used `cheerio`/`turndown`). Must run **before** Task 5.1 removes the detail arrays.

- [ ] **Step 1: Install the one-off TS runner**

Run: `npm i -D tsx`

- [ ] **Step 2: Write `scripts/seed-insights.mjs`**

```js
// One-off: read the static insight arrays from src/data/site-content.ts,
// convert blocks -> Markdown, and emit an idempotent seed migration.
//   npx tsx scripts/seed-insights.mjs
import { writeFileSync } from 'node:fs';
import {
  exhibitionDetails, mediaDetails, ebookDetails,
  insightsExhibitionsItems,
} from '../src/data/site-content.ts';

const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);

// Convert the simple ContentBlock[] used by these items to Markdown.
function blocksToMarkdown(blocks = []) {
  const out = [];
  for (const b of blocks) {
    if (b.kind === 'paragraph') out.push(b.text);
    else if (b.kind === 'heading') out.push(`## ${b.text}`);
    else if (b.kind === 'list') out.push(b.items.map((i) => `- ${i}`).join('\n'));
    else throw new Error(`Unhandled block kind in seed: ${b.kind}`);
  }
  return out.join('\n\n');
}

// card_date: the short label on the list card, matched by slug from its href.
const cardDateBySlug = Object.fromEntries(
  insightsExhibitionsItems
    .filter((i) => i.href)
    .map((i) => [i.href.replace(/\/$/, '').split('/').pop(), i.date ?? null]),
);

const lines = ['-- Emitted by scripts/seed-insights.mjs — do not hand-edit.', ''];

lines.push('insert into public.exhibitions (slug,title,excerpt,body,event_date,card_date,venue,stand,image,image_alt) values');
lines.push(exhibitionDetails.map((e) => `(${[
  q(e.slug), q(e.title), q(e.excerpt), q(blocksToMarkdown(e.blocks)),
  q(e.date), q(cardDateBySlug[e.slug] ?? null), q(e.venue ?? null),
  q(e.stand ?? null), q(e.image ?? null), q(e.imageAlt ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, event_date=excluded.event_date, card_date=excluded.card_date, venue=excluded.venue, stand=excluded.stand, image=excluded.image, image_alt=excluded.image_alt;', '');

lines.push('insert into public.media (slug,title,excerpt,body,video_url,poster_image,image_alt) values');
lines.push(mediaDetails.map((m) => `(${[
  q(m.slug), q(m.title), q(m.excerpt), q(blocksToMarkdown(m.blocks)),
  q(m.videoUrl), q(m.posterImage ?? null), q(m.imageAlt ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, video_url=excluded.video_url, poster_image=excluded.poster_image, image_alt=excluded.image_alt;', '');

lines.push('insert into public.ebooks (slug,title,excerpt,body,year,cover_image,image_alt,download_url) values');
lines.push(ebookDetails.map((b) => `(${[
  q(b.slug), q(b.title), q(b.excerpt), q(blocksToMarkdown(b.blocks)),
  q(b.year ?? null), q(b.coverImage ?? null), q(b.imageAlt ?? null), q(b.downloadUrl ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, year=excluded.year, cover_image=excluded.cover_image, image_alt=excluded.image_alt, download_url=excluded.download_url;', '');

writeFileSync('supabase/migrations/0031_seed_insights.sql', lines.join('\n'));
console.log('Wrote supabase/migrations/0031_seed_insights.sql');
```

- [ ] **Step 3: Generate the migration**

Run: `npx tsx scripts/seed-insights.mjs`
Expected: prints `Wrote supabase/migrations/0031_seed_insights.sql`. Open the file and sanity-check: 6 exhibition rows, 3 media rows, 2 ebook rows; quotes inside text doubled correctly.

- [ ] **Step 4: Apply the seed migration via the Management API**

Same Python pattern as Task 0.5, for `0031_seed_insights`. Then verify:
`select count(*) from exhibitions;` → 6, `media` → 3, `ebooks` → 2.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-insights.mjs supabase/migrations/0031_seed_insights.sql package.json package-lock.json
git commit -m "feat(insights): seed migration for the existing 11 items"
```

---

## Phase 3 — Public pages read from the DB

### Task 3.1: Exhibitions detail component + pages

**Files:**
- Modify: `src/components/insights/ExhibitionDetail.astro`
- Modify: `src/pages/insights/exhibitions/index.astro`
- Modify: `src/pages/insights/exhibitions/[slug].astro`

- [ ] **Step 1: Rewrite `ExhibitionDetail.astro`** to accept the DB row and render Markdown body

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import { renderPostBody } from '../../lib/posts';
import type { Exhibition } from '../../types/exhibition';

interface Props { exhibition: Exhibition; }
const { exhibition } = Astro.props;
const bodyHtml = renderPostBody(exhibition.body ?? '');
---
<BaseLayout title={exhibition.title} description={exhibition.excerpt}>
  <PageHero title={exhibition.title} eyebrow="Insights · Exhibitions" />

  <article class="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 space-y-6">
    <div data-reveal class="flex items-center gap-3 flex-wrap border-b border-ink/10 pb-6">
      <span class="inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-medium border rounded-sm bg-brand-500/10 text-brand-500 border-brand-500/30">
        {exhibition.event_date}
      </span>
      {exhibition.venue && <span class="text-xs uppercase tracking-widest text-ink/60">{exhibition.venue}</span>}
      {exhibition.stand && (
        <>
          <span aria-hidden="true" class="h-px w-6 bg-ink/20"></span>
          <span class="text-xs uppercase tracking-widest font-medium text-ink/80">{exhibition.stand}</span>
        </>
      )}
    </div>

    {exhibition.image && (
      <figure data-reveal class="my-8">
        <div class="overflow-hidden bg-brand-500/5 aspect-video">
          <img src={exhibition.image} alt={exhibition.image_alt ?? ''} loading="eager" class="w-full h-full object-cover" />
        </div>
      </figure>
    )}

    <div class="prose prose-elysee max-w-none" set:html={bodyHtml}></div>

    <nav aria-label="Back to exhibitions" class="pt-8 mt-8 border-t border-ink/10">
      <a href="/insights/exhibitions/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
        <span aria-hidden="true">←</span> Back to Exhibitions
      </a>
    </nav>
  </article>
</BaseLayout>
```

(If `prose prose-elysee` classes aren't defined in this project, render with the same wrapper `ContentBlocks` used — a plain `<div class="space-y-4 text-ink/80 leading-relaxed" set:html={bodyHtml}>`. Check `tailwind`/global CSS for a `.prose` rule before choosing; default to the plain wrapper if absent.)

- [ ] **Step 2: Rewrite `exhibitions/index.astro`**

```astro
---
export const prerender = false;
import ListPageLayout from '../../../layouts/ListPageLayout.astro';
import { listExhibitions } from '../../../lib/exhibitions';
import { exhibitionToCard } from '../../../lib/insights-cards';
import { insightsExhibitionsItems } from '../../../data/site-content';

Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');

let items;
const rows = await listExhibitions();
if (rows.length > 0) {
  items = rows.map(exhibitionToCard);
} else {
  items = insightsExhibitionsItems; // offline fallback
}
---
<ListPageLayout
  title="Exhibitions"
  eyebrow="Insights"
  subtitle="Where to meet Elysée — trade fairs and exhibitions across the group."
  items={items}
/>
```

- [ ] **Step 3: Rewrite `exhibitions/[slug].astro`**

```astro
---
export const prerender = false;
import ExhibitionDetail from '../../../components/insights/ExhibitionDetail.astro';
import { getExhibitionBySlug } from '../../../lib/exhibitions';

Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');

const { slug } = Astro.params;
const exhibition = slug ? await getExhibitionBySlug(slug) : null;
if (!exhibition) return Astro.redirect('/insights/exhibitions/', 302);
---
<ExhibitionDetail exhibition={exhibition} />
```

- [ ] **Step 4: Build + smoke**

Run: `npx astro build` — Expected: `/insights/exhibitions` builds (now an on-demand function, no `file not created` errors for the slug routes). No reference to the old `exhibitionDetails`/`ContentBlocks` import remains in these three files.

- [ ] **Step 5: Commit**

```bash
git add src/components/insights/ExhibitionDetail.astro src/pages/insights/exhibitions/index.astro src/pages/insights/exhibitions/[slug].astro
git commit -m "feat(insights): exhibitions pages read from DB"
```

### Task 3.2: Media detail component + pages

**Files:**
- Modify: `src/components/insights/MediaDetail.astro`, `src/pages/insights/media/index.astro`, `[slug].astro`

- [ ] **Step 1: Rewrite `MediaDetail.astro`** (keep the iframe; swap blocks → Markdown body; props become `Media`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import { renderPostBody } from '../../lib/posts';
import type { Media } from '../../types/media';

interface Props { media: Media; }
const { media } = Astro.props;
const bodyHtml = renderPostBody(media.body ?? '');
---
<BaseLayout title={media.title} description={media.excerpt} ogImage={media.poster_image}>
  <PageHero title={media.title} eyebrow="Insights · Media" />
  <article class="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 space-y-6">
    <figure data-reveal class="overflow-hidden bg-ink/5 rounded-sm aspect-video">
      <iframe src={media.video_url} title={media.title} loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen class="w-full h-full border-0"></iframe>
    </figure>
    <div class="space-y-4 text-ink/80 leading-relaxed" set:html={bodyHtml}></div>
    <nav aria-label="Back to media" class="pt-8 mt-8 border-t border-ink/10">
      <a href="/insights/media/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
        <span aria-hidden="true">←</span> Back to Media
      </a>
    </nav>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Rewrite `media/index.astro`** — copy Task 3.1 Step 2, swapping: `listMedia`/`mediaToCard`/`insightsMediaItems`, title `"Media"`, subtitle `"Videos, photographs, and broadcast coverage featuring Elysée."`.

- [ ] **Step 3: Rewrite `media/[slug].astro`** — copy Task 3.1 Step 3, swapping: `MediaDetail`, `getMediaBySlug`, redirect `/insights/media/`, prop name `media`.

- [ ] **Step 4: Build + commit**

Run: `npx astro build` — Expected: green.
```bash
git add src/components/insights/MediaDetail.astro src/pages/insights/media/index.astro src/pages/insights/media/[slug].astro
git commit -m "feat(insights): media pages read from DB"
```

### Task 3.3: eBook detail component + pages

**Files:**
- Modify: `src/components/insights/EbookDetail.astro`, `src/pages/insights/ebooks/index.astro`, `[slug].astro`

- [ ] **Step 1: Rewrite `EbookDetail.astro`** (keep cover + download/Request CTA; swap blocks → Markdown body; props become `Ebook`; `coverImage`→`cover_image`, `imageAlt`→`image_alt`, `downloadUrl`→`download_url`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import { renderPostBody } from '../../lib/posts';
import type { Ebook } from '../../types/ebook';

interface Props { ebook: Ebook; }
const { ebook } = Astro.props;
const bodyHtml = renderPostBody(ebook.body ?? '');
---
<BaseLayout title={ebook.title} description={ebook.excerpt} ogImage={ebook.cover_image}>
  <PageHero title={ebook.title} eyebrow="Insights · eBooks" />
  <article class="mx-auto max-w-screen-lg px-4 md:px-8 py-12 md:py-16">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
      <aside class="md:col-span-4">
        <div class="md:sticky md:top-28 space-y-6">
          {ebook.cover_image && (
            <figure data-reveal class="overflow-hidden bg-brand-500/5 border border-ink/10 rounded-sm aspect-[3/4]">
              <img src={ebook.cover_image} alt={ebook.image_alt ?? `${ebook.title} cover`} loading="eager" class="w-full h-full object-cover" />
            </figure>
          )}
          {ebook.year && <p data-reveal class="text-xs uppercase tracking-widest text-ink/60">Published {ebook.year}</p>}
          {ebook.download_url ? (
            <a data-reveal href={ebook.download_url} download class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-surface text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200">Download PDF</a>
          ) : (
            <a data-reveal href="/contact/local/" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-surface text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200">Request a copy</a>
          )}
        </div>
      </aside>
      <div class="md:col-span-8 space-y-6">
        <div class="space-y-4 text-ink/80 leading-relaxed" set:html={bodyHtml}></div>
        <nav aria-label="Back to eBooks" class="pt-8 mt-8 border-t border-ink/10">
          <a href="/insights/ebooks/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
            <span aria-hidden="true">←</span> Back to eBooks
          </a>
        </nav>
      </div>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Rewrite `ebooks/index.astro`** — copy Task 3.1 Step 2, swapping: `listEbooks`/`ebookToCard`/`insightsEbooksItems`, title `"eBooks"`, subtitle `"Reports, guides and publications from Elysée."`.

- [ ] **Step 3: Rewrite `ebooks/[slug].astro`** — copy Task 3.1 Step 3, swapping: `EbookDetail`, `getEbookBySlug`, redirect `/insights/ebooks/`, prop name `ebook`.

- [ ] **Step 4: Build + commit**

Run: `npx astro build` — Expected: green.
```bash
git add src/components/insights/EbookDetail.astro src/pages/insights/ebooks/index.astro src/pages/insights/ebooks/[slug].astro
git commit -m "feat(insights): ebooks pages read from DB"
```

---

## Phase 4 — Admin dashboard

For each type: a Tab (list + create/edit/publish/delete) and a Form. Both are close clones of `NewsTab.tsx` / `NewsForm.tsx` **minus** the `FeaturedToggle`/`author`/`published_at`/`reading_minutes` machinery (these types have no home-featured or author concept). Build Exhibitions in full; Media and eBooks copy it with the field deltas listed.

### Task 4.1: Exhibitions tab + form

**Files:**
- Create: `src/components/admin/ExhibitionsTab.tsx`, `src/components/admin/ExhibitionForm.tsx`

- [ ] **Step 1: Write `ExhibitionsTab.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Exhibition } from '../../types/exhibition';
import ExhibitionForm from './ExhibitionForm';
import { triggerPublish } from '../../lib/publish';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; row: Exhibition };

export default function ExhibitionsTab() {
  const [items, setItems] = useState<Exhibition[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('exhibitions').select('*').order('created_at', { ascending: false });
    if (err) return setError(err.message);
    setItems((data ?? []) as Exhibition[]);
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (row: Exhibition) => {
    const { error: err } = await supabase.from('exhibitions')
      .update({ is_published: !row.is_published }).eq('id', row.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };
  const remove = async (row: Exhibition) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('exhibitions').delete().eq('id', row.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      {mode.kind === 'list' && (
        <>
          <div className="mb-6">
            <button type="button" onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer">
              + New exhibition
            </button>
          </div>
          {items === null ? <p className="text-sm text-ink/60">Loading…</p>
            : items.length === 0 ? <p className="text-sm text-ink/60">No exhibitions yet. Create the first one.</p>
            : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-b border-ink/5 last:border-b-0">
                      <td className="px-4 py-3 text-ink">{a.title}</td>
                      <td className="px-4 py-3 text-ink/75">{a.card_date ?? a.event_date}</td>
                      <td className="px-4 py-3">
                        <span className={a.is_published ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700' : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'}>
                          {a.is_published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                          <button onClick={() => setMode({ kind: 'edit', row: a })} className="text-ink/70 hover:text-brand-500 cursor-pointer">Edit</button>
                          <button onClick={() => togglePublish(a)} className="text-ink/70 hover:text-brand-500 cursor-pointer">{a.is_published ? 'Unpublish' : 'Publish'}</button>
                          <button onClick={() => remove(a)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {(mode.kind === 'create' || mode.kind === 'edit') && (
        <ExhibitionForm
          initial={mode.kind === 'edit' ? mode.row : undefined}
          onSaved={async () => { setMode({ kind: 'list' }); await load(); triggerPublish(); }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Write `ExhibitionForm.tsx`** (modeled on `NewsForm.tsx`; reuse its `Field`/`inputClass` helpers verbatim at the bottom)

```tsx
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import MarkdownEditor from './MarkdownEditor';
import { slugify, uploadExhibitionImage } from '../../lib/exhibitions';
import type { Exhibition, ExhibitionDraft } from '../../types/exhibition';
import { triggerPublish } from '../../lib/publish';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

type Props = { initial?: Exhibition; onSaved: () => void; onCancel: () => void };

function emptyDraft(): ExhibitionDraft {
  return { slug: '', title: '', excerpt: '', body: '', event_date: '', card_date: null,
    venue: null, stand: null, image: null, image_alt: null, is_published: true };
}
function toDraft(a: Exhibition): ExhibitionDraft {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = a; return rest;
}

export default function ExhibitionForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<ExhibitionDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const update = <K extends keyof ExhibitionDraft>(k: K, v: ExhibitionDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const onTitleBlur = () => { if (draft.slug.trim() === '' && draft.title.trim() !== '') update('slug', slugify(draft.title)); };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null; if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) { setError('Image must be JPEG, PNG or WebP.'); e.target.value = ''; return; }
    if (f.size > MAX_BYTES) { setError('Image must be 4 MB or smaller.'); e.target.value = ''; return; }
    setPendingFile(f); setPreviewUrl(URL.createObjectURL(f));
  };
  const removeImage = () => { setPendingFile(null); setPreviewUrl(null); update('image', null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    try {
      const slug = slugify(draft.slug.trim()) || slugify(draft.title.trim());
      if (!slug) throw new Error('Slug is required.');
      const payload: ExhibitionDraft = {
        ...draft, slug,
        card_date: draft.card_date?.trim() || null,
        venue: draft.venue?.trim() || null,
        stand: draft.stand?.trim() || null,
        image_alt: draft.image_alt?.trim() || null,
      };
      let row: Exhibition;
      if (initial) {
        const { data, error: err } = await supabase.from('exhibitions').update(payload).eq('id', initial.id).select().single();
        if (err) throw err; row = data as Exhibition;
      } else {
        const { data, error: err } = await supabase.from('exhibitions').insert(payload).select().single();
        if (err) throw err; row = data as Exhibition;
      }
      if (pendingFile) {
        const { url } = await uploadExhibitionImage(pendingFile, row.id);
        const { error: err } = await supabase.from('exhibitions').update({ image: url }).eq('id', row.id);
        if (err) throw err;
      }
      triggerPublish(); onSaved();
    } catch (err) { setError((err as Error).message); } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">{initial ? 'Edit exhibition' : 'New exhibition'}</h2>
        <button type="button" onClick={onCancel} className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer">Cancel</button>
      </header>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">{error}</p>}

      <Field label="Title" required><input type="text" required value={draft.title} onChange={(e) => update('title', e.currentTarget.value)} onBlur={onTitleBlur} className={inputClass} /></Field>
      <Field label="Slug" required hint="Lowercase letters, digits, hyphens. Used in the URL."><input type="text" required pattern="[a-z0-9-]+" value={draft.slug} onChange={(e) => update('slug', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Event date" required hint="Full human date, e.g. 10–14 November 2026."><input type="text" required value={draft.event_date} onChange={(e) => update('event_date', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Card date" hint="Short label for the list card, e.g. Nov 2026. Defaults to the event date."><input type="text" value={draft.card_date ?? ''} onChange={(e) => update('card_date', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Venue" hint="e.g. Fiere Expo Center, Bologna."><input type="text" value={draft.venue ?? ''} onChange={(e) => update('venue', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Stand" hint="e.g. Hall 21, Stand B28."><input type="text" value={draft.stand ?? ''} onChange={(e) => update('stand', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Excerpt" required hint="Shown on the list card."><textarea required rows={2} maxLength={300} value={draft.excerpt} onChange={(e) => update('excerpt', e.currentTarget.value)} className={`${inputClass} resize-y`} /></Field>
      <Field label="Image" hint="JPEG, PNG, or WebP. Max 4 MB. Optional.">
        <div className="mt-2 flex items-center gap-4">
          {previewUrl ? <div className="relative w-40 aspect-video bg-surface-alt rounded overflow-hidden border border-ink/10"><img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>
            : <div className="w-40 aspect-video bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center"><span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No image</span></div>}
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="text-sm text-ink/80" />
            {(previewUrl || pendingFile) && <button type="button" onClick={removeImage} className="text-[11px] uppercase tracking-[0.25em] text-red-600 hover:text-red-800 cursor-pointer text-left">Remove</button>}
          </div>
        </div>
      </Field>
      <Field label="Image alt" hint="Describe the image for screen readers."><input type="text" value={draft.image_alt ?? ''} onChange={(e) => update('image_alt', e.currentTarget.value)} className={inputClass} /></Field>
      <Field label="Body" hint="Markdown supported (headings ##, lists, links, **bold**)."><MarkdownEditor rows={12} value={draft.body} onChange={(v) => update('body', v)} className={`${inputClass} font-mono resize-y`} /></Field>
      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_published} onChange={(e) => update('is_published', e.currentTarget.checked)} /><span className="text-sm text-ink/85">Published</span></label>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create exhibition'}
        </button>
      </div>
    </form>
  );
}

const inputClass = 'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">{label}{required && <span className="text-brand-500"> *</span>}</span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
```

- [ ] **Step 3: Build + commit**

Run: `npx astro build` — Expected: green (component compiles; not yet wired into Dashboard).
```bash
git add src/components/admin/ExhibitionsTab.tsx src/components/admin/ExhibitionForm.tsx
git commit -m "feat(insights): exhibitions admin tab + form"
```

### Task 4.2: Media tab + form

**Files:**
- Create: `src/components/admin/MediaTab.tsx`, `src/components/admin/MediaForm.tsx`

- [ ] **Step 1:** Copy `ExhibitionsTab.tsx` → `MediaTab.tsx`. Replace: type `Exhibition`→`Media`, import `ExhibitionForm`→`MediaForm`, all `from('exhibitions')`→`from('media')`, button "+ New exhibition"→"+ New video", empty text "No exhibitions yet."→"No videos yet.". Change the table's Date column to a **Video** column showing `a.video_url` truncated, or simply drop the second column and keep Title/Status/Actions.

- [ ] **Step 2:** Copy `ExhibitionForm.tsx` → `MediaForm.tsx`. Apply these deltas:
  - Imports: `uploadExhibitionImage`→`uploadMediaImage` from `'../../lib/media'`; types `Media, MediaDraft`.
  - `emptyDraft()` returns: `{ slug:'', title:'', excerpt:'', body:'', video_url:'', poster_image:null, image_alt:null, is_published:true }`.
  - `previewUrl` initial: `initial?.poster_image ?? null`. `removeImage` sets `update('poster_image', null)`.
  - Replace the Event date / Card date / Venue / Stand fields with a single **required** field:
    ```tsx
    <Field label="YouTube embed URL" required hint="Use the embed form: https://www.youtube.com/embed/VIDEO_ID">
      <input type="url" required value={draft.video_url} onChange={(e) => update('video_url', e.currentTarget.value)} className={inputClass} />
    </Field>
    ```
  - Image field label "Image"→"Poster image"; on submit upload, set `{ poster_image: url }` instead of `{ image: url }`.
  - `payload` trims: `poster_image` stays as-is, `image_alt: draft.image_alt?.trim() || null`. (Remove the venue/stand/card_date trims.)
  - Header/button text: "exhibition"→"video".

- [ ] **Step 3: Build + commit**

Run: `npx astro build` — Expected: green.
```bash
git add src/components/admin/MediaTab.tsx src/components/admin/MediaForm.tsx
git commit -m "feat(insights): media admin tab + form"
```

### Task 4.3: eBooks tab + form

**Files:**
- Create: `src/components/admin/EbooksTab.tsx`, `src/components/admin/EbookForm.tsx`

- [ ] **Step 1:** Copy `ExhibitionsTab.tsx` → `EbooksTab.tsx`. Replace: `Exhibition`→`Ebook`, `ExhibitionForm`→`EbookForm`, `from('exhibitions')`→`from('ebooks')`, "+ New exhibition"→"+ New eBook", "No exhibitions yet."→"No eBooks yet.". Date column → **Year** column showing `a.year ?? '—'`.

- [ ] **Step 2:** Copy `ExhibitionForm.tsx` → `EbookForm.tsx`. Apply these deltas:
  - Imports: `uploadEbookImage` from `'../../lib/ebooks'`; types `Ebook, EbookDraft`.
  - `emptyDraft()` returns: `{ slug:'', title:'', excerpt:'', body:'', year:null, cover_image:null, image_alt:null, download_url:null, is_published:true }`.
  - `previewUrl` initial: `initial?.cover_image ?? null`. `removeImage` sets `update('cover_image', null)`.
  - Replace Event date / Card date / Venue / Stand with:
    ```tsx
    <Field label="Year" hint="e.g. 2021."><input type="text" value={draft.year ?? ''} onChange={(e) => update('year', e.currentTarget.value)} className={inputClass} /></Field>
    <Field label="Download URL" hint="External PDF link. Leave blank to show a “Request a copy” button."><input type="url" value={draft.download_url ?? ''} onChange={(e) => update('download_url', e.currentTarget.value)} className={inputClass} /></Field>
    ```
  - Image field label "Image"→"Cover image"; upload sets `{ cover_image: url }`.
  - `payload` trims: `year: draft.year?.trim() || null`, `download_url: draft.download_url?.trim() || null`, `image_alt: draft.image_alt?.trim() || null`.
  - Header/button text: "exhibition"→"eBook".

- [ ] **Step 3: Build + commit**

Run: `npx astro build` — Expected: green.
```bash
git add src/components/admin/EbooksTab.tsx src/components/admin/EbookForm.tsx
git commit -m "feat(insights): ebooks admin tab + form"
```

### Task 4.4: Register the three tabs in the dashboard

**Files:**
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Add imports** near the other tab imports (after `import NewsTab from './NewsTab';`):

```tsx
import ExhibitionsTab from './ExhibitionsTab';
import MediaTab from './MediaTab';
import EbooksTab from './EbooksTab';
```

- [ ] **Step 2: Extend the `Tab` union** (line ~18) to include `'exhibitions' | 'media' | 'ebooks'`.

- [ ] **Step 3: Add `HEADINGS` entries:**

```tsx
exhibitions: 'Exhibitions.',
media: 'Media.',
ebooks: 'eBooks.',
```

- [ ] **Step 4: Update the `GROUPS` "Blog & News" group** — rename its `label` to `'Insights'` and extend `items`:

```tsx
{
  label: 'Insights',
  items: [
    { id: 'posts', label: 'Posts' },
    { id: 'news', label: 'News' },
    { id: 'exhibitions', label: 'Exhibitions' },
    { id: 'media', label: 'Media' },
    { id: 'ebooks', label: 'eBooks' },
  ],
},
```

- [ ] **Step 5: Add render branches** beside `{tab === 'news' && <NewsTab />}`:

```tsx
{tab === 'exhibitions' && <ExhibitionsTab />}
{tab === 'media' && <MediaTab />}
{tab === 'ebooks' && <EbooksTab />}
```

- [ ] **Step 6: Build + commit**

Run: `npx astro build` — Expected: green.
```bash
git add src/components/admin/Dashboard.tsx
git commit -m "feat(insights): register Exhibitions/Media/eBooks tabs"
```

---

## Phase 5 — Cleanup & verification

### Task 5.1: Remove the detail arrays + interfaces from site-content.ts

**Files:**
- Modify: `src/data/site-content.ts`

Keep `insightsExhibitionsItems`, `insightsMediaItems`, `insightsEbooksItems` (fallbacks). Remove only the now-unused detail data + types.

- [ ] **Step 1: Confirm nothing else imports the detail symbols**

Run: `grep -rn "exhibitionDetails\|mediaDetails\|ebookDetails\|ExhibitionDetail\b\|MediaDetail\b\|EbookDetail\b" src --include=*.astro --include=*.ts --include=*.tsx`
Expected: only the `*Detail.astro` component definitions (which now import row types from `src/types`, not these) and the old `[slug].astro` should already be rewritten. There should be **no** remaining import of `exhibitionDetails`/`mediaDetails`/`ebookDetails`.

- [ ] **Step 2: Delete the three `export const *Details = [...]` arrays** and the three `export interface ExhibitionDetail/MediaDetail/EbookDetail {...}` blocks from `src/data/site-content.ts`. Leave the card arrays and `InsightItem` intact.

- [ ] **Step 3: Build + full test**

Run: `npx astro build && npx vitest run`
Expected: both green. No "exhibitionDetails is not exported" errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/site-content.ts
git commit -m "refactor(insights): retire static detail arrays (DB is source of truth)"
```

### Task 5.2: End-to-end verification

**Files:** none

- [ ] **Step 1: Full build + test suite**

Run: `npx astro build && npx vitest run`
Expected: build completes; `/insights/exhibitions`, `/media`, `/ebooks` and their `[slug]` routes are emitted as on-demand functions; all tests pass.

- [ ] **Step 2: Manual smoke (dev server)**

Run: `npm run dev`, then verify:
- `/insights/exhibitions/`, `/insights/media/`, `/insights/ebooks/` each show the seeded cards (6 / 3 / 2).
- A detail URL (e.g. `/insights/media/elysee-40-year-anniversary-event/`) renders with the video player; an exhibition detail shows date/venue/stand; an eBook shows the cover + Download/Request CTA.
- `/admin` → Insights group shows Exhibitions, Media, eBooks tabs; create a test row in each, confirm it appears on the public page, edit it, unpublish it (disappears), delete it.

- [ ] **Step 3: Confirm old detail URLs still resolve** — every seeded slug matches its previous `/insights/<type>/<slug>/` URL, so existing links keep working.

---

## Self-review notes (for the implementer)

- **`.prose` classes:** Task 3.1 Step 1 flags this — confirm whether the project defines `.prose` (search global CSS / `tailwind` config). The eBook/Media tasks already use the plain `space-y-4 …` wrapper; use the same for exhibitions if `.prose` is absent.
- **`triggerPublish()`** is called on writes for parity with News, but these pages read live (no rebuild needed); it's a harmless no-op unless a deploy hook is configured. Keep it for consistency.
- **Run order matters:** the seed script (Phase 2) must run before Task 5.1 deletes the source arrays.
- **Service-role key & project ref:** Phase 0.5 / 2.4 apply SQL via the Management API; supply `SUPABASE_PROJECT_REF` and `SUPABASE_ACCESS_TOKEN` at runtime (not committed).
