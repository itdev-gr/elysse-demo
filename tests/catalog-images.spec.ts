import { test, expect, type Page } from '@playwright/test';

/**
 * No-broken-images regression net (guards the 2026-07-06 incident class):
 * every storage-hosted product image that loads must decode — a dangling DB
 * reference to a deleted file renders a broken <img> and fails here.
 */

/** Scroll through the page to trigger lazy loading. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
}

/**
 * Broken = the browser finished fetching the image (complete) but it has no
 * pixels (naturalWidth 0) — i.e. a 4xx/decode failure. Still-lazy images that
 * never entered the viewport are skipped (they are not broken, just unloaded).
 */
async function brokenStorageImages(page: Page): Promise<{ src: string }[]> {
  await scrollThrough(page);
  await page.waitForTimeout(800);
  return page.evaluate(() =>
    Array.from(document.images)
      .filter((im) => im.src.includes('/storage/v1/object/public/'))
      .filter((im) => im.complete && !(im.naturalWidth > 0))
      .map((im) => ({ src: im.src })));
}

test('catalog grid renders no broken product images', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elysee.country', 'cy'));
  await page.goto('/catalog/compression-fittings/');
  await expect(page.locator('[data-catalog-count]')).toContainText(/Showing \d+ of \d+/, { timeout: 15_000 });
  const broken = await brokenStorageImages(page);
  expect(broken, `broken images: ${JSON.stringify(broken)}`).toEqual([]);
});

test('a product detail page renders no broken gallery images', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('elysee.country', 'cy'));
  await page.goto('/catalog/compression-fittings/');
  await expect(page.locator('[data-catalog-count]')).toContainText(/Showing \d+ of \d+/, { timeout: 15_000 });
  // First link that goes DEEPER than the listing itself (a config detail page —
  // the nav also links to /catalog/compression-fittings/, which must not match).
  const href = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map((a) => a.getAttribute('href') ?? '')
      .find((h) => /^\/catalog\/compression-fittings\/[^/?#]+\/?$/.test(h)) ?? null);
  expect(href, 'no config detail link found on the listing').toBeTruthy();
  await page.goto(href!);
  await page.waitForLoadState('load');
  const broken = await brokenStorageImages(page);
  expect(broken, `broken images: ${JSON.stringify(broken)}`).toEqual([]);
});
