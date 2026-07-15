import type { Country } from './types';
import { COUNTRIES } from '../../data/catalog-countries';

const KEY = 'elysee.country';
const STAMP_KEY = 'elysee.country.at';
const TTL_MS = 24 * 60 * 60 * 1000;
const VALID: ReadonlySet<Country> = new Set(COUNTRIES.map((c) => c.code));

/** A stored pick is honored only for 24h; a missing/garbage stamp counts as expired. */
export function isFreshStamp(stamp: string | null, now: number): boolean {
  const at = Number(stamp);
  return stamp !== null && stamp !== '' && Number.isFinite(at) && now - at <= TTL_MS;
}

export function readCountry(): Country | null {
  try {
    const v = localStorage.getItem(KEY);
    if (!v || !VALID.has(v as Country)) return null;
    if (!isFreshStamp(localStorage.getItem(STAMP_KEY), Date.now())) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(STAMP_KEY);
      return null;
    }
    return v as Country;
  } catch {
    return null;
  }
}

export function writeCountry(c: Country): void {
  try {
    localStorage.setItem(KEY, c);
    localStorage.setItem(STAMP_KEY, String(Date.now()));
  } catch { /* private mode */ }
}
