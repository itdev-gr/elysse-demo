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
