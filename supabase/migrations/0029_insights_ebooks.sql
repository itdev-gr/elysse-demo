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
