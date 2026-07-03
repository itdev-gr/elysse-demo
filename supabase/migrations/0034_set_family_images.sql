-- Atomic replace of a family's images + primary mirror, in one transaction.
--
-- The admin image manager rewrites a family's whole ordered image set. Doing it
-- as separate delete/insert/update calls from the client is non-atomic: a mid-way
-- failure could leave product_family_images out of sync with the
-- product_families.image_url / products.image_url mirror. This function performs
-- all four steps in a single transaction (a plpgsql function body is atomic), so
-- it either fully succeeds or fully rolls back.
--
-- p_urls is the ordered list (index 1 = primary); rows are written with
-- sort_order 0..n-1. The primary (first url, or null when empty) is mirrored onto
-- product_families.image_url and every member products.image_url for
-- (p_category_name, p_family_code) — matching the old client cascade.
--
-- SECURITY INVOKER (default): runs as the caller, so RLS still applies — only the
-- authenticated admin (which has full-access policies on all three tables) can
-- mutate. Execute is granted to authenticated only.

create or replace function public.set_family_images(
  p_family_id     uuid,
  p_category_name text,
  p_family_code   text,
  p_urls          text[]
) returns void
language plpgsql
as $$
declare
  v_primary text := case when cardinality(p_urls) >= 1 then p_urls[1] else null end;
begin
  delete from public.product_family_images where family_id = p_family_id;

  if cardinality(p_urls) >= 1 then
    insert into public.product_family_images (family_id, url, sort_order)
    select p_family_id, u, ord - 1
    from unnest(p_urls) with ordinality as t(u, ord);
  end if;

  update public.product_families set image_url = v_primary where id = p_family_id;

  if p_category_name is not null then
    update public.products set image_url = v_primary
    where category_name = p_category_name and family_code = p_family_code;
  end if;
end;
$$;

revoke all on function public.set_family_images(uuid, text, text, text[]) from public;
grant execute on function public.set_family_images(uuid, text, text, text[]) to authenticated;
