import { describe, it, expect } from 'vitest';
import { i18nAttr, i18nAttrFor, missingGreek, tFor } from './i18n';
import { EL } from '../data/i18n/el';

describe('i18nAttr', () => {
  it('emits Greek JSON for a known string', () => {
    expect(i18nAttr('About Us')).toBe(JSON.stringify({ el: 'Σχετικά με εμάς' }));
  });
  it('returns undefined for an unknown string', () => {
    expect(i18nAttr('No Such String 12345')).toBeUndefined();
  });
});

describe('i18nAttrFor', () => {
  it('maps known attributes only', () => {
    expect(i18nAttrFor({ placeholder: 'About Us', alt: 'No Such String 12345' }))
      .toBe(JSON.stringify({ placeholder: { el: 'Σχετικά με εμάς' } }));
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
    expect(tFor('de', 'About Us')).toBe('About Us');
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
