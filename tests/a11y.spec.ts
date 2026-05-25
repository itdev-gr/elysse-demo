import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/',
  '/about-us/',
  '/about-us/your-marine-energy-provider/',
  '/about-us/history/',
  '/about-us/company-structure/',
  '/about-us/vision-mission-values/',
  '/about-us/quality-certifications/',
  '/our-services/agriculture/',
  '/our-services/landscape/',
  '/our-services/building-infrastructure/',
  '/our-services/industry/',
  '/contact/',
  '/press-room/news/',
  '/legal/privacy-policy/',
  '/green-elysee/',
  '/green-elysee/certifications/',
  '/green-elysee/reports/',
  '/green-elysee/insights/',
  '/innovation/why-innovation/',
  '/innovation/research-development/',
  '/innovation/funded-research-projects/',
  '/innovation/insights/',
  '/innovation/network-partners/',
  '/innovation/innovate-with-us/',
  '/products/',
  '/products/catalogues/',
  '/insights/news/',
  '/insights/blog/',
  '/insights/exhibitions/',
  '/insights/media/',
  '/insights/ebooks/',
  '/contact/local/',
  '/contact/worldwide/',
  '/contact/wise/',
  '/contact/prime/',
  '/contact/rohrsysteme/',
  '/catalog/compression-fittings/',
  '/catalog/hydraulic-fittings/',
  '/catalog/saddles/',
  '/catalog/light-weight-fittings/',
  '/catalog/valves/',
  '/catalog/filters-and-dosers/',
  '/catalog/micro-irrigation-and-sprinklers/',
  '/catalog/turf/',
  '/catalog/polyethylene-pipes/',
  '/catalog/pvc-pressure-pipes-and-fittings/',
  '/catalog/network-drainage/',
  '/catalog/cable-applications/',
  '/catalog/building-sewerage/',
  '/catalog/compression-fittings/epsilon/',
  '/catalog/compression-fittings/coupling-epsilon-pn16/',
  '/catalog/compression-fittings/coupling-repair/',
  '/catalog/compression-fittings/coupling-transition/',
  '/catalog/compression-fittings/adaptor-flanged/',
  '/catalog/saddles/single-4-bolts/',
  '/catalog/saddles/saddle-clamp/',
  '/catalog/valves/pvc-ball-valve/',
  '/catalog/pvc-pressure-pipes-and-fittings/double-union-glued/',
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
