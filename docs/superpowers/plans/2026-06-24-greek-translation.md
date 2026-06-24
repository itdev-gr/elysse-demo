# Site-Wide Greek Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every static UI string in the project a Greek translation (everything except the products/catalog area), using the existing client-side language-swap mechanism.

**Architecture:** Extend the existing `data-i18n` swap (`src/scripts/i18n-text.client.ts`, already loaded site-wide via `BaseLayout.astro`). English stays server-rendered as the fallback; a central per-section Greek dictionary supplies the Greek, applied via a tiny `i18nAttr()` helper that emits the `data-i18n` JSON. The swap script is extended once to also translate element attributes (placeholders, alt, aria-label) for forms/images.

**Tech Stack:** Astro `.astro` pages/components, React `.tsx` (nav, forms), TypeScript, vitest, Playwright (visual verification).

**Decisions (from brainstorming):** client-side `data-i18n` swap (not SSR locale routing); UI/static text only (NOT DB-authored blog/news/insights bodies); Greek strings in central dictionary files. English remains the in-DOM source/fallback.

**Excluded:** `src/pages/products/**`, `src/pages/catalog/**`, and `src/components/catalog/**` (their dynamic content already has its own i18n; product copy handled separately later).

---

## File Structure

- `src/data/i18n/el/<section>.ts` — one flat `Record<string,string>` per section, keyed by the **English** UI string → Greek. Sections: `shared`, `home`, `about`, `services`, `contact`, `innovation`, `insights`, `green`, `legal`.
- `src/data/i18n/el/index.ts` — barrel merging all sections into one `EL: Record<string,string>`.
- `src/lib/i18n.ts` — `i18nAttr(en)` (text) and `i18nAttrFor(map)` (attributes) helpers + `missingGreek()` dev check.
- `src/lib/i18n.test.ts` — dictionary integrity + helper tests.
- `src/components/i18n/T.astro` — convenience component for brand-new plain-text nodes.
- `src/scripts/i18n-text.client.ts` — extended to swap attributes (`data-i18n-attr`).
- All `.astro` pages + `Header.astro`, `Footer.astro`, `MegaNav.tsx`, `MobileMegaNav.tsx`, forms — gain `data-i18n` attributes (existing markup preserved; we only add an attribute, per the design-preservation rule).

**Primary wiring pattern (design-preserving):** add one attribute to the existing element.
```astro
<!-- before --> <h1 class="text-3xl font-heavy">About Us</h1>
<!-- after  --> <h1 class="text-3xl font-heavy" data-i18n={i18nAttr('About Us')}>About Us</h1>
```
`i18nAttr` returns `undefined` when no Greek exists, so the attribute is omitted and the element stays English. The swap script only touches leaf text nodes — **apply `data-i18n` only to elements whose content is plain text** (no child elements). For mixed content, wrap each text leaf in its own `<span data-i18n=…>`.

---

### Task 1: i18n helper, dictionary scaffold, attribute swap + tests

**Files:**
- Create: `src/data/i18n/el/shared.ts`, `src/data/i18n/el/index.ts`
- Create: `src/lib/i18n.ts`, `src/lib/i18n.test.ts`
- Create: `src/components/i18n/T.astro`
- Modify: `src/scripts/i18n-text.client.ts`
- Test: `src/scripts/i18n-text.client.test.ts`

- [ ] **Step 1: Seed the shared dictionary** — `src/data/i18n/el/shared.ts`

```ts
// English UI string → Greek. Shared chrome (nav, footer, common CTAs).
export const shared: Record<string, string> = {
  'About Us': 'Σχετικά με εμάς',
  'Our Services': 'Οι υπηρεσίες μας',
  'Products': 'Προϊόντα',
  'Innovation': 'Καινοτομία',
  'Insights': 'Άρθρα & Ενημέρωση',
  'Contact': 'Επικοινωνία',
  'Home': 'Αρχική',
  'Read more': 'Διαβάστε περισσότερα',
  'Learn more': 'Μάθετε περισσότερα',
  'Privacy Policy': 'Πολιτική Απορρήτου',
  'Terms of Use': 'Όροι Χρήσης',
  'Terms of Supply': 'Όροι Προμήθειας',
  'All rights reserved.': 'Με την επιφύλαξη παντός δικαιώματος.',
};
```

- [ ] **Step 2: Barrel** — `src/data/i18n/el/index.ts`

```ts
import { shared } from './shared';
// Section dictionaries are added here as each section task lands.
export const EL: Record<string, string> = {
  ...shared,
};
```

- [ ] **Step 3: Helper** — `src/lib/i18n.ts`

```ts
import { EL } from '../data/i18n/el';

/** Languages that receive a client-side swap. English is the in-DOM base. */
export const I18N_LOCALES = ['el'] as const;
export type I18nLocale = (typeof I18N_LOCALES)[number];

/** data-i18n value for a text node: JSON of available translations, or
 *  undefined when none exist (element stays English, no attribute emitted). */
export function i18nAttr(en: string): string | undefined {
  const out: Record<string, string> = {};
  const el = EL[en];
  if (el && el.trim()) out.el = el;
  return Object.keys(out).length ? JSON.stringify(out) : undefined;
}

/** data-i18n-attr value: { attrName: {el: "…"}, … } for attributes like
 *  placeholder / alt / aria-label / title. Keys with no Greek are dropped. */
export function i18nAttrFor(attrs: Record<string, string>): string | undefined {
  const out: Record<string, Record<string, string>> = {};
  for (const [attr, en] of Object.entries(attrs)) {
    const el = EL[en];
    if (el && el.trim()) out[attr] = { el };
  }
  return Object.keys(out).length ? JSON.stringify(out) : undefined;
}

/** Dev/test: English strings missing a Greek entry. */
export function missingGreek(strings: string[]): string[] {
  return [...new Set(strings)].filter((s) => !EL[s] || !EL[s].trim());
}
```

- [ ] **Step 4: Write failing helper + dictionary tests** — `src/lib/i18n.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { i18nAttr, i18nAttrFor, missingGreek } from './i18n';
import { EL } from '../data/i18n/el';

describe('i18nAttr', () => {
  it('emits Greek JSON for a known string', () => {
    expect(i18nAttr('About Us')).toBe(JSON.stringify({ el: 'Σχετικά με εμάς' }));
  });
  it('returns undefined for an unknown string', () => {
    expect(i18nAttr('No Such String 12345')).toBeUndefined();
  });
});

describe('i18nAttrFor', () => {
  it('maps known attributes only', () => {
    expect(i18nAttrFor({ placeholder: 'About Us', alt: 'No Such String 12345' }))
      .toBe(JSON.stringify({ placeholder: { el: 'Σχετικά με εμάς' } }));
  });
});

describe('dictionary integrity', () => {
  it('has no empty Greek values', () => {
    const empty = Object.entries(EL).filter(([, v]) => !v || !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });
  it('missingGreek flags only absent keys', () => {
    expect(missingGreek(['About Us', 'No Such String 12345'])).toEqual(['No Such String 12345']);
  });
});
```

- [ ] **Step 5: Run** — `npx vitest run src/lib/i18n.test.ts` → PASS (helper + dict already exist from Steps 1-3).

- [ ] **Step 6: Extend the swap script for attributes** — `src/scripts/i18n-text.client.ts`. Replace the `apply` function and keep the rest:

```ts
const KEY = 'elysee.lang';
// Remembers each element's original (English) attribute values, captured once.
const origAttrs = new WeakMap<Element, Record<string, string>>();

function currentLang(): string {
  try { return localStorage.getItem(KEY) || 'en'; } catch { return 'en'; }
}

function apply(lang: string): void {
  // Text nodes.
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.textContent ?? '';
    let map: Record<string, string> = {};
    try { map = JSON.parse(el.dataset.i18n || '{}'); } catch { /* keep English */ }
    const t = lang === 'en' ? '' : (map[lang] || '');
    el.textContent = t && t.trim() ? t : (el.dataset.i18nEn ?? '');
  });
  // Attributes (placeholder, alt, aria-label, title, …).
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    let map: Record<string, Record<string, string>> = {};
    try { map = JSON.parse(el.dataset.i18nAttr || '{}'); } catch { return; }
    let saved = origAttrs.get(el);
    if (!saved) { saved = {}; for (const a of Object.keys(map)) saved[a] = el.getAttribute(a) ?? ''; origAttrs.set(el, saved); }
    for (const [attr, langs] of Object.entries(map)) {
      const t = lang === 'en' ? '' : (langs[lang] || '');
      el.setAttribute(attr, t && t.trim() ? t : (saved[attr] ?? ''));
    }
  });
}

apply(currentLang());
document.addEventListener('elysee:lang', (e) => {
  const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
  if (next) apply(next);
});

export {};
```

- [ ] **Step 7: Add a failing attribute-swap test** — append to `src/scripts/i18n-text.client.test.ts` (mirror the existing text-swap test setup; uses jsdom + the `elysee:lang` event):

```ts
it('swaps a placeholder attribute and restores English', async () => {
  document.body.innerHTML =
    `<input data-i18n-attr='{"placeholder":{"el":"Αναζήτηση"}}' placeholder="Search" />`;
  await import('./i18n-text.client');
  document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: 'el' } }));
  const input = document.querySelector('input')!;
  expect(input.getAttribute('placeholder')).toBe('Αναζήτηση');
  document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: 'en' } }));
  expect(input.getAttribute('placeholder')).toBe('Search');
});
```

- [ ] **Step 8: Run** — `npx vitest run src/scripts/i18n-text.client.test.ts` → PASS (note: existing test file may `vi.resetModules()` between cases; follow its pattern).

- [ ] **Step 9: Convenience component** — `src/components/i18n/T.astro` (for new plain-text nodes; existing elements use `i18nAttr` inline)

```astro
---
import { i18nAttr } from '../../lib/i18n';
interface Props { t: string; as?: keyof HTMLElementTagNameMap; class?: string; }
const { t, as: Tag = 'span', class: className } = Astro.props;
---
<Tag class={className} data-i18n={i18nAttr(t)}>{t}</Tag>
```

- [ ] **Step 10: Verify build + commit**

Run: `npx astro check --minimumSeverity error` → 0 errors; `npx vitest run` → all pass.
```bash
git add src/data/i18n src/lib/i18n.ts src/lib/i18n.test.ts src/components/i18n/T.astro src/scripts/i18n-text.client.ts src/scripts/i18n-text.client.test.ts
git commit -m "feat(i18n): central Greek dictionary + helper, attribute-aware swap"
```

---

### Task 2: Shared chrome — Header, Footer, navigation

**Files:**
- Modify: `src/components/Header.astro`, `src/components/Footer.astro`
- Modify: `src/components/nav/MegaNav.tsx`, `src/components/nav/MobileMegaNav.tsx`
- Modify: `src/data/i18n/el/shared.ts` (add any missing strings)

- [ ] **Step 1: Inventory the visible English** — list every static label in Header/Footer/nav (top-level nav items, dropdown headings, footer column titles, legal links, copyright, newsletter/CTA text). Add each English→Greek pair to `shared.ts`.

- [ ] **Step 2: Wire each leaf text node.** `.astro` example (Footer):
```astro
<a href="/legal/privacy-policy/" data-i18n={i18nAttr('Privacy Policy')}>Privacy Policy</a>
```
`.tsx` example (MegaNav top-level item) — `i18nAttr` works in TSX too:
```tsx
import { i18nAttr } from '../../lib/i18n';
<a href="/about-us/" data-i18n={i18nAttr('About Us')}>About Us</a>
```
Import `i18nAttr` into each file. Do NOT alter classes/structure — only add the attribute.

- [ ] **Step 3: Verify** — `npx astro check --minimumSeverity error` → 0 errors. Run the app, switch language to **GR**, and confirm nav + footer flip to Greek on every page (Header/Footer come from `BaseLayout`, so this covers the whole site). Note: nav is React (`client:*`); confirm labels stay Greek after hydration and re-flip on toggle.

- [ ] **Step 4: Commit**
```bash
git add src/components/Header.astro src/components/Footer.astro src/components/nav/MegaNav.tsx src/components/nav/MobileMegaNav.tsx src/data/i18n/el/shared.ts
git commit -m "feat(i18n): translate shared header, footer and navigation to Greek"
```

---

## Per-section content tasks (Tasks 3–10)

Each section task follows the **same procedure** (repeat per task, scoped to that section's files):

1. **Add the section dictionary** `src/data/i18n/el/<section>.ts` exporting `export const <section>: Record<string,string> = { … }`, and spread it into `src/data/i18n/el/index.ts`.
2. **Extract** every visible static English string in the section's pages/components (headings, paragraphs, list items, button/link labels, captions, form labels, and attribute text: `placeholder`, `alt`, `aria-label`, `title`).
3. **Translate** each to Greek in the section dictionary (keyed by the English string).
4. **Wire** each element: text nodes get `data-i18n={i18nAttr('…')}`; attributes get `data-i18n-attr={i18nAttrFor({ placeholder: '…', alt: '…' })}`. Preserve all existing markup/classes — only add attributes. Split mixed-content blocks so each `data-i18n` sits on a plain-text leaf.
5. **Verify** (per task): `npx astro check --minimumSeverity error` → 0 errors; load each page, toggle to GR, confirm no English remains in the in-scope content; `npx vitest run` stays green.
6. **Commit** `feat(i18n): translate <section> to Greek`.

Worked example (about-us hero, real strings to include in `about.ts`):
```ts
export const about: Record<string, string> = {
  'About Us': 'Σχετικά με εμάς',            // already in shared; safe duplicate (same value)
  'Our Story': 'Η ιστορία μας',
  'Company Structure': 'Εταιρική δομή',
  'Vision, Mission & Values': 'Όραμα, Αποστολή & Αξίες',
  'Quality & Certifications': 'Ποιότητα & Πιστοποιήσεις',
};
```
```astro
<h1 class="text-4xl font-heavy" data-i18n={i18nAttr('Our Story')}>Our Story</h1>
```

### Task 3: Home — `src/pages/index.astro` (+ any home-only components it imports)
### Task 4: About-us — `src/pages/about-us/index.astro`, `company-structure/index.astro`, `history/index.astro`, `vision-mission-values/index.astro`, `quality-certifications/{index,general,management-system,compression-fittings,pe-pipes,pvc-pipes}.astro`
### Task 5: Our-services — `src/pages/our-services/{agriculture,building-infrastructure,industry,landscape}.astro`
### Task 6: Contact — `src/pages/contact/{careers,local,prime,rohrsysteme,wise,worldwide}/index.astro` (+ the contact form and `JobForm.tsx` labels/placeholders/buttons; `WorldwideExplorer.tsx` UI labels)
### Task 7: Innovation — `src/pages/innovation/{why-innovation,research-development,network-partners,innovate-with-us}/index.astro`, `funded-research-projects/index.astro`, `insights/index.astro` (+ `IdeaForm.tsx` labels/placeholders). For `[slug]` pages translate only the surrounding UI (labels, breadcrumbs, CTAs) — NOT the DB-authored body.
### Task 8: Insights listings — `src/pages/insights/{blog,news,ebooks,exhibitions,media}/index.astro` UI (titles, filters, "Read more", empty states). `[slug]` detail pages: surrounding UI only; the markdown body is DB content (out of scope).
### Task 9: Green-elysée — `src/pages/green-elysee/{index,certifications,insights,reports}/index.astro` (keep the brand name "Green Elysée" untranslated)
### Task 10: Legal — `src/pages/legal/{privacy-policy,terms-of-supply,terms-of-use}.astro` (long prose; wrap each block-level text leaf)

---

### Task 11: Coverage verification

**Files:**
- Create: `scripts/check-i18n-coverage.mjs` (Node script run via `node`)
- Optional: a Playwright spec for the visual sweep.

- [ ] **Step 1: Coverage script** — scan in-scope `.astro` pages for visible text-bearing elements lacking `data-i18n`, and report any `data-i18n`/`data-i18n-attr` whose key is missing from `EL`. Print a per-file count of untranslated candidates (heuristic: elements with non-whitespace text and no `data-i18n`). Exclude `src/pages/products`, `src/pages/catalog`, `src/components/catalog`.

```js
// scripts/check-i18n-coverage.mjs — heuristic coverage report (advisory, non-blocking).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const ROOTS = ['src/pages', 'src/components'];
const EXCLUDE = ['src/pages/products', 'src/pages/catalog', 'src/components/catalog'];
function walk(d, out = []) { for (const e of readdirSync(d)) { const p = join(d, e);
  if (EXCLUDE.some((x) => p.startsWith(x))) continue;
  statSync(p).isDirectory() ? walk(p, out) : p.endsWith('.astro') && out.push(p); } return out; }
let flagged = 0;
for (const f of ROOTS.flatMap((r) => walk(r))) {
  const src = readFileSync(f, 'utf8');
  // Headings/paragraphs/buttons/links with text but no data-i18n (rough heuristic).
  const m = src.match(/<(h[1-6]|p|button|a|li|span)\b(?![^>]*data-i18n)[^>]*>\s*[A-Za-z][^<]{2,}</g) || [];
  if (m.length) { console.log(`${f}: ${m.length} untranslated candidate(s)`); flagged += m.length; }
}
console.log(`\nTotal untranslated candidates: ${flagged}`);
```

- [ ] **Step 2: Run + triage** — `node scripts/check-i18n-coverage.mjs`. Review flagged candidates per file; wire any genuinely-missed strings (re-run the relevant section task). The heuristic over-reports (matches code-like text); treat as a checklist, not a gate.

- [ ] **Step 3: Visual sweep** — with the app running and language = GR, open each in-scope page and confirm the visible UI is Greek (optionally automate with Playwright: navigate, set `localStorage['elysee.lang']='el'`, reload, snapshot, assert key headings are Greek).

- [ ] **Step 4: Final checks + commit**
```bash
npx astro check --minimumSeverity error   # 0 errors
npx vitest run                              # all pass
git add scripts/check-i18n-coverage.mjs
git commit -m "chore(i18n): add Greek translation coverage check"
```

---

## Notes / constraints

- **Flash:** English renders first, then swaps to Greek on load (inherent to the chosen client-swap approach). Accepted.
- **Leaf-only:** the swap sets `textContent`, which wipes child elements — only put `data-i18n` on plain-text leaves; split mixed content.
- **Design preservation:** we only ADD attributes to existing elements; no markup/class/layout changes ([[feedback_preserve_existing_design]]).
- **Out of scope:** products/catalog, and DB-authored bodies (blog/news/insights/ebooks). Those are content, translated separately.
- **Same English → same Greek:** keys are global; identical English strings across sections must share the same Greek (the barrel merge makes the last one win).
