import { readFileSync, writeFileSync } from 'node:fs';

type P = { url: string; status: number; title: string; navLinks: string[]; footerLinks: string[]; forms: any[] };
const pages: P[] = JSON.parse(readFileSync('output/pages.json', 'utf8'));

const rows = pages
  .sort((a, b) => a.url.localeCompare(b.url))
  .map(p => {
    const path = new URL(p.url).pathname || '/';
    return `| \`${path}\` | ${p.status} | ${p.title.replace(/\|/g, '\\|')} | ${p.forms.length} |`;
  })
  .join('\n');

const md = `# Page Map — sonanbunkers.com

Total pages discovered: **${pages.length}**

| Path | Status | Title | Forms |
|------|--------|-------|-------|
${rows}

## Navigation links (homepage)
${(pages.find(p => new URL(p.url).pathname === '/')?.navLinks ?? []).map(l => `- ${l}`).join('\n')}

## Footer links (homepage)
${(pages.find(p => new URL(p.url).pathname === '/')?.footerLinks ?? []).map(l => `- ${l}`).join('\n')}

## Forms discovered
${pages.flatMap(p => p.forms.map(f => `- \`${p.url}\` → \`${f.method.toUpperCase()} ${f.action}\` fields: ${f.fields.join(', ') || '(none)'}`)).join('\n')}
`;
writeFileSync('../PAGE_MAP.md', md);
console.log('Wrote PAGE_MAP.md');
