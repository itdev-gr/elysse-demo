import type { Variants } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN  = [0.7, 0, 0.84, 0] as const;

export const panelVariants: Variants = {
  closed: { opacity: 0, y: -8, transition: { duration: 0.20, ease: EASE_IN } },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASE_OUT,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const cardVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: { opacity: 1, y: 0, transition: { duration: 0.40, ease: EASE_OUT } },
};

export const cardHover = { y: -3, transition: { duration: 0.20, ease: EASE_OUT } };
export const imageHover = { scale: 1.06, transition: { duration: 0.30, ease: EASE_OUT } };

export const drawerVariants: Variants = {
  closed: { x: '100%', transition: { duration: 0.32, ease: EASE_IN } },
  open: { x: 0, transition: { duration: 0.36, ease: EASE_OUT } },
};

export const backdropVariants: Variants = {
  closed: { opacity: 0, transition: { duration: 0.20 } },
  open: { opacity: 1, transition: { duration: 0.20 } },
};

export const accordionVariants: Variants = {
  closed: { height: 0, opacity: 0, transition: { duration: 0.24, ease: EASE_IN } },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } },
};

/**
 * Tab-switch cross-fade for the Products mega-panel middle + image columns.
 * Outgoing exits up-and-out, incoming enters up-and-in.
 */
export const tabSwitchVariants: Variants = {
  enter: { opacity: 0, y: 6 },
  active: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE_OUT, delay: 0.06 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.12, ease: EASE_IN },
  },
};

/** Spring used by the sliding pill indicator (shared `layoutId`). */
export const pillSpring = { type: 'spring', stiffness: 400, damping: 32 } as const;
