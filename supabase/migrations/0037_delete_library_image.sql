-- Reference-aware image-library delete.
--
-- Deleting a product_images (library) row while its URL is still referenced by
-- products.image_url / product_families.image_url / product_family_images left
-- the catalog pointing at nothing once the storage file went too — the cause of
-- the "disappearing images" incident (2026-07-06). This function makes the
-- check + delete atomic: it refuses to delete while the URL is in use anywhere,
-- returning the usage counts for the admin UI to display. The storage object
-- itself is removed by the client AFTER a successful row delete (SQL cannot
-- delete storage files); an orphaned file on a failed removal is harmless
-- because nothing references it.
--
-- SECURITY INVOKER (default): runs as the caller, so RLS applies — only the
-- authenticated admin can delete. Execute granted to authenticated only.

create or replace function public.delete_library_image(p_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_url      text;
  v_products int;
  v_mirrors  int;
  v_gallery  int;
  v_fams     text[];
begin
  select url into v_url from public.product_images where id = p_id;
  if v_url is null then
    return jsonb_build_object('deleted', false, 'reason', 'not_found');
  end if;

  select count(*) into v_products from public.products where image_url = v_url;
  select count(*) into v_mirrors from public.product_families where image_url = v_url;
  select count(*), coalesce(array_agg(distinct f.code), '{}')
    into v_gallery, v_fams
  from public.product_family_images i
  join public.product_families f on f.id = i.family_id
  where i.url = v_url;

  if v_products + v_mirrors + v_gallery > 0 then
    return jsonb_build_object(
      'deleted', false, 'reason', 'in_use',
      'products', v_products, 'family_mirrors', v_mirrors,
      'gallery_rows', v_gallery, 'families', to_jsonb(v_fams));
  end if;

  delete from public.product_images where id = p_id;
  return jsonb_build_object('deleted', true, 'url', v_url);
end;
$$;

revoke all on function public.delete_library_image(uuid) from public;
grant execute on function public.delete_library_image(uuid) to authenticated;
