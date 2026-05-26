import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

type Props = {
  /** Display string like "1979", "65+", "1,000+", "5–315mm". Non-numeric parts are preserved as prefix/suffix. */
  value: string;
  /** Animation duration in ms. */
  duration?: number;
};

function parse(value: string): { num: number; prefix: string; suffix: string } {
  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return { num: 0, prefix: '', suffix: value };
  const numeric = Number(m[2].replace(/,/g, ''));
  return { num: Number.isFinite(numeric) ? numeric : 0, prefix: m[1] || '', suffix: m[3] || '' };
}

export default function MotionCounter({ value, duration = 1100 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const { num, prefix, suffix } = parse(value);
  const [display, setDisplay] = useState(reduce ? num : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce || num === 0) {
      setDisplay(num);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(num * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, num, duration, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
