import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup } from '../../data/navigation';
import MegaPanel from './MegaPanel';
import ProductsMegaPanel, { type ProductCategoryCard } from './ProductsMegaPanel';

type Props = {
  groups: MegaGroup[];
  productCategories?: ProductCategoryCard[];
};

export default function MegaNav({ groups, productCategories = [] }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [headerH, setHeaderH] = useState<number>(80);
  const closeTimer = useRef<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduce = useReducedMotion();

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

  const activeGroup = active !== null ? groups[active] : null;

  return (
    <div
      className="ml-auto hidden lg:flex items-stretch"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <nav aria-label="Primary" className="flex items-stretch gap-1">
        {groups.map((group, idx) => {
          const hasItems = group.items.length > 0;
          const isOpen = active === idx;
          return (
            <div
              key={group.title}
              className="relative flex items-stretch"
              onMouseEnter={() => {
                cancelClose();
                if (hasItems) setActive(idx);
                else setActive(null);
              }}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[idx] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup={hasItems ? 'menu' : undefined}
                onFocus={() => hasItems && setActive(idx)}
                onClick={() => {
                  if (!hasItems) {
                    window.location.href = group.href || '/';
                  } else {
                    setActive(isOpen ? null : idx);
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium hover:text-brand-accent transition-colors duration-fast cursor-pointer"
              >
                <span>{group.title}</span>
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
            className={`fixed inset-x-0 z-30 text-ink ${
              activeGroup.variant === 'pill-tabs'
                ? 'pt-4'
                : 'bg-surface shadow-lg border-t border-ink/5'
            }`}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            role="region"
            aria-label={`${activeGroup.title} menu`}
          >
            <AnimatePresence mode="wait">
              {activeGroup.variant === 'pill-tabs' ? (
                <ProductsMegaPanel key={activeGroup.title} group={activeGroup} categories={productCategories} />
              ) : (
                <MegaPanel key={activeGroup.title} group={activeGroup} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
