/**
 * One-off asset importer for the innovation pillar.
 * Mirrors elysee.com.cy CDN images into public/images/innovation/<bucket>/.
 * Idempotent — re-running skips files that already exist on disk.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = 'https://elysee.com.cy';
const OUT = 'public/images/innovation';

const groups = [
  ['why', [
    ['/portal-img/default/249/innovation-in-business.png', 'innovation-in-business.png'],
    ['/portal-img/default/249/disruptive.png', 'disruptive.png'],
    ['/portal-img/default/249/sustaining.png', 'sustaining.png'],
    ['/portal-img/default/249/clarity-png.png', 'clarify.png'],
    ['/portal-img/default/249/ideate-png.png', 'ideate.png'],
    ['/portal-img/default/249/develop-png.png', 'develop.png'],
    ['/portal-img/default/249/execute-png.png', 'execute.png'],
  ]],
  ['rd', [
    ['/portal-img/default/249/product-design-and-development.jpg', 'product-design-and-development.jpg'],
    ['/portal-img/default/249/market-research.jpg', 'market-research.jpg'],
    ['/portal-img/default/249/project-management.jpg', 'project-management.jpg'],
    ['/portal-img/default/249/ip-procedure-patent-attorneys.jpg', 'ip-procedure-patent-attorneys.jpg'],
    ['/portal-img/default/249/feasibility-studies.jpg', 'feasibility-studies.jpg'],
    ['/portal-img/default/249/concept-generation.jpg', 'concept-generation.jpg'],
    ['/portal-img/default/249/concept-evaluation.jpg', 'concept-evaluation.jpg'],
    ['/portal-img/default/249/concept-development.jpg', 'concept-development.jpg'],
    ['/portal-img/default/249/proof-of-concept.jpg', 'proof-of-concept.jpg'],
    ['/portal-img/default/249/prototyping.jpg', 'prototyping.jpg'],
    ['/portal-img/default/249/advanced-metrology-systems.jpg', 'advanced-metrology-systems.jpg'],
    ['/portal-img/default/249/verification-validation-through-testing.jpg', 'verification-validation-through-testing.jpg'],
  ]],
  ['projects', [
    ['/portal-img/default/249/untitled-design-qRDGK.png', 'innova.png'],
    ['/portal-img/default/249/banner-plantngreen-logo.png', 'agrecomposites.png'],
    ['/portal-img/default/249/plantngreen-logo2.png', 'plantngreen.png'],
  ]],
  ['insights', [
    ['/portal-img/news_thumb_img/249/image-1.png', 'industry-40.png'],
    ['/portal-img/news_thumb_img/249/banner-success-stories.jpg', 'success-stories.jpg'],
    ['/portal-img/news_thumb_img/249/banner-overmolding-EV9dp.jpg', 'overmolding.jpg'],
    ['/portal-img/news_thumb_img/249/banner-micro-injection.jpg', 'micro-injection.jpg'],
    ['/portal-img/news_thumb_img/249/banner-gas-assisted-injection.jpg', 'gas-assisted.jpg'],
    ['/portal-img/news_thumb_img/249/banner-ai-processes.jpg', 'ai-processes.jpg'],
  ]],
  ['partners', [
    ['/portal-img/originals/249/university-of-cyprus.png', 'university-of-cyprus.png'],
    ['/portal-img/originals/249/university-of-technology.png', 'cyprus-university-of-technology.png'],
    ['/portal-img/originals/249/frederick-PayW5.png', 'frederick-university.png'],
    ['/portal-img/originals/249/frederick-research.png', 'frederick-research-center.png'],
    ['/portal-img/originals/249/department-of-enviroment.png', 'department-of-environment.png'],
    ['/portal-img/originals/249/cys.png', 'cys.png'],
    ['/portal-img/originals/249/oeb.png', 'oeb.png'],
    ['/portal-img/originals/249/agriculture-research-institute.png', 'agriculture-research-institute.png'],
    ['/portal-img/originals/249/daswn.png', 'department-of-forests.png'],
    ['/portal-img/originals/249/waterboard-nicosia.png', 'water-board-of-nicosia.png'],
    ['/portal-img/originals/249/kios-logo.png', 'kios.png'],
    ['/portal-img/originals/249/cyric.jpg', 'cyric.jpg'],
    ['/portal-img/originals/249/simlead.png', 'simlead.png'],
    ['/portal-img/originals/249/cne-logo-iQVHS.png', 'cne.png'],
    ['/portal-img/originals/249/serg.png', 'serg.png'],
    ['/portal-img/originals/249/amadema.png', 'amadema.png'],
    ['/portal-img/originals/249/ktv-green-logo-Hioqe.png', 'ktv-green-enterprises.png'],
    ['/portal-img/originals/249/agrotech-innovations-logo-aTEoo.png', 'agrotech-innovations.png'],
  ]],
  ['innovate', [
    ['/portal-img/default/249/gemini-generated-image-nz104tnz104tnz10.png', 'hero-illustration.png'],
  ]],
];

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

console.log(`\nSummary: ${saved} saved, ${skipped} skipped, ${failed} failed (of ${total}).`);
if (failed > 0) process.exit(1);
