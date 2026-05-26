import { test, expect } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };

test.describe('Products mega-menu (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  });

  test('opens pill panel when Products trigger is activated', async ({ page }) => {
    const products = page.locator('[data-nav-group]', { hasText: 'Products' });
    await products.locator('[data-nav-trigger]').click();
    const panel = page.locator('[data-products-mega-panel]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[role="tab"]')).toHaveCount(5);
  });

  test('default active pill is "pipes" on the home page', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    const pipesPill = page.locator('[data-product-pill="pipes"]');
    await expect(pipesPill).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking a different pill swaps the leaf list', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    await page.locator('[data-product-pill="fittings"]').click();
    await expect(page.locator('[data-product-pill="fittings"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-product-leaf="compression-fittings"]')).toBeVisible();
    await expect(page.locator('[data-product-leaf="saddles"]')).toBeVisible();
  });

  test('utility strip exposes Categories / Catalogues / BIM links', async ({ page }) => {
    await page.locator('[data-nav-group]', { hasText: 'Products' }).locator('[data-nav-trigger]').click();
    const panel = page.locator('[data-products-mega-panel]');
    await expect(panel.locator('[data-product-utility="/products/"]')).toBeVisible();
    await expect(panel.locator('[data-product-utility="/products/catalogues/"]')).toBeVisible();
    await expect(panel.locator('[data-product-utility="https://elysee.partcommunity.com/"]')).toBeVisible();
  });
});
