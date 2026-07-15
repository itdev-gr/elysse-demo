import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup } from '../../data/navigation';
import { tFor } from '../../lib/i18n';
import MegaPanel from './MegaPanel';

type Props = {
  groups: MegaGroup[];
};

// Hover-intent delay before a submenu opens. Switching between groups while
// one is already open stays instant — this only gates the first open.
const OPEN_DELAY = 1000;

export default function MegaNav({ groups }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [headerH, setHeaderH] = useState<number>(80);
  const closeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduce = useReducedMotion();

  // Keep the Products mega-panel in sync with the live category list so changes
  // made in the dashboard appear in the nav without a rebuild, and resolved to
  // the visitor's chosen language. The build-time `groups` render instantly
  // (English); the live data + language refresh them after hydration.
  type RawCat = {
    slug: string; name: string; image: string | null; blurb: string | null;
    name_i18n: Record<string, string> | null; blurb_i18n: Record<string, string> | null;
  };
  const [rawCats, setRawCats] = useState<RawCat[] | null>(null);
  // Start as 'en' so the first client render matches the server HTML (which is
  // always English) — reading localStorage in the initializer caused a
  // hydration mismatch for non-English visitors. The stored language is
  // applied right after mount instead.
  const [lang, setLang] = useState<string>('en');

  useEffect(() => {
    try { setLang(localStorage.getItem('elysee.lang') || 'en'); } catch { /* keep en */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { supabase } = await import('../../lib/supabase');
      const { data } = await supabase
        .from('product_categories')
        .select('slug,name,image,blurb,sort_order,name_i18n,blurb_i18n')
        .eq('is_active', true)
        .order('sort_order');
      if (cancelled || !data || data.length === 0) return; // never blank a good build-time nav
      setRawCats(data as unknown as RawCat[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<{ lang: string }>).detail?.lang;
      if (next) setLang(next);
    };
    document.addEventListener('elysee:lang', onLang);
    return () => document.removeEventListener('elysee:lang', onLang);
  }, []);

  const liveGroups = useMemo(() => {
    if (!rawCats) return groups;
    const pick = (m: Record<string, string> | null, fb: string) => {
      if (lang === 'en') return fb;
      const t = m?.[lang];
      return t && t.trim() ? t : fb;
    };
    const items = rawCats.map((c) => {
      const caption = pick(c.blurb_i18n, c.blurb ?? '');
      return {
        label: pick(c.name_i18n, c.name),
        href: `/catalog/${c.slug}/`,
        image: c.image ?? undefined,
        caption: caption || undefined,
      };
    });
    return groups.map((g) => (g.title === 'Products' ? { ...g, items } : g));
  }, [rawCats, lang, groups]);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setActive(null), 120);
  };

  const cancelOpen = () => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };

  // Open `idx` after the hover-intent delay. If a panel is already open we
  // switch immediately so the menu stays responsive once engaged.
  const scheduleOpen = (idx: number) => {
    cancelOpen();
    setActive((current) => {
      if (current !== null) return idx;
      openTimer.current = window.setTimeout(() => setActive(idx), OPEN_DELAY);
      return current;
    });
  };

  // Clear any pending timers on unmount.
  useEffect(() => () => {
    cancelClose();
    cancelOpen();
  }, []);

  useEffect(() => {
    const update = () => {
      const header = document.querySelector<HTMLElement>('[data-header]');
      if (header) setHeaderH(header.getBoundingClientRect().height);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active !== null) {
        setActive(null);
        triggerRefs.current[active]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  // Announce open/close so other DOM islands (the Astro header script) can
  // react without us coupling to a specific selector. The header listens for
  // this and folds the open state into its opaque/transparent decision so the
  // bar matches the panel surface while hovered.
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('meganav:state', { detail: { open: active !== null } }),
    );
  }, [active]);

  const activeGroup = active !== null ? liveGroups[active] : null;

  return (
    <div
      className="ml-auto hidden lg:flex items-stretch"
      onMouseLeave={() => {
        cancelOpen();
        scheduleClose();
      }}
      onMouseEnter={cancelClose}
    >
      <nav aria-label={tFor(lang, 'Primary')} className="flex items-stretch gap-1">
        <a
          href="/"
          onMouseEnter={() => {
            cancelOpen();
            setActive(null);
          }}
          className="inline-flex items-center px-3 py-2 text-xs uppercase tracking-widest font-medium hover:text-brand-accent transition-colors duration-fast"
        >
          {tFor(lang, 'Home')}
        </a>
        {liveGroups.map((group, idx) => {
          const hasItems = group.items.length > 0;
          const isOpen = active === idx;
          return (
            <div
              key={group.title}
              className="relative flex items-stretch"
              onMouseEnter={() => {
                cancelClose();
                if (hasItems) scheduleOpen(idx);
                else {
                  cancelOpen();
                  setActive(null);
                }
              }}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[idx] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup={hasItems ? 'menu' : undefined}
                onFocus={() => {
                  if (hasItems) {
                    cancelOpen();
                    setActive(idx);
                  }
                }}
                onClick={() => {
                  cancelOpen();
                  if (!hasItems) {
                    window.location.href = group.href || '/';
                  } else {
                    setActive(isOpen ? null : idx);
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium hover:text-brand-accent transition-colors duration-fast cursor-pointer"
              >
                <span>{tFor(lang, group.title)}</span>
                {hasItems && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className={`transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 4l3 3 3-3" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      <AnimatePresence>
        {activeGroup && (
          <motion.div
            key="mega-panel-shell"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.01 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ top: headerH }}
            className="fixed inset-x-0 z-30 text-ink bg-surface shadow-lg border-t border-ink/5"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            role="region"
            aria-label={`${activeGroup.title} menu`}
          >
            <AnimatePresence mode="wait">
              <MegaPanel key={activeGroup.title} group={activeGroup} />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
