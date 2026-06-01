-- Seed the 16 existing countries from src/data/worldwide-contacts.ts + lat/lng
-- from the hardcoded markers array in src/components/contact/ElyseeWorldMap.tsx.
-- Idempotent: re-runs are no-ops because of the PK conflict clause.
insert into public.countries
  (code, country, label, kind, lat, lng, nudge_x, nudge_y,
   address, phone, email, website, note, prefilled_message)
values
-- Subsidiaries
('cy', 'Cyprus', 'Cyprus · Ergates (HQ)', 'subsidiary',
 35.0717, 33.4136, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357-22-455000', 'info@elysee.com.cy', null,
 'Group headquarters · Export desk',
 'Hi Elysée — I would like to discuss a request with the Cyprus head office.'),

('lb', 'Lebanon', 'Lebanon · Byblos (Elysée WISE)', 'subsidiary',
 34.1230, 35.6519, 2.0, 0.5,
 E'Byblos – Gherfine - Main Road\nLebanon',
 '00961 9 624551', 'sales@elyseewise.com', 'www.elyseewise.com',
 'Polyethylene pipe manufacturing',
 'Hi Elysée WISE — I would like to enquire about your Polyethylene pipe range.'),

('eg', 'Egypt', 'Egypt · 10th of Ramadan (Elysée PRIME)', 'subsidiary',
 30.3082, 31.7426, -0.5, 2.5,
 E'3T15 Al Tajamouat Industrial Park\n10th of Ramadan, Egypt',
 '+2 012 8901 1102', 'info@elyseeprime.com', 'www.elyseeprime.com',
 'Irrigation hose manufacturing',
 'Hi Elysée PRIME — I would like to enquire about your irrigation hose range.'),

('at', 'Austria', 'Austria · Ennsdorf (Elysée Rohrsysteme)', 'subsidiary',
 48.2189, 14.5408, null, null,
 E'Wirtschaftspark Straße 3 / 4\nA-4482 Ennsdorf bei Enns, Austria',
 '+43 (0) 7223-82700-18', 'info@elysee-rohrsysteme.com', 'www.elysee-rohrsysteme.com',
 'European distribution & representation',
 'Hi Elysée Rohrsysteme — I would like to discuss European distribution.'),

-- Partners (all route via Cyprus export desk)
('gb', 'United Kingdom', 'United Kingdom', 'partner',
 51.5074, -0.1278, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from United Kingdom. Please put me in touch with your local distributor or representative.'),

('de', 'Germany', 'Germany', 'partner',
 52.5200, 13.4050, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Germany. Please put me in touch with your local distributor or representative.'),

('fr', 'France', 'France', 'partner',
 48.8566, 2.3522, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from France. Please put me in touch with your local distributor or representative.'),

('it', 'Italy', 'Italy', 'partner',
 41.9028, 12.4964, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Italy. Please put me in touch with your local distributor or representative.'),

('gr', 'Greece', 'Greece', 'partner',
 37.9838, 23.7275, -1.5, -0.5,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Greece. Please put me in touch with your local distributor or representative.'),

('ae', 'United Arab Emirates', 'UAE', 'partner',
 25.2048, 55.2708, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from United Arab Emirates. Please put me in touch with your local distributor or representative.'),

('sa', 'Saudi Arabia', 'Saudi Arabia', 'partner',
 24.7136, 46.6753, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Saudi Arabia. Please put me in touch with your local distributor or representative.'),

('tr', 'Turkey', 'Turkey', 'partner',
 41.0082, 28.9784, 0, -1.5,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Turkey. Please put me in touch with your local distributor or representative.'),

('jp', 'Japan', 'Japan', 'partner',
 35.6762, 139.6503, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Japan. Please put me in touch with your local distributor or representative.'),

('za', 'South Africa', 'South Africa', 'partner',
 -26.2041, 28.0473, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from South Africa. Please put me in touch with your local distributor or representative.'),

('au', 'Australia', 'Australia', 'partner',
 -33.8688, 151.2093, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from Australia. Please put me in touch with your local distributor or representative.'),

('nz', 'New Zealand', 'New Zealand', 'partner',
 -41.2865, 174.7762, null, null,
 E'5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
 '+357 22 455 008', 'yerolemos@elysee.com.cy', null,
 'Routed via the Cyprus Export Department',
 'Hi Elysée — I am enquiring from New Zealand. Please put me in touch with your local distributor or representative.')
on conflict (code) do nothing;
