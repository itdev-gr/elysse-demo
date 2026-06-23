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

import { parsePnFromSubCategory, parseDnFromSize, toCatalogProduct } from './products';
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
    const cp = toCatalogProduct(p, ['gr', 'au']);
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
});
