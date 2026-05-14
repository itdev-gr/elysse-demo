# Sonan Bunkers — Astro Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate https://www.sonanbunkers.com/ as a pixel-faithful, fully responsive Astro + Tailwind + TypeScript site, including all pages, components, motion, and interaction behavior, with documented design system and QA evidence.

**Architecture:** Astro static site (SSG) with Tailwind for styling and design tokens, TypeScript for typed data/components, MotionOne or GSAP for animation, and Playwright both for reconnaissance (crawl + screenshots) and for visual/behavioral QA. Components are file-per-responsibility, pages are content-thin and compose components, and shared design tokens live in `tailwind.config.mjs` + `src/styles/tokens.css`.

**Tech Stack:**
- Astro 5.x (latest stable), TypeScript strict
- Tailwind CSS 3.x via `@astrojs/tailwind`
- `@astrojs/sitemap`, `@astrojs/image` (or built-in `astro:assets`)
- MotionOne (vanilla JS animation, tiny, works perfectly with Astro islands) + native CSS for hover/focus
- Embla Carousel (zero-dep slider, works without React) — or Swiper if matching exact gestures
- Playwright (crawl + screenshots + visual regression + interaction tests)
- Vitest + `@testing-library/dom` for unit-style component render tests where useful
- `axe-core` (a11y), Lighthouse CI (perf/SEO basics)
- `pnpm` package manager

**Assumptions (callable by user before execution):**
1. Project will be created at the root of `/Users/marios/Desktop/Cursor/elysse demo` even though the folder is named "elysse demo" — the source site is `sonanbunkers.com`. If a subdir is preferred, change `PROJECT_ROOT` references in tasks accordingly.
2. **User owns sonanbunkers.com** → all branding, copy, and assets can be reused. `ASSET_NOTES.md` will still be produced (provenance/optimization log), but placeholders are not expected.
3. Animation library choice: MotionOne for scroll/reveal/parallax; CSS for hover/focus/state; Embla for sliders. Swap to GSAP/Swiper only if reference uses gesture/timing patterns those libraries don't reproduce well — this decision is made in Task 12 after motion analysis.
4. Image strategy: `astro:assets` + `<Picture>` with AVIF+WebP fallback, lazy by default, eager only for above-the-fold hero.
5. Deployment target is static hosting (Netlify/Vercel/Cloudflare Pages) — no SSR adapter needed unless a discovered form requires server-side handling, in which case `@astrojs/node` adapter is added in Task 28.
6. Browser baseline: last 2 versions of Chrome/Safari/Firefox/Edge (matches Tailwind/Astro defaults).

**Phasing:**
1. Setup (Tasks 1–3)
2. Reconnaissance: crawl + screenshots + asset inventory (Tasks 4–7)
3. Design system extraction (Tasks 8–10)
4. Motion & interaction analysis (Tasks 11–12)
5. Project scaffold & tokens (Tasks 13–15)
6. Asset pipeline (Tasks 16–17)
7. Component library — atoms → molecules → organisms (Tasks 18–24)
8. Layouts & page implementation (Tasks 25–28)
9. Motion implementation (Tasks 29–31)
10. QA & deliverables (Tasks 32–36)

**Project root used throughout this plan:** `/Users/marios/Desktop/Cursor/elysse demo`
Shorthand: `${ROOT}` = `/Users/marios/Desktop/Cursor/elysse demo`

---

## Phase 1 — Setup

### Task 1: Initialize git repo and base directory structure

**Files:**
- Create: `${ROOT}/.gitignore`
- Create: `${ROOT}/README.md` (stub — final form written in Task 36)
- Create: `${ROOT}/recon/` (working dir for crawl artifacts, not shipped)
- Create: `${ROOT}/recon/screenshots/`
- Create: `${ROOT}/recon/html/`
- Create: `${ROOT}/recon/assets/`

- [ ] **Step 1: Initialize git**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git init
git branch -m main
```

- [ ] **Step 2: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.DS_Store
*.log
playwright-report/
test-results/
recon/screenshots/*.png
recon/html/*.html
.lighthouseci/
```

- [ ] **Step 3: Stub README + recon dirs**

```bash
mkdir -p recon/screenshots recon/html recon/assets
printf "# Sonan Bunkers Astro Rebuild\n\nFull README written at end of Task 36.\n" > README.md
```

- [ ] **Step 4: First commit**

```bash
git add .gitignore README.md
git commit -m "chore: initialize repo with gitignore and stub readme"
```

---

### Task 2: Install the reconnaissance toolkit

**Files:**
- Create: `${ROOT}/recon/package.json`
- Create: `${ROOT}/recon/playwright.config.ts`

The recon toolkit is intentionally separated from the Astro app so it can be deleted/archived once the rebuild ships.

- [ ] **Step 1: Create recon `package.json`**

```json
{
  "name": "sonan-recon",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "crawl": "tsx scripts/crawl.ts",
    "screenshots": "tsx scripts/screenshots.ts",
    "assets": "tsx scripts/inventory-assets.ts",
    "motion": "tsx scripts/extract-motion.ts"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "playwright": "^1.49.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "cheerio": "^1.0.0",
    "node-fetch": "^3.3.2"
  }
}
```

- [ ] **Step 2: Install + install Chromium**

```bash
cd "${ROOT}/recon"
pnpm install
pnpm exec playwright install chromium
```

- [ ] **Step 3: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'https://www.sonanbunkers.com',
    trace: 'off',
  },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'laptop-1024',  use: { viewport: { width: 1024, height: 768 } } },
    { name: 'tablet-768',   use: { viewport: { width: 768,  height: 1024 } } },
    { name: 'mobile-390',   use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } } },
  ],
});
```

- [ ] **Step 4: Commit**

```bash
cd "${ROOT}"
git add recon/package.json recon/playwright.config.ts recon/pnpm-lock.yaml
git commit -m "chore(recon): scaffold playwright toolkit for site reconnaissance"
```

---

### Task 3: Sanity-check connectivity to the source site

- [ ] **Step 1: Verify HTTP 200 and HTML returned**

```bash
curl -sI https://www.sonanbunkers.com/ | head -1
```

Expected: `HTTP/2 200` (or `HTTP/1.1 200 OK`).

- [ ] **Step 2: Confirm no Cloudflare/anti-bot wall blocks Playwright**

```bash
cd "${ROOT}/recon"
pnpm exec playwright open https://www.sonanbunkers.com/
# Visually confirm the page renders; close browser.
```

If a bot wall is encountered, add a realistic user-agent in `playwright.config.ts` `use.userAgent` before continuing.

---

## Phase 2 — Reconnaissance

### Task 4: Write the crawler

**Files:**
- Create: `${ROOT}/recon/scripts/crawl.ts`

**Crawl strategy:** Breadth-first from `/`, same-origin only, respect `robots.txt` (the user owns the site so this is courtesy, not legal — but still good practice), follow links in `<a href>`, `<area href>`, `<link rel=alternate>`, plus discover routes referenced in JSON `<script type=application/json>` blobs and obvious client-side route patterns (e.g., Next/Astro `_routes.json`).

- [ ] **Step 1: Implement crawler**

```ts
// recon/scripts/crawl.ts
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const ORIGIN = 'https://www.sonanbunkers.com';
const MAX_PAGES = 200;

type PageRecord = {
  url: string;
  status: number;
  title: string;
  links: string[];
  navLinks: string[];
  footerLinks: string[];
  forms: { action: string; method: string; fields: string[] }[];
};

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const queue = new Set<string>([ORIGIN + '/']);
  const visited = new Map<string, PageRecord>();

  while (queue.size && visited.size < MAX_PAGES) {
    const url = queue.values().next().value!;
    queue.delete(url);
    if (visited.has(url)) continue;
    const page = await ctx.newPage();
    let status = 0;
    page.on('response', (r) => { if (r.url() === url) status = r.status(); });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    } catch (e) {
      visited.set(url, { url, status: -1, title: '', links: [], navLinks: [], footerLinks: [], forms: [] });
      await page.close();
      continue;
    }

    const data = await page.evaluate(() => {
      const abs = (h: string | null) => h ? new URL(h, location.href).href : null;
      const allLinks = [...document.querySelectorAll('a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const navLinks = [...document.querySelectorAll('header a[href], nav a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const footerLinks = [...document.querySelectorAll('footer a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const forms = [...document.querySelectorAll('form')].map(f => ({
        action: f.action || location.href,
        method: (f.method || 'get').toLowerCase(),
        fields: [...f.querySelectorAll('input,select,textarea')]
          .map(el => (el as HTMLInputElement).name || (el as HTMLInputElement).id)
          .filter(Boolean),
      }));
      return { title: document.title, links: allLinks, navLinks, footerLinks, forms };
    });

    visited.set(url, { url, status, ...data });

    for (const link of data.links) {
      try {
        const u = new URL(link);
        if (u.origin !== ORIGIN) continue;
        if (u.pathname.match(/\.(pdf|jpg|jpeg|png|webp|svg|gif|mp4|zip|css|js)$/i)) continue;
        const norm = u.origin + u.pathname + (u.search || '');
        if (!visited.has(norm) && !queue.has(norm)) queue.add(norm);
      } catch {}
    }
    await page.close();
    console.log(`[${visited.size}/${MAX_PAGES}] ${url} → ${status} (${data.links.length} links)`);
  }

  const out = resolve('recon/output/pages.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify([...visited.values()], null, 2));
  await browser.close();
  console.log(`Wrote ${out}`);
}

main();
```

- [ ] **Step 2: Run crawler**

```bash
cd "${ROOT}/recon"
pnpm crawl
```

Expected: console prints discovered pages; `recon/output/pages.json` written; page count typically 5–25 for a marketing site.

- [ ] **Step 3: Eyeball the result**

```bash
cat recon/output/pages.json | head -50
```

Sanity-check: every record has `status: 200`, non-empty `title`, and the homepage's `navLinks` matches what you see in the browser. If anything is empty, fix the selectors before continuing.

- [ ] **Step 4: Commit crawl output**

```bash
cd "${ROOT}"
git add recon/scripts/crawl.ts recon/output/pages.json
git commit -m "feat(recon): crawl source site and capture page map"
```

---

### Task 5: Generate `PAGE_MAP.md`

**Files:**
- Create: `${ROOT}/recon/scripts/build-page-map.ts`
- Create: `${ROOT}/PAGE_MAP.md`

- [ ] **Step 1: Write generator**

```ts
// recon/scripts/build-page-map.ts
import { readFileSync, writeFileSync } from 'node:fs';

type P = { url: string; status: number; title: string; navLinks: string[]; footerLinks: string[]; forms: any[] };
const pages: P[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));

const rows = pages
  .sort((a, b) => a.url.localeCompare(b.url))
  .map(p => {
    const path = new URL(p.url).pathname || '/';
    return `| \`${path}\` | ${p.status} | ${p.title.replace(/\|/g, '\\|')} | ${p.forms.length} |`;
  })
  .join('\n');

const md = `# Page Map — sonanbunkers.com

Total pages discovered: **${pages.length}**

| Path | Status | Title | Forms |
|------|--------|-------|-------|
${rows}

## Navigation links (homepage)
${(pages.find(p => new URL(p.url).pathname === '/')?.navLinks ?? []).map(l => `- ${l}`).join('\n')}

## Footer links (homepage)
${(pages.find(p => new URL(p.url).pathname === '/')?.footerLinks ?? []).map(l => `- ${l}`).join('\n')}

## Forms discovered
${pages.flatMap(p => p.forms.map(f => `- \`${p.url}\` → \`${f.method.toUpperCase()} ${f.action}\` fields: ${f.fields.join(', ') || '(none)'}`)).join('\n')}
`;
writeFileSync('PAGE_MAP.md', md);
console.log('Wrote PAGE_MAP.md');
```

- [ ] **Step 2: Run + verify**

```bash
cd "${ROOT}/recon"
pnpm tsx scripts/build-page-map.ts
cd "${ROOT}"
head -30 PAGE_MAP.md
```

- [ ] **Step 3: Commit**

```bash
git add recon/scripts/build-page-map.ts PAGE_MAP.md
git commit -m "docs: generate PAGE_MAP.md from crawl"
```

---

### Task 6: Capture screenshots at 4 breakpoints for every page

**Files:**
- Create: `${ROOT}/recon/scripts/screenshots.ts`

- [ ] **Step 1: Write script**

```ts
// recon/scripts/screenshots.ts
import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BPS = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'laptop-1024',  viewport: { width: 1024, height: 768 } },
  { name: 'tablet-768',   viewport: { width: 768,  height: 1024 } },
  { name: 'mobile-390',   viewport: { width: 390,  height: 844 }, ua: devices['iPhone 14'].userAgent },
];

const pages: { url: string }[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));
const slug = (u: string) => {
  const p = new URL(u).pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  return p.replace(/\//g, '__');
};

(async () => {
  const browser = await chromium.launch();
  for (const bp of BPS) {
    const ctx = await browser.newContext({ viewport: bp.viewport, userAgent: bp.ua });
    const dir = resolve('recon/screenshots', bp.name);
    mkdirSync(dir, { recursive: true });
    for (const { url } of pages) {
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        // let lazy-loaded media settle
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(800);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${dir}/${slug(url)}.png`, fullPage: true });
        console.log(`✓ ${bp.name}  ${url}`);
      } catch (e) {
        console.warn(`✗ ${bp.name}  ${url}  ${(e as Error).message}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
```

- [ ] **Step 2: Run**

```bash
cd "${ROOT}/recon"
pnpm screenshots
```

Expected: `recon/screenshots/{desktop-1440,laptop-1024,tablet-768,mobile-390}/*.png` populated, one PNG per page per breakpoint.

- [ ] **Step 3: Spot-check**

```bash
ls recon/screenshots/desktop-1440 | wc -l
ls recon/screenshots/mobile-390   | wc -l
```

Counts should match `pages.length`. Open 2–3 PNGs visually and confirm they reflect actual page content (not error pages, not empty viewports).

- [ ] **Step 4: Commit script only (not PNGs — they're gitignored)**

```bash
cd "${ROOT}"
git add recon/scripts/screenshots.ts
git commit -m "feat(recon): capture full-page screenshots at 4 breakpoints"
```

---

### Task 7: Inventory all assets (images, fonts, icons, video)

**Files:**
- Create: `${ROOT}/recon/scripts/inventory-assets.ts`
- Create: `${ROOT}/recon/output/assets.json`
- Create: `${ROOT}/ASSET_NOTES.md` (initial version)

- [ ] **Step 1: Write inventory script**

```ts
// recon/scripts/inventory-assets.ts
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

const ORIGIN = 'https://www.sonanbunkers.com';
const pages: { url: string }[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));

type Asset = { url: string; type: string; bytes: number; usedOn: string[] };
const assets = new Map<string, Asset>();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const { url } of pages) {
  const page = await ctx.newPage();
  const seen: { url: string; type: string; bytes: number }[] = [];
  page.on('response', async (r) => {
    const ct = r.headers()['content-type'] || '';
    if (!ct.match(/^(image|font|video|audio)\//) && !r.url().match(/\.(svg|woff2?|ttf|otf|mp4|webm)(\?|$)/i)) return;
    try {
      const buf = await r.body();
      seen.push({ url: r.url(), type: ct.split(';')[0], bytes: buf.length });
    } catch {}
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
  } catch {}
  for (const a of seen) {
    if (!assets.has(a.url)) assets.set(a.url, { ...a, usedOn: [url] });
    else assets.get(a.url)!.usedOn.push(url);
  }
  await page.close();
}
await browser.close();

const out = resolve('recon/output/assets.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify([...assets.values()], null, 2));
console.log(`Inventoried ${assets.size} unique assets`);
```

- [ ] **Step 2: Run inventory**

```bash
cd "${ROOT}/recon"
pnpm assets
```

- [ ] **Step 3: Download all same-origin assets to `recon/assets/`**

Add a download step at the bottom of the script (or as a separate `download-assets.ts`) that fetches every entry whose URL starts with `ORIGIN`, preserving pathnames. Skip 3rd-party CDNs (Google Fonts, analytics pixels, etc.) — those will be re-linked in the Astro build, not self-hosted, unless the user later asks for fully offline hosting.

```ts
// append to inventory-assets.ts (or split into download-assets.ts)
import fetch from 'node-fetch';
for (const a of assets.values()) {
  if (!a.url.startsWith(ORIGIN)) continue;
  const path = new URL(a.url).pathname;
  const dest = resolve('recon/assets', path.replace(/^\//, ''));
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(a.url);
  if (!res.ok || !res.body) continue;
  await pipeline(res.body as any, createWriteStream(dest));
}
```

Re-run `pnpm assets` after adding download logic.

- [ ] **Step 4: Write initial `ASSET_NOTES.md`**

```bash
cd "${ROOT}"
cat > ASSET_NOTES.md <<'EOF'
# Asset Notes

User owns the source domain (sonanbunkers.com), so all original assets are authorized for reuse.

## Inventory
See `recon/output/assets.json` for the full machine-readable list.

## Categories
- **Images** — to be optimized (resized + AVIF/WebP) during Astro build via `astro:assets`.
- **Fonts** — see Task 14; self-host via `@fontsource/*` or `/public/fonts/*`.
- **Icons** — extract SVG paths; inline as Astro components where possible (better tree-shaking, recolor).
- **Video** — keep MP4 + add WebM fallback during Task 16.

## Replacements
(None expected — user owns the site. If any asset turns out to be a 3rd-party stock photo without a license carried over, it will be listed here with a placeholder filename and original dimensions.)
EOF
```

- [ ] **Step 5: Commit**

```bash
git add recon/scripts/inventory-assets.ts recon/output/assets.json ASSET_NOTES.md
git commit -m "feat(recon): inventory + download authorized assets"
```

---

## Phase 3 — Design System Extraction

### Task 8: Run `/design-md` against the homepage

The `/design-md` skill is registered. Invoke it via the Skill tool against the homepage HTML/screenshots gathered in Phase 2.

- [ ] **Step 1: Invoke skill**

Trigger: `Skill(skill="design-md", args="source=https://www.sonanbunkers.com/ ; screenshots=recon/screenshots ; output=DESIGN.md")`

The skill should emit `${ROOT}/DESIGN.md` covering color, type, spacing, radius, shadow, motion, components.

- [ ] **Step 2: Augment design-md output with extracted runtime tokens**

Run a one-off Playwright script that pulls computed styles for canonical elements (body, h1, h2, h3, p, button, link, primary CTA, card, input), records `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing`, `color`, `background`, `border-radius`, `box-shadow`. Append findings to `DESIGN.md` under "Runtime-extracted tokens" so the design report has both visual judgment (from design-md) and ground truth (from computed styles).

```ts
// recon/scripts/extract-tokens.ts
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('https://www.sonanbunkers.com/', { waitUntil: 'networkidle' });
const tokens = await page.evaluate(() => {
  const pick = (el: Element | null) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      fontFamily: s.fontFamily, fontSize: s.fontSize, lineHeight: s.lineHeight,
      fontWeight: s.fontWeight, letterSpacing: s.letterSpacing,
      color: s.color, background: s.backgroundColor,
      borderRadius: s.borderRadius, boxShadow: s.boxShadow,
      padding: s.padding, margin: s.margin,
    };
  };
  const selectors: Record<string, string> = {
    body: 'body', h1: 'h1', h2: 'h2', h3: 'h3', p: 'p',
    a: 'a', button: 'button, .button, [class*=btn]',
    card: '[class*=card]', input: 'input, textarea, select',
    header: 'header', footer: 'footer', nav: 'nav',
  };
  const out: Record<string, ReturnType<typeof pick>> = {};
  for (const [k, sel] of Object.entries(selectors)) out[k] = pick(document.querySelector(sel));
  return out;
});
writeFileSync('recon/output/tokens.json', JSON.stringify(tokens, null, 2));
await browser.close();
```

```bash
cd "${ROOT}/recon"
pnpm tsx scripts/extract-tokens.ts
```

- [ ] **Step 3: Commit**

```bash
cd "${ROOT}"
git add DESIGN.md recon/scripts/extract-tokens.ts recon/output/tokens.json
git commit -m "docs: extract design system via /design-md + runtime tokens"
```

---

### Task 9: Distill DESIGN.md into a Tailwind config draft

**Files:**
- Create: `${ROOT}/recon/output/tailwind-tokens.draft.mjs`

Use the colors, fonts, sizes, radii, shadows, and breakpoints from `DESIGN.md` + `tokens.json` to produce a draft Tailwind theme extension. This draft is consumed in Task 14.

- [ ] **Step 1: Hand-author the draft**

```js
// recon/output/tailwind-tokens.draft.mjs
export default {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // Populate from DESIGN.md "Color palette" section — example shape:
        // brand: { 50: '#...', 500: '#...', 900: '#...' },
        // ink:   { DEFAULT: '#0a0a0a', muted: '#6b6b6b' },
        // surface: { DEFAULT: '#ffffff', alt: '#f5f5f5' },
      },
      fontFamily: {
        // sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        // display: ['"Cormorant Garamond"', 'serif'],
      },
      fontSize: {
        // 'display-1': ['clamp(3rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        // ...
      },
      spacing: {
        // 'section-y': 'clamp(4rem, 8vw, 8rem)',
      },
      borderRadius: { /* ... */ },
      boxShadow: { /* ... */ },
      transitionTimingFunction: {
        // 'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        // '400': '400ms',
      },
    },
  },
};
```

**Fill in every commented section** by reading `DESIGN.md` and `recon/output/tokens.json`. Do not leave any of these as TODO — they ship into `tailwind.config.mjs` in Task 14.

- [ ] **Step 2: Commit**

```bash
git add recon/output/tailwind-tokens.draft.mjs
git commit -m "docs(design): draft tailwind theme tokens from extracted design system"
```

---

### Task 10: Write `RESPONSIVE_NOTES.md`

**Files:**
- Create: `${ROOT}/RESPONSIVE_NOTES.md`

For each unique page section type identified in the crawl (hero, feature grid, gallery, testimonial, contact form, footer), document how the layout adapts at each breakpoint by referencing the screenshots in `recon/screenshots/`.

- [ ] **Step 1: Author the doc**

Template — fill in concrete observations per section:

```markdown
# Responsive Notes

Source screenshots: `recon/screenshots/{desktop-1440,laptop-1024,tablet-768,mobile-390}/`.

## Breakpoints in use
- ≥ 1440 desktop
- 1024–1439 laptop
- 768–1023 tablet
- < 768 mobile

## Per-section behavior

### Hero
- desktop-1440: <text-left, image-right, headline 5xl, CTA inline>
- laptop-1024: <...>
- tablet-768: <stacked, headline 4xl, CTA full-width>
- mobile-390: <stacked, headline 3xl, image below text>

### Feature grid
- desktop-1440: 4-col, gap 32px
- laptop-1024: 3-col
- tablet-768: 2-col
- mobile-390: 1-col, gap 16px

### Gallery
...

### Footer
...
```

Fill in every section type with concrete observations (column counts, font sizes, image aspect ratios, gap values) read directly from the screenshots. **Do not leave `<...>` placeholders.**

- [ ] **Step 2: Commit**

```bash
git add RESPONSIVE_NOTES.md
git commit -m "docs: document responsive behavior per section across 4 breakpoints"
```

---

## Phase 4 — Motion & Interaction Analysis

### Task 11: Extract motion characteristics

**Files:**
- Create: `${ROOT}/recon/scripts/extract-motion.ts`
- Create: `${ROOT}/recon/output/motion.json`

Capture every `transition`, `animation`, `@keyframes`, and known animation-library marker (Framer Motion `data-framer-*`, GSAP `[gsap-*]`, AOS `[data-aos]`, Locomotive `[data-scroll]`, etc.) from the rendered DOM.

- [ ] **Step 1: Write extractor**

```ts
// recon/scripts/extract-motion.ts
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const pages: { url: string }[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

const out: any[] = [];
for (const { url } of pages.slice(0, 10)) { // sample homepage + 9 deepest
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const markers = ['data-aos', 'data-scroll', 'data-framer-name', 'data-gsap', 'data-animate'];
    const animated: any[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const hasTransition = cs.transitionProperty !== 'none' && cs.transitionDuration !== '0s';
      const hasAnimation  = cs.animationName !== 'none';
      const markerHits    = markers.filter(m => el.hasAttribute(m));
      if (hasTransition || hasAnimation || markerHits.length) {
        animated.push({
          tag: el.tagName.toLowerCase(),
          cls: (el as HTMLElement).className?.toString().slice(0, 120),
          markers: Object.fromEntries(markerHits.map(m => [m, el.getAttribute(m)])),
          transition: hasTransition ? {
            property: cs.transitionProperty,
            duration: cs.transitionDuration,
            timing:   cs.transitionTimingFunction,
            delay:    cs.transitionDelay,
          } : null,
          animation: hasAnimation ? {
            name:     cs.animationName,
            duration: cs.animationDuration,
            timing:   cs.animationTimingFunction,
            delay:    cs.animationDelay,
            iter:     cs.animationIterationCount,
          } : null,
        });
      }
    });
    const keyframes: any[] = [];
    for (const sheet of [...document.styleSheets]) {
      try {
        for (const rule of [...(sheet.cssRules as any)]) {
          if (rule.type === CSSRule.KEYFRAMES_RULE) keyframes.push({ name: rule.name, cssText: rule.cssText });
        }
      } catch {}
    }
    return { animated: animated.slice(0, 200), keyframes };
  });
  out.push({ url, ...data });
  await page.close();
}
await browser.close();
writeFileSync('recon/output/motion.json', JSON.stringify(out, null, 2));
console.log('Wrote recon/output/motion.json');
```

- [ ] **Step 2: Run + sanity-check**

```bash
cd "${ROOT}/recon"
pnpm motion
cat recon/output/motion.json | head -60
```

- [ ] **Step 3: Record gestural/scroll behavior manually**

Open the source site in 4 viewports and walk through each page. Note in a working scratch file:
- Sticky elements (header behavior on scroll: shrinks? changes color? appears?)
- Parallax / scroll-tied transforms
- Scroll reveals (which elements fade-up, slide-in, stagger)
- Slider/carousel: timing, autoplay interval, transition style, swipe sensitivity, dots/arrows behavior
- Mobile menu: trigger, open animation duration & easing, close, backdrop, scroll-lock
- Form interactions (focus rings, validation animations)
- Hover states for cards/buttons/images

These observations feed Task 12.

- [ ] **Step 4: Commit**

```bash
cd "${ROOT}"
git add recon/scripts/extract-motion.ts recon/output/motion.json
git commit -m "feat(recon): extract CSS transitions, animations, and motion markers"
```

---

### Task 12: Write `ANIMATION_NOTES.md`

**Files:**
- Create: `${ROOT}/ANIMATION_NOTES.md`

- [ ] **Step 1: Author with concrete numbers**

Replace every example below with extracted values:

```markdown
# Animation Notes

## Libraries used by source site
(From `recon/output/motion.json` markers and `<script src>` inspection.)
- e.g., "AOS 2.3.4 attached via `data-aos` attributes"
- e.g., "Swiper 8 (slider on homepage hero + testimonials)"

## Choice for rebuild
- Hover/focus/state: pure CSS transitions
- Scroll reveals: **MotionOne** with IntersectionObserver
- Slider: **Embla Carousel** (or **Swiper** if the source uses it and timing/gestures must match exactly)
- Mobile menu: CSS transform + JS `aria-expanded` toggle

## Per-element timing

### Buttons (primary CTA)
- Default: bg `#...`, color `#...`
- Hover: bg `#...`, transform `translateY(-1px)`, shadow `0 4px 12px rgba(0,0,0,0.08)`
- Transition: `all 200ms cubic-bezier(0.22, 1, 0.36, 1)`
- Focus-visible: outline 2px solid `#...`, offset 2px

### Cards
- Default → hover: scale `1.02`, shadow ramp, 300ms ease-out

### Header
- Sticky from y=80px; on scroll: backdrop-blur 12px, bg from transparent → `rgba(255,255,255,0.9)`, 240ms ease

### Hero
- Headline fade-up: opacity 0→1, translateY 16→0, 700ms cubic-bezier(0.22,1,0.36,1), delay 100ms
- Stagger children: 80ms

### Slider
- Autoplay 5s, transition 600ms ease-in-out, loop, drag-free disabled, dots clickable

### Mobile menu
- Trigger: hamburger → X morph 240ms
- Drawer: slide from right, 320ms cubic-bezier(0.22,1,0.36,1)
- Backdrop: fade 0→0.5 opacity 200ms
- Body scroll locked while open

### Reduce-motion
All keyframe transforms wrapped in `@media (prefers-reduced-motion: no-preference)`.
```

- [ ] **Step 2: Commit**

```bash
git add ANIMATION_NOTES.md
git commit -m "docs: document motion + interaction behavior per element"
```

---

## Phase 5 — Project Scaffold

### Task 13: Create the Astro project

- [ ] **Step 1: Scaffold Astro**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
pnpm create astro@latest . -- --template minimal --typescript strict --no-git --skip-houston --install
```

If `pnpm create astro` refuses because the dir is non-empty (recon files), pass `--force` or scaffold into `app/` and adjust paths.

- [ ] **Step 2: Add integrations**

```bash
pnpm astro add tailwind --yes
pnpm astro add sitemap --yes
pnpm add -D vitest @vitest/ui happy-dom @testing-library/dom
pnpm add motion embla-carousel
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 3: Strict TS check**

```bash
pnpm astro check
```

Expected: 0 errors on a fresh scaffold.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs tsconfig.json package.json pnpm-lock.yaml src/ public/
git commit -m "chore: scaffold astro + tailwind + sitemap + test toolchain"
```

---

### Task 14: Wire tailwind tokens

**Files:**
- Modify: `${ROOT}/tailwind.config.mjs`
- Create: `${ROOT}/src/styles/tokens.css`
- Create: `${ROOT}/src/styles/global.css`

- [ ] **Step 1: Replace `tailwind.config.mjs` content**

```js
import tokens from './recon/output/tailwind-tokens.draft.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,ts,tsx,md,mdx}'],
  theme: tokens.theme,
  plugins: [],
};
```

- [ ] **Step 2: Write `src/styles/tokens.css`**

Mirror the Tailwind tokens as raw CSS custom properties so non-Tailwind contexts (inline SVG, third-party widgets) can use the same palette.

```css
:root {
  /* fill from DESIGN.md — example shape */
  --color-brand-500: #...;
  --color-ink: #...;
  --color-surface: #...;
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-display: 'Cormorant Garamond', serif;
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 200ms;
  --dur-base: 320ms;
  --dur-slow: 600ms;
}
```

- [ ] **Step 3: Write `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens.css';

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-surface text-ink font-sans antialiased; }
  :focus-visible { outline: 2px solid var(--color-brand-500); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
  }
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm astro check && pnpm astro build
```

Expected: build succeeds, dist/ contains placeholder index.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.mjs src/styles/
git commit -m "feat(design): wire tailwind tokens and base global styles"
```

---

### Task 15: Self-host fonts

**Files:**
- Modify: `${ROOT}/package.json` (add `@fontsource/*` deps for fonts identified in DESIGN.md)
- Create: `${ROOT}/src/styles/fonts.css`
- Modify: `${ROOT}/src/styles/global.css` (`@import './fonts.css';`)

- [ ] **Step 1: Install fontsource packages for each typeface used**

```bash
# Example — replace with actual fonts from DESIGN.md
pnpm add @fontsource-variable/inter @fontsource/cormorant-garamond
```

- [ ] **Step 2: Write `src/styles/fonts.css`**

```css
@import '@fontsource-variable/inter';
@import '@fontsource/cormorant-garamond/400.css';
@import '@fontsource/cormorant-garamond/700.css';
```

- [ ] **Step 3: Verify**

```bash
pnpm astro build
# inspect dist/_astro for hashed woff2 files
ls dist/_astro/*.woff2 2>/dev/null | head
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/styles/fonts.css src/styles/global.css
git commit -m "feat: self-host fonts via fontsource"
```

---

## Phase 6 — Asset Pipeline

### Task 16: Move authorized assets into Astro

**Files:**
- Copy from: `${ROOT}/recon/assets/**`
- Create: `${ROOT}/src/assets/**` (for images processed by `astro:assets`)
- Create: `${ROOT}/public/**` (for assets referenced by absolute URL — favicons, og images, fonts already handled)

Decision rule: anything that ends up in `<Image>`/`<Picture>` goes under `src/assets/`. Everything else (favicon, OG image, robots.txt assets) goes under `public/`.

- [ ] **Step 1: Sort + move**

```bash
mkdir -p src/assets/images src/assets/icons src/assets/video public
# Move images that will be rendered via <Image> / <Picture>
rsync -a recon/assets/images/ src/assets/images/ 2>/dev/null || true
# Or whatever the directory shape under recon/assets turned out to be — adjust paths
```

- [ ] **Step 2: Optimize SVG icons**

```bash
pnpm add -D svgo
pnpm exec svgo -f src/assets/icons --multipass
```

- [ ] **Step 3: Generate placeholder file if user later flags any 3rd-party asset**

Convention: `placeholder-<role>.{jpg,svg}` with same pixel dimensions as the original. Log in `ASSET_NOTES.md`.

- [ ] **Step 4: Commit**

```bash
git add src/assets/ public/
git commit -m "feat(assets): import + optimize authorized media into astro project"
```

---

### Task 17: Update `ASSET_NOTES.md` with optimization log

- [ ] **Step 1: Append section**

```markdown
## Optimization log
| Source path | Astro path | Original (KB) | Optimized (KB) | Format |
|-------------|------------|---------------|-----------------|--------|
| recon/assets/images/hero.jpg | src/assets/images/hero.jpg | 480 | 95 (AVIF via astro:assets) | jpg → avif/webp |
| ...

## Placeholders in use
(none)
```

Generate the table programmatically by `wc -c` over both directories if convenient — exactness matters less than the audit trail.

- [ ] **Step 2: Commit**

```bash
git add ASSET_NOTES.md
git commit -m "docs(assets): record optimization log"
```

---

## Phase 7 — Component Library

> **TDD policy for components:** Each component gets one rendering test (renders without throwing, exposes the documented slots/props) and one a11y smoke test (no axe violations on a minimal usage). Visual fidelity is verified later via screenshot diffing (Task 33), not unit tests.

### Task 18: Build `Button` atom

**Files:**
- Create: `${ROOT}/src/components/Button.astro`
- Create: `${ROOT}/src/components/Button.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/components/Button.test.ts
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from './Button.astro';

test('renders primary button with label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, { props: { variant: 'primary' }, slots: { default: 'Click me' } });
  expect(html).toContain('Click me');
  expect(html).toMatch(/class="[^"]*btn-primary/);
});

test('renders as anchor when href provided', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, { props: { href: '/x' }, slots: { default: 'Go' } });
  expect(html).toContain('<a');
  expect(html).toContain('href="/x"');
});
```

- [ ] **Step 2: Verify it fails**

```bash
pnpm vitest run src/components/Button.test.ts
```

Expected: fails because `Button.astro` doesn't exist.

- [ ] **Step 3: Implement**

```astro
---
// src/components/Button.astro
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}
const { variant = 'primary', size = 'md', href, type = 'button', disabled, ariaLabel } = Astro.props;

const base = 'inline-flex items-center justify-center font-medium transition-all duration-base ease-out-quint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  primary: 'btn-primary bg-brand-500 text-white hover:bg-brand-600 hover:-translate-y-px shadow-sm hover:shadow-md',
  secondary: 'btn-secondary border border-ink/20 text-ink hover:bg-ink/5',
  ghost: 'btn-ghost text-ink hover:bg-ink/5',
} as const;
const sizes = { sm: 'px-3 py-1.5 text-sm rounded-md', md: 'px-5 py-2.5 text-base rounded-lg', lg: 'px-7 py-3.5 text-lg rounded-lg' } as const;
const cls = `${base} ${variants[variant]} ${sizes[size]}`;
---
{href ? (
  <a class={cls} href={href} aria-label={ariaLabel}><slot /></a>
) : (
  <button class={cls} type={type} disabled={disabled} aria-label={ariaLabel}><slot /></button>
)}
```

- [ ] **Step 4: Verify tests pass**

```bash
pnpm vitest run src/components/Button.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Button.astro src/components/Button.test.ts
git commit -m "feat(components): Button atom with variants + sizes"
```

---

### Task 19: Build `Container` and `Section` layout primitives

**Files:**
- Create: `${ROOT}/src/components/Container.astro`
- Create: `${ROOT}/src/components/Section.astro`

- [ ] **Step 1: Implement `Container.astro`**

```astro
---
interface Props { size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; class?: string; }
const { size = 'lg', class: cls = '' } = Astro.props;
const sizes = { sm: 'max-w-3xl', md: 'max-w-5xl', lg: 'max-w-6xl', xl: 'max-w-7xl', full: 'max-w-none' } as const;
---
<div class={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${cls}`}><slot /></div>
```

- [ ] **Step 2: Implement `Section.astro`**

```astro
---
interface Props { tag?: 'section' | 'article' | 'div'; bg?: 'default' | 'alt' | 'ink'; spacing?: 'sm' | 'md' | 'lg'; id?: string; class?: string; }
const { tag = 'section', bg = 'default', spacing = 'md', id, class: cls = '' } = Astro.props;
const Tag = tag;
const bgs = { default: 'bg-surface', alt: 'bg-surface-alt', ink: 'bg-ink text-surface' } as const;
const spacings = { sm: 'py-12 md:py-16', md: 'py-16 md:py-24', lg: 'py-24 md:py-32' } as const;
---
<Tag id={id} class={`${bgs[bg]} ${spacings[spacing]} ${cls}`}><slot /></Tag>
```

- [ ] **Step 3: Render smoke test (skip if too low-value)**

Optional — a rendering test analogous to Button.test.ts. If you skip, note "smoke-tested via consumer pages."

- [ ] **Step 4: Commit**

```bash
git add src/components/Container.astro src/components/Section.astro
git commit -m "feat(components): Container + Section layout primitives"
```

---

### Task 20: Build `Header` (with sticky-shrink behavior) + `MobileMenu`

**Files:**
- Create: `${ROOT}/src/components/Header.astro`
- Create: `${ROOT}/src/components/MobileMenu.astro`
- Create: `${ROOT}/src/components/header.client.ts` (sticky + scroll-state JS)

- [ ] **Step 1: Implement `Header.astro`**

```astro
---
import Container from './Container.astro';
import MobileMenu from './MobileMenu.astro';
import { primaryNav } from '../data/navigation';
---
<header data-header class="fixed inset-x-0 top-0 z-40 transition-all duration-base ease-out-quint">
  <Container size="xl" class="flex items-center justify-between py-4">
    <a href="/" class="font-display text-xl" aria-label="Sonan Bunkers home">
      <img src="/logo.svg" alt="Sonan Bunkers" class="h-8 w-auto" />
    </a>
    <nav class="hidden md:flex items-center gap-8" aria-label="Primary">
      {primaryNav.map(item => (
        <a class="text-sm font-medium hover:text-brand-500 transition-colors" href={item.href}>{item.label}</a>
      ))}
    </nav>
    <MobileMenu />
  </Container>
</header>
<script>
  import './header.client';
</script>
```

- [ ] **Step 2: Implement `header.client.ts`**

```ts
// src/components/header.client.ts
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const onScroll = () => {
    const scrolled = window.scrollY > 80;
    header.classList.toggle('bg-surface/80', scrolled);
    header.classList.toggle('backdrop-blur-md', scrolled);
    header.classList.toggle('shadow-sm', scrolled);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
```

- [ ] **Step 3: Implement `MobileMenu.astro`**

```astro
---
import { primaryNav } from '../data/navigation';
---
<button data-mobile-trigger class="md:hidden p-2 -mr-2" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
</button>
<div data-mobile-menu id="mobile-menu" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
  <div data-mobile-backdrop class="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-base"></div>
  <aside data-mobile-drawer class="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-surface translate-x-full transition-transform duration-base ease-out-quint">
    <div class="flex items-center justify-end p-4">
      <button data-mobile-close class="p-2" aria-label="Close menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
    </div>
    <nav class="flex flex-col gap-2 px-6 py-4" aria-label="Mobile primary">
      {primaryNav.map(item => <a class="py-3 text-lg font-medium border-b border-ink/10" href={item.href}>{item.label}</a>)}
    </nav>
  </aside>
</div>
<script>
  const trigger = document.querySelector<HTMLButtonElement>('[data-mobile-trigger]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const backdrop = document.querySelector<HTMLElement>('[data-mobile-backdrop]');
  const drawer = document.querySelector<HTMLElement>('[data-mobile-drawer]');
  const close = document.querySelector<HTMLButtonElement>('[data-mobile-close]');
  const open = () => {
    menu!.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop!.classList.add('opacity-100');
      drawer!.classList.remove('translate-x-full');
    });
    trigger!.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const shut = () => {
    backdrop!.classList.remove('opacity-100');
    drawer!.classList.add('translate-x-full');
    trigger!.setAttribute('aria-expanded', 'false');
    setTimeout(() => menu!.classList.add('hidden'), 320);
    document.body.style.overflow = '';
  };
  trigger?.addEventListener('click', open);
  close?.addEventListener('click', shut);
  backdrop?.addEventListener('click', shut);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu!.classList.contains('hidden')) shut(); });
</script>
```

- [ ] **Step 4: Manual smoke test in dev**

```bash
pnpm dev
# Open http://localhost:4321 — verify menu opens, traps focus visually, closes on Esc/backdrop/X.
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/MobileMenu.astro src/components/header.client.ts
git commit -m "feat(components): Header with sticky-state + accessible MobileMenu"
```

---

### Task 21: Build `Footer`

**Files:**
- Create: `${ROOT}/src/components/Footer.astro`

- [ ] **Step 1: Implement, mirroring the columns/links observed in source**

```astro
---
import Container from './Container.astro';
import { footerNav, social } from '../data/navigation';
---
<footer class="bg-ink text-surface mt-24">
  <Container size="xl" class="py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <img src="/logo-light.svg" alt="Sonan Bunkers" class="h-8 w-auto" />
        <p class="mt-4 text-sm text-surface/70">{/* tagline from source */}</p>
      </div>
      {footerNav.map(col => (
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wide">{col.title}</h4>
          <ul class="mt-4 space-y-2">
            {col.items.map(it => <li><a class="text-sm text-surface/70 hover:text-surface transition-colors" href={it.href}>{it.label}</a></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div class="mt-12 pt-8 border-t border-surface/10 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-xs text-surface/50">© {new Date().getFullYear()} Sonan Bunkers</p>
      <div class="flex gap-4">{social.map(s => <a href={s.href} aria-label={s.label} class="text-surface/70 hover:text-surface" set:html={s.icon} />)}</div>
    </div>
  </Container>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(components): Footer with columns + social"
```

---

### Task 22: Build `Card` and `Hero`

**Files:**
- Create: `${ROOT}/src/components/Card.astro`
- Create: `${ROOT}/src/components/Hero.astro`

- [ ] **Step 1: `Card.astro`**

```astro
---
import { Image } from 'astro:assets';
interface Props { image?: ImageMetadata; title: string; eyebrow?: string; href?: string; }
const { image, title, eyebrow, href } = Astro.props;
const Wrapper = href ? 'a' : 'div';
---
<Wrapper href={href} class="group block overflow-hidden rounded-lg bg-surface-alt transition-all duration-base ease-out-quint hover:-translate-y-1 hover:shadow-lg">
  {image && (
    <div class="aspect-[4/3] overflow-hidden">
      <Image src={image} alt={title} class="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105" />
    </div>
  )}
  <div class="p-6">
    {eyebrow && <p class="text-xs uppercase tracking-wide text-ink/60">{eyebrow}</p>}
    <h3 class="mt-2 text-xl font-display">{title}</h3>
    <div class="mt-3 text-sm text-ink/70"><slot /></div>
  </div>
</Wrapper>
```

- [ ] **Step 2: `Hero.astro`**

```astro
---
import Container from './Container.astro';
import Button from './Button.astro';
import { Image } from 'astro:assets';
interface Props { eyebrow?: string; headline: string; sub?: string; image?: ImageMetadata; cta?: { label: string; href: string }; ctaSecondary?: { label: string; href: string }; }
const { eyebrow, headline, sub, image, cta, ctaSecondary } = Astro.props;
---
<section class="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
  <Container size="xl" class="grid md:grid-cols-2 gap-12 items-center">
    <div data-reveal>
      {eyebrow && <p class="text-sm uppercase tracking-widest text-brand-500">{eyebrow}</p>}
      <h1 class="mt-4 text-4xl md:text-5xl lg:text-6xl font-display leading-tight">{headline}</h1>
      {sub && <p class="mt-6 text-lg text-ink/70 max-w-prose">{sub}</p>}
      {(cta || ctaSecondary) && (
        <div class="mt-8 flex flex-wrap gap-4">
          {cta && <Button href={cta.href} variant="primary" size="lg">{cta.label}</Button>}
          {ctaSecondary && <Button href={ctaSecondary.href} variant="secondary" size="lg">{ctaSecondary.label}</Button>}
        </div>
      )}
    </div>
    {image && <div data-reveal data-reveal-delay="100"><Image src={image} alt="" class="w-full h-auto rounded-lg" /></div>}
  </Container>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Card.astro src/components/Hero.astro
git commit -m "feat(components): Card + Hero organisms"
```

---

### Task 23: Build `Slider` (Embla-based)

**Files:**
- Create: `${ROOT}/src/components/Slider.astro`

- [ ] **Step 1: Implement**

```astro
---
interface Props { id: string; autoplayMs?: number; loop?: boolean; }
const { id, autoplayMs = 5000, loop = true } = Astro.props;
---
<div data-slider data-slider-id={id} data-autoplay={autoplayMs} data-loop={loop ? '1' : '0'} class="relative">
  <div class="overflow-hidden" data-slider-viewport>
    <div class="flex" data-slider-container><slot /></div>
  </div>
  <div class="mt-6 flex items-center justify-between">
    <div class="flex gap-2" data-slider-dots></div>
    <div class="flex gap-2">
      <button data-slider-prev class="p-2 rounded-full border border-ink/20 hover:bg-ink/5" aria-label="Previous">‹</button>
      <button data-slider-next class="p-2 rounded-full border border-ink/20 hover:bg-ink/5" aria-label="Next">›</button>
    </div>
  </div>
</div>
<script>
  import EmblaCarousel from 'embla-carousel';
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((root) => {
    const viewport = root.querySelector<HTMLElement>('[data-slider-viewport]')!;
    const autoplayMs = Number(root.dataset.autoplay ?? '5000');
    const loop = root.dataset.loop === '1';
    const embla = EmblaCarousel(viewport, { loop, align: 'start' });
    const prev = root.querySelector<HTMLButtonElement>('[data-slider-prev]')!;
    const next = root.querySelector<HTMLButtonElement>('[data-slider-next]')!;
    prev.addEventListener('click', () => embla.scrollPrev());
    next.addEventListener('click', () => embla.scrollNext());

    const dotsEl = root.querySelector<HTMLElement>('[data-slider-dots]')!;
    const renderDots = () => {
      dotsEl.innerHTML = embla.scrollSnapList().map((_, i) =>
        `<button class="w-2 h-2 rounded-full ${i === embla.selectedScrollSnap() ? 'bg-ink' : 'bg-ink/30'}" data-dot="${i}" aria-label="Go to slide ${i+1}"></button>`
      ).join('');
      dotsEl.querySelectorAll<HTMLButtonElement>('[data-dot]').forEach(b => b.addEventListener('click', () => embla.scrollTo(Number(b.dataset.dot))));
    };
    embla.on('select', renderDots);
    embla.on('reInit', renderDots);
    renderDots();

    if (autoplayMs > 0) {
      let id = setInterval(() => embla.scrollNext(), autoplayMs);
      root.addEventListener('pointerenter', () => clearInterval(id));
      root.addEventListener('pointerleave', () => { id = setInterval(() => embla.scrollNext(), autoplayMs); });
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Slider.astro
git commit -m "feat(components): accessible Slider with dots, arrows, autoplay-on-pause"
```

---

### Task 24: Build `Form` + `Input` + `Textarea` + `Modal` if needed

**Files:**
- Create: `${ROOT}/src/components/Input.astro`
- Create: `${ROOT}/src/components/Textarea.astro`
- Create: `${ROOT}/src/components/ContactForm.astro` (matches forms discovered in Task 4)
- Create: `${ROOT}/src/components/Modal.astro` if any modals were observed in recon

- [ ] **Step 1: Implement `Input.astro` + `Textarea.astro`**

```astro
---
// Input.astro
interface Props { name: string; type?: string; label: string; required?: boolean; placeholder?: string; }
const { name, type = 'text', label, required, placeholder } = Astro.props;
---
<label class="block">
  <span class="text-sm font-medium">{label}{required && <span aria-hidden="true" class="text-brand-500"> *</span>}</span>
  <input
    name={name}
    type={type}
    required={required}
    placeholder={placeholder}
    aria-required={required}
    class="mt-1 w-full rounded-lg border border-ink/20 px-4 py-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-fast"
  />
</label>
```

- [ ] **Step 2: Implement `ContactForm.astro`**

Wire `action` to whatever the source form posts to. If it's a 3rd-party endpoint (Formspree/Netlify Forms/etc.), preserve it; if it's the same-origin route, add an `@astrojs/node` adapter and an API route in Task 28. Until then, ship a working form with the same endpoint URL the source used.

```astro
---
import Input from './Input.astro';
import Textarea from './Textarea.astro';
import Button from './Button.astro';
interface Props { action: string; method?: 'POST' | 'GET'; }
const { action, method = 'POST' } = Astro.props;
---
<form action={action} method={method} class="grid gap-4 max-w-xl">
  <Input name="name" label="Name" required />
  <Input name="email" type="email" label="Email" required />
  <Input name="phone" type="tel" label="Phone" />
  <Textarea name="message" label="Message" required />
  <Button type="submit" variant="primary" size="lg">Send</Button>
</form>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Input.astro src/components/Textarea.astro src/components/ContactForm.astro
git commit -m "feat(components): form atoms + ContactForm"
```

---

## Phase 8 — Layouts & Pages

### Task 25: `BaseLayout`

**Files:**
- Create: `${ROOT}/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Implement**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
interface Props { title: string; description?: string; ogImage?: string; canonical?: string; }
const { title, description, ogImage = '/og-default.jpg', canonical } = Astro.props;
const canonicalHref = canonical ?? new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <link rel="canonical" href={canonicalHref} />
  <meta property="og:title" content={title} />
  {description && <meta property="og:description" content={description} />}
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body class="min-h-screen flex flex-col">
  <Header />
  <main class="flex-1"><slot /></main>
  <Footer />
</body>
</html>
```

- [ ] **Step 2: Set site URL**

Modify `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://www.sonanbunkers.com',
  integrations: [tailwind(), sitemap()],
});
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro astro.config.mjs
git commit -m "feat(layout): BaseLayout with SEO meta + sitemap site URL"
```

---

### Task 26: Navigation data + content data

**Files:**
- Create: `${ROOT}/src/data/navigation.ts`
- Create: `${ROOT}/src/data/content.ts`

- [ ] **Step 1: Populate from `PAGE_MAP.md` + crawl**

```ts
// src/data/navigation.ts
export interface NavItem { label: string; href: string; }
export const primaryNav: NavItem[] = [
  // Fill from recon — homepage nav links
];
export const footerNav: { title: string; items: NavItem[] }[] = [
  // Fill from recon — homepage footer
];
export const social: { label: string; href: string; icon: string }[] = [
  // SVG strings inlined
];
```

```ts
// src/data/content.ts — typed structs for each page's content
export interface HeroContent { eyebrow?: string; headline: string; sub?: string; cta?: { label: string; href: string }; }
// per-page content blocks live here, imported by pages
```

- [ ] **Step 2: Commit**

```bash
git add src/data/
git commit -m "feat(data): navigation + content typed structures"
```

---

### Task 27: Build each page

**Files (one per discovered route from `PAGE_MAP.md`):**
- Create: `${ROOT}/src/pages/index.astro`
- Create: `${ROOT}/src/pages/<each-route>.astro` — exact filename mirrors the path. For `/about/team/`, use `src/pages/about/team.astro`.

Each page repeats the same sub-steps. Loop the following sub-steps for **every** route in `PAGE_MAP.md`:

- [ ] **Step 1 (per page): Identify sections by walking the desktop-1440 screenshot top-to-bottom**

Document sections in `<route>.astro` as a comment header. For the homepage, e.g.:

```
<!-- Sections: hero → feature-grid (3 cols) → testimonial slider → gallery → contact CTA -->
```

- [ ] **Step 2 (per page): Compose using components**

Example — `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Section from '../components/Section.astro';
import Container from '../components/Container.astro';
import Card from '../components/Card.astro';
import Slider from '../components/Slider.astro';
import heroImage from '../assets/images/hero.jpg';
// import other images...
const features = [/* from content.ts */];
---
<BaseLayout title="Sonan Bunkers" description="...">
  <Hero
    eyebrow="..."
    headline="..."
    sub="..."
    image={heroImage}
    cta={{ label: '...', href: '/contact' }}
  />

  <Section bg="alt" spacing="lg">
    <Container size="xl">
      <h2 class="text-3xl md:text-4xl font-display">Features</h2>
      <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(f => <Card title={f.title} image={f.image} href={f.href}>{f.description}</Card>)}
      </div>
    </Container>
  </Section>

  <Section spacing="lg">
    <Container size="xl">
      <Slider id="testimonials" autoplayMs={6000}>
        {/* slides */}
      </Slider>
    </Container>
  </Section>

  <!-- additional sections -->
</BaseLayout>
```

- [ ] **Step 3 (per page): Build, then visually verify in dev server**

```bash
pnpm dev
# Open the route and walk through it. Compare to recon/screenshots/desktop-1440/<slug>.png side-by-side.
```

- [ ] **Step 4 (per page): Commit**

```bash
git add src/pages/<file>.astro
git commit -m "feat(pages): implement /<route>"
```

---

### Task 28: Forms / dynamic endpoints (only if needed)

If `PAGE_MAP.md` shows a form posting to same-origin (e.g., `/api/contact`), add an SSR adapter and API route. If forms post to a 3rd-party endpoint (Formspree/Mailgun/etc.), skip this task.

- [ ] **Step 1: Decide**

Check `PAGE_MAP.md` form actions. If all are 3rd-party → skip task and proceed. Otherwise continue.

- [ ] **Step 2: Add Node adapter**

```bash
pnpm astro add node --yes
```

- [ ] **Step 3: Implement endpoint matching the original form action**

```ts
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const payload = Object.fromEntries(form);
  // forward to email service / store / etc.
  return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
};
```

- [ ] **Step 4: Add `thank-you.astro`** matching source thank-you page (or create simple one if source did inline confirmation).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/pages/api/ src/pages/thank-you.astro
git commit -m "feat(forms): server-side handler for contact form"
```

---

## Phase 9 — Motion Implementation

### Task 29: Scroll reveals

**Files:**
- Create: `${ROOT}/src/scripts/reveals.client.ts`
- Modify: `${ROOT}/src/layouts/BaseLayout.astro` (add `<script>`)

- [ ] **Step 1: Implement**

```ts
// src/scripts/reveals.client.ts
import { animate } from 'motion';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const delay = Number(el.dataset.revealDelay ?? '0') / 1000;
      animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, delay, easing: [0.22, 1, 0.36, 1] });
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}
```

- [ ] **Step 2: Wire from BaseLayout**

Add inside `<body>` of `BaseLayout.astro`:

```astro
<script>
  import '../scripts/reveals.client';
</script>
```

- [ ] **Step 3: Visual verify**

```bash
pnpm dev
```

Scroll the homepage; elements with `[data-reveal]` fade-up smoothly. Toggle OS reduce-motion and confirm reveals are disabled.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/reveals.client.ts src/layouts/BaseLayout.astro
git commit -m "feat(motion): IntersectionObserver-based scroll reveals via Motion"
```

---

### Task 30: Parallax / scroll-tied transforms (only if source uses them)

If `ANIMATION_NOTES.md` records parallax behavior (background drifting at a slower rate than scroll), add a small handler. Otherwise skip.

- [ ] **Step 1: Implement (if needed)**

```ts
// src/scripts/parallax.client.ts
const elements = document.querySelectorAll<HTMLElement>('[data-parallax]');
if (elements.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const onScroll = () => {
    for (const el of elements) {
      const rate = Number(el.dataset.parallax ?? '0.3');
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${center * -rate}px, 0)`;
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }, { passive: true });
  onScroll();
}
```

Apply `data-parallax="0.3"` to elements identified in recon as parallaxed.

- [ ] **Step 2: Commit**

```bash
git add src/scripts/parallax.client.ts
git commit -m "feat(motion): parallax handler for scroll-tied transforms"
```

---

### Task 31: Page transitions (only if source uses View Transitions / Barba-style)

If recon flagged page-to-page crossfades/morphs, enable Astro's built-in View Transitions in `BaseLayout`:

```astro
import { ViewTransitions } from 'astro:transitions';
// inside <head>:
<ViewTransitions />
```

Otherwise skip.

- [ ] **Step 1: Decide + implement if applicable**
- [ ] **Step 2: Commit** (only if applicable)

---

## Phase 10 — QA & Deliverables

### Task 32: Build the site and verify there are no broken links

**Files:**
- Create: `${ROOT}/recon/scripts/check-links.ts`

- [ ] **Step 1: Build**

```bash
pnpm astro check
pnpm astro build
```

Expected: 0 errors. Note any warnings.

- [ ] **Step 2: Run link checker against the built site**

```ts
// recon/scripts/check-links.ts
import { chromium } from 'playwright';
const start = 'http://localhost:4321/';
const visited = new Set<string>();
const queue = [start];
const broken: { from: string; to: string; status: number }[] = [];
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
while (queue.length) {
  const url = queue.shift()!;
  if (visited.has(url)) continue;
  visited.add(url);
  const resp = await page.goto(url).catch(() => null);
  if (!resp || resp.status() >= 400) { broken.push({ from: 'unknown', to: url, status: resp?.status() ?? -1 }); continue; }
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => (a as HTMLAnchorElement).href));
  for (const l of links) {
    try { const u = new URL(l); if (u.origin === new URL(start).origin && !visited.has(u.href)) queue.push(u.href); } catch {}
  }
}
await browser.close();
if (broken.length) { console.error(broken); process.exit(1); }
console.log(`OK — ${visited.size} pages crawled, no broken internal links`);
```

```bash
pnpm astro preview &
sleep 2
cd recon && pnpm tsx scripts/check-links.ts
kill %1
```

Expected: `OK — N pages crawled, no broken internal links`. If any 404s appear, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add recon/scripts/check-links.ts
git commit -m "test: validate no broken internal links in built site"
```

---

### Task 33: Screenshot-diff the rebuild against the source at all 4 breakpoints

**Files:**
- Create: `${ROOT}/tests/visual.spec.ts`

- [ ] **Step 1: Capture rebuild screenshots**

```ts
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const pages: { url: string }[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));
const slug = (u: string) => (new URL(u).pathname.replace(/^\//, '').replace(/\/$/, '') || 'home').replace(/\//g, '__');
for (const { url } of pages) {
  test(`page renders: ${url}`, async ({ page }, info) => {
    const path = new URL(url).pathname;
    await page.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/screenshots/${info.project.name}/${slug(url)}.png`, fullPage: true });
  });
}
```

Add to `playwright.config.ts` for the Astro project (separate from recon config), same 4 viewports.

- [ ] **Step 2: Run**

```bash
pnpm astro build && pnpm astro preview &
sleep 2
pnpm exec playwright test tests/visual.spec.ts
kill %1
```

- [ ] **Step 3: Diff side-by-side**

Open each rebuild screenshot next to `recon/screenshots/<bp>/<slug>.png`. Flag layout drift items (>10px misalignment, wrong color, missing section) in a checklist. Fix iteratively.

- [ ] **Step 4: Commit when satisfied**

```bash
git add tests/visual.spec.ts
git commit -m "test: visual regression screenshots at 4 breakpoints"
```

---

### Task 34: Accessibility audit

- [ ] **Step 1: Add axe to Playwright tests**

```bash
pnpm add -D @axe-core/playwright
```

```ts
// tests/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const pages: { url: string }[] = JSON.parse(readFileSync('recon/output/pages.json', 'utf8'));
for (const { url } of pages) {
  test(`a11y: ${url}`, async ({ page }) => {
    await page.goto('http://localhost:4321' + new URL(url).pathname);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 2: Run + fix violations**

```bash
pnpm astro preview &
sleep 2
pnpm exec playwright test tests/a11y.spec.ts
kill %1
```

Common fixes: ensure every `<img>` has `alt`, every form input has a label, color contrast meets AA, heading order is logical, focus-visible outlines visible.

- [ ] **Step 3: Commit**

```bash
git add tests/a11y.spec.ts
git commit -m "test: axe-core a11y suite covering WCAG 2 AA"
```

---

### Task 35: Lighthouse spot-check (homepage + one inner page)

- [ ] **Step 1: Run**

```bash
pnpm add -D @lhci/cli
pnpm astro build && pnpm astro preview &
sleep 2
pnpm exec lhci collect --url=http://localhost:4321 --url=http://localhost:4321/<one-inner-page> --numberOfRuns=1
pnpm exec lhci assert --preset=lighthouse:recommended
kill %1
```

- [ ] **Step 2: Address red lights**

Targets: Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Common fixes: add `width`/`height` to images to reserve space (CLS), `loading="lazy"` on below-the-fold, defer non-critical JS, font-display swap.

- [ ] **Step 3: Commit**

```bash
git add .lighthouserc.json 2>/dev/null || true
git commit -m "test: lighthouse audit + perf fixes" --allow-empty
```

---

### Task 36: Final README + deliverable wrap-up

**Files:**
- Modify: `${ROOT}/README.md` (full final form)

- [ ] **Step 1: Write README**

```markdown
# Sonan Bunkers — Astro Rebuild

Faithful rebuild of https://www.sonanbunkers.com/ in Astro + Tailwind + TypeScript.

## Setup

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static output → dist/
pnpm preview      # preview built site
```

## Tests

```bash
pnpm test                # vitest unit tests
pnpm exec playwright test  # visual + a11y
pnpm exec lhci collect   # lighthouse
```

## Project structure

```
src/
  components/   atoms + organisms (Button, Card, Header, Footer, Slider, Hero, …)
  layouts/      BaseLayout
  pages/        one .astro per discovered route
  data/         navigation, content
  styles/       tokens.css, global.css, fonts.css
  scripts/      client-side motion + interaction
  assets/       images/icons processed by astro:assets
public/         favicon, og image, robots.txt, sitemap.xml (generated)
recon/          (gitignored largely) crawl + screenshot + token extraction toolkit
docs/superpowers/plans/   this plan + any future plans
```

## Deliverables index

- `PAGE_MAP.md` — every discovered route with title and form info
- `DESIGN.md` — design system extracted via `/design-md`
- `RESPONSIVE_NOTES.md` — per-section behavior across 4 breakpoints
- `ANIMATION_NOTES.md` — motion + interaction reference
- `ASSET_NOTES.md` — asset inventory, optimization log, placeholders (none expected)

## Deploy

Static output → any static host (Netlify, Vercel, Cloudflare Pages). Build command `pnpm build`, output dir `dist/`. If `pages/api/*` exists (Task 28 was needed), use Node adapter and a Node-capable host.

## Assumptions

- User owns sonanbunkers.com; all assets reused.
- Astro project lives at repo root (folder name "elysse demo" reflects local workspace, not the deployed brand).
- Motion stack: MotionOne + Embla + CSS. Swap to GSAP/Swiper if exact gesture/timing replication requires it.
```

- [ ] **Step 2: Final commit**

```bash
git add README.md
git commit -m "docs: final README with setup, structure, and deliverables index"
```

- [ ] **Step 3: Summary to user**

Print to user:
1. Concise summary (what was built, page count, deliverables list).
2. File tree (output of `tree -L 3 -I 'node_modules|dist|.astro|recon/screenshots|recon/assets'` or equivalent).
3. Setup commands (copied from README).
4. Assumptions list (copied from README) + any placeholders that ended up being needed despite user owning the site (third-party stock photos without carryover licenses, for example).

---

## Self-Review Checklist

Run mentally before declaring the plan complete:

1. **Spec coverage**:
   - ✅ Crawl + page map — Tasks 4, 5
   - ✅ Screenshots at 4 breakpoints — Task 6
   - ✅ Design system via /design-md — Task 8
   - ✅ Motion analysis — Tasks 11, 12
   - ✅ Astro project structure (components/layouts/pages/styles/data) — Tasks 13–27
   - ✅ Hover/focus/active/disabled states — covered in component implementations (Tasks 18–24)
   - ✅ Mobile menu — Task 20
   - ✅ Sliders — Task 23
   - ✅ Parallax — Task 30 (conditional)
   - ✅ Asset handling — Tasks 7, 16, 17
   - ✅ Deliverables (PAGE_MAP, ANIMATION_NOTES, RESPONSIVE_NOTES, ASSET_NOTES, README) — Tasks 5, 10, 12, 17, 36
   - ✅ QA gates (screenshots compare, a11y, lighthouse, broken links) — Tasks 32–35
   - ✅ Semantic HTML, alt text, focus states — woven through component tasks + Task 34
   - ✅ Final summary format — Task 36 step 3

2. **Placeholder scan**: One intentional placeholder remains — `tailwind.config.mjs` extends are commented examples to be filled from `DESIGN.md` in Task 9. This is correct: the actual values can't be pre-known without running the crawl. Same applies to `RESPONSIVE_NOTES.md` and `ANIMATION_NOTES.md` skeletons — they are templates filled with extracted values at execution time, not lazy TODOs.

3. **Type consistency**: Method names (`primaryNav`, `footerNav`, `social`, `[data-reveal]`, `[data-mobile-*]`, `[data-slider-*]`, `[data-parallax]`, `revealDelay`) used consistently across components, layouts, and scripts.

---
