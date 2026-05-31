# Admin Jobs Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-backed admin dashboard at `/admin` for managing job listings, plus a new "Open positions" section on `/contact/careers/` that lists published jobs.

**Architecture:** Site stays SSG. All data work happens in the browser using `@supabase/supabase-js` with the public anon key. Postgres Row Level Security is the real auth boundary. Admin page is a `client:only="react"` island that swaps between login and dashboard based on Supabase session state.

**Tech Stack:** Astro 6, React 19, Supabase (Postgres + Auth), `marked` for markdown, `dompurify` for sanitization, TailwindCSS 4.

**Spec:** `docs/superpowers/specs/2026-05-31-admin-jobs-dashboard-design.md`

---

## Manual prerequisites (user does these, plan documents them)

These must be completed before Task 12 (verification). Code-only tasks (1–11) can be written without them.

1. **Create a Supabase project** at https://supabase.com/dashboard
2. **Run the migration** (Task 2 commits it to the repo) in the Supabase SQL editor
3. **Create one admin user** in Supabase Auth → Users (email + password)
4. **Copy `Project URL` + `anon public` key** from Settings → API → set in:
   - Local: `.env` at the repo root
   - Vercel: Project Settings → Environment Variables (Production + Preview)

---

## File map

**Created:**
- `src/lib/supabase.ts` — Supabase browser client singleton
- `src/types/job.ts` — Job TS interface mirroring the DB
- `src/lib/jobs.ts` — pure helpers (`getApplyHref`, `isDeadlineExpired`, `getStatus`, markdown sanitizer)
- `src/lib/jobs.test.ts` — unit tests for `src/lib/jobs.ts`
- `src/components/careers/JobCard.tsx` — single job card (presentational)
- `src/components/careers/JobsList.tsx` — fetches + renders list with loading/empty/error states
- `src/components/admin/AdminApp.tsx` — session-aware router (login ↔ dashboard)
- `src/components/admin/LoginForm.tsx` — email + password sign-in
- `src/components/admin/Dashboard.tsx` — table of all jobs + actions
- `src/components/admin/JobForm.tsx` — shared create/edit form
- `src/pages/admin/index.astro` — wrapper mounting `<AdminApp client:only="react" />`
- `supabase/migrations/0001_jobs.sql` — schema + RLS + trigger
- `.env.example` — committed env placeholders

**Modified:**
- `src/pages/contact/careers/index.astro` — insert "Open positions" section
- `astro.config.mjs` — sitemap `filter` to exclude `/admin`
- `package.json` — new deps: `@supabase/supabase-js`, `marked`, `isomorphic-dompurify`
- `.gitignore` — ensure `.env` is ignored (likely already is)

**Untouched:** `src/data/site-content.ts`, navigation, layouts, other pages.

---

## Task 1: Install dependencies + env scaffolding

**Files:**
- Modify: `package.json` (deps)
- Create: `.env.example`
- Modify: `.gitignore` (if `.env` not already there)

- [ ] **Step 1: Install runtime deps**

```bash
npm install @supabase/supabase-js marked isomorphic-dompurify
```

Expected: three new entries in `package.json` `dependencies`. No errors.

- [ ] **Step 2: Confirm `.env` is gitignored**

```bash
grep -E "^\.env$|^\.env(?!\.)" .gitignore || echo ".env" >> .gitignore
```

Expected: either grep prints a match (already ignored) or `.env` gets appended.

- [ ] **Step 3: Create `.env.example`**

Write to `.env.example`:

```
# Supabase — public anon key is safe to expose; RLS enforces access.
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "chore(deps): supabase client + markdown libs + env scaffolding"
```

---

## Task 2: Database migration file

**Files:**
- Create: `supabase/migrations/0001_jobs.sql`

The user runs this manually in the Supabase SQL editor. Committing it to the repo keeps the schema reproducible.

- [ ] **Step 1: Write the migration**

Write to `supabase/migrations/0001_jobs.sql`:

```sql
-- public.jobs: backing table for the admin jobs dashboard.
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  location        text not null,
  employment_type text not null check (employment_type in
                    ('Full-time','Part-time','Contract','Internship')),
  department      text not null,
  description     text not null,
  salary_range    text,
  deadline        date,
  apply_email     text,
  apply_url       text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists jobs_published_deadline_idx
  on public.jobs (is_published, deadline);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- RLS
alter table public.jobs enable row level security;

drop policy if exists "public read published jobs" on public.jobs;
create policy "public read published jobs"
on public.jobs for select
to anon, authenticated
using (
  is_published = true
  and (deadline is null or deadline >= current_date)
);

drop policy if exists "authenticated full access" on public.jobs;
create policy "authenticated full access"
on public.jobs for all
to authenticated
using (true) with check (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0001_jobs.sql
git commit -m "feat(db): jobs table with RLS + updated_at trigger"
```

---

## Task 3: Job type + Supabase client + pure helpers (with tests)

**Files:**
- Create: `src/types/job.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/jobs.ts`
- Create: `src/lib/jobs.test.ts`

- [ ] **Step 1: Write the failing tests**

Write to `src/lib/jobs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getApplyHref,
  isDeadlineExpired,
  getStatus,
  renderJobDescription,
} from './jobs';
import type { Job } from '../types/job';

const baseJob: Job = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Engineer',
  location: 'Cyprus',
  employment_type: 'Full-time',
  department: 'R&D',
  description: 'Body',
  salary_range: null,
  deadline: null,
  apply_email: null,
  apply_url: null,
  is_published: true,
  created_at: '2026-05-31T00:00:00Z',
  updated_at: '2026-05-31T00:00:00Z',
};

describe('getApplyHref', () => {
  it('prefers apply_url when set', () => {
    expect(getApplyHref({ ...baseJob, apply_url: 'https://x.io/apply', apply_email: 'a@b.c' }))
      .toEqual({ href: 'https://x.io/apply', external: true });
  });
  it('falls back to apply_email mailto', () => {
    expect(getApplyHref({ ...baseJob, apply_email: 'a@b.c' }))
      .toEqual({ href: 'mailto:a@b.c', external: false });
  });
  it('falls back to careers@elysee.com.cy', () => {
    expect(getApplyHref(baseJob))
      .toEqual({ href: 'mailto:careers@elysee.com.cy', external: false });
  });
});

describe('isDeadlineExpired', () => {
  const today = new Date('2026-05-31T12:00:00Z');
  it('returns false when deadline is null', () => {
    expect(isDeadlineExpired(null, today)).toBe(false);
  });
  it('returns false when deadline is today', () => {
    expect(isDeadlineExpired('2026-05-31', today)).toBe(false);
  });
  it('returns true when deadline is in the past', () => {
    expect(isDeadlineExpired('2026-05-30', today)).toBe(true);
  });
  it('returns false when deadline is in the future', () => {
    expect(isDeadlineExpired('2026-06-01', today)).toBe(false);
  });
});

describe('getStatus', () => {
  const today = new Date('2026-05-31T12:00:00Z');
  it('Draft when not published', () => {
    expect(getStatus({ ...baseJob, is_published: false }, today)).toBe('Draft');
  });
  it('Expired when deadline passed even if published', () => {
    expect(getStatus({ ...baseJob, deadline: '2026-05-30' }, today)).toBe('Expired');
  });
  it('Live when published and not expired', () => {
    expect(getStatus(baseJob, today)).toBe('Live');
  });
});

describe('renderJobDescription', () => {
  it('renders bold and lists', () => {
    const html = renderJobDescription('**Hi**\n\n- one\n- two');
    expect(html).toContain('<strong>Hi</strong>');
    expect(html).toContain('<li>one</li>');
  });
  it('strips script tags', () => {
    const html = renderJobDescription('hi <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
  it('adds rel and target to anchors', () => {
    const html = renderJobDescription('[link](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});
```

- [ ] **Step 2: Run the tests — they must fail**

```bash
npm test -- src/lib/jobs.test.ts
```

Expected: FAIL — `src/lib/jobs.ts` does not exist.

- [ ] **Step 3: Create the Job type**

Write to `src/types/job.ts`:

```ts
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: EmploymentType;
  department: string;
  description: string;
  salary_range: string | null;
  deadline: string | null;          // ISO date "YYYY-MM-DD"
  apply_email: string | null;
  apply_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type JobDraft = Omit<Job, 'id' | 'created_at' | 'updated_at'>;
```

- [ ] **Step 4: Create the Supabase client singleton**

Write to `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Loud in dev so a missing .env is obvious. Public anon key is safe; RLS guards writes.
  // eslint-disable-next-line no-console
  console.error('Supabase env vars missing. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
});
```

- [ ] **Step 5: Implement the helpers to make tests pass**

Write to `src/lib/jobs.ts`:

```ts
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { Job } from '../types/job';

const DEFAULT_APPLY_EMAIL = 'careers@elysee.com.cy';

export function getApplyHref(job: Job): { href: string; external: boolean } {
  if (job.apply_url && job.apply_url.trim()) {
    return { href: job.apply_url.trim(), external: true };
  }
  if (job.apply_email && job.apply_email.trim()) {
    return { href: `mailto:${job.apply_email.trim()}`, external: false };
  }
  return { href: `mailto:${DEFAULT_APPLY_EMAIL}`, external: false };
}

export function isDeadlineExpired(deadline: string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  // Compare by date only; deadline of YYYY-MM-DD is the last accepted day.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dl = new Date(`${deadline}T00:00:00Z`);
  return dl < today;
}

export type JobStatus = 'Live' | 'Draft' | 'Expired';

export function getStatus(job: Job, now: Date = new Date()): JobStatus {
  if (!job.is_published) return 'Draft';
  if (isDeadlineExpired(job.deadline, now)) return 'Expired';
  return 'Live';
}

marked.setOptions({ gfm: true, breaks: true });

export function renderJobDescription(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'rel', 'target'],
  });
  // Force safe link attrs on any surviving anchor.
  return sanitized.replace(
    /<a\s+([^>]*?)>/g,
    (_m, attrs) => `<a ${attrs} rel="noopener noreferrer" target="_blank">`,
  );
}
```

- [ ] **Step 6: Run the tests — they must pass**

```bash
npm test -- src/lib/jobs.test.ts
```

Expected: all 4 describe blocks green.

- [ ] **Step 7: Commit**

```bash
git add src/types/job.ts src/lib/supabase.ts src/lib/jobs.ts src/lib/jobs.test.ts
git commit -m "feat(jobs): Job type, Supabase client, pure helpers + tests"
```

---

## Task 4: `JobCard` component

**Files:**
- Create: `src/components/careers/JobCard.tsx`

- [ ] **Step 1: Build the component**

Write to `src/components/careers/JobCard.tsx`:

```tsx
import { useState } from 'react';
import type { Job } from '../../types/job';
import { getApplyHref, renderJobDescription } from '../../lib/jobs';

type Props = { job: Job };

function formatDeadline(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function previewText(markdown: string, max = 160): string {
  const stripped = markdown.replace(/[#*_`>\-]/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > max ? stripped.slice(0, max - 1) + '…' : stripped;
}

export default function JobCard({ job }: Props) {
  const [expanded, setExpanded] = useState(false);
  const apply = getApplyHref(job);

  return (
    <article className="group bg-surface border-l-4 border-brand-500 p-6 md:p-8 transition-colors duration-300 hover:bg-surface-alt">
      <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
        {job.department} · {job.employment_type}
      </p>
      <h3 className="mt-3 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">
        {job.title}
      </h3>
      <div aria-hidden="true" className="mt-4 h-px w-10 bg-brand-500"></div>

      <dl className="mt-5 space-y-1 text-sm text-ink/80">
        <div>{job.location}</div>
        {job.salary_range && <div>{job.salary_range}</div>}
        {job.deadline && <div>Apply by {formatDeadline(job.deadline)}</div>}
      </dl>

      {!expanded && (
        <p className="mt-5 text-sm md:text-base text-ink/70 leading-[1.6]">
          {previewText(job.description)}
        </p>
      )}

      {expanded && (
        <div
          className="mt-5 text-sm md:text-base text-ink/80 leading-[1.65] [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3"
          // Sanitized via DOMPurify in renderJobDescription.
          dangerouslySetInnerHTML={{ __html: renderJobDescription(job.description) }}
        />
      )}

      <div className="mt-6 flex items-center gap-3">
        <a
          href={apply.href}
          target={apply.external ? '_blank' : undefined}
          rel={apply.external ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Apply
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
        >
          {expanded ? 'Read less' : 'Read more'}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path d="M2 4l3 3 3-3" />
          </svg>
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify it builds**

```bash
npm run build
```

Expected: build completes; no new errors. (The component isn't mounted yet so it must at least compile.)

- [ ] **Step 3: Commit**

```bash
git add src/components/careers/JobCard.tsx
git commit -m "feat(careers): JobCard with expand-in-place and apply CTA"
```

---

## Task 5: `JobsList` component

**Files:**
- Create: `src/components/careers/JobsList.tsx`

- [ ] **Step 1: Build the component**

Write to `src/components/careers/JobsList.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types/job';
import JobCard from './JobCard';

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; jobs: Job[] };

export default function JobsList() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data || data.length === 0) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'ready', jobs: data as Job[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8 min-h-[260px] animate-pulse">
            <div className="h-3 w-24 bg-ink/10 rounded"></div>
            <div className="mt-4 h-6 w-3/4 bg-ink/10 rounded"></div>
            <div className="mt-6 h-3 w-1/3 bg-ink/10 rounded"></div>
            <div className="mt-2 h-3 w-1/4 bg-ink/10 rounded"></div>
            <div className="mt-6 h-3 w-full bg-ink/10 rounded"></div>
            <div className="mt-2 h-3 w-2/3 bg-ink/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (state.kind === 'empty' || state.kind === 'error') {
    const heading = state.kind === 'empty'
      ? 'No open positions right now.'
      : 'Open positions are temporarily unavailable.';
    const body = state.kind === 'empty'
      ? 'We hire people, not seats — send your CV anyway and we will get in touch when something matches.'
      : 'Please reach out by email and we will reply with the current openings.';
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {state.kind === 'empty' ? 'No openings' : 'Temporarily unavailable'}
        </p>
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{heading}</h3>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">{body}</p>
        <a
          href="mailto:careers@elysee.com.cy"
          className="mt-6 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Email careers@elysee.com.cy
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {state.jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

```bash
npm run build
```

Expected: build completes with no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/careers/JobsList.tsx
git commit -m "feat(careers): JobsList with loading/empty/error/ready states"
```

---

## Task 6: Wire the new section into `/contact/careers/`

**Files:**
- Modify: `src/pages/contact/careers/index.astro`

The new section goes between the cinematic quote (lines 124–142) and the "Send us your CV" contact card (line 144).

- [ ] **Step 1: Add the import**

Find the existing imports at the top of `src/pages/contact/careers/index.astro`:

```astro
import { contactCareers } from '../../../data/site-content';
```

Add this line directly below it:

```astro
import JobsList from '../../../components/careers/JobsList.tsx';
```

- [ ] **Step 2: Insert the new section**

Locate the closing `</section>` of the "CINEMATIC MOMENT" block (around line 142, right after `</Container>`). Insert the following block immediately after that closing `</section>`, before the `{/* ===== CONTACT CARD ===== */}` comment:

```astro
  {/* ===== OPEN POSITIONS ===== */}
  <Section bg="surface" spacing="lg">
    <Container size="xl">
      <header class="max-w-3xl mb-12 md:mb-16">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6 md:mb-8">Now hiring</p>
        <h2 data-reveal data-reveal-delay="120" class="font-display font-heavy leading-[1.02] tracking-tight text-ink" style="font-size: clamp(2rem, 4.5vw, 3.5rem);">
          Open positions.
        </h2>
        <p data-reveal data-reveal-delay="240" class="mt-6 max-w-2xl text-base md:text-lg text-ink/70 leading-relaxed">
          Current roles across the group — engineering, manufacturing, R&D and commercial. Tap a card to read the full role.
        </p>
      </header>
      <JobsList client:visible />
    </Container>
  </Section>

```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

Expected: 60 pages built, no errors. (No new page is added; the careers page just got bigger.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/contact/careers/index.astro
git commit -m "feat(careers): mount JobsList in new 'Open positions' section"
```

---

## Task 7: Sitemap exclusion for `/admin`

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update the sitemap integration**

Open `astro.config.mjs`. Replace the line:

```js
integrations: [react(), sitemap()]
```

with:

```js
integrations: [
  react(),
  sitemap({
    filter: (page) => !page.includes('/admin'),
  }),
]
```

- [ ] **Step 2: Verify the build**

```bash
npm run build
```

Expected: build completes; `dist/sitemap-0.xml` (or `sitemap-index.xml`) generated. Open it and confirm `/admin` is not present.

```bash
grep -i admin dist/sitemap-0.xml || echo "OK: /admin not in sitemap"
```

Expected: `OK: /admin not in sitemap`.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "chore(sitemap): exclude /admin from generated sitemap"
```

---

## Task 8: Admin page wrapper + `AdminApp` routing

**Files:**
- Create: `src/components/admin/AdminApp.tsx`
- Create: `src/pages/admin/index.astro`

- [ ] **Step 1: Create the AdminApp shell with placeholder children**

Write to `src/components/admin/AdminApp.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <p className="text-sm text-ink/60">Loading…</p>
      </div>
    );
  }

  return session ? <Dashboard /> : <LoginForm />;
}
```

- [ ] **Step 2: Create placeholder LoginForm + Dashboard so the import compiles**

Write to `src/components/admin/LoginForm.tsx`:

```tsx
export default function LoginForm() {
  return <div className="p-8">Login form — coming in Task 9.</div>;
}
```

Write to `src/components/admin/Dashboard.tsx`:

```tsx
export default function Dashboard() {
  return <div className="p-8">Dashboard — coming in Task 10.</div>;
}
```

- [ ] **Step 3: Create the admin page wrapper**

Write to `src/pages/admin/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AdminApp from '../../components/admin/AdminApp.tsx';
---
<BaseLayout
  title="Admin — Elysée"
  description="Internal admin dashboard."
  padForHeader={false}
>
  <meta slot="head" name="robots" content="noindex, nofollow" />
  <AdminApp client:only="react" />
</BaseLayout>
```

(If `BaseLayout` does not support a `head` slot for the robots meta, fall back to placing the `<meta>` directly inside the layout's frontmatter via a prop. Check `src/layouts/BaseLayout.astro` first; if it accepts a `noindex` prop, use that instead. Otherwise add `<meta name="robots" content="noindex, nofollow">` directly inside `<head>` of the layout, guarded by a new `noindex` prop.)

- [ ] **Step 4: Verify the build**

```bash
npm run build
```

Expected: 61 pages built (new `/admin` route). No errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin src/components/admin
git commit -m "feat(admin): AdminApp shell + /admin route + noindex"
```

---

## Task 9: `LoginForm`

**Files:**
- Modify: `src/components/admin/LoginForm.tsx`

- [ ] **Step 1: Replace the placeholder**

Overwrite `src/components/admin/LoginForm.tsx`:

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) setError(err.message);
    // On success the onAuthStateChange listener in AdminApp swaps to Dashboard.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-surface border-l-4 border-brand-500 p-8 md:p-10"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Admin</p>
        <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink leading-tight">Sign in.</h1>
        <p className="mt-3 text-sm text-ink/65">Internal access only.</p>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
            {error}
          </p>
        )}

        <label className="block mt-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink focus:outline-none focus:border-brand-500"
          />
        </label>

        <label className="block mt-5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink focus:outline-none focus:border-brand-500"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/LoginForm.tsx
git commit -m "feat(admin): email+password login form"
```

---

## Task 10: `JobForm` (shared create/edit)

**Files:**
- Create: `src/components/admin/JobForm.tsx`

`JobForm` is built before `Dashboard` because Dashboard renders it.

- [ ] **Step 1: Build the form**

Write to `src/components/admin/JobForm.tsx`:

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job, JobDraft, EmploymentType } from '../../types/job';

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const DEPARTMENT_SUGGESTIONS = ['R&D', 'Manufacturing', 'Commercial', 'Quality', 'IT', 'Logistics', 'HR'];

type Props = {
  initial?: Job;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): JobDraft {
  return {
    title: '',
    location: '',
    employment_type: 'Full-time',
    department: '',
    description: '',
    salary_range: null,
    deadline: null,
    apply_email: null,
    apply_url: null,
    is_published: true,
  };
}

function toDraft(j: Job): JobDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = j;
  return rest;
}

export default function JobForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<JobDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof JobDraft>(key: K, value: JobDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: JobDraft = {
      ...draft,
      salary_range: draft.salary_range?.trim() || null,
      apply_email: draft.apply_email?.trim() || null,
      apply_url: draft.apply_url?.trim() || null,
      deadline: draft.deadline || null,
    };
    const op = initial
      ? supabase.from('jobs').update(payload).eq('id', initial.id)
      : supabase.from('jobs').insert(payload);
    const { error: err } = await op;
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit job' : 'New job'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          {error}
        </p>
      )}

      <Field label="Title" required>
        <input
          type="text"
          required
          value={draft.title}
          onChange={(e) => update('title', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Department" required>
        <input
          type="text"
          required
          list="department-suggestions"
          value={draft.department}
          onChange={(e) => update('department', e.currentTarget.value)}
          className={inputClass}
        />
        <datalist id="department-suggestions">
          {DEPARTMENT_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
        </datalist>
      </Field>

      <Field label="Employment type" required>
        <select
          required
          value={draft.employment_type}
          onChange={(e) => update('employment_type', e.currentTarget.value as EmploymentType)}
          className={inputClass}
        >
          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Location" required>
        <input
          type="text"
          required
          value={draft.location}
          onChange={(e) => update('location', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Salary range">
        <input
          type="text"
          value={draft.salary_range ?? ''}
          onChange={(e) => update('salary_range', e.currentTarget.value)}
          placeholder="€35,000 — €45,000"
          className={inputClass}
        />
      </Field>

      <Field label="Application deadline">
        <input
          type="date"
          value={draft.deadline ?? ''}
          onChange={(e) => update('deadline', e.currentTarget.value || null)}
          className={inputClass}
        />
      </Field>

      <Field label="Apply email">
        <input
          type="email"
          value={draft.apply_email ?? ''}
          onChange={(e) => update('apply_email', e.currentTarget.value)}
          placeholder="careers@elysee.com.cy"
          className={inputClass}
        />
      </Field>

      <Field label="Apply URL">
        <input
          type="url"
          value={draft.apply_url ?? ''}
          onChange={(e) => update('apply_url', e.currentTarget.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <Field label="Description" required hint="Markdown supported (bold, lists, links).">
        <textarea
          required
          rows={10}
          value={draft.description}
          onChange={(e) => update('description', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_published}
          onChange={(e) => update('is_published', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Published</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create job'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">
        {label}{required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/JobForm.tsx
git commit -m "feat(admin): JobForm shared between create and edit"
```

---

## Task 11: `Dashboard` (list + actions)

**Files:**
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Replace the placeholder**

Overwrite `src/components/admin/Dashboard.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types/job';
import { getStatus } from '../../lib/jobs';
import JobForm from './JobForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; job: Job };

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setJobs((data ?? []) as Job[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (job: Job) => {
    const { error: err } = await supabase
      .from('jobs')
      .update({ is_published: !job.is_published })
      .eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('jobs').delete().eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">Jobs.</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {mode.kind === 'list' && (
          <>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setMode({ kind: 'create' })}
                className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
              >
                + New job
              </button>
            </div>

            {jobs === null ? (
              <p className="text-sm text-ink/60">Loading…</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-ink/60">No jobs yet. Create the first one.</p>
            ) : (
              <div className="overflow-x-auto bg-surface border border-ink/10">
                <table className="w-full text-sm">
                  <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => {
                      const status = getStatus(j);
                      return (
                        <tr key={j.id} className="border-b border-ink/5 last:border-b-0">
                          <td className="px-4 py-3 text-ink">{j.title}</td>
                          <td className="px-4 py-3 text-ink/75">{j.department}</td>
                          <td className="px-4 py-3 text-ink/75">{j.employment_type}</td>
                          <td className="px-4 py-3 text-ink/75">{j.deadline ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                status === 'Live'
                                  ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                                  : status === 'Draft'
                                  ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                                  : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-red-100 text-red-700'
                              }
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                              <button onClick={() => setMode({ kind: 'edit', job: j })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                                Edit
                              </button>
                              <button onClick={() => togglePublish(j)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                                {j.is_published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button onClick={() => remove(j)} className="text-red-600 hover:text-red-800 cursor-pointer">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {mode.kind === 'create' && (
          <JobForm
            onSaved={async () => {
              setMode({ kind: 'list' });
              await load();
            }}
            onCancel={() => setMode({ kind: 'list' })}
          />
        )}

        {mode.kind === 'edit' && (
          <JobForm
            initial={mode.job}
            onSaved={async () => {
              setMode({ kind: 'list' });
              await load();
            }}
            onCancel={() => setMode({ kind: 'list' })}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/Dashboard.tsx
git commit -m "feat(admin): dashboard table with create/edit/delete/toggle publish"
```

---

## Task 12: End-to-end verification

This task runs only after the user has completed the manual prerequisites (Supabase project + migration + admin user + env vars).

- [ ] **Step 1: Static checks**

```bash
npx astro check
```

Expected: `0 errors`. Hints/warnings are acceptable but should not regress from the prior baseline.

```bash
npm test
```

Expected: all unit tests pass.

```bash
npm run build
```

Expected: 61 pages built, no errors. Sitemap excludes `/admin`.

- [ ] **Step 2: Local smoke test**

Start the dev server:

```bash
npm run dev
```

Open in a browser:

1. **`http://localhost:4321/admin`** — should show login form. Try wrong password → error banner. Sign in with the admin user.
2. After sign-in → dashboard. **Create** a job (all required fields). It appears in the table marked `Live`.
3. Open **`http://localhost:4321/contact/careers/`** in a second tab — scroll to "Open positions." The new job appears as a card. Click "Read more" — full description renders with markdown. Click "Apply" — opens mailto/external as configured.
4. Back in admin: **Edit** the job, change a field, save → public page reflects the change on reload.
5. **Unpublish** → public page no longer shows the job (with a refresh).
6. Re-publish, set a **deadline in the past** → still hidden on public side; admin shows "Expired" badge.
7. **Delete** with confirm → row disappears.
8. **Sign out** → back to login form.
9. With **no jobs in DB**: public page shows the empty-state card with the apply CTA.

- [ ] **Step 3: Production deploy**

After local verification:
- Push to `main` (or a feature branch + PR).
- In Vercel, confirm `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set for Production + Preview.
- After deploy, re-run steps 1–9 on the production URL.

- [ ] **Step 4: Final commit (if any cleanup was needed)**

```bash
git status
# if anything was touched during verification:
git add -A
git commit -m "chore: end-to-end verification fixes"
git push
```

---

## Self-review

**Spec coverage:**
- Section 1 (goal) → entire plan
- Section 3 (architecture) → Tasks 3, 8 (browser-only Supabase, client:only react island)
- Section 4 (data model + RLS) → Task 2
- Section 5 (file layout) → mirrored in "File map" above + tasks 3–11
- Section 6 (public careers — section placement, JobsList states, JobCard layout, apply CTA precedence, markdown sanitization) → Tasks 4, 5, 6
- Section 7 (admin routing, login, dashboard, form, delete, publish toggle, sign out) → Tasks 8–11
- Section 8 (env + setup) → "Manual prerequisites" + Task 1
- Section 9 (security — anon key public, no service-role, /admin sitemap exclusion, dompurify) → Tasks 1, 3, 7, 8
- Section 10 (edge cases) → Tasks 4, 5, 11
- Section 11 (testing — unit tests for pure logic, manual smoke) → Task 3 (unit) + Task 12 (manual)
- Section 12 (rollout) → Task 12 Step 3
- Section 13 (open questions) → none

**Placeholder scan:** No TBDs. Every code step shows full code. Every command has expected output. The one judgment call in Task 8 ("if BaseLayout supports a head slot, otherwise add a noindex prop") is acceptable because it's a documented fork with a concrete fallback — the engineer reads the existing layout and picks one path.

**Type consistency:** `Job`, `JobDraft`, `EmploymentType`, `JobStatus`, `getApplyHref`, `isDeadlineExpired`, `getStatus`, `renderJobDescription` — all defined in Task 3 and used by the exact same names in Tasks 4, 5, 10, 11. `Mode` discriminated union is internal to `Dashboard.tsx`. No drift.
