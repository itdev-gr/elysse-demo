-- public.catalogues: backing table for the admin catalogues dashboard.
-- Top-level rows (parent_id is null) are categories; rows with a parent_id
-- are subcategories. Both levels can carry a downloadable PDF.
create table if not exists public.catalogues (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.catalogues(id) on delete cascade,
  name        text not null,
  description text,
  pdf_url     text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists catalogues_parent_sort_idx
  on public.catalogues (parent_id, sort_order, name);

-- Reuse the set_updated_at() trigger function from 0001_jobs.sql.
drop trigger if exists set_catalogues_updated_at on public.catalogues;
create trigger set_catalogues_updated_at
  before update on public.catalogues
  for each row execute function public.set_updated_at();

-- RLS
alter table public.catalogues enable row level security;

drop policy if exists "public read active catalogues" on public.catalogues;
create policy "public read active catalogues"
on public.catalogues for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on catalogues" on public.catalogues;
create policy "authenticated full access on catalogues"
on public.catalogues for all
to authenticated
using (true) with check (true);

-- Storage: bucket for catalogue PDFs.
insert into storage.buckets (id, name, public)
values ('catalogues', 'catalogues', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read catalogues" on storage.objects;
create policy "public read catalogues"
on storage.objects for select to anon, authenticated
using (bucket_id = 'catalogues');

drop policy if exists "authenticated write catalogues" on storage.objects;
create policy "authenticated write catalogues"
on storage.objects for insert to authenticated
with check (bucket_id = 'catalogues');

drop policy if exists "authenticated update catalogues" on storage.objects;
create policy "authenticated update catalogues"
on storage.objects for update to authenticated
using (bucket_id = 'catalogues');

drop policy if exists "authenticated delete catalogues" on storage.objects;
create policy "authenticated delete catalogues"
on storage.objects for delete to authenticated
using (bucket_id = 'catalogues');

-- Seed: the 10 catalogue sections from elysee.com.cy/catalogues-leaflets-en,
-- with their live PDF links. Idempotent: skips if any rows exist.
insert into public.catalogues (name, description, pdf_url, sort_order)
select * from (values
  ('A — Compression Fittings', 'Technical catalogue for the Compression Fittings range.',
   'https://elysee.com.cy/uploads/originals/249/section-a-njVxM.pdf', 1),
  ('B — Hydraulic Fittings', 'Technical catalogue for the Hydraulic Fittings range.',
   'https://elysee.com.cy/uploads/originals/249/section-b-CFBt4.pdf', 2),
  ('C — Saddles', 'Technical catalogue for the Saddles range.',
   'https://elysee.com.cy/uploads/originals/249/section-c-zFYDM.pdf', 3),
  ('D — Light-Weight Fittings', 'Technical manual for landscape and irrigation systems.',
   'https://elysee.com.cy/uploads/originals/249/for-internettechnical-manual-landscape-and-irrigation-system-nov-2026.pdf', 4),
  ('E — Valves', 'Technical catalogue for the Valves range.',
   'https://elysee.com.cy/uploads/originals/249/section-e-UBjyk.pdf', 5),
  ('F — Filters & Dosers', 'Technical catalogue for Filters and Dosers.',
   'https://elysee.com.cy/uploads/originals/249/section-f-oCOnw.pdf', 6),
  ('G — Micro Irrigation & Sprinklers', 'Technical catalogue covering micro-irrigation and sprinkler products.',
   'https://elysee.com.cy/uploads/originals/249/section-g-dNhfy.pdf', 7),
  ('H — Turf', 'Technical catalogue for the Turf irrigation range.',
   'https://elysee.com.cy/uploads/originals/249/section-h-3in3L.pdf', 8),
  ('I — Polyethylene Pipes & Soft Hoses', 'Technical catalogue for polyethylene pipes and soft hoses.',
   'https://elysee.com.cy/uploads/originals/249/section-i-MGImH.pdf', 9),
  ('PE — Polyethylene Pipes', 'Technical manual for the full polyethylene pipe range.',
   'https://elysee.com.cy/uploads/originals/249/technical-manual-pe-pipes-MCeVe.pdf', 10)
) as seed(name, description, pdf_url, sort_order)
where not exists (select 1 from public.catalogues);
