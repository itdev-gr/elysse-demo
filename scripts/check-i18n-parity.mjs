// Advisory i18n parity report. Regex-extracts top-level keys from each
// dictionary section file and reports, per language, how many EL keys are
// still missing and whether any orphan keys exist. Authoritative parity is
// enforced by src/lib/i18n.test.ts. Usage:
//   node scripts/check-i18n-parity.mjs                # whole tree
//   node scripts/check-i18n-parity.mjs --section home # one section file
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'src/data/i18n';
const LANGS = ['de', 'es', 'fr'];
// First quoted token at 2-space indent, immediately followed by a colon = a key.
const KEY_SRC = "^  (['\"`])((?:\\\\.|(?!\\1).)*)\\1\\s*:";

function keysFromFile(path) {
  const src = readFileSync(path, 'utf8');
  const re = new RegExp(KEY_SRC, 'gm');
  const keys = new Set();
  let m;
  while ((m = re.exec(src)) !== null) keys.add(m[2]);
  return keys;
}

function keysForLang(lang, section) {
  if (section) {
    try { return keysFromFile(join(BASE, lang, `${section}.ts`)); }
    catch { return new Set(); }
  }
  const keys = new Set();
  for (const f of readdirSync(join(BASE, lang))) {
    if (!f.endsWith('.ts') || f === 'index.ts') continue;
    for (const k of keysFromFile(join(BASE, lang, f))) keys.add(k);
  }
  return keys;
}

const i = process.argv.indexOf('--section');
const section = i >= 0 ? process.argv[i + 1] : null;
const el = keysForLang('el', section);
let failed = 0;

for (const lang of LANGS) {
  const have = keysForLang(lang, section);
  const missing = [...el].filter((k) => !have.has(k));
  const orphan = [...have].filter((k) => !el.has(k));
  console.log(`${lang.toUpperCase()}${section ? '/' + section : ''}: ${have.size}/${el.size} keys · ${missing.length} missing · ${orphan.length} orphan`);
  if (orphan.length) {
    console.log(`  ⚠ ORPHAN (not in EL): ${orphan.slice(0, 8).join(' | ')}${orphan.length > 8 ? ' …' : ''}`);
    failed = 1;
  }
  if (missing.length && missing.length <= 40) {
    console.log(`  missing: ${missing.join(' | ')}`);
  }
}
process.exit(failed);
