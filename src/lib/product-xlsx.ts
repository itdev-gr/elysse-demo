import type { Product, ProductDraft } from '../types/product';
import type { ProductConfiguration, ConfigTranslations } from './product-configurations';

/** Languages that can be translated (English lives in the plain columns). */
export const I18N_LANGS = ['el', 'de', 'es', 'fr'] as const;

/**
 * The full column set for the bulk template / import / export, in the order the
 * sheet presents them. Machine keys here are the canonical names the parser
 * uses; the human-friendly header text actually written to the sheet comes from
 * COLUMN_LABELS, and the importer accepts BOTH (see normalizeHeaderRow).
 *
 * Per-row (size) product fields: identity, category fields, the per-size English
 * `configuration` name + `description`, packaging, country visibility (groups
 * A–E), image, `is_active`, `is_hidden`, `sort_order`.
 *
 * Configuration-level fields (shared by every size of a configuration, stored in
 * product_configurations): `display_name` + `display_description` are the English
 * overrides shown on the product page, `name_*` / `description_*` their per-language
 * translations.
 *
 * Category / sub-category translation fields (`category_name_*`, `sub_category_*`):
 * these describe the CATEGORY and SERIES, not the size — they repeat across every
 * row of a category/series and are written back to product_categories /
 * product_subcategories (name_i18n) on import.
 */
export const PRODUCT_COLUMNS = [
  'category',
  'category_name',
  'category_name_el', 'category_name_de', 'category_name_es', 'category_name_fr',
  'sub_category',
  'sub_category_el', 'sub_category_de', 'sub_category_es', 'sub_category_fr',
  'code',
  'family_code',
  'configuration',
  'name_el', 'name_de', 'name_es', 'name_fr',
  'display_name',
  'display_description',
  'description_el', 'description_de', 'description_es', 'description_fr',
  'size',
  'description',
  'packing_bag', 'packing_box', 'moq', 'box_size',
  'groups',
  'image_url',
  'is_active',
  'is_hidden',
  'sort_order',
] as const;

/** Human-friendly header text written to the sheet, keyed by machine column. */
export const COLUMN_LABELS: Record<string, string> = {
  category: 'Category',
  category_name: 'Category_name_EN',
  category_name_el: 'Category_name_EL',
  category_name_de: 'Category_name_DE',
  category_name_es: 'Category_name_ES',
  category_name_fr: 'Category_name_FR',
  sub_category: 'Sub_Category_EN',
  sub_category_el: 'Sub_Category_EL',
  sub_category_de: 'Sub_Category_DE',
  sub_category_es: 'Sub_Category_ES',
  sub_category_fr: 'Sub_Category_FR',
  code: 'Primary Code',
  family_code: 'Configuration_Code',
  configuration: 'Configuration_EN',
  name_el: 'Configuration_EL',
  name_de: 'Configuration_DE',
  name_es: 'Configuration_ES',
  name_fr: 'Configuration_FR',
  display_name: 'display_name',
  display_description: 'Extra_Details_EN',
  description_el: 'Extra_Details_EL',
  description_de: 'Extra_Details_DE',
  description_es: 'Extra_Details_ES',
  description_fr: 'Extra_Details_FR',
  size: 'Size & Characteristics',
  description: 'Full Description_EN',
  packing_bag: 'Packing_Bag',
  packing_box: 'Packing_Box',
  moq: 'MOQ',
  box_size: 'Box_Size',
  groups: 'Country Groups',
  image_url: 'Image_url',
  is_active: 'Is_Active',
  is_hidden: 'Is_Hidden',
  sort_order: 'Sort_Order',
};

/** The header row written to the sheet (friendly labels, in PRODUCT_COLUMNS order). */
export const HEADER_ROW: string[] = PRODUCT_COLUMNS.map((k) => COLUMN_LABELS[k]);

/** Any accepted header (friendly label OR machine key, case-insensitive) → machine key. */
const HEADER_TO_KEY: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const key of PRODUCT_COLUMNS) {
    m[key.toLowerCase()] = key;                       // legacy machine-key header
    m[COLUMN_LABELS[key].toLowerCase()] = key;        // new friendly header
  }
  return m;
})();

/** Columns that carry configuration-level translations (presence guards import). */
export const TRANSLATION_COLUMNS = [
  'display_name', 'display_description',
  'name_el', 'name_de', 'name_es', 'name_fr',
  'description_el', 'description_de', 'description_es', 'description_fr',
] as const;

export type ProductRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Re-key a raw sheet row so its keys are canonical machine names, accepting both
 * the friendly headers (Category_name_EN, Primary Code, …) and the legacy machine
 * keys (category_name, code, …). Unknown headers are dropped.
 */
export function normalizeHeaderRow(row: ProductRow): ProductRow {
  const out: ProductRow = {};
  for (const [k, v] of Object.entries(row)) {
    const key = HEADER_TO_KEY[String(k).trim().toLowerCase()];
    if (key) out[key] = v;
  }
  return out;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}
function intOrNull(v: unknown): number | null {
  const s = str(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Build a `{lang: value}` map from `${prefix}_${lang}` columns (blanks dropped). */
function i18nFrom(row: ProductRow, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of I18N_LANGS) {
    const v = str(row[`${prefix}_${lang}`]);
    if (v) out[lang] = v;
  }
  return out;
}

/**
 * A product + its group codes → a flat spreadsheet row keyed by machine column.
 * Configuration-level display name + translations come from `record`. Category /
 * sub-category translations come from `catI18n` / `subI18n` (the category's and
 * series' name_i18n), repeating across every row of that category/series.
 */
export function productToRow(
  p: Product,
  groupCodes: string[],
  record?: ProductConfiguration | null,
  catI18n?: Record<string, string> | null,
  subI18n?: Record<string, string> | null,
): ProductRow {
  const name = (record?.name_i18n ?? {}) as Record<string, string>;
  const desc = (record?.description_i18n ?? {}) as Record<string, string>;
  const cat = catI18n ?? {};
  const sub = subI18n ?? {};
  return {
    category: p.category ?? '',
    category_name: p.category_name ?? '',
    category_name_el: cat.el ?? '', category_name_de: cat.de ?? '', category_name_es: cat.es ?? '', category_name_fr: cat.fr ?? '',
    sub_category: p.sub_category ?? '',
    sub_category_el: sub.el ?? '', sub_category_de: sub.de ?? '', sub_category_es: sub.es ?? '', sub_category_fr: sub.fr ?? '',
    code: p.code,
    family_code: p.family_code ?? '',
    configuration: p.configuration ?? '',
    name_el: name.el ?? '', name_de: name.de ?? '', name_es: name.es ?? '', name_fr: name.fr ?? '',
    display_name: record?.name ?? '',
    display_description: record?.description ?? '',
    description_el: desc.el ?? '', description_de: desc.de ?? '', description_es: desc.es ?? '', description_fr: desc.fr ?? '',
    size: p.size ?? '',
    description: p.description ?? '',
    packing_bag: p.packing_bag ?? '', packing_box: p.packing_box ?? '', moq: p.moq ?? '', box_size: p.box_size ?? '',
    groups: groupCodes.join(','),
    image_url: p.image_url ?? '',
    is_active: p.is_active ? 'TRUE' : 'FALSE',
    is_hidden: p.is_hidden ? 'TRUE' : 'FALSE',
    sort_order: p.sort_order ?? 0,
  };
}

export interface ParsedRow {
  draft: ProductDraft | null;
  groups: string[];
  /** Configuration-level translations parsed from the row, or null when the
   *  sheet has no translation columns at all (so importing an old template
   *  never wipes existing translations). */
  translations: ConfigTranslations | null;
  /** Category name translations (→ product_categories.name_i18n), keyed by lang.
   *  Empty when the sheet carries no category-translation columns. */
  categoryI18n: Record<string, string>;
  /** Series (sub-category) name translations (→ product_subcategories.name_i18n). */
  subCategoryI18n: Record<string, string>;
  error: string | null;
}

/** A parsed spreadsheet row → a product draft + group codes + translations.
 *  Accepts a row keyed by either friendly headers or machine keys. */
export function rowToDraft(rawRow: ProductRow): ParsedRow {
  // Accept friendly headers OR machine keys. If the row already has a machine
  // key (e.g. unit tests / legacy files), normalizeHeaderRow keeps it.
  const row = normalizeHeaderRow(rawRow);
  const empty = { draft: null, groups: [], translations: null, categoryI18n: {}, subCategoryI18n: {} };
  const code = str(row.code);
  if (!code) return { ...empty, error: 'Missing code' };
  const groups = (str(row.groups) ?? '')
    .split(/[,\s]+/).map((g) => g.trim().toUpperCase()).filter(Boolean);
  const activeRaw = str(row.is_active);
  const is_active = activeRaw === null ? true : !/^(false|0|no|n)$/i.test(activeRaw);
  // Hidden defaults to false (visible) when the column is absent or empty.
  const is_hidden = /^(true|1|yes|y)$/i.test(str(row.is_hidden) ?? '');
  const draft: ProductDraft = {
    code,
    category: str(row.category),
    category_name: str(row.category_name),
    sub_category: str(row.sub_category),
    family_code: str(row.family_code),
    configuration: str(row.configuration),
    size: str(row.size),
    description: str(row.description),
    // Translations live at the configuration level now; keep the legacy per-row
    // columns empty so they don't shadow the configuration record.
    name_i18n: {},
    description_i18n: {},
    packing_bag: intOrNull(row.packing_bag),
    packing_box: intOrNull(row.packing_box),
    moq: intOrNull(row.moq),
    box_size: str(row.box_size),
    image_url: str(row.image_url),
    is_active,
    is_hidden,
    sort_order: intOrNull(row.sort_order) ?? 0,
  };
  // Only build configuration translations when the sheet carries those columns.
  const hasTrCols = TRANSLATION_COLUMNS.some((c) => c in row);
  const translations: ConfigTranslations | null = hasTrCols ? {
    name: str(row.display_name) ?? '',
    description: str(row.display_description) ?? '',
    name_i18n: i18nFrom(row, 'name'),
    description_i18n: i18nFrom(row, 'description'),
  } : null;
  return {
    draft,
    groups,
    translations,
    categoryI18n: i18nFrom(row, 'category_name'),
    subCategoryI18n: i18nFrom(row, 'sub_category'),
    error: null,
  };
}

/** One filled example row so users see the expected format in the template. */
export function templateExampleRow(): ProductRow {
  return {
    category: 'A',
    category_name: 'Compression Fittings',
    category_name_el: 'Εξαρτήματα Σύσφιξης', category_name_de: '', category_name_es: '', category_name_fr: '',
    sub_category: 'Epsilon Series PN 16 bar',
    sub_category_el: 'Σειρά Epsilon PN 16 bar', sub_category_de: '', sub_category_es: '', sub_category_fr: '',
    code: '330001610',
    family_code: '330',
    configuration: 'Adaptor Male',
    name_el: 'Αρσενικός προσαρμογέας', name_de: 'Übergangsnippel AG', name_es: 'Adaptador macho', name_fr: 'Adaptateur mâle',
    display_name: 'Adaptor Male Epsilon Series PN 16 bar',
    display_description: 'Male threaded adaptor, Epsilon Series PN 16 bar.',
    description_el: '', description_de: '', description_es: '', description_fr: '',
    size: '16 x 3/8"',
    description: 'Male threaded adaptor for PE pipe.',
    packing_bag: 25, packing_box: 750, moq: 25, box_size: '',
    groups: 'A,B,C',
    image_url: '',
    is_active: 'TRUE',
    is_hidden: 'FALSE',
    sort_order: 1,
  };
}

/** Codes that appear more than once in an uploaded sheet (trimmed; blanks ignored).
 *  The products primary key collapses stored duplicates, so they can only be
 *  caught at import time — surfaced as data errors so the admin can fix the file. */
export function findDuplicateCodes(codes: string[]): string[] {
  const seen = new Map<string, number>();
  for (const raw of codes) {
    const c = (raw ?? '').trim();
    if (!c) continue;
    seen.set(c, (seen.get(c) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([c]) => c);
}
