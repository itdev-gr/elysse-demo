import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const ORIGIN = 'https://www.sonanbunkers.com';
const MAX_PAGES = 200;

type PageRecord = {
  url: string;
  status: number;
  title: string;
  links: string[];
  navLinks: string[];
  footerLinks: string[];
  forms: { action: string; method: string; fields: string[] }[];
};

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // tsx/esbuild injects a `__name` helper for keepNames; ensure it exists in page context.
  await ctx.addInitScript(() => { (globalThis as any).__name = (fn: any) => fn; });
  const queue = new Set<string>([ORIGIN + '/']);
  const visited = new Map<string, PageRecord>();

  while (queue.size && visited.size < MAX_PAGES) {
    const url = queue.values().next().value!;
    queue.delete(url);
    if (visited.has(url)) continue;
    const page = await ctx.newPage();
    let status = 0;
    page.on('response', (r) => { if (r.url() === url) status = r.status(); });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    } catch (e) {
      visited.set(url, { url, status: -1, title: '', links: [], navLinks: [], footerLinks: [], forms: [] });
      await page.close();
      continue;
    }

    const data = await page.evaluate(() => {
      const abs = (h: string | null) => h ? new URL(h, location.href).href : null;
      const allLinks = [...document.querySelectorAll('a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const navLinks = [...document.querySelectorAll('header a[href], nav a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const footerLinks = [...document.querySelectorAll('footer a[href]')]
        .map(a => abs(a.getAttribute('href')))
        .filter((x): x is string => !!x);
      const forms = [...document.querySelectorAll('form')].map(f => ({
        action: f.action || location.href,
        method: (f.method || 'get').toLowerCase(),
        fields: [...f.querySelectorAll('input,select,textarea')]
          .map(el => (el as HTMLInputElement).name || (el as HTMLInputElement).id)
          .filter(Boolean),
      }));
      return { title: document.title, links: allLinks, navLinks, footerLinks, forms };
    });

    visited.set(url, { url, status, ...data });

    for (const link of data.links) {
      try {
        const u = new URL(link);
        if (u.origin !== ORIGIN) continue;
        if (u.pathname.match(/\.(pdf|jpg|jpeg|png|webp|svg|gif|mp4|zip|css|js)$/i)) continue;
        const norm = u.origin + u.pathname + (u.search || '');
        if (!visited.has(norm) && !queue.has(norm)) queue.add(norm);
      } catch {}
    }
    await page.close();
    console.log(`[${visited.size}/${MAX_PAGES}] ${url} → ${status} (${data.links.length} links)`);
  }

  const out = resolve('output/pages.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify([...visited.values()], null, 2));
  await browser.close();
  console.log(`Wrote ${out}`);
}

main();
