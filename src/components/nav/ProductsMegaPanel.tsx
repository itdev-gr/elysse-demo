import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MegaGroup } from '../../data/navigation';
import { panelVariants, tabSwitchVariants } from './megaAnim';
import { getSubCategoriesForSlug } from '../../data/product-subcategories';
import ProductUtilityStrip from './ProductUtilityStrip';

export type ProductCategoryCard = {
  name: string;
  slug: string;
  image: string;
};

type Props = {
  group: MegaGroup;
  categories: ProductCategoryCard[];
};

function resolveActiveFromPath(pathname: string, categories: ProductCategoryCard[]): string | null {
  const match = pathname.match(/\/catalog\/([^/]+)\/?/);
  const slug = match?.[1];
  if (slug && categories.some((c) => c.slug === slug)) return slug;
  return categories[0]?.slug ?? null;
}

export default function ProductsMegaPanel({ group, categories }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(() =>
    typeof window === 'undefined'
      ? categories[0]?.slug ?? null
      : resolveActiveFromPath(window.location.pathname, categories),
  );
  const tabListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActive(resolveActiveFromPath(window.location.pathname, categories));
  }, [categories]);

  const focusSlug = (slug: string) => {
    tabListRef.current
      ?.querySelector<HTMLAnchorElement>(`[data-product-category="${slug}"]`)
      ?.focus();
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    const idx = categories.findIndex((c) => c.slug === active);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = categories[(idx + 1) % categories.length];
      setActive(next.slug);
      focusSlug(next.slug);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = categories[(idx - 1 + categories.length) % categories.length];
      setActive(prev.slug);
      focusSlug(prev.slug);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(categories[0].slug);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(categories[categories.length - 1].slug);
    }
  };

  const activeCategory = categories.find((c) => c.slug === active) ?? categories[0];
  const subCategories = activeCategory ? getSubCategoriesForSlug(activeCategory.slug) : [];

  return (
    <motion.div
      key={group.title}
      variants={panelVariants}
      initial={reduce ? false : 'closed'}
      animate="open"
      exit="closed"
      className="w-full"
      data-products-mega-panel
    >
      <div className="mx-auto w-full max-w-[920px] px-4">
        <div className="rounded-[20px] bg-surface p-6 shadow-[0_16px_48px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_220px_240px]">

            {/* Column 1 — category names */}
            <div
              ref={tabListRef}
              role="tablist"
              aria-orientation="vertical"
              aria-label="Product categories"
              onKeyDown={onTabKey}
              className="flex flex-col gap-1 lg:grid lg:grid-flow-col lg:grid-rows-7 lg:gap-x-3 lg:gap-y-1"
            >
              {categories.map((cat) => {
                const isActive = cat.slug === active;
                return (
                  <a
                    key={cat.slug}
                    href={`/catalog/${cat.slug}/`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="product-subcat-panel"
                    data-product-category={cat.slug}
                    onMouseEnter={() => setActive(cat.slug)}
                    onFocus={() => setActive(cat.slug)}
                    className={`flex w-full items-center border-l-2 py-1.5 pl-2.5 pr-2 text-left text-xs font-semibold transition-colors duration-fast min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'border-brand-500 text-brand-500'
                        : 'border-transparent text-ink-muted hover:text-ink'
                    }`}
                  >
                    {cat.name}
                  </a>
                );
              })}
            </div>

            {/* Column 2 — sub-categories of the active category */}
            <div
              id="product-subcat-panel"
              className="relative min-h-[224px] lg:before:absolute lg:before:-left-3 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-surface-divider lg:before:content-['']"
            >
              <AnimatePresence mode="wait" initial={false}>
                {activeCategory && (
                  <motion.ul
                    key={activeCategory.slug}
                    variants={tabSwitchVariants}
                    initial="enter"
                    animate="active"
                    exit="exit"
                    className="flex flex-col gap-2"
                    aria-label={`${activeCategory.name} sub-categories`}
                  >
                    {subCategories.length === 0 ? (
                      <li className="text-xs italic text-ink-muted">No sub-categories available.</li>
                    ) : (
                      subCategories.map((sub) => {
                        const external = /^https?:\/\//.test(sub.href);
                        return (
                          <li key={sub.href}>
                            <a
                              href={sub.href}
                              target={external ? '_blank' : undefined}
                              rel={external ? 'noopener noreferrer' : undefined}
                              data-product-subcategory={sub.href}
                              className="group inline-flex items-center text-[12px] font-medium leading-[16px] text-ink transition-transform duration-fast hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
                            >
                              <span className="relative">
                                {sub.name}
                                <span
                                  className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-fast group-hover:scale-x-100"
                                  aria-hidden="true"
                                />
                              </span>
                            </a>
                          </li>
                        );
                      })
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Column 3 — image of the active category (no frame, fits the image) */}
            <div className="relative aspect-[4/3] lg:before:absolute lg:before:-left-3 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-surface-divider lg:before:content-['']">
              <AnimatePresence mode="wait" initial={false}>
                {activeCategory && (
                  <motion.img
                    key={activeCategory.slug}
                    src={activeCategory.image}
                    alt={activeCategory.name}
                    variants={tabSwitchVariants}
                    initial="enter"
                    animate="active"
                    exit="exit"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <ProductUtilityStrip items={group.items} />
        </div>
      </div>
    </motion.div>
  );
}
