import { describe, it, expect } from 'vitest';
import {
  placementsByFamily, diffPlacements, crossListedFamiliesFor, buildCrossListedCards,
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

describe('placementsByFamily', () => {
  it('groups rows by family with their category + series', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf', sub_category: 'Turf Drippers' },
      { family_id: 'f1', category_slug: 'valves', sub_category: 'Ball Valves' },
      { family_id: 'f2', category_slug: 'turf', sub_category: 'Turf Pipe' },
    ];
    expect(placementsByFamily(rows)).toEqual({
      f1: [{ category_slug: 'turf', sub_category: 'Turf Drippers' },
           { category_slug: 'valves', sub_category: 'Ball Valves' }],
      f2: [{ category_slug: 'turf', sub_category: 'Turf Pipe' }],
    });
  });
  it('returns {} for no listings', () => {
    expect(placementsByFamily([])).toEqual({});
  });
});

describe('diffPlacements', () => {
  it('upserts added and changed series, deletes cleared ones', () => {
    const current = { turf: 'Turf Drippers', valves: 'Ball Valves' };
    const next = { turf: 'Turf Pipe', saddles: 'Clamp Saddles', valves: '' };
    expect(diffPlacements(current, next)).toEqual({
      upserts: [
        { category_slug: 'turf', sub_category: 'Turf Pipe' },     // changed series
        { category_slug: 'saddles', sub_category: 'Clamp Saddles' }, // new
      ],
      deletes: ['valves'],                                        // cleared
    });
  });
  it('is empty when nothing changed', () => {
    expect(diffPlacements({ turf: 'A' }, { turf: 'A' })).toEqual({ upserts: [], deletes: [] });
  });
  it('treats absent and empty-string keys as not shown', () => {
    expect(diffPlacements({ turf: 'A' }, {})).toEqual({ upserts: [], deletes: ['turf'] });
    expect(diffPlacements({}, { turf: '' })).toEqual({ upserts: [], deletes: [] });
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
      { family_id: 'f1', category_slug: 'turf', sub_category: 'S' },
      { family_id: 'f2', category_slug: 'valves', sub_category: 'S' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf').map((f) => f.id)).toEqual(['f1']);
  });
  it('drops self-listings and unknown families', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f3', category_slug: 'turf', sub_category: 'S' },  // f3 is home in turf
      { family_id: 'gone', category_slug: 'turf', sub_category: 'S' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
});

describe('buildCrossListedCards', () => {
  it('relabels the card to the destination series and rebrands for the extra page', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(cards, new Map([['330A', 'Turf Drippers']]), new Set(), 'turf');
    expect(out).toHaveLength(1);
    expect(out[0].categorySlug).toBe('turf');
    expect(out[0].detailCategorySlug).toBe('compression-fittings');
    expect(out[0].material).toBe('Turf Drippers');   // destination series, not home series
    expect(out[0].slug).toBe('series-330a');          // slug (detail link) unchanged
  });
  it('assigns each code its own destination series', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(
      cards, new Map([['330A', 'Series A'], ['331', 'Series B']]), new Set(), 'turf');
    expect(out.map((c) => [c.code, c.material])).toEqual([['330A', 'Series A'], ['331', 'Series B']]);
  });
  it('drops cards whose HOME series is hidden', () => {
    const cards = [card({ code: '330A', material: 'Hidden Home Series' })];
    expect(buildCrossListedCards(cards, new Map([['330A', 'Turf Drippers']]),
      new Set(['Hidden Home Series']), 'turf')).toEqual([]);
  });
  it('does not mutate the input cards', () => {
    const original = card({ code: '330A' });
    buildCrossListedCards([original], new Map([['330A', 'X']]), new Set(), 'turf');
    expect(original.categorySlug).toBe('compression-fittings');
    expect(original.material).toBe('Compression Fittings PN16');
  });
});
