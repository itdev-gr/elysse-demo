-- 0007_contact.sql
-- Public contact forms write to contact_submissions; the dashboard reads/triages
-- them; an edge function emails the per-source recipient from contact_settings.

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  source      text not null default 'general',
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 320),
  company     text check (company is null or char_length(company) <= 200),
  phone       text check (phone is null or char_length(phone) <= 60),
  message     text not null check (char_length(message) between 1 and 5000),
  page_path   text check (page_path is null or char_length(page_path) <= 300),
  status      text not null default 'new' check (status in ('new','read','archived')),
  notified_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

create table if not exists public.contact_settings (
  source          text primary key,
  label           text not null,
  recipient_email text not null,
  updated_at      timestamptz not null default now()
);

-- Reuses public.set_updated_at() defined in 0001_jobs.sql.
drop trigger if exists set_contact_settings_updated_at on public.contact_settings;
create trigger set_contact_settings_updated_at
  before update on public.contact_settings
  for each row execute function public.set_updated_at();

insert into public.contact_settings (source, label, recipient_email) values
  ('general',   'General enquiries',      'info@elysee.com.cy'),
  ('careers',   'Careers / recruitment',  'recruitment@elysee.com.cy'),
  ('local',     'Local network (Cyprus)', 'info@elysee.com.cy'),
  ('worldwide', 'Worldwide / export',     'info@elysee.com.cy')
on conflict (source) do nothing;

-- RLS: anyone may submit (forms are public). No anonymous read of submissions or
-- settings — protects both the enquirers' details and the recipient addresses.
alter table public.contact_submissions enable row level security;

drop policy if exists "anon insert submissions" on public.contact_submissions;
create policy "anon insert submissions"
on public.contact_submissions for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read submissions" on public.contact_submissions;
create policy "authenticated read submissions"
on public.contact_submissions for select
to authenticated using (true);

drop policy if exists "authenticated update submissions" on public.contact_submissions;
create policy "authenticated update submissions"
on public.contact_submissions for update
to authenticated using (true) with check (true);

drop policy if exists "authenticated delete submissions" on public.contact_submissions;
create policy "authenticated delete submissions"
on public.contact_submissions for delete
to authenticated using (true);

alter table public.contact_settings enable row level security;

drop policy if exists "authenticated manage settings" on public.contact_settings;
create policy "authenticated manage settings"
on public.contact_settings for all
to authenticated using (true) with check (true);
