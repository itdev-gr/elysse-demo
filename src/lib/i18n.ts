import { EL } from '../data/i18n/el';
import { DE } from '../data/i18n/de';
import { ES } from '../data/i18n/es';
import { FR } from '../data/i18n/fr';

/** Languages that receive a client-side swap. English is the in-DOM base/fallback. */
export const I18N_LOCALES = ['el', 'de', 'es', 'fr'] as const;
export type I18nLocale = (typeof I18N_LOCALES)[number];

const DICTS: Record<I18nLocale, Record<string, string>> = { el: EL, de: DE, es: ES, fr: FR };

/**
 * Build the `data-i18n` value for a text node: a JSON map of the available
 * translations, or `undefined` when none exist (so the attribute is omitted and
 * the element stays English). English text remains the in-DOM source/fallback.
 */
export function i18nAttr(en: string): string | undefined {
  const out: Record<string, string> = {};
  for (const locale of I18N_LOCALES) {
    const t = DICTS[locale][en];
    if (t && t.trim()) out[locale] = t;
  }
  return Object.keys(out).length ? JSON.stringify(out) : undefined;
}

/**
 * Build the `data-i18n-attr` value for translating element attributes
 * (placeholder, alt, aria-label, title, …). Pass a map of attribute → English
 * value; returns `{ attr: { el: "…" } }` JSON for the known ones, or undefined.
 */
export function i18nAttrFor(attrs: Record<string, string>): string | undefined {
  const out: Record<string, Record<string, string>> = {};
  for (const [attr, en] of Object.entries(attrs)) {
    const langs: Record<string, string> = {};
    for (const locale of I18N_LOCALES) {
      const t = DICTS[locale][en];
      if (t && t.trim()) langs[locale] = t;
    }
    if (Object.keys(langs).length) out[attr] = langs;
  }
  return Object.keys(out).length ? JSON.stringify(out) : undefined;
}

/** Dev/test helper: which of the given English strings lack a Greek entry. */
export function missingGreek(strings: string[]): string[] {
  return [...new Set(strings)].filter((s) => !EL[s] || !EL[s].trim());
}

/**
 * Resolve an English UI string for the given language, for React islands that
 * render their own translations instead of carrying `data-i18n` (the nav).
 * Keeping `data-i18n` off island-rendered nodes stops the global swap script
 * from mutating them before hydration — the cause of React hydration
 * mismatches that reverted the nav to English for Greek visitors.
 */
export function tFor(lang: string, en: string): string {
  const dict = DICTS[lang as I18nLocale];
  if (dict) {
    const t = dict[en];
    if (t && t.trim()) return t;
  }
  return en;
}
