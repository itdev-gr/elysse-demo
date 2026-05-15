/**
 * Wheel-controlled smooth scroll for the homepage's full-page snap layout.
 *
 * Replaces the browser's native scroll-snap animation (which is inconsistent
 * across OS / browser, especially under trackpad inertia) with a deterministic
 * one-section-per-deliberate-wheel-event smooth scroll using
 * scrollIntoView({ behavior: 'smooth' }).
 *
 * CSS scroll-snap (mandatory + scroll-padding-top) stays in place as a
 * fallback for keyboard nav, programmatic scrolls, and any wheel events this
 * handler doesn't intercept.
 */

const SCROLL_LOCK_MS = 900;  // ~ matches the browser's smooth-scroll duration for one viewport
const WHEEL_THRESHOLD = 16;  // ignore tiny trackpad noise

function init(): () => void {
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-snap]'));
  if (panels.length < 2) return () => {};

  let locked = false;
  let lockTimer: number | undefined;
  let lastDirection: 1 | -1 | 0 = 0;
  let lastWheelAt = 0;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const currentPanelIndex = (): number => {
    // Panels are full-bleed (scroll-mt-0), so the current panel is whichever
    // has its top closest to the viewport top.
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < panels.length; i++) {
      const top = panels[i].getBoundingClientRect().top;
      const dist = Math.abs(top);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  };

  const scrollToPanel = (i: number) => {
    const target = panels[i];
    if (!target) return;
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
  };

  const onWheel = (e: WheelEvent) => {
    // Don't fight modifier-key scrolls (zoom, horizontal pan)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    // CRITICAL: always preventDefault on the snap page. If we let the
    // browser scroll natively for sub-threshold events (e.g. the small
    // trackpad inertia tail), those tiny scrolls happen *during* our
    // scrollIntoView smooth animation. The result is a 1–5px oscillation
    // around the target snap point — the visible flicker.
    e.preventDefault();

    if (locked) return;
    if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;

    const now = performance.now();
    const sinceLast = now - lastWheelAt;
    lastWheelAt = now;

    // If a fresh wheel direction matches the previous one within the lock window,
    // it's the tail of inertia — swallow it (already prevented; just return).
    const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;
    if (sinceLast < 80 && direction === lastDirection) return;

    const current = currentPanelIndex();
    const next = direction === 1
      ? Math.min(current + 1, panels.length - 1)
      : Math.max(current - 1, 0);
    if (next === current) return;

    locked = true;
    lastDirection = direction;
    scrollToPanel(next);

    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => {
      locked = false;
      lastDirection = 0;
    }, SCROLL_LOCK_MS);
  };

  // Keyboard: PgDn/PgUp/Space/ArrowDown/ArrowUp — let them snap one panel
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, 1 | -1> = {
      ArrowDown: 1, PageDown: 1, ' ': 1,
      ArrowUp: -1, PageUp: -1,
    };
    const dir = map[e.key];
    if (!dir) return;
    // Don't hijack if the user is typing in a field
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
    if (locked) { e.preventDefault(); return; }

    e.preventDefault();
    const current = currentPanelIndex();
    const next = dir === 1
      ? Math.min(current + 1, panels.length - 1)
      : Math.max(current - 1, 0);
    if (next === current) return;

    locked = true;
    scrollToPanel(next);
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => { locked = false; }, SCROLL_LOCK_MS);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);

  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.clearTimeout(lockTimer);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
