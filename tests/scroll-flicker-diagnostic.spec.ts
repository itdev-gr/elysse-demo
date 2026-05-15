import { test, expect } from '@playwright/test';

/**
 * Diagnostic: simulates a trackpad-like burst of wheel events on the homepage
 * and records every scrollY value. A monotonic-decreasing-then-increasing
 * (or vice versa) pattern indicates the JS smooth-scroll is being fought by
 * either native inertia scroll or CSS scroll-snap, producing a "yank back"
 * = visible flicker.
 *
 * Run: pnpm exec playwright test tests/scroll-flicker-diagnostic.spec.ts --reporter=line
 */
test('diagnostic: scroll positions during wheel burst', async ({ page }) => {
  await page.goto('http://localhost:4321/', { waitUntil: 'load' });

  // Listen for scroll events on the page and remember every scrollY.
  await page.evaluate(() => {
    (window as any).__positions = [{ t: 0, y: window.scrollY }];
    const start = performance.now();
    window.addEventListener('scroll', () => {
      (window as any).__positions.push({
        t: Math.round(performance.now() - start),
        y: window.scrollY,
      });
    });
  });

  // Move the mouse over the page so wheel events target the document.
  await page.mouse.move(720, 400);

  // Simulate a trackpad burst: 12 small-medium wheel events in 600ms.
  // This mirrors macOS inertia: a few big events at the start, then small
  // tail events.
  const deltas = [80, 50, 30, 20, 15, 10, 8, 6, 4, 3, 2, 1];
  for (const d of deltas) {
    await page.mouse.wheel(0, d);
    await page.waitForTimeout(50);
  }

  // Let any in-flight smooth-scroll finish.
  await page.waitForTimeout(1500);

  const positions: { t: number; y: number }[] = await page.evaluate(
    () => (window as any).__positions,
  );

  // Catalogue every reversal — any y decrease after the running max counts
  // (regardless of magnitude; even 1–2px reversals can flicker if they
  // happen in tight succession).
  let maxY = 0;
  const reversals: { from: number; to: number; t: number }[] = [];
  for (const p of positions) {
    if (p.y >= maxY) maxY = p.y;
    else reversals.push({ from: maxY, to: p.y, t: p.t });
  }

  console.log('\n========== SCROLL FLICKER DIAGNOSTIC ==========');
  console.log(`total scroll events: ${positions.length}`);
  console.log(`final scrollY:       ${positions.at(-1)?.y}`);
  console.log(`max scrollY:         ${maxY}`);
  console.log(`reversal events:     ${reversals.length}`);
  console.log('--- last 20 raw events (t in ms, y in px) ---');
  for (const p of positions.slice(-20)) {
    console.log(`  @${p.t.toString().padStart(5)}ms  y=${p.y}`);
  }
  if (reversals.length) {
    console.log('\n--- reversals (page scrolled BACK after going further) ---');
    for (const y of reversals.slice(0, 15)) {
      console.log(`  @${y.t.toString().padStart(5)}ms: ${y.from} → ${y.to}  (Δ ${y.to - y.from})`);
    }
  }
  console.log('===============================================\n');

  // Regression guard: a healthy snap-page scroll is monotonic for the
  // primary scrollY trajectory. Any reversal of >0 px means the JS
  // smooth-scroll is fighting native inertia or CSS proximity snap.
  expect(
    reversals,
    `Detected ${reversals.length} scroll reversals — JS smooth-scroll is being fought by another scroll source.`,
  ).toEqual([]);
});
