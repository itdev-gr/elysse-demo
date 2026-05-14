// recon/scripts/check-links.ts
import { chromium, type Page } from 'playwright';

const START = process.env.START ?? 'http://localhost:4321/';
const origin = new URL(START).origin;

interface Hit { from: string; to: string; status: number; }
const visited = new Set<string>();
const queue: { url: string; from: string }[] = [{ url: START, from: '(start)' }];
const broken: Hit[] = [];
const checked: Hit[] = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });

async function probe(page: Page, url: string, from: string) {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
  const status = resp?.status() ?? -1;
  if (!resp || status >= 400) {
    broken.push({ from, to: url, status });
    return [];
  }
  checked.push({ from, to: url, status });
  const links = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).map(a => a.href));
  return links;
}

while (queue.length) {
  const { url, from } = queue.shift()!;
  if (visited.has(url)) continue;
  visited.add(url);
  const page = await ctx.newPage();
  const links = await probe(page, url, from);
  await page.close();
  for (const l of links) {
    let u: URL;
    try { u = new URL(l); } catch { continue; }
    if (u.origin !== origin) continue;
    // Skip non-HTML same-origin assets
    if (u.pathname.match(/\.(pdf|jpg|jpeg|png|webp|svg|gif|mp4|zip|css|js|ico|xml|woff2?)$/i)) continue;
    const norm = u.origin + u.pathname;
    if (!visited.has(norm)) queue.push({ url: norm, from: url });
  }
}

await browser.close();

console.log(`Crawled ${visited.size} pages, ${checked.length} OK, ${broken.length} broken.`);
for (const b of broken) console.log(`  ✗ ${b.status} ${b.to}  (from ${b.from})`);
process.exit(broken.length ? 1 : 0);
