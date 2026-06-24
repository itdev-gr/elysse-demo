// Heuristic Greek-translation coverage report (advisory, non-blocking).
// Scans in-scope .astro pages/components for text-bearing elements that lack a
// data-i18n attribute. Over-reports (matches code-like text); use as a checklist.
// Products/catalog are intentionally excluded (translated separately).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/pages', 'src/components'];
const EXCLUDE = ['src/pages/products', 'src/pages/catalog', 'src/components/catalog'];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (EXCLUDE.some((x) => p.startsWith(x))) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.astro')) out.push(p);
  }
  return out;
}

let flagged = 0;
const files = ROOTS.flatMap((r) => walk(r));
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  // Heading/paragraph/button/link/li/span with literal text but no data-i18n.
  const matches = src.match(
    /<(h[1-6]|p|button|a|li)\b(?![^>]*data-i18n)[^>]*>\s*[A-Za-z][^<>{]{2,}</g,
  ) || [];
  if (matches.length) {
    console.log(`${f}: ${matches.length} untranslated candidate(s)`);
    flagged += matches.length;
  }
}
console.log(`\nScanned ${files.length} .astro files. Total untranslated candidates: ${flagged}`);
console.log('(Heuristic — review each; data-driven text rendered via shared components is handled centrally.)');
