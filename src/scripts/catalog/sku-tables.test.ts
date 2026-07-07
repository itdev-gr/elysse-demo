import { describe, it, expect } from 'vitest';
import { skuRowVisibleFor } from './sku-tables';

describe('skuRowVisibleFor', () => {
  it('rows without a country list are visible everywhere (legacy/static tables)', () => {
    expect(skuRowVisibleFor(undefined, 'de')).toBe(true);
    expect(skuRowVisibleFor(undefined, null)).toBe(true);
  });
  it('with no country picked, every row is visible (direct landing)', () => {
    expect(skuRowVisibleFor(['de', 'at'], null)).toBe(true);
  });
  it('a country-listed row shows only for its countries', () => {
    expect(skuRowVisibleFor(['de', 'at'], 'de')).toBe(true);
    expect(skuRowVisibleFor(['de', 'at'], 'gr')).toBe(false);
  });
  it('an empty country list means the size is sold nowhere — hidden once a country is picked', () => {
    expect(skuRowVisibleFor([], 'de')).toBe(false);
    expect(skuRowVisibleFor([], null)).toBe(true);
  });
});
