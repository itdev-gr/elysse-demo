import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };
const EXPECTED_GROUPS = [
  'About Us',
  'Green Elysée',
  'Innovation',
  'Products',
  'Insights',
  'Contact Us',
];

test.describe('desktop primary nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  });

  test('renders all 6 categories as top-level triggers', async ({ page }) => {
    const triggers = page.locator('[data-primary-nav] [data-nav-trigger]');
    await expect(triggers).toHaveCount(6);
    for (let i = 0; i < EXPECTED_GROUPS.length; i++) {
      await expect(triggers.nth(i)).toContainText(EXPECTED_GROUPS[i]);
    }
  });

  test('the old MegaMenu trigger and dialog are gone', async ({ page }) => {
    await expect(page.locator('[data-menu-trigger]')).toHaveCount(0);
    await expect(page.locator('[data-menu-root]')).toHaveCount(0);
  });

  test('clicking a trigger opens its dropdown with the expected sub-items', async ({ page }) => {
    const greenElysee = page.locator('[data-nav-group]', { hasText: 'Green Elysée' });
    const trigger = greenElysee.locator('[data-nav-trigger]');
    const panel = greenElysee.locator('[data-nav-panel]');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('About Green Elysée');
    await expect(panel).toContainText('Certifications');
  });

  test('Escape closes any open dropdown', async ({ page }) => {
    const trigger = page.locator('[data-nav-group]', { hasText: 'Green Elysée' }).locator('[data-nav-trigger]');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opening one dropdown closes any other open one', async ({ page }) => {
    const greenElyseeTrigger = page.locator('[data-nav-group]', { hasText: 'Green Elysée' }).locator('[data-nav-trigger]');
    const innovationTrigger = page.locator('[data-nav-group]', { hasText: 'Innovation' }).locator('[data-nav-trigger]');
    await greenElyseeTrigger.click();
    await expect(greenElyseeTrigger).toHaveAttribute('aria-expanded', 'true');
    await innovationTrigger.click();
    await expect(greenElyseeTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(innovationTrigger).toHaveAttribute('aria-expanded', 'true');
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

  test('hamburger opens the drawer; drawer lists all 6 categories', async ({ page }) => {
    const hamburger = page.locator('[data-mobile-trigger]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    const drawer = page.locator('[data-mobile-drawer]');
    await expect(drawer).toBeVisible();
    const accTriggers = drawer.locator('[data-mobile-acc-trigger]');
    await expect(accTriggers).toHaveCount(6);
  });

  test('tapping a category expands its sub-items; tapping another closes the first', async ({ page }) => {
    await page.locator('[data-mobile-trigger]').click();
    const drawer = page.locator('[data-mobile-drawer]');
    const about = drawer.locator('[data-mobile-group]', { hasText: 'About Us' }).locator('[data-mobile-acc-trigger]');
    const innovation = drawer.locator('[data-mobile-group]', { hasText: 'Innovation' }).locator('[data-mobile-acc-trigger]');

    await about.click();
    await expect(about).toHaveAttribute('aria-expanded', 'true');
    const aboutPanel = drawer
      .locator('[data-mobile-group]', { hasText: 'About Us' })
      .locator('[data-mobile-panel]');
    await expect(aboutPanel).toBeVisible();
    await innovation.click();
    await expect(about).toHaveAttribute('aria-expanded', 'false');
    await expect(innovation).toHaveAttribute('aria-expanded', 'true');
  });

  test('Escape closes the drawer', async ({ page }) => {
    const hamburger = page.locator('[data-mobile-trigger]');
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});
