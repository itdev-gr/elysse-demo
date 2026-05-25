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
