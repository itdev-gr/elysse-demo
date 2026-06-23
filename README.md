# Elysée — Website

The website for **Elysée** (Elysée Irrigation), a Cyprus-based manufacturer of
innovative and smart piping & irrigation systems (elysee.com.cy). Built with
Astro + Tailwind v4 + TypeScript, with a Supabase backend and an admin dashboard
for managing catalogue, content, and enquiries.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321 (Vite dev server with HMR)
npm run build      # production build (Vercel output)
npm run preview    # serve the build locally
```

Requires a `.env` with the Supabase public keys:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

## Tests

```bash
npm test                       # vitest — unit tests (lib + data)
npx astro check                # TypeScript / Astro type check
npx playwright test            # Playwright suites (a11y, sitemap/detail-page coverage)
```

## Architecture

- **Astro 6** with the **Vercel adapter**. Most marketing pages are static (SSG);
  data-driven routes opt into on-demand rendering with `export const prerender = false`
  so dashboard edits go live with no rebuild.
- **Supabase** (Postgres + Storage + RLS) is the backend. Public pages read
  published rows with the anon key (RLS exposes only `is_published` rows); the
  admin dashboard writes with an authenticated session.
- **React islands** (`client:*`) for interactive pieces (catalog grid, admin app,
  news/jobs lists, contact form); everything else is server-rendered Astro.
- **Tailwind v4** via `@tailwindcss/vite`. Brand: **Elysée** green (`brand-500`).

## Main sections

- **Home** (`/`), **About Us** (`/about-us/*` — profile, history, structure,
  vision/mission/values, quality & certifications), **Green Elysée**
  (`/green-elysee/*`), **Innovation** (`/innovation/*`), **Products & Catalogue**
  (`/products/`, `/catalog/<category>/<config>`), **Insights** (`/insights/*` —
  news, blog, exhibitions, media, eBooks), **Contact Us** (`/contact/*` — local &
  worldwide networks, WISE, PRIME, Rohrsysteme, careers).
- **Catalogue** is country-aware: visitors pick a country and per-country product
  availability + imagery is applied via `data-for-country` / `data-active-country`
  CSS in `src/styles/catalog.css`.
- **Admin dashboard** at `/admin` (auth-gated): manage Products, Categories,
  Families, Country Groups, Catalogues, Images, Certifications, Blog Posts, News,
  Exhibitions, Media, eBooks, Jobs, Countries, Messages, and Settings.

## Project layout

```
src/
  pages/            route files (.astro); [param] routes are prerender=false + DB-backed
  layouts/          BaseLayout.astro (SEO meta, fonts, language restore)
  components/
    admin/          the dashboard app + per-entity Tab/Form components
    catalog/        country modal, product grid/rows, filters, config detail
    insights/       exhibition/media/ebook detail components
    ...             Header, Footer, nav, i18n toggle, etc.
  lib/              Supabase data-access modules (products, categories, news, jobs,
                    exhibitions, media, ebooks, contact, publish, supabase client)
  data/             static content + navigation (site-content.ts, content.ts, navigation.ts)
  scripts/          client-side catalog logic, i18n text swap
  styles/           global + catalog CSS
supabase/migrations/  SQL migrations (applied via the Supabase Management API)
scripts/              one-off data importers/seeders (e.g. blog import, insights seed)
docs/superpowers/     design specs + implementation plans
tests/                Playwright specs
```

## Database & migrations

Schema lives in `supabase/migrations/`. Migrations are applied to the live
project via the **Supabase Management API** (build the JSON payload with Python;
a real `User-Agent` header is required or Cloudflare returns 1010). Public
content tables use RLS: anon/authenticated may read `is_published = true`; writes
require an authenticated session.

## Deploy

Deployed on **Vercel** (`@astrojs/vercel`). Static assets are prerendered;
`prerender = false` routes run as serverless functions and are edge-cached
(`s-maxage=60, stale-while-revalidate`). A Vercel deploy hook (configured in the
admin Settings panel) lets editors trigger a rebuild for static content.
