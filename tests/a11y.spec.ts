import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/',
  '/about-us/',
  '/about-us/history/',
  '/about-us/company-structure/',
  '/about-us/vision-mission-values/',
  '/about-us/quality-certifications/',
  '/our-services/agriculture/',
  '/our-services/landscape/',
  '/our-services/building-infrastructure/',
  '/our-services/industry/',
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
];

async function expectNoAxeViolations(page: Page, route: string) {
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
}

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }) => {
    // 'load' (not 'networkidle') — robust against HMR WebSocket on the dev server.
    const resp = await page.goto(`http://localhost:4321${route}`, { waitUntil: 'load' });
    // A dead route renders a blank 404 with zero axe violations — assert the
    // page actually exists so removed pages fail loudly instead of silently
    // passing (this list once carried 11 such ghosts).
    expect(resp?.ok(), `${route} responded ${resp?.status()}`).toBeTruthy();
    await expectNoAxeViolations(page, route);
  });
}

// Product detail pages are DB-driven (slugs change with catalog data), so
// resolve one real config link per category from its live listing instead of
// hardcoding slugs that rot — same pattern as catalog-images.spec.ts.
for (const category of ['compression-fittings', 'saddles']) {
  test(`a11y: first product detail page under /catalog/${category}/`, async ({ page }) => {
    await page.goto(`http://localhost:4321/catalog/${category}/`, { waitUntil: 'load' });
    const href = await page.evaluate((cat) =>
      Array.from(document.querySelectorAll('a'))
        .map((a) => a.getAttribute('href') ?? '')
        .find((h) => new RegExp(`^/catalog/${cat}/[^/?#]+/?$`).test(h)) ?? null,
      category);
    expect(href, `no config detail link found on /catalog/${category}/`).toBeTruthy();
    const resp = await page.goto(`http://localhost:4321${href}`, { waitUntil: 'load' });
    expect(resp?.ok(), `${href} responded ${resp?.status()}`).toBeTruthy();
    await expectNoAxeViolations(page, href!);
  });
}
