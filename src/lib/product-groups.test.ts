import { describe, expect, it } from 'vitest';
import { filterGroups } from './product-groups';
import type { ProductGroup, GroupCountry } from '../types/product';

const group = (code: string, label: string | null): ProductGroup =>
  ({ code, label, description: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' });
const country = (id: string, group_code: string, name: string, cc: string | null): GroupCountry =>
  ({ id, group_code, country: name, country_code: cc, sort_order: 0, created_at: '', updated_at: '' });

const groups = [group('A', 'Europe'), group('B', 'Middle East')];
const countries = [
  country('1', 'A', 'Germany', 'de'),
  country('2', 'A', 'Spain', 'es'),
  country('3', 'B', 'United Arab Emirates', 'ae'),
];

describe('filterGroups', () => {
  it('empty query returns every group with its full country list', () => {
    const out = filterGroups(groups, countries, '');
    expect(out.map((m) => m.group.code)).toEqual(['A', 'B']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['1', '2']);
  });
  it('a group matching by label keeps all its countries', () => {
    const out = filterGroups(groups, countries, 'europe');
    expect(out.map((m) => m.group.code)).toEqual(['A']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['1', '2']);
  });
  it('a country match narrows the group to matching chips only', () => {
    const out = filterGroups(groups, countries, 'spain');
    expect(out.map((m) => m.group.code)).toEqual(['A']);
    expect(out[0].countries.map((c) => c.id)).toEqual(['2']);
  });
  it('matches by country code', () => {
    const out = filterGroups(groups, countries, 'ae');
    expect(out.map((m) => m.group.code)).toEqual(['B']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterGroups(groups, countries, 'zzz')).toEqual([]);
  });
});
