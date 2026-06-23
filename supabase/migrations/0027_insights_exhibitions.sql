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
