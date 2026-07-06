import { useEffect, useRef, useState } from 'react';
import { tFor } from '../../lib/i18n';
import { searchSite, KIND_LABELS, type SearchResult } from '../../lib/search';

/**
 * Header search island. Renders the same editorial field as the old demo
 * NavSearch.astro (hairline baseline + brand-green underline sweep) and wires
 * it live: debounced top results in a dropdown, Enter → /search?q=.
 * Desktop-only (hidden lg:flex) — the mobile drawer has its own form.
 */
export default function NavSearch() {
  const [lang, setLang] = useState('en');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const seq = useRef(0);
  const rootRef = useRef<HTMLFormElement>(null);

  // Language: start as 'en' to match the server HTML, then apply the stored
  // choice and follow the toggle. Same pattern as MegaNav.tsx.
  useEffect(() => {
    try { setLang(localStorage.getItem('elysee.lang') || 'en'); } catch { /* keep en */ }
  }, []);
  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
      if (next) setLang(next);
    };
    document.addEventListener('elysee:lang', onLang);
    return () => document.removeEventListener('elysee:lang', onLang);
  }, []);

  // Debounced live search with a stale-response guard.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchSite(query, lang, 5);
        if (seq.current !== id) return;
        setResults(r.slice(0, 8));
        setFailed(false);
        setOpen(true);
        setActive(-1);
      } catch {
        if (seq.current !== id) return;
        setResults([]);
        setFailed(true);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, lang]);

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const goAll = () => {
    const query = q.trim();
    if (query.length >= 2) window.location.assign(`/search?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }
  };

  return (
    <form
      ref={rootRef}
      role="search"
      aria-label={tFor(lang, 'Site search')}
      className="group relative hidden lg:flex items-center gap-2.5 w-44 xl:w-56 shrink-0"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && results[active]) window.location.assign(results[active].url);
        else goAll();
      }}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 text-current/55 transition-colors duration-200 group-focus-within:text-brand-500"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="search"
        name="q"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="nav-search-listbox"
        aria-autocomplete="list"
        placeholder={tFor(lang, 'Search…')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { if (results.length > 0 || failed) setOpen(true); }}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent py-1.5 text-[12px] leading-none tracking-wide text-current placeholder:text-current/50 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />

      {/* Resting hairline baseline. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-current/25"></span>
      {/* Brand-green underline — sweeps in from the left on focus. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-out-quint group-focus-within:scale-x-100"
      ></span>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-md border border-surface-divider bg-surface text-ink shadow-lg z-50">
          {failed ? (
            <p className="px-4 py-3 text-[12px] text-ink/65">
              {tFor(lang, 'Search is temporarily unavailable. Please try again.')}
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-[12px] text-ink/65">
              {tFor(lang, 'No results for')} "{q.trim()}"
            </p>
          ) : (
            <ul id="nav-search-listbox" role="listbox" className="max-h-96 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.url}-${i}`} role="option" aria-selected={i === active}>
                  <a
                    href={r.url}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors duration-150 ${i === active ? 'bg-surface-alt' : ''} hover:bg-surface-alt`}
                  >
                    {r.image ? (
                      <img src={r.image} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded-sm object-cover bg-ink/5" />
                    ) : (
                      <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-sm bg-ink/5" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-[11px] text-ink/60">{r.subtitle}</span>}
                    </span>
                    <span className="shrink-0 text-[9px] uppercase tracking-wider text-ink/45">
                      {tFor(lang, KIND_LABELS[r.kind])}
                    </span>
                  </a>
                </li>
              ))}
              <li className="border-t border-surface-divider">
                <button
                  type="button"
                  onClick={goAll}
                  className="w-full px-3 py-2 text-left text-[12px] font-medium text-brand-500 hover:bg-surface-alt transition-colors duration-150 cursor-pointer"
                >
                  {tFor(lang, 'View all results')} →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
