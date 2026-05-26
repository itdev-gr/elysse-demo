import type { NavItem } from '../../data/navigation';

type Props = { items: NavItem[] };

export default function ProductUtilityStrip({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-surface-divider pt-4">
      {items.map((it) => {
        const external = /^https?:\/\//.test(it.href);
        return (
          <a
            key={it.href}
            href={it.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            data-product-utility={it.href}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors duration-fast hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            {it.label}
          </a>
        );
      })}
    </div>
  );
}
