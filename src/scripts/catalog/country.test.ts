import { describe, it, expect } from 'vitest';
import { isFreshStamp } from './country';

const HOUR = 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

describe('isFreshStamp', () => {
  it('honors a pick made within the last 24 hours', () => {
    expect(isFreshStamp(String(NOW - 23 * HOUR), NOW)).toBe(true);
    expect(isFreshStamp(String(NOW), NOW)).toBe(true);
  });

  it('expires a pick older than 24 hours', () => {
    expect(isFreshStamp(String(NOW - 25 * HOUR), NOW)).toBe(false);
  });

  it('treats a missing stamp as expired (pre-TTL visitors re-pick once)', () => {
    expect(isFreshStamp(null, NOW)).toBe(false);
    expect(isFreshStamp('', NOW)).toBe(false);
  });

  it('treats a garbage stamp as expired', () => {
    expect(isFreshStamp('not-a-number', NOW)).toBe(false);
  });
});
