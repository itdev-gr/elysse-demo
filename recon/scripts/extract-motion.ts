import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const pages: { url: string }[] = JSON.parse(readFileSync('output/pages.json', 'utf8'));
const SAMPLE_URLS = [
  'https://www.sonanbunkers.com/',
  'https://www.sonanbunkers.com/about-us/',
  'https://www.sonanbunkers.com/our-services/fuel-products/',
  'https://www.sonanbunkers.com/contact/',
  'https://www.sonanbunkers.com/press-room/news/',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });

const out: any[] = [];
for (const url of SAMPLE_URLS) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch (e) {
    console.warn(`failed to load ${url}: ${(e as Error).message}`);
    await page.close();
    continue;
  }
  const data = await page.evaluate(() => {
    const markers = ['data-aos', 'data-scroll', 'data-framer-name', 'data-gsap', 'data-animate', 'data-anim', 'data-reveal', 'data-parallax'];
    const animated: any[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      const hasTransition = cs.transitionProperty !== 'none' && cs.transitionProperty !== 'all 0s ease 0s' && cs.transitionDuration !== '0s';
      const hasAnimation  = cs.animationName !== 'none';
      const markerHits    = markers.filter(m => (el as Element).hasAttribute(m));
      if (hasTransition || hasAnimation || markerHits.length) {
        animated.push({
          tag: el.tagName.toLowerCase(),
          cls: ((el as HTMLElement).className?.toString?.() ?? '').slice(0, 120),
          id: el.id || undefined,
          markers: Object.fromEntries(markerHits.map(m => [m, el.getAttribute(m)])),
          transition: hasTransition ? {
            property: cs.transitionProperty,
            duration: cs.transitionDuration,
            timing:   cs.transitionTimingFunction,
            delay:    cs.transitionDelay,
          } : null,
          animation: hasAnimation ? {
            name:     cs.animationName,
            duration: cs.animationDuration,
            timing:   cs.animationTimingFunction,
            delay:    cs.animationDelay,
            iter:     cs.animationIterationCount,
          } : null,
        });
      }
    });
    const keyframes: any[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules as any as CSSRule[])) {
          if (rule.constructor.name === 'CSSKeyframesRule') keyframes.push({ name: (rule as any).name, cssText: rule.cssText });
        }
      } catch { /* CORS-blocked */ }
    }

    // Scripts referenced — useful for identifying animation libraries
    const scripts = Array.from(document.scripts).map(s => s.src).filter(Boolean);

    return { animated: animated.slice(0, 300), keyframes, scripts };
  });
  out.push({ url, ...data });
  console.log(`extracted ${url} — ${data.animated.length} animated elements, ${data.keyframes.length} keyframes, ${data.scripts.length} scripts`);
  await page.close();
}
await browser.close();
writeFileSync('output/motion.json', JSON.stringify(out, null, 2));
console.log('Wrote output/motion.json');
