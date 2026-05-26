import { motion } from 'motion/react';
import { productPillTabs, type ProductPillId } from '../../data/product-megamenu';
import { tabSwitchVariants } from './megaAnim';
import MegaThumb from './MegaThumb';

type Props = { activeTabId: ProductPillId };

export default function ProductContextImage({ activeTabId }: Props) {
  const tab = productPillTabs.find((t) => t.id === activeTabId);
  if (!tab) return null;
  return (
    <motion.div
      key={activeTabId}
      variants={tabSwitchVariants}
      initial="enter"
      animate="active"
      exit="exit"
      className="relative aspect-[16/10] w-full min-h-[224px] overflow-hidden rounded-[16px] bg-ink/5"
    >
      <img
        src={tab.imageSrc}
        alt={tab.imageAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 -z-10">
        <MegaThumb label={tab.label} icon="dot" />
      </div>
    </motion.div>
  );
}
