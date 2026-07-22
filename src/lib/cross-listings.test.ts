import { describe, it, expect } from 'vitest';
import {
  extraSlugsByFamily, diffCrossListings, crossListedFamiliesFor, buildCrossListedCards,
  type CrossListingRow,
} from './cross-listings';
import type { ProductFamily } from './families';
import type { CatalogProduct } from '../scripts/catalog/types';

const fam = (over: Partial<ProductFamily>): ProductFamily => ({
  id: 'f1', category_slug: 'compression-fittings', code: '330A',
  sort_order: 0, is_active: true, ...over,
});

const card = (over: Partial<CatalogProduct>): CatalogProduct => ({
  slug: 'series-330a', name: 'Coupling', code: '330A',
  categorySlug: 'compression-fittings', sectors: [], material: 'Compression Fittings PN16',
  standards: [], imageUrls: [], image: '', blurb: '', pressure: '', sizeRange: '',
  bim: false, specs: [], featured: false, hasDetailPage: true,
  availableCountries: [], ...over,
});

describe('extraSlugsByFamily', () => {
  it('groups listing rows by family id', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf' },
      { family_id: 'f1', category_slug: 'valves' },
      { family_id: 'f2', category_slug: 'turf' },
    ];
    expect(extraSlugsByFamily(rows)).toEqual({ f1: ['turf', 'valves'], f2: ['turf'] });
  });
  it('returns {} for no listings', () => {
    expect(extraSlugsByFamily([])).toEqual({});
  });
});

describe('diffCrossListings', () => {
  it('splits into inserts and deletes', () => {
    expect(diffCrossListings(['turf', 'valves'], ['valves', 'saddles']))
      .toEqual({ toAdd: ['saddles'], toRemove: ['turf'] });
  });
  it('is empty when nothing changed', () => {
    expect(diffCrossListings(['turf'], ['turf'])).toEqual({ toAdd: [], toRemove: [] });
  });
  it('handles starting from none', () => {
    expect(diffCrossListings([], ['turf'])).toEqual({ toAdd: ['turf'], toRemove: [] });
  });
});

describe('crossListedFamiliesFor', () => {
  const families = [
    fam({ id: 'f1', code: '330A' }),
    fam({ id: 'f2', code: '440', category_slug: 'saddles' }),
    fam({ id: 'f3', code: '990', category_slug: 'turf' }),
  ];
  it('returns only families listed into the given category', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf' },
      { family_id: 'f2', category_slug: 'valves' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf').map((f) => f.id)).toEqual(['f1']);
  });
  it('drops self-listings (family already home in that category)', () => {
    const rows: CrossListingRow[] = [{ family_id: 'f3', category_slug: 'turf' }];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
  it('ignores listings whose family no longer exists', () => {
    const rows: CrossListingRow[] = [{ family_id: 'gone', category_slug: 'turf' }];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
});

describe('buildCrossListedCards', () => {
  it('keeps only cross-listed codes and rebrands for the extra page', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(cards, new Set(['330A']), new Set(), 'turf');
    expect(out).toHaveLength(1);
    expect(out[0].categorySlug).toBe('turf');                       // client filter keeps it
    expect(out[0].detailCategorySlug).toBe('compression-fittings'); // link stays canonical
    expect(out[0].slug).toBe('series-330a');
  });
  it('drops cards whose series is hidden in the home category', () => {
    const cards = [card({ code: '330A', material: 'Hidden Series' })];
    expect(buildCrossListedCards(cards, new Set(['330A']), new Set(['Hidden Series']), 'turf'))
      .toEqual([]);
  });
  it('keeps cards with no series when a hidden set exists', () => {
    const cards = [card({ code: '330A', material: undefined })];
    expect(buildCrossListedCards(cards, new Set(['330A']), new Set(['X']), 'turf')).toHaveLength(1);
  });
  it('does not mutate the input cards', () => {
    const original = card({ code: '330A' });
    buildCrossListedCards([original], new Set(['330A']), new Set(), 'turf');
    expect(original.categorySlug).toBe('compression-fittings');
  });
});
