import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
// tsx/esbuild injects a `__name` helper for keepNames; ensure it exists in page context.
await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });
const page = await ctx.newPage();
await page.goto('https://www.sonanbunkers.com/', { waitUntil: 'networkidle', timeout: 60_000 });

const tokens = await page.evaluate(() => {
  const pick = (el: Element | null) => {
    if (!el) return null;
    const s = getComputedStyle(el as HTMLElement);
    return {
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      fontWeight: s.fontWeight,
      letterSpacing: s.letterSpacing,
      textTransform: s.textTransform,
      color: s.color,
      background: s.backgroundColor,
      borderRadius: s.borderRadius,
      boxShadow: s.boxShadow,
      padding: s.padding,
      margin: s.margin,
      transitionDuration: s.transitionDuration,
      transitionTimingFunction: s.transitionTimingFunction,
      transitionProperty: s.transitionProperty,
    };
  };
  const selectors: Record<string, string> = {
    body: 'body',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    a: 'a',
    button: 'button, .button, [class*="btn"]',
    primaryCta: 'a.btn-primary, .cta-primary, .button-primary, [class*="primary"][class*="btn"], [class*="primary"][class*="button"]',
    input: 'input:not([type="hidden"]), textarea, select',
    header: 'header, [class*="header"]',
  };
  const elements: Record<string, ReturnType<typeof pick>> = {};
  for (const [k, sel] of Object.entries(selectors)) elements[k] = pick(document.querySelector(sel));

  // Aggregate font families & colors across rendered visible elements
  const fontFreq = new Map<string, number>();
  const colorFreq = new Map<string, number>();
  const bgFreq = new Map<string, number>();
  const radiusFreq = new Map<string, number>();
  const shadowFreq = new Map<string, number>();
  const transitionDurationFreq = new Map<string, number>();
  const transitionTimingFreq = new Map<string, number>();
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
    if (!el.offsetParent && el.tagName !== 'BODY') continue;
    const s = getComputedStyle(el);
    fontFreq.set(s.fontFamily, (fontFreq.get(s.fontFamily) ?? 0) + 1);
    colorFreq.set(s.color, (colorFreq.get(s.color) ?? 0) + 1);
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgFreq.set(s.backgroundColor, (bgFreq.get(s.backgroundColor) ?? 0) + 1);
    }
    if (s.borderRadius !== '0px') radiusFreq.set(s.borderRadius, (radiusFreq.get(s.borderRadius) ?? 0) + 1);
    if (s.boxShadow !== 'none') shadowFreq.set(s.boxShadow, (shadowFreq.get(s.boxShadow) ?? 0) + 1);
    if (s.transitionDuration && s.transitionDuration !== '0s') {
      transitionDurationFreq.set(s.transitionDuration, (transitionDurationFreq.get(s.transitionDuration) ?? 0) + 1);
    }
    if (s.transitionTimingFunction && s.transitionTimingFunction !== 'ease') {
      transitionTimingFreq.set(s.transitionTimingFunction, (transitionTimingFreq.get(s.transitionTimingFunction) ?? 0) + 1);
    }
  }
  const topN = (m: Map<string, number>, n = 20) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([v, c]) => ({ value: v, count: c }));

  // :root custom properties
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVars: Record<string, string> = {};
  for (let i = 0; i < rootStyle.length; i++) {
    const p = rootStyle.item(i);
    if (p.startsWith('--')) cssVars[p] = rootStyle.getPropertyValue(p).trim();
  }

  // @font-face declarations (CORS-safe ones only)
  const fontFaces: string[] = [];
  const sheetErrors: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules as any as CSSRule[])) {
        if (rule.constructor.name === 'CSSFontFaceRule') fontFaces.push(rule.cssText);
      }
    } catch (e) {
      sheetErrors.push((sheet.href ?? '<inline>') + ': ' + (e as Error).message);
    }
  }

  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null;
  const headerEl = document.querySelector('header');
  const headerHeight = headerEl ? (headerEl as HTMLElement).offsetHeight : null;

  // widest direct child of body — proxy for container max-width
  let widestChild = 0;
  for (const child of Array.from(document.body.children) as HTMLElement[]) {
    if (child.offsetWidth > widestChild) widestChild = child.offsetWidth;
  }

  // bonus: also walk a level deeper to find the typical content container width
  let contentContainerWidth = 0;
  const containerSelectors = ['main', '[class*="container"]', '[class*="wrapper"]', '[class*="content"]'];
  for (const sel of containerSelectors) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (!el.offsetParent) continue;
      if (el.offsetWidth > contentContainerWidth && el.offsetWidth < document.body.offsetWidth) {
        contentContainerWidth = el.offsetWidth;
      }
    }
  }

  return {
    elements,
    aggregate: {
      fontFamilies: topN(fontFreq),
      colors: topN(colorFreq),
      backgrounds: topN(bgFreq),
      borderRadii: topN(radiusFreq, 10),
      boxShadows: topN(shadowFreq, 10),
      transitionDurations: topN(transitionDurationFreq, 10),
      transitionTimingFunctions: topN(transitionTimingFreq, 10),
    },
    cssVars,
    fontFaces,
    sheetErrors,
    viewport,
    headerHeight,
    widestChild,
    contentContainerWidth,
  };
});

await browser.close();
const outPath = resolve('output/tokens.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(tokens, null, 2));
console.log(`Wrote ${outPath}`);
