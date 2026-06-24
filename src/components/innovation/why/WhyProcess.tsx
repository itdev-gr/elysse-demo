'use client';
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from 'motion/react';
import { i18nAttr } from '../../../lib/i18n';

/**
 * "Our four-step process" — visually matches the existing
 * `src/components/innovation/ProcessIcons.astro` card style
 * (bordered cards, brand step label, icon, heavy title, hover lift)
 * and layers a scroll-linked brand-500 progress line on top.
 *
 * The progress fill (`scaleX`) is driven by `useScroll` + `useTransform`
 * — Disney's slow-in/slow-out (the clamp at both ends) and arc (the
 * horizontal sweep matches the eye's natural reading path).
 */

interface Step {
  step: number;
  title: string;
  image: string;
  alt: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  items: Step[];
}

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 22 },
  },
};

const grid: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export default function WhyProcess({ eyebrow = 'Process', heading, items }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  // Re-apply the language swap once this island has mounted/rendered, so it
  // shows Greek on first load when a non-English language is stored.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [items]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 30%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} data-testid="why-process" className="bg-surface-alt">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-20 md:py-28">
        <header className="max-w-3xl mb-12 md:mb-16">
          <p data-i18n={i18nAttr(eyebrow)} className="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">{eyebrow}</p>
          <h2 data-i18n={i18nAttr(heading)} className="font-display font-heavy leading-[1.02] tracking-tight text-ink" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
            {heading}
          </h2>
        </header>

        {/* Scroll progress track — sits above the cards */}
        <div className="relative mb-6 md:mb-10 h-px w-full bg-ink/10">
          <motion.div
            aria-hidden="true"
            data-testid="why-process-progress"
            className="absolute inset-y-0 left-0 right-0 bg-brand-500 origin-left"
            style={{ scaleX: reduce ? 1 : lineScale }}
          />
        </div>

        <motion.ol
          variants={reduce ? undefined : grid}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 list-none"
        >
          {items.map((it) => (
            <motion.li
              key={it.step}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="group relative flex flex-col items-center text-center p-6 bg-surface border border-ink/10 transition-all duration-200 ease-out hover:border-brand-500/40 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
            >
              <span className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-widest text-brand-500/70">
                Step {String(it.step).padStart(2, '0')}
              </span>
              <img
                src={it.image}
                alt={it.alt}
                loading="lazy"
                width={160}
                height={160}
                className="w-24 h-24 md:w-28 md:h-28 mt-4 object-contain transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <h3 data-i18n={i18nAttr(it.title)} className="mt-4 text-base md:text-lg font-heavy text-ink">{it.title}</h3>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
