import { describe, expect, it } from 'vitest';
import { buildCatalogueTree, validateCataloguePdf } from './catalogues';
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
