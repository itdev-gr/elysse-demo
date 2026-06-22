import { describe, expect, it } from 'vitest';
import { mergeHomeItems, hrefFor, HOME_MAX, type HomeFeaturedItem } from './home-featured';

function item(p: Partial<HomeFeaturedItem> & { slug: string }): HomeFeaturedItem {
  return {
    type: 'news',
    title: p.slug,
    published_at: '2026-01-01T00:00:00Z',
    cover_image: null,
    featured_home: false,
    featured_rank: null,
    ...p,
  };
}

describe('hrefFor', () => {
  it('routes news and blog to their sections', () => {
    expect(hrefFor({ type: 'news', slug: 'a' })).toBe('/insights/news/a/');
    expect(hrefFor({ type: 'blog', slug: 'b' })).toBe('/insights/blog/b/');
  });
});

describe('mergeHomeItems', () => {
  it('shows featured first, ordered by rank', () => {
    const out = mergeHomeItems([
      item({ slug: 'r', featured_home: true, featured_rank: 3 }),
      item({ slug: 'p', featured_home: true, featured_rank: 1 }),
      item({ slug: 'q', featured_home: true, featured_rank: 2 }),
    ]);
    expect(out.map((i) => i.slug)).toEqual(['p', 'q', 'r']);
  });

  it('breaks rank ties by most recent date', () => {
    const out = mergeHomeItems([
      item({ slug: 'old', featured_home: true, featured_rank: 1, published_at: '2025-01-01T00:00:00Z' }),
      item({ slug: 'new', featured_home: true, featured_rank: 1, published_at: '2026-06-01T00:00:00Z' }),
    ]);
    expect(out.map((i) => i.slug)).toEqual(['new', 'old']);
  });

  it('tops up to the baseline with the latest non-featured items', () => {
    const out = mergeHomeItems([
      item({ slug: 'feat', featured_home: true, featured_rank: 1 }),
      item({ slug: 'mid', published_at: '2026-03-01T00:00:00Z' }),
      item({ slug: 'newest', published_at: '2026-06-01T00:00:00Z' }),
      item({ slug: 'oldest', published_at: '2025-01-01T00:00:00Z' }),
    ]);
    // featured first, then 2 latest non-featured to reach baseline of 3
    expect(out.map((i) => i.slug)).toEqual(['feat', 'newest', 'mid']);
  });

  it('falls back to the latest items when nothing is featured', () => {
    const out = mergeHomeItems([
      item({ slug: 'a', published_at: '2026-01-01T00:00:00Z' }),
      item({ slug: 'b', published_at: '2026-05-01T00:00:00Z' }),
      item({ slug: 'c', published_at: '2026-03-01T00:00:00Z' }),
      item({ slug: 'd', published_at: '2026-02-01T00:00:00Z' }),
    ]);
    expect(out.map((i) => i.slug)).toEqual(['b', 'c', 'd']); // top 3 by date
  });

  it('shows all featured beyond the baseline, capped at HOME_MAX', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      item({ slug: `f${i}`, featured_home: true, featured_rank: i + 1 }),
    );
    const out = mergeHomeItems(many);
    expect(out).toHaveLength(HOME_MAX);
    expect(out.map((i) => i.slug)).toEqual(['f0', 'f1', 'f2', 'f3', 'f4', 'f5']);
  });

  it('does not top up past the featured count when featured >= baseline', () => {
    const out = mergeHomeItems([
      item({ slug: 'f1', featured_home: true, featured_rank: 1 }),
      item({ slug: 'f2', featured_home: true, featured_rank: 2 }),
      item({ slug: 'f3', featured_home: true, featured_rank: 3 }),
      item({ slug: 'latest', published_at: '2030-01-01T00:00:00Z' }),
    ]);
    expect(out.map((i) => i.slug)).toEqual(['f1', 'f2', 'f3']);
  });

  it('dedupes the same item appearing in both featured and recent sets', () => {
    const out = mergeHomeItems([
      item({ slug: 'x', featured_home: true, featured_rank: 1 }),
      item({ slug: 'x', featured_home: true, featured_rank: 1 }), // duplicate (recent query)
      item({ slug: 'y' }),
    ]);
    expect(out.filter((i) => i.slug === 'x')).toHaveLength(1);
  });

  it('keeps a news and a blog item with the same slug distinct', () => {
    const out = mergeHomeItems([
      item({ slug: 'same', type: 'news', featured_home: true, featured_rank: 1 }),
      item({ slug: 'same', type: 'blog', featured_home: true, featured_rank: 2 }),
    ]);
    expect(out).toHaveLength(2);
    expect(out.map((i) => i.type)).toEqual(['news', 'blog']);
  });
});
