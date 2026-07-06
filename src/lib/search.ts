import { configSlug } from './product-configurations';
import type { PageIndexEntry } from './search-pages';

/**
 * Client entry point for site-wide search: merges the `search_site` RPC
 * (products + categories + subcategories + Supabase content, ranked in SQL)
 * with the static-pages index (/search-index.json, ranked here). Product /
 * category / subcategory URLs are built client-side so slug logic stays in
 * one place (configSlug).
 */
export type SearchKind =
  | 'category' | 'subcategory' | 'product' | 'page'
  | 'news' | 'post' | 'exhibition' | 'media' | 'ebook'
  | 'certification' | 'catalogue' | 'job';

export interface SearchRpcRow {
  kind: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  image: string | null;
  category_slug: string | null;
  sub_category: string | null;
  family_code: string | null;
  rank: number;
}

export interface SearchResult {
  kind: SearchKind;
  title: string;
  subtitle?: string;
  url: string;
  image?: string | null;
  rank: number;
}

/** Display order of result groups on the /search page. */
export const KIND_ORDER: SearchKind[] = [
  'category', 'subcategory', 'product', 'page',
  'news', 'post', 'exhibition', 'media', 'ebook',
  'certification', 'catalogue', 'job',
];

/** English group labels — render with tFor(lang, label). */
export const KIND_LABELS: Record<SearchKind, string> = {
  category: 'Categories', subcategory: 'Series', product: 'Products', page: 'Pages',
  news: 'News', post: 'Blog', exhibition: 'Exhibitions', media: 'Media', ebook: 'eBooks',
  certification: 'Certifications', catalogue: 'Catalogues', job: 'Careers',
};

const KINDS = new Set<string>(KIND_ORDER);

export function resultUrl(r: SearchRpcRow): string {
  if (r.url) return r.url;
  if (r.kind === 'product' && r.category_slug && r.family_code) {
    return `/catalog/${r.category_slug}/${configSlug(r.sub_category, r.family_code)}`;
  }
  if (r.kind === 'subcategory' && r.category_slug && r.sub_category) {
    return `/catalog/${r.category_slug}/?materials=${encodeURIComponent(r.sub_category)}`;
  }
  if (r.kind === 'category' && r.category_slug) return `/catalog/${r.category_slug}/`;
  return '';
}

export function rpcRowToResult(r: SearchRpcRow): SearchResult | null {
  if (!KINDS.has(r.kind)) return null;
  const url = resultUrl(r);
  if (!url) return null;
  return {
    kind: r.kind as SearchKind,
    title: r.title,
    ...(r.subtitle ? { subtitle: r.subtitle } : {}),
    url,
    image: r.image,
    rank: r.rank,
  };
}

export function searchStaticPages(
  index: PageIndexEntry[], q: string, lang: string, limit = 8,
): SearchResult[] {
  const ql = q.trim().toLowerCase();
  if (ql.length < 2) return [];
  const out: SearchResult[] = [];
  for (const e of index) {
    const titles = [e.title, e.titleEl].filter((t): t is string => Boolean(t)).map((t) => t.toLowerCase());
    const texts = [e.text, e.textEl].filter((t): t is string => Boolean(t)).map((t) => t.toLowerCase());
    const rank = titles.some((t) => t.startsWith(ql)) ? 85
      : titles.some((t) => t.includes(ql)) ? 65
      : texts.some((t) => t.includes(ql)) ? 40
      : 0;
    if (!rank) continue;
    out.push({
      kind: 'page',
      title: lang === 'el' && e.titleEl ? e.titleEl : e.title,
      subtitle: e.section,
      url: e.path,
      rank,
    });
  }
  return out.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title)).slice(0, limit);
}

export function groupResults(
  results: SearchResult[],
): { kind: SearchKind; label: string; items: SearchResult[] }[] {
  return KIND_ORDER
    .map((kind) => ({ kind, label: KIND_LABELS[kind], items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length > 0);
}

// --- live data plumbing (browser only) --------------------------------------

let pagesIndexPromise: Promise<PageIndexEntry[]> | null = null;
function loadPagesIndex(): Promise<PageIndexEntry[]> {
  if (!pagesIndexPromise) {
    pagesIndexPromise = fetch('/search-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`search-index.json ${r.status}`);
        return r.json() as Promise<PageIndexEntry[]>;
      })
      .catch((err) => {
        pagesIndexPromise = null; // allow a retry on the next keystroke
        throw err;
      });
  }
  return pagesIndexPromise;
}

/**
 * Search everything. Resilient: if one source fails the other's results are
 * still returned; only throws when both fail.
 */
export async function searchSite(q: string, lang: string, perType = 8): Promise<SearchResult[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const rpcPromise = import('./supabase').then(({ supabase }) =>
    supabase.rpc('search_site', { p_q: query, p_lang: lang, p_limit: perType }),
  );
  const [rpcOut, staticOut] = await Promise.allSettled([rpcPromise, loadPagesIndex()]);

  const results: SearchResult[] = [];
  let rpcError: unknown = null;
  if (rpcOut.status === 'fulfilled' && !rpcOut.value.error) {
    for (const r of (rpcOut.value.data ?? []) as SearchRpcRow[]) {
      const mapped = rpcRowToResult(r);
      if (mapped) results.push(mapped);
    }
  } else {
    rpcError = rpcOut.status === 'rejected' ? rpcOut.reason : rpcOut.value.error;
  }
  if (staticOut.status === 'fulfilled') {
    results.push(...searchStaticPages(staticOut.value, query, lang, perType));
  } else if (rpcError) {
    throw rpcError; // both sources down
  }
  return results.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title));
}
