import { describe, expect, it } from 'vitest';
import {
  innovationInsightDetails,
  innovationInsightsItems,
} from '../site-content';

// Funded research projects moved to the dashboard-managed `funded_projects`
// table (see FundedProjectsTab); their slugs are validated by the DB unique
// constraint, so they no longer have a static registry to test here.
const registries = [
  { name: 'innovationInsightDetails', entries: innovationInsightDetails },
] as const;

describe('detail registries — slugs', () => {
  for (const { name, entries } of registries) {
    it(`${name}: slugs are non-empty and unique`, () => {
      expect(entries.length).toBeGreaterThan(0);
      const slugs = entries.map((e) => e.slug);
      for (const slug of slugs) {
        expect(slug).toBeTruthy();
        expect(slug.trim()).not.toBe('');
      }
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  }
});

/** Extracts the slug from an href under `base`, or null if it doesn't match. */
function slugUnder(href: string | undefined, base: string): string | null {
  if (!href || !href.startsWith(base)) return null;
  return href.slice(base.length).replace(/\/$/, '');
}

const listToRegistry = [
  {
    name: 'innovationInsightsItems → innovationInsightDetails',
    items: innovationInsightsItems,
    base: '/innovation/insights/',
    slugs: new Set(innovationInsightDetails.map((d) => d.slug)),
  },
] as const;

describe('list-item hrefs resolve to registered detail slugs', () => {
  for (const { name, items, base, slugs } of listToRegistry) {
    it(name, () => {
      for (const it of items) {
        expect(it.href, `"${it.title}" has no href`).toBeTruthy();
        expect(it.href, `"${it.title}" has a placeholder href`).not.toBe('#');
      }
      const detailHrefs = items
        .map((it) => slugUnder(it.href, base))
        .filter((s): s is string => s !== null);
      // Every item in these lists links under its detail base path; a typo'd
      // base or stray href would shrink this count.
      expect(detailHrefs.length).toBe(items.length);
      for (const slug of detailHrefs) {
        expect(slugs, `slug "${slug}" missing from registry`).toContain(slug);
      }
    });
  }
});

