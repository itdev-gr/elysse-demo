import type { Country } from './types';
import { COUNTRIES } from '../../data/catalog-countries';

const KEY = 'elysee.country';
const VALID: ReadonlySet<Country> = new Set(COUNTRIES.map((c) => c.code));

export function readCountry(): Country | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && VALID.has(v as Country) ? (v as Country) : null;
  } catch {
    return null;
  }
}

export function writeCountry(c: Country): void {
  try { localStorage.setItem(KEY, c); }
  catch { /* private mode */ }
}
