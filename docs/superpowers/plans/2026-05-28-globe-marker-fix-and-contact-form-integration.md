# Globe Marker Fix + Contact Form Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) fix the 3D globe so markers land on the correct geographic positions of the Earth texture; (2) add a contact form next to the globe that auto-fills with the clicked country's details when a marker is tapped.

**Architecture:** The marker bug is a single-line projection error in `src/components/ui/3d-globe.tsx:99–104` — the longitude is shifted 180° because the formula assumes the Blue Marble texture has its seam at the front of the sphere, but the texture's seam is at the back. The contact form sits in a new wrapper React island (`WorldwideExplorer.tsx`) that owns both the globe and the form so they can share `selectedCountry` state. The country → contact-details lookup is a new typed data file derived from existing `subBrandWise / subBrandPrime / subBrandRohrsysteme` callouts plus `worldwideOffices` and `companyContact`.

**Tech Stack:** Astro 6, React 19 island (`client:visible`), `@react-three/fiber` 9 / `three` 0.184, `motion/react` for the existing reduced-motion guard, `mailto:` form submit pattern (same as `ContactForm.astro`).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/ui/3d-globe.tsx` | Modify `latLngToVector3()` (lines 92–106) — fix the longitude term. No other changes. |
| `src/data/worldwide-contacts.ts` | NEW — typed `Record<CountryCode, CountryContact>` derived from existing site-content. Single source of truth for the click-to-fill panel. |
| `src/components/contact/WorldwideExplorer.tsx` | NEW — top-level React island. Holds `selectedCountry` state, renders the globe on the left and the contact details + form on the right. |
| `src/components/contact/ElyseeGlobe.tsx` | Modify — accept an `onCountrySelect(code: string \| null)` callback prop. Look up which marker was clicked and pass the country code up to the parent. |
| `src/pages/contact/worldwide/index.astro` | Modify (around lines 195–217) — swap `<ElyseeGlobe client:visible />` for `<WorldwideExplorer client:visible />`. Drop the `ContactForm` import if it's no longer used elsewhere on this page. |

---

## Task 1: Diagnose and fix the marker projection bug

**Files:**
- Modify: `src/components/ui/3d-globe.tsx:92–106`

### Background

The current formula in `src/components/ui/3d-globe.tsx`:
```ts
const phi = (90 - lat) * (Math.PI / 180);
const theta = (lng + 180) * (Math.PI / 180);

const x = -(radius * Math.sin(phi) * Math.cos(theta));
const z = radius * Math.sin(phi) * Math.sin(theta);
const y = radius * Math.cos(phi);
```

The `(lng + 180)` shift rotates every marker 180° around the Y axis, putting the Mediterranean cluster on the wrong meridian relative to the NASA Blue Marble texture currently in use (whose seam is at ±180° longitude, with Greenwich = 0° at the texture's horizontal centre).

The known-good formula for a Y-up sphere with an equirectangular texture whose left edge maps to lng = -180°:
```ts
const phi = (90 - lat) * (Math.PI / 180);
const theta = (lng + 180) * (Math.PI / 180);   // theta unchanged
const x = -(radius * Math.sin(phi) * Math.cos(theta));
const y = radius * Math.cos(phi);
const z = radius * Math.sin(phi) * Math.sin(theta);
```
…is actually the same formula. So the issue is more subtle — the SphereGeometry default UV mapping in three.js applies the texture starting at +X (not -X), so the formula needs `theta = -lng * π/180` instead.

The fix below corrects this empirically: change the longitude term from `(lng + 180)` to `-lng`, which puts a marker at lng=0 (Greenwich) exactly at the prime meridian visible on the front of the sphere.

### Steps

- [ ] **Step 1.1: Confirm the bug visually before changing anything**

Run: `npm run dev` (use the running server at http://localhost:4321/contact/worldwide/ if already up).
Open: http://localhost:4321/contact/worldwide/, scroll to the "Where we ship · Sixty-five destinations" section.
Look at the globe — Cyprus and Lebanon (which sit at lng ≈ 33–35°E) should appear on the right side of Europe / east Mediterranean. Australia (lng ≈ 151°E) and Japan (lng ≈ 139°E) should appear far to the right after rotating the globe.
Expected: positions look shifted; some flags appear over wrong landmasses or over the ocean.

If positions look CORRECT already, skip to Step 1.5 (no projection edit needed) and move on to Task 2.

- [ ] **Step 1.2: Read the current `latLngToVector3` function**

Run: `sed -n '92,106p' "src/components/ui/3d-globe.tsx"`
Expected output:
```ts
/**
 * Convert latitude/longitude to 3D cartesian coordinates
 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}
```

- [ ] **Step 1.3: Edit the function — replace the longitude line and the x/z signs**

Open `src/components/ui/3d-globe.tsx` and replace lines 99–104 with:
```ts
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = -lng * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
```
(Two changes: `theta = -lng * …` and the `x` term loses its leading minus sign.)

- [ ] **Step 1.4: Verify the fix in the browser**

The Astro/Vite dev server auto-reloads on save. Reload `/contact/worldwide/` (hard reload, Cmd+Shift+R).
Scroll to the globe. With the globe at its default rotation, you should see:
- **Cyprus 🇨🇾, Lebanon 🇱🇧, Greece 🇬🇷, Italy 🇮🇹, Turkey 🇹🇷** clustered around the east Mediterranean (centre-top of the visible face).
- **Egypt 🇪🇬, Saudi 🇸🇦, UAE 🇦🇪** just south of that cluster, on/near the Arabian peninsula.
- **South Africa 🇿🇦** at the southern tip of Africa.
- Rotate the globe (drag) to see **Japan 🇯🇵 / Australia 🇦🇺 / New Zealand 🇳🇿** on the far side.
- **UK / Germany / France 🇬🇧 🇩🇪 🇫🇷** are over western Europe (rotate slightly).
- **Austria 🇦🇹** sits between Germany and Italy.

If any marker is still over the wrong landmass, the conversion has a different bug — pause and check by adding a temporary debug marker at `{ lat: 0, lng: 0 }` (Gulf of Guinea, off west Africa). It MUST land in the ocean directly below the western bulge of Africa. If it lands elsewhere, the texture is rotated or the y/x axis convention is different and the team needs to re-investigate before continuing.

- [ ] **Step 1.5: Commit**

```bash
git add src/components/ui/3d-globe.tsx
git commit -m "fix(globe): correct lat/lng projection so markers land on the right meridians"
```

---

## Task 2: Create the country → contact lookup data file

**Files:**
- Create: `src/data/worldwide-contacts.ts`

### Background

When a user clicks a marker, the right-hand panel needs to display: the country name, the address/phone/email if Elysée has an office there (Cyprus / Lebanon / Egypt / Austria), or "Routed via the Cyprus Export Department" + the export manager's contact if it's a partner country. The form's "Country" select / readonly field also needs filling. All of this comes from existing data already in `src/data/site-content.ts` (`subBrandWise`, `subBrandPrime`, `subBrandRohrsysteme`, `worldwideOffices`) and `src/data/navigation.ts` (`companyContact`).

This task centralises everything into one typed lookup so the React component has a flat `Record<string, CountryContact>` to read from.

### Steps

- [ ] **Step 2.1: Create the file**

Create `src/data/worldwide-contacts.ts` with the full content:
```ts
/**
 * Country -> contact details lookup for the worldwide globe explorer.
 *
 * Subsidiaries (CY / LB / EG / AT) get their own dedicated address + phone +
 * email pulled from src/data/site-content.ts. Partner countries route through
 * the Cyprus export desk (pulled from `worldwideOffices[0]`).
 *
 * Country codes are ISO 3166-1 alpha-2, lowercase, matching the flagcdn URLs
 * we already use as marker images in ElyseeGlobe.tsx.
 */

export interface CountryContact {
  /** ISO alpha-2 country code, lowercase (e.g. 'cy', 'lb'). */
  code: string;
  /** Human-readable country name. */
  country: string;
  /** Shown in the form's country field and the details card heading. */
  label: string;
  /** Whether this country hosts an Elysée subsidiary or routes via Cyprus. */
  kind: 'subsidiary' | 'partner';
  /** Multi-line postal address. Use \n for line breaks. */
  address: string;
  /** Phone in human-readable form. Use international format. */
  phone: string;
  /** Email — for partner countries, this is the Cyprus export desk. */
  email: string;
  /** Optional external website (subsidiaries only). */
  website?: string;
  /** Optional sub-line shown under the country in the details card. */
  note?: string;
  /** Pre-fills the form's message field. */
  prefilledMessage: string;
}

const exportDesk = {
  phone: '+357 22 455 008',
  email: 'yerolemos@elysee.com.cy',
  address: '5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
};

const partner = (code: string, country: string, label = country): CountryContact => ({
  code,
  country,
  label,
  kind: 'partner',
  address: exportDesk.address,
  phone: exportDesk.phone,
  email: exportDesk.email,
  note: 'Routed via the Cyprus Export Department',
  prefilledMessage: `Hi Elysée — I am enquiring from ${country}. Please put me in touch with your local distributor or representative.`,
});

export const worldwideContacts: Record<string, CountryContact> = {
  cy: {
    code: 'cy',
    country: 'Cyprus',
    label: 'Cyprus · Ergates (HQ)',
    kind: 'subsidiary',
    address: '5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
    phone: '+357-22-455000',
    email: 'info@elysee.com.cy',
    note: 'Group headquarters · Export desk',
    prefilledMessage: 'Hi Elysée — I would like to discuss a request with the Cyprus head office.',
  },
  lb: {
    code: 'lb',
    country: 'Lebanon',
    label: 'Lebanon · Byblos (Elysée WISE)',
    kind: 'subsidiary',
    address: 'Byblos – Gherfine - Main Road\nLebanon',
    phone: '00961 9 624551',
    email: 'sales@elyseewise.com',
    website: 'www.elyseewise.com',
    note: 'Polyethylene pipe manufacturing',
    prefilledMessage: 'Hi Elysée WISE — I would like to enquire about your Polyethylene pipe range.',
  },
  eg: {
    code: 'eg',
    country: 'Egypt',
    label: 'Egypt · 10th of Ramadan (Elysée PRIME)',
    kind: 'subsidiary',
    address: '3T15 Al Tajamouat Industrial Park\n10th of Ramadan, Egypt',
    phone: '+2 012 8901 1102',
    email: 'info@elyseeprime.com',
    website: 'www.elyseeprime.com',
    note: 'Irrigation hose manufacturing',
    prefilledMessage: 'Hi Elysée PRIME — I would like to enquire about your irrigation hose range.',
  },
  at: {
    code: 'at',
    country: 'Austria',
    label: 'Austria · Ennsdorf (Elysée Rohrsysteme)',
    kind: 'subsidiary',
    address: 'Wirtschaftspark Straße 3 / 4\nA-4482 Ennsdorf bei Enns, Austria',
    phone: '+43 (0) 7223-82700-18',
    email: 'info@elysee-rohrsysteme.com',
    website: 'www.elysee-rohrsysteme.com',
    note: 'European distribution & representation',
    prefilledMessage: 'Hi Elysée Rohrsysteme — I would like to discuss European distribution.',
  },
  gb: partner('gb', 'United Kingdom'),
  de: partner('de', 'Germany'),
  fr: partner('fr', 'France'),
  it: partner('it', 'Italy'),
  gr: partner('gr', 'Greece'),
  ae: partner('ae', 'United Arab Emirates', 'UAE'),
  sa: partner('sa', 'Saudi Arabia'),
  tr: partner('tr', 'Turkey'),
  jp: partner('jp', 'Japan'),
  za: partner('za', 'South Africa'),
  au: partner('au', 'Australia'),
  nz: partner('nz', 'New Zealand'),
};
```

- [ ] **Step 2.2: Verify it type-checks**

Run: `npm run build`
Expected: 59 pages built, no TS errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/data/worldwide-contacts.ts
git commit -m "feat(contacts): add worldwide-contacts lookup for click-to-fill globe form"
```

---

## Task 3: Surface `onCountrySelect` from ElyseeGlobe

**Files:**
- Modify: `src/components/contact/ElyseeGlobe.tsx`

### Background

`ElyseeGlobe` currently has no callbacks — the underlying `Globe3D` exposes `onMarkerClick(marker: GlobeMarker)` but we don't propagate it. We need to extract the country code from the clicked marker's flag URL (`https://flagcdn.com/w80/cy.png` → `cy`) and pass it up.

### Steps

- [ ] **Step 3.1: Read the current file**

Run: `cat "src/components/contact/ElyseeGlobe.tsx"`
Confirm: today the component takes no props and renders `<Globe3D markers={…} config={…} />` with no click handler.

- [ ] **Step 3.2: Replace the file with the prop-aware version**

Overwrite `src/components/contact/ElyseeGlobe.tsx` with:
```tsx
'use client';
/**
 * Elysée-specific wrapper around the Aceternity 3D globe.
 * Mounts as a React island on /contact/worldwide/ via `client:visible` so
 * the heavy Three.js bundle only loads when the user scrolls to the section.
 *
 * Markers: the four Elysée subsidiaries (Cyprus / Lebanon / Egypt / Austria)
 * plus a representative country in each export region. Flag images via
 * the free flagcdn.com CDN. Clicking a marker calls `onCountrySelect` with
 * the lowercase ISO alpha-2 code parsed from the marker's image URL.
 */
import { Globe3D, type GlobeMarker } from '@/components/ui/3d-globe';
import { useReducedMotion } from 'motion/react';

const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`;

const elyseeMarkers: GlobeMarker[] = [
  // 4 subsidiaries
  { lat: 35.0717, lng: 33.4136, src: flag('cy'), label: 'Cyprus · Ergates (HQ)' },
  { lat: 34.1230, lng: 35.6519, src: flag('lb'), label: 'Lebanon · Byblos (Elysée WISE)' },
  { lat: 30.3082, lng: 31.7426, src: flag('eg'), label: 'Egypt · 10th of Ramadan (Elysée PRIME)' },
  { lat: 48.2189, lng: 14.5408, src: flag('at'), label: 'Austria · Ennsdorf (Elysée Rohrsysteme)' },
  // Europe partners
  { lat: 51.5074, lng:  -0.1278, src: flag('gb'), label: 'United Kingdom' },
  { lat: 52.5200, lng:  13.4050, src: flag('de'), label: 'Germany' },
  { lat: 48.8566, lng:   2.3522, src: flag('fr'), label: 'France' },
  { lat: 41.9028, lng:  12.4964, src: flag('it'), label: 'Italy' },
  { lat: 37.9838, lng:  23.7275, src: flag('gr'), label: 'Greece' },
  // MENA / Asia partners
  { lat: 25.2048, lng:  55.2708, src: flag('ae'), label: 'United Arab Emirates' },
  { lat: 24.7136, lng:  46.6753, src: flag('sa'), label: 'Saudi Arabia' },
  { lat: 41.0082, lng:  28.9784, src: flag('tr'), label: 'Turkey' },
  { lat: 35.6762, lng: 139.6503, src: flag('jp'), label: 'Japan' },
  // Africa partner
  { lat: -26.2041, lng: 28.0473, src: flag('za'), label: 'South Africa' },
  // Oceania
  { lat: -33.8688, lng: 151.2093, src: flag('au'), label: 'Australia' },
  { lat: -41.2865, lng: 174.7762, src: flag('nz'), label: 'New Zealand' },
];

/** Extract the lowercase ISO code from a flagcdn.com URL. */
function codeFromMarker(marker: GlobeMarker): string | null {
  const m = marker.src.match(/flagcdn\.com\/w\d+\/([a-z]{2})\.png$/);
  return m ? m[1] : null;
}

type Props = {
  /** Fires with the ISO alpha-2 country code when a marker is clicked. */
  onCountrySelect?: (code: string) => void;
};

export default function ElyseeGlobe({ onCountrySelect }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="relative w-full aspect-square max-w-[680px] mx-auto">
      <Globe3D
        markers={elyseeMarkers}
        className="w-full h-full"
        config={{
          atmosphereColor: '#4c6830',
          atmosphereIntensity: reduce ? 8 : 18,
          bumpScale: 4,
          autoRotateSpeed: reduce ? 0 : 0.25,
        }}
        onMarkerClick={(marker) => {
          const code = codeFromMarker(marker);
          if (code && onCountrySelect) onCountrySelect(code);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3.3: Verify it type-checks**

Run: `npm run build`
Expected: still 59 pages built, no TS errors. (We haven't wired it into the page yet — the new prop is optional, the existing `client:visible` call site that passes no props still works.)

- [ ] **Step 3.4: Commit**

```bash
git add src/components/contact/ElyseeGlobe.tsx
git commit -m "feat(globe): expose onCountrySelect callback so a parent can react to marker clicks"
```

---

## Task 4: Build the WorldwideExplorer wrapper (globe + form)

**Files:**
- Create: `src/components/contact/WorldwideExplorer.tsx`

### Background

The wrapper is the new outermost island that the worldwide page mounts. It owns one piece of state — the currently selected country code — and renders the globe on the left and the details/form on the right. When `selectedCountry` is null we show a "Tap any country on the globe" placeholder. When it's set, we show the address card and a prefilled form.

The form keeps the same submission pattern as `src/components/ContactForm.astro`: `action="mailto:..."` with `enctype="text/plain"`. We use `<form>` with controlled inputs so React can swap the message text when a marker is clicked.

### Steps

- [ ] **Step 4.1: Create the file**

Create `src/components/contact/WorldwideExplorer.tsx` with:
```tsx
'use client';
/**
 * Side-by-side globe + contact form for /contact/worldwide/.
 *
 * State flow: ElyseeGlobe -> onCountrySelect(code) -> WorldwideExplorer
 * state.selectedCode -> details card (address/phone/email) + form fields
 * (country, prefilled message). Default state: no country picked, the
 * right column shows a small instruction card.
 */
import { useState } from 'react';
import ElyseeGlobe from './ElyseeGlobe';
import { worldwideContacts, type CountryContact } from '@/data/worldwide-contacts';

export default function WorldwideExplorer() {
  const [code, setCode] = useState<string | null>(null);
  const contact: CountryContact | null = code ? worldwideContacts[code] ?? null : null;

  // Controlled form state — name & email are user input; message starts as
  // the country's prefilledMessage and resets every time a new country is picked.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSelect = (next: string) => {
    setCode(next);
    const c = worldwideContacts[next];
    if (c) setMessage(c.prefilledMessage);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

      {/* Globe (left) */}
      <div class="lg:col-span-7">
        <ElyseeGlobe onCountrySelect={handleSelect} />
      </div>

      {/* Details + form (right) */}
      <aside class="lg:col-span-5 lg:sticky lg:top-32">
        {!contact && (
          <div class="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8">
            <p class="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Tap any country</p>
            <p class="text-base text-ink/75 leading-relaxed">
              Pick a marker on the globe to see local contact details and start a message —
              we will route it to the closest Elysée office or partner.
            </p>
          </div>
        )}

        {contact && (
          <div>
            {/* Country details */}
            <div class="bg-surface border-l-4 border-brand-500 p-6 md:p-8 mb-6">
              <p class="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
                {contact.kind === 'subsidiary' ? 'Subsidiary' : 'Partner country'}
              </p>
              <h3 class="mt-2 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{contact.label}</h3>
              {contact.note && <p class="mt-2 text-sm text-ink/65">{contact.note}</p>}
              <div aria-hidden="true" class="mt-5 h-px w-10 bg-brand-500"></div>

              <dl class="mt-5 space-y-4 text-sm">
                <div>
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Address</dt>
                  <dd class="mt-1 text-ink whitespace-pre-line leading-relaxed">{contact.address}</dd>
                </div>
                <div>
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Phone</dt>
                  <dd class="mt-1 text-ink">
                    <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} class="hover:text-brand-500 transition-colors duration-200">{contact.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</dt>
                  <dd class="mt-1 text-ink">
                    <a href={`mailto:${contact.email}`} class="hover:text-brand-500 transition-colors duration-200">{contact.email}</a>
                  </dd>
                </div>
                {contact.website && (
                  <div>
                    <dt class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Website</dt>
                    <dd class="mt-1 text-ink">
                      <a href={`https://${contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" class="hover:text-brand-500 transition-colors duration-200">{contact.website}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Pre-filled contact form */}
            <form
              action={`mailto:${contact.email}`}
              method="post"
              encType="text/plain"
              class="bg-surface-alt p-6 md:p-8"
            >
              <p class="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-5">Send a message</p>

              <label class="block mb-4">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Country</span>
                <input
                  type="text"
                  name="country"
                  value={contact.country}
                  readOnly
                  class="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink"
                />
              </label>

              <label class="block mb-4">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Your name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  class="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
                  placeholder="Jane Doe"
                />
              </label>

              <label class="block mb-4">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  class="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
                  placeholder="jane@company.com"
                />
              </label>

              <label class="block mb-6">
                <span class="text-[10px] uppercase tracking-[0.25em] text-ink/55">Message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  class="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500 resize-none"
                />
              </label>

              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
              >
                Send message
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
```

NOTE: this file uses JSX `class` attributes (NOT `className`). That is unusual for React but **wrong** — `class` does not apply in React. Before saving, change every `class=` to `className=` to match React semantics. (Astro's `.astro` templates use `class`; React `.tsx` files use `className`.)

- [ ] **Step 4.2: Re-edit the file: replace every `class=` with `className=`**

Run a single sed pass on the file you just created:
```bash
sed -i '' 's/ class=/ className=/g' "src/components/contact/WorldwideExplorer.tsx"
```
(macOS sed; Linux: `sed -i 's/ class=/ className=/g' …`.)

Then re-open the file and visually scan — every `class="…"` should now read `className="…"`. The `<svg>` `stroke-width`, `stroke-linecap`, `stroke-linejoin` should also become camelCase: `strokeWidth`, `strokeLinecap`, `strokeLinejoin`. Update them manually:

Find the submit-button SVG, change:
```
stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
```
to:
```
strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
```

- [ ] **Step 4.3: Verify it type-checks**

Run: `npm run build`
Expected: 59 pages built, no TS errors. (Still no consumer of `WorldwideExplorer` — we add it in Task 5.)

- [ ] **Step 4.4: Commit**

```bash
git add src/components/contact/WorldwideExplorer.tsx
git commit -m "feat(worldwide): add WorldwideExplorer wrapper combining globe and click-to-fill contact form"
```

---

## Task 5: Mount the WorldwideExplorer on the worldwide page

**Files:**
- Modify: `src/pages/contact/worldwide/index.astro` (around lines 195–217)

### Steps

- [ ] **Step 5.1: Read the current globe section**

Run: `sed -n '195,217p' "src/pages/contact/worldwide/index.astro"`
You should see a section that mounts `<ElyseeGlobe client:visible />` inside a `<Container size="xl">`, with the heading "Sixty-five destinations." and a subtitle.

- [ ] **Step 5.2: Replace the section to mount the explorer instead**

Find the section bounded by `{/* ===== 3D GLOBE … */}` and replace it with:
```astro
  {/* ===== 3D GLOBE + INTERACTIVE CONTACT =====
       The explorer wraps the globe and a contact panel — when the user
       clicks a country marker, the right column populates with that
       country's address and the message field gets a country-specific
       starter line. Lazy-hydrated to defer the Three.js bundle. */}
  <section class="bg-surface">
    <Container size="xl" class="py-20 md:py-28">
      <header class="max-w-3xl mb-12 md:mb-16">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">Where we ship</p>
        <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
          Sixty-five destinations.
        </h2>
        <p data-reveal data-reveal-delay="240" class="mt-6 max-w-2xl text-base md:text-lg text-ink/70 leading-relaxed">
          Tap any marker — Elysée's four subsidiaries or any of the partner countries — and the panel on the right fills with the local contact and a pre-written message.
        </p>
      </header>
      <WorldwideExplorer client:visible />
    </Container>
  </section>
```

- [ ] **Step 5.3: Update the imports at the top of the file**

Open `src/pages/contact/worldwide/index.astro`. In the frontmatter, find:
```astro
import ElyseeGlobe from '../../../components/contact/ElyseeGlobe.tsx';
```
Replace with:
```astro
import WorldwideExplorer from '../../../components/contact/WorldwideExplorer.tsx';
```

If `ContactForm` is no longer used anywhere on this page after the swap (search for `<ContactForm`), remove its import as well. (The plan replaces the only `<ContactForm>` usage on this page with the explorer, so the import should go.)

- [ ] **Step 5.4: Build + visual sanity check**

Run: `npm run build`
Expected: 59 pages built, no TS errors.

Reload http://localhost:4321/contact/worldwide/ and scroll to the globe.

Expected layout: globe on the left (col-span-7), right column shows "Tap any country" placeholder card (col-span-5). On a < 1024 px viewport the two stack vertically.

- [ ] **Step 5.5: Commit**

```bash
git add src/pages/contact/worldwide/index.astro
git commit -m "feat(worldwide): replace standalone globe with WorldwideExplorer (globe + click-to-fill form)"
```

---

## Task 6: Playwright visual verification of the interactive flow

**Files:**
- (No file changes — runtime verification only.)

### Steps

- [ ] **Step 6.1: Navigate to the page**

Use the Playwright MCP tool to navigate to `http://localhost:4321/contact/worldwide/` and scroll to the "Sixty-five destinations" heading.

- [ ] **Step 6.2: Confirm initial state**

Take a viewport screenshot. The globe should be on the left with all 16 flag markers anchored on the correct continents (verify Cyprus over Cyprus, Australia over Australia, etc.). The right column should show the "Tap any country" placeholder card.

Save the screenshot as `globe-initial.png` and confirm by reading it back.

- [ ] **Step 6.3: Click the Cyprus marker programmatically**

Run via `browser_evaluate`:
```js
() => {
  // The globe markers are rendered as <Html> elements with the flag <img> inside.
  // Find the one whose src ends with /cy.png and click it.
  const img = Array.from(document.querySelectorAll('img'))
    .find(i => /flagcdn\.com\/w\d+\/cy\.png$/.test(i.src));
  if (!img) return { err: 'no cy img' };
  // Click the closest interactive ancestor.
  const target = img.closest('[onClick], button, [role="button"], div');
  target?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { clicked: true };
}
```

- [ ] **Step 6.4: Verify the right column updated**

After a short delay, query the DOM:
```js
() => {
  const heading = document.querySelector('aside h3')?.textContent;
  const message = (document.querySelector('aside textarea') as HTMLTextAreaElement | null)?.value;
  return { heading, message };
}
```

Expected:
- `heading` contains "Cyprus · Ergates (HQ)"
- `message` starts with "Hi Elysée — I would like to discuss"

If both pass, the click-to-fill flow works.

- [ ] **Step 6.5: Click a partner country (e.g. Japan)**

Repeat Step 6.3 substituting `jp.png`. Verify the heading reads "Japan" and the message mentions "I am enquiring from Japan".

- [ ] **Step 6.6: Take a final screenshot showing the populated form**

Save it as `worldwide-explorer-filled.png` and read it back to confirm the layout looks balanced — globe left, populated details + form right, no overflow.

- [ ] **Step 6.7: Commit verification artefacts (optional, if your repo tracks them)**

If the project keeps Playwright screenshots, commit them; otherwise just delete the files. The verification is informational, no code change.

---

## Task 7: Tidy up & final build

**Files:**
- (None — verification only.)

### Steps

- [ ] **Step 7.1: Full build clean**

Run: `npm run build`
Expected: 59 pages built, no TS errors, no warnings about removed imports.

- [ ] **Step 7.2: Confirm there are no stray `ElyseeGlobe` imports in `src/pages/contact/worldwide/index.astro`**

Run: `grep -n "ElyseeGlobe\|ContactForm" "src/pages/contact/worldwide/index.astro"`
Expected: empty output (the page imports `WorldwideExplorer` only).

- [ ] **Step 7.3: Final manual test in the browser**

Open http://localhost:4321/contact/worldwide/ in a fresh tab.
Scroll to the globe.
- Click Cyprus → right column shows the head-office address, phone `+357-22-455000`, email `info@elysee.com.cy`, message starts "Hi Elysée — I would like to discuss…"
- Click Lebanon → switches to Byblos address, `00961 9 624551`, `sales@elyseewise.com`, website link visible.
- Click Australia → "Routed via the Cyprus Export Department", phone `+357 22 455 008`, message starts "Hi Elysée — I am enquiring from Australia."
- Drag the globe — markers stay glued to the correct landmasses (Tokyo over Japan, Sydney over Australia, etc.).
- Type into the name / email fields; the country field stays read-only.
- Click "Send message" → triggers a `mailto:` link with the current values.

- [ ] **Step 7.4: Final commit (if anything new staged)**

```bash
git status
# If nothing staged, you are done. Otherwise:
git add -A
git commit -m "chore(worldwide): finalise globe + click-to-fill form integration"
```

---

## Self-Review

**Spec coverage check:**
1. ✅ "Position of the points and the maps are not correct" — Task 1 fixes `latLngToVector3`.
2. ✅ "Contact form next to the globe" — Task 4 adds `WorldwideExplorer` with grid layout (col-span-7 globe / col-span-5 form).
3. ✅ "When the user click on a country it will show the contact of this country" — Tasks 2 + 3 + 4 build the data lookup, callback, and details card.
4. ✅ "And fill the contact form also" — Task 4 controlled-form state pre-fills country + message; Task 6.4 verifies it.

**Placeholder scan:** every step has full code or full commands; no "TBD", no "implement later".

**Type consistency:** `CountryContact` declared in Task 2 is consumed unchanged in Task 4. `onCountrySelect: (code: string) => void` signature matches between Task 3 (`ElyseeGlobe` prop) and Task 4 (`WorldwideExplorer` callback).

**Gotcha called out:** Task 4 explicitly warns about the React `class` → `className` and SVG kebab-case → camelCase transformation, plus a `sed` snippet to do the swap.

**Reduced-motion behaviour:** preserved (the existing `useReducedMotion()` guard in `ElyseeGlobe.tsx` still dampens atmosphere and disables auto-rotate). No regression.
