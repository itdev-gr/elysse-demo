import { describe, expect, it } from 'vitest';
import { buildCatalogueTree, validateCataloguePdf, pickCataloguePdf, filterCatalogueTree } from './catalogues';
import type { Catalogue } from '../types/catalogue';

const row = (over: Partial<Catalogue>): Catalogue => ({
  id: 'x', parent_id: null, name: 'A', description: null, pdf_url: null,
  sort_order: 0, is_active: true, created_at: '', updated_at: '', ...over,
});

describe('buildCatalogueTree', () => {
  it('nests subcategories under their category, both sorted', () => {
    const tree = buildCatalogueTree([
      row({ id: 'c2', name: 'Second', sort_order: 2 }),
      row({ id: 's2', parent_id: 'c1', name: 'Sub B', sort_order: 2 }),
      row({ id: 'c1', name: 'First', sort_order: 1 }),
      row({ id: 's1', parent_id: 'c1', name: 'Sub A', sort_order: 1 }),
    ]);
    expect(tree.map((c) => c.name)).toEqual(['First', 'Second']);
    expect(tree[0].children.map((s) => s.name)).toEqual(['Sub A', 'Sub B']);
    expect(tree[1].children).toEqual([]);
  });

  it('ties on sort_order break by name', () => {
    const tree = buildCatalogueTree([
      row({ id: 'b', name: 'B', sort_order: 1 }),
      row({ id: 'a', name: 'A', sort_order: 1 }),
    ]);
    expect(tree.map((c) => c.name)).toEqual(['A', 'B']);
  });

  it('drops subcategories whose parent is missing', () => {
    const tree = buildCatalogueTree([row({ id: 's', parent_id: 'ghost', name: 'Orphan' })]);
    expect(tree).toEqual([]);
  });

  it('does not mutate the input', () => {
    const input = [row({ id: 'c2', sort_order: 2 }), row({ id: 'c1', sort_order: 1 })];
    buildCatalogueTree(input);
    expect(input[0].id).toBe('c2');
  });
});

describe('validateCataloguePdf', () => {
  it('accepts a small PDF', () => {
    expect(validateCataloguePdf({ type: 'application/pdf', size: 1024 })).toBeNull();
  });
  it('rejects non-PDF files', () => {
    expect(validateCataloguePdf({ type: 'image/png', size: 1024 })).toMatch(/PDF/);
  });
  it('rejects PDFs over 25 MB', () => {
    expect(validateCataloguePdf({ type: 'application/pdf', size: 26 * 1024 * 1024 })).toMatch(/25 MB/);
  });
});

describe('pickCataloguePdf', () => {
  const make = (over: Parameters<typeof pickCataloguePdf>[0]) => over;

  it('returns Black when only Black matches', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: null,
      groups_black: ['A', 'B'], groups_blue: null,
    }), 'A')).toEqual({ url: 'BLACK.pdf', slot: 'black' });
  });

  it('returns Blue when only Blue matches', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A'], groups_blue: ['C', 'D'],
    }), 'C')).toEqual({ url: 'BLUE.pdf', slot: 'blue' });
  });

  it('returns Black when both slots match (Black wins)', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A', 'B'], groups_blue: ['B', 'C'],
    }), 'B')).toEqual({ url: 'BLACK.pdf', slot: 'black' });
  });

  it('returns null when the group matches neither slot', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A'], groups_blue: ['C'],
    }), 'E')).toBeNull();
  });

  it('returns null when the matching slot has no PDF set', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: null, pdf_url_blue: null,
      groups_black: ['A'], groups_blue: ['A'],
    }), 'A')).toBeNull();
  });

  it('returns null when both slots are empty', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: null, pdf_url_blue: null,
      groups_black: null, groups_blue: null,
    }), 'A')).toBeNull();
  });

  it('returns null when groupCode is null', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: null,
      groups_black: ['A'], groups_blue: null,
    }), null)).toBeNull();
  });
});

describe('filterCatalogueTree', () => {
  const tree = () =>
    buildCatalogueTree([
      row({ id: 'c1', name: 'Compression Fittings', sort_order: 1 }),
      row({ id: 's1', parent_id: 'c1', name: 'Zeta Series', sort_order: 1 }),
      row({ id: 's2', parent_id: 'c1', name: 'Epsilon Series', description: 'PN 16', sort_order: 2 }),
      row({ id: 'c2', name: 'Valves', sort_order: 2 }),
      row({ id: 's3', parent_id: 'c2', name: 'Ball Valves', sort_order: 1 }),
    ]);

  it('returns the whole tree for an empty query', () => {
    expect(filterCatalogueTree(tree(), '')).toEqual(tree());
  });
  it('a matching category keeps ALL its children', () => {
    const out = filterCatalogueTree(tree(), 'compression');
    expect(out.map((c) => c.id)).toEqual(['c1']);
    expect(out[0].children.map((s) => s.id)).toEqual(['s1', 's2']);
  });
  it('a matching subcategory keeps its parent, siblings drop', () => {
    const out = filterCatalogueTree(tree(), 'zeta');
    expect(out.map((c) => c.id)).toEqual(['c1']);
    expect(out[0].children.map((s) => s.id)).toEqual(['s1']);
  });
  it('matches on description too', () => {
    const out = filterCatalogueTree(tree(), 'pn 16');
    expect(out[0].children.map((s) => s.id)).toEqual(['s2']);
  });
  it('categories with no match drop out entirely', () => {
    expect(filterCatalogueTree(tree(), 'ball').map((c) => c.id)).toEqual(['c2']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterCatalogueTree(tree(), 'zzz')).toEqual([]);
  });
  it('does not mutate the input tree', () => {
    const input = tree();
    filterCatalogueTree(input, 'zeta');
    expect(input[0].children.length).toBe(2);
  });
});
