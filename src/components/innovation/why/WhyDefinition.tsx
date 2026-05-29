'use client';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { splitIntoLines } from './splitLines';

interface Props {
  /** Section eyebrow (e.g. "Definition"). */
  eyebrow?: string;
  /** Section heading (e.g. "What is innovation?"). */
  heading: string;
  /** The paragraph that gets line-by-line revealed. */
  body: string;
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const line: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] },
  },
};

export default function WhyDefinition({ eyebrow = 'Definition', heading, body }: Props) {
  const reduce = useReducedMotion();
  const lines = splitIntoLines(body);

  return (
    <section className="bg-surface-alt">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-20 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">{eyebrow}</p>
        <h2 className="font-display font-heavy leading-[1.02] tracking-tight text-ink mb-10 md:mb-14" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
          {heading}
        </h2>
        <motion.p
          variants={reduce ? undefined : container}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-ink leading-[1.45] max-w-4xl"
        >
          {lines.map((l, i) => (
            <motion.span key={i} variants={reduce ? undefined : line} className="block">
              {l}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </section>
  );
}
