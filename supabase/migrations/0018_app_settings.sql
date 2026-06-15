-- app_settings: small key/value store for dashboard configuration.
-- Currently holds the Vercel Deploy Hook URL used to publish (rebuild) the
-- static site when products/images change. Authenticated-only (not public), so
-- the hook URL never ends up in the public bundle.
create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "authenticated full access on app_settings" on public.app_settings;
create policy "authenticated full access on app_settings"
on public.app_settings for all to authenticated using (true) with check (true);

insert into public.app_settings (key, value) values ('deploy_hook_url', null)
on conflict (key) do nothing;
