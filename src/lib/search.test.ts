import { describe, it, expect } from 'vitest';
import {
  resultUrl, rpcRowToResult, searchStaticPages, groupResults,
  KIND_ORDER, KIND_LABELS, type SearchRpcRow,
} from './search';
import type { PageIndexEntry } from './search-pages';

const row = (over: Partial<SearchRpcRow>): SearchRpcRow => ({
  kind: 'product', title: 'T', subtitle: null, url: null, image: null,
  category_slug: null, sub_category: null, family_code: null, rank: 50, ...over,
});

describe('resultUrl', () => {
  it('builds product config URLs with configSlug parity (incl. Greek series names)', () => {
    expect(resultUrl(row({
      kind: 'product', category_slug: 'compression-fittings',
      sub_category: 'έ - Epsilon Series PN 16 bar', family_code: '330',
    }))).toBe('/catalog/compression-fittings/epsilon-series-pn-16-bar-330');
  });
  it('builds subcategory deep links via the materials filter param', () => {
    expect(resultUrl(row({
      kind: 'subcategory', category_slug: 'compression-fittings',
      sub_category: 'έ - Epsilon Series PN 16 bar',
    }))).toBe(`/catalog/compression-fittings/?materials=${encodeURIComponent('έ - Epsilon Series PN 16 bar')}`);
  });
  it('builds category URLs from the slug', () => {
    expect(resultUrl(row({ kind: 'category', category_slug: 'micro-irrigation' })))
      .toBe('/catalog/micro-irrigation/');
  });
  it('passes through server-built URLs untouched', () => {
    expect(resultUrl(row({ kind: 'post', url: '/insights/blog/foo/' }))).toBe('/insights/blog/foo/');
  });
});

describe('rpcRowToResult', () => {
  it('maps a valid row and nullifies empty subtitles', () => {
    const r = rpcRowToResult(row({ kind: 'category', category_slug: 'x', subtitle: null }));
    expect(r).toEqual({ kind: 'category', title: 'T', url: '/catalog/x/', image: null, rank: 50 });
  });
  it('drops rows with unknown kinds', () => {
    expect(rpcRowToResult(row({ kind: 'bogus' }))).toBeNull();
  });
  it('drops product rows missing URL ingredients', () => {
    expect(rpcRowToResult(row({ kind: 'product', category_slug: null }))).toBeNull();
  });
});

describe('searchStaticPages', () => {
  const index: PageIndexEntry[] = [
    { path: '/about-us/', title: 'Corporate Profile', section: 'About Us', text: 'Who we are\npiping systems' },
    { path: '/about-us/history/', title: 'History', titleEl: 'Ιστορία', section: 'About Us', text: 'From 1968', textEl: 'Από το 1968' },
    { path: '/contact/careers/', title: 'Careers', section: 'Contact', text: 'join the team' },
  ];
  it('matches by title prefix above body text', () => {
    const r = searchStaticPages(index, 'corp', 'en');
    expect(r[0]!.url).toBe('/about-us/');
    expect(r[0]!.rank).toBe(85);
  });
  it('matches body text with a lower rank', () => {
    const r = searchStaticPages(index, 'piping', 'en');
    expect(r).toHaveLength(1);
    expect(r[0]!.rank).toBe(40);
  });
  it('matches Greek queries against titleEl/textEl and localizes the title', () => {
    const r = searchStaticPages(index, 'Ιστορ', 'el');
    expect(r).toHaveLength(1);
    expect(r[0]!.title).toBe('Ιστορία');
  });
  it('still matches English text when lang=el (bilingual users)', () => {
    expect(searchStaticPages(index, 'careers', 'el')).toHaveLength(1);
  });
  it('returns [] under 2 characters and respects the limit', () => {
    expect(searchStaticPages(index, 'a', 'en')).toEqual([]);
    expect(searchStaticPages(index, 'e', 'en')).toEqual([]);
    expect(searchStaticPages(index, 'the', 'en', 1)).toHaveLength(1);
  });
});

describe('groupResults', () => {
  it('groups by kind in KIND_ORDER with labels, preserving item order', () => {
    const mk = (kind: string, title: string, rank: number) =>
      ({ kind: kind as never, title, url: '/x/', rank });
    const groups = groupResults([mk('page', 'P1', 80), mk('product', 'A', 90), mk('page', 'P2', 40), mk('category', 'C', 95)]);
    expect(groups.map((g) => g.kind)).toEqual(['category', 'product', 'page']);
    expect(groups[2]!.items.map((i) => i.title)).toEqual(['P1', 'P2']);
    expect(groups[0]!.label).toBe(KIND_LABELS.category);
  });
  it('KIND_ORDER covers every label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...KIND_ORDER].sort());
  });
});
