# Multilingual Dictionaries (de / es / fr) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** For every UI/prose string that already has a Greek (`el`) translation, add German (`de`), Spanish (`es`), and French (`fr`) translations, so the language switcher's DE/ES/FR options render fully translated pages.

**Architecture:** The i18n machinery is already 4-locale (`src/lib/i18n.ts` loops over `['el','de','es','fr']`; the client swap script and `LanguageToggle` are language-generic). The only remaining work is **content**: mirror the 9 Greek section dictionaries into `de/`, `es/`, `fr/` with identical keys and translated values, then wire each into the three `index.ts` aggregators. A key-parity test guards against silent English fallback from missing keys.

**Tech Stack:** Astro 6, TypeScript, Vitest. Dictionaries are plain `Record<string,string>` TS modules keyed by the English source string.

## Global Constraints

*(Every task's requirements implicitly include this section.)*

- **Scope:** Only mirror strings that already exist in the corresponding `src/data/i18n/el/<section>.ts` file. Do **not** add new keys, translate new pages, or touch DB-driven product data. `catalog` is already done in all four languages — **skip it**.
- **Key parity is absolute:** each `de|es|fr/<section>.ts` must contain the **exact same keys** (verbatim English, including whitespace, casing, punctuation, leading/trailing spaces, and `·` bullets) as its `el/<section>.ts` twin. Translate **values only**.
- **Register:** formal / B2B corporate — German **Sie**, French **vous**, Spanish **usted**.
- **Do-not-translate rules** (per each el file's own header): keep brand/proper names (Elysée, Green Elysée, Elysée WISE / PRIME / Rohrsysteme, WISE), certification body names & acronyms (ISO, DVGW, KIWA, …), EU programme codes, partner names, person names, city/country names, addresses, emails, phone/fax numbers, URLs, dates, numeric stats, filenames, and bracketed placeholders **verbatim**. Preserve punctuation, em-dashes, units, `PDF` tokens, and any leading/trailing spaces in the value.
- **English stays the in-DOM fallback** — never edit English source text or `el/` files.
- **Additive only:** do not modify `src/lib/i18n.ts`, the client swap script, `LanguageToggle.astro`, or the user's other uncommitted files (`SkuTable.astro`, `content.ts`, the `catalog.ts` twins). This plan adds new `de|es|fr` section files, edits the three `de|es|fr/index.ts`, and edits `src/lib/i18n.test.ts` + adds one script.
- **Glossary:** use the agreed term table in Task 1 for all recurring brand/industry terms so sections stay consistent.
- **Commits:** do not `git push`; commit locally per task. (User reviews before any push.)
- **Test command:** `npm test` (Vitest, runs once). Expected green after every task except where noted.

---

## File Structure

**Created (28 files):**
- `scripts/check-i18n-parity.mjs` — advisory CLI parity report (Task 1).
- `src/data/i18n/{de,es,fr}/{shared,home,services,about,contact,innovation,insights,green,legal}.ts` — 27 dictionary files (Tasks 2–10).

**Modified (4 files):**
- `src/data/i18n/de/index.ts`, `src/data/i18n/es/index.ts`, `src/data/i18n/fr/index.ts` — import + spread the 9 sections (edited incrementally, one section per task).
- `src/lib/i18n.test.ts` — fix the multi-locale assertions; add integrity + orphan tests (Task 1) and the final parity gate (Task 11).

**Reference (read-only, the source of keys):**
- `src/data/i18n/el/<section>.ts` — the Greek twin whose keys each task mirrors. Its header comment lists that section's do-not-translate rules.

---

### Task 1: Test harness, glossary, parity script

Sets up the guardrails **before** any translations. After this task, `npm test` is green (DE/ES/FR still only contain `catalog`, whose keys are a subset of EL, so the integrity + orphan tests pass). The advisory script reports ~1,010 missing keys per language — expected.

**Files:**
- Modify: `src/lib/i18n.test.ts`
- Create: `scripts/check-i18n-parity.mjs`
- Create: `docs/superpowers/plans/2026-07-08-translation-glossary.md`

**Interfaces:**
- Consumes: `EL`, `DE`, `ES`, `FR` from `src/data/i18n/{el,de,es,fr}` (already exported).
- Produces: the glossary table (consumed by Tasks 2–10) and `check-i18n-parity.mjs` (run by Tasks 2–11).

- [ ] **Step 1: Create the glossary reference**

Create `docs/superpowers/plans/2026-07-08-translation-glossary.md`:

```markdown
# Translation Glossary (formal register: Sie / vous / usted)

Keep verbatim (never translate): Elysée, Green Elysée, Elysée WISE / PRIME /
Rohrsysteme, WISE; ISO/DVGW/KIWA & all cert acronyms; EU programme & project
codes; partner, person, city and country names; addresses, emails, phones,
URLs, dates, numeric stats, filenames, bracketed placeholders.

| English | de | es | fr |
|---|---|---|---|
| About Us | Über uns | Sobre nosotros | À propos |
| Our Services | Unsere Leistungen | Nuestros servicios | Nos services |
| Products | Produkte | Productos | Produits |
| Innovation | Innovation | Innovación | Innovation |
| Insights | Aktuelles | Novedades | Actualités |
| Contact / Contact Us | Kontakt | Contacto | Contact |
| Home | Startseite | Inicio | Accueil |
| Menu | Menü | Menú | Menu |
| Read more | Weiterlesen | Leer más | En savoir plus |
| Learn more | Mehr erfahren | Más información | En savoir plus |
| Discover | entdecken | descubrir | découvrir |
| Download PDF | PDF herunterladen | Descargar PDF | Télécharger le PDF |
| catalogue / catalogues | Katalog / Kataloge | catálogo / catálogos | catalogue / catalogues |
| leaflet | Prospekt | folleto | dépliant |
| compression fittings | Klemmfittings | accesorios de compresión | raccords à compression |
| fittings | Fittings | accesorios | raccords |
| polyethylene (PE) pipe | Polyethylenrohr (PE) | tubería de polietileno (PE) | tube en polyéthylène (PE) |
| PVC pipe | PVC-Rohr | tubería de PVC | tube en PVC |
| valves | Armaturen | válvulas | robinets |
| filters | Filter | filtros | filtres |
| irrigation | Bewässerung | riego | irrigation |
| saddles | Anbohrschellen | collarines de toma | colliers de prise |
| sprinklers | Regner | aspersores | arroseurs |
| water supply | Wasserversorgung | abastecimiento de agua | adduction d'eau |
| sewerage | Abwasser | saneamiento | assainissement |
| range (product range) | Sortiment | gama | gamme |
| In this section | In diesem Bereich | En esta sección | Dans cette section |
| Get in touch | Kontakt aufnehmen | Póngase en contacto | Contactez-nous |
| Send message | Nachricht senden | Enviar mensaje | Envoyer le message |

Extend this table whenever a new recurring term appears; keep all sections
consistent with it.
```

- [ ] **Step 2: Write the parity CLI script**

Create `scripts/check-i18n-parity.mjs`:

```js
// Advisory i18n parity report. Regex-extracts top-level keys from each
// dictionary section file and reports, per language, how many EL keys are
// still missing and whether any orphan keys exist. Authoritative parity is
// enforced by src/lib/i18n.test.ts. Usage:
//   node scripts/check-i18n-parity.mjs                # whole tree
//   node scripts/check-i18n-parity.mjs --section home # one section file
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'src/data/i18n';
const LANGS = ['de', 'es', 'fr'];
// First quoted token at 2-space indent, immediately followed by a colon = a key.
const KEY_SRC = "^  (['\"`])((?:\\\\.|(?!\\1).)*)\\1\\s*:";

function keysFromFile(path) {
  const src = readFileSync(path, 'utf8');
  const re = new RegExp(KEY_SRC, 'gm');
  const keys = new Set();
  let m;
  while ((m = re.exec(src)) !== null) keys.add(m[2]);
  return keys;
}

function keysForLang(lang, section) {
  if (section) {
    try { return keysFromFile(join(BASE, lang, `${section}.ts`)); }
    catch { return new Set(); }
  }
  const keys = new Set();
  for (const f of readdirSync(join(BASE, lang))) {
    if (!f.endsWith('.ts') || f === 'index.ts') continue;
    for (const k of keysFromFile(join(BASE, lang, f))) keys.add(k);
  }
  return keys;
}

const i = process.argv.indexOf('--section');
const section = i >= 0 ? process.argv[i + 1] : null;
const el = keysForLang('el', section);
let failed = 0;

for (const lang of LANGS) {
  const have = keysForLang(lang, section);
  const missing = [...el].filter((k) => !have.has(k));
  const orphan = [...have].filter((k) => !el.has(k));
  console.log(`${lang.toUpperCase()}${section ? '/' + section : ''}: ${have.size}/${el.size} keys · ${missing.length} missing · ${orphan.length} orphan`);
  if (orphan.length) {
    console.log(`  ⚠ ORPHAN (not in EL): ${orphan.slice(0, 8).join(' | ')}${orphan.length > 8 ? ' …' : ''}`);
    failed = 1;
  }
  if (missing.length && missing.length <= 40) {
    console.log(`  missing: ${missing.join(' | ')}`);
  }
}
process.exit(failed);
```

- [ ] **Step 3: Run the parity script (baseline)**

Run: `node scripts/check-i18n-parity.mjs`
Expected: three lines like `DE: 6/1016 keys · 1010 missing · 0 orphan` (catalog's 6 keys present, the 9 sections missing, **0 orphan**). If any language shows orphans, stop and fix.

- [ ] **Step 4: Fix the existing multi-locale assertions in the test**

In `src/lib/i18n.test.ts`, replace the two brittle exact-JSON assertions (they currently expect only `{el:…}` and will break once DE/ES/FR gain those keys) with locale-tolerant ones.

Replace the `i18nAttr` block:

```ts
describe('i18nAttr', () => {
  it('emits Greek in the JSON for a known string', () => {
    const parsed = JSON.parse(i18nAttr('About Us')!);
    expect(parsed.el).toBe('Σχετικά με εμάς');
  });
  it('returns undefined for an unknown string', () => {
    expect(i18nAttr('No Such String 12345')).toBeUndefined();
  });
});
```

Replace the `i18nAttrFor` "maps known attributes only" test body:

```ts
  it('maps known attributes only', () => {
    const parsed = JSON.parse(i18nAttrFor({ placeholder: 'About Us', alt: 'No Such String 12345' })!);
    expect(parsed.placeholder.el).toBe('Σχετικά με εμάς');
    expect(parsed.alt).toBeUndefined();
  });
```

- [ ] **Step 5: Add integrity + orphan tests for DE/ES/FR**

Add to the top imports of `src/lib/i18n.test.ts`:

```ts
import { DE } from '../data/i18n/de';
import { ES } from '../data/i18n/es';
import { FR } from '../data/i18n/fr';
```

Append this describe block:

```ts
describe('multilingual dictionaries (de/es/fr)', () => {
  const DICTS = { DE, ES, FR } as const;
  for (const [name, dict] of Object.entries(DICTS)) {
    it(`${name} has no empty/blank values`, () => {
      const empty = Object.entries(dict).filter(([, v]) => !v || !v.trim()).map(([k]) => k);
      expect(empty).toEqual([]);
    });
    it(`${name} has no keys absent from EL (no orphans)`, () => {
      const orphans = Object.keys(dict).filter((k) => !(k in EL));
      expect(orphans).toEqual([]);
    });
  }
});
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS (all existing + new integrity/orphan tests green; DE/ES/FR currently only hold `catalog`).

- [ ] **Step 7: Commit**

```bash
git add scripts/check-i18n-parity.mjs src/lib/i18n.test.ts docs/superpowers/plans/2026-07-08-translation-glossary.md
git commit -m "test(i18n): multi-locale assertions, de/es/fr integrity + parity harness"
```

---

## Tasks 2–10 — the section translations

Each task translates one Greek section file into de/es/fr and wires it into the three index aggregators. **The mechanical process is identical for every section**; each task below states its own exact paths, key count, section-specific do-not-translate notes, and verification command.

**The uniform per-section procedure (applies to every Task 2–10):**

1. Open the source `src/data/i18n/el/<section>.ts` — it is the authoritative **key list** and its header lists the section's do-not-translate items.
2. Create `src/data/i18n/de/<section>.ts` with this exact shape:

   ```ts
   // English UI string → German. <same one-line section description as the el header>.
   // Keyed by the English text so it doubles as the source.
   export const <section>: Record<string, string> = {
     '<EXACT English key #1>': '<German translation>',
     // … every key from el/<section>.ts, in the same order, values translated …
   };
   ```
   Then the same for `es/<section>.ts` (`→ Spanish`) and `fr/<section>.ts` (`→ French`).
   - Copy each English key **verbatim** (whitespace/punctuation/casing/bullets/leading spaces included). Translate the value using the glossary + formal register. Leave do-not-translate tokens verbatim.
3. Wire the section into each index. In `src/data/i18n/de/index.ts`, add `import { <section> } from './<section>';` alongside the others and add `...<section>,` to the `DE` spread. Repeat in `es/index.ts` (spread `ES`) and `fr/index.ts` (spread `FR`).
4. Run `node scripts/check-i18n-parity.mjs --section <section>` → expect `DE/<section>: N/N keys · 0 missing · 0 orphan` for all three languages.
5. Run `npm test` → PASS.
6. Commit: `git add src/data/i18n/{de,es,fr}/<section>.ts src/data/i18n/{de,es,fr}/index.ts && git commit -m "feat(i18n): translate <section> to de/es/fr"`.

> **Worked example** (first keys of `shared`, showing expected quality/format for all three files). `de/shared.ts`:
> ```ts
> // English UI string → German. Shared chrome (nav, footer, common CTAs) reused
> // across the whole site. Keyed by the English text so it doubles as the source.
> export const shared: Record<string, string> = {
>   'About Us': 'Über uns',
>   'Our Services': 'Unsere Leistungen',
>   'Products': 'Produkte',
>   'Innovation': 'Innovation',
>   'Insights': 'Aktuelles',
>   'Contact': 'Kontakt',
>   // … remaining shared keys …
> };
> ```
> `es/shared.ts` values: `Sobre nosotros`, `Nuestros servicios`, `Productos`, `Innovación`, `Novedades`, `Contacto`.
> `fr/shared.ts` values: `À propos`, `Nos services`, `Produits`, `Innovation`, `Actualités`, `Contact`.

---

### Task 2: `shared` (104 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/shared.ts`; Modify `src/data/i18n/{de,es,fr}/index.ts`.
**Source/keys:** `src/data/i18n/el/shared.ts` — 104 keys. Header: *"Shared chrome (nav, footer, common CTAs) reused across the whole site."*
**Section notes:** contains the nav labels the React nav islands read via `tFor` — translating this section makes the DE/ES/FR nav work. Keep `Tel`/`Fax`/`Email` abbreviations and brand tokens verbatim.
Follow the uniform per-section procedure. Verify: `node scripts/check-i18n-parity.mjs --section shared` → `0 missing · 0 orphan` ×3, then `npm test`. Commit `feat(i18n): translate shared to de/es/fr`.

### Task 3: `home` (31 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/home.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/home.ts` — 31 keys. Header: *"HOME PAGE and its home-only components (Hero copy, the four full-screen text panels, the services cards, the News & Updates panel)."*
**Section notes:** the key `'English'` maps in el to `'Ελληνικά'` (the toggle's active-language self-label) — for de/es/fr map it to `'Deutsch'` / `'Español'` / `'Français'` respectively. Strings already in `shared.ts` are not repeated.
Follow the uniform procedure. Verify `--section home` → `0 missing · 0 orphan` ×3, `npm test`. Commit `feat(i18n): translate home to de/es/fr`.

### Task 4: `services` (21 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/services.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/services.ts` — 21 keys. Header: *"Our Services section — agriculture, landscape, building & infrastructure, industry."*
**Section notes:** service names/headlines and the `Our Services` eyebrow live in home.ts/shared.ts and are not re-added here.
Follow the uniform procedure. Verify `--section services`, `npm test`. Commit `feat(i18n): translate services to de/es/fr`.

### Task 5: `about` (329 keys — largest)

**Files:** Create `src/data/i18n/{de,es,fr}/about.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/about.ts` — 329 keys. Header: *"ABOUT-US section: Corporate Profile, History, Company Structure, Vision/Mission/Values, Quality & Certifications (plus AboutSubNav)."*
**Section notes:** the header explicitly says brand/proper names (Elysée, Green Elysée), certification body names/acronyms (DVGW, KIWA, ISO …), emails, URLs, dates and numeric stats are left untranslated — keep those verbatim. This is the biggest file; a single translator (or subagent) should do all three languages in one pass to keep terminology consistent across its many prose keys.
Follow the uniform procedure. Verify `--section about` → `0 missing · 0 orphan` ×3, `npm test`. Commit `feat(i18n): translate about to de/es/fr`.

### Task 6: `contact` (160 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/contact.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/contact.ts` — 160 keys. Header: *"CONTACT section: Local Network, Worldwide Network, Careers and the three subsidiary pages (Elysée WISE / PRIME / Rohrsysteme), plus ShopLocator, WorldwideExplorer, JobsList/JobCard."*
**Section notes:** keep subsidiary/brand names (WISE, PRIME, Rohrsysteme), city/country names, addresses, emails, phones, URLs and numeric stats verbatim. Enquiry-form UI + Tel/Fax/Email live in shared.ts and are not repeated.
Follow the uniform procedure. Verify `--section contact`, `npm test`. Commit `feat(i18n): translate contact to de/es/fr`.

### Task 7: `innovation` (97 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/innovation.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/innovation.ts` — 97 keys. Header: *"Innovation section (Why Innovation, R&D, Funded Research Projects, Innovation Insights, Network & Partners, Innovate with Us)."*
**Section notes:** keep EU programme codes, project acronyms, partner names, emails, URLs, dates, funding figures verbatim; DB-authored project/article bodies are not in this file.
Follow the uniform procedure. Verify `--section innovation`, `npm test`. Commit `feat(i18n): translate innovation to de/es/fr`.

### Task 8: `insights` (63 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/insights.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/insights.ts` — 63 keys. Header: *"Insights listing + detail UI — static chrome only (eyebrows, hero copy, empty/error states, back links, share labels, buttons)."*
**Section notes:** DB-authored content (titles, excerpts, bodies, authors, dates, tags) is never in this file. Some keys are composite eyebrows like `'Insights · Blog'` — translate the words, keep the ` · ` separator and the proper-noun tail (`Blog`, `News`, etc.) as written.
Follow the uniform procedure. Verify `--section insights`, `npm test`. Commit `feat(i18n): translate insights to de/es/fr`.

### Task 9: `green` (121 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/green.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/green.ts` — 121 keys. Header: *"Green Elysée section (/green-elysee/, /certifications/, /reports/, /insights/)."*
**Section notes:** keep `Green Elysée`/`Elysée`, cert acronyms, report/eBook titles & filenames, dates and numeric stats verbatim. **Watch leading-space keys** — several keys begin with a space and `·` (e.g. `' · About the programme'`); reproduce the leading space and bullet exactly in the key.
Follow the uniform procedure. Verify `--section green` → `0 missing · 0 orphan` ×3, `npm test`. Commit `feat(i18n): translate green to de/es/fr`.

### Task 10: `legal` (84 keys)

**Files:** Create `src/data/i18n/{de,es,fr}/legal.ts`; Modify the three `index.ts`.
**Source/keys:** `src/data/i18n/el/legal.ts` — 84 keys. Header: *"Legal-page strings keyed by the EXACT English text the shared Hero / SectionRenderer outputs; body strings keyed per paragraph (split on `/\n\n+/`)."*
**Section notes:** keep Elysée, registration numbers, addresses, emails, URLs, dates and bracketed placeholders verbatim; translate only the legal prose. Do not merge/split paragraphs — one key = one paragraph exactly as in el.
Follow the uniform procedure. Verify `--section legal`, `npm test`. Commit `feat(i18n): translate legal to de/es/fr`.

---

### Task 11: Parity gate + full verification

Locks in 100% coverage with an authoritative test and a manual pass. This is the only task that adds the strict equality gate — it now goes green because all sections exist.

**Files:** Modify `src/lib/i18n.test.ts`.

**Interfaces:**
- Consumes: `EL`, `DE`, `ES`, `FR` (full, all sections present).

- [ ] **Step 1: Run the full parity script**

Run: `node scripts/check-i18n-parity.mjs`
Expected: `DE: 1016/1016 keys · 0 missing · 0 orphan` and likewise ES, FR. If any language shows missing keys, go back to that section's task before continuing.

- [ ] **Step 2: Add the strict parity gate to the test**

Append to `src/lib/i18n.test.ts`:

```ts
describe('multilingual key parity (complete coverage)', () => {
  const DICTS = { DE, ES, FR } as const;
  for (const [name, dict] of Object.entries(DICTS)) {
    it(`${name} covers every EL key`, () => {
      const missing = Object.keys(EL).filter((k) => !(k in dict));
      expect(missing).toEqual([]);
    });
  }
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: PASS — including the three new `covers every EL key` tests.

- [ ] **Step 4: Manual browser verification**

Start the dev server (`npm run dev`) and, for each of DE / ES / FR via the nav language toggle, confirm on the Home, About-Us, and a Contact page that: the hero/body text swaps to the chosen language; the nav mega-menu labels translate (island `tFor` path); and nothing reverts to English after hydration or on navigation. Spot-check that brand names (Elysée, WISE) and cert acronyms stayed untranslated.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.test.ts
git commit -m "test(i18n): assert full de/es/fr key parity with EL"
```

---

## Self-Review

**Spec coverage:**
- 27 dictionary files (9 sections × 3 langs) → Tasks 2–10. ✅
- 3 index aggregator updates → folded into Tasks 2–10 (incremental). ✅
- i18n.test.ts multi-locale fix + integrity + parity → Tasks 1 & 11. ✅
- Formal register + glossary → Global Constraints + Task 1 glossary. ✅
- Key-parity guardrail → orphan test (Task 1) + strict parity gate (Task 11) + advisory script. ✅
- Out-of-scope items (catalog already done, search deferred, no new pages, don't touch machinery/uncommitted files) → Global Constraints. ✅

**Placeholder scan:** Test code, the parity script, the glossary, and file templates are shown in full. The ~3,030 translation *values* are the deliverable content generated during execution from each el source file (the authoritative key list) using the glossary + register + do-not-translate rules — this is data production, not an omitted code block. Each section task states its exact paths, key count, verification command, and section-specific rules. No "TBD", "similar to Task N", or "handle edge cases".

**Type consistency:** Every new file exports `const <section>: Record<string,string>` matching the `el` export name the index imports. Tests reference `EL`/`DE`/`ES`/`FR` exactly as exported. Script and test both define "parity" identically (DE/ES/FR keys ⊆ EL after Task 1; == EL after Task 11).
