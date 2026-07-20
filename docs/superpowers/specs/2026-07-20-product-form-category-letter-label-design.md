# Product form: show "letter - name" in the Category dropdown

**Date:** 2026-07-20
**Status:** Approved (design)

## Goal

In the admin **product form** (new/edit product), the **Category name**
dropdown's options should read `<category letter> - <category name>`
(e.g. `A - Compression Fittings`) instead of the bare name.

## Scope — display only

- **Only the visible option text changes.** The `<option value>` and the
  stored draft value remain the bare `category_name` — the key that links
  products ⇄ categories ⇄ Excel import/export. No data, schema, or public-site
  change of any kind.
- Option **order stays exactly as today** (alphabetical by name) — the user
  explicitly wants a text-only change.
- The adjacent **Category letter** field and its two-way autofill
  (name → letter, letter → name) keep working unchanged.
- Letters come from the existing `letterByCategory` map (built from
  `product_categories`). A category name with no letter (e.g. a legacy name
  present only on products) renders as the bare name.
- Other dropdowns rendered by the shared `selectField` helper (Sub-category,
  Family code) are unaffected.

## Design

`ProductForm.tsx` only. Extend the local `selectField` helper with an optional
`labelFor?: (value: string) => string` parameter (defaults to identity) and use
it for both the regular options and the "current value not in options"
fallback option. Call it for the Category select with:

```ts
(name) => {
  const letter = letterByCategory.get(name);
  return letter ? `${letter} - ${name}` : name;
}
```

## Verification

- Existing test suite passes (`npm test`); `npx astro check` clean.
- Browser: open admin → Products → + New product → the Category dropdown lists
  `A - Compression Fittings` … `M - Plastic Pipes & Fittings for
  Infrastructure, Building & Industry`; picking one still fills the letter
  field and saves the bare name.
