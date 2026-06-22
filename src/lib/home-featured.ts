import { supabase } from './supabase';

// Powers the home "Latest from Elysée" section. The dashboard can feature news
// articles and/or blog posts (and order them); whatever is featured shows
// first, then the section tops up with the latest published items so it is
// never short, capped at HOME_MAX.

export type HomeItemType = 'news' | 'blog';

export interface HomeFeaturedItem {
  type: HomeItemType;
  slug: string;
  title: string;
  published_at: string | null;
  cover_image: string | null;
  featured_home: boolean;
  featured_rank: number | null;
}

/** Always show at least this many (topping up with latest when under-featured). */
export const HOME_BASELINE = 3;
/** Never show more than this many. */
export const HOME_MAX = 6;

const COLS = 'slug,title,published_at,cover_image,featured_home,featured_rank';

export function hrefFor(item: Pick<HomeFeaturedItem, 'type' | 'slug'>): string {
  return item.type === 'news'
    ? `/insights/news/${item.slug}/`
    : `/insights/blog/${item.slug}/`;
}

const dateValue = (iso: string | null): number => (iso ? Date.parse(iso) || 0 : 0);

function byDateDesc(a: HomeFeaturedItem, b: HomeFeaturedItem): number {
  return dateValue(b.published_at) - dateValue(a.published_at);
}

function byRank(a: HomeFeaturedItem, b: HomeFeaturedItem): number {
  const ra = a.featured_rank ?? Number.POSITIVE_INFINITY;
  const rb = b.featured_rank ?? Number.POSITIVE_INFINITY;
  return ra !== rb ? ra - rb : byDateDesc(a, b);
}

/**
 * Pure ordering: featured items first (by rank, then date), then the latest
 * non-featured items to reach the baseline, capped at `max`. Deduped by
 * type+slug so a featured row that also appears in the "recent" set counts once.
 */
export function mergeHomeItems(
  items: HomeFeaturedItem[],
  baseline = HOME_BASELINE,
  max = HOME_MAX,
): HomeFeaturedItem[] {
  const seen = new Set<string>();
  const uniq = items.filter((it) => {
    const key = `${it.type}:${it.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const featured = uniq.filter((i) => i.featured_home).sort(byRank);
  const rest = uniq.filter((i) => !i.featured_home).sort(byDateDesc);

  const target = Math.min(max, Math.max(baseline, featured.length));
  const result = featured.slice(0, max);
  for (const item of rest) {
    if (result.length >= target) break;
    result.push(item);
  }
  return result.slice(0, max);
}

const toItem = (type: HomeItemType) => (r: Record<string, unknown>): HomeFeaturedItem => ({
  type,
  slug: r.slug as string,
  title: r.title as string,
  published_at: (r.published_at as string | null) ?? null,
  cover_image: (r.cover_image as string | null) ?? null,
  featured_home: Boolean(r.featured_home),
  featured_rank: (r.featured_rank as number | null) ?? null,
});

/**
 * Fetch the curated home list from both tables. For each table we pull the
 * featured rows (which may be older than the latest) and the most recent rows,
 * then let `mergeHomeItems` order, top up and cap. Returns null on any error so
 * the caller can keep its fallback.
 */
export async function fetchHomeFeatured(): Promise<HomeFeaturedItem[] | null> {
  const featuredSel = (table: 'news' | 'posts') =>
    supabase.from(table).select(COLS)
      .eq('is_published', true).eq('featured_home', true)
      .order('featured_rank', { ascending: true, nullsFirst: false })
      .limit(HOME_MAX);
  const recentSel = (table: 'news' | 'posts') =>
    supabase.from(table).select(COLS)
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(HOME_MAX);

  const [nf, nr, pf, pr] = await Promise.all([
    featuredSel('news'), recentSel('news'), featuredSel('posts'), recentSel('posts'),
  ]);
  if (nf.error || nr.error || pf.error || pr.error) return null;

  const items: HomeFeaturedItem[] = [
    ...(nf.data ?? []).map(toItem('news')),
    ...(nr.data ?? []).map(toItem('news')),
    ...(pf.data ?? []).map(toItem('blog')),
    ...(pr.data ?? []).map(toItem('blog')),
  ];
  return mergeHomeItems(items);
}
