import { motion } from 'motion/react';
import type { NavItem } from '../../data/navigation';
import { cardVariants, cardHover, imageHover } from './megaAnim';
import MegaThumb from './MegaThumb';

export default function MegaCard({ item }: { item: NavItem }) {
  const isExternal = /^https?:\/\//.test(item.href);
  return (
    <motion.a
      href={item.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      variants={cardVariants}
      whileHover={cardHover}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-ink/5">
        {item.image ? (
          <motion.img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            whileHover={imageHover}
          />
        ) : (
          <MegaThumb label={item.label} icon={item.icon} />
        )}
      </div>
      <div className="mt-3 text-sm font-medium uppercase tracking-wider text-ink transition-colors duration-fast group-hover:text-brand-accent">
        {item.label}
      </div>
      {item.caption && (
        <div className="mt-1 text-xs leading-snug text-ink/65 line-clamp-2 normal-case tracking-normal">
          {item.caption}
        </div>
      )}
    </motion.a>
  );
}
