import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const ROUTES = [
  '/',
  '/about-us/',
  '/about-us/your-marine-energy-provider/',
  '/our-services/fuel-products/',
  '/our-services/marine-lubricants/',
  '/our-services/alternative-fuels/',
  '/our-services/advisory-services/',
  '/contact/',
  '/press-room/news/',
  '/legal/privacy-policy/',
];
const BPS = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'laptop-1024',  viewport: { width: 1024, height: 768 } },
  { name: 'tablet-768',   viewport: { width: 768,  height: 1024 } },
  { name: 'mobile-390',   viewport: { width: 390,  height: 844 }, ua: devices['iPhone 14'].userAgent },
];

const slug = (p: string) => (p.replace(/^\//, '').replace(/\/$/, '') || 'home').replace(/\//g, '__');

(async () => {
  const browser = await chromium.launch();
  for (const bp of BPS) {
    const ctx = await browser.newContext({ viewport: bp.viewport, userAgent: bp.ua });
    await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });
    const dir = resolve('screenshots-rebuild', bp.name);
    mkdirSync(dir, { recursive: true });
    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(800);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${dir}/${slug(route)}.png`, fullPage: true });
        console.log(`✓ ${bp.name} ${route}`);
      } catch (e) {
        console.warn(`✗ ${bp.name} ${route}  ${(e as Error).message}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
