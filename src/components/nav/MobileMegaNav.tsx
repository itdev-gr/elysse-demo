import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup, NavItem } from '../../data/navigation';
import { drawerVariants, backdropVariants, accordionVariants, EASE_OUT } from './megaAnim';
import MegaThumb from './MegaThumb';
import type { ProductCategoryCard } from './ProductsMegaPanel';

type Props = {
  groups: MegaGroup[];
  productCategories?: ProductCategoryCard[];
};

export default function MobileMegaNav({ groups, productCategories = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();

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
                <span className="text-sm uppercase tracking-widest font-medium">Menu</span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center p-2 -mr-2 hover:text-brand-500 transition-colors duration-fast cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Mobile primary" className="px-2 py-2">
                <ul>
                  {groups.map((group, idx) => {
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
                          <span>{group.title}</span>
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
                              {group.variant === 'pill-tabs' ? (
                                <div className="px-4 pb-4">
                                  {group.href && (
                                    <a
                                      href={group.href}
                                      className="block py-1 text-sm font-medium text-ink/90 hover:text-brand-500 transition-colors duration-fast"
                                    >
                                      {group.title} home
                                    </a>
                                  )}
                                  <ul className="mt-3 flex flex-col gap-2">
                                    {productCategories.map((cat) => (
                                      <li key={cat.slug}>
                                        <a
                                          href={`/catalog/${cat.slug}/`}
                                          className="text-sm font-medium text-ink hover:text-brand-accent transition-colors duration-fast"
                                        >
                                          {cat.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                  <ul className="mt-4 border-t border-ink/10 pt-3 flex flex-col gap-2">
                                    {group.items.map((it) => {
                                      const external = /^https?:\/\//.test(it.href);
                                      return (
                                        <li key={it.href}>
                                          <a
                                            href={it.href}
                                            target={external ? '_blank' : undefined}
                                            rel={external ? 'noopener noreferrer' : undefined}
                                            className="text-xs uppercase tracking-wide text-ink/65 hover:text-brand-accent transition-colors duration-fast"
                                          >
                                            {it.label}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ) : (
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
                              )}
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
          <span className="text-sm font-medium text-ink group-hover:text-brand-500 transition-colors duration-fast">
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
