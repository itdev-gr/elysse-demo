import { motion } from 'motion/react';
import type { MegaGroup } from '../../data/navigation';
import { panelVariants } from './megaAnim';
import MegaCard from './MegaCard';

export default function MegaPanel({ group }: { group: MegaGroup }) {
  const count = group.items.length;
  const cols = count <= 3 ? 'lg:grid-cols-3' : count === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5';
  return (
    <motion.div
      key={group.title}
      variants={panelVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className="w-full"
    >
      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {group.title}
          </span>
          {group.href && (
            <a
              href={group.href}
              className="text-xs uppercase tracking-widest font-medium text-ink/70 hover:text-brand-accent transition-colors duration-fast"
            >
              Explore {group.title} →
            </a>
          )}
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-3 ${cols} gap-x-4 gap-y-5`}>
          {group.items.map((it) => (
            <MegaCard key={it.href} item={it} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
