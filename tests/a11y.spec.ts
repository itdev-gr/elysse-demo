import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }, info) => {
    // 'load' (not 'networkidle') — robust against HMR WebSocket on the dev server.
    await page.goto(`http://localhost:4321${route}`, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    if (results.violations.length) {
      console.log(`\n=== ${route} ===`);
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        console.log(`    ${v.helpUrl}`);
        for (const n of v.nodes.slice(0, 3)) {
          console.log(`    target: ${n.target.join(' ')}`);
        }
      }
    }
    expect(results.violations, `axe violations on ${route}`).toEqual([]);
  });
}
