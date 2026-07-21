-- Data fix: Austria (group B) carried country_code 'AU' — the ISO code of
-- AUSTRALIA — so it could never surface in the country picker (labels resolve
-- by ISO code) and group-B products leaked to Australia pickers instead.
-- Correct it to 'at' and give it the featured slot the 0048 seed intended
-- (position 2, between Cyprus and Egypt).
update public.group_countries
set country_code = 'at', featured_order = 2
where country = 'Austria' and upper(country_code) = 'AU';
