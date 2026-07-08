import { describe, it, expect } from 'vitest';
import { i18nAttr, i18nAttrFor, missingGreek, tFor } from './i18n';
import { EL } from '../data/i18n/el';
import { DE } from '../data/i18n/de';
import { ES } from '../data/i18n/es';
import { FR } from '../data/i18n/fr';

describe('i18nAttr', () => {
  it('emits Greek in the JSON for a known string', () => {
    const parsed = JSON.parse(i18nAttr('About Us')!);
    expect(parsed.el).toBe('Σχετικά με εμάς');
  });
  it('returns undefined for an unknown string', () => {
    expect(i18nAttr('No Such String 12345')).toBeUndefined();
  });
});

describe('i18nAttrFor', () => {
  it('maps known attributes only', () => {
    const parsed = JSON.parse(i18nAttrFor({ placeholder: 'About Us', alt: 'No Such String 12345' })!);
    expect(parsed.placeholder.el).toBe('Σχετικά με εμάς');
    expect(parsed.alt).toBeUndefined();
  });
  it('returns undefined when nothing maps', () => {
    expect(i18nAttrFor({ alt: 'No Such String 12345' })).toBeUndefined();
  });
});

describe('tFor', () => {
  it('returns Greek for a known string', () => {
    expect(tFor('el', 'About Us')).toBe('Σχετικά με εμάς');
  });
  it('falls back to English for unknown strings', () => {
    expect(tFor('el', 'No Such String 12345')).toBe('No Such String 12345');
  });
  it('returns English for en and unsupported languages', () => {
    expect(tFor('en', 'About Us')).toBe('About Us');
    expect(tFor('pt', 'About Us')).toBe('About Us');
  });
  it('covers the nav labels used by the Mega navs', () => {
    for (const label of ['Home', 'Menu', 'About Us', 'Innovation', 'Products', 'Insights', 'Contact Us']) {
      expect(tFor('el', label)).not.toBe(label);
    }
  });
});

describe('dictionary integrity', () => {
  it('has no empty Greek values', () => {
    const empty = Object.entries(EL).filter(([, v]) => !v || !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });
  it('missingGreek flags only absent keys', () => {
    expect(missingGreek(['About Us', 'No Such String 12345'])).toEqual(['No Such String 12345']);
  });
});

describe('multilingual dictionaries (de/es/fr)', () => {
  const DICTS = { DE, ES, FR } as const;
  for (const [name, dict] of Object.entries(DICTS)) {
    it(`${name} has no empty/blank values`, () => {
      const empty = Object.entries(dict).filter(([, v]) => !v || !v.trim()).map(([k]) => k);
      expect(empty).toEqual([]);
    });
    it(`${name} has no keys absent from EL (no orphans)`, () => {
      const orphans = Object.keys(dict).filter((k) => !(k in EL));
      expect(orphans).toEqual([]);
    });
  }
});

describe('multilingual key parity (complete coverage)', () => {
  const DICTS = { DE, ES, FR } as const;
  for (const [name, dict] of Object.entries(DICTS)) {
    it(`${name} covers every EL key`, () => {
      const missing = Object.keys(EL).filter((k) => !(k in dict));
      expect(missing).toEqual([]);
    });
  }
});
