import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { ProductFamily } from './families';
import { supabase } from './supabase';
import { getFamilies } from './families';
import { getCategories, getSubcategories } from './categories';
import { fetchCatalogConfigurations } from './products';

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

/**
 * The borrowed cards to append to one category's catalog page, plus the
 * series-name translations their sidebar entries need (from each family's
 * HOME category overlay). Empty result when the category has no listings.
 * Errors are logged and degrade to "no borrowed cards" — a bad listing must
 * never 500 the category page.
 */
export async function fetchCrossListedCards(extraSlug: CategorySlug): Promise<{
  cards: CatalogProduct[];
  seriesI18n: Record<string, Record<string, string>>;
}> {
  const empty = { cards: [], seriesI18n: {} };
  const { data, error } = await supabase
    .from('product_family_extra_categories')
    .select('family_id, category_slug')
    .eq('category_slug', extraSlug);
  if (error) { console.error('fetchCrossListedCards:', error.message); return empty; }
  const listings = (data ?? []) as CrossListingRow[];
  if (listings.length === 0) return empty;

  const [families, categories, subcats] = await Promise.all([
    getFamilies({ includeHidden: true }),   // mirror the home grid, which doesn't gate on family is_active
    getCategories(),                         // active only — a hidden home category lends nothing
    getSubcategories(),                      // includes hidden rows; they filter the borrowed cards
  ]);
  const fams = crossListedFamiliesFor(listings, families, extraSlug);
  // Home category slug → the family codes borrowed from it. getFamilies is
  // ordered (category_slug, sort_order), so iteration order is deterministic.
  const byHome = new Map<string, Set<string>>();
  for (const f of fams) {
    let set = byHome.get(f.category_slug);
    if (!set) { set = new Set(); byHome.set(f.category_slug, set); }
    set.add(f.code);
  }

  const cards: CatalogProduct[] = [];
  const seriesI18n: Record<string, Record<string, string>> = {};
  for (const [homeSlug, codes] of byHome) {
    const home = categories.find((c) => c.slug === homeSlug);
    if (!home?.product_category_name) continue;   // hidden or unlinked home category
    const overlay = subcats.filter((s) => s.category_slug === homeSlug);
    const hidden = new Set(overlay.filter((s) => !s.is_active).map((s) => s.name));
    let homeCards: CatalogProduct[] = [];
    try {
      homeCards = await fetchCatalogConfigurations(home.product_category_name, homeSlug as CategorySlug);
    } catch (err) {
      console.error(`fetchCrossListedCards: home "${homeSlug}" fetch failed, skipping`, err);
      continue;
    }
    const borrowed = buildCrossListedCards(homeCards, codes, hidden, extraSlug);
    cards.push(...borrowed);
    for (const o of overlay) {
      if (o.name_i18n && Object.keys(o.name_i18n).length && borrowed.some((c) => c.material === o.name)) {
        seriesI18n[o.name] = o.name_i18n;
      }
    }
  }
  return { cards, seriesI18n };
}
