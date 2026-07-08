# Multilingual Dictionaries (de / es / fr) mirroring Greek — Design

**Date:** 2026-07-08
**Status:** Draft — awaiting user review
**Scope owner:** i18n (add German, Spanish, French wherever Greek exists)

---

## Goal (as clarified)

> "Only where we have Greek translation, do the other translations."

For **every string that already has a Greek (`el`) entry**, add German (`de`),
Spanish (`es`), and French (`fr`). No new UI strings, no new pages, no hunting
for untranslated content. Strings without a Greek entry stay as-is.

## What already exists (verified in the working tree)

Your in-progress (uncommitted) edits already built the whole machinery and
completed the first section, `catalog`:

- **`src/lib/i18n.ts`** — already generalized to all four locales:
  `I18N_LOCALES = ['el','de','es','fr']`, a `DICTS` map, and `i18nAttr` /
  `i18nAttrFor` / `tFor` loop over every locale. **No further changes needed.**
- **`src/scripts/i18n-text.client.ts`** — already language-generic
  (`map[lang]`), documents the `{"el":…,"de":…,"es":…,"fr":…}` shape. **No change.**
- **`src/components/LanguageToggle.astro`** — already lists & dispatches all five
  languages. **No change.**
- **`src/data/i18n/{de,es,fr}/`** — created, but each contains **only
  `catalog.ts`** (6 SKU-table strings) + an `index.ts` that imports just
  `catalog`.
- **`src/data/i18n/el/catalog.ts`** + `SkuTable.astro` wiring — done.

So `catalog` is finished in all four languages. Everything else exists **only in
Greek**.

## Remaining work — the 9 sections to mirror

Each Greek section file must gain a `de` / `es` / `fr` twin with the **same keys**
and translated values. Sizes (Greek key counts):

| Section | keys |
|---|---:|
| shared | 104 |
| home | 31 |
| about | 329 |
| services | 21 |
| contact | 160 |
| innovation | 97 |
| insights | 63 |
| green | 121 |
| legal | 84 |
| **total per language** | **~1,010** |

→ ~1,010 × 3 = **~3,030 translations**. (`catalog`'s 6×3 are already done.)

---

## Design

Pure mirroring of the established pattern. Minimal code, mostly content.

### 1. 27 new dictionary files

`src/data/i18n/{de,es,fr}/{shared,home,about,services,contact,innovation,insights,green,legal}.ts`

Each mirrors its `el` twin exactly:

```ts
// English UI string → German. <same section description as el>.
// Keyed by the English text so it doubles as the source.
export const <section>: Record<string, string> = {
  '<exact English key>': '<translation>',
  …
};
```

- **Same export name** as the el file (`shared`, `home`, …) so the index imports
  line up.
- **Identical key set** to the el file — copy every English key verbatim
  (whitespace, punctuation, casing), translate only the value.
- Match the header-comment style already used in the `catalog.ts` twins
  (`→ German` / `→ Spanish` / `→ French`).

### 2. Wire the three index aggregators

`src/data/i18n/{de,es,fr}/index.ts` — add the 9 imports and spreads alongside
the existing `catalog`, mirroring `el/index.ts`:

```ts
import { shared } from './shared';
… (home, about, services, contact, innovation, insights, green, legal)
import { catalog } from './catalog';
export const DE: Record<string, string> = { ...shared, …, ...catalog };
```

### 3. Update the i18n tests (`src/lib/i18n.test.ts`)

- The existing assertion `i18nAttr('About Us') === JSON.stringify({ el: … })`
  **will break** once `About Us` gains de/es/fr — `i18nAttr` will emit all four.
  Update it to expect the full multi-locale map (or assert `JSON.parse(...).el`).
- Add **dictionary-integrity** checks for DE/ES/FR (no empty/blank values), like
  the existing EL one.
- Add a **key-parity** test: `Object.keys(DE/ES/FR)` must equal `Object.keys(EL)`
  — the guardrail against a mistyped/missing key silently falling back to
  English. This is the single most valuable test for this change.

### 4. Nothing else changes

`i18n.ts`, the client swap script, the toggle, and every page/island already
translated for Greek (nav via `tFor`, all `.astro` via `i18nAttr`) pick up
de/es/fr **automatically** once the dictionaries exist.

---

## Translation quality & consistency

- **Register:** formal / B2B corporate — German **Sie**, French **vous**,
  Spanish **usted** (industrial-supplier tone). *(Confirmed.)*
- **Glossary first:** lock recurring brand/industry terms before bulk work so
  all sections agree — e.g. *Elysée* (unchanged), *compression fittings*,
  *polyethylene pipe*, *catalogue*, *PDF*, *irrigation*, *fittings*, *valves*,
  *range*. Match terms already chosen in the `catalog` twins
  (e.g. de *Verpackung*, es *Embalaje*, fr *Emballage*).
- **Proper nouns stay:** *Elysée PRIME*, *WISE*, place names, person names,
  social networks — unless a standard localized form exists.
- **Preserve** punctuation, em-dashes, units, and any inline `PDF`/number tokens
  in the value.
- **AI-generated** translations; a native-speaker review before production is
  recommended (flagged, not blocking for a demo).
- **Execution:** translate section-by-section, one language at a time, feeding
  each translator the el source file + the glossary. Given the volume, the
  implementation may fan out per-section subagents for speed (each returns one
  translated file), then assemble + wire.

## Out of scope

- Strings **without** a Greek entry (the `products/catalogues` page, the
  `privacy-policy` migration-fallback paragraph, DB-driven product data).
- **Search** de/es/fr indexing — `search-pages.ts` builds only Greek haystacks
  and `search.ts` passes `p_lang` to a DB `search_site` RPC; extending to
  de/es/fr is a separate DB + search change. **Deferred to a follow-up**, not
  included here. *(Confirmed.)*
- `<head>` `<title>` / `<meta description>` — not translated anywhere by this
  mechanism.

## Testing & verification

1. `npm test` — updated `i18nAttr` assertion, de/es/fr integrity, and key-parity
   tests all green.
2. Parity spot-check script — confirm each of de/es/fr covers 100% of el keys.
3. Manual (browser): toggle to **DE / ES / FR** on home, about, contact, and the
   nav; confirm text swaps, the nav island labels translate (via `tFor`), and no
   island reverts after hydration.

## Risks & mitigations

- **Key drift** (missing/typo'd key → silent English) → key-parity test (step 3).
- **Test breakage** — the current `i18nAttr('About Us')` assertion *must* be
  updated in the same change or CI goes red.
- **Consistency across 3,000 strings** → glossary + section batching.
- **Don't clobber your uncommitted work** (SkuTable.astro, content.ts, the
  catalog twins) — this change is purely **additive** (new section files +
  index spreads + test edits).
- **HTML payload** grows (4 languages per `data-i18n` node) — acceptable.

## Deliverables checklist

- [ ] Glossary agreed (brand/industry terms, formality register)
- [ ] `de/`, `es/`, `fr/` × {shared, home, about, services, contact, innovation, insights, green, legal} created (27 files), keys == el
- [ ] `de/es/fr/index.ts` import + spread all 9 sections
- [ ] `i18n.test.ts`: updated `i18nAttr` assertion + de/es/fr integrity + key-parity
- [ ] `npm test` green; DE/ES/FR verified in-browser on representative pages
