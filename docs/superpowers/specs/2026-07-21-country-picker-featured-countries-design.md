# Admin-managed top countries in the catalog country picker

**Date:** 2026-07-21
**Status:** Approved (design), pending implementation plan

## Goal

The catalog "Select your country" popup shows a few countries pinned above a
separator, then the rest alphabetically. Today the pinned list is hardcoded
(`CountryModal.astro` → `TOP_CODES = ['cy','at','eg','lb','gr']`). The admin
must be able to manage this list — which countries and in what order — from
the **Country Groups** tab in the dashboard (confirmed with the user; the
"Countries" tab is the unrelated Contact/partners list).

## Data model

New nullable column on `group_countries` (migration `0048`):

- `featured_order integer` — `null` = normal country; `1, 2, 3…` = position in
  the picker's top section.
- Seeded so nothing changes visually on deploy: cy=1, at=2, eg=3, lb=4, gr=5
  (matched on `lower(country_code)`).
- No RLS changes needed: `authenticated full access` (ALL) already permits the
  admin updates; `public read` already exposes the column to the SSR modal.
- `group_countries` has a uniqueness constraint on the country mapping (the
  add-form surfaces 23505 as "already mapped"), so one row per country —
  `featured_order` is unambiguous.

## Behaviour

### Country popup (`CountryModal.astro`)

- Replace the hardcoded `TOP_CODES` with data: top section = pool countries
  whose row has `featured_order != null`, ordered by it; below the separator =
  the remaining pool countries, alphabetical (unchanged).
- No featured rows → no top section and no separator (existing `groups`
  filter already handles this).
- Supabase-unreachable fallback: the full static `COUNTRIES` list renders with
  no top section (the hardcoded list goes away entirely).
- Changes go live without a rebuild: the page is on-demand SSR with
  `s-maxage=60`, so within ~1 minute.

### Admin — Country Groups tab (`GroupsTab.tsx`)

New panel above the group sections: **"Country picker — top countries"**:

- Ordered list of the featured countries (name + ISO code chip), each with
  **↑ / ↓** to reorder and **×** to unpin.
- **"+ Add country"**: a select listing every `group_countries` country not
  already featured, alphabetical; picking one appends it at the end.
- Every mutation renumbers the featured list 1..n and persists via updates to
  `group_countries.featured_order` (unpin writes `null`), then reloads and
  calls `triggerPublish()` (tab convention).
- Search box on the tab keeps filtering only the group sections; the new panel
  is not part of the search.

## Code structure

- `src/lib/picker-countries.ts` (new, pure + tested):
  - `featuredPickerList(rows)` — group_countries rows → featured rows sorted
    by `featured_order` (dedupe by code, defensive).
  - `partitionPickerCountries(pool, featured)` — pool of `{code,label}` +
    featured order lookup → `{ top, rest }` used by the modal.
  - `moveFeatured(list, index, 'up' | 'down')` and `renumber(list)` — admin
    reorder helpers (clamped at the edges, following the `moveFamilyImage`
    idiom).
- `GroupCountry` type gains `featured_order: number | null`.
- `CountryModal.astro` selects `featured_order` and uses the lib helpers.
- `GroupsTab.tsx` renders the new panel using the same lib helpers.

## Error handling

- Admin persistence failures surface in the tab's existing error strip; the
  list reloads from the DB so the UI never drifts from reality.
- The modal treats missing/invalid `featured_order` data as "not featured".

## Testing / verification

- Vitest for the pure helpers (ordering, partition, dedupe, move/renumber,
  edge clamps, empty-featured case).
- `npm test` + `npx astro check` clean.
- Browser/live: popup shows the seeded 5 on top (unchanged); reorder/unpin/add
  in the dashboard and confirm the popup follows within ~1 minute; empty the
  list and confirm the separator disappears.

## Non-goals

- No change to what the country choice does (filtering, storage, 24h memory).
- No i18n of country labels (modal is English-only today).
- No changes to the Contact "Countries" tab.
