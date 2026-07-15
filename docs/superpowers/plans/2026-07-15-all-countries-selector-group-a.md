# All ISO Countries in the Selector (group A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public "Select your country" modal offer every ISO 3166-1 alpha-2 country (249 codes), with every not-yet-mapped country assigned to pricing group A.

**Architecture:** A country shows in the modal only when its code is in BOTH `group_countries` (Supabase) AND the hardcoded `catalog-countries.ts` `COUNTRIES`. So we (1) expand `COUNTRIES` to all 249 codes, (2) derive the two content-config Zod enums from `COUNTRIES` so they can't drift, and (3) run a migration inserting the not-yet-mapped codes into `group_countries` under group A. A one-off generator script (in scratchpad, not committed) produces the `COUNTRIES` entries and the migration VALUES from one embedded ISO dataset.

**Tech Stack:** Astro 6, TypeScript, Supabase (Postgres) via the Management API, Vitest, `Intl.DisplayNames` for English country names.

## Global Constraints

- Country universe: **ISO 3166-1 alpha-2, all 249 officially-assigned codes**, stored **lowercase**.
- Featured codes pinned atop the modal (unchanged, in `CountryModal.astro`): `cy, at, eg, lb, gr`. All must remain present in `COUNTRIES`.
- Not-yet-mapped countries → **`group_code = 'A'`**. Existing B–E and A assignments are left untouched (the `group_countries.country` UNIQUE constraint forbids a country in two groups).
- `region` on each `CountryDef` is one of exactly: `europe | middle-east-africa | asia-pacific | americas`. It is internal metadata (not rendered) — completeness matters, precise bucketing does not.
- Do NOT touch the `countries` master table (worldwide-network map) or the modal layout.
- Preserve the existing 33 `COUNTRIES` entries verbatim (code/label/region) — append new ones only.
- Migrations applied live via the Management API helper `scratchpad/sbq.py` (reads the token from the memory file). Do not commit until the user reviews.

---

## File Structure

- `src/data/catalog-countries.ts` — **modify**: replace the `COUNTRIES` array body with the generated 249-entry list. Everything else (types, `REGIONS`, helpers) unchanged.
- `src/data/catalog-countries.test.ts` — **create**: guards (count, uniqueness, lowercase alpha-2, featured present, valid region).
- `src/content.config.ts` — **modify**: derive `COUNTRY_CODES` from `COUNTRIES` (kills the 25-code duplicate).
- `src/content/config.ts` — **modify**: same derive (legacy Astro-4 path, still type-checked).
- `supabase/migrations/0047_group_countries_all_iso.sql` — **create**: insert not-yet-mapped ISO codes into group A.
- `scratchpad/gen-countries.mjs` — **create (not committed)**: the generator.

---

## Task 1: Expand `COUNTRIES` to all 249 ISO codes

**Files:**
- Create: `src/data/catalog-countries.test.ts`
- Modify: `src/data/catalog-countries.ts` (the `COUNTRIES` array only)
- Create (scratchpad, not committed): `/private/tmp/claude-501/-Users-marios-Desktop-Cursor-elysse-demo/4c86cf2f-8130-4cd5-a704-3455d42e2113/scratchpad/gen-countries.mjs`

**Interfaces:**
- Consumes: existing `COUNTRIES: ReadonlyArray<CountryDef>` and `CountryDef = { code: string; label: string; region: Region }`.
- Produces: `COUNTRIES` with 249 unique lowercase-code entries; the generator also writes `scratchpad/group_countries_values.sql` (a `(code, name)` VALUES block) consumed by Task 3.

- [ ] **Step 1: Write the failing test**

Create `src/data/catalog-countries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { COUNTRIES, REGIONS } from './catalog-countries';

const FEATURED = ['cy', 'at', 'eg', 'lb', 'gr'];
const REGION_IDS = new Set(REGIONS.map((r) => r.id));

describe('COUNTRIES (full ISO 3166-1 set)', () => {
  it('has all 249 officially-assigned codes', () => {
    expect(COUNTRIES.length).toBe(249);
  });

  it('codes are unique, lowercase, two-letter alpha', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c).toMatch(/^[a-z]{2}$/);
  });

  it('every entry has a non-empty label and a valid region', () => {
    for (const c of COUNTRIES) {
      expect(c.label.trim().length).toBeGreaterThan(0);
      expect(REGION_IDS.has(c.region)).toBe(true);
    }
  });

  it('keeps the featured codes present', () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const f of FEATURED) expect(codes.has(f)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx vitest run src/data/catalog-countries.test.ts`
Expected: FAIL — `expected 33 to be 249` on the first assertion.

- [ ] **Step 3: Write the generator script**

Create the scratchpad file `gen-countries.mjs`. It embeds the ISO set as four region-bucket arrays (concatenation = all codes), preserves the current 33 entries verbatim, derives English names via `Intl.DisplayNames`, applies a small overrides map, and asserts the total is exactly 249. It prints the new `COUNTRIES` array body and writes the SQL VALUES file for Task 3.

```js
import fs from 'node:fs';

// ISO 3166-1 alpha-2 grouped into the four existing region buckets.
// Concatenation of these four arrays IS the full 249-code universe.
const BUCKETS = {
  europe: ['ad','al','at','ax','ba','be','bg','by','ch','cy','cz','de','dk','ee','es','fi','fo','fr','gb','gg','gi','gr','hr','hu','ie','im','is','it','je','li','lt','lu','lv','mc','md','me','mk','mt','nl','no','pl','pt','ro','rs','ru','se','si','sj','sk','sm','ua','va'],
  'middle-east-africa': ['ae','ao','bf','bh','bi','bj','bw','cd','cf','cg','ci','cm','cv','dj','dz','eg','eh','er','et','ga','gh','gm','gn','gq','gw','il','iq','ir','jo','ke','km','kw','lb','lr','ls','ly','ma','mg','ml','mr','mu','mw','mz','na','ne','ng','om','ps','qa','re','rw','sa','sc','sd','sh','sl','sn','so','ss','st','sy','sz','td','tg','tn','tr','tz','ug','ye','yt','za','zm','zw'],
  americas: ['ag','ai','ar','aw','bb','bl','bm','bo','bq','br','bs','bz','ca','cl','co','cr','cu','cw','dm','do','ec','fk','gd','gf','gl','gp','gs','gt','gy','hn','ht','jm','kn','ky','lc','mf','mq','ms','mx','ni','pa','pe','pm','pr','py','sr','sv','sx','tc','tt','us','uy','vc','ve','vg','vi'],
  'asia-pacific': ['af','am','aq','as','au','az','bd','bn','bt','bv','cc','ck','cn','cx','fj','fm','ge','gu','hk','hm','id','in','io','jp','kg','kh','ki','kp','kr','kz','la','lk','mh','mm','mn','mo','mp','mv','my','nc','nf','np','nr','nu','nz','pf','pg','ph','pk','pn','pw','sb','sg','tf','th','tj','tk','tl','tm','to','tv','tw','uz','vn','vu','wf','ws','um'],
};

// Overrides where Intl's label isn't the one we want to show.
const OVERRIDES = {
  ps: 'Palestine', va: 'Vatican City', kp: 'North Korea', kr: 'South Korea',
  ru: 'Russia', sy: 'Syria', la: 'Laos', mo: 'Macao', hk: 'Hong Kong',
  cd: 'DR Congo', cg: 'Congo', tw: 'Taiwan', bn: 'Brunei', tz: 'Tanzania',
  cv: 'Cape Verde', st: 'Sao Tome & Principe', tf: 'French Southern Territories',
  um: 'U.S. Outlying Islands', vg: 'British Virgin Islands', vi: 'U.S. Virgin Islands',
  fk: 'Falkland Islands', sh: 'St. Helena', pm: 'St. Pierre & Miquelon',
};

const region = new Intl.DisplayNames(['en'], { type: 'region' });

// Build code -> region and the full code list.
const codeRegion = new Map();
for (const [r, arr] of Object.entries(BUCKETS)) for (const c of arr) codeRegion.set(c, r);

const codes = [...codeRegion.keys()];
if (codes.length !== new Set(codes).size) throw new Error('duplicate codes in BUCKETS');
if (codes.length !== 249) throw new Error(`expected 249 codes, got ${codes.length}`);

// Preserve the current 33 entries verbatim.
const CATALOG_TS = '/Users/marios/Desktop/Cursor/elysse demo/src/data/catalog-countries.ts';
const currentSrc = fs.readFileSync(CATALOG_TS, 'utf8');
const CURRENT = [...currentSrc.matchAll(/\{ code: '([a-z]{2})', label: '([^']+)', region: '([^']+)' \}/g)]
  .reduce((m, [, code, label, reg]) => m.set(code, { code, label, region: reg }), new Map());

const name = (code) => OVERRIDES[code] ?? region.of(code.toUpperCase()) ?? code.toUpperCase();

const entries = codes
  .map((code) => CURRENT.get(code) ?? { code, label: name(code), region: codeRegion.get(code) })
  .sort((a, b) => a.label.localeCompare(b.label));

// Emit the TS array body.
const ts = entries.map((e) => `  { code: '${e.code}', label: ${JSON.stringify(e.label)}, region: '${e.region}' },`).join('\n');
fs.writeFileSync(new URL('./countries_array.txt', import.meta.url), ts);

// Emit the SQL VALUES block for the migration (code + name).
const sql = entries.map((e) => `    ('${e.code}', ${e.label.includes("'") ? '$q$'+e.label+'$q$' : `'${e.label}'`})`).join(',\n');
fs.writeFileSync(new URL('./group_countries_values.sql', import.meta.url), sql);

console.log(`OK: ${entries.length} entries written`);
```

Run it:
Run: `cd "/private/tmp/claude-501/-Users-marios-Desktop-Cursor-elysse-demo/4c86cf2f-8130-4cd5-a704-3455d42e2113/scratchpad" && node gen-countries.mjs`
Expected: `OK: 249 entries written`. If it throws `expected 249 codes, got N`, fix the `BUCKETS` arrays (add the missing / remove the duplicate ISO code) until it reports 249.

- [ ] **Step 4: Replace the `COUNTRIES` array body in `catalog-countries.ts`**

Open `src/data/catalog-countries.ts`. Replace everything between `export const COUNTRIES: ReadonlyArray<CountryDef> = [` and the matching closing `];` with the contents of `scratchpad/countries_array.txt`. Leave the `Region`/`CountryDef`/`RegionDef` types, `REGIONS`, `COUNTRY_REGION`, `CountryCode`, and `countriesByRegion()` exactly as they are.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx vitest run src/data/catalog-countries.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Typecheck (the `CountryCode` union now spans 249 codes)**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx astro check 2>&1 | tail -3`
Expected: no NEW errors (the pre-existing `src/lib/catalogues.test.ts` error may remain; nothing else).

- [ ] **Step 7: Commit**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git add src/data/catalog-countries.ts src/data/catalog-countries.test.ts
git commit -m "feat(catalog): expand country list to all 249 ISO 3166-1 codes"
```

---

## Task 2: Derive the content-config country enums from `COUNTRIES`

**Files:**
- Modify: `src/content.config.ts` (the `COUNTRY_CODES` const)
- Modify: `src/content/config.ts` (same const, legacy path)

**Interfaces:**
- Consumes: `COUNTRIES` from Task 1.
- Produces: no new exports; removes the hardcoded 25-code duplicates so the Zod enum always equals `COUNTRIES`.

- [ ] **Step 1: Update `src/content.config.ts`**

Replace the hardcoded block:

```ts
/** ISO 3166-1 alpha-2 codes for countries we operate in. Kept in sync with
 *  src/data/catalog-countries.ts. The enum is duplicated here because Zod
 *  needs literal strings at schema-definition time. */
const COUNTRY_CODES = [
  'cy','gr','de','at','fr','it','es','pt',
  'lb','ae','sa','eg','il','jo','ma','za',
  'jp','au','nz','in','sg',
  'us','ca','br','mx',
] as const;
```

with a derive from the single source of truth:

```ts
import { COUNTRIES } from './data/catalog-countries';

/** Country codes accepted in product frontmatter — derived from the single
 *  source of truth (catalog-countries.ts) so the two lists can never drift. */
const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];
```

(Place the `import` with the other top-of-file imports.)

- [ ] **Step 2: Update `src/content/config.ts` the same way**

Same replacement, but the import path is one level deeper:

```ts
import { COUNTRIES } from '../data/catalog-countries';

const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];
```

- [ ] **Step 3: Typecheck + confirm the duplicates are gone**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx astro check 2>&1 | tail -3 && grep -rn "'cy','gr','de','at'" src/content.config.ts src/content/config.ts || echo "no hardcoded lists remain"`
Expected: no new `astro check` errors; grep prints `no hardcoded lists remain`.

- [ ] **Step 4: Run the full test suite (nothing regressed)**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npm test 2>&1 | grep -E "Test Files|Tests "`
Expected: all files pass.

- [ ] **Step 5: Commit**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git add src/content.config.ts src/content/config.ts
git commit -m "refactor(content): derive country-code enum from catalog-countries (no drift)"
```

---

## Task 3: Migration — insert not-yet-mapped ISO countries into group A

**Files:**
- Create: `supabase/migrations/0047_group_countries_all_iso.sql`
- Consumes: `scratchpad/group_countries_values.sql` (from Task 1, Step 3)

**Interfaces:**
- Consumes: the `(code, name)` VALUES block.
- Produces: `group_countries` grows to 249 rows total; group A becomes 239.

- [ ] **Step 1: Assemble the migration**

Create `supabase/migrations/0047_group_countries_all_iso.sql`. Paste the VALUES block from `scratchpad/group_countries_values.sql` into the `candidates` CTE. The insert only adds a candidate whose code and name are BOTH absent, so existing B–E/A rows are untouched and the UNIQUE(`country`) constraint is respected. Idempotent.

```sql
-- 0047_group_countries_all_iso.sql — populate group A with every ISO 3166-1
-- country not already assigned to a pricing group, so the public "Select your
-- country" modal can offer the full world list. Existing A–E assignments are
-- left as-is (group_countries.country is UNIQUE — a country is in one group).
-- Idempotent: re-running inserts nothing.
with candidates(country_code, country) as (
  values
    -- <PASTE scratchpad/group_countries_values.sql HERE>
)
insert into public.group_countries (group_code, country, country_code, sort_order)
select 'A', c.country, c.country_code,
       1000 + row_number() over (order by c.country)
from candidates c
where not exists (
        select 1 from public.group_countries g
        where lower(g.country_code) = lower(c.country_code)
      )
  and not exists (
        select 1 from public.group_countries g2
        where g2.country = c.country
      );
```

- [ ] **Step 2: Apply the migration live**

Run: `cd "/private/tmp/claude-501/-Users-marios-Desktop-Cursor-elysse-demo/4c86cf2f-8130-4cd5-a704-3455d42e2113/scratchpad" && python3 sbq.py "/Users/marios/Desktop/Cursor/elysse demo/supabase/migrations/0047_group_countries_all_iso.sql"`
Expected: `[]` (success, no rows returned).

- [ ] **Step 3: Verify totals**

Run:
```bash
cd "/private/tmp/claude-501/-Users-marios-Desktop-Cursor-elysse-demo/4c86cf2f-8130-4cd5-a704-3455d42e2113/scratchpad"
echo "select count(*) as total, count(*) filter (where group_code='A') as group_a from public.group_countries;" | python3 sbq.py -
```
Expected: `total` = 249, `group_a` = 239.

- [ ] **Step 4: Verify idempotency (re-apply → no change)**

Run: `python3 sbq.py "/Users/marios/Desktop/Cursor/elysse demo/supabase/migrations/0047_group_countries_all_iso.sql"` then re-run the count from Step 3.
Expected: still `total` = 249, `group_a` = 239.

- [ ] **Step 5: Commit**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git add supabase/migrations/0047_group_countries_all_iso.sql
git commit -m "feat(catalog): map all unassigned ISO countries to group A (0047)"
```

---

## Task 4: End-to-end verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run (background): `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx astro dev --port 4399`
Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:4399/catalog/valves/` returns `200`.

- [ ] **Step 2: Open the selector and assert the full list**

With Playwright: `localStorage.clear()`, reload `/catalog/valves/`, open the country dropdown, and read the options.
Expected: ~249 options; the first five (before the separator) are Cyprus, Austria, Egypt, Lebanon, Greece in that order; the alphabetical tail includes brand-new entries (e.g. Japan, Brazil, India).

- [ ] **Step 3: Pick a brand-new country and confirm it resolves**

Select `Japan` (`jp`), click Continue.
Expected: modal closes; `localStorage['elysee.country']` = `jp`; the catalog root gets `data-active-country="jp"`; `groupForCountry('jp')` resolves to `A` (confirm via the page: `await import('/src/scripts/catalog/country-group.ts').then(m => m.groupForCountry('jp'))` → `'A'`).

- [ ] **Step 4: Stop the dev server.**

---

## Self-Review

**Spec coverage:**
- "249 ISO codes in the selector" → Task 1 (COUNTRIES) + Task 3 (group_countries). ✓
- "not-yet-mapped → group A, existing untouched" → Task 3 double `not exists` guard. ✓
- "keep featured 5 on top" → Global Constraints + Task 1 test asserts they're present; `CountryModal.astro` featured logic unchanged. ✓
- "sync the duplicated Zod enum" → Task 2 (derive, both config files). ✓
- "region internal only, 4 buckets" → Task 1 generator BUCKETS + test asserts valid region. ✓
- "don't touch countries master table / modal layout" → not modified in any task. ✓
- "verify 249 / A=239 + idempotency + browser" → Task 3 Steps 3-4, Task 4. ✓

**Placeholder scan:** The only intentional paste-point is `<PASTE scratchpad/group_countries_values.sql HERE>` in Task 3 Step 1, produced verbatim by Task 1 Step 3 — not a placeholder for the engineer to invent. No TODO/TBD.

**Type consistency:** `CountryDef { code, label, region }`, `Region` union, and `COUNTRIES` shape are used identically in the generator, the test, and `catalog-countries.ts`. `COUNTRY_CODES` cast `as [string, ...string[]]` matches Zod's `z.enum` arg. `group_countries` columns (`group_code, country, country_code, sort_order`) match the live schema.
