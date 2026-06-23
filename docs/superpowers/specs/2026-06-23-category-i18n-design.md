# Category & subcategory translations — design

Date: 2026-06-23

## Goal

Let the admin translate **category** and **subcategory** names (plus the category
**blurb**) into the four non-English languages the site supports — Greek (`el`),
German (`de`), Spanish (`es`), French (`fr`) — and have those translations show
on the storefront when a visitor switches language, with English as the
fallback.

## Existing pattern (products, migration 0020)

English stays in the base column; non-English translations live in a `*_i18n`
JSONB keyed by language code. The storefront renders English and swaps text
client-side on the `elysee:lang` event (dispatched by `LanguageToggle`,
preference stored in `localStorage` as `elysee.lang`), falling back to English
when a key is missing. This design replicates that pattern.

The canonical English `name` doubles as a **matching key**
(`product_categories.product_category_name` → `products.category_name`;
`product_subcategories.name` → `products.sub_category`). Translations therefore
go in a **separate** JSONB column — the English `name` is never overwritten, so
filtering/matching keeps working.

## Data model (migration `0024_category_i18n.sql`)

- `product_categories`: add `name_i18n JSONB NOT NULL DEFAULT '{}'`,
  `blurb_i18n JSONB NOT NULL DEFAULT '{}'`.
- `product_subcategories`: add `name_i18n JSONB NOT NULL DEFAULT '{}'`.
- Update `ProductCategory` / `ProductSubcategory` interfaces in
  `src/lib/categories.ts` (`name_i18n` / `blurb_i18n` as
  `Record<string, string> | null`). Applied via the Supabase Management API.

## Admin

- **CategoryForm.tsx** — add a "Translations" fieldset (el/de/es/fr) mirroring
  `ProductForm`: a Name input + a Blurb textarea per language, writing into
  `name_i18n` / `blurb_i18n`. Helper: blanks fall back to English on the site.
- **CategoriesTab.tsx** — replace the `prompt()` rename with an inline expand
  **Edit** panel under the series row (same inline-form style as the category
  form). Fields: Rename (English) + 4 translation inputs (`name_i18n`). On save
  it writes `{ name, name_i18n }` and, if the English name changed and the
  category has an Excel link, propagates the new name to `products.sub_category`
  (the current rename behaviour is preserved). Hide/Show/Delete unchanged.

## Storefront display

A single global swap script in `BaseLayout` translates any element carrying
`data-i18n={JSON map}` on load and on `elysee:lang` (same mechanism
`ConfigDetail` already uses). Display points gain `data-i18n` attributes:

- Catalog category page — `<h1>`, breadcrumb name, UtilityBar label.
- `CategoriesNav` sidebar — category links + series labels (checkbox `value`
  stays the English name so the filter engine keeps matching).
- `ProductCategoryGrid` (products page) — card titles.
- Product detail breadcrumb — category name.
- `MegaNav` (React, fetches categories live) — extend its Supabase select with
  `name_i18n`/`blurb_i18n`, resolve label/caption to the current language, and
  re-resolve on `elysee:lang`.

## Out of scope

URL-based i18n routing (deferred app-wide); Excel import/export for categories
(no spreadsheet flow exists for them); translating category images/PDFs.
