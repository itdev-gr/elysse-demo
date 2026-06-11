import { test, expect } from '@playwright/test';
import {
  fundedProjectDetails,
  innovationInsightDetails,
  exhibitionDetails,
  mediaDetails,
  ebookDetails,
} from '../src/data/site-content';

// Same convention as the other specs (no baseURL in playwright.config.ts);
// PW_BASE_URL lets the suite run against a preview on a non-default port.
const BASE_URL = process.env.PW_BASE_URL ?? 'http://localhost:4321';

// News/blog detail routes are Supabase-managed and deliberately excluded.
const cases = [
  ...fundedProjectDetails.map((p) => ({
    url: `/innovation/funded-research-projects/${p.slug}/`,
    heading: p.name,
  })),
  ...innovationInsightDetails.map((a) => ({
    url: `/innovation/insights/${a.slug}/`,
    heading: a.title,
  })),
  ...exhibitionDetails.map((e) => ({ url: `/insights/exhibitions/${e.slug}/`, heading: e.title })),
  ...mediaDetails.map((m) => ({ url: `/insights/media/${m.slug}/`, heading: m.title })),
  ...ebookDetails.map((e) => ({ url: `/insights/ebooks/${e.slug}/`, heading: e.title })),
];

test.describe('detail-page coverage', () => {
  for (const c of cases) {
    test(`renders ${c.url}`, async ({ page }) => {
      const errs: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errs.push(m.text());
      });
      const resp = await page.goto(`${BASE_URL}${c.url}`, { waitUntil: 'load' });
      expect(resp?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(c.heading);
      expect(errs).toEqual([]);
    });
  }
});
