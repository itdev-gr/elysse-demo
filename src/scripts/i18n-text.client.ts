// Generic, page-wide language swap. Any element carrying
//   data-i18n={"el":"…","de":"…","es":"…","fr":"…"}
// has its TEXT replaced with the visitor's chosen language, and any element
// carrying
//   data-i18n-attr={"placeholder":{"el":"…"},"aria-label":{"el":"…"}}
// has the named ATTRIBUTES replaced. Both fall back to the server-rendered
// English already in the DOM when a translation is missing or blank. One
// listener covers the whole page (loaded site-wide from BaseLayout). Product
// name/description use their own inline swap in ConfigDetail.
const KEY = 'elysee.lang';
// Remembers each element's original (English) attribute values, captured once.
const origAttrs = new WeakMap<Element, Record<string, string>>();

function currentLang(): string {
  try { return localStorage.getItem(KEY) || 'en'; } catch { return 'en'; }
}

function apply(lang: string): void {
  // Text nodes.
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    // Capture the server-rendered English text once, so we can fall back to it.
    if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.textContent ?? '';
    let map: Record<string, string> = {};
    try { map = JSON.parse(el.dataset.i18n || '{}'); } catch { /* keep English */ }
    const t = lang === 'en' ? '' : (map[lang] || '');
    el.textContent = t && t.trim() ? t : (el.dataset.i18nEn ?? '');
  });
  // Attributes (placeholder, alt, aria-label, title, …).
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    let map: Record<string, Record<string, string>> = {};
    try { map = JSON.parse(el.dataset.i18nAttr || '{}'); } catch { return; }
    // Capture the server-rendered English attribute values once.
    let saved = origAttrs.get(el);
    if (!saved) {
      saved = {};
      for (const a of Object.keys(map)) saved[a] = el.getAttribute(a) ?? '';
      origAttrs.set(el, saved);
    }
    for (const [attr, langs] of Object.entries(map)) {
      const t = lang === 'en' ? '' : (langs[lang] || '');
      el.setAttribute(attr, t && t.trim() ? t : (saved[attr] ?? ''));
    }
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
