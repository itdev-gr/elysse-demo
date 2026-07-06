import { useEffect, useRef, useState } from 'react';
import { tFor } from '../../lib/i18n';
import { searchSite, groupResults, type SearchKind, type SearchResult } from '../../lib/search';

type Group = { kind: SearchKind; label: string; items: SearchResult[] };

/**
 * /search page island. Reads ?q= on mount, live-searches as the visitor
 * refines the query (debounced), keeps the URL shareable via replaceState,
 * and renders results grouped by kind. Self-translates via tFor — no
 * data-i18n on island DOM.
 */
export default function SearchResults() {
  const [lang, setLang] = useState('en');
  const [q, setQ] = useState('');
  const [entered, setEntered] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setLang(localStorage.getItem('elysee.lang') || 'en'); } catch { /* keep en */ }
    // Adopt keystrokes typed into the SSR input before hydration — the
    // controlled value would otherwise silently discard them.
    const domQ = inputRef.current?.value ?? '';
    setQ(new URLSearchParams(window.location.search).get('q') ?? domQ);
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
      if (next) setLang(next);
    };
    document.addEventListener('elysee:lang', onLang);
    return () => document.removeEventListener('elysee:lang', onLang);
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setGroups([]); setEntered(''); setState('idle'); return; }
    setState('loading');
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const results = await searchSite(query, lang, 25);
        if (seq.current !== id) return;
        setGroups(groupResults(results));
        setEntered(query);
        setState('done');
        const url = new URL(window.location.href);
        url.searchParams.set('q', query);
        history.replaceState({}, '', url);
      } catch {
        if (seq.current === id) setState('error');
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, lang]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-heavy text-ink">{tFor(lang, 'Search')}</h1>

      <form role="search" aria-label={tFor(lang, 'Site search')} className="mt-6 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="group relative flex items-center gap-3">
          <svg className="h-4 w-4 shrink-0 text-ink/50 group-focus-within:text-brand-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            placeholder={tFor(lang, 'Search products, pages, insights…')}
            className="w-full bg-transparent py-2 text-base text-ink placeholder:text-ink/45 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-ink/25"></span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-out-quint group-focus-within:scale-x-100"></span>
        </div>
      </form>

      <div className="mt-8" aria-live="polite">
        {state === 'idle' && (
          <p className="text-ink/60">{tFor(lang, 'Type at least 2 characters to search.')}</p>
        )}
        {state === 'loading' && <p className="text-ink/60">{tFor(lang, 'Searching…')}</p>}
        {state === 'error' && (
          <p className="text-ink/70">{tFor(lang, 'Search is temporarily unavailable. Please try again.')}</p>
        )}
        {state === 'done' && total === 0 && (
          <p className="text-ink/70">{tFor(lang, 'No results for')} "{entered}"</p>
        )}
        {state === 'done' && total > 0 && (
          <>
            <p className="text-sm text-ink/60">
              {total} — {tFor(lang, 'Results for')} "{entered}"
            </p>
            <div className="mt-6 space-y-10">
              {groups.map((g) => (
                <section key={g.kind}>
                  <h2 className="text-xs uppercase tracking-widest font-semibold text-ink/50 border-b border-ink/10 pb-2">
                    {tFor(lang, g.label)} <span className="text-ink/35">({g.items.length})</span>
                  </h2>
                  <ul className="mt-3 divide-y divide-ink/5">
                    {g.items.map((r, i) => (
                      <li key={`${r.url}-${i}`}>
                        <a href={r.url} className="group flex items-center gap-4 py-3">
                          {r.image ? (
                            <img src={r.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-sm object-cover bg-ink/5" />
                          ) : (
                            <span aria-hidden="true" className="h-14 w-14 shrink-0 rounded-sm bg-ink/5" />
                          )}
                          <span className="min-w-0">
                            <span className="block text-[15px] font-medium text-ink group-hover:text-brand-500 transition-colors duration-150">
                              {r.title}
                            </span>
                            {r.subtitle && (
                              <span className="block text-[13px] text-ink/60 line-clamp-1">{r.subtitle}</span>
                            )}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
