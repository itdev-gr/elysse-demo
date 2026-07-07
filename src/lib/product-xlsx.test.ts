import { describe, it, expect } from 'vitest';
import { PRODUCT_COLUMNS, productToRow, rowToDraft, findDuplicateCodes, normalizeHeaderRow, HEADER_ROW, COLUMN_LABELS, type ProductRow } from './product-xlsx';
import type { Product } from '../types/product';
import type { ProductConfiguration } from './product-configurations';

const product: Product = {
  code: '330001610', category: 'A', category_name: 'Compression Fittings',
  sub_category: 'Epsilon Series PN 16 bar', family_code: '330', configuration: 'Adaptor Male',
  size: '16 x ⅜"', packing_bag: 25, packing_box: 750, moq: 0, box_size: 'L',
  description: 'Adaptor Male Epsilon Series PN16 - 16 x ⅜"',
  name_i18n: { el: 'legacy — ignored' }, description_i18n: null, sort_order: 1,
  is_active: true, is_hidden: true, created_at: '', updated_at: '',
};

const record: ProductConfiguration = {
  category_slug: 'compression-fittings', config_slug: 'epsilon-series-pn-16-bar-330',
  name: 'Adaptor Male Epsilon Series PN 16 bar', description: 'Config-level EN description',
  name_i18n: { el: 'Σύνδεσμος Αρσενικός', de: 'Übergangsnippel' },
  description_i18n: { de: 'Epsilon Series PN16 bar' },
};

describe('PRODUCT_COLUMNS', () => {
  it('includes the new configuration-level + hidden columns', () => {
    for (const c of ['display_name', 'display_description', 'is_hidden', 'name_el', 'description_de']) {
      expect(PRODUCT_COLUMNS).toContain(c);
    }
  });
});

describe('productToRow', () => {
  it('sources display name + translations from the configuration record, not the row', () => {
    const r = productToRow(product, ['A', 'B'], record);
    expect(r.display_name).toBe('Adaptor Male Epsilon Series PN 16 bar');
    expect(r.display_description).toBe('Config-level EN description');
    expect(r.name_el).toBe('Σύνδεσμος Αρσενικός');
    expect(r.name_de).toBe('Übergangsnippel');
    expect(r.description_de).toBe('Epsilon Series PN16 bar');
    expect(r.configuration).toBe('Adaptor Male'); // per-row English stays
    expect(r.is_hidden).toBe('TRUE');
    expect(r.groups).toBe('A,B');
  });
  it('leaves config columns blank when there is no record', () => {
    const r = productToRow(product, [], null);
    expect(r.display_name).toBe('');
    expect(r.name_el).toBe('');
    expect(r.is_hidden).toBe('TRUE');
  });
});

describe('rowToDraft', () => {
  const baseRow = (over: Partial<ProductRow> = {}): ProductRow => ({
    code: '330001610', category_name: 'Compression Fittings', sub_category: 'Epsilon Series PN 16 bar',
    family_code: '330', configuration: 'Adaptor Male', size: '16 x ⅜"', description: 'd',
    display_name: 'Adaptor Male Epsilon Series PN 16 bar', display_description: 'EN desc',
    name_el: 'Σύνδεσμος Αρσενικός', name_de: '', name_es: '', name_fr: '',
    description_el: '', description_de: 'Epsilon Series PN16 bar', description_es: '', description_fr: '',
    groups: 'A,B', is_active: 'TRUE', is_hidden: 'TRUE', sort_order: 1, ...over,
  });

  it('parses config translations and clears the legacy per-row i18n', () => {
    const { draft, translations, groups } = rowToDraft(baseRow());
    expect(draft?.name_i18n).toEqual({});
    expect(draft?.description_i18n).toEqual({});
    expect(draft?.is_hidden).toBe(true);
    expect(groups).toEqual(['A', 'B']);
    expect(translations).toEqual({
      name: 'Adaptor Male Epsilon Series PN 16 bar',
      description: 'EN desc',
      name_i18n: { el: 'Σύνδεσμος Αρσενικός' },
      description_i18n: { de: 'Epsilon Series PN16 bar' },
    });
  });

  it('returns translations=null when the sheet has no translation columns (old template guard)', () => {
    const { draft, translations } = rowToDraft({
      code: '330001610', category_name: 'Compression Fittings', configuration: 'Adaptor Male',
      description: 'd', is_active: 'TRUE',
    });
    expect(draft).not.toBeNull();
    expect(translations).toBeNull();
  });

  it('defaults is_hidden to false when the column is absent', () => {
    const { draft } = rowToDraft({ code: 'X', configuration: 'c', description: 'd' });
    expect(draft?.is_hidden).toBe(false);
  });
});

describe('image columns are retired (images are family-owned)', () => {
  it('never sets image_url on the draft — not for blank cells', () => {
    const { draft } = rowToDraft({ code: 'X', configuration: 'c', description: 'd', image_url: '' });
    expect(draft && 'image_url' in draft).toBe(false);
  });
  it('…and not even for a real URL in the cell', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/product-images/uploads/a.jpg';
    const { draft } = rowToDraft({ code: 'X', configuration: 'c', description: 'd', image_url: url });
    expect(draft && 'image_url' in draft).toBe(false);
  });
  it('an old export with an Image_url header still normalizes (column dropped)', () => {
    const normalized = normalizeHeaderRow({ 'Primary Code': 'X', Image_url: 'ignored.jpg' });
    expect(normalized.code).toBe('X');
    expect('image_url' in normalized).toBe(false);
  });
  it('exports carry no image column', () => {
    const row = productToRow(product, [], null);
    expect('image_url' in row).toBe(false);
    expect(HEADER_ROW).not.toContain('Image_url');
  });
});

describe('findDuplicateCodes', () => {
  it('reports codes that appear more than once (trimmed)', () => {
    expect(findDuplicateCodes(['A1', 'A2', 'A1', ' A2 ', 'A3'])).toEqual(['A1', 'A2']);
  });
  it('ignores blanks and returns [] when unique', () => {
    expect(findDuplicateCodes(['A1', '', '  ', 'A2'])).toEqual([]);
  });
});

describe('friendly headers (client template)', () => {
  it('HEADER_ROW exposes the friendly labels in column order', () => {
    expect(HEADER_ROW[0]).toBe('Category');
    expect(HEADER_ROW).toContain('Category_name_EL');
    expect(HEADER_ROW).toContain('Sub_Category_EL');
    expect(HEADER_ROW).toContain('Primary Code');
    expect(HEADER_ROW).toContain('Display_Name_EL');
    expect(HEADER_ROW).toContain('Extra_Details_EN');
  });

  it('normalizeHeaderRow maps friendly headers back to machine keys', () => {
    const norm = normalizeHeaderRow({
      'Primary Code': '330001610', 'Category_name_EN': 'Compression Fittings',
      'Category_name_EL': 'Εξαρτήματα Σύσφιξης', 'Sub_Category_EN': 'Epsilon', 'Sub_Category_EL': 'Σειρά Epsilon',
      'Configuration_EN': 'Adaptor Male', 'Configuration_EL': 'Αρσενικός', 'Extra_Details_EN': 'desc',
      'Country Groups': 'A,B', 'Is_Active': 'TRUE',
    });
    expect(norm.code).toBe('330001610');
    expect(norm.category_name).toBe('Compression Fittings');
    expect(norm.category_name_el).toBe('Εξαρτήματα Σύσφιξης');
    expect(norm.sub_category_el).toBe('Σειρά Epsilon');
    expect(norm.name_el).toBe('Αρσενικός');
    expect(norm.display_description).toBe('desc');
  });

  it('rowToDraft parses a friendly-headered row incl. category + series translations', () => {
    const { draft, categoryI18n, subCategoryI18n, translations } = rowToDraft({
      'Primary Code': '330001610', 'Category': 'A', 'Category_name_EN': 'Compression Fittings',
      'Category_name_EL': 'Εξαρτήματα Σύσφιξης', 'Sub_Category_EN': 'Epsilon Series PN 16 bar',
      'Sub_Category_EL': 'Σειρά Epsilon', 'Configuration_EN': 'Adaptor Male', 'Configuration_EL': 'Αρσενικός',
      'Full Description_EN': 'd', 'Country Groups': 'A,C', 'Is_Active': 'TRUE',
    });
    expect(draft?.code).toBe('330001610');
    expect(draft?.category_name).toBe('Compression Fittings');
    expect(draft?.sub_category).toBe('Epsilon Series PN 16 bar');
    expect(categoryI18n).toEqual({ el: 'Εξαρτήματα Σύσφιξης' });
    expect(subCategoryI18n).toEqual({ el: 'Σειρά Epsilon' });
    expect(translations?.name_i18n).toEqual({ el: 'Αρσενικός' });
  });

  it('productToRow emits category + series translations from the passed maps', () => {
    const r = productToRow(product, ['A'], null, { el: 'Εξαρτήματα Σύσφιξης' }, { el: 'Σειρά Epsilon' });
    expect(r.category_name_el).toBe('Εξαρτήματα Σύσφιξης');
    expect(r.sub_category_el).toBe('Σειρά Epsilon');
    expect(r.category_name_de).toBe('');
  });

  it('COLUMN_LABELS covers every machine column', () => {
    for (const c of PRODUCT_COLUMNS) expect(typeof COLUMN_LABELS[c]).toBe('string');
  });
});

describe('Display Name translation block', () => {
  it('groups Display_Name_EN + all four language columns together, after Configuration_EN', () => {
    const i = HEADER_ROW.indexOf('Display_Name_EN');
    expect(i).toBeGreaterThan(-1);
    expect(HEADER_ROW.slice(i, i + 5)).toEqual([
      'Display_Name_EN', 'Display_Name_EL', 'Display_Name_DE', 'Display_Name_ES', 'Display_Name_FR',
    ]);
    expect(HEADER_ROW[i - 1]).toBe('Configuration_EN');   // per-size base title precedes the block
    expect(HEADER_ROW[i + 5]).toBe('Extra_Details_EN');   // the description block follows it
    expect(HEADER_ROW).not.toContain('Configuration_EL'); // old translation label retired
  });

  it('imports the new Display_Name_* headers into the configuration name + name_i18n', () => {
    const { translations } = rowToDraft({
      'Primary Code': '330001610', 'Full Description_EN': 'd', 'Is_Active': 'TRUE',
      'Display_Name_EN': 'Adaptor Male Epsilon Series PN 16 bar',
      'Display_Name_EL': 'Αρσενικός', 'Display_Name_DE': 'Übergangsnippel',
      'Display_Name_ES': 'Adaptador macho', 'Display_Name_FR': 'Adaptateur mâle',
    });
    expect(translations?.name).toBe('Adaptor Male Epsilon Series PN 16 bar');
    expect(translations?.name_i18n).toEqual({
      el: 'Αρσενικός', de: 'Übergangsnippel', es: 'Adaptador macho', fr: 'Adaptateur mâle',
    });
  });

  it('still imports legacy display_name / Configuration_* headers (backward compatible)', () => {
    const { translations } = rowToDraft({
      'Primary Code': '330001610', 'Full Description_EN': 'd', 'Is_Active': 'TRUE',
      'display_name': 'Adaptor Male Epsilon Series PN 16 bar',
      'Configuration_EL': 'Αρσενικός', 'Configuration_DE': 'Übergangsnippel',
    });
    expect(translations?.name).toBe('Adaptor Male Epsilon Series PN 16 bar');
    expect(translations?.name_i18n).toEqual({ el: 'Αρσενικός', de: 'Übergangsnippel' });
  });
});
