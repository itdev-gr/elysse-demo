import { test, expect } from '@playwright/test';

test('home: snap-nav dots reflect active section and scroll on click', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // 'load' (not 'networkidle') — robust against HMR WebSocket on the dev server.
  await page.goto('http://localhost:4321/', { waitUntil: 'load' });

  const dots = page.locator('[data-snapnav-dot]');
  await expect(dots).toHaveCount(6);

  // First dot active on initial load (after observer hydrates)
  await expect(dots.nth(0)).toHaveAttribute('data-active', 'true', { timeout: 3_000 });

  // Click the third dot — should activate it after smooth scroll settles
  await dots.nth(2).click();
  await page.waitForTimeout(1_200);
  await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
  await expect(dots.nth(0)).toHaveAttribute('data-active', 'false');

  // Click the last dot — news panel becomes active
  await dots.nth(5).click();
  await page.waitForTimeout(1_200);
  await expect(dots.nth(5)).toHaveAttribute('data-active', 'true');
});

test('home: snap-nav hidden on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // 'load' (not 'networkidle') — robust against HMR WebSocket on the dev server.
  await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  await expect(page.locator('[data-snapnav]')).toBeHidden();
});
