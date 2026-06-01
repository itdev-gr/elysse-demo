# Admin Countries Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move worldwide-contacts data into Supabase and add a "Countries" admin tab with full CRUD + search, so the map markers and country contact details on `/contact/worldwide/` become admin-managed.

**Architecture:** Site stays SSG. `WorldwideExplorer` (existing React island) fetches countries from Supabase once on mount, passes the marker list to `ElyseeWorldMap` (which becomes a pure consumer of a `markers` prop), and uses the same rows for the country lookup on marker click. The hardcoded `markers` array in `ElyseeWorldMap.tsx` and the entire `src/data/worldwide-contacts.ts` are removed.

**Tech Stack:** Astro 6, React 19, Supabase (Postgres + Auth), TailwindCSS 4.

**Spec:** `docs/superpowers/specs/2026-06-01-admin-countries-dashboard-design.md`

---

## Manual prerequisites

Migrations 0004 (table) and 0005 (seed) are applied to Supabase via the Management API as part of Tasks 1 and 2 below. No separate manual step.

---

## File map

**Created:**
- `supabase/migrations/0004_countries.sql` — schema + RLS + trigger
- `supabase/migrations/0005_seed_countries.sql` — INSERT the 16 existing countries
- `src/types/country.ts` — `Country`, `CountryDraft`, `CountryKind`
- `src/lib/countries.ts` — pure helper `filterCountries(rows, query)`
- `src/lib/countries.test.ts` — vitest unit tests
- `src/components/admin/CountriesTab.tsx` — table + search + actions
- `src/components/admin/CountryForm.tsx` — create/edit form

**Modified:**
- `src/components/contact/ElyseeWorldMap.tsx` — remove hardcoded `markers` array, accept it as a prop
- `src/components/contact/WorldwideExplorer.tsx` — fetch countries from Supabase; replace `worldwide-contacts.ts` lookup
- `src/components/admin/Dashboard.tsx` — third tab "Countries" wired to `<CountriesTab />`

**Deleted:**
- `src/data/worldwide-contacts.ts`

---

## Task 1: DB migration — `countries` table + RLS

**Files:**
- Create: `supabase/migrations/0004_countries.sql`

- [ ] **Step 1: Write the migration**

Write to `supabase/migrations/0004_countries.sql`:

```sql
-- public.countries: backing table for the admin countries dashboard.
create table if not exists public.countries (
  code              text primary key
                      check (code ~ '^[a-z]{2}$'),
  country           text not null,
  label             text not null,
  kind              text not null
                      check (kind in ('subsidiary','partner')),
  lat               numeric(7,4) not null
                      check (lat between -90 and 90),
  lng               numeric(8,4) not null
                      check (lng between -180 and 180),
  nudge_x           numeric(5,2),
  nudge_y           numeric(5,2),
  address           text not null,
  phone             text not null,
  email             text not null,
  website           text,
  note              text,
  prefilled_message text not null,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Reuse the set_updated_at() trigger function from 0001_jobs.sql.
drop trigger if exists set_countries_updated_at on public.countries;
create trigger set_countries_updated_at
  before update on public.countries
  for each row execute function public.set_updated_at();

-- RLS
alter table public.countries enable row level security;

drop policy if exists "public read active countries" on public.countries;
create policy "public read active countries"
on public.countries for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on countries" on public.countries;
create policy "authenticated full access on countries"
on public.countries for all
to authenticated
using (true) with check (true);
```

- [ ] **Step 2: Apply via Management API**

```bash
SBP_TOKEN="sbp_REPLACE_WITH_YOUR_PAT"
PROJECT_REF="hsamhykaqmiiheneonxz"
SQL_BODY=$(python3 -c "import json,sys; print(json.dumps({'query': open(sys.argv[1]).read()}))" supabase/migrations/0004_countries.sql)
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SQL_BODY"
```

Expected: `[]`.

- [ ] **Step 3: Verify**

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"select count(*) from public.countries"}'
```

Expected: `[{"count":0}]`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_countries.sql
git commit -m "feat(db): countries table + RLS"
```

---

## Task 2: Seed 16 existing countries

**Files:**
- Create: `supabase/migrations/0005_seed_countries.sql`

The export-desk fallback used by partners (matches `src/data/worldwide-contacts.ts`):
- address: `5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus`
- phone: `+357 22 455 008`
- email: `yerolemos@elysee.com.cy`
- note: `Routed via the Cyprus Export Department`

- [ ] **Step 1: Write the seed migration**

Write to `supabase/migrations/0005_seed_countries.sql`:

```sql
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
```

- [ ] **Step 2: Apply via Management API**

```bash
SBP_TOKEN="sbp_REPLACE_WITH_YOUR_PAT"
PROJECT_REF="hsamhykaqmiiheneonxz"
SQL_BODY=$(python3 -c "import json,sys; print(json.dumps({'query': open(sys.argv[1]).read()}))" supabase/migrations/0005_seed_countries.sql)
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SQL_BODY"
```

Expected: `[]`.

- [ ] **Step 3: Verify 16 rows**

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SBP_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"select code, country, kind from public.countries order by code"}'
```

Expected: 16 rows including `cy` (subsidiary), `lb` (subsidiary), `eg` (subsidiary), `at` (subsidiary), `gb` (partner), `de` (partner), `fr` (partner), `it` (partner), `gr` (partner), `ae` (partner), `sa` (partner), `tr` (partner), `jp` (partner), `za` (partner), `au` (partner), `nz` (partner).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0005_seed_countries.sql
git commit -m "feat(db): seed 16 existing countries from worldwide-contacts.ts"
```

---

## Task 3: Country type + filter helper (TDD)

**Files:**
- Create: `src/types/country.ts`
- Create: `src/lib/countries.ts`
- Create: `src/lib/countries.test.ts`

- [ ] **Step 1: Write the failing tests**

Write to `src/lib/countries.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterCountries } from './countries';
import type { Country } from '../types/country';

const base = (overrides: Partial<Country>): Country => ({
  code: 'xx',
  country: 'Xland',
  label: 'Xland',
  kind: 'partner',
  lat: 0,
  lng: 0,
  nudge_x: null,
  nudge_y: null,
  address: 'addr',
  phone: 'phone',
  email: 'e@x.com',
  website: null,
  note: null,
  prefilled_message: 'msg',
  is_active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
  ...overrides,
});

const rows: Country[] = [
  base({ code: 'cy', country: 'Cyprus', label: 'Cyprus · Ergates (HQ)' }),
  base({ code: 'de', country: 'Germany', label: 'Germany' }),
  base({ code: 'gr', country: 'Greece', label: 'Greece' }),
  base({ code: 'ae', country: 'United Arab Emirates', label: 'UAE' }),
];

describe('filterCountries', () => {
  it('returns all rows when query is empty', () => {
    expect(filterCountries(rows, '')).toEqual(rows);
  });
  it('returns all rows when query is whitespace', () => {
    expect(filterCountries(rows, '   ')).toEqual(rows);
  });
  it('matches by country (case-insensitive substring)', () => {
    expect(filterCountries(rows, 'ger').map((r) => r.code)).toEqual(['de']);
  });
  it('matches by code', () => {
    expect(filterCountries(rows, 'cy').map((r) => r.code)).toEqual(['cy']);
  });
  it('matches by label', () => {
    expect(filterCountries(rows, 'uae').map((r) => r.code)).toEqual(['ae']);
  });
  it('matches by label substring (Ergates)', () => {
    expect(filterCountries(rows, 'ergates').map((r) => r.code)).toEqual(['cy']);
  });
  it('returns empty when no match', () => {
    expect(filterCountries(rows, 'zzz')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — must fail**

```bash
npm test -- src/lib/countries.test.ts
```

Expected: FAIL (file does not exist).

- [ ] **Step 3: Create the Country type**

Write to `src/types/country.ts`:

```ts
export type CountryKind = 'subsidiary' | 'partner';

export interface Country {
  code: string;
  country: string;
  label: string;
  kind: CountryKind;
  lat: number;
  lng: number;
  nudge_x: number | null;
  nudge_y: number | null;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  note: string | null;
  prefilled_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CountryDraft = Omit<Country, 'created_at' | 'updated_at'>;
```

- [ ] **Step 4: Implement the filter helper**

Write to `src/lib/countries.ts`:

```ts
import type { Country } from '../types/country';

export function filterCountries(rows: Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (q === '') return rows;
  return rows.filter((r) =>
    r.code.toLowerCase().includes(q) ||
    r.country.toLowerCase().includes(q) ||
    r.label.toLowerCase().includes(q),
  );
}
```

- [ ] **Step 5: Run tests — must pass**

```bash
npm test -- src/lib/countries.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/types/country.ts src/lib/countries.ts src/lib/countries.test.ts
git commit -m "feat(countries): Country type + filterCountries helper + tests"
```

---

## Task 4: `WorldwideExplorer` fetches from Supabase

**Files:**
- Modify: `src/components/contact/WorldwideExplorer.tsx`

The current `WorldwideExplorer.tsx` imports `worldwideContacts` from `src/data/worldwide-contacts.ts` and uses it as a lookup. After this task it fetches `countries` from Supabase on mount and uses the fetched rows for both the map markers and the click lookup.

- [ ] **Step 1: Overwrite `src/components/contact/WorldwideExplorer.tsx` entirely**

```tsx
'use client';
/**
 * World map + contact form for /contact/worldwide/.
 *
 * Fetches all active countries from Supabase on mount and passes the
 * resulting marker list to ElyseeWorldMap. When the user clicks a marker
 * the matching row is used to populate the details card and the form.
 */
import { useEffect, useMemo, useState } from 'react';
import ElyseeWorldMap from './ElyseeWorldMap';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Country } from '../../types/country';

const FALLBACK_EMAIL = 'yerolemos@elysee.com.cy';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; countries: Country[] };

export default function WorldwideExplorer() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [code, setCode] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true);
      if (cancelled) return;
      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      setState({ kind: 'ready', countries: (data ?? []) as Country[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markers = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return state.countries.map((c) => ({
      code: c.code,
      lat: c.lat,
      lng: c.lng,
      kind: c.kind,
      nudge: c.nudge_x != null && c.nudge_y != null
        ? { x: c.nudge_x, y: c.nudge_y }
        : undefined,
    }));
  }, [state]);

  const contact: Country | null = useMemo(() => {
    if (state.kind !== 'ready' || code === null) return null;
    return state.countries.find((c) => c.code === code) ?? null;
  }, [state, code]);

  const handleSelect = (next: string) => {
    setCode(next);
    if (state.kind === 'ready') {
      const c = state.countries.find((row) => row.code === next);
      if (c) setMessage(c.prefilled_message);
    }
  };

  const formTarget = contact?.email ?? FALLBACK_EMAIL;
  const countryFieldValue = contact?.country ?? '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

      {/* Map + country details (left) */}
      <div className="lg:col-span-7">
        {state.kind === 'loading' && (
          <div className="aspect-[16/9] bg-surface-alt border-l-4 border-brand-500/40 animate-pulse"></div>
        )}

        {state.kind === 'error' && (
          <div className="aspect-[16/9] bg-surface-alt border-l-4 border-brand-500/40 flex items-center justify-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/60">Map temporarily unavailable</p>
          </div>
        )}

        {state.kind === 'ready' && (
          <ElyseeWorldMap markers={markers} onCountrySelect={handleSelect} selectedCode={code} />
        )}

        {/* Country details — appears under the map when a country is picked */}
        <div className="mt-8 md:mt-10">
          {!contact && (
            <div className="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Tap any country</p>
              <p className="text-base text-ink/75 leading-relaxed">
                Pick a marker on the map to see local contact details — we will route your
                message to the closest Elysée office or partner.
              </p>
            </div>
          )}

          {contact && (
            <div className="bg-surface border-l-4 border-brand-500 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
                {contact.kind === 'subsidiary' ? 'Subsidiary' : 'Partner country'}
              </p>
              <h3 className="mt-2 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{contact.label}</h3>
              {contact.note && <p className="mt-2 text-sm text-ink/65">{contact.note}</p>}
              <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500"></div>

              <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div className="sm:col-span-2">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Address</dt>
                  <dd className="mt-1 text-ink whitespace-pre-line leading-relaxed">{contact.address}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Phone</dt>
                  <dd className="mt-1 text-ink">
                    <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-500 transition-colors duration-200">{contact.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</dt>
                  <dd className="mt-1 text-ink break-all">
                    <a href={`mailto:${contact.email}`} className="hover:text-brand-500 transition-colors duration-200">{contact.email}</a>
                  </dd>
                </div>
                {contact.website && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Website</dt>
                    <dd className="mt-1 text-ink">
                      <a href={`https://${contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors duration-200">{contact.website}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Contact form (right) */}
      <aside className="lg:col-span-5 lg:sticky lg:top-32">
        <form
          action={`mailto:${formTarget}`}
          method="post"
          encType="text/plain"
          className="bg-surface-alt p-6 md:p-8"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-5">Send a message</p>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Country</span>
            <input
              type="text"
              name="country"
              value={countryFieldValue}
              readOnly
              placeholder="Select a country on the map"
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40"
            />
          </label>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Your name</span>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
              placeholder="Jane Doe"
            />
          </label>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</span>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
              placeholder="jane@company.com"
            />
          </label>

          <label className="block mb-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Message</span>
            <textarea
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder={contact ? '' : 'Pick a country on the map to pre-fill, or write your enquiry here.'}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500 resize-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
          >
            Send message
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          {!contact && (
            <p className="mt-5 text-[11px] text-ink/55 leading-relaxed">
              No country picked — your message will be routed to the Export Department in Cyprus.
            </p>
          )}
        </form>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Update `ElyseeWorldMap` to accept `markers` as a prop**

Open `src/components/contact/ElyseeWorldMap.tsx`. Make two changes:

(a) **Remove** lines 36–58 (the hardcoded `markers: Marker[]` array including the section comments).

(b) **Modify the `Props` type** (currently lines ~74–79) — add `markers: Marker[]`:

```ts
type Props = {
  /** All markers to render. */
  markers: Marker[];
  /** Fires with the ISO alpha-2 country code when a marker is clicked. */
  onCountrySelect?: (code: string) => void;
  /** ISO alpha-2 code of the currently selected country, if any. */
  selectedCode?: string | null;
};
```

(c) **Update the component signature** — find the `export default function ElyseeWorldMap` line and destructure `markers` from props:

```ts
export default function ElyseeWorldMap({ markers, onCountrySelect, selectedCode }: Props) {
```

If the current signature already destructures props, just add `markers,` to the destructure list. Either way the function body still references the same `markers` identifier on line ~267 (`{[...markers]`).

- [ ] **Step 3: Delete the old data file**

```bash
git rm src/data/worldwide-contacts.ts
```

- [ ] **Step 4: Verify nothing else imports the deleted file**

```bash
grep -rn "worldwide-contacts" "/Users/marios/Desktop/Cursor/elysse demo/src"
```

Expected: no output.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: 66 pages, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/contact/WorldwideExplorer.tsx src/components/contact/ElyseeWorldMap.tsx
git commit -m "feat(countries): fetch from Supabase + map markers from props; delete worldwide-contacts.ts"
```

(`git rm` already staged the deletion, so the commit picks up all three changes.)

---

## Task 5: `CountryForm`

**Files:**
- Create: `src/components/admin/CountryForm.tsx`

- [ ] **Step 1: Build the form**

Write to `src/components/admin/CountryForm.tsx`:

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Country, CountryDraft, CountryKind } from '../../types/country';

type Props = {
  initial?: Country;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): CountryDraft {
  return {
    code: '',
    country: '',
    label: '',
    kind: 'partner',
    lat: 0,
    lng: 0,
    nudge_x: null,
    nudge_y: null,
    address: '',
    phone: '',
    email: '',
    website: null,
    note: null,
    prefilled_message: '',
    is_active: true,
  };
}

function toDraft(c: Country): CountryDraft {
  const { created_at: _ca, updated_at: _ua, ...rest } = c;
  return rest;
}

export default function CountryForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<CountryDraft>(() => initial ? toDraft(initial) : emptyDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof CountryDraft>(key: K, value: CountryDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: CountryDraft = {
      ...draft,
      code: draft.code.trim().toLowerCase(),
      website: draft.website?.trim() || null,
      note: draft.note?.trim() || null,
      nudge_x: draft.nudge_x,
      nudge_y: draft.nudge_y,
    };

    try {
      if (initial) {
        // Code is read-only on edit — keep the original PK
        const { code: _ignored, ...updateFields } = payload;
        const { error: err } = await supabase
          .from('countries')
          .update(updateFields)
          .eq('code', initial.code);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('countries').insert(payload);
        if (err) {
          if (err.code === '23505') {
            throw new Error(`A country with code "${payload.code}" already exists.`);
          }
          throw err;
        }
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? `Edit ${initial.country}` : 'New country'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          {error}
        </p>
      )}

      <Field label="Code" required hint="ISO 3166-1 alpha-2, lowercase (e.g. cy, gb).">
        <input
          type="text"
          required
          pattern="[a-z]{2}"
          minLength={2}
          maxLength={2}
          value={draft.code}
          readOnly={!!initial}
          onChange={(e) => update('code', e.currentTarget.value.toLowerCase())}
          className={`${inputClass} ${initial ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </Field>

      <Field label="Country" required>
        <input
          type="text"
          required
          value={draft.country}
          onChange={(e) => update('country', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Label" required hint="Shown as the details-card heading.">
        <input
          type="text"
          required
          value={draft.label}
          onChange={(e) => update('label', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Kind" required>
        <select
          required
          value={draft.kind}
          onChange={(e) => update('kind', e.currentTarget.value as CountryKind)}
          className={inputClass}
        >
          <option value="subsidiary">Subsidiary</option>
          <option value="partner">Partner</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Latitude" required hint="-90 to 90">
          <input
            type="number"
            required
            step="any"
            min={-90}
            max={90}
            value={draft.lat}
            onChange={(e) => update('lat', Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Longitude" required hint="-180 to 180">
          <input
            type="number"
            required
            step="any"
            min={-180}
            max={180}
            value={draft.lng}
            onChange={(e) => update('lng', Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-[11px] text-ink/55 leading-relaxed -mt-2">
        Tip — paste from Google Maps. Right-click any location → the first row of the popup is the lat, lng pair.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Nudge X" hint="Pixel offset (optional)">
          <input
            type="number"
            step="any"
            value={draft.nudge_x ?? ''}
            onChange={(e) => update('nudge_x', e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Nudge Y" hint="Pixel offset (optional)">
          <input
            type="number"
            step="any"
            value={draft.nudge_y ?? ''}
            onChange={(e) => update('nudge_y', e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address" required>
        <textarea
          required
          rows={3}
          value={draft.address}
          onChange={(e) => update('address', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Phone" required>
        <input
          type="text"
          required
          value={draft.phone}
          onChange={(e) => update('phone', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Email" required>
        <input
          type="email"
          required
          value={draft.email}
          onChange={(e) => update('email', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Website">
        <input
          type="text"
          value={draft.website ?? ''}
          onChange={(e) => update('website', e.currentTarget.value)}
          placeholder="www.example.com"
          className={inputClass}
        />
      </Field>

      <Field label="Note" hint="Sub-line shown under the country in the details card.">
        <input
          type="text"
          value={draft.note ?? ''}
          onChange={(e) => update('note', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Prefilled message" required hint="Pre-fills the contact form message.">
        <textarea
          required
          rows={3}
          value={draft.prefilled_message}
          onChange={(e) => update('prefilled_message', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => update('is_active', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Active (visible on the public map)</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create country'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">
        {label}{required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CountryForm.tsx
git commit -m "feat(admin): CountryForm with lat/lng + read-only code on edit"
```

---

## Task 6: `CountriesTab` with search

**Files:**
- Create: `src/components/admin/CountriesTab.tsx`

- [ ] **Step 1: Build the tab**

Write to `src/components/admin/CountriesTab.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Country } from '../../types/country';
import { filterCountries } from '../../lib/countries';
import CountryForm from './CountryForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; country: Country };

export default function CountriesTab() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('countries')
      .select('*')
      .order('country', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setCountries((data ?? []) as Country[]);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (countries ? filterCountries(countries, query) : []),
    [countries, query],
  );

  const toggleActive = async (country: Country) => {
    const { error: err } = await supabase
      .from('countries')
      .update({ is_active: !country.is_active })
      .eq('code', country.code);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (country: Country) => {
    if (!confirm(`Delete "${country.country}" (${country.code})? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('countries').delete().eq('code', country.code);
    if (err) return setError(err.message);
    await load();
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New country
            </button>
          </div>

          <div className="mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search by country, code, or label…"
              className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
            />
          </div>

          {countries === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : countries.length === 0 ? (
            <p className="text-sm text-ink/60">No countries yet. Create the first one.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-ink/60">
              No countries match &ldquo;{query}&rdquo;. Clear the search or add a new country.
            </p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.code} className="border-b border-ink/5 last:border-b-0">
                      <td className="px-4 py-3 text-ink uppercase">{c.code}</td>
                      <td className="px-4 py-3 text-ink">{c.country}</td>
                      <td className="px-4 py-3 text-ink/75">{c.label}</td>
                      <td className="px-4 py-3 text-ink/75 capitalize">{c.kind}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.is_active
                              ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                              : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                          }
                        >
                          {c.is_active ? 'Live' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                          <button onClick={() => setMode({ kind: 'edit', country: c })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => toggleActive(c)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            {c.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => remove(c)} className="text-red-600 hover:text-red-800 cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <CountryForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CountryForm
          initial={mode.country}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CountriesTab.tsx
git commit -m "feat(admin): CountriesTab table with search + actions"
```

---

## Task 7: Wire Countries tab into `Dashboard`

**Files:**
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Overwrite `src/components/admin/Dashboard.tsx`**

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import JobsTab from './JobsTab';
import PostsTab from './PostsTab';
import CountriesTab from './CountriesTab';

type Tab = 'jobs' | 'posts' | 'countries';

const HEADINGS: Record<Tab, string> = {
  jobs: 'Jobs.',
  posts: 'Posts.',
  countries: 'Countries.',
};

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('jobs');

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const tabClass = (which: Tab) =>
    `px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-colors duration-200 ${
      tab === which
        ? 'bg-ink text-surface'
        : 'text-ink/70 hover:text-brand-500'
    }`;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">
              {HEADINGS[tab]}
            </h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        <nav className="mb-8 flex items-center gap-2 border-b border-ink/10 pb-4" aria-label="Admin sections">
          <button type="button" onClick={() => setTab('jobs')} className={tabClass('jobs')}>
            Jobs
          </button>
          <button type="button" onClick={() => setTab('posts')} className={tabClass('posts')}>
            Posts
          </button>
          <button type="button" onClick={() => setTab('countries')} className={tabClass('countries')}>
            Countries
          </button>
        </nav>

        {tab === 'jobs' && <JobsTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'countries' && <CountriesTab />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 66 pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/Dashboard.tsx
git commit -m "feat(admin): wire Countries tab into Dashboard"
```

---

## Task 8: End-to-end verification

- [ ] **Step 1: Static checks**

```bash
npm test
```

Expected: all tests pass (54 jobs/blog tests + 7 countries = 61 total).

```bash
npx astro check
```

Expected: 0 errors.

```bash
npm run build
```

Expected: 66 pages, no errors.

- [ ] **Step 2: Local smoke test**

```bash
npm run dev
```

Browser tests:

1. **`/contact/worldwide/`** — verify map loads, all 16 markers render at their existing positions (CY, LB, EG, AT subsidiaries; 12 partners). Click a marker (e.g. UAE) → details card shows "Partner country", "UAE" label, Cyprus export-desk address/phone/email, and the form message pre-fills with "Hi Elysée — I am enquiring from United Arab Emirates…".
2. Click a subsidiary (e.g. Lebanon) → details show "Subsidiary", Byblos address, Elysée WISE email, note "Polyethylene pipe manufacturing", website link.
3. **`/admin`** → sign in → switch to **Countries** tab. Table shows 16 rows sorted alphabetically: Australia, Austria, Cyprus, Egypt, France, Germany, Greece, Italy, Japan, Lebanon, New Zealand, Saudi Arabia, South Africa, Turkey, United Arab Emirates, United Kingdom.
4. Search "ger" → only "Germany" remains. Clear → all 16 back.
5. **Edit Germany** → change email to `test@example.com` → save. Public worldwide page (reload) → click Germany → email shows `test@example.com`.
6. **Toggle Germany active off** → public reload → Germany marker is gone.
7. Toggle back on → marker returns.
8. **+ New country** → Canada, code `ca`, kind `partner`, lat `56.13`, lng `-106.35`, fill required fields → Create. Reload public → Canada marker appears.
9. **Delete Canada** → confirm → row removed from admin table; public reload → marker gone.
10. **Sign out** → /admin returns to login form.

- [ ] **Step 3: Push to production**

```bash
git push
```

After Vercel rebuilds, repeat the public-side checks (1, 2) against the production URL to confirm env vars are wired and RLS is doing the right thing.

---

## Self-review

**Spec coverage:**
- §1 goal → entire plan
- §3 architecture → Tasks 4 (public-side) + 7 (admin tab integration)
- §4 data model + RLS → Task 1
- §5 file layout → mirrored in "File map"
- §6 seeding → Task 2
- §7 public-side fetch + states → Task 4
- §8 map component changes → Task 4 Step 2
- §9 CountriesTab with search → Task 6
- §10 CountryForm → Task 5
- §11 dashboard tab integration → Task 7
- §12 env + security → no env changes; security inherited from Task 1 RLS
- §13 edge cases → covered across Tasks 4–6
- §14 testing → Task 3 (unit) + Task 8 (manual)
- §15 rollout → Task 8 Step 3

**Placeholder scan:** No TBDs. Every step has full code or exact commands. The seed migration in Task 2 spells out every column for every one of the 16 rows.

**Type consistency:** `Country`, `CountryDraft`, `CountryKind`, `filterCountries` defined in Task 3 and used by the same names in Tasks 4–7. The `Mode` discriminated union pattern in `CountriesTab` (Task 6) matches `JobsTab` / `PostsTab` from the previous features.
