import { COUNTRIES } from '../../data/catalog-countries';
import type { Region } from '../../data/catalog-countries';

/** Per-region image overrides. Each entry's `regions` map provides one image
 *  per region (or a subset). At module load, we expand each region to its
 *  member countries so per-country `<img>` swaps work.
 *
 *  Source mapping:
 *    source country-1 → 'europe'
 *    source country-2 → 'middle-east-africa'
 *    (source had no country-3 entries — asia-pacific / americas use default images)
 */
const SOURCE: Record<string, Partial<Record<Region, string>>> = {
  'coupling-epsilon-pn16': {
    europe: '/images/products/coupling-epsilon-pn16-elysee.png',
    'middle-east-africa': '/images/products/coupling-epsilon-pn16-rohrsysteme.png',
  },
  'coupling-transition': {
    europe: '/images/products/coupling-transition-elysee.png',
    'middle-east-africa': '/images/products/coupling-transition-rohrsysteme.png',
  },
};

/** Expanded country-keyed lookup, computed at module load. */
export const perCountryImages: Record<string, Partial<Record<string, string>>> =
  Object.fromEntries(
    Object.entries(SOURCE).map(([slug, regions]) => [
      slug,
      Object.fromEntries(
        COUNTRIES.flatMap((c) =>
          regions[c.region] ? [[c.code, regions[c.region]!]] : []
        )
      ),
    ])
  );

export function imagesForProduct(slug: string): Partial<Record<string, string>> | undefined {
  return perCountryImages[slug];
}
