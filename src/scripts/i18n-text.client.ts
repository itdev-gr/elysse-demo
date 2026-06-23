// Generic, page-wide language swap. Any element carrying
//   data-i18n={"el":"…","de":"…","es":"…","fr":"…"}
// has its text replaced with the visitor's chosen language, falling back to the
// English text already rendered in the DOM when a translation is missing or
// blank. One listener covers the whole page — used for category + subcategory
// names and the category blurb. (Product name/description use their own inline
// swap in ConfigDetail; this is the shared, attribute-driven version.)
const KEY = 'elysee.lang';

function currentLang(): string {
  try { return localStorage.getItem(KEY) || 'en'; } catch { return 'en'; }
}

function apply(lang: string): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    // Capture the server-rendered English text once, so we can fall back to it.
    if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.textContent ?? '';
    let map: Record<string, string> = {};
    try { map = JSON.parse(el.dataset.i18n || '{}'); } catch { /* keep English */ }
    const t = lang === 'en' ? '' : (map[lang] || '');
    el.textContent = t && t.trim() ? t : (el.dataset.i18nEn ?? '');
  });
}

apply(currentLang());
document.addEventListener('elysee:lang', (e) => {
  const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
  if (next) apply(next);
});

// Mark this side-effect script as an ES module (no exports of its own) so it can
// be imported both for its side effects and dynamically from the test.
export {};
