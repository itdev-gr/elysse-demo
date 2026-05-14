import { animate } from 'motion';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (reduce) {
  for (const el of els) el.style.opacity = '1';
} else {
  // Hide initially via inline style so there's no FOUC before the observer fires.
  for (const el of els) {
    el.style.opacity = '0';
    el.style.willChange = 'transform, opacity';
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay ?? '0') / 1000;
        // Astro renders boolean attributes as `data-reveal="true"`. Treat any
        // truthy non-directional value the same as the default 'up' direction.
        const rawDir = el.dataset.reveal;
        const direction =
          rawDir === 'right'
            ? 'right'
            : rawDir === 'left'
              ? 'left'
              : rawDir === 'none'
                ? 'none'
                : 'up';
        const from =
          direction === 'up'
            ? { y: 16, x: 0 }
            : direction === 'right'
              ? { y: 0, x: -16 }
              : direction === 'left'
                ? { y: 0, x: 16 }
                : { y: 0, x: 0 };
        animate(
          el,
          {
            opacity: [0, 1],
            transform: [
              `translate3d(${from.x}px, ${from.y}px, 0)`,
              'translate3d(0,0,0)',
            ],
          },
          { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        ).finished.then(() => {
          el.style.willChange = '';
        });
        observer.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of els) observer.observe(el);
}
