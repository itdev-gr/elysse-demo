import { supabase } from './supabase';
import { cleanI18n } from './categories';

/**
 * Product-level (configuration) display name + translations.
 *
 * A "configuration" is the set of `products` rows sharing
 * (category, sub_category, family_code) — what one catalog detail page renders.
 * Its name + translations live once here (table `product_configurations`),
 * keyed by (category_slug, config_slug), instead of being scattered across the
 * size rows. English `name`/`description` are optional overrides that fall back
 * to the derived configuration name / representative description.
 */
export interface ProductConfiguration {
  category_slug: string;
  config_slug: string;
  name: string | null;
  description: string | null;
  name_i18n: Record<string, string> | null;
  description_i18n: Record<string, string> | null;
  created_at?: string;
  updated_at?: string;
}

/** Editable translation fields for the admin form. */
export interface ConfigTranslations {
  name: string;
  description: string;
  name_i18n: Record<string, string>;
  description_i18n: Record<string, string>;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Stable URL slug for a configuration within a category: "{series}-{familyCode}". */
export function configSlug(subCategory: string | null, familyCode: string): string {
  return `${slugify(subCategory ?? '')}-${slugify(familyCode)}`.replace(/^-|-$/g, '');
}

export interface ConfigKey {
  category_slug: string;
  config_slug: string;
}

/** Derive the (category_slug, config_slug) key from a product row's fields. */
export function configKey(input: {
  category_slug: string;
  sub_category: string | null;
  family_code: string | null;
  code: string;
}): ConfigKey {
  return {
    category_slug: input.category_slug,
    config_slug: configSlug(input.sub_category, input.family_code ?? input.code),
  };
}

/**
 * Displayed name map for a configuration. The product-level record wins; the
 * per-row merged map is the fallback. `en` is always present (override → derived).
 */
export function resolveNameI18n(
  derivedEn: string,
  perRowLangs: Record<string, string>,
  record?: ProductConfiguration,
): Record<string, string> {
  const en = record?.name?.trim() || derivedEn;
  const langs = record ? cleanI18n(record.name_i18n) : perRowLangs;
  return { en, ...langs };
}

/**
 * Displayed description map for a configuration. Same precedence as the name,
 * but `en` is only included when there is an English description at all.
 */
export function resolveDescriptionI18n(
  derivedEn: string | null,
  perRowLangs: Record<string, string>,
  record?: ProductConfiguration,
): Record<string, string> {
  const en = record?.description?.trim() || derivedEn?.trim() || '';
  const langs = record ? cleanI18n(record.description_i18n) : perRowLangs;
  return { ...(en ? { en } : {}), ...langs };
}

/** Read a configuration's stored translations (admin form). */
export async function fetchConfigTranslations(key: ConfigKey): Promise<ProductConfiguration | null> {
  const { data, error } = await supabase
    .from('product_configurations').select('*')
    .eq('category_slug', key.category_slug).eq('config_slug', key.config_slug)
    .maybeSingle();
  if (error) { console.error('fetchConfigTranslations:', error.message); return null; }
  return (data as ProductConfiguration) ?? null;
}

/** Every configuration record in a category, keyed by config_slug (public read). */
export async function fetchConfigsByCategorySlug(
  categorySlug: string,
): Promise<Map<string, ProductConfiguration>> {
  const { data, error } = await supabase
    .from('product_configurations').select('*').eq('category_slug', categorySlug);
  if (error) { console.error('fetchConfigsByCategorySlug:', error.message); return new Map(); }
  return new Map(((data ?? []) as ProductConfiguration[]).map((r) => [r.config_slug, r]));
}

/** Create or update a configuration's translations (admin form). */
export async function upsertConfigTranslations(
  key: ConfigKey, t: ConfigTranslations,
): Promise<{ error: string | null }> {
  const payload = {
    category_slug: key.category_slug,
    config_slug: key.config_slug,
    name: t.name?.trim() || null,
    description: t.description?.trim() || null,
    name_i18n: cleanI18n(t.name_i18n),
    description_i18n: cleanI18n(t.description_i18n),
  };
  const { error } = await supabase
    .from('product_configurations').upsert(payload, { onConflict: 'category_slug,config_slug' });
  return { error: error?.message ?? null };
}
