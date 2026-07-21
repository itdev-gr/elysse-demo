import { describe, it, expect } from 'vitest';
import {
  featuredCodes, partitionPickerCountries, featuredPickerList, moveFeatured,
} from './picker-countries';

const row = (country_code: string | null, featured_order: number | null) =>
  ({ country_code, featured_order });

describe('featuredCodes', () => {
  it('maps lowercased codes to their order, skipping unfeatured and null codes', () => {
    const m = featuredCodes([row('CY', 1), row('gr', 5), row('au', null), row(null, 2)]);
    expect([...m.entries()]).toEqual([['cy', 1], ['gr', 5]]);
  });
  it('keeps the lowest order when a code appears twice', () => {
    const m = featuredCodes([row('cy', 4), row('cy', 1)]);
    expect(m.get('cy')).toBe(1);
  });
});

describe('partitionPickerCountries', () => {
  const pool = [
    { code: 'at', label: 'Austria' },
    { code: 'cy', label: 'Cyprus' },
    { code: 'eg', label: 'Egypt' },
    { code: 'gr', label: 'Greece' },
  ];
  it('splits pool into featured (by order) and the rest (alphabetical)', () => {
    const { top, rest } = partitionPickerCountries(pool, new Map([['cy', 1], ['at', 2]]));
    expect(top.map((c) => c.code)).toEqual(['cy', 'at']);
    expect(rest.map((c) => c.code)).toEqual(['eg', 'gr']);
  });
  it('returns an empty top when nothing is featured', () => {
    const { top, rest } = partitionPickerCountries(pool, new Map());
    expect(top).toEqual([]);
    expect(rest.map((c) => c.code)).toEqual(['at', 'cy', 'eg', 'gr']);
  });
});

describe('featuredPickerList', () => {
  it('keeps only featured rows, sorted by featured_order', () => {
    const rows = [row('gr', 5), row('cy', 1), row('au', null)];
    expect(featuredPickerList(rows).map((r) => r.country_code)).toEqual(['cy', 'gr']);
  });

  it('dedupes same-code rows case-insensitively, keeping the lowest order', () => {
    const rows = [row('AU', 3), row('au', 1), row(null, 2)];
    expect(featuredPickerList(rows).map((r) => r.featured_order)).toEqual([1, 2]);
  });
});

describe('moveFeatured', () => {
  const list = ['a', 'b', 'c'];
  it('moves an item up and down', () => {
    expect(moveFeatured(list, 2, 'up')).toEqual(['a', 'c', 'b']);
    expect(moveFeatured(list, 0, 'down')).toEqual(['b', 'a', 'c']);
  });
  it('clamps at the edges', () => {
    expect(moveFeatured(list, 0, 'up')).toEqual(['a', 'b', 'c']);
    expect(moveFeatured(list, 2, 'down')).toEqual(['a', 'b', 'c']);
  });
});
