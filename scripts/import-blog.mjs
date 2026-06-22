// One-off importer: mirror the blog at elysee.com.cy into our own `posts`
// table + `blog-covers` Storage bucket, so the whole blog is served from our
// database with no asset or link pointing back to the source site.
//
// Two phases (so extraction can run with no credentials):
//
//   node scripts/import-blog.mjs extract
//     Crawl /blog?page=1..N, fetch each post, parse title/date/body/images,
//     download every image locally, and write a manifest JSON. No secrets.
//
//   node scripts/import-blog.mjs upload
//     Upload the downloaded images to the blog-covers bucket, rewrite every
//     image reference to its public bucket URL, and emit the seed migration
//     supabase/migrations/0021_seed_blog_from_source.sql.
//     Requires PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
// Re-running is safe: the migration deletes the old hand-written seeds and
// upserts every post by slug.
//
// One-off tooling deps (not required by the app build): `npm i -D cheerio turndown`.
// The upload phase needs PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.

import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import TurndownService from 'turndown';

const SITE = 'https://elysee.com.cy';
const INDEX = `${SITE}/blog`;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
const WORK = '/tmp/blogimport';
const ASSETS = path.join(WORK, 'assets');
const MANIFEST = path.join(WORK, 'manifest.json');
const BUCKET = 'blog-covers';
const MIGRATION = path.join('supabase', 'migrations', '0021_seed_blog_from_source.sql');

// Slugs of the 5 hand-written sample posts from 0003_seed_blog_posts.sql that
// this import replaces with the real source content.
const OLD_SEED_SLUGS = [
  'zeeflex-fittings-pool-plumbing',
  'elysee-zero-force-range-improved',
  'elysee-global-transition-range',
  'pvc-fittings-for-waste-and-soil-systems',
  'elysee-irrigation-great-place-to-work',
];

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
// Drop social-share icon links and empty anchors turndown would otherwise keep.
td.remove(['script', 'style', 'noscript']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input) {
  return (input || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// The DB enforces slug ~ '^[a-z0-9-]+$'. Keep clean source slugs (incl. the
// already-transliterated Greek ones); regenerate ugly auto-slugs that start
// with a digit (e.g. "45-1599219934-5cp3z9bspc").
function chooseSlug(sourceSlug, title) {
  const clean = sourceSlug.toLowerCase();
  if (/^[a-z][a-z0-9-]*$/.test(clean)) return clean;
  const fromTitle = slugify(title);
  if (/^[a-z][a-z0-9-]*$/.test(fromTitle)) return fromTitle;
  // Last resort: strip anything illegal from the source slug.
  return clean.replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
}

function toAbsolute(src) {
  try {
    return new URL(src, `${SITE}/`).href;
  } catch {
    return src;
  }
}

function parseDate(ddmmyyyy) {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec((ddmmyyyy || '').trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00Z`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

// Any link to the source site (any subdomain), a relative/internal path, or a
// URL shortener gets flattened to plain text — nothing may redirect off-site.
function shouldNeutralizeLink(href) {
  let u;
  try {
    u = new URL(href, `${SITE}/`);
  } catch {
    return true;
  }
  const host = u.hostname.toLowerCase();
  if (host === 'elysee.com.cy' || host.endsWith('.elysee.com.cy')) return true;
  if (/(^|\.)(bit\.ly|tinyurl\.com|goo\.gl|t\.co|ow\.ly)$/.test(host)) return true;
  // Relative links resolve back to the source host.
  if (!/^[a-z]+:\/\//i.test(href)) return true;
  return false;
}

const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const readingMinutes = (text) => Math.max(1, Math.ceil(wordCount(text) / 200));

function markdownToPlain(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeExcerpt(plain, max = 200) {
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > 80) return cut.slice(0, lastStop + 1).trim();
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…';
}

function cleanMarkdown(md, title) {
  let out = md
    .replace(/ /g, ' ')
    .replace(/\*\*\*\*/g, '') // empty bold runs from nested <span> wrapping
    .replace(/\*\* +\*\*/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  // Drop a leading line that just repeats the title in bold.
  const titleNorm = (title || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const lines = out.split('\n');
  while (lines.length) {
    const first = lines[0].trim();
    if (!first) { lines.shift(); continue; }
    const bare = first.replace(/^\*\*|\*\*$/g, '').replace(/[:：]\s*$/, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (first.startsWith('**') && bare && (bare === titleNorm || titleNorm.startsWith(bare) || bare.startsWith(titleNorm))) {
      lines.shift();
      continue;
    }
    break;
  }
  return lines.join('\n').trim();
}

// Flatten off-site / relative / shortener links to plain text. Leaves image
// markdown (`![...]`) and genuine third-party links (e.g. youtube) intact.
function neutralizeLinks(md) {
  return md.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (full, bang, text, href) => {
    if (bang === '!') return full; // image — handled elsewhere
    return shouldNeutralizeLink(href) ? text : full;
  });
}

// ---------------------------------------------------------------------------
// Crawl + parse
// ---------------------------------------------------------------------------

async function collectPostUrls() {
  const urls = [];
  const seen = new Set();
  for (let page = 1; page <= 12; page++) {
    const html = await fetchText(`${INDEX}?page=${page}`);
    const $ = load(html);
    const before = urls.length;
    $('.new-img-div a[href]').each((_, el) => {
      const abs = toAbsolute($(el).attr('href'));
      // post URLs are /<slug> on the source host
      const u = new URL(abs);
      if (u.hostname !== 'elysee.com.cy') return;
      const slug = u.pathname.replace(/^\/+|\/+$/g, '');
      if (!slug || slug.includes('/') || slug.startsWith('blog')) return;
      if (seen.has(slug)) return;
      seen.add(slug);
      urls.push(`${SITE}/${slug}`);
    });
    const added = urls.length - before;
    console.log(`  page ${page}: +${added} (total ${urls.length})`);
    if (added === 0) break;
    await sleep(150);
  }
  return urls;
}

function parsePost(html, url) {
  const $ = load(html);
  const sourceSlug = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
  const title = ($('meta[property="og:title"]').attr('content') || $('title').text() || '').trim();
  const cover = toAbsolute(($('meta[property="og:image"]').attr('content') || '').trim());

  let dateRaw = null;
  $('p.mb-0').each((_, el) => {
    const t = $(el).text().trim();
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(t)) dateRaw = t;
  });

  const container = $('#article-body-container');
  container
    .find('.article-socials-div, #contact-form-container, #news-more-news-container, script, style, form, noscript')
    .remove();
  container.find('h2.h-section, h2.header').first().remove();
  const col = container.find('.col-11').first();
  const scope = col.length ? col : container;

  // Collect + absolutize body images, rewriting the DOM so turndown emits
  // absolute source URLs we can later swap for bucket URLs.
  const bodyImages = [];
  scope.find('img').each((_, el) => {
    const raw = $(el).attr('src');
    if (!raw) return;
    const abs = toAbsolute(raw);
    if (!abs.startsWith(SITE)) return; // ignore any off-site/decorative img
    $(el).attr('src', abs);
    if (!bodyImages.includes(abs)) bodyImages.push(abs);
  });

  let body = td.turndown(scope.html() || '');
  body = neutralizeLinks(body);
  body = cleanMarkdown(body, title);

  const plain = markdownToPlain(body);
  const images = [];
  if (cover && cover.startsWith(SITE)) images.push(cover);
  for (const img of bodyImages) if (!images.includes(img)) images.push(img);

  return {
    sourceUrl: url,
    sourceSlug,
    slug: sourceSlug, // finalized later for uniqueness
    title,
    cover: cover && cover.startsWith(SITE) ? cover : null,
    publishedAt: parseDate(dateRaw),
    dateRaw,
    body,
    excerpt: makeExcerpt(plain),
    readingMinutes: readingMinutes(plain),
    images, // absolute source URLs (cover first if present)
  };
}

function extOf(url, contentType) {
  const fromUrl = (url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i) || [])[1];
  if (fromUrl) return fromUrl.toLowerCase();
  const map = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
  return map[(contentType || '').split(';')[0].trim()] || 'png';
}

async function downloadImage(url, destDir) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`IMG ${url} -> ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extOf(url, ct);
  const base = (url.split('/').pop().split('?')[0] || 'image').replace(/[^a-zA-Z0-9._-]/g, '-');
  const name = base.match(/\.[a-z0-9]+$/i) ? base : `${base}.${ext}`;
  fs.mkdirSync(destDir, { recursive: true });
  const file = path.join(destDir, name);
  fs.writeFileSync(file, buf);
  return { file, name, contentType: ct || `image/${ext}`, bytes: buf.length };
}

async function runExtract() {
  fs.mkdirSync(ASSETS, { recursive: true });
  console.log('Crawling blog index…');
  const urls = await collectPostUrls();
  console.log(`Found ${urls.length} posts.\nFetching + parsing…`);

  const posts = [];
  const usedSlugs = new Set();
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const post = parsePost(html, url);

      // finalize unique, DB-valid slug
      let slug = chooseSlug(post.sourceSlug, post.title);
      let n = 2;
      while (usedSlugs.has(slug)) slug = `${chooseSlug(post.sourceSlug, post.title)}-${n++}`;
      usedSlugs.add(slug);
      post.slug = slug;

      // download images -> per-slug folder; map source URL -> local + bucket key
      post.imageMap = {};
      for (const imgUrl of post.images) {
        try {
          const dl = await downloadImage(imgUrl, path.join(ASSETS, slug));
          post.imageMap[imgUrl] = {
            local: dl.file,
            name: dl.name,
            contentType: dl.contentType,
            bytes: dl.bytes,
            key: `blog/${slug}/${dl.name}`,
          };
        } catch (e) {
          console.warn(`    ! image failed ${imgUrl}: ${e.message}`);
        }
      }
      posts.push(post);
      console.log(`  ✓ ${slug}  [${post.dateRaw || 'no-date'}]  imgs:${Object.keys(post.imageMap).length}  body:${post.body.length}b`);
      await sleep(120);
    } catch (e) {
      console.error(`  ✗ ${url}: ${e.message}`);
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify({ generatedFrom: INDEX, count: posts.length, posts }, null, 2));
  console.log(`\nWrote manifest: ${MANIFEST} (${posts.length} posts)`);
  const noDate = posts.filter((p) => !p.publishedAt).length;
  const noCover = posts.filter((p) => !p.cover).length;
  console.log(`  posts without a parsed date: ${noDate}`);
  console.log(`  posts without a cover image: ${noCover}`);
}

// ---------------------------------------------------------------------------
// Upload + migration
// ---------------------------------------------------------------------------

function sqlString(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Dollar-quote the markdown body to avoid escaping newlines/quotes.
function sqlBody(body) {
  let tag = 'md';
  while (body.includes(`$${tag}$`)) tag += 'x';
  return `$${tag}$${body}$${tag}$`;
}

async function runUpload() {
  const url = process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to run the upload phase.');
    process.exit(1);
  }
  if (!fs.existsSync(MANIFEST)) {
    console.error(`Manifest not found at ${MANIFEST}. Run "extract" first.`);
    process.exit(1);
  }
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { posts } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const publicBase = `${url.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}`;

  for (const post of posts) {
    for (const [srcUrl, info] of Object.entries(post.imageMap || {})) {
      const buf = fs.readFileSync(info.local);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(info.key, buf, { contentType: info.contentType, upsert: true });
      if (error) throw new Error(`upload ${info.key}: ${error.message}`);
      info.publicUrl = `${publicBase}/${info.key}`;
      // rewrite references in body + cover
      post.body = post.body.split(srcUrl).join(info.publicUrl);
      if (post.cover === srcUrl) post.cover = info.publicUrl;
    }
    console.log(`  uploaded ${Object.keys(post.imageMap || {}).length} imgs for ${post.slug}`);
  }

  // Remove any bare (non-markdown) source URLs left in prose — GFM would
  // autolink them, and we never want the source domain shown at all.
  const stripBareSourceUrls = (text) =>
    text
      .replace(/\s*(?:\bat\b\s+)?https?:\/\/(?:www\.)?elysee\.com\.cy\/?\S*/gi, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .trim();
  for (const post of posts) {
    post.body = stripBareSourceUrls(post.body);
    post.excerpt = stripBareSourceUrls(post.excerpt);
  }

  // Guard: no source URL may survive in body or cover.
  const leaks = posts.filter(
    (p) => /elysee\.com\.cy/i.test(p.body) || (p.cover && /elysee\.com\.cy/i.test(p.cover)),
  );
  if (leaks.length) {
    console.warn(`  ! ${leaks.length} post(s) still reference elysee.com.cy (left as plain text links):`);
    for (const p of leaks) console.warn(`     - ${p.slug}`);
  }

  // Emit the seed migration.
  const rows = posts
    .map((p) => {
      const cols = [
        sqlString(p.slug),
        sqlString(p.title),
        sqlString(p.excerpt),
        sqlBody(p.body),
        p.cover ? sqlString(p.cover) : 'null',
        sqlString('Elysée Group'),
        p.publishedAt ? sqlString(p.publishedAt) : 'now()',
        String(p.readingMinutes || 1),
        'true',
      ];
      return `(${cols.join(',\n ')})`;
    })
    .join(',\n');

  const sql = `-- Seed the full blog imported from elysee.com.cy (all posts + re-hosted images).
-- Replaces the 5 hand-written sample posts from 0003_seed_blog_posts.sql.
-- Idempotent: re-running upserts every post by slug.

delete from public.posts where slug in (${OLD_SEED_SLUGS.map(sqlString).join(', ')});

insert into public.posts
  (slug, title, excerpt, body, cover_image, author, published_at, reading_minutes, is_published)
values
${rows}
on conflict (slug) do update set
  title           = excluded.title,
  excerpt         = excluded.excerpt,
  body            = excluded.body,
  cover_image     = excluded.cover_image,
  author          = excluded.author,
  published_at    = excluded.published_at,
  reading_minutes = excluded.reading_minutes,
  is_published    = excluded.is_published,
  updated_at      = now();
`;

  fs.mkdirSync(path.dirname(MIGRATION), { recursive: true });
  fs.writeFileSync(MIGRATION, sql);
  console.log(`\nWrote migration: ${MIGRATION} (${posts.length} posts)`);
  fs.writeFileSync(MANIFEST, JSON.stringify({ posts }, null, 2));

  // Apply the same delete + upsert to the live DB (service-role bypasses RLS),
  // keeping the committed migration as the canonical record.
  if (process.argv.includes('--apply')) {
    const { error: delErr } = await supabase.from('posts').delete().in('slug', OLD_SEED_SLUGS);
    if (delErr) throw new Error(`delete old seeds: ${delErr.message}`);
    const rowsJs = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      cover_image: p.cover || null,
      author: 'Elysée Group',
      published_at: p.publishedAt || new Date().toISOString(),
      reading_minutes: p.readingMinutes || 1,
      is_published: true,
    }));
    const { error: upErr } = await supabase.from('posts').upsert(rowsJs, { onConflict: 'slug' });
    if (upErr) throw new Error(`upsert posts: ${upErr.message}`);
    const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    console.log(`\nApplied to live DB. posts table now has ${count} rows.`);
  } else {
    console.log('\n(Skipped DB apply — pass --apply to write posts to the live DB.)');
  }
}

// ---------------------------------------------------------------------------

const cmd = process.argv[2];
if (cmd === 'extract') await runExtract();
else if (cmd === 'upload') await runUpload();
else {
  console.error('Usage: node scripts/import-blog.mjs <extract|upload>');
  process.exit(1);
}
