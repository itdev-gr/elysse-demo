# Admin tab search — design

**Date:** 2026-07-10
**Status:** approved

## Goal

Every content tab in `/admin/` gets a text search. Nine tabs already have one
(Products, Countries, Visibility, and the six Insights lists via
`ListFilterBar`). This adds a search box to the nine that don't:

Jobs, Messages, Certifications, Catalogues, Categories, Families,
Country Groups, Data Errors, Images.

Settings is a form, not a list — no search.

## Approach

All nine tabs already load their full datasets client-side (Supabase reads on
mount), so search is pure in-memory filtering — case-insensitive substring
matching across a fixed set of fields per tab, exactly like the existing
searches in ProductsTab / CountriesTab. No server-side search, no URL query
state, no debounce.

### Shared UI: `SearchInput`

New component `src/components/admin/SearchInput.tsx` — a controlled
`type="search"` input reproducing the admin's existing underline style
(`w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm
text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500`).

Props: `value: string`, `onChange: (value: string) => void`,
`placeholder: string`.

Existing tabs keep their inline inputs — no refactor of what already works.

### Filter helpers

Non-trivial matchers become pure exported helpers in the existing
`src/lib/<domain>.ts` files (the `filterCountries` pattern), each with vitest
coverage. Trivial flat filters stay inline in the tab component behind a
`useMemo`, like ProductsTab does.

Matching rule everywhere: `query.trim().toLowerCase()`; empty query = no
filtering; a row matches when any of its fields contains the query substring.

## Per-tab behaviour

Each tab renders a `SearchInput` above its list, ANDed with any filters the
tab already has, plus a "Nothing matches" empty state.

| Tab | Fields matched | Structure handling |
|---|---|---|
| Jobs | title, department, location, employment_type | flat table filter (inline) |
| Messages | name, email, company, phone, message | ANDs with existing status + source button filters (inline) |
| Certifications | name, description, scope, tag | ANDs with existing group + category filters (inline) |
| Catalogues | name, description | tree-aware helper in `lib/catalogues.ts`: a matching subcategory keeps its parent row visible; a matching category shows all its children |
| Categories | category name, slug, series (subcategory) name | helper in `lib/categories.ts`: a category card shows if it or any of its series match; when only series match, the series list narrows to the matching ones |
| Families | family code, configuration | helper in `lib/families.ts`: filters family codes; category → series grouping is preserved and series/categories left with no matching codes drop out |
| Country Groups | country name, country_code, group code, group label | helper in `lib/product-groups.ts`: a matching group shows all its countries; otherwise only matching country chips remain and groups with no matches collapse |
| Data Errors | code, issue_type, message | flat filter (inline); only the issue list filters — the "X errors · Y warnings open" headline keeps counting all open issues |
| Images | filename, family_code | flat filter (inline) over the LibraryGrid in the Images tab only (not the Families modal picker); count line shows "x of y" while filtering |

## Error handling / edge cases

- Null fields (`company`, `description`, `family_code`, …) are skipped, never
  crash the matcher.
- Loading (`rows === null`) and genuinely-empty states keep their current
  copy; a new "Nothing matches “…”" line appears only when a non-empty
  dataset filters to zero.
- Filtering never mutates source arrays (bulk actions and counts elsewhere
  keep operating on the full data).

## Testing

- Vitest unit tests for each new lib helper (catalogues tree filter,
  categories filter, families filter, groups filter), following the existing
  `src/lib/*.test.ts` style: match by each field, case-insensitivity, empty
  query passthrough, parent/child visibility rules, null-field safety.
- `npm test` and `npm run build` must pass.

## Out of scope

- Global cross-tab search.
- Server-side / RPC search.
- Changes to tabs that already have search.
- Sidebar section filtering.
