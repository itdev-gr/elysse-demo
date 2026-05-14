import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BPS = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'laptop-1024',  viewport: { width: 1024, height: 768 } },
  { name: 'tablet-768',   viewport: { width: 768,  height: 1024 } },
  { name: 'mobile-390',   viewport: { width: 390,  height: 844 }, ua: devices['iPhone 14'].userAgent },
];

const pages: { url: string }[] = JSON.parse(readFileSync('output/pages.json', 'utf8'));
const slug = (u: string) => {
  const p = new URL(u).pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  return p.replace(/\//g, '__');
};

(async () => {
  const browser = await chromium.launch();
  for (const bp of BPS) {
    const ctx = await browser.newContext({ viewport: bp.viewport, userAgent: bp.ua });
    // Apply the same __name shim used in crawl.ts for tsx/esbuild interop in page.evaluate
    await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });
    const dir = resolve('screenshots', bp.name);
    mkdirSync(dir, { recursive: true });
    for (const { url } of pages) {
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
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
