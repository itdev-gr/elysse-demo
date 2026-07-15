import { describe, it, expect } from 'vitest';
import { COUNTRIES, REGIONS } from './catalog-countries';

const FEATURED = ['cy', 'at', 'eg', 'lb', 'gr'];
const REGION_IDS = new Set(REGIONS.map((r) => r.id));

describe('COUNTRIES (full ISO 3166-1 set)', () => {
  it('has all 249 officially-assigned codes', () => {
    expect(COUNTRIES.length).toBe(249);
  });

  it('codes are unique, lowercase, two-letter alpha', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c).toMatch(/^[a-z]{2}$/);
  });

  it('every entry has a non-empty label and a valid region', () => {
    for (const c of COUNTRIES) {
      expect(c.label.trim().length).toBeGreaterThan(0);
      expect(REGION_IDS.has(c.region)).toBe(true);
    }
  });

  it('keeps the featured codes present', () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const f of FEATURED) expect(codes.has(f)).toBe(true);
  });
});
