/**
 * One-off asset importer for the insights detail pages (innovation articles,
 * exhibitions, media, ebooks) plus the environmental-report PDF.
 * Mirrors elysee.com.cy assets into public/ at the exact paths referenced by
 * src/data/site-content.ts.
 * Idempotent — re-running skips files that already exist on disk.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const BASE = 'https://elysee.com.cy';
const OUT = 'public';

const groups = [
  ['images/innovation/insights/details', [
    ['/image/large/249/1-g0sXr.jpg', 'industry-40-1.jpg'],
    ['/image/large/249/2-bjNk5.jpg', 'industry-40-2.jpg'],
    ['/image/original/249/overmolding.jpg', 'overmolding-concept.jpg'],
    ['/portal-img/default/249/micro-injection-molding.jpg', 'micro-injection-molding.jpg'],
    ['/portal-img/default/249/gas-assisted-injection.jpg', 'gas-assisted-injection.jpg'],
  ]],
  ['images/insights/exhibitions', [
    ['/image/large/249/1-VHlpE.png', 'eima-2026.png'],
    ['/image/original/249/eima-signature.JPG', 'eima-2022-signature.jpg'],
  ]],
  ['images/insights/media', [
    ['/portal-img/video_thumb_img/2/the3366-vtNEn.JPG', 'elysee-40-year-anniversary-event.jpg'],
    ['/portal-img/video_thumb_img/1/group-5589.jpg', 'european-business-award-2014.jpg'],
    ['/portal-img/video_thumb_img/1/outside-factory-ghSXb.jpg', 'cybc-documentary-innovation-in-cyprus.jpg'],
  ]],
  ['images/insights/ebooks', [
    ['/portal-img/default/249/green-elysee-2021-report-eksofyllo.JPG', 'green-elysee-yearly-report-2021.jpg'],
  ]],
  ['files/ebooks', [
    ['/uploads/originals/249/environmental-report-2020.pdf', 'environmental-report-2020.pdf'],
  ]],
];

// The environmental-report-2020 cover has no hosted URL on the live site; the
// page embeds it as an inline base64 PNG. Extract and decode it from the HTML.
const INLINE_COVER = {
  page: '/environmental-report-2020',
  dest: join(OUT, 'images/insights/ebooks/environmental-report-2020.png'),
};

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

let total = 0;
let saved = 0;
let skipped = 0;
let failed = 0;

for (const [bucket, files] of groups) {
  await mkdir(join(OUT, bucket), { recursive: true });
  for (const [src, dest] of files) {
    total += 1;
    const out = join(OUT, bucket, dest);
    if (await exists(out)) { skipped += 1; console.log('skip', out); continue; }
    const url = BASE + src;
    try {
      const res = await fetch(url);
      if (!res.ok) { failed += 1; console.error('FAIL', url, res.status); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(out, buf);
      saved += 1;
      console.log('saved', out, buf.length, 'bytes');
    } catch (err) {
      failed += 1;
      console.error('FAIL', url, err?.message ?? err);
    }
  }
}

// Inline base64 cover extraction.
total += 1;
if (await exists(INLINE_COVER.dest)) {
  skipped += 1;
  console.log('skip', INLINE_COVER.dest);
} else {
  const url = BASE + INLINE_COVER.page;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const match = html.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
    if (!match) throw new Error('no inline base64 PNG found in page HTML');
    await mkdir(dirname(INLINE_COVER.dest), { recursive: true });
    const buf = Buffer.from(match[1], 'base64');
    await writeFile(INLINE_COVER.dest, buf);
    saved += 1;
    console.log('saved', INLINE_COVER.dest, buf.length, 'bytes (inline base64)');
  } catch (err) {
    failed += 1;
    console.error('FAIL', url, err?.message ?? err);
  }
}

console.log(`\nSummary: ${saved} saved, ${skipped} skipped, ${failed} failed (of ${total}).`);
if (failed > 0) process.exit(1);
