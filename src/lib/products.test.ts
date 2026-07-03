import { describe, it, expect } from 'vitest';
import { expandCountriesForGroups } from './product-groups';
import type { GroupCountry } from '../types/product';

const gc = (group_code: string, country_code: string): GroupCountry => ({
  id: country_code, group_code, country: country_code.toUpperCase(),
  country_code, sort_order: 0, created_at: '', updated_at: '',
});

describe('expandCountriesForGroups', () => {
  const all: GroupCountry[] = [gc('A', 'gr'), gc('A', 'es'), gc('C', 'cy'), gc('D', 'au')];
  it('expands a product\'s groups to the union of their country codes', () => {
    expect(expandCountriesForGroups(['A', 'D'], all).sort()).toEqual(['au', 'es', 'gr']);
  });
  it('returns [] for no groups', () => {
    expect(expandCountriesForGroups([], all)).toEqual([]);
  });
  it('ignores group codes with no countries', () => {
    expect(expandCountriesForGroups(['B'], all)).toEqual([]);
  });
});

import { parsePnFromSubCategory, parseDnFromSize, toCatalogProduct, orderConfigEntries } from './products';
import type { Product } from '../types/product';

describe('parsePnFromSubCategory', () => {
  it('reads PN rating', () => {
    expect(parsePnFromSubCategory('Epsilon Series PN16')).toBe(16);
    expect(parsePnFromSubCategory('Lambda Series PN10')).toBe(10);
    expect(parsePnFromSubCategory('Spare Parts')).toBeUndefined();
  });
});
describe('parseDnFromSize', () => {
  it('reads the leading diameter', () => {
    expect(parseDnFromSize('16 x ⅜"')).toEqual([16, 16]);
    expect(parseDnFromSize('20 x ¾"')).toEqual([20, 20]);
    expect(parseDnFromSize(null)).toBeUndefined();
    expect(parseDnFromSize('20 x 15')).toEqual([20, 20]);
  });
});
describe('toCatalogProduct', () => {
  const p: Product = {
    code: '330001610', category: 'A', category_name: 'Compression Fittings',
    sub_category: 'Epsilon Series PN16', family_code: '330', configuration: 'Adaptor Male',
    size: '16 x ⅜"', packing_bag: 25, packing_box: 750, moq: 0, box_size: 'L',
    description: 'Adaptor Male Epsilon Series PN16 - 16 x ⅜"',
    name_i18n: null, description_i18n: null, image_url: null, sort_order: 1,
    is_active: true, is_hidden: false, created_at: '', updated_at: '',
  };
  it('maps fields and country availability', () => {
    const cp = toCatalogProduct(p, ['gr', 'au'], 'compression-fittings');
    expect(cp.slug).toBe('330001610');
    expect(cp.code).toBe('330001610');
    expect(cp.categorySlug).toBe('compression-fittings');
    expect(cp.name).toBe('Adaptor Male Epsilon Series PN16 - 16 x ⅜"');
    expect(cp.pnRating).toBe(16);
    expect(cp.dnRange).toEqual([16, 16]);
    expect(cp.availableCountries).toEqual(['gr', 'au']);
    expect(cp.material).toBe('Epsilon Series PN16'); // sub_category reused as the "series" facet
    expect(cp.specs).toContainEqual({ key: 'MOQ', value: '0' });
    expect(cp.specs).toContainEqual({ key: 'Packing (bag)', value: '25' });
    expect(cp.specs).toContainEqual({ key: 'Packing (box)', value: '750' });
  });

  // Regression: the catalogue slug must come from the passed argument, not a
  // hardcoded name→slug map. A category added after launch (e.g. Light-Weight
  // Fittings) used to fall back to 'compression-fittings', so the client's
  // by-category filter hid the product after SSR painted it.
  it('uses the supplied category slug for newer categories', () => {
    const lw: Product = { ...p, code: 'LW1', category_name: 'Light-Weight Fittings', category: 'D' };
    const cp = toCatalogProduct(lw, ['gr'], 'light-weight-fittings');
    expect(cp.categorySlug).toBe('light-weight-fittings');
  });
});

describe('orderConfigEntries', () => {
  const mk = (sub: string, fam: string, order: number) =>
    ({ rep: { sub_category: sub, family_code: fam, code: fam }, order, id: `${sub}/${fam}` });

  it('orders families within a series by famSort; preserves series order; falls back to product order', () => {
    const entries = [
      mk('A', '330', 10),   // family sort 2
      mk('A', '330A', 11),  // family sort 3
      mk('A', '330B', 1),   // family sort 1 (also lowest product order → series A rank = 1)
      mk('B', '550', 5),    // series B (rank 5, after A)
      mk('B', '551', 6),    // no famSort entry → fallback product order
    ];
    const famSort = new Map([['330', 2], ['330A', 3], ['330B', 1], ['550', 9]]);
    expect(orderConfigEntries(entries, famSort).map((e) => e.id))
      .toEqual(['A/330B', 'A/330', 'A/330A', 'B/550', 'B/551']);
  });

  it('within a series, families missing a famSort sort after the ordered ones by product order', () => {
    const entries = [mk('X', 'a', 1), mk('X', 'b', 2), mk('X', 'c', 3)];
    const famSort = new Map([['b', 1]]);
    expect(orderConfigEntries(entries, famSort).map((e) => e.id)).toEqual(['X/b', 'X/a', 'X/c']);
  });
});

import { resolveConfigImages } from './products';

describe('resolveConfigImages', () => {
  it('uses the family images and makes the first the primary', () => {
    expect(resolveConfigImages(['p', 'a', 'b'], '/old.png')).toEqual({
      images: ['p', 'a', 'b'], image: 'p',
    });
  });
  it('falls back to the existing single image when the family has none', () => {
    expect(resolveConfigImages(undefined, '/old.png')).toEqual({ images: [], image: '/old.png' });
    expect(resolveConfigImages([], null)).toEqual({ images: [], image: null });
  });
});
