import { buildPagesIndex } from '../lib/search-pages';

// Static-pages search index, baked at build time. Fetched lazily by the
// search islands so the content registries never enter the client JS bundle.
export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(buildPagesIndex()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
