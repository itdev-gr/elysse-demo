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
