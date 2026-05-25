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
    const careersPanel = drawer
      .locator('[data-mobile-group]', { hasText: 'Careers' })
      .locator('[data-mobile-panel]');
    await expect(careersPanel).toBeVisible();
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
