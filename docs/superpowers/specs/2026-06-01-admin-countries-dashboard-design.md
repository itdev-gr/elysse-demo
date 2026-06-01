# Admin countries dashboard — design spec

**Date:** 2026-06-01
**Status:** Draft — pending user approval
**Author:** Marios + Claude

---

## 1. Goal

Move the worldwide-contact country data out of the static `src/data/worldwide-contacts.ts` file into Supabase, and add a "Countries" tab to the existing `/admin` dashboard so the admin can create, edit, and remove the rows that populate the world map at `/contact/worldwide/`.

The map's marker positions (latitude, longitude, nudge offsets) become data-driven — when admin adds a new country with valid coordinates, it appears on the map.

Builds on the patterns established by the jobs and blog admin features. Reuses the same Supabase project, anon-key client, auth gate, and `Dashboard.tsx` tab shell.

## 2. Non-goals

- Multi-language country names or labels (one label per country)
- A map UI for picking lat/lng visually (admin types them)
- Bulk CSV import / export
- Multiple dealers per country (one contact record per country)
- Region grouping or filtering on the public side
- Geographic search by lat/lng on the admin side

## 3. Architecture

```
┌──────────────────────────────────┐         ┌────────────────────────────────────┐
│  /admin                          │         │ /contact/worldwide/                │
│  ┌─────┬──────┬──────────────┐   │ reads   │ WorldwideExplorer (existing)       │
│  │Jobs │Posts │Countries     │   │ ◄────── │ ├─ ElyseeWorldMap (markers from DB)│
│  └─────┴──────┴──────────────┘   │         │ └─ Details card + contact form     │
│  • Search input                  │         │    (row from DB by code)           │
│  • CountriesTab table            │         └──────────────┬─────────────────────┘
│  • CountryForm                   │                        │
└──────────┬───────────────────────┘                        ▼
           ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  Supabase                                                       │
   │  • public.countries (RLS-protected)                             │
   │  • anon SELECT only where is_active = true                      │
   │  • authenticated: full CRUD                                     │
   └─────────────────────────────────────────────────────────────────┘
```

The map's marker list moves from a hardcoded array inside `ElyseeWorldMap.tsx` into `WorldwideExplorer.tsx`'s state, which is populated by a single fetch from Supabase. The map component becomes a pure consumer of `markers` passed via props.

## 4. Data model

### Table: `public.countries`

| column              | type          | constraints                                                       |
|---------------------|---------------|-------------------------------------------------------------------|
| `code`              | text          | PK, lowercase ISO 3166-1 alpha-2; `check (code ~ '^[a-z]{2}$')`   |
| `country`           | text          | NOT NULL — human-readable country name                            |
| `label`             | text          | NOT NULL — shown in details card heading                          |
| `kind`              | text          | NOT NULL — `check (kind in ('subsidiary','partner'))`             |
| `lat`               | numeric(7,4)  | NOT NULL — `check (lat between -90 and 90)`                       |
| `lng`               | numeric(8,4)  | NOT NULL — `check (lng between -180 and 180)`                     |
| `nudge_x`           | numeric(5,2)  | NULL — optional pixel offset for label                            |
| `nudge_y`           | numeric(5,2)  | NULL                                                              |
| `address`           | text          | NOT NULL — multi-line, `\n` for breaks                            |
| `phone`             | text          | NOT NULL                                                          |
| `email`             | text          | NOT NULL                                                          |
| `website`           | text          | NULL                                                              |
| `note`              | text          | NULL — sub-line in details card                                   |
| `prefilled_message` | text          | NOT NULL — pre-fills the contact form message field               |
| `is_active`         | boolean       | NOT NULL, default `true`                                          |
| `created_at`        | timestamptz   | NOT NULL, default `now()`                                         |
| `updated_at`        | timestamptz   | NOT NULL, default `now()`, refreshed by trigger                   |

Indexes: none — table is small (~16 rows, capped well under 100 in practice).

Trigger: reuses the existing `public.set_updated_at()` function from `0001_jobs.sql`.

### RLS policies

```sql
alter table public.countries enable row level security;

create policy "public read active countries"
on public.countries for select
to anon, authenticated
using (is_active = true);

create policy "authenticated full access on countries"
on public.countries for all
to authenticated
using (true) with check (true);
```

## 5. File layout

### New files

- `supabase/migrations/0004_countries.sql` — schema + RLS + trigger
- `supabase/migrations/0005_seed_countries.sql` — insert all 16 existing countries with their current data + lat/lng from `ElyseeWorldMap.tsx`
- `src/types/country.ts` — `Country` TS interface + `CountryDraft` + `CountryKind`
- `src/components/admin/CountriesTab.tsx` — table with search + add/edit/delete/toggle-active
- `src/components/admin/CountryForm.tsx` — shared create/edit form

### Modified files

- `src/components/contact/WorldwideExplorer.tsx` — fetch countries from Supabase, pass `markers` to `ElyseeWorldMap`, use the fetched rows as the country lookup. Adds loading/error states.
- `src/components/contact/ElyseeWorldMap.tsx` — remove hardcoded `markers` array; accept `markers` as a prop. The `Marker` type stays in the file. Everything else (SVG rendering, zoom, click handling) is unchanged.
- `src/components/admin/Dashboard.tsx` — extend tab union to `'jobs' | 'posts' | 'countries'`, add third nav button, render `<CountriesTab />` in the third tab.

### Deleted files

- `src/data/worldwide-contacts.ts` — replaced by the DB. The `CountryContact` interface migrates to `src/types/country.ts` as `Country`.

### Untouched

All other admin pages, the existing jobs and posts flows, navigation, the rest of the worldwide page (hero, stat band, intro, export-manager card, continents grid, closing CTA). Only the `WorldwideExplorer` island changes.

## 6. Seeding of existing 16 countries

`supabase/migrations/0005_seed_countries.sql` inserts:

- **4 subsidiaries** (CY, LB, EG, AT) with their full data from `worldwide-contacts.ts` + lat/lng from `ElyseeWorldMap.tsx`
- **12 partners** (GB, DE, FR, IT, GR, AE, SA, TR, JP, ZA, AU, NZ) — all with the Cyprus Export Department address/phone/email/note from the `partner()` helper, plus their per-country lat/lng/nudge from the map markers, and the templated `prefilled_message` ("Hi Elysée — I am enquiring from {Country}…")

Idempotency: `on conflict (code) do nothing` so the seed can be re-applied safely.

Once seeded, removing `src/data/worldwide-contacts.ts` is safe — no other code depends on it after `WorldwideExplorer` is converted in the same task.

## 7. Public-side: `WorldwideExplorer` fetch + states

State machine:

```
┌──────────┐        Supabase fetch        ┌──────────────────────────────┐
│ loading  │  ────────────────────────►   │ ready(countries: Country[])  │
└──────────┘                              └──────────────────────────────┘
     │                                              │
     │           on fetch error                     │ on country marker click
     ▼                                              ▼
┌──────────┐                              ┌──────────────────────────────┐
│ error    │                              │ selectedCode === code        │
└──────────┘                              └──────────────────────────────┘
```

States rendered:

- **loading** — keep the page chrome (the explorer header and section already exist on the parent Astro page). Replace the explorer body with two skeleton blocks: a wide map placeholder + a narrow details card. Form is hidden.
- **error** — show a single card with the existing "Tap any country" copy adjusted to "Map temporarily unavailable", plus the fallback contact form on the right that defaults to the Cyprus Export Department (this matches the existing fallback established for the jobs/posts features — `isSupabaseConfigured` short-circuit + browser-only client).
- **ready** — render the map with `markers` derived as `{ code, lat, lng, kind, nudge: nudge_x/y? }`. Clicking a marker sets `selectedCode`; the right-column details card reads the matching row by `code` from the `countries` array already in state. The contact form picks up the `email` and `prefilled_message` from the same row.

## 8. Map component changes — `ElyseeWorldMap`

Today the component owns the `markers` array. Move it out:

```ts
// Before:
const markers: Marker[] = [
  { code: 'cy', lat: 35.0717, lng: 33.4136, kind: 'subsidiary' },
  // ... 15 more
];

// After:
type Props = {
  markers: Marker[];               // ← new prop
  onCountrySelect: (code: string) => void;
  selectedCode: string | null;
};
```

The `Marker` interface stays defined in this file. `nudge` is optional (`{ x: number; y: number } | undefined`), so the runtime shape from the DB is the existing one — `WorldwideExplorer` does the column-to-prop mapping when it derives the marker list from the Supabase rows.

Everything below the prop change in `ElyseeWorldMap.tsx` (SVG layout, click handling, did-move guard, zoom) stays untouched.

## 9. Admin: `CountriesTab` with search

Top of tab:
- A single search `<input type="search">` placed above the table, with placeholder `Search by country, code, or label…`
- Live filter (no debounce — the dataset is small)
- Filter matches when the input is a case-insensitive substring of `code`, `country`, or `label`

Table:
- Columns: **Code · Country · Label · Kind · Active · Actions**
- Sorted by `country` ascending
- "Active" cell shows a `Live` badge when `is_active = true`, `Inactive` (muted) otherwise
- Actions: Edit · Toggle active · Delete (with `confirm()`)
- "+ New country" button above the search input

Empty states:
- No rows in DB: "No countries yet. Create the first one." (same pattern as Jobs/Posts)
- Search yields no results: "No countries match '<query>'. Clear the search or add a new country."

## 10. Admin: `CountryForm`

Fields, in order:

1. **Code** * — text, `[a-z]{2}` pattern. Lowercased on blur. **Read-only on edit** (changing the PK after rows reference it is risky; force delete-and-recreate instead).
2. **Country** * — text
3. **Label** * — text (hint: "Shown as the details-card heading — e.g. 'Cyprus · Ergates (HQ)'")
4. **Kind** * — `<select>`: Subsidiary / Partner
5. **Latitude** * — number, step="any", min=-90, max=90
6. **Longitude** * — number, step="any", min=-180, max=180
7. **Nudge X** — number, step="any" (hint: "Pixel offset for the label. Leave blank for default.")
8. **Nudge Y** — number, step="any"
9. **Address** * — textarea, 3 rows
10. **Phone** * — text
11. **Email** * — email
12. **Website** — text
13. **Note** — text (hint: "Sub-line shown under the country in the details card.")
14. **Prefilled message** * — textarea, 3 rows
15. **Active** — checkbox (default on)

Submit:
- Insert or update via Supabase
- On unique-code violation (insert): show inline error "A country with code <X> already exists."
- On success: close form, refresh list, return to tab default view

A hint near the lat/lng fields: "Tip — paste from Google Maps. Right-click any location → the first row of the popup shows lat, lng."

## 11. Dashboard tab integration

`Dashboard.tsx`:
- Tab union extends to `type Tab = 'jobs' | 'posts' | 'countries'`
- Nav adds a third button "Countries"
- Heading switches between "Jobs.", "Posts.", "Countries." matching the active tab
- Body renders `<JobsTab />`, `<PostsTab />`, or `<CountriesTab />`

No other admin code changes.

## 12. Environment and security

No new env vars. Reuses:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Security:
- Anon key remains public; RLS is the enforcement layer (same as jobs/posts)
- `code` is the PK and is locked from edit after creation — the public side relies on stable codes for the `selectedCode` state and for relating future content (e.g. dealer pages) back to a country
- No service-role key in code
- `prefilled_message` is rendered as plain text in a textarea by the public form — no markdown, no HTML, so no sanitization layer needed

## 13. Edge cases

| scenario                                  | behavior                                                                 |
|-------------------------------------------|--------------------------------------------------------------------------|
| No countries in DB                        | Map renders empty (no markers). Admin can add the first row.             |
| Admin toggles `is_active = false`         | Public map drops the marker; admin still sees the row with "Inactive" badge |
| Admin deletes a selected country mid-session | If a public visitor had clicked that marker, the details card persists until they click another marker. Next page load fixes it. |
| Lat/lng out of range                      | HTML5 `min`/`max` block submit; server-side CHECK catches anything that slips through |
| Duplicate code on insert                  | Unique-violation error surfaces inline in the form                       |
| Supabase unreachable                      | `WorldwideExplorer` shows the error fallback card (existing pattern from jobs/posts) |
| `code` looks valid but doesn't match real ISO | Accepted — the DB only validates `^[a-z]{2}$`. Admin's responsibility to use real codes; map markers don't depend on ISO recognition, only on the row existing. |

## 14. Testing

Unit tests are minimal because almost all logic lives in components and DB. What gets tested:

- Pure helper `filterCountries(rows, query)` extracted from `CountriesTab` — vitest tests for: empty query returns all, case-insensitive substring match, matches on code/country/label, empty when no matches.
- All other behaviour verified via the existing build + astro-check + manual Playwright smoke test.

Manual smoke test path:
1. `/contact/worldwide/` loads, 16 markers visible, click a marker → details card populates, message field pre-fills, form sends to country email
2. `/admin` → Countries tab → table shows 16 rows, sorted by country
3. Search "ger" → only "Germany" remains
4. Edit Germany → change `email` → save → public side reflects the new email
5. New country: add "Canada" (ca, lat 56.13, lng -106.35, kind partner) → marker appears on map at refresh
6. Toggle active off on Canada → marker disappears
7. Delete Canada with confirm → admin row gone, marker gone
8. Sign out → /admin returns to login

## 15. Rollout

1. Apply migration 0004 (table + RLS) via Management API
2. Apply migration 0005 (seed) via Management API
3. Implement code changes (Tasks per the implementation plan)
4. Run static checks: `npm run build`, `npm test`, `npx astro check`
5. Local Playwright smoke test
6. Push to main → Vercel rebuilds
7. Verify on the production URL

## 16. Open questions

None at design time. Anything that surfaces during implementation is handled in the writing-plans phase.
