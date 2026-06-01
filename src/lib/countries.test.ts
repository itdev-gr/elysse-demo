import { describe, expect, it } from 'vitest';
import { filterCountries } from './countries';
import type { Country } from '../types/country';

const base = (overrides: Partial<Country>): Country => ({
  code: 'xx',
  country: 'Xland',
  label: 'Xland',
  kind: 'partner',
  lat: 0,
  lng: 0,
  nudge_x: null,
  nudge_y: null,
  address: 'addr',
  phone: 'phone',
  email: 'e@x.com',
  website: null,
  note: null,
  prefilled_message: 'msg',
  is_active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
  ...overrides,
});

const rows: Country[] = [
  base({ code: 'cy', country: 'Cyprus', label: 'Cyprus · Ergates (HQ)' }),
  base({ code: 'de', country: 'Germany', label: 'Germany' }),
  base({ code: 'gr', country: 'Greece', label: 'Greece' }),
  base({ code: 'ae', country: 'United Arab Emirates', label: 'UAE' }),
];

describe('filterCountries', () => {
  it('returns all rows when query is empty', () => {
    expect(filterCountries(rows, '')).toEqual(rows);
  });
  it('returns all rows when query is whitespace', () => {
    expect(filterCountries(rows, '   ')).toEqual(rows);
  });
  it('matches by country (case-insensitive substring)', () => {
    expect(filterCountries(rows, 'ger').map((r) => r.code)).toEqual(['de']);
  });
  it('matches by code', () => {
    expect(filterCountries(rows, 'cy').map((r) => r.code)).toEqual(['cy']);
  });
  it('matches by label', () => {
    expect(filterCountries(rows, 'uae').map((r) => r.code)).toEqual(['ae']);
  });
  it('matches by label substring (Ergates)', () => {
    expect(filterCountries(rows, 'ergates').map((r) => r.code)).toEqual(['cy']);
  });
  it('returns empty when no match', () => {
    expect(filterCountries(rows, 'zzz')).toEqual([]);
  });
});
