import { test, expect, type Page } from '@playwright/test';

/**
 * Mobile smoke test for the site-wide search flows (iPhone 14-ish viewport).
 * Guards the flows that only exist below the lg breakpoint (drawer search)
 * and that layouts stay inside the viewport (no horizontal overflow).
 */
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

/** The page body must never scroll horizontally on mobile. */
async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `${label}: horizontal overflow of ${overflow}px`).toBeLessThanOrEqual(1);
}

test('drawer search form navigates to /search', async ({ page }) => {
  await page.goto('/');
  await expectNoHorizontalOverflow(page, 'home');

  await page.getByRole('button', { name: 'Open menu' }).click();
  const drawer = page.getByRole('dialog');
  const input = drawer.getByRole('searchbox');
  await expect(input).toBeVisible();

  await input.fill('epsilon');
  await input.press('Enter');
  await page.waitForURL('**/search?q=epsilon');
});

test('/search renders grouped results within the viewport', async ({ page }) => {
  await page.goto('/search?q=epsilon');
  // Grouped results arrive after the client island queries Supabase. The
  // group heading carries a count ("Products (8)") — a bare /Products/ match
  // would also hit the footer's nav column.
  await expect(page.getByText(/Results for/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /^Products \(\d+\)$/ })).toBeVisible();
  await expectNoHorizontalOverflow(page, '/search results');
});

test('/search idle and empty states fit the viewport', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByText(/at least 2 characters/i)).toBeVisible();
  await expectNoHorizontalOverflow(page, '/search idle');

  await page.getByRole('searchbox').fill('zzzznope');
  await expect(page.getByText(/No results for/i)).toBeVisible({ timeout: 15_000 });
  await expectNoHorizontalOverflow(page, '/search empty');
});

test('catalog utility bar stays inside a phone viewport', async ({ page }) => {
  // Pre-seed a valid country code so the picker modal doesn't gate the page
  // (readCountry validates against COUNTRIES codes, e.g. 'cy').
  await page.addInitScript(() => localStorage.setItem('elysee.country', 'cy'));
  await page.goto('/catalog/compression-fittings/?q=adaptor');
  // The toolbar search input adopting ?q= proves initCatalogPage actually ran
  // (the SSR'd bar alone would also say "Showing…", modal or not).
  await expect(page.locator('[data-catalog-search]')).toHaveValue('adaptor', { timeout: 15_000 });
  await expect(page.locator('[data-country-modal]')).toBeHidden();
  await expect(page.locator('[data-catalog-count]')).toContainText(/Showing \d+ of \d+ products/);
  await expectNoHorizontalOverflow(page, 'catalog with ?q=');
});
