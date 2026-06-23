import { describe, it, expect } from 'vitest';
import { mergeFamilyCodes } from './families';

describe('mergeFamilyCodes', () => {
  it('unions product-derived and managed codes', () => {
    expect(mergeFamilyCodes(['330', '331'], ['330T', '332'])).toEqual(['330', '330T', '331', '332']);
  });
  it('de-duplicates codes present in both lists', () => {
    expect(mergeFamilyCodes(['330', '330A'], ['330', '330B'])).toEqual(['330', '330A', '330B']);
  });
  it('drops null and empty entries', () => {
    expect(mergeFamilyCodes(['330', null, ''], [null, '331'])).toEqual(['330', '331']);
  });
  it('returns [] when nothing is supplied', () => {
    expect(mergeFamilyCodes([], [])).toEqual([]);
  });
  it('sorts lexicographically so letter variants follow their number', () => {
    expect(mergeFamilyCodes(['332B', '330', '331A'], ['330A'])).toEqual(['330', '330A', '331A', '332B']);
  });
});
