import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { ProductFamily } from './families';

/** One row of product_family_extra_categories. */
export interface CrossListingRow {
  family_id: string;
  /** The EXTRA category the family also appears in (not its home). */
  category_slug: string;
}

/** family_id → extra category slugs, for the admin row badges + search. */
export function extraSlugsByFamily(listings: CrossListingRow[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const l of listings) (out[l.family_id] ??= []).push(l.category_slug);
  return out;
}

/** Admin save: which slugs to insert and which to delete. */
export function diffCrossListings(
  current: string[],
  next: string[],
): { toAdd: string[]; toRemove: string[] } {
  const cur = new Set(current);
  const nxt = new Set(next);
  return {
    toAdd: [...nxt].filter((s) => !cur.has(s)),
    toRemove: [...cur].filter((s) => !nxt.has(s)),
  };
}

/** The families cross-listed into one extra category. Self-listings (family
 *  already home there) are bad data — dropped defensively; the checker flags them. */
export function crossListedFamiliesFor(
  listings: CrossListingRow[],
  families: ProductFamily[],
  extraSlug: string,
): ProductFamily[] {
  const ids = new Set(listings.filter((l) => l.category_slug === extraSlug).map((l) => l.family_id));
  return families.filter((f) => ids.has(f.id) && f.category_slug !== extraSlug);
}

/**
 * Rebrand a home category's cards for display inside the extra category: keep
 * only the cross-listed codes, drop series hidden at home, and tag with the
 * extra slug so the client-side category filter keeps them — while the card's
 * link stays canonical via detailCategorySlug (the home slug).
 */
export function buildCrossListedCards(
  homeCards: CatalogProduct[],
  codes: Set<string>,
  hiddenHomeSeries: Set<string>,
  extraSlug: CategorySlug,
): CatalogProduct[] {
  return homeCards
    .filter((c) => c.code != null && codes.has(c.code))
    .filter((c) => !c.material || !hiddenHomeSeries.has(c.material))
    .map((c) => ({ ...c, categorySlug: extraSlug, detailCategorySlug: c.categorySlug }));
}
