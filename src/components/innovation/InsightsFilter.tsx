import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type Cat = 'Innovation News' | 'Success Stories' | 'Activities';

interface Item {
  title: string;
  excerpt?: string;
  image?: string;
  category?: Cat;
  href?: string;
  date?: string;
}

interface Props {
  items: Item[];
}

const ALL = 'All' as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function InsightsFilter({ items }: Props) {
  const reduce = useReducedMotion();
  const cats = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as Cat[],
    [items],
  );
  const [active, setActive] = useState<Cat | typeof ALL>(ALL);
  const visible = active === ALL ? items : items.filter((i) => i.category === active);

  return (
    <>
      <div role="tablist" aria-label="Filter insights" className="flex flex-wrap gap-2 mb-8">
        {([ALL, ...cats] as const).map((c) => {
          const isActive = active === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(c)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border rounded-sm cursor-pointer transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-500 text-surface border-brand-500'
                  : 'bg-surface text-ink/75 border-ink/15 hover:border-brand-500/40 hover:text-ink'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((it) => (
            <motion.li
              key={it.title}
              layout
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="group flex flex-col bg-surface border border-ink/10 rounded-sm overflow-hidden transition-all duration-200 ease-out hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
            >
              {it.image && (
                <div className="aspect-[16/10] bg-brand-500/5 overflow-hidden">
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                {it.category && (
                  <span className="text-[10px] uppercase tracking-widest text-brand-500 font-medium mb-2">
                    {it.category}
                  </span>
                )}
                <h3 className="text-lg font-heavy text-ink leading-tight">{it.title}</h3>
                {it.excerpt && (
                  <p className="mt-3 text-sm text-ink/75 leading-relaxed flex-1">{it.excerpt}</p>
                )}
                {it.href && (
                  <a
                    href={it.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
                  >
                    Read more →
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
