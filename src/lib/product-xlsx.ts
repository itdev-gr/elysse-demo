import type { Product, ProductDraft } from '../types/product';
import type { ProductConfiguration, ConfigTranslations } from './product-configurations';

/** Languages that can be translated (English lives in the plain columns). */
export const I18N_LANGS = ['el', 'de', 'es', 'fr'] as const;

/**
 * The full column set for the bulk template / import / export — everything the
 * website needs to show a product correctly.
 *
 * Per-row (size) fields: identity, category fields, the per-size English
 * `configuration` name + `description`, packaging, country visibility (groups
 * A–E), image, `is_active`, `is_hidden`, sort_order.
 *
 * Configuration-level fields (shared by every size of a configuration, stored
 * in product_configurations): `display_name` + `display_description` are the
 * English overrides shown on the product page, and `name_*` / `description_*`
 * are their per-language translations. These repeat across all sizes of a
 * configuration on export and are written back to the configuration on import.
 */
export const PRODUCT_COLUMNS = [
  'code',
  'category_name',
  'category',
  'sub_category',
  'family_code',
  'configuration',
  'display_name',
  'size',
  'description',
  'display_description',
  'name_el', 'name_de', 'name_es', 'name_fr',
  'description_el', 'description_de', 'description_es', 'description_fr',
  'packing_bag', 'packing_box', 'moq', 'box_size',
  'groups',
  'image_url',
  'is_active',
  'is_hidden',
  'sort_order',
] as const;

/** Columns that carry configuration-level translations (presence guards import). */
export const TRANSLATION_COLUMNS = [
  'display_name', 'display_description',
  'name_el', 'name_de', 'name_es', 'name_fr',
  'description_el', 'description_de', 'description_es', 'description_fr',
] as const;

export type ProductRow = Record<string, string | number | boolean | null | undefined>;

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

/**
 * A product + its group codes → a flat spreadsheet row. Configuration-level
 * display name + translations come from `record` (the product's
 * product_configurations row), so they repeat across every size of a
 * configuration. Pass `null`/`undefined` when the configuration has no record.
 */
export function productToRow(p: Product, groupCodes: string[], record?: ProductConfiguration | null): ProductRow {
  const name = (record?.name_i18n ?? {}) as Record<string, string>;
  const desc = (record?.description_i18n ?? {}) as Record<string, string>;
  return {
    code: p.code,
    category_name: p.category_name ?? '',
    category: p.category ?? '',
    sub_category: p.sub_category ?? '',
    family_code: p.family_code ?? '',
    configuration: p.configuration ?? '',
    display_name: record?.name ?? '',
    size: p.size ?? '',
    description: p.description ?? '',
    display_description: record?.description ?? '',
    name_el: name.el ?? '', name_de: name.de ?? '', name_es: name.es ?? '', name_fr: name.fr ?? '',
    description_el: desc.el ?? '', description_de: desc.de ?? '', description_es: desc.es ?? '', description_fr: desc.fr ?? '',
    packing_bag: p.packing_bag ?? '', packing_box: p.packing_box ?? '', moq: p.moq ?? '', box_size: p.box_size ?? '',
    groups: groupCodes.join(','),
    image_url: p.image_url ?? '',
    is_active: p.is_active ? 'TRUE' : 'FALSE',
    is_hidden: p.is_hidden ? 'TRUE' : 'FALSE',
    sort_order: p.sort_order ?? 0,
  };
}

function i18nFrom(row: ProductRow, prefix: 'name' | 'description'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of I18N_LANGS) {
    const v = str(row[`${prefix}_${lang}`]);
    if (v) out[lang] = v;
  }
  return out;
}

export interface ParsedRow {
  draft: ProductDraft | null;
  groups: string[];
  /** Configuration-level translations parsed from the row, or null when the
   *  sheet has no translation columns at all (so importing an old template
   *  never wipes existing translations). */
  translations: ConfigTranslations | null;
  error: string | null;
}

/** A parsed spreadsheet row → a product draft + group codes + config translations. */
export function rowToDraft(row: ProductRow): ParsedRow {
  const code = str(row.code);
  if (!code) return { draft: null, groups: [], translations: null, error: 'Missing code' };
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
  // Only build translations when the sheet actually carries those columns.
  const hasTrCols = TRANSLATION_COLUMNS.some((c) => c in row);
  const translations: ConfigTranslations | null = hasTrCols ? {
    name: str(row.display_name) ?? '',
    description: str(row.display_description) ?? '',
    name_i18n: i18nFrom(row, 'name'),
    description_i18n: i18nFrom(row, 'description'),
  } : null;
  return { draft, groups, translations, error: null };
}

/** One filled example row so users see the expected format in the template. */
export function templateExampleRow(): ProductRow {
  return {
    code: '330001610',
    category_name: 'Compression Fittings',
    category: 'A',
    sub_category: 'Epsilon Series PN16',
    family_code: '330',
    configuration: 'Adaptor Male',
    display_name: 'Adaptor Male Epsilon Series PN 16 bar',
    size: '16 x 3/8"',
    description: 'Male threaded adaptor for PE pipe.',
    display_description: 'Male threaded adaptor, Epsilon Series PN 16 bar.',
    name_el: 'Αρσενικός προσαρμογέας', name_de: 'Übergangsnippel AG', name_es: 'Adaptador macho', name_fr: 'Adaptateur mâle',
    description_el: '', description_de: '', description_es: '', description_fr: '',
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
