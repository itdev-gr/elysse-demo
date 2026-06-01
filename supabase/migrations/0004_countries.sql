-- public.countries: backing table for the admin countries dashboard.
create table if not exists public.countries (
  code              text primary key
                      check (code ~ '^[a-z]{2}$'),
  country           text not null,
  label             text not null,
  kind              text not null
                      check (kind in ('subsidiary','partner')),
  lat               numeric(7,4) not null
                      check (lat between -90 and 90),
  lng               numeric(8,4) not null
                      check (lng between -180 and 180),
  nudge_x           numeric(5,2),
  nudge_y           numeric(5,2),
  address           text not null,
  phone             text not null,
  email             text not null,
  website           text,
  note              text,
  prefilled_message text not null,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Reuse the set_updated_at() trigger function from 0001_jobs.sql.
drop trigger if exists set_countries_updated_at on public.countries;
create trigger set_countries_updated_at
  before update on public.countries
  for each row execute function public.set_updated_at();

-- RLS
alter table public.countries enable row level security;

drop policy if exists "public read active countries" on public.countries;
create policy "public read active countries"
on public.countries for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on countries" on public.countries;
create policy "authenticated full access on countries"
on public.countries for all
to authenticated
using (true) with check (true);
