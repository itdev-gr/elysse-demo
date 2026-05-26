import { animate } from 'motion';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = Array.from(document.querySelectorAll<HTMLElement>('[data-counter]'));

/**
 * Parse a stat-tile display value into an animatable target + suffix.
 *
 * - `"65"`     → { target: 65, suffix: "" }
 * - `"5000+"`  → { target: 5000, suffix: "+" }
 * - `"1979"`   → null (year-shaped, render statically)
 * - `"5–315mm"`→ null (non-numeric, render statically)
 */
function parseTarget(raw: string): { target: number; suffix: string } | null {
  const m = raw.match(/^(\d+)(\+?)$/);
  if (!m) return null;
  const target = parseInt(m[1], 10);
  if (target === 0) return null;
  if (target >= 1900 && target <= 2100) return null; // year-shaped
  return { target, suffix: m[2] };
}

for (const el of els) {
  const raw = el.dataset.counter ?? el.textContent ?? '';
  const parsed = parseTarget(raw);
  // Non-animatable (year, range, empty) — leave the static text alone.
  if (!parsed) continue;
  // Reduced motion — write final value immediately; never observe.
  if (reduce) {
    el.textContent = parsed.target + parsed.suffix;
    continue;
  }
  // Animatable: start at 0, observe, count up when in view.
  el.textContent = '0' + parsed.suffix;
}

if (!reduce) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const parsed = parseTarget(el.dataset.counter ?? '');
        if (!parsed) {
          observer.unobserve(el);
          continue;
        }
        animate(0, parsed.target, {
          duration: 1.5,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (v: number) => {
            el.textContent = Math.round(v) + parsed.suffix;
          },
        });
        observer.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of els) {
    if (parseTarget(el.dataset.counter ?? '')) observer.observe(el);
  }
}
