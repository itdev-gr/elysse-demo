import { describe, test, expect } from 'vitest';
import {
  productPillTabs,
  getLeavesForTab,
  resolveDefaultTab,
} from './product-megamenu';
import { productCategories } from './product-categories';

describe('product-megamenu data', () => {
  test('exposes exactly 5 pill tabs in fixed order', () => {
    expect(productPillTabs.map((t) => t.id)).toEqual([
      'pipes',
      'fittings',
      'valves-control',
      'irrigation',
      'drainage-cable',
    ]);
  });

  test('every pill references valid category slugs', () => {
    const known = new Set(productCategories.map((c) => c.slug));
    for (const tab of productPillTabs) {
      for (const slug of tab.leafSlugs) {
        expect(known.has(slug), `unknown slug "${slug}" in tab "${tab.id}"`).toBe(true);
      }
    }
  });

  test('every category slug belongs to exactly one pill (no orphans, no dupes)', () => {
    const allSlugs = productCategories.map((c) => c.slug).sort();
    const pillSlugs = productPillTabs.flatMap((t) => t.leafSlugs).sort();
    expect(pillSlugs).toEqual(allSlugs);
  });

  test('getLeavesForTab returns category objects in the order declared on the tab', () => {
    const leaves = getLeavesForTab('fittings');
    expect(leaves.map((l) => l.slug)).toEqual([
      'compression-fittings',
      'hydraulic-fittings',
      'saddles',
      'light-weight-fittings',
    ]);
  });

  test('resolveDefaultTab picks the tab whose leaf matches the current pathname', () => {
    expect(resolveDefaultTab('/catalog/saddles/')).toBe('fittings');
    expect(resolveDefaultTab('/catalog/turf/')).toBe('irrigation');
  });

  test('resolveDefaultTab falls back to "pipes" when no match', () => {
    expect(resolveDefaultTab('/about-us/')).toBe('pipes');
    expect(resolveDefaultTab('/')).toBe('pipes');
  });
});
