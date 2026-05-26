import { motion } from 'motion/react';
import { getLeavesForTab, type ProductPillId } from '../../data/product-megamenu';
import { tabSwitchVariants } from './megaAnim';

type Props = { activeTabId: ProductPillId };

export default function ProductLeafList({ activeTabId }: Props) {
  const leaves = getLeavesForTab(activeTabId);
  return (
    <motion.ul
      key={activeTabId}
      role="tabpanel"
      id={`product-tabpanel-${activeTabId}`}
      aria-labelledby={`product-tab-${activeTabId}`}
      variants={tabSwitchVariants}
      initial="enter"
      animate="active"
      exit="exit"
      className="flex flex-col gap-2.5"
    >
      {leaves.map((leaf) => (
        <li key={leaf.slug}>
          <a
            href={`/catalog/${leaf.slug}/`}
            data-product-leaf={leaf.slug}
            className="group inline-flex items-center text-[13px] font-medium leading-[18px] text-ink transition-transform duration-fast hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            <span className="relative">
              {leaf.name}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-fast group-hover:scale-x-100"
                aria-hidden="true"
              />
            </span>
          </a>
        </li>
      ))}
    </motion.ul>
  );
}
