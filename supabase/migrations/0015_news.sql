-- public.news: backing table for the admin News dashboard. Mirrors public.posts
-- (the blog), kept as its own table so News and Blog stay independent sections.
create table if not exists public.news (
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

create index if not exists news_published_published_at_idx
  on public.news (is_published, published_at desc);

-- Reuse the set_updated_at() trigger function created in 0001_jobs.sql.
drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

-- RLS
alter table public.news enable row level security;

drop policy if exists "public read published news" on public.news;
create policy "public read published news"
on public.news for select
to anon, authenticated
using (is_published = true);

drop policy if exists "authenticated full access on news" on public.news;
create policy "authenticated full access on news"
on public.news for all
to authenticated
using (true) with check (true);

-- Storage: bucket for news cover images.
insert into storage.buckets (id, name, public)
values ('news-covers', 'news-covers', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read news-covers" on storage.objects;
create policy "public read news-covers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'news-covers');

drop policy if exists "authenticated write news-covers" on storage.objects;
create policy "authenticated write news-covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'news-covers');

drop policy if exists "authenticated update news-covers" on storage.objects;
create policy "authenticated update news-covers"
on storage.objects for update to authenticated
using (bucket_id = 'news-covers');

drop policy if exists "authenticated delete news-covers" on storage.objects;
create policy "authenticated delete news-covers"
on storage.objects for delete to authenticated
using (bucket_id = 'news-covers');

-- Seed: the current 4 news items (from src/data/site-content.ts). Body starts
-- as the excerpt; editors flesh it out in the dashboard. Idempotent.
insert into public.news (slug, title, excerpt, body, published_at, reading_minutes)
select * from (values
  ('the-ultimate-solution-for-pool-plumbing-zeeflex-fittings',
   'The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings',
   'ZEEFLEX fittings by Elysée offer a reliable, leak-free solution for connecting flexible PVC pool hoses. Designed for 50 mm and 63 mm hoses, they combine easy installation with exceptional durability in demanding pool environments.',
   'ZEEFLEX fittings by Elysée offer a reliable, leak-free solution for connecting flexible PVC pool hoses. Designed for 50 mm and 63 mm hoses, they combine easy installation with exceptional durability in demanding pool environments.',
   now(), 1),
  ('meet-the-new-and-improved-elysee-zero-force-range',
   'Meet the New and Improved Elysée Zero Force Range',
   'The new Elysée Zero Force range (75mm–110mm) has been upgraded with refined technology designed to make pipe installation faster, easier and more efficient. Its innovative semi push-fit system allows installers to insert pipes with zero insertion force after loosening the cap just one turn.',
   'The new Elysée Zero Force range (75mm–110mm) has been upgraded with refined technology designed to make pipe installation faster, easier and more efficient. Its innovative semi push-fit system allows installers to insert pipes with zero insertion force after loosening the cap just one turn.',
   now() - interval '7 days', 1),
  ('the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer',
   'The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer!',
   'The Elysée Global Transition Range offers a universal solution for connecting different pipe materials, eliminating the need for multiple adapters and simplifying installations.',
   'The Elysée Global Transition Range offers a universal solution for connecting different pipe materials, eliminating the need for multiple adapters and simplifying installations.',
   now() - interval '21 days', 1),
  ('elysee-irrigation-certified-as-a-great-place-to-work',
   'Elysée Irrigation Certified as a Great Place To Work®',
   'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment.',
   'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment.',
   now() - interval '35 days', 1)
) as seed(slug, title, excerpt, body, published_at, reading_minutes)
where not exists (select 1 from public.news);
