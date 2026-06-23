-- Shared public bucket for insights imagery (type-prefixed paths:
-- exhibitions/<id>/..., media/<id>/..., ebooks/<id>/...).
insert into storage.buckets (id, name, public)
values ('insights', 'insights', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read insights" on storage.objects;
create policy "public read insights"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'insights');

drop policy if exists "authenticated write insights" on storage.objects;
create policy "authenticated write insights"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'insights');

drop policy if exists "authenticated update insights" on storage.objects;
create policy "authenticated update insights"
  on storage.objects for update to authenticated
  using (bucket_id = 'insights');

drop policy if exists "authenticated delete insights" on storage.objects;
create policy "authenticated delete insights"
  on storage.objects for delete to authenticated
  using (bucket_id = 'insights');
