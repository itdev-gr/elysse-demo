# Contact Forms + Dashboard + Resend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable, backend-connected contact forms to every "CTA closing section" across the site, store all submissions in Supabase, surface them in the admin dashboard, send a notification email to a per-form configurable recipient via Resend, and let staff edit those recipients in the dashboard.

**Architecture:** The site is a fully static Astro build with no server runtime; all data flows through Supabase via the public anon key, guarded by RLS. Public forms `insert` directly into a new `contact_submissions` table (anon INSERT, no anon SELECT). After a successful insert the client invokes a Supabase Edge Function (`contact-notify`) which — using the service-role key — looks up the per-source recipient in `contact_settings` and emails it through Resend. The dashboard gets a **Messages** tab (read/triage submissions) and a **Settings** tab (edit recipients), following the existing Tab + Form pattern.

**Tech Stack:** Astro (static) · React islands · Supabase (Postgres, Auth, RLS, Edge Functions/Deno) · Resend · Tailwind · Vitest.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `supabase/migrations/0007_contact.sql` | `contact_submissions` + `contact_settings` tables, RLS, seed recipients |
| `src/types/contact.ts` | `ContactSubmission`, `ContactSetting`, `ContactDraft`, `ContactStatus` types |
| `src/lib/contact.ts` | Pure validation/honeypot helpers + `submitEnquiry()` (insert + invoke fn) |
| `src/lib/contact.test.ts` | Vitest unit tests for the pure helpers |
| `src/components/contact/EnquiryForm.tsx` | React island: the public, backend-connected form |
| `src/components/admin/MessagesTab.tsx` | Dashboard: list / view / triage / delete submissions |
| `src/components/admin/SettingsTab.tsx` | Dashboard: edit per-source recipient emails |
| `src/components/admin/Dashboard.tsx` | MODIFY: register `messages` + `settings` tabs |
| `src/components/ContactForm.astro` | MODIFY: render the island (keeps `/contact/local` working) |
| `src/pages/contact/careers/index.astro` | MODIFY: add form to the closing CTA section |
| `src/pages/contact/worldwide/index.astro` | MODIFY: add form to the closing CTA section |
| `supabase/functions/contact-notify/index.ts` | Edge Function: resolve recipient + send via Resend |
| `supabase/functions/contact-notify/deno.json` | Deno config for the function |
| `docs/contact-forms-deploy.md` | Deploy runbook (secrets, deploy command, Resend domain) |

**Source keys** (the `source` column / settings rows): `general`, `careers`, `local`, `worldwide`. Each form passes its own `source`; the recipient is resolved per source with `general` as fallback.

---

## Task 1: Database schema + RLS + seed recipients

**Files:**
- Create: `supabase/migrations/0007_contact.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0007_contact.sql
-- Public contact forms write to contact_submissions; the dashboard reads/triages
-- them; an edge function emails the per-source recipient from contact_settings.

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  source      text not null default 'general',
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 320),
  company     text check (company is null or char_length(company) <= 200),
  phone       text check (phone is null or char_length(phone) <= 60),
  message     text not null check (char_length(message) between 1 and 5000),
  page_path   text check (page_path is null or char_length(page_path) <= 300),
  status      text not null default 'new' check (status in ('new','read','archived')),
  notified_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

create table if not exists public.contact_settings (
  source          text primary key,
  label           text not null,
  recipient_email text not null,
  updated_at      timestamptz not null default now()
);

-- Reuses public.set_updated_at() defined in 0001_jobs.sql.
drop trigger if exists set_contact_settings_updated_at on public.contact_settings;
create trigger set_contact_settings_updated_at
  before update on public.contact_settings
  for each row execute function public.set_updated_at();

insert into public.contact_settings (source, label, recipient_email) values
  ('general',   'General enquiries',      'info@elysee.com.cy'),
  ('careers',   'Careers / recruitment',  'recruitment@elysee.com.cy'),
  ('local',     'Local network (Cyprus)', 'info@elysee.com.cy'),
  ('worldwide', 'Worldwide / export',     'info@elysee.com.cy')
on conflict (source) do nothing;

-- RLS: anyone may submit; only the honeypot/validation gate them client-side.
-- No anonymous read of submissions or settings (privacy of enquirers + recipients).
alter table public.contact_submissions enable row level security;

drop policy if exists "anon insert submissions" on public.contact_submissions;
create policy "anon insert submissions"
on public.contact_submissions for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read submissions" on public.contact_submissions;
create policy "authenticated read submissions"
on public.contact_submissions for select
to authenticated using (true);

drop policy if exists "authenticated update submissions" on public.contact_submissions;
create policy "authenticated update submissions"
on public.contact_submissions for update
to authenticated using (true) with check (true);

drop policy if exists "authenticated delete submissions" on public.contact_submissions;
create policy "authenticated delete submissions"
on public.contact_submissions for delete
to authenticated using (true);

alter table public.contact_settings enable row level security;

drop policy if exists "authenticated manage settings" on public.contact_settings;
create policy "authenticated manage settings"
on public.contact_settings for all
to authenticated using (true) with check (true);
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push` (hosted) or paste into the Supabase SQL editor.
Expected: two tables created, four `contact_settings` rows seeded.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0007_contact.sql
git commit -m "feat(contact): add contact_submissions + contact_settings tables with RLS"
```

---

## Task 2: Types

**Files:**
- Create: `src/types/contact.ts`

- [ ] **Step 1: Write the types**

```ts
export type ContactStatus = 'new' | 'read' | 'archived';

export interface ContactSubmission {
  id: string;
  source: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  page_path: string | null;
  status: ContactStatus;
  notified_at: string | null;
  created_at: string;
}

export interface ContactSetting {
  source: string;
  label: string;
  recipient_email: string;
  updated_at: string;
}

/** The fields a public form collects before server columns are added. */
export interface ContactDraft {
  source: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  page_path: string;
  /** Honeypot — real users never see or fill this; must stay empty. */
  website: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/contact.ts
git commit -m "feat(contact): add contact types"
```

---

## Task 3: Validation + submit helpers (TDD)

**Files:**
- Create: `src/lib/contact.ts`
- Test: `src/lib/contact.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { validateDraft, isSpam, emptyDraft } from './contact';

describe('emptyDraft', () => {
  it('seeds source + page_path and blanks the rest', () => {
    expect(emptyDraft('careers', '/contact/careers/')).toEqual({
      source: 'careers', name: '', email: '', company: '', phone: '',
      message: '', page_path: '/contact/careers/', website: '',
    });
  });
});

describe('validateDraft', () => {
  const base = emptyDraft('general');
  it('requires name, email and message', () => {
    const r = validateDraft(base);
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBeTruthy();
    expect(r.errors.email).toBeTruthy();
    expect(r.errors.message).toBeTruthy();
  });
  it('rejects a malformed email', () => {
    const r = validateDraft({ ...base, name: 'A', message: 'Hi', email: 'nope' });
    expect(r.errors.email).toBeTruthy();
  });
  it('accepts a complete valid draft', () => {
    const r = validateDraft({ ...base, name: 'Ada', email: 'ada@x.com', message: 'Hello' });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual({});
  });
  it('rejects an over-long message', () => {
    const r = validateDraft({ ...base, name: 'Ada', email: 'ada@x.com', message: 'x'.repeat(5001) });
    expect(r.errors.message).toBeTruthy();
  });
});

describe('isSpam', () => {
  it('flags a filled honeypot', () => {
    expect(isSpam({ ...emptyDraft('general'), website: 'http://bot' })).toBe(true);
  });
  it('passes an empty honeypot', () => {
    expect(isSpam(emptyDraft('general'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `npx vitest run src/lib/contact.test.ts`
Expected: FAIL — `Cannot find module './contact'`.

- [ ] **Step 3: Implement `src/lib/contact.ts`**

```ts
import { supabase } from './supabase';
import type { ContactDraft } from '../types/contact';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof ContactDraft, string>>;
}

export function emptyDraft(source: string, pagePath = ''): ContactDraft {
  return {
    source, name: '', email: '', company: '', phone: '',
    message: '', page_path: pagePath, website: '',
  };
}

export function validateDraft(draft: ContactDraft): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  if (!draft.name.trim()) errors.name = 'Please enter your name.';
  else if (draft.name.trim().length > 200) errors.name = 'Name is too long.';
  if (!draft.email.trim()) errors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(draft.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!draft.message.trim()) errors.message = 'Please enter a message.';
  else if (draft.message.trim().length > 5000) errors.message = 'Message is too long (5000 characters max).';
  if (draft.company && draft.company.length > 200) errors.company = 'Company name is too long.';
  if (draft.phone && draft.phone.length > 60) errors.phone = 'Phone number is too long.';
  return { ok: Object.keys(errors).length === 0, errors };
}

/** True when the honeypot was filled — treat as a bot. */
export function isSpam(draft: ContactDraft): boolean {
  return draft.website.trim() !== '';
}

export type SubmitResult =
  | { kind: 'success' }
  | { kind: 'invalid'; errors: ValidationResult['errors'] }
  | { kind: 'error'; message: string };

export async function submitEnquiry(draft: ContactDraft): Promise<SubmitResult> {
  const validation = validateDraft(draft);
  if (!validation.ok) return { kind: 'invalid', errors: validation.errors };

  // Honeypot: silently "succeed" without touching the database.
  if (isSpam(draft)) return { kind: 'success' };

  const row = {
    source: draft.source || 'general',
    name: draft.name.trim(),
    email: draft.email.trim(),
    company: draft.company.trim() || null,
    phone: draft.phone.trim() || null,
    message: draft.message.trim(),
    page_path: draft.page_path || null,
  };

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(row)
    .select('id')
    .single();

  if (error) return { kind: 'error', message: error.message };

  // Best-effort notification. The submission is already saved, so we never
  // block or fail the user if the email call errors.
  try {
    await supabase.functions.invoke('contact-notify', { body: { id: data.id } });
  } catch {
    /* dashboard still shows the submission */
  }

  return { kind: 'success' };
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `npx vitest run src/lib/contact.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.test.ts
git commit -m "feat(contact): add validation + submit helpers"
```

---

## Task 4: EnquiryForm React island

**Files:**
- Create: `src/components/contact/EnquiryForm.tsx`

- [ ] **Step 1: Implement the component** (full code in repo; mirrors `Input.astro` field styling, success + error states, honeypot, per-field errors). Props: `source: string`, `pagePath?: string`, `title?: string`, `subtitle?: string`, `compact?: boolean`.

- [ ] **Step 2: Verify it builds** — `npm run build` succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/contact/EnquiryForm.tsx
git commit -m "feat(contact): add EnquiryForm island"
```

---

## Task 5: Wire the form into pages

**Files:**
- Modify: `src/components/ContactForm.astro` (render the island, `source="local"` default)
- Modify: `src/pages/contact/careers/index.astro` (closing CTA → two-column: copy/buttons + form, `source="careers"`)
- Modify: `src/pages/contact/worldwide/index.astro` (closing CTA → add form, `source="worldwide"`)

- [ ] **Step 1–3:** Add `<EnquiryForm client:visible source=... />` to each section, preserving existing copy/buttons.
- [ ] **Step 4: Verify** each page returns 200 and renders the form (curl + grep).
- [ ] **Step 5: Commit** `feat(contact): add enquiry forms to careers, worldwide, local`

---

## Task 6: Dashboard — Messages + Settings tabs

**Files:**
- Create: `src/components/admin/MessagesTab.tsx` (list, source/status filter, expandable message, mark read/archive, delete — follows `JobsTab` pattern)
- Create: `src/components/admin/SettingsTab.tsx` (edit `recipient_email` per source, save)
- Modify: `src/components/admin/Dashboard.tsx` (add `messages` + `settings` to the `Tab` union, `HEADINGS`, nav buttons, and render switch)

- [ ] **Step 1–3:** Implement tabs + register them.
- [ ] **Step 4: Verify** `npm run build`; sign in to `/admin`, see both tabs.
- [ ] **Step 5: Commit** `feat(admin): add Messages + Settings tabs`

---

## Task 7: Resend Edge Function

**Files:**
- Create: `supabase/functions/contact-notify/index.ts`
- Create: `supabase/functions/contact-notify/deno.json`

- [ ] **Step 1: Implement the function**

```ts
// supabase/functions/contact-notify/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'Elysée Website <onboarding@resend.dev>';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') return json({ error: 'missing id' }, 400);

    const { data: sub } = await admin.from('contact_submissions').select('*').eq('id', id).single();
    if (!sub) return json({ error: 'not found' }, 404);
    if (sub.notified_at) return json({ ok: true, already: true });

    const { data: setting } = await admin
      .from('contact_settings').select('recipient_email').eq('source', sub.source).maybeSingle();
    const { data: fallback } = await admin
      .from('contact_settings').select('recipient_email').eq('source', 'general').maybeSingle();
    const to = setting?.recipient_email ?? fallback?.recipient_email;
    if (!to) return json({ error: 'no recipient configured' }, 500);

    const rows = [
      ['Name', sub.name], ['Email', sub.email], ['Company', sub.company ?? '—'],
      ['Phone', sub.phone ?? '—'], ['Source', sub.source], ['Page', sub.page_path ?? '—'],
    ].map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${k}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`).join('');
    const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#4c6830">New ${esc(sub.source)} enquiry</h2>
      <table style="font-size:14px">${rows}</table>
      <p style="white-space:pre-wrap;border-left:3px solid #4c6830;padding-left:12px;margin-top:16px">${esc(sub.message)}</p>
    </div>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: RESEND_FROM, to, reply_to: sub.email, subject: `New ${sub.source} enquiry from ${sub.name}`, html }),
    });
    if (!resp.ok) return json({ error: `resend ${resp.status}: ${await resp.text()}` }, 502);

    await admin.from('contact_submissions').update({ notified_at: new Date().toISOString() }).eq('id', id);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
```

`deno.json`:
```json
{ "imports": {} }
```

- [ ] **Step 2: Deploy + secrets** (documented in `docs/contact-forms-deploy.md`)

```bash
supabase functions deploy contact-notify
supabase secrets set RESEND_API_KEY=re_xxx RESEND_FROM='Elysée Website <noreply@yourdomain>'
```

- [ ] **Step 3: Verify** — submit a test enquiry; confirm row in DB + email received + `notified_at` set.
- [ ] **Step 4: Commit** `feat(contact): add Resend notification edge function`

---

## Task 8: Deploy runbook

**Files:**
- Create: `docs/contact-forms-deploy.md`

- [ ] Document: apply migration, deploy function, set `RESEND_API_KEY`/`RESEND_FROM`, verify a sending domain in Resend, edit recipients in the dashboard Settings tab, how the honeypot + RLS protect the form, and that submissions persist even if email fails.

---

## Self-Review

- **Spec coverage:** form on careers ✓ (Task 5); reusable across sections ✓ (Tasks 4–5); recipient set in dashboard ✓ (Task 6 Settings + Task 1 `contact_settings`); all submissions visible in dashboard ✓ (Task 6 Messages); Resend delivery ✓ (Task 7).
- **Type consistency:** `ContactDraft` keys used identically in `emptyDraft`, `validateDraft`, `submitEnquiry`, and `EnquiryForm`. `source` strings (`general/careers/local/worldwide`) match seed rows.
- **Security:** anon may INSERT only; no anon SELECT on submissions or settings; service-role-only function reads recipients; honeypot + length CHECK constraints.
