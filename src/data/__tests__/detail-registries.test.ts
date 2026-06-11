import { describe, expect, it } from 'vitest';
import type { ProjectsBlock } from '../site-content';
import {
  fundedProjectDetails,
  innovationInsightDetails,
  exhibitionDetails,
  mediaDetails,
  ebookDetails,
  innovationInsightsItems,
  insightsExhibitionsItems,
  insightsMediaItems,
  insightsEbooksItems,
  innovationFundedProjects,
} from '../site-content';

const registries = [
  { name: 'fundedProjectDetails', entries: fundedProjectDetails },
  { name: 'innovationInsightDetails', entries: innovationInsightDetails },
  { name: 'exhibitionDetails', entries: exhibitionDetails },
  { name: 'mediaDetails', entries: mediaDetails },
  { name: 'ebookDetails', entries: ebookDetails },
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
  {
    name: 'insightsExhibitionsItems → exhibitionDetails',
    items: insightsExhibitionsItems,
    base: '/insights/exhibitions/',
    slugs: new Set(exhibitionDetails.map((d) => d.slug)),
  },
  {
    name: 'insightsMediaItems → mediaDetails',
    items: insightsMediaItems,
    base: '/insights/media/',
    slugs: new Set(mediaDetails.map((d) => d.slug)),
  },
  {
    name: 'insightsEbooksItems → ebookDetails',
    items: insightsEbooksItems,
    base: '/insights/ebooks/',
    slugs: new Set(ebookDetails.map((d) => d.slug)),
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

describe('innovationFundedProjects blocks → fundedProjectDetails', () => {
  it('all project hrefs resolve to registered project slugs', () => {
    const projectHrefs = innovationFundedProjects.blocks
      .filter((b): b is ProjectsBlock => b.kind === 'projects')
      .flatMap((b) => b.items.map((p) => p.href))
      .filter((href): href is string => Boolean(href) && href !== '#');

    expect(projectHrefs).toHaveLength(3);

    const slugs = new Set(fundedProjectDetails.map((d) => d.slug));
    for (const href of projectHrefs) {
      const slug = slugUnder(href, '/innovation/funded-research-projects/');
      expect(slug, `href "${href}" is not under the funded-projects base path`).not.toBeNull();
      expect(slugs, `slug "${slug}" missing from fundedProjectDetails`).toContain(slug);
    }
  });
});
