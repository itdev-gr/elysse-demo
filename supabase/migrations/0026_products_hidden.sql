-- public.products.is_hidden
--
-- A "hidden" flag, distinct from is_active. Hidden rows are removed from BOTH
-- the public catalog (loadCategory filters them) AND the admin product list
-- (shown only behind the admin's "Show hidden" toggle), without being deleted.
-- is_active stays as the existing publish toggle; the two are independent.

alter table public.products
  add column if not exists is_hidden boolean not null default false;

-- Hide the 16 x ⅜" size of No.330 (per request); the row stays in the DB.
update public.products set is_hidden = true where code = '330001610';
