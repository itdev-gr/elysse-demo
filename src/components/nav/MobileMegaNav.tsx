import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup, NavItem } from '../../data/navigation';
import { drawerVariants, backdropVariants, accordionVariants, EASE_OUT } from './megaAnim';
import { i18nAttr, i18nAttrFor } from '../../lib/i18n';
import MegaThumb from './MegaThumb';

type Props = {
  groups: MegaGroup[];
};

export default function MobileMegaNav({ groups }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();

  // Refresh the Products category list from Supabase after hydration (so
  // dashboard changes appear without a rebuild) and resolve names/captions to
  // the visitor's chosen language, falling back to English.
  type RawCat = {
    slug: string; name: string; image: string | null; blurb: string | null;
    name_i18n: Record<string, string> | null; blurb_i18n: Record<string, string> | null;
  };
  const [rawCats, setRawCats] = useState<RawCat[] | null>(null);
  const [lang, setLang] = useState<string>(() => {
    try { return localStorage.getItem('elysee.lang') || 'en'; } catch { return 'en'; }
  });

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
    const items: NavItem[] = rawCats.map((c) => {
      const caption = pick(c.blurb_i18n, c.blurb ?? '');
      return {
        label: pick(c.name_i18n, c.name),
        href: `/catalog/${c.slug}/?country=ask`,
        image: c.image ?? undefined,
        caption: caption || undefined,
      };
    });
    return groups.map((g) => (g.title === 'Products' ? { ...g, items } : g));
  }, [rawCats, lang, groups]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wide font-medium hover:text-brand-accent transition-colors duration-fast lg:hidden cursor-pointer"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 9h18M5 14h18M5 19h18" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-dialog"
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            data-i18n-attr={i18nAttrFor({ 'aria-label': 'Primary navigation' })}
            initial={{ pointerEvents: 'none' }}
            animate={{ pointerEvents: 'auto' }}
            exit={{ pointerEvents: 'none' }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: reduce ? 0.01 : 0.2 }}
              className="absolute inset-0 bg-black/40"
              onClick={closeDrawer}
            />
            <motion.aside
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={reduce ? { duration: 0.01 } : undefined}
              className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-sm bg-surface text-ink overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-ink/10 bg-surface">
                <span className="text-sm uppercase tracking-widest font-medium" data-i18n={i18nAttr('Menu')}>Menu</span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  data-i18n-attr={i18nAttrFor({ 'aria-label': 'Close menu' })}
                  className="inline-flex items-center justify-center p-2 -mr-2 hover:text-brand-500 transition-colors duration-fast cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Mobile primary" data-i18n-attr={i18nAttrFor({ 'aria-label': 'Mobile primary' })} className="px-2 py-2">
                <ul>
                  <li className="border-b border-ink/5">
                    <a
                      href="/"
                      onClick={closeDrawer}
                      className="block px-4 py-3 text-sm uppercase tracking-widest font-medium text-ink hover:text-brand-500 transition-colors duration-fast"
                      data-i18n={i18nAttr('Home')}
                    >
                      Home
                    </a>
                  </li>
                  {liveGroups.map((group, idx) => {
                    const hasItems = group.items.length > 0;
                    const isExpanded = expanded === idx;
                    return (
                      <li key={group.title} className="border-b border-ink/5">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpanded(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm uppercase tracking-widest font-medium text-ink hover:text-brand-500 transition-colors duration-fast cursor-pointer"
                        >
                          <span data-i18n={i18nAttr(group.title)}>{group.title}</span>
                          {hasItems && (
                            <motion.svg
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: reduce ? 0.01 : 0.2, ease: EASE_OUT }}
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              aria-hidden="true"
                            >
                              <path d="M3 5l3 3 3-3" />
                            </motion.svg>
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {hasItems && isExpanded && (
                            <motion.div
                              key="acc"
                              variants={accordionVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                              className="overflow-hidden"
                            >
                              <ul className="px-4 pb-4 space-y-3">
                                {group.href && (
                                  <li>
                                    <a
                                      href={group.href}
                                      className="block py-1 text-sm font-medium text-ink/90 hover:text-brand-500 transition-colors duration-fast"
                                    >
                                      {group.title} home
                                    </a>
                                  </li>
                                )}
                                {group.items.map((it) => (
                                  <MobileItem key={it.href} item={it} />
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileItem({ item }: { item: NavItem }) {
  const isExternal = /^https?:\/\//.test(item.href);
  return (
    <li>
      <a
        href={item.href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="group flex items-center gap-3 py-1"
      >
        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-ink/5">
          {item.image ? (
            <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <MegaThumb label={item.label} icon={item.icon} />
          )}
        </span>
        <span className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-ink group-hover:text-brand-500 transition-colors duration-fast" data-i18n={i18nAttr(item.label)}>
            {item.label}
          </span>
          {item.caption && (
            <span className="text-xs text-ink/60 line-clamp-1">{item.caption}</span>
          )}
        </span>
      </a>
    </li>
  );
}
