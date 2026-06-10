-- public.certifications: backing table for the admin certifications dashboard.
-- cert_group 'green'   -> /green-elysee/certifications/ cards
-- cert_group 'quality' -> /about-us/quality-certifications/ category cards
create table if not exists public.certifications (
  id          uuid primary key default gen_random_uuid(),
  cert_group  text not null check (cert_group in ('green','quality')),
  name        text not null,
  description text not null,
  scope       text,
  tag         text,
  logo        text,
  pdf_url     text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists certifications_group_sort_idx
  on public.certifications (cert_group, sort_order, name);

-- Reuse the set_updated_at() trigger function from 0001_jobs.sql.
drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at
  before update on public.certifications
  for each row execute function public.set_updated_at();

-- RLS
alter table public.certifications enable row level security;

drop policy if exists "public read active certifications" on public.certifications;
create policy "public read active certifications"
on public.certifications for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on certifications" on public.certifications;
create policy "authenticated full access on certifications"
on public.certifications for all
to authenticated
using (true) with check (true);

-- Storage: bucket for certificate PDFs and badge images.
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read certificates" on storage.objects;
create policy "public read certificates"
on storage.objects for select to anon, authenticated
using (bucket_id = 'certificates');

drop policy if exists "authenticated write certificates" on storage.objects;
create policy "authenticated write certificates"
on storage.objects for insert to authenticated
with check (bucket_id = 'certificates');

drop policy if exists "authenticated update certificates" on storage.objects;
create policy "authenticated update certificates"
on storage.objects for update to authenticated
using (bucket_id = 'certificates');

drop policy if exists "authenticated delete certificates" on storage.objects;
create policy "authenticated delete certificates"
on storage.objects for delete to authenticated
using (bucket_id = 'certificates');
