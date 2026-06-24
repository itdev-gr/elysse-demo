// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';

// Exercises the generic data-i18n swap used for category + subcategory names.
// The module runs apply(currentLang()) on import and registers an elysee:lang
// listener, so the DOM is set up before the dynamic import.
describe('i18n-text swap', () => {
  it('swaps to the chosen language and falls back to English', async () => {
    document.body.innerHTML =
      `<span id="t" data-i18n='{"fr":"Raccords","el":""}'>Compression Fittings</span>`;

    await import('./i18n-text.client'); // applies current lang (en) on import
    const el = document.getElementById('t')!;
    expect(el.textContent).toBe('Compression Fittings');

    const setLang = (lang: string) =>
      document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang } }));

    setLang('fr');
    expect(el.textContent).toBe('Raccords');

    setLang('el'); // empty translation → English fallback
    expect(el.textContent).toBe('Compression Fittings');

    setLang('de'); // missing language → English fallback
    expect(el.textContent).toBe('Compression Fittings');

    setLang('fr'); // switch again works after a fallback
    expect(el.textContent).toBe('Raccords');

    setLang('en'); // back to English restores the original
    expect(el.textContent).toBe('Compression Fittings');
  });

  it('swaps a named attribute and restores English', async () => {
    document.body.innerHTML =
      `<input data-i18n-attr='{"placeholder":{"el":"Αναζήτηση"}}' placeholder="Search" />`;
    await import('./i18n-text.client'); // module cached; listener already attached

    const input = document.querySelector('input')!;
    const setLang = (lang: string) =>
      document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang } }));

    setLang('el');
    expect(input.getAttribute('placeholder')).toBe('Αναζήτηση');

    setLang('en'); // restores the server-rendered English
    expect(input.getAttribute('placeholder')).toBe('Search');
  });
});
