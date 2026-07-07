import { describe, it, expect } from 'vitest';
import {
  buildVisibilityTree, triState, codesForConfig, codesForSeries, matchesQuery,
  isZetaSeries,
  type VisibilityRow,
} from './visibility';

const row = (over: Partial<VisibilityRow>): VisibilityRow => ({
  code: 'X', sub_category: 'Epsilon', family_code: '330', configuration: 'Adaptor',
  size: '16', sort_order: 0, is_hidden: false, ...over,
});

describe('buildVisibilityTree', () => {
  const rows = [
    row({ code: 'A1', sort_order: 2 }),
    row({ code: 'A2', sort_order: 1, is_hidden: true }),
    row({ code: 'B1', family_code: '340', configuration: 'Elbow', sort_order: 5 }),
    row({ code: 'C1', sub_category: 'Zeta', family_code: '330', sort_order: 0 }),
  ];
  const tree = buildVisibilityTree(rows);
  it('groups series → configuration and counts visibility', () => {
    expect(tree.map((s) => s.series)).toEqual(['Epsilon', 'Zeta']);
    const eps = tree[0];
    expect(eps.configs.map((c) => c.familyCode)).toEqual(['330', '340']);
    expect(eps.configs[0].visible).toBe(1);
    expect(eps.configs[0].total).toBe(2);
    expect(eps.visible).toBe(2);
    expect(eps.total).toBe(3);
  });
  it('orders sizes by sort_order inside a configuration', () => {
    expect(tree[0].configs[0].sizes.map((s) => s.code)).toEqual(['A2', 'A1']);
  });
  it('falls back to the code when family_code is null (own card)', () => {
    const t = buildVisibilityTree([row({ code: 'F1', family_code: null })]);
    expect(t[0].configs[0].familyCode).toBeNull();
    expect(t[0].configs[0].key).toBe('Epsilon||F1');
  });
  it('groups blank series under null last', () => {
    const t = buildVisibilityTree([row({}), row({ code: 'N1', sub_category: null })]);
    expect(t.map((s) => s.series)).toEqual(['Epsilon', null]);
  });
});

describe('triState', () => {
  it('classifies all / none / mixed', () => {
    expect(triState(3, 3)).toBe('all');
    expect(triState(0, 3)).toBe('none');
    expect(triState(1, 3)).toBe('mixed');
  });
});

describe('bulk code collection', () => {
  const tree = buildVisibilityTree([
    row({ code: 'A1' }), row({ code: 'A2', is_hidden: true }),
    row({ code: 'B1', family_code: '340' }),
  ]);
  it('codesForConfig returns every size code of the card', () => {
    expect(codesForConfig(tree[0].configs[0])).toEqual(['A1', 'A2']);
  });
  it('codesForSeries returns every size code of the series', () => {
    expect(codesForSeries(tree[0]).sort()).toEqual(['A1', 'A2', 'B1']);
  });
});

describe('isZetaSeries', () => {
  it('matches the Zeta series name regardless of prefix/case', () => {
    expect(isZetaSeries('ζ - Zeta Series PN 16 bar')).toBe(true);
    expect(isZetaSeries('ZETA something')).toBe(true);
  });
  it('rejects other series and null', () => {
    expect(isZetaSeries('έ - Epsilon Series PN 16 bar')).toBe(false);
    expect(isZetaSeries(null)).toBe(false);
  });
});

describe('matchesQuery', () => {
  it('matches code, configuration name and size, case-insensitively', () => {
    expect(matchesQuery(row({ code: '330001610' }), '33000')).toBe(true);
    expect(matchesQuery(row({ configuration: 'Adaptor Male' }), 'adaptor')).toBe(true);
    expect(matchesQuery(row({ size: '16 x ⅜"' }), '16 x')).toBe(true);
    expect(matchesQuery(row({}), 'zzz')).toBe(false);
  });
  it('empty query matches everything', () => {
    expect(matchesQuery(row({}), '')).toBe(true);
  });
});
