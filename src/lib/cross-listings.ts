import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { ProductFamily } from './families';
import { supabase } from './supabase';
import { getFamilies } from './families';
import { getCategories, getSubcategories } from './categories';
import { fetchCatalogConfigurations } from './products';

/** One row of product_family_extra_categories. */
export interface CrossListingRow {
  family_id: string;
  /** The destination category the family also appears in (not its home). */
  category_slug: string;
  /** The destination series (a managed subcategory of category_slug). */
  sub_category: string;
}

/** A family's placement into one destination category, under one series. */
export interface Placement {
  category_slug: string;
  sub_category: string;
}

/** family_id → its placements, for the admin row badges + modal + search. */
export function placementsByFamily(listings: CrossListingRow[]): Record<string, Placement[]> {
  const out: Record<string, Placement[]> = {};
  for (const l of listings) {
    (out[l.family_id] ??= []).push({ category_slug: l.category_slug, sub_category: l.sub_category });
  }
  return out;
}

/**
 * Admin save diff. `current`/`next` map category_slug → chosen series (an empty
 * string or a missing key means "not shown"). Returns the placements to upsert
 * (added or series-changed) and the category slugs to delete (cleared).
 */
export function diffPlacements(
  current: Record<string, string>,
  next: Record<string, string>,
): { upserts: Placement[]; deletes: string[] } {
  const upserts: Placement[] = [];
  const deletes: string[] = [];
  const cats = new Set([...Object.keys(current), ...Object.keys(next)]);
  for (const category_slug of cats) {
    const was = current[category_slug] ?? '';
    const now = next[category_slug] ?? '';
    if (now === was) continue;
    if (now === '') deletes.push(category_slug);
    else upserts.push({ category_slug, sub_category: now });
  }
  return { upserts, deletes };
}

/** The families cross-listed into one destination category. Self-listings
 *  (family already home there) are bad data — dropped defensively. */
export function crossListedFamiliesFor(
  listings: CrossListingRow[],
  families: ProductFamily[],
  extraSlug: string,
): ProductFamily[] {
  const ids = new Set(listings.filter((l) => l.category_slug === extraSlug).map((l) => l.family_id));
  return families.filter((f) => ids.has(f.id) && f.category_slug !== extraSlug);
}

/**
 * Rebrand a home category's cards for display inside the destination category:
 * keep only the borrowed codes (present in seriesByCode), drop cards whose HOME
 * series is hidden, then relabel each surviving card's series (`material`) to
 * its chosen destination series and tag it with the destination slug — while
 * the card's link stays canonical via detailCategorySlug (the home slug).
 */
export function buildCrossListedCards(
  homeCards: CatalogProduct[],
  seriesByCode: Map<string, string>,
  hiddenHomeSeries: Set<string>,
  extraSlug: CategorySlug,
): CatalogProduct[] {
  return homeCards
    .filter((c) => c.code != null && seriesByCode.has(c.code))
    .filter((c) => !c.material || !hiddenHomeSeries.has(c.material))
    .map((c) => ({
      ...c,
      categorySlug: extraSlug,
      detailCategorySlug: c.categorySlug,
      material: seriesByCode.get(c.code as string),
    }));
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
