import { describe, expect, it } from 'vitest';
import { filterCategoryCards } from './categories';
import type { ProductCategory, ProductSubcategory } from './categories';

const cat = (over: Partial<ProductCategory>): ProductCategory => ({
  slug: 'x', name: 'X', sort_order: 0, image: '', source_image: null, leaflet_pdf: null,
  blurb: null, product_category_name: null, category_letter: null, is_active: true,
  name_i18n: null, blurb_i18n: null, ...over,
});
const sub = (over: Partial<ProductSubcategory>): ProductSubcategory => ({
  id: 'id', category_slug: 'x', name: 'S', sort_order: 0, is_active: true, name_i18n: null, ...over,
});

const cats = [
  cat({ slug: 'compression', name: 'Compression Fittings' }),
  cat({ slug: 'valves', name: 'Valves' }),
];
const subs = [
  sub({ id: 's1', category_slug: 'compression', name: 'Zeta Series' }),
  sub({ id: 's2', category_slug: 'compression', name: 'Epsilon Series' }),
  sub({ id: 's3', category_slug: 'valves', name: 'Ball Valves' }),
];

describe('filterCategoryCards', () => {
  it('empty query returns every category with its full series list', () => {
    const out = filterCategoryCards(cats, subs, '');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression', 'valves']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(out[1].subs.map((s) => s.id)).toEqual(['s3']);
  });
  it('a category matching by name keeps its full series list', () => {
    const out = filterCategoryCards(cats, subs, 'fittings');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1', 's2']);
  });
  it('matches by slug too', () => {
    expect(filterCategoryCards(cats, subs, 'compr').map((m) => m.cat.slug)).toEqual(['compression']);
  });
  it('when only a series matches, the series list narrows to the matches', () => {
    const out = filterCategoryCards(cats, subs, 'zeta');
    expect(out.map((m) => m.cat.slug)).toEqual(['compression']);
    expect(out[0].subs.map((s) => s.id)).toEqual(['s1']);
  });
  it('a series match in one category does not resurrect another', () => {
    expect(filterCategoryCards(cats, subs, 'ball').map((m) => m.cat.slug)).toEqual(['valves']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterCategoryCards(cats, subs, 'zzz')).toEqual([]);
  });
});
