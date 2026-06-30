import { supabase } from '../../lib/supabase';
import type { Country } from './types';

let cache: Map<Country, string> | null = null;

/** Country code → group code (A–E). Cached in module scope; refreshed on a
 *  full page reload (which already happens when the visitor switches country). */
export async function loadCountryGroups(): Promise<Map<Country, string>> {
  if (cache) return cache;
  const { data } = await supabase
    .from('group_countries')
    .select('country_code, group_code');
  const next = new Map<Country, string>();
  for (const r of (data ?? []) as { country_code: string | null; group_code: string | null }[]) {
    if (r.country_code && r.group_code) next.set(r.country_code as Country, r.group_code);
  }
  cache = next;
  return cache;
}

export function groupForCountry(country: Country | null): Promise<string | null> {
  if (!country) return Promise.resolve(null);
  return loadCountryGroups().then((m) => m.get(country) ?? null);
}

/** Test-only — drop the in-memory cache. */
export function _resetCountryGroupCache(): void { cache = null; }
