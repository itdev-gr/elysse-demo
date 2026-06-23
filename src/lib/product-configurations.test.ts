import { describe, it, expect } from 'vitest';
import {
  configSlug,
  configKey,
  resolveNameI18n,
  resolveDescriptionI18n,
  type ProductConfiguration,
} from './product-configurations';

describe('configSlug', () => {
  it('joins slugified series + family code', () => {
    expect(configSlug('Epsilon Series PN 16 bar', '330')).toBe('epsilon-series-pn-16-bar-330');
    expect(configSlug('Lambda Series PN10', '120A')).toBe('lambda-series-pn10-120a');
  });
  it('handles a null/empty series', () => {
    expect(configSlug(null, '330')).toBe('330');
    expect(configSlug('', '330')).toBe('330');
  });
});

describe('configKey', () => {
  it('uses family_code when present', () => {
    expect(configKey({ category_slug: 'compression-fittings', sub_category: 'Epsilon Series PN 16 bar', family_code: '330', code: '330001610' }))
      .toEqual({ category_slug: 'compression-fittings', config_slug: 'epsilon-series-pn-16-bar-330' });
  });
  it('falls back to code when family_code is null', () => {
    expect(configKey({ category_slug: 'saddles', sub_category: 'Spare Parts', family_code: null, code: 'SP-9' }))
      .toEqual({ category_slug: 'saddles', config_slug: 'spare-parts-sp-9' });
  });
});

const rec = (over: Partial<ProductConfiguration>): ProductConfiguration => ({
  category_slug: 'compression-fittings', config_slug: 'epsilon-series-pn-16-bar-330',
  name: null, description: null, name_i18n: {}, description_i18n: {}, ...over,
});

describe('resolveNameI18n', () => {
  const perRow = { el: 'Σύνδεσμος Αρσενικός' };
  it('uses the per-row merge as fallback when there is no record', () => {
    expect(resolveNameI18n('Adaptor Male', perRow, undefined))
      .toEqual({ en: 'Adaptor Male', el: 'Σύνδεσμος Αρσενικός' });
  });
  it('record wins over per-row and over the derived English name', () => {
    const r = rec({ name: 'Adaptor Male Epsilon Series PN 16 bar', name_i18n: { de: 'Übergangsnippel' } });
    expect(resolveNameI18n('Adaptor Male', perRow, r))
      .toEqual({ en: 'Adaptor Male Epsilon Series PN 16 bar', de: 'Übergangsnippel' });
  });
  it('keeps the derived English name when the override is blank', () => {
    const r = rec({ name: '   ', name_i18n: { de: 'X' } });
    expect(resolveNameI18n('Adaptor Male', perRow, r)).toEqual({ en: 'Adaptor Male', de: 'X' });
  });
});

describe('resolveDescriptionI18n', () => {
  it('omits en when there is no English description', () => {
    expect(resolveDescriptionI18n(null, {}, undefined)).toEqual({});
  });
  it('includes the derived English description as en (fallback)', () => {
    expect(resolveDescriptionI18n('A male adaptor.', { de: 'D' }, undefined))
      .toEqual({ en: 'A male adaptor.', de: 'D' });
  });
  it('record wins (English override + translations)', () => {
    const r = rec({ description: 'Override EN', description_i18n: { fr: 'F' } });
    expect(resolveDescriptionI18n('derived', { de: 'ignored' }, r))
      .toEqual({ en: 'Override EN', fr: 'F' });
  });
});
