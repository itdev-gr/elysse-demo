# Catalogue PDFs by Country — Design

Date: 2026-06-30
Status: Approved (design); pending implementation

## Goal

Each Catalogue row (both top-level categories and subcategories) carries **two
PDF slots — Black and Blue** — instead of one. Each slot is assigned to a
subset of country groups (A–E, the same scheme products use). On the public
catalog, a "Download catalogue" button appears next to the page title and
resolves to whichever PDF matches the visitor's country group; if neither
slot matches, no button shows.

Black and Blue are **admin-only labels** — slot names in the database and
forms. The visitor sees a single neutral button; the slot a download came
from is invisible to them. **Black wins on overlap**: if a visitor's group
appears in both slots, the Black PDF is served.

Scope: data-model + admin form + the two public-site touch points described
below. Out of scope (explicitly deferred): a third PDF slot, multi-select
visitor UI, removing the legacy `pdf_url` column.

## Decisions captured during brainstorming

1. **Two slots per row** (Black, Blue), on **both** category and subcategory rows.
2. **Linkage between Catalogues and product pages is explicit**, not derived from
   names. A new dropdown on the Catalogue form ties the row to a target page.
3. **Country groups per PDF are multi-valued.** Each slot stores a `text[]` of
   group codes (A–E).
4. **The visitor sees one neutral button.** Black wins overlap; no match = no
   button.
5. **Migration preserves today's behaviour.** Existing `pdf_url` moves into the
   Black slot with `groups_black = '{A,B,C,D,E}'` (visible to every market).
6. **Top-level button on the category page; subcategory button on the product
   page**, with the product → subcategory link driven by an admin-set
   `product_sub_category` field.

## Architecture (Approach A — two columns on each catalogues row)

Smallest viable change. The catalogue table is small (under ~100 rows) so we
keep the data co-located with the row instead of normalising to a child
table.

```
                                ┌────────────────────────────┐
public.catalogues (one row per  │ + pdf_url_black            │
catalogue or subcatalogue)  ───▶│ + pdf_url_blue             │
                                │ + groups_black text[]      │
                                │ + groups_blue  text[]      │
                                │ + category_slug text       │ ← on category rows
                                │ + product_sub_category text│ ← on subcategory rows
                                │   (legacy pdf_url kept)    │
                                └────────────────────────────┘
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
   /catalog/[category]/index.astro                       /catalog/[category]/[product].astro
   loads top-level catalogue row by                      loads subcategory row by
   category_slug; renders CatalogueButton.               product_sub_category; same component.
                                              │
                                              ▼
                        Client-side: CatalogueButton reads
                        readCountry() → loadCountryGroups() →
                        pickCataloguePdf(row, groupCode)
                        → sets href, removes hidden — or stays hidden.
```

The lookup is one row read on an indexed column for each public page; no new
joins on the hot path. The decision logic — which PDF wins, when to hide —
lives in a single pure helper `pickCataloguePdf` shared between admin
preview and public site.

## Data model

### Migration `supabase/migrations/0032_catalogue_pdfs_by_country.sql`

Additive only. No destructive change.

```sql
alter table public.catalogues
  add column if not exists pdf_url_black        text,
  add column if not exists pdf_url_blue         text,
  add column if not exists groups_black         text[],
  add column if not exists groups_blue          text[],
  add column if not exists category_slug        text,
  add column if not exists product_sub_category text;

-- Backfill: today's single pdf_url becomes Black for every market.
update public.catalogues
set pdf_url_black = coalesce(pdf_url_black, pdf_url),
    groups_black  = coalesce(groups_black, array['A','B','C','D','E']),
    groups_blue   = coalesce(groups_blue, array[]::text[])
where pdf_url is not null and pdf_url_black is null;

create index if not exists idx_catalogues_category_slug
  on public.catalogues (category_slug);
```

The legacy `pdf_url` column is **kept** for this release so the existing
"paste an external URL" input in `CatalogueForm` keeps working without a
double rewrite. A follow-up migration drops it after we confirm no read
path remains.

### Validation

There is no hard FK from `catalogues.category_slug` to
`product_categories.slug` (the latter is admin-editable too). The admin form
is the source of validation: the dropdown only lets you pick existing
slugs, and `CataloguesTab` flags any row whose `category_slug` no longer
matches an existing category.

### Indexes

`idx_catalogues_category_slug` is the only new index. The table is too
small to justify a GIN on `groups_black` / `groups_blue` — sequential scan
is fast and the array operators (`= any(...)`) are only invoked when
serving a public page.

## Library changes — `src/lib/catalogues.ts`

- `uploadCataloguePdf(file, catalogueId, slot)` gains a `slot: 'black' | 'blue'`
  argument used only in the storage path: `{catalogueId}/{slot}-{uuid}.pdf`.
  Behaviour otherwise unchanged.
- New pure helper:

  ```ts
  type PdfRow = {
    pdf_url_black: string | null;
    pdf_url_blue:  string | null;
    groups_black:  string[] | null;
    groups_blue:   string[] | null;
  };
  export function pickCataloguePdf(
    row: PdfRow,
    groupCode: string | null,
  ): { url: string; slot: 'black' | 'blue' } | null {
    if (!groupCode) return null;
    const black = row.groups_black ?? [];
    const blue  = row.groups_blue  ?? [];
    if (row.pdf_url_black && black.includes(groupCode))
      return { url: row.pdf_url_black, slot: 'black' };
    if (row.pdf_url_blue  && blue.includes(groupCode))
      return { url: row.pdf_url_blue,  slot: 'blue' };
    return null;
  }
  ```

- Types in `src/types/catalogue.ts` get the six new optional fields.

## Admin UI — `CatalogueForm.tsx`

Replace the single PDF block with two identical blocks, **Black** and **Blue**,
each containing:

- File picker (accepts `application/pdf`, 25 MB cap — same as today).
- URL input (paste an external URL).
- Country-group checkbox row: `☐ A ☐ B ☐ C ☐ D ☐ E`.
- Current-file preview link and a Remove button (when present).

Above the PDF blocks, conditional on row type:

- **Category rows** (`parent_id` null): a `Linked product category` dropdown,
  options loaded from `product_categories` (slug → name). Required if the
  admin intends the row to power the public button.
- **Subcategory rows** (`parent_id` set): a `Applies to product series`
  dropdown, options loaded from `distinct products.sub_category` for the
  parent's linked category. Required for the product-page button to work.

### Validation in `onSubmit`

- If `groups_black` is non-empty but `pdf_url_black` is null → error: "Pick a
  PDF for the Black slot, or clear its groups." Same for Blue.
- If `groups_black` and `groups_blue` overlap → **warn** (do not block) with
  "Group X is in both slots — Black will win."
- If the chosen `category_slug` no longer exists in `product_categories` →
  error.

### Upload flow

Per slot, if a new file is pending, call `uploadCataloguePdf(file, id, slot)`
then patch the corresponding `pdf_url_{slot}` column. The two uploads are
independent — one failing doesn't roll back the other.

## Admin UI — `CataloguesTab.tsx`

The single `PDF` column splits into two: **Black** and **Blue**. Each cell
shows either `View ↗` plus small group chips `[A][B]…`, or a dash. Layout:

```
| # | Name                  | Black              | Blue               | Active | Actions |
|---|-----------------------|--------------------|--------------------|--------|---------|
| 1 | A — Compression …     | View ↗  [A][B]     | View ↗  [C][D][E]  | Live   | …       |
|   | ↳ Polyfast series     | View ↗  [A][B]     | —                  | Live   | …       |
```

A small "unlinked" chip appears next to the name when `category_slug`
(category rows) or `product_sub_category` (subcategory rows) is empty — the
button won't render publicly without it.

## Public site

### Country → group resolution helper (new)

New file `src/scripts/catalog/country-group.ts`:

```ts
import { supabase } from '../../lib/supabase';
import type { Country } from './types';

let cache: Map<Country, string> | null = null;

export async function loadCountryGroups(): Promise<Map<Country, string>> {
  if (cache) return cache;
  const { data } = await supabase
    .from('group_countries')
    .select('country_code, group_code');
  cache = new Map((data ?? []).map((r) => [r.country_code as Country, r.group_code]));
  return cache;
}
```

Cached in module scope; refreshed on a full page reload (which already
happens when the visitor switches country via the modal).

### `CatalogueButton.astro` (new)

A small client island. SSR renders the anchor with `hidden`; client script:

1. `readCountry()` → visitor's country.
2. `loadCountryGroups()` → group code.
3. `pickCataloguePdf(row, group)` from the JSON dropped into a `<script type="application/json">` next to the button.
4. If a match → set `href`, remove `hidden`; otherwise leave hidden.

Hidden-at-SSR keeps us out of the hydration mismatch territory flagged in
the `nav_greek_hydration_bug` memory. The button appears once the country
is known — which in practice is "immediately after the first paint" for
return visitors and "after the modal pick" for first-timers.

Visual treatment matches the editorial nav links already on the page:
uppercase 11px, 0.25em tracking, brand-500 hover, with a `↓` glyph before
the label `Download catalogue`. To the **right** of the H1 on desktop,
stacked **below** the H1 on mobile.

### Category landing page — `/catalog/[category]/index.astro`

Add to the frontmatter, alongside the existing category lookup:

```ts
const { data: cat } = await supabase
  .from('catalogues')
  .select('pdf_url_black, pdf_url_blue, groups_black, groups_blue')
  .eq('category_slug', categoryEntry.slug)
  .is('parent_id', null)
  .eq('is_active', true)
  .maybeSingle();
```

Render `<CatalogueButton catalogue={cat} />` inside the header next to the
H1. The button stays hidden if `cat` is null.

### Product page — `/catalog/[category]/[product].astro`

Same component, different query — pull the subcategory row whose
`product_sub_category` matches the current product's series **and whose
parent's `category_slug` matches the current category**. Done in one
PostgREST query with an inner foreign-key join on `parent_id`:

```ts
const { data: sub } = await supabase
  .from('catalogues')
  .select(`
    pdf_url_black, pdf_url_blue, groups_black, groups_blue,
    parent:parent_id!inner ( category_slug )
  `)
  .eq('product_sub_category', product.sub_category)
  .eq('parent.category_slug', categoryEntry.slug)
  .eq('is_active', true)
  .maybeSingle();
```

The `!inner` modifier turns the embedded parent into a join filter, so a
subcategory row only matches when its parent points at the current page's
product category. This eliminates the "same series name reused under
different parents" collision.

### Caching

Both pages already use `Cache-Control: public, s-maxage=60,
stale-while-revalidate=86400` with `prerender = false`. We don't change
that. The new catalogue lookup is a single-row read on an indexed column.

## Edge cases

| Case | Behaviour |
| --- | --- |
| Row exists but `category_slug` null | No public button. Admin sees an "unlinked" chip. |
| `category_slug` points to a deleted product category | Treated as unlinked. Admin form shows "(missing)" in the dropdown. |
| Both `pdf_url_black` and `pdf_url_blue` null | No button. |
| `groups_black` non-empty but `pdf_url_black` null | Hidden everywhere. Admin form errors on save. |
| Visitor's country resolves to nothing (obsolete code in `localStorage`) | No button (same as no-match). |
| Catalogue row `is_active = false` | Excluded from public query via RLS. |
| Same group in both `groups_black` and `groups_blue` | Black wins. Admin form warns at save. |
| Same `product_sub_category` value under multiple parents | Query scopes to the current category via parent's `category_slug`. |

## Migration plan

1. Apply `0032_catalogue_pdfs_by_country.sql` against a Supabase branch.
2. Verify backfill: `select count(*) from public.catalogues where pdf_url is not null and pdf_url_black is null;` → expect 0.
3. Deploy the new admin form + listing + types.
4. Deploy the public CatalogueButton + frontmatter changes.
5. (Follow-up release) Drop `pdf_url` once no read paths remain.

Storage bucket `catalogues` is already public + has RLS for authenticated
writes; no policy changes needed.

## Testing

- **Unit (vitest)** — `pickCataloguePdf(row, groupCode)` table-driven:
  Black-wins, Blue-only, no-match, both-empty, group not in either,
  groupCode null.
- **Unit** — country → group helper: unknown country returns null,
  returns cached map on second call.
- **DB migration smoke** — apply to branch, run the post-backfill assertion.
- **Manual smoke** — open `/catalog/compression-fittings` with each of the
  five country groups in `localStorage` (via the modal); confirm the button
  appears with the expected file or doesn't appear at all. Repeat one
  product page.
- **Existing tests** — `catalogues.test.ts` keeps passing (no behaviour
  change to `buildCatalogueTree` or `validateCataloguePdf`).

## Out of scope (explicitly deferred)

- Dropping the legacy `pdf_url` column.
- A third PDF slot ever.
- Visitor-side override of which slot wins.
- Country multi-select in the public UI.
- Drag-reorder admin UI for the Black/Blue precedence.
