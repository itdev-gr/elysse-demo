# Admin jobs dashboard — design spec

**Date:** 2026-05-31
**Status:** Draft — pending user approval
**Author:** Marios + Claude

---

## 1. Goal

Let a single admin user post, edit, and remove job listings from a protected `/admin` page. Published jobs render on the public careers page at `/contact/careers/` in a new "Open positions" section, alongside the existing hero, about copy, cinematic quote, and contact card.

The site is a statically generated Astro build deployed on Vercel. The design must not require switching the whole site to SSR.

## 2. Non-goals

- Multiple admin users or role-based permissions
- In-app job applications, CV uploads, or applicant tracking
- Rich-text WYSIWYG editor (plain textarea with markdown is enough)
- Per-job images
- Server-rendered job pages or SEO indexing of individual jobs
- Email notifications when a job is posted
- Edit history / audit log

## 3. Architecture

```
┌──────────────────┐          ┌────────────────────┐
│  /admin (Astro)  │          │ /contact/careers/  │
│  client:only     │  writes  │  static page +     │
│  React island    │ ───────► │  <JobsList/> island│
│  • Login form    │          │  reads (anon key)  │
│  • Dashboard     │          └────────────────────┘
│  • Job form      │                    │
└────────┬─────────┘                    │
         │                              │
         ▼                              ▼
   ┌──────────────────────────────────────────┐
   │  Supabase                                │
   │  • auth.users (1 admin, email+password)  │
   │  • public.jobs (RLS-protected)           │
   │    – public: SELECT published & current  │
   │    – authenticated: full CRUD            │
   └──────────────────────────────────────────┘
```

- Site remains 100% SSG. No Astro adapter, no server endpoints, no Vercel functions.
- All reads/writes happen in the browser via `@supabase/supabase-js` using the **public anon key**.
- Postgres **Row Level Security** is the real authorization boundary — not the client code.
- The admin app is a single React island (`client:only="react"`) that swaps between login and dashboard based on session state.

## 4. Data model

### Table: `public.jobs`

| column            | type          | constraints                                              |
|-------------------|---------------|----------------------------------------------------------|
| `id`              | uuid          | PK, `default gen_random_uuid()`                          |
| `title`           | text          | NOT NULL                                                 |
| `location`        | text          | NOT NULL — free text (e.g. "Ergates, Cyprus")            |
| `employment_type` | text          | NOT NULL — one of: Full-time, Part-time, Contract, Internship (validated by CHECK constraint) |
| `department`      | text          | NOT NULL — free text (admin form supplies suggested values) |
| `description`     | text          | NOT NULL — markdown allowed                              |
| `salary_range`    | text          | NULL                                                     |
| `deadline`        | date          | NULL                                                     |
| `apply_email`     | text          | NULL                                                     |
| `apply_url`       | text          | NULL                                                     |
| `is_published`    | boolean       | NOT NULL, `default true`                                 |
| `created_at`      | timestamptz   | NOT NULL, `default now()`                                |
| `updated_at`      | timestamptz   | NOT NULL, `default now()`, refreshed by trigger          |

Trigger `set_updated_at` keeps `updated_at` in sync on UPDATE.

Index: `(is_published, deadline)` to keep the public SELECT cheap as the table grows.

### RLS policies

```sql
alter table public.jobs enable row level security;

-- Public: only published, non-expired jobs
create policy "public read published jobs"
on public.jobs for select
to anon, authenticated
using (
  is_published = true
  and (deadline is null or deadline >= current_date)
);

-- Admin (any signed-in user): full access
create policy "authenticated full access"
on public.jobs for all
to authenticated
using (true) with check (true);
```

Note: the `authenticated` role here is permissive because there's only one admin user. Adding a `role` column or a `profiles` table is deferred until multi-admin is needed.

## 5. File layout

### New files

```
src/lib/supabase.ts                  — singleton browser Supabase client (anon key)
src/types/job.ts                     — Job TS type (mirrors DB columns)

src/components/careers/JobsList.tsx  — React island; fetch + render published jobs
src/components/careers/JobCard.tsx   — single card; expand-in-place for full body

src/components/admin/AdminApp.tsx    — top-level: routes login ↔ dashboard
src/components/admin/LoginForm.tsx   — email + password
src/components/admin/Dashboard.tsx   — list/table of all jobs + actions
src/components/admin/JobForm.tsx     — create/edit form (shared)

src/pages/admin/index.astro          — minimal wrapper rendering <AdminApp client:only="react" />

supabase/migrations/0001_jobs.sql    — schema + RLS + trigger + index (committed)
docs/superpowers/specs/2026-05-31-admin-jobs-dashboard-design.md  — this file
```

### Modified files

```
src/pages/contact/careers/index.astro  — insert new "Open positions" section between
                                         the cinematic quote and the "Send us your CV" card
package.json                            — add @supabase/supabase-js, marked, dompurify (or isomorphic-dompurify)
.env.example                            — committed; placeholder PUBLIC_SUPABASE_URL/ANON_KEY
.gitignore                              — ensure .env is ignored (likely already)
```

### Untouched

`src/data/site-content.ts`, the navigation files, the layout, every other page. Per the "preserve existing design" rule, the careers page only gains a new section — every existing block stays.

## 6. Public careers page changes

A new section inserted between the cinematic quote (`"We hire people, not seats."`) and the "Send us your CV" contact card.

Section structure mirrors the page's existing language:
- `<Section bg="surface" spacing="lg">` + `<Container size="xl">`
- Eyebrow: "Now hiring" in `text-brand-500 uppercase tracking-[0.4em]`
- Heading: "Open positions." in `font-display font-heavy` at the same scale as other section headings
- Subhead: one-liner explaining the grid below
- Body: `<JobsList client:visible />`

### `JobsList` states

| state    | UI                                                                                       |
|----------|------------------------------------------------------------------------------------------|
| loading  | 3 skeleton cards (same dimensions as a real card)                                        |
| empty    | A single full-width card: "No open positions right now — send your CV anyway" + apply CTA |
| error    | Same card pattern: "Open positions are temporarily unavailable" + the existing apply CTA |
| populated | 1-col mobile / 2-col desktop grid of `JobCard` |

### `JobCard` layout

```
┌─────────────────────────────────────┐
│ R&D · FULL-TIME                     │  ← eyebrow: department · employment_type, uppercase tracking
│ Mechanical Engineer.                │  ← title — display font, brand-500 on hover
│ ─                                   │  ← brand-500 hairline divider
│ Ergates, Cyprus                     │  ← location
│ €35,000 — €45,000                   │  ← salary_range (only if set)
│ Apply by Jun 30, 2026               │  ← deadline (only if set)
│                                     │
│ Short preview of the description... │  ← first ~140 chars, ellipsised
│                                     │
│ [Apply →]      [Read more ▾]        │  ← Apply CTA — see precedence below
└─────────────────────────────────────┘

Apply CTA precedence (first non-empty wins):
  1. apply_url           → opens in new tab, rel="noopener noreferrer"
  2. apply_email         → mailto: link
  3. default fallback    → mailto:careers@elysee.com.cy
```

"Read more" toggles the card to expanded state showing the full markdown-rendered description. No modal, no scroll lock. Expansion is local to the card; only one open at a time is not enforced — multiple cards can be open.

Markdown rendering: `marked` for parsing + `dompurify` (browser) or a tiny manual allowlist for sanitization. Allowed tags: `strong`, `em`, `ul`, `ol`, `li`, `p`, `br`, `a` (with `rel="noopener noreferrer" target="_blank"` enforced).

## 7. Admin dashboard

### Routing inside `AdminApp`

The Astro page `/admin` does nothing more than mount `<AdminApp client:only="react" />`. `AdminApp` decides what to render based on Supabase session state:

```
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setSession(sess));
  return () => sub.subscription.unsubscribe();
}, []);
```

- `session === null` → render `<LoginForm />`
- `session !== null` → render `<Dashboard />`

### `LoginForm`

- Email + password fields
- Submit calls `supabase.auth.signInWithPassword({ email, password })`
- On error, inline banner with the message
- No "sign up" link (the admin is provisioned manually in the Supabase dashboard)
- No "forgot password" in v1 (reset via Supabase dashboard if needed)

### `Dashboard`

Top bar:
- "Admin · Jobs" title
- "Sign out" button (calls `supabase.auth.signOut()`)

Body:
- `[+ New job]` button → opens `<JobForm />` in "create" mode
- Table of all jobs (including drafts and expired) with columns:
  - Title
  - Department
  - Type
  - Location
  - Deadline (or "—")
  - Status badge (`Live` / `Draft` / `Expired`)
  - Actions: Edit, Toggle publish, Delete (with confirm)

Sorting and filtering are nice-to-have. Ship sorted by `created_at desc` only if filter UI adds time.

### `JobForm`

Single component used for both create and edit.

Fields, in order:
1. Title* — text input
2. Department* — text input with a `<datalist>` of suggested values (R&D, Manufacturing, Commercial, Quality, IT, Logistics, HR)
3. Employment type* — `<select>`: Full-time, Part-time, Contract, Internship
4. Location* — text input
5. Salary range — text input, optional
6. Application deadline — date input, optional
7. Apply email — email input, optional (placeholder: `careers@elysee.com.cy`)
8. Apply URL — url input, optional
9. Description* — `<textarea rows={10}>` with helper text "Markdown supported (bold, lists, links)"
10. Published — checkbox, defaults to true

Required fields enforced both via HTML `required` and DB NOT NULL.

Save:
- Create: `supabase.from('jobs').insert(payload).select().single()`
- Edit: `supabase.from('jobs').update(payload).eq('id', id).select().single()`
- On success: close form, refresh list, toast "Job saved"
- On error: inline error banner with the Postgres message

Delete:
- Confirm prompt ("Delete this job? This cannot be undone.")
- `supabase.from('jobs').delete().eq('id', id)`
- On success: remove row, toast "Job deleted"

## 8. Environment + setup

`.env` (gitignored):
```
PUBLIC_SUPABASE_URL=https://<project>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

`.env.example` (committed) has placeholder values.

These also need to be set in Vercel project settings (Production + Preview).

**Manual one-time setup steps** (documented in the spec, not automated):
1. Create a Supabase project
2. Run the migration `supabase/migrations/0001_jobs.sql` (paste into SQL editor)
3. In Supabase Auth → Users, add one admin user with email + password
4. Copy `PUBLIC_SUPABASE_URL` + `anon` key from Project Settings → API into local `.env` and Vercel env vars

## 9. Security model

- **Anon key is public.** That is the designed behavior. It identifies the project, not a user. All write protection is enforced by RLS policies on the Postgres side.
- **No service-role key in the codebase.** The repo only ever uses the anon key. Service role stays in Supabase dashboard.
- **Admin discoverability.** `/admin` URL is not secret; the login form is the gate. Sitemap exclusion is explicit: configure `@astrojs/sitemap` in `astro.config.mjs` with `filter: (page) => !page.includes('/admin')`. The page also sets `<meta name="robots" content="noindex, nofollow">` via its layout.
- **Session storage.** Supabase JS stores the session in localStorage. Sufficient for the demo; not a target for high-value attacks.
- **CSP / XSS.** Job descriptions are sanitized through dompurify before render. Outbound `<a>` from job markdown gets `rel="noopener noreferrer" target="_blank"`.

## 10. Edge cases

| scenario                          | behavior                                                              |
|-----------------------------------|------------------------------------------------------------------------|
| No jobs in DB                     | Public page shows empty-state card with apply CTA                     |
| All jobs are drafts               | Same as "no jobs" (drafts never leak to public)                       |
| Job deadline has passed           | Hidden on public side by RLS filter; admin sees "Expired" badge        |
| Supabase unreachable              | Public: error card with apply CTA. Admin: error banner, can retry.    |
| Description has malformed markdown| `marked` is forgiving; dompurify strips anything dangerous            |
| Session expires mid-edit          | Auth listener returns to login; current form state is lost (acceptable) |
| User opens two admin tabs         | Supabase shares session via localStorage; both tabs stay signed in   |
| User clears localStorage          | Next request → login form                                              |

## 11. Testing strategy

This is a demo on a low-traffic URL; full e2e coverage is overkill. Minimum:

- **Manual smoke test** of the full flow: sign in → create job → see it on careers page → edit → unpublish → confirm it disappears → delete.
- **Unit tests (vitest)** for any non-trivial pure logic — e.g. the markdown sanitization wrapper, deadline-expired predicate. Skip if logic stays trivial.
- **No Playwright tests** added in v1; the existing e2e suite continues to run unchanged.

Build verification: `npm run build` must pass with the new pages, and `npx astro check` must remain at 0 errors.

## 12. Rollout

1. Implement and verify locally with `.env` pointed at a dev Supabase project
2. Push to a feature branch; open PR; review the diff
3. Add Vercel env vars (Production + Preview)
4. Merge → Vercel rebuilds → `/admin` and the new section on `/contact/careers/` go live
5. Provision the one admin user in the production Supabase Auth dashboard
6. Smoke-test the production URL end-to-end

## 13. Open questions

None at design time. Implementation may surface small ones — handled in the writing-plans phase.
