import { describe, expect, it } from 'vitest';
import { matchesFields } from './admin-search';

describe('matchesFields', () => {
  it('matches everything when the query is empty', () => {
    expect(matchesFields('', ['abc'])).toBe(true);
  });
  it('matches everything when the query is whitespace', () => {
    expect(matchesFields('   ', ['abc'])).toBe(true);
  });
  it('matches case-insensitive substrings', () => {
    expect(matchesFields('WELD', ['Machine Welding'])).toBe(true);
    expect(matchesFields('weld', ['MACHINE WELDING'])).toBe(true);
  });
  it('matches when any one field hits', () => {
    expect(matchesFields('sales', ['Engineer', 'Sales Department'])).toBe(true);
  });
  it('skips null and undefined fields without crashing', () => {
    expect(matchesFields('x', [null, undefined, 'ax'])).toBe(true);
    expect(matchesFields('x', [null, undefined])).toBe(false);
  });
  it('returns false when nothing matches', () => {
    expect(matchesFields('zzz', ['abc', 'def'])).toBe(false);
  });
  it('trims the query before matching', () => {
    expect(matchesFields('  sales  ', ['Sales'])).toBe(true);
  });
});
