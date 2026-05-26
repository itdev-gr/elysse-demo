import type { ProductPillTab as PillTabData } from '../../data/product-megamenu';

type Props = {
  tab: PillTabData;
  isActive: boolean;
  onActivate: () => void;
  onFocus: () => void;
};

export default function ProductPillTab({ tab, isActive, onActivate, onFocus }: Props) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`product-tabpanel-${tab.id}`}
      id={`product-tab-${tab.id}`}
      data-product-pill={tab.id}
      onClick={onActivate}
      onFocus={onFocus}
      className={`flex w-full items-center border-l-2 py-1.5 pl-2.5 pr-2 text-left text-xs font-semibold transition-colors duration-fast min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        isActive
          ? 'border-brand-500 text-brand-500'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      {tab.label}
    </button>
  );
}
