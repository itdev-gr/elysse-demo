// One-off (SPENT): read the static insight arrays from src/data/site-content.ts,
// convert blocks -> Markdown, and emit an idempotent seed migration.
//   npx tsx scripts/seed-insights.mjs
//
// NOTE: This generator is no longer runnable. The source arrays it imports
// (exhibitionDetails / mediaDetails / ebookDetails) were removed in commit
// e72de9d once their data lived in Supabase. The durable artifact is the
// already-committed supabase/migrations/0031_seed_insights.sql. Kept only as a
// record of how that seed was produced — do not re-run.
import { writeFileSync } from 'node:fs';
import {
  exhibitionDetails, mediaDetails, ebookDetails,
  insightsExhibitionsItems,
} from '../src/data/site-content.ts';

const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);

// Convert the simple ContentBlock[] used by these items to Markdown.
function blocksToMarkdown(blocks = []) {
  const out = [];
  for (const b of blocks) {
    if (b.kind === 'paragraph') out.push(b.text);
    else if (b.kind === 'heading') out.push(`## ${b.text}`);
    else if (b.kind === 'list') out.push(b.items.map((i) => `- ${i}`).join('\n'));
    else throw new Error(`Unhandled block kind in seed: ${b.kind}`);
  }
  return out.join('\n\n');
}

// card_date: the short label on the list card, matched by slug from its href.
const cardDateBySlug = Object.fromEntries(
  insightsExhibitionsItems
    .filter((i) => i.href)
    .map((i) => [i.href.replace(/\/$/, '').split('/').pop(), i.date ?? null]),
);

const lines = ['-- Emitted by scripts/seed-insights.mjs — do not hand-edit.', ''];

lines.push('insert into public.exhibitions (slug,title,excerpt,body,event_date,card_date,venue,stand,image,image_alt) values');
lines.push(exhibitionDetails.map((e) => `(${[
  q(e.slug), q(e.title), q(e.excerpt), q(blocksToMarkdown(e.blocks)),
  q(e.date), q(cardDateBySlug[e.slug] ?? null), q(e.venue ?? null),
  q(e.stand ?? null), q(e.image ?? null), q(e.imageAlt ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, event_date=excluded.event_date, card_date=excluded.card_date, venue=excluded.venue, stand=excluded.stand, image=excluded.image, image_alt=excluded.image_alt;', '');

lines.push('insert into public.media (slug,title,excerpt,body,video_url,poster_image,image_alt) values');
lines.push(mediaDetails.map((m) => `(${[
  q(m.slug), q(m.title), q(m.excerpt), q(blocksToMarkdown(m.blocks)),
  q(m.videoUrl), q(m.posterImage ?? null), q(m.imageAlt ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, video_url=excluded.video_url, poster_image=excluded.poster_image, image_alt=excluded.image_alt;', '');

lines.push('insert into public.ebooks (slug,title,excerpt,body,year,cover_image,image_alt,download_url) values');
lines.push(ebookDetails.map((b) => `(${[
  q(b.slug), q(b.title), q(b.excerpt), q(blocksToMarkdown(b.blocks)),
  q(b.year ?? null), q(b.coverImage ?? null), q(b.imageAlt ?? null), q(b.downloadUrl ?? null),
].join(',')})`).join(',\n'));
lines.push('on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, year=excluded.year, cover_image=excluded.cover_image, image_alt=excluded.image_alt, download_url=excluded.download_url;', '');

writeFileSync('supabase/migrations/0031_seed_insights.sql', lines.join('\n'));
console.log('Wrote supabase/migrations/0031_seed_insights.sql');
