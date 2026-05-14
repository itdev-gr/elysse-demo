import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import fetch from 'node-fetch';

const ORIGIN = 'https://www.sonanbunkers.com';
const pages: { url: string }[] = JSON.parse(readFileSync('output/pages.json', 'utf8'));

type Asset = { url: string; type: string; bytes: number; usedOn: string[] };
const assets = new Map<string, Asset>();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { (globalThis as any).__name = (fn: unknown) => fn; });

for (const { url } of pages) {
  const page = await ctx.newPage();
  const seen: { url: string; type: string; bytes: number }[] = [];
  page.on('response', async (r) => {
    const ct = r.headers()['content-type'] || '';
    if (!ct.match(/^(image|font|video|audio)\//) && !r.url().match(/\.(svg|woff2?|ttf|otf|mp4|webm)(\?|$)/i)) return;
    try {
      const buf = await r.body();
      seen.push({ url: r.url(), type: ct.split(';')[0], bytes: buf.length });
    } catch {}
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
  } catch {}
  for (const a of seen) {
    if (!assets.has(a.url)) assets.set(a.url, { ...a, usedOn: [url] });
    else assets.get(a.url)!.usedOn.push(url);
  }
  await page.close();
  console.log(`inventoried ${url} (+${seen.length} assets, total ${assets.size})`);
}
await browser.close();

const outPath = resolve('output/assets.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify([...assets.values()], null, 2));
console.log(`Wrote ${outPath} (${assets.size} unique assets)`);

// Download same-origin assets
let downloaded = 0;
let skipped3p = 0;
for (const a of assets.values()) {
  if (!a.url.startsWith(ORIGIN)) { skipped3p++; continue; }
  const path = new URL(a.url).pathname;
  const dest = resolve('assets', path.replace(/^\//, ''));
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(a.url);
    if (!res.ok || !res.body) continue;
    await pipeline(res.body as any, createWriteStream(dest));
    downloaded++;
  } catch (e) {
    console.warn(`download fail: ${a.url}: ${(e as Error).message}`);
  }
}
console.log(`Downloaded ${downloaded} same-origin assets; skipped ${skipped3p} 3rd-party`);
