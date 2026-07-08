-- public.research_posts: backing table for the admin R&D dashboard. Mirrors
-- public.posts / public.news (Blog / News), kept as its own table so the
-- Research & Development section stays an independent, dashboard-managed
-- listing published at /innovation/research-development/.
create table if not exists public.research_posts (
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

create index if not exists research_posts_published_published_at_idx
  on public.research_posts (is_published, published_at desc);

-- Reuse the set_updated_at() trigger function created in 0001_jobs.sql.
drop trigger if exists set_research_posts_updated_at on public.research_posts;
create trigger set_research_posts_updated_at
  before update on public.research_posts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.research_posts enable row level security;

drop policy if exists "public read published research_posts" on public.research_posts;
create policy "public read published research_posts"
on public.research_posts for select
to anon, authenticated
using (is_published = true);

drop policy if exists "authenticated full access on research_posts" on public.research_posts;
create policy "authenticated full access on research_posts"
on public.research_posts for all
to authenticated
using (true) with check (true);

-- Storage: bucket for R&D cover images.
insert into storage.buckets (id, name, public)
values ('research-covers', 'research-covers', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read research-covers" on storage.objects;
create policy "public read research-covers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'research-covers');

drop policy if exists "authenticated write research-covers" on storage.objects;
create policy "authenticated write research-covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'research-covers');

drop policy if exists "authenticated update research-covers" on storage.objects;
create policy "authenticated update research-covers"
on storage.objects for update to authenticated
using (bucket_id = 'research-covers');

drop policy if exists "authenticated delete research-covers" on storage.objects;
create policy "authenticated delete research-covers"
on storage.objects for delete to authenticated
using (bucket_id = 'research-covers');

-- Seed: two illustrative starter entries so the page isn't empty on first
-- deploy. Body starts as the excerpt; editors flesh it out (or delete these)
-- in the dashboard. Idempotent — only seeds when the table is empty.
insert into public.research_posts (slug, title, excerpt, body, published_at, reading_minutes)
select * from (values
  ('advancing-sustainable-polymer-research',
   'Advancing Sustainable Polymer Research',
   'Our R&D team is developing next-generation polymer formulations that cut material use while extending product life — part of Elysée''s ongoing commitment to greener piping systems.',
   'Our R&D team is developing next-generation polymer formulations that cut material use while extending product life — part of Elysée''s ongoing commitment to greener piping systems.',
   now(), 1),
  ('prototyping-and-advanced-metrology',
   'From Concept to Prototype: Inside Our Metrology Lab',
   'A look at how Elysée moves an idea from concept generation through proof of concept, prototyping, and verification using advanced metrology systems.',
   'A look at how Elysée moves an idea from concept generation through proof of concept, prototyping, and verification using advanced metrology systems.',
   now() - interval '14 days', 1)
) as seed(slug, title, excerpt, body, published_at, reading_minutes)
where not exists (select 1 from public.research_posts);
