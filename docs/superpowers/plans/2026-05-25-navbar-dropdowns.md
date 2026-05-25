# Navbar Dropdowns (replace MegaMenu) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the full-screen MegaMenu with an always-visible primary navigation bar. The 8 mega-menu categories become top-level navbar items; each one's sub-items become a hover/click dropdown. Mobile keeps a hamburger that opens a slide-in drawer with single-open accordion sections.

**Architecture:** Two new Astro components consume the existing `megaNav` data (flattened into a single ordered array via a new `navGroups` helper). `PrimaryNav.astro` renders the desktop bar (visible at `lg:`); `MobileNav.astro` renders the hamburger button plus the mobile drawer (visible below `lg:`). A new `src/scripts/nav.client.ts` owns all interactions (desktop dropdown open/close, mobile drawer transitions, accordion toggle, ARIA, Escape, outside-click). `Header.astro` shifts the logo to the left and slots both nav components after it. `MegaMenu.astro` is deleted; the menu-drawer wiring in `header.client.ts` is removed (the scroll-color logic stays).

**Tech Stack:** Astro 6 components, Tailwind 4 (existing tokens: `text-ink`, `bg-surface`, `text-brand-500`, `text-brand-accent`, `duration-base`, `duration-fast`, `ease-out-quint`), vanilla TypeScript for client behavior, Playwright for tests.

**Data source of truth:** `src/data/navigation.ts` already exports `megaNav: MegaColumns` with all 8 groups. We add one helper (`navGroups`) and do **not** modify the existing categories or links — broken links inside the new dropdowns are accepted per user decision (matches today's MegaMenu).

---

## File Structure

**Create:**
- `src/components/PrimaryNav.astro` — desktop horizontal nav: 8 trigger buttons + 8 dropdown panels. Hidden below `lg:`.
- `src/components/MobileNav.astro` — hamburger button + slide-in drawer with accordion list. Hidden at `lg:` and up.
- `src/scripts/nav.client.ts` — all interaction wiring for both components (desktop hover/focus dropdowns, mobile drawer, accordion).
- `tests/nav.spec.ts` — Playwright coverage of both viewports.

**Modify:**
- `src/components/Header.astro` — drop `MegaMenu` import + render, drop the inline `Menu` trigger button, move logo to the left, slot `<PrimaryNav />` and `<MobileNav />` after it, import the new client script.
- `src/data/navigation.ts` — append `navGroups` helper (flattens `megaNav` to a single array).
- `src/scripts/header.client.ts` — remove the menu-trigger / drawer / backdrop / focus-trap block (lines 54–103 of the current file). Keep the scroll-color `setOpaque` logic (lines 1–52) untouched.

**Delete:**
- `src/components/MegaMenu.astro` — no longer used.

---

### Task 1: Add `navGroups` helper to the navigation data

**Files:**
- Modify: `src/data/navigation.ts` (append below `megaNav`)

- [ ] **Step 1: Append the helper**

Open `src/data/navigation.ts` and append after the existing `megaNav` export (after line 181):

```typescript

/**
 * Flat ordered list of every mega-menu group — consumed by PrimaryNav.astro and
 * MobileNav.astro so both renders stay in lockstep with the single source of truth.
 * Order is column-major: column 1 groups, then column 2, then column 3.
 */
export const navGroups: MegaGroup[] = megaNav.flat();
```

- [ ] **Step 2: Type-check the file**

Run: `pnpm astro check`
Expected: PASS (0 errors, 0 warnings related to navigation.ts).

- [ ] **Step 3: Commit**

```bash
git add src/data/navigation.ts
git commit -m "feat(nav): add navGroups flat helper for navbar dropdowns"
```

---

### Task 2: Write a failing Playwright spec for the desktop nav

**Files:**
- Create: `tests/nav.spec.ts`

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };
const EXPECTED_GROUPS = [
  'Elysee',
  'Responsible Partner',
  'Careers',
  'About Us',
  'Press Room',
  'Legal',
  'Our Services',
  'Contact',
];

test.describe('desktop primary nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  });

  test('renders all 8 categories as top-level triggers', async ({ page }) => {
    const triggers = page.locator('[data-primary-nav] [data-nav-trigger]');
    await expect(triggers).toHaveCount(8);
    for (let i = 0; i < EXPECTED_GROUPS.length; i++) {
      await expect(triggers.nth(i)).toContainText(EXPECTED_GROUPS[i]);
    }
  });

  test('the old MegaMenu trigger and dialog are gone', async ({ page }) => {
    await expect(page.locator('[data-menu-trigger]')).toHaveCount(0);
    await expect(page.locator('[data-menu-root]')).toHaveCount(0);
  });

  test('clicking a trigger opens its dropdown with the expected sub-items', async ({ page }) => {
    const responsible = page.locator('[data-nav-group]', { hasText: 'Responsible Partner' });
    const trigger = responsible.locator('[data-nav-trigger]');
    const panel = responsible.locator('[data-nav-panel]');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Compliance');
    await expect(panel).toContainText('Sustainability');
  });

  test('Escape closes any open dropdown', async ({ page }) => {
    const trigger = page.locator('[data-nav-group]', { hasText: 'Our Services' }).locator('[data-nav-trigger]');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opening one dropdown closes any other open one', async ({ page }) => {
    const aboutTrigger = page.locator('[data-nav-group]', { hasText: 'About Us' }).locator('[data-nav-trigger]');
    const legalTrigger = page.locator('[data-nav-group]', { hasText: 'Legal' }).locator('[data-nav-trigger]');
    await aboutTrigger.click();
    await expect(aboutTrigger).toHaveAttribute('aria-expanded', 'true');
    await legalTrigger.click();
    await expect(aboutTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(legalTrigger).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: Run the spec and confirm it fails**

Run: `pnpm exec playwright test tests/nav.spec.ts --project=chromium 2>&1 | tail -30`
Expected: FAIL on every assertion (selectors `[data-primary-nav]`, `[data-nav-trigger]`, `[data-nav-group]`, `[data-nav-panel]` do not exist yet).

- [ ] **Step 3: Commit the failing spec**

```bash
git add tests/nav.spec.ts
git commit -m "test(nav): add failing desktop primary-nav spec"
```

---

### Task 3: Build `PrimaryNav.astro` (desktop dropdown bar)

**Files:**
- Create: `src/components/PrimaryNav.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { navGroups } from '../data/navigation';
---
<nav
  data-primary-nav
  class="ml-auto hidden lg:flex items-stretch gap-1"
  aria-label="Primary"
>
  {navGroups.map((group, idx) => {
    const panelId = `nav-panel-${idx}`;
    const hasItems = group.items.length > 0;
    return (
      <div data-nav-group class="relative flex items-stretch">
        <button
          type="button"
          data-nav-trigger
          aria-expanded="false"
          aria-controls={panelId}
          aria-haspopup={hasItems ? 'menu' : undefined}
          class="inline-flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium hover:text-brand-accent transition-colors duration-fast"
        >
          <span>{group.title}</span>
          {hasItems && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M2 4l3 3 3-3" />
            </svg>
          )}
        </button>

        {hasItems && (
          <div
            data-nav-panel
            id={panelId}
            role="menu"
            class="absolute left-0 top-full mt-1 min-w-[240px] bg-surface text-ink shadow-md rounded-sm opacity-0 invisible translate-y-1 transition-[opacity,transform,visibility] duration-fast ease-out-quint"
          >
            <ul class="py-2">
              {group.href && (
                <li>
                  <a
                    href={group.href}
                    role="menuitem"
                    class="block px-4 py-2 text-sm font-medium text-ink hover:bg-brand-500/5 hover:text-brand-500 transition-colors duration-fast"
                  >
                    {group.title}
                  </a>
                </li>
              )}
              {group.items.map((it) => (
                <li>
                  <a
                    href={it.href}
                    role="menuitem"
                    class="block px-4 py-2 text-sm text-ink/85 hover:bg-brand-500/5 hover:text-brand-500 transition-colors duration-fast"
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  })}
</nav>
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/PrimaryNav.astro
git commit -m "feat(nav): add PrimaryNav desktop dropdown bar"
```

---

### Task 4: Mount `PrimaryNav` in the Header (logo moves left, MegaMenu unmounted)

**Files:**
- Modify: `src/components/Header.astro` (full rewrite of the 30 lines)

- [ ] **Step 1: Replace the Header file**

Overwrite `src/components/Header.astro` with:

```astro
---
import logo from '../assets/icons/elysee-logo.svg';
import Container from './Container.astro';
import PrimaryNav from './PrimaryNav.astro';
---
<header
  data-header
  class="fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,box-shadow,color] duration-base ease-out-quint"
>
  <Container size="xl" class="flex items-center gap-6 py-4 md:py-5">
    <a href="/" class="flex items-center shrink-0" aria-label="Elysse Group — home">
      <img src={logo.src} width={logo.width} height={logo.height} alt="Elysse Group" class="h-8 w-auto md:h-10" loading="eager" />
    </a>
    <PrimaryNav />
  </Container>
</header>
<script>import '../scripts/header.client';</script>
```

Note: `MobileNav` is added in Task 7. We intentionally remove the old `[data-menu-trigger]` button now so the desktop test for "old MegaMenu trigger is gone" can pass at the end of Task 6. Mobile viewports temporarily have no menu access between Tasks 4 and 7 — acceptable because tests for mobile do not run until Task 8.

- [ ] **Step 2: Restart the dev server (or trust HMR) and visually confirm 8 triggers render at ≥ 1024px**

Run: `pnpm dev` (skip if already running). Open http://localhost:4321/ at desktop width; confirm the 8 category labels appear to the right of the logo.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(nav): mount PrimaryNav in Header, move logo to left"
```

---

### Task 5: Wire desktop dropdown interactions in `nav.client.ts`

**Files:**
- Create: `src/scripts/nav.client.ts`
- Modify: `src/components/Header.astro` (add the script import)

- [ ] **Step 1: Create the script with the desktop block only**

```typescript
// Desktop: hover + click + keyboard for the PrimaryNav dropdowns.
const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-group]'));

function setOpen(group: HTMLElement, open: boolean) {
  const btn = group.querySelector<HTMLButtonElement>('[data-nav-trigger]');
  const panel = group.querySelector<HTMLElement>('[data-nav-panel]');
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.classList.toggle('opacity-0', !open);
  panel.classList.toggle('invisible', !open);
  panel.classList.toggle('translate-y-1', !open);
  panel.classList.toggle('opacity-100', open);
  panel.classList.toggle('visible', open);
  panel.classList.toggle('translate-y-0', open);
}

function closeAll(except?: HTMLElement) {
  for (const g of groups) {
    if (g === except) continue;
    setOpen(g, false);
  }
}

for (const g of groups) {
  const btn = g.querySelector<HTMLButtonElement>('[data-nav-trigger]');
  if (!btn) continue;

  g.addEventListener('mouseenter', () => {
    closeAll(g);
    setOpen(g, true);
  });
  g.addEventListener('mouseleave', () => setOpen(g, false));

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    closeAll(g);
    setOpen(g, !expanded);
  });

  btn.addEventListener('focus', () => {
    closeAll(g);
    setOpen(g, true);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

document.addEventListener('click', (e) => {
  const target = e.target as Node;
  if (!groups.some((g) => g.contains(target))) closeAll();
});
```

- [ ] **Step 2: Import the script from Header.astro**

Edit `src/components/Header.astro` and append after the existing `<script>import '../scripts/header.client';</script>` line:

```astro
<script>import '../scripts/nav.client';</script>
```

- [ ] **Step 3: Run the desktop nav spec — should now pass**

Run: `pnpm exec playwright test tests/nav.spec.ts --project=chromium -g "desktop primary nav" 2>&1 | tail -20`
Expected: 5 passed, 0 failed.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/nav.client.ts src/components/Header.astro
git commit -m "feat(nav): wire desktop dropdown interactions"
```

---

### Task 6: Write a failing Playwright spec for the mobile nav

**Files:**
- Modify: `tests/nav.spec.ts` (append the mobile describe block)

- [ ] **Step 1: Append the mobile describe block**

Add to the bottom of `tests/nav.spec.ts`:

```typescript
const MOBILE = { width: 390, height: 844 };

test.describe('mobile primary nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  });

  test('desktop nav is hidden on mobile', async ({ page }) => {
    await expect(page.locator('[data-primary-nav]')).toBeHidden();
  });

  test('hamburger opens the drawer; drawer lists all 8 categories', async ({ page }) => {
    const hamburger = page.locator('[data-mobile-trigger]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    const drawer = page.locator('[data-mobile-drawer]');
    await expect(drawer).toBeVisible();
    const accTriggers = drawer.locator('[data-mobile-acc-trigger]');
    await expect(accTriggers).toHaveCount(8);
  });

  test('tapping a category expands its sub-items; tapping another closes the first', async ({ page }) => {
    await page.locator('[data-mobile-trigger]').click();
    const drawer = page.locator('[data-mobile-drawer]');
    const careers = drawer.locator('[data-mobile-group]', { hasText: 'Careers' }).locator('[data-mobile-acc-trigger]');
    const about = drawer.locator('[data-mobile-group]', { hasText: 'About Us' }).locator('[data-mobile-acc-trigger]');

    await careers.click();
    await expect(careers).toHaveAttribute('aria-expanded', 'true');
    await about.click();
    await expect(careers).toHaveAttribute('aria-expanded', 'false');
    await expect(about).toHaveAttribute('aria-expanded', 'true');
  });

  test('Escape closes the drawer', async ({ page }) => {
    const hamburger = page.locator('[data-mobile-trigger]');
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});
```

- [ ] **Step 2: Run the mobile spec and confirm it fails**

Run: `pnpm exec playwright test tests/nav.spec.ts --project=chromium -g "mobile primary nav" 2>&1 | tail -30`
Expected: All mobile tests FAIL (selectors `[data-mobile-trigger]`, `[data-mobile-drawer]`, `[data-mobile-acc-trigger]`, `[data-mobile-group]` do not exist).

- [ ] **Step 3: Commit**

```bash
git add tests/nav.spec.ts
git commit -m "test(nav): add failing mobile primary-nav spec"
```

---

### Task 7: Build `MobileNav.astro` (hamburger + slide-in drawer + accordion)

**Files:**
- Create: `src/components/MobileNav.astro`
- Modify: `src/components/Header.astro` (mount the component)

- [ ] **Step 1: Create the component**

```astro
---
import { navGroups } from '../data/navigation';
---
<button
  data-mobile-trigger
  type="button"
  class="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wide font-medium hover:text-brand-accent transition-colors duration-fast lg:hidden"
  aria-expanded="false"
  aria-controls="mobile-nav"
  aria-label="Open menu"
>
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M5 9h18M5 14h18M5 19h18" />
  </svg>
</button>

<div
  data-mobile-root
  id="mobile-nav"
  class="fixed inset-0 z-50 hidden lg:!hidden"
  role="dialog"
  aria-modal="true"
  aria-label="Primary navigation"
>
  <div
    data-mobile-backdrop
    class="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-base ease-out-quint"
  ></div>
  <aside
    data-mobile-drawer
    class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface text-ink translate-x-full transition-transform duration-base ease-out-quint overflow-y-auto"
  >
    <div class="flex items-center justify-between px-6 py-5 border-b border-ink/10">
      <span class="text-sm uppercase tracking-widest font-medium">Menu</span>
      <button
        data-mobile-close
        type="button"
        class="inline-flex items-center justify-center p-2 hover:text-brand-500 transition-colors duration-fast"
        aria-label="Close menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>

    <nav class="px-2 py-4" aria-label="Mobile primary">
      <ul>
        {navGroups.map((group, idx) => {
          const panelId = `mobile-panel-${idx}`;
          const hasItems = group.items.length > 0;
          return (
            <li data-mobile-group class="border-b border-ink/5">
              <button
                type="button"
                data-mobile-acc-trigger
                aria-expanded="false"
                aria-controls={panelId}
                class="w-full flex items-center justify-between px-4 py-3 text-sm uppercase tracking-widest font-medium text-ink hover:text-brand-500 transition-colors duration-fast"
              >
                <span>{group.title}</span>
                {hasItems && (
                  <svg data-mobile-acc-icon class="transition-transform duration-fast" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                )}
              </button>
              {hasItems && (
                <div data-mobile-panel id={panelId} class="hidden px-4 pb-3">
                  <ul class="space-y-1">
                    {group.href && (
                      <li>
                        <a href={group.href} class="block py-2 text-sm font-medium text-ink/90 hover:text-brand-500 transition-colors duration-fast">
                          {group.title}
                        </a>
                      </li>
                    )}
                    {group.items.map((it) => (
                      <li>
                        <a href={it.href} class="block py-2 text-sm text-ink/80 hover:text-brand-500 transition-colors duration-fast">
                          {it.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
</div>
```

- [ ] **Step 2: Mount it in Header.astro**

Edit `src/components/Header.astro`. Add the import next to the existing imports:

```astro
import MobileNav from './MobileNav.astro';
```

And add the component as the last child of `<Container>` (after `<PrimaryNav />`):

```astro
    <PrimaryNav />
    <MobileNav />
```

- [ ] **Step 3: Type-check**

Run: `pnpm astro check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/MobileNav.astro src/components/Header.astro
git commit -m "feat(nav): add MobileNav drawer with accordion sections"
```

---

### Task 8: Wire mobile drawer + accordion in `nav.client.ts`

**Files:**
- Modify: `src/scripts/nav.client.ts` (append)

- [ ] **Step 1: Append the mobile block**

Append to the bottom of `src/scripts/nav.client.ts`:

```typescript
// Mobile: hamburger drawer + single-open accordion.
const mobileTrigger = document.querySelector<HTMLButtonElement>('[data-mobile-trigger]');
const mobileRoot = document.querySelector<HTMLElement>('[data-mobile-root]');
const mobileBackdrop = document.querySelector<HTMLElement>('[data-mobile-backdrop]');
const mobileDrawer = document.querySelector<HTMLElement>('[data-mobile-drawer]');
const mobileClose = document.querySelector<HTMLButtonElement>('[data-mobile-close]');
const mobileAccTriggers = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-mobile-acc-trigger]'),
);

if (mobileTrigger && mobileRoot && mobileBackdrop && mobileDrawer && mobileClose) {
  const openDrawer = () => {
    mobileRoot.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileBackdrop.classList.add('opacity-100');
      mobileBackdrop.classList.remove('opacity-0');
      mobileDrawer.classList.remove('translate-x-full');
      mobileDrawer.classList.add('translate-x-0');
    });
    mobileTrigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose.focus();
  };

  const closeDrawer = () => {
    mobileBackdrop.classList.remove('opacity-100');
    mobileBackdrop.classList.add('opacity-0');
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.classList.remove('translate-x-0');
    mobileTrigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(() => mobileRoot.classList.add('hidden'), 320);
    mobileTrigger.focus();
  };

  mobileTrigger.addEventListener('click', () => {
    if (mobileTrigger.getAttribute('aria-expanded') === 'true') closeDrawer();
    else openDrawer();
  });
  mobileClose.addEventListener('click', closeDrawer);
  mobileBackdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileTrigger.getAttribute('aria-expanded') === 'true') {
      closeDrawer();
    }
  });
}

for (const btn of mobileAccTriggers) {
  btn.addEventListener('click', () => {
    const panelId = btn.getAttribute('aria-controls');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';

    for (const other of mobileAccTriggers) {
      if (other === btn) continue;
      const otherId = other.getAttribute('aria-controls');
      const otherPanel = otherId ? document.getElementById(otherId) : null;
      other.setAttribute('aria-expanded', 'false');
      if (otherPanel) otherPanel.classList.add('hidden');
      other.querySelector('[data-mobile-acc-icon]')?.classList.remove('rotate-180');
    }

    btn.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    panel.classList.toggle('hidden', wasOpen);
    btn.querySelector('[data-mobile-acc-icon]')?.classList.toggle('rotate-180', !wasOpen);
  });
}
```

- [ ] **Step 2: Run the mobile spec — should now pass**

Run: `pnpm exec playwright test tests/nav.spec.ts --project=chromium -g "mobile primary nav" 2>&1 | tail -20`
Expected: 4 passed, 0 failed.

- [ ] **Step 3: Run the whole `nav.spec.ts` suite**

Run: `pnpm exec playwright test tests/nav.spec.ts --project=chromium 2>&1 | tail -10`
Expected: 9 passed, 0 failed.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/nav.client.ts
git commit -m "feat(nav): wire mobile drawer and accordion interactions"
```

---

### Task 9: Delete `MegaMenu.astro` and prune `header.client.ts`

**Files:**
- Delete: `src/components/MegaMenu.astro`
- Modify: `src/scripts/header.client.ts` (remove menu-drawer wiring, keep scroll-color logic)

- [ ] **Step 1: Delete the MegaMenu component**

```bash
git rm src/components/MegaMenu.astro
```

- [ ] **Step 2: Rewrite `src/scripts/header.client.ts`**

Replace the entire file contents with the kept scroll-color logic (drops the old menu queries and the open/close/focus-trap block):

```typescript
const header = document.querySelector<HTMLElement>('[data-header]');

if (header) {
  const setOpaque = (opaque: boolean) => {
    header.dataset.opaque = opaque ? 'true' : 'false';
    header.classList.toggle('bg-surface/90', opaque);
    header.classList.toggle('backdrop-blur-md', opaque);
    header.classList.toggle('shadow-sm', opaque);
    // Invert text colour over the transparent (over-hero) state so logo/menu
    // remain legible against the dark hero image.
    header.classList.toggle('text-ink', opaque);
    header.classList.toggle('text-surface', !opaque);
  };

  const isSnapPage = document.documentElement.hasAttribute('data-snap-page');

  if (isSnapPage) {
    // Snap pages: panels are full-bleed under the header. Stay transparent
    // over dark panels; flip opaque over any [data-light-bg] panel so logo/menu
    // stay legible.
    setOpaque(false);
    const lightPanels = Array.from(
      document.querySelectorAll<HTMLElement>('[data-snap][data-light-bg]'),
    );
    if (lightPanels.length) {
      const visible = new Set<Element>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setOpaque(visible.size > 0);
        },
        // Only count as "visible" once a light panel reaches the top 40% of the
        // viewport — i.e. it's the panel currently being snapped to.
        { threshold: 0, rootMargin: '0px 0px -60% 0px' },
      );
      for (const p of lightPanels) observer.observe(p);
    }
  } else {
    // Non-snap pages: opaque from the start (no transparent hero behind the
    // header, so transparency would just show the white body color).
    setOpaque(true);
  }
}
```

- [ ] **Step 3: Confirm there are no stale references**

Run: `grep -rin "MegaMenu\|data-menu-trigger\|data-menu-root\|data-menu-drawer\|data-menu-backdrop\|data-menu-close\|data-menu-link" src/ tests/ 2>/dev/null`
Expected: empty output (no matches).

- [ ] **Step 4: Type-check and build**

Run: `pnpm astro check && pnpm build`
Expected: both succeed with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/header.client.ts
git commit -m "chore(nav): remove MegaMenu and prune unused header drawer wiring"
```

---

### Task 10: Verify the full test suite + a11y, then final commit if needed

**Files:** none changed; verification only.

- [ ] **Step 1: Run all Playwright specs**

Run: `pnpm exec playwright test --project=chromium 2>&1 | tail -30`
Expected: all suites pass — `nav.spec.ts` (9), `a11y.spec.ts` (10), `home-snapnav.spec.ts` (2), `scroll-flicker-diagnostic.spec.ts` (whatever it had).
If `a11y.spec.ts` reports new violations on any route, inspect the offending node in the test output. Likely culprits: a `[data-nav-trigger]` button missing an accessible name (fix: ensure `<span>{group.title}</span>` renders). Fix and re-run.

- [ ] **Step 2: Run vitest unit suite**

Run: `pnpm test 2>&1 | tail -20`
Expected: PASS (`Button.test.ts` is unrelated and should still pass).

- [ ] **Step 3: Manually verify in the browser**

Visit http://localhost:4321/ at 1440×900 and 390×844. Confirm:
- Desktop: 8 categories visible right of logo; hovering opens dropdown; clicking sub-link navigates.
- Mobile: hamburger opens drawer; tapping a category expands sub-items; tapping another collapses the first.
- Header still flips opaque/transparent correctly when scrolling the home snap-page.

- [ ] **Step 4: If any fix-up commits were needed, commit them**

```bash
git status
git add <fixed files>
git commit -m "fix(nav): <what was wrong>"
```

---

## Self-Review

**Spec coverage:**
- "Remove the mega menu" → Task 9 deletes `MegaMenu.astro` and Task 4 unmounts it from `Header.astro`. ✓
- "Move the options into the navbar" → Task 3 renders all 8 `navGroups` as top-level triggers in `PrimaryNav.astro`, mounted in Task 4. ✓
- "Each sub-category becomes a dropdown" → Task 3 emits a `[data-nav-panel]` per group containing every sub-item; Task 5 wires open/close. ✓
- Mobile fallback (user chose accordion drawer) → Tasks 7 + 8. ✓
- Logo position (user chose left) → Task 4 places the logo first with `flex items-center gap-6`. ✓

**Placeholder scan:** No "TBD", no "add appropriate X", no "similar to Task N". Every step has either runnable code, an exact command with expected output, or a concrete file action. ✓

**Type consistency:**
- Selectors are stable across components and script: `[data-nav-group]`, `[data-nav-trigger]`, `[data-nav-panel]` (desktop); `[data-mobile-trigger]`, `[data-mobile-root]`, `[data-mobile-backdrop]`, `[data-mobile-drawer]`, `[data-mobile-close]`, `[data-mobile-group]`, `[data-mobile-acc-trigger]`, `[data-mobile-acc-icon]`, `[data-mobile-panel]` (mobile). Tests in Tasks 2 and 6 use the same selectors. ✓
- `navGroups` typed as `MegaGroup[]` (matches existing `MegaGroup` interface). ✓
- `group.title`, `group.href`, `group.items[].label`, `group.items[].href` — all match the existing `MegaGroup` / `NavItem` shapes in `src/data/navigation.ts`. ✓

**Note on intermediate state (Tasks 4 → 7):** Between Task 4 (Header rewrite drops the old menu trigger) and Task 7 (MobileNav mounted), users on mobile viewports have no way to open a menu. Acceptable because (a) no mobile tests run until Task 8, (b) commits in between still build cleanly, (c) this is local dev only — nothing ships mid-plan.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-25-navbar-dropdowns.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
