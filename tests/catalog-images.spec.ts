import { test, expect, type Page } from '@playwright/test';

/**
 * No-broken-images regression net (guards the 2026-07-06 incident class):
 * every storage-hosted product image actually loads — a dangling DB reference
 * to a deleted file would render a broken <img> and fail here.
 */

/** Wait for all storage-hosted images to settle, return the broken ones. */
async function brokenStorageImages(page: Page): Promise<{ src: string }[]> {
  return page.evaluate(async () => {
    const imgs = Array.from(document.images)
      .filter((im) => im.src.includes('/storage/v1/object/public/'));
    await Promise.all(imgs.map((im) => im.complete
      ? Promise.resolve()
      : new Promise<void>((res) => { im.onload = () => res(); im.onerror = () => res(); })));
    return imgs.filter((im) => !(im.naturalWidth > 0)).map((im) => ({ src: im.src }));
  });
}

test('catalog grid renders no broken product images', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elysee.country', 'cy'));
  await page.goto('/catalog/compression-fittings/');
  await expect(page.locator('[data-catalog-count]')).toContainText(/Showing \d+ of \d+/, { timeout: 15_000 });
  await page.waitForTimeout(1_000); // lazy-loaded card images
  const broken = await brokenStorageImages(page);
  expect(broken, `broken images: ${JSON.stringify(broken)}`).toEqual([]);
});

test('a product detail page renders no broken gallery images', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elysee.country', 'cy'));
  await page.goto('/catalog/compression-fittings/');
  await expect(page.locator('[data-catalog-count]')).toContainText(/Showing \d+ of \d+/, { timeout: 15_000 });
  // Open the first configuration card that links to a detail page.
  const first = page.locator('a[href*="/catalog/compression-fittings/"]').first();
  await first.click();
  await page.waitForURL(/\/catalog\/compression-fittings\/.+/);
  await page.waitForTimeout(1_000);
  const broken = await brokenStorageImages(page);
  expect(broken, `broken images: ${JSON.stringify(broken)}`).toEqual([]);
});
