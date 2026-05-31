-- public.jobs: backing table for the admin jobs dashboard.
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  location        text not null,
  employment_type text not null check (employment_type in
                    ('Full-time','Part-time','Contract','Internship')),
  department      text not null,
  description     text not null,
  salary_range    text,
  deadline        date,
  apply_email     text,
  apply_url       text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists jobs_published_deadline_idx
  on public.jobs (is_published, deadline);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- RLS
alter table public.jobs enable row level security;

drop policy if exists "public read published jobs" on public.jobs;
create policy "public read published jobs"
on public.jobs for select
to anon, authenticated
using (
  is_published = true
  and (deadline is null or deadline >= current_date)
);

drop policy if exists "authenticated full access" on public.jobs;
create policy "authenticated full access"
on public.jobs for all
to authenticated
using (true) with check (true);
