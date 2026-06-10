# Dashboard-Managed Certifications + Contact Forms Everywhere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **IMPORTANT (user rule):** Do NOT `git commit` or `git push` at any point. The user reviews all work first. Commit steps are intentionally omitted.

**Goal:** Certifications on `/green-elysee/certifications/` and `/about-us/quality-certifications/` become database rows manageable (add/edit/delete, PDF + badge upload) from the admin dashboard; every contact-section page (wise, prime, rohrsysteme) and three Green Elysée pages (certifications, reports, insights) get the existing `EnquiryForm`, each with its own dashboard-configurable recipient.

**Architecture:** Mirrors the existing Jobs/Posts/Countries pattern exactly: a Postgres table guarded by RLS (public reads active rows, authenticated full access), a public Supabase Storage bucket for files, a `src/lib/<entity>.ts` module with pure tested helpers, an admin Tab+Form pair in `src/components/admin/`, and public React islands fetching client-side with a server-rendered fallback. Contact forms reuse `EnquiryForm` + `contact_settings` rows (Settings tab and Messages tab pick up new sources automatically).

**Tech Stack:** Astro 6, React islands, Supabase (Postgres + Storage + RLS), Tailwind, GSAP, Vitest.

---

## File Structure

```
supabase/migrations/0008_certifications.sql      (new — table, RLS, storage bucket)
supabase/migrations/0009_seed_certifications.sql (new — 6 green + 6 quality rows)
supabase/migrations/0010_contact_sources.sql     (new — 6 new contact_settings rows)
src/types/certification.ts                       (new — row + draft types)
src/lib/certifications.ts                        (new — sort/validate/upload helpers)
src/lib/certifications.test.ts                   (new — vitest for pure helpers)
src/components/admin/CertificationForm.tsx        (new — create/edit form w/ uploads)
src/components/admin/CertificationsTab.tsx        (new — list per group + CRUD)
src/components/admin/Dashboard.tsx                (modify — add 'certs' tab)
src/components/certifications/CertificationsGrid.tsx (new — public island, both pages)
src/pages/green-elysee/certifications/index.astro (modify — island, dynamic counts, form)
src/pages/about-us/quality-certifications/index.astro (modify — island)
src/pages/green-elysee/reports/index.astro        (modify — form in closing CTA)
src/pages/green-elysee/insights/index.astro       (modify — form in closing CTA)
src/pages/contact/wise/index.astro                (modify — form section)
src/pages/contact/prime/index.astro               (modify — form section)
src/pages/contact/rohrsysteme/index.astro         (modify — form section)
```

---

### Task 1: Migration — certifications table, RLS, storage bucket

**Files:**
- Create: `supabase/migrations/0008_certifications.sql`

- [ ] **Step 1: Write the migration**

```sql
-- public.certifications: backing table for the admin certifications dashboard.
-- cert_group 'green'  -> /green-elysee/certifications/ cards
-- cert_group 'quality'-> /about-us/quality-certifications/ category cards
create table if not exists public.certifications (
  id          uuid primary key default gen_random_uuid(),
  cert_group  text not null check (cert_group in ('green','quality')),
  name        text not null,
  description text not null,
  scope       text,
  tag         text,
  logo        text,
  pdf_url     text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists certifications_group_sort_idx
  on public.certifications (cert_group, sort_order, name);

-- Reuse the set_updated_at() trigger function from 0001_jobs.sql.
drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at
  before update on public.certifications
  for each row execute function public.set_updated_at();

-- RLS
alter table public.certifications enable row level security;

drop policy if exists "public read active certifications" on public.certifications;
create policy "public read active certifications"
on public.certifications for select
to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on certifications" on public.certifications;
create policy "authenticated full access on certifications"
on public.certifications for all
to authenticated
using (true) with check (true);

-- Storage: bucket for certificate PDFs and badge images.
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read certificates" on storage.objects;
create policy "public read certificates"
on storage.objects for select to anon, authenticated
using (bucket_id = 'certificates');

drop policy if exists "authenticated write certificates" on storage.objects;
create policy "authenticated write certificates"
on storage.objects for insert to authenticated
with check (bucket_id = 'certificates');

drop policy if exists "authenticated update certificates" on storage.objects;
create policy "authenticated update certificates"
on storage.objects for update to authenticated
using (bucket_id = 'certificates');

drop policy if exists "authenticated delete certificates" on storage.objects;
create policy "authenticated delete certificates"
on storage.objects for delete to authenticated
using (bucket_id = 'certificates');
```

---

### Task 2: Migration — seed current certifications

**Files:**
- Create: `supabase/migrations/0009_seed_certifications.sql`

- [ ] **Step 1: Write the seed migration** (data copied verbatim from `src/data/site-content.ts` `greenCertificationItems` and the quality page's pillars + `categoryImages`)

```sql
-- Seed: current hardcoded certifications so both pages render identically on day one.
-- Idempotent: skips if any row for the group already exists.
insert into public.certifications
  (cert_group, name, description, scope, tag, logo, pdf_url, sort_order)
select * from (values
  ('green', 'ISO 14001', 'Environmental Management System',
   'Systematic management of environmental responsibilities across all operations.',
   null, '/images/certifications/iso-14001.svg',
   'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng-P3D42.pdf', 1),
  ('green', 'ISCC PLUS', 'International Sustainability and Carbon Certification',
   'Traceability of sustainable and recycled raw materials through the supply chain.',
   null, '/images/certifications/iscc-plus.svg',
   'https://elysee.com.cy/uploads/originals/249/certificate-2025.pdf', 2),
  ('green', 'ISO 14064-3:2019', 'Greenhouse Gas Validation and Verification',
   'Independent verification of greenhouse-gas emission statements.',
   null, '/images/certifications/iso-14064-3.svg',
   'https://elysee.com.cy/uploads/originals/249/iso14064-year-2024-qZNLq.pdf', 3),
  ('green', 'EMAS 2024', 'EU Eco-Management and Audit Scheme',
   'Public environmental statement audited under EU EMAS Regulation.',
   null, '/images/certifications/emas.svg',
   'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469.pdf', 4),
  ('green', 'CYS EN ISO 50001:2018', 'Energy Management System',
   'Continual improvement of energy performance across production sites.',
   null, '/images/certifications/iso-50001.svg',
   'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473.pdf', 5),
  ('green', 'Environmental Declaration 2024', 'Annual environmental performance report',
   'Annual disclosure of environmental performance, audited and published.',
   null, '/images/certifications/environmental-declaration.svg',
   'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-11WmU.pdf', 6),
  ('quality', 'Management System',
   'ISO 9001 quality management — certified since 1998 and renewed continuously.',
   null, 'MGMT', '/images/certifications/categories/management-system.png', null, 1),
  ('quality', 'General',
   'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.',
   null, 'GEN', '/images/certifications/categories/general.png', null, 2),
  ('quality', 'Compression Fittings',
   'Product certifications covering the full Elysée compression-fitting range for water-supply applications.',
   null, 'CF', '/images/certifications/categories/compression-fittings.png', null, 3),
  ('quality', 'PE Pipes',
   'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.',
   null, 'PE', '/images/certifications/categories/pe-pipes.png', null, 4),
  ('quality', 'PVC Pipes',
   'PVC pipe certifications for water-supply, drainage and infrastructure applications.',
   null, 'PVC', '/images/certifications/categories/pvc-pipes.png', null, 5),
  ('quality', 'Green Elysée',
   'Environmental and sustainability certifications attached to the Green Elysée product line.',
   null, 'GRN', '/images/certifications/categories/green-elysee.jpg', null, 6)
) as seed(cert_group, name, description, scope, tag, logo, pdf_url, sort_order)
where not exists (
  select 1 from public.certifications c where c.cert_group = seed.cert_group
);
```

Note: green rows carry `scope` in column 4 and `tag` null; quality rows carry `tag` and `scope` null. The VALUES list above puts scope and tag in the right columns for each row (green rows: scope text, tag null; quality rows: scope null, tag code).

---

### Task 3: Migration — new contact sources

**Files:**
- Create: `supabase/migrations/0010_contact_sources.sql`

- [ ] **Step 1: Write the migration**

```sql
-- New per-form contact sources. Settings tab lists these automatically;
-- the contact-notify edge function reads recipient_email per source.
insert into public.contact_settings (source, label, recipient_email) values
  ('wise',                 'Elysée WISE',                  'info@elysee.com.cy'),
  ('prime',                'Elysée PRIME',                 'info@elysee.com.cy'),
  ('rohrsysteme',          'Elysée Rohrsysteme',           'info@elysee.com.cy'),
  ('green-certifications', 'Green — certificate requests', 'info@elysee.com.cy'),
  ('green-reports',        'Green — report archive',       'info@elysee.com.cy'),
  ('green-insights',       'Green — press & insights',     'info@elysee.com.cy')
on conflict (source) do nothing;
```

---

### Task 4: Types

**Files:**
- Create: `src/types/certification.ts`

- [ ] **Step 1: Write the types** (mirrors `src/types/post.ts`)

```ts
export type CertGroup = 'green' | 'quality';

export interface Certification {
  id: string;
  cert_group: CertGroup;
  name: string;
  description: string;
  scope: string | null;
  tag: string | null;
  logo: string | null;
  pdf_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CertificationDraft = Omit<Certification, 'id' | 'created_at' | 'updated_at'>;
```

---

### Task 5: Lib helpers (TDD)

**Files:**
- Test: `src/lib/certifications.test.ts`
- Create: `src/lib/certifications.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  sortCertifications,
  nextSortOrder,
  validateCertificationFile,
} from './certifications';
import type { Certification } from '../types/certification';

const cert = (over: Partial<Certification>): Certification => ({
  id: 'x', cert_group: 'green', name: 'A', description: 'd', scope: null,
  tag: null, logo: null, pdf_url: null, sort_order: 0, is_active: true,
  created_at: '', updated_at: '', ...over,
});

describe('sortCertifications', () => {
  it('orders by sort_order, then name', () => {
    const out = sortCertifications([
      cert({ name: 'B', sort_order: 2 }),
      cert({ name: 'Z', sort_order: 1 }),
      cert({ name: 'A', sort_order: 2 }),
    ]);
    expect(out.map((c) => c.name)).toEqual(['Z', 'A', 'B']);
  });

  it('does not mutate the input array', () => {
    const input = [cert({ sort_order: 2 }), cert({ sort_order: 1 })];
    sortCertifications(input);
    expect(input[0].sort_order).toBe(2);
  });
});

describe('nextSortOrder', () => {
  it('returns 1 for an empty list', () => {
    expect(nextSortOrder([])).toBe(1);
  });
  it('returns max + 1', () => {
    expect(nextSortOrder([cert({ sort_order: 4 }), cert({ sort_order: 9 })])).toBe(10);
  });
});

describe('validateCertificationFile', () => {
  it('accepts a small PDF as pdf', () => {
    expect(validateCertificationFile({ type: 'application/pdf', size: 1024 }, 'pdf')).toBeNull();
  });
  it('rejects a non-PDF as pdf', () => {
    expect(validateCertificationFile({ type: 'image/png', size: 1024 }, 'pdf')).toMatch(/PDF/);
  });
  it('rejects a PDF over 10 MB', () => {
    expect(validateCertificationFile({ type: 'application/pdf', size: 11 * 1024 * 1024 }, 'pdf')).toMatch(/10 MB/);
  });
  it('accepts svg/png/jpeg/webp as badge', () => {
    for (const type of ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']) {
      expect(validateCertificationFile({ type, size: 1024 }, 'badge')).toBeNull();
    }
  });
  it('rejects a badge over 2 MB', () => {
    expect(validateCertificationFile({ type: 'image/png', size: 3 * 1024 * 1024 }, 'badge')).toMatch(/2 MB/);
  });
  it('rejects a pdf file as badge', () => {
    expect(validateCertificationFile({ type: 'application/pdf', size: 1024 }, 'badge')).toMatch(/image/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/certifications.test.ts`
Expected: FAIL — `Cannot find module './certifications'` (or equivalent).

- [ ] **Step 3: Write the implementation**

```ts
import { supabase } from './supabase';
import type { Certification } from '../types/certification';

/** Stable sort: sort_order ascending, ties broken by name. */
export function sortCertifications(certs: Certification[]): Certification[] {
  return [...certs].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
}

/** Next sort_order for a new certification within a group. */
export function nextSortOrder(certs: Pick<Certification, 'sort_order'>[]): number {
  return certs.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;
}

const PDF_MAX = 10 * 1024 * 1024;
const BADGE_MAX = 2 * 1024 * 1024;
const BADGE_MIME = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];

/** Returns an error message, or null when the file is acceptable. */
export function validateCertificationFile(
  file: { type: string; size: number },
  kind: 'pdf' | 'badge',
): string | null {
  if (kind === 'pdf') {
    if (file.type !== 'application/pdf') return 'Certificate must be a PDF file.';
    if (file.size > PDF_MAX) return 'PDF must be 10 MB or smaller.';
    return null;
  }
  if (!BADGE_MIME.includes(file.type)) return 'Badge must be an image (SVG, PNG, JPEG or WebP).';
  if (file.size > BADGE_MAX) return 'Badge image must be 2 MB or smaller.';
  return null;
}

const EXT_FALLBACK: Record<'pdf' | 'badge', string> = { pdf: 'pdf', badge: 'png' };

/** Upload a certificate asset and return its public URL. */
export async function uploadCertificationAsset(
  file: File,
  certId: string,
  kind: 'pdf' | 'badge',
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? EXT_FALLBACK[kind]).toLowerCase();
  const path = `${certId}/${kind}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('certificates')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('certificates').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/certifications.test.ts`
Expected: PASS (8 tests).

---

### Task 6: Admin — CertificationForm

**Files:**
- Create: `src/components/admin/CertificationForm.tsx`

Follows `PostForm.tsx` exactly (same `Field`, `inputClass`, two-step save: row first, then uploads keyed by row id). Full component:

- [ ] **Step 1: Write the component**

```tsx
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadCertificationAsset, validateCertificationFile } from '../../lib/certifications';
import type { Certification, CertificationDraft, CertGroup } from '../../types/certification';

type Props = {
  group: CertGroup;
  initialSortOrder: number;
  initial?: Certification;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(group: CertGroup, sortOrder: number): CertificationDraft {
  return {
    cert_group: group, name: '', description: '', scope: null, tag: null,
    logo: null, pdf_url: null, sort_order: sortOrder, is_active: true,
  };
}

function toDraft(c: Certification): CertificationDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = c;
  return rest;
}

export default function CertificationForm({ group, initialSortOrder, initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<CertificationDraft>(() =>
    initial ? toDraft(initial) : emptyDraft(group, initialSortOrder));
  const [pendingBadge, setPendingBadge] = useState<File | null>(null);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(initial?.logo ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const badgeInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof CertificationDraft>(key: K, value: CertificationDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCertificationFile(f, 'badge');
    if (problem) { setError(problem); e.target.value = ''; return; }
    setPendingBadge(f);
    setBadgePreview(URL.createObjectURL(f));
  };

  const onPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCertificationFile(f, 'pdf');
    if (problem) { setError(problem); e.target.value = ''; return; }
    setPendingPdf(f);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CertificationDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        scope: draft.scope?.trim() || null,
        tag: draft.tag?.trim() || null,
        pdf_url: draft.pdf_url?.trim() || null,
      };
      if (!payload.name) throw new Error('Name is required.');

      // Step 1: create/update the row first — uploads are namespaced by row id.
      let cert: Certification;
      if (initial) {
        const { data, error: err } = await supabase
          .from('certifications').update(payload).eq('id', initial.id).select().single();
        if (err) throw err;
        cert = data as Certification;
      } else {
        const { data, error: err } = await supabase
          .from('certifications').insert(payload).select().single();
        if (err) throw err;
        cert = data as Certification;
      }

      // Step 2: uploads, then patch the row with the new URLs.
      const patch: Partial<CertificationDraft> = {};
      if (pendingBadge) patch.logo = (await uploadCertificationAsset(pendingBadge, cert.id, 'badge')).url;
      if (pendingPdf) patch.pdf_url = (await uploadCertificationAsset(pendingPdf, cert.id, 'pdf')).url;
      if (Object.keys(patch).length > 0) {
        const { error: err } = await supabase.from('certifications').update(patch).eq('id', cert.id);
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit certification' : 'New certification'}
          <span className="ml-3 text-[10px] uppercase tracking-[0.25em] text-ink/50 align-middle">
            {group === 'green' ? 'Green Elysée' : 'Quality'}
          </span>
        </h2>
        <button type="button" onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer">
          Cancel
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          {error}
        </p>
      )}

      <Field label="Name" required>
        <input type="text" required value={draft.name}
          onChange={(e) => update('name', e.currentTarget.value)} className={inputClass} />
      </Field>

      <Field label="Description" required hint="Short line shown under the name.">
        <input type="text" required value={draft.description}
          onChange={(e) => update('description', e.currentTarget.value)} className={inputClass} />
      </Field>

      <Field label="Scope" hint="Optional longer text shown on the card.">
        <textarea rows={2} value={draft.scope ?? ''}
          onChange={(e) => update('scope', e.currentTarget.value)}
          className={`${inputClass} resize-y`} />
      </Field>

      {group === 'quality' && (
        <Field label="Tag" hint="Short code shown on the card header, e.g. MGMT, PE, PVC.">
          <input type="text" maxLength={6} value={draft.tag ?? ''}
            onChange={(e) => update('tag', e.currentTarget.value.toUpperCase())} className={inputClass} />
        </Field>
      )}

      <Field label="Badge image" hint="SVG, PNG, JPEG or WebP. Max 2 MB.">
        <div className="mt-2 flex items-center gap-4">
          {badgePreview ? (
            <div className="relative w-28 h-28 bg-surface-alt rounded overflow-hidden border border-ink/10 flex items-center justify-center p-2">
              <img src={badgePreview} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-28 h-28 bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No badge</span>
            </div>
          )}
          <input ref={badgeInputRef} type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={onBadgeChange} className="text-sm text-ink/80" />
        </div>
      </Field>

      <Field label="Certificate PDF" hint="Upload a PDF (max 10 MB) — or paste an external URL below.">
        <div className="mt-2 space-y-2">
          <input ref={pdfInputRef} type="file" accept="application/pdf"
            onChange={onPdfChange} className="text-sm text-ink/80" />
          {pendingPdf && (
            <p className="text-[11px] text-ink/60">Will upload: {pendingPdf.name}</p>
          )}
          <input type="url" value={draft.pdf_url ?? ''} placeholder="https://… (current PDF link)"
            onChange={(e) => update('pdf_url', e.currentTarget.value)} className={inputClass} />
        </div>
      </Field>

      <Field label="Sort order" hint="Cards are ordered by this number, ascending.">
        <input type="number" value={draft.sort_order}
          onChange={(e) => update('sort_order', Number(e.currentTarget.value))} className={inputClass} />
      </Field>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={draft.is_active}
          onChange={(e) => update('is_active', e.currentTarget.checked)} />
        <span className="text-sm text-ink/85">Visible on the website</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create certification'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
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

---

### Task 7: Admin — CertificationsTab + Dashboard wiring

**Files:**
- Create: `src/components/admin/CertificationsTab.tsx`
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Write the tab** (follows `CountriesTab.tsx`; group toggle instead of search)

```tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Certification, CertGroup } from '../../types/certification';
import { sortCertifications, nextSortOrder } from '../../lib/certifications';
import CertificationForm from './CertificationForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; cert: Certification };

const GROUPS: { value: CertGroup; label: string }[] = [
  { value: 'green', label: 'Green Elysée' },
  { value: 'quality', label: 'Quality (About Us)' },
];

export default function CertificationsTab() {
  const [certs, setCerts] = useState<Certification[] | null>(null);
  const [group, setGroup] = useState<CertGroup>('green');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) { setError(err.message); return; }
    setCerts((data ?? []) as Certification[]);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => sortCertifications((certs ?? []).filter((c) => c.cert_group === group)),
    [certs, group],
  );

  const toggleActive = async (cert: Certification) => {
    const { error: err } = await supabase
      .from('certifications')
      .update({ is_active: !cert.is_active })
      .eq('id', cert.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (cert: Certification) => {
    if (!confirm(`Delete "${cert.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('certifications').delete().eq('id', cert.id);
    if (err) return setError(err.message);
    await load();
  };

  const groupBtn = (g: CertGroup) =>
    `px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] cursor-pointer transition-colors duration-200 ${
      group === g ? 'bg-ink text-surface' : 'text-ink/60 hover:text-brand-500'
    }`;

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 border border-ink/10">
              {GROUPS.map((g) => (
                <button key={g.value} type="button" onClick={() => setGroup(g.value)} className={groupBtn(g.value)}>
                  {g.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New certification
            </button>
          </div>

          {certs === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-ink/60">No certifications in this group yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Badge</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">PDF</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id} className="border-b border-ink/5 last:border-b-0">
                      <td className="px-4 py-3 text-ink/60">{c.sort_order}</td>
                      <td className="px-4 py-3">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-ink">{c.name}</span>
                        <span className="block text-[11px] text-ink/55">{c.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.pdf_url ? (
                          <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer">
                            View PDF
                          </a>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={
                          c.is_active
                            ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                            : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                        }>
                          {c.is_active ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                          <button onClick={() => setMode({ kind: 'edit', cert: c })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => toggleActive(c)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            {c.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => remove(c)} className="text-red-600 hover:text-red-800 cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <CertificationForm
          group={group}
          initialSortOrder={nextSortOrder(visible)}
          onSaved={async () => { setMode({ kind: 'list' }); await load(); }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CertificationForm
          group={group}
          initialSortOrder={mode.cert.sort_order}
          initial={mode.cert}
          onSaved={async () => { setMode({ kind: 'list' }); await load(); }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Wire into Dashboard.tsx**

In `src/components/admin/Dashboard.tsx`:
- Add import: `import CertificationsTab from './CertificationsTab';`
- Extend the type: `type Tab = 'jobs' | 'posts' | 'countries' | 'certs' | 'messages' | 'settings';`
- Add to HEADINGS: `certs: 'Certifications.',`
- Add nav button after Countries:

```tsx
<button type="button" onClick={() => setTab('certs')} className={tabClass('certs')}>
  Certifications
</button>
```

- Add render: `{tab === 'certs' && <CertificationsTab />}`

- [ ] **Step 3: Verify** — `npx vitest run` passes; open http://localhost:4322/admin/, sign in, see the Certifications tab listing both groups (after Task 14 applies migrations).

---

### Task 8: Public island — CertificationsGrid

**Files:**
- Create: `src/components/certifications/CertificationsGrid.tsx`

Renders both page variants. Fetches active rows for its group; falls back to the server-provided list on fetch failure (so the pages never look broken). Moves the GSAP stamp-in animation (previously an inline Astro script) into the island, and updates any `[data-cert-count]` element on the page with the live count.

- [ ] **Step 1: Write the island**

```tsx
import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { sortCertifications } from '../../lib/certifications';
import type { Certification, CertGroup } from '../../types/certification';

/** Subset of Certification needed to render a card (fallback rows use this). */
export interface CertCard {
  name: string;
  description: string;
  scope: string | null;
  tag: string | null;
  logo: string | null;
  pdf_url: string | null;
}

interface Props {
  group: CertGroup;
  /** Server-rendered fallback used when Supabase is unreachable. */
  fallback: CertCard[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; certs: CertCard[] };

export default function CertificationsGrid({ group, fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const gridRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'ready', certs: fallback });
        return;
      }
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('cert_group', group)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        // Network/RLS problem (or empty table pre-migration): keep the page whole.
        setState({ kind: 'ready', certs: error ? fallback : (data?.length ? (data as Certification[]) : fallback) });
        return;
      }
      setState({ kind: 'ready', certs: sortCertifications(data as Certification[]) });
    })();
    return () => { cancelled = true; };
  }, [group]);

  // Keep "N standards / N certifications" copy elsewhere on the page truthful.
  useEffect(() => {
    if (state.kind !== 'ready') return;
    document.querySelectorAll('[data-cert-count]').forEach((el) => {
      el.textContent = String(state.certs.length);
    });
  }, [state]);

  // Stamp-in animation — ported from the page's previous inline GSAP script.
  useEffect(() => {
    if (state.kind !== 'ready' || !gridRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = gridRef.current;
    const cards = Array.from(grid.querySelectorAll('[data-cert-card]')) as HTMLElement[];
    const badges = Array.from(grid.querySelectorAll('[data-cert-badge]')) as HTMLElement[];
    if (reduce) {
      [...cards, ...badges].forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(cards, { y: 32, opacity: 0 });
        gsap.set(badges, { rotate: -8, scale: 0.85, opacity: 0, transformOrigin: '50% 50%' });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
            gsap.to(badges, { rotate: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2.4)', stagger: 0.1, delay: 0.15 });
          },
        });
        ScrollTrigger.refresh();
      }, grid);
    })();
    return () => ctx?.revert();
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="bg-surface min-h-[420px] animate-pulse">
            <div className="bg-surface-alt border-b border-ink/10 aspect-[4/3]"></div>
            <div className="p-7 space-y-3">
              <div className="h-3 w-16 bg-ink/10 rounded"></div>
              <div className="h-6 w-3/4 bg-ink/10 rounded"></div>
              <div className="h-3 w-full bg-ink/10 rounded"></div>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const prefix = group === 'green' ? 'Cert.' : 'Cat.';

  return (
    <ol ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
      {state.certs.map((c, i) => {
        const num = String(i + 1).padStart(2, '0');
        return (
          <li key={`${c.name}-${i}`} data-cert-card className="group relative bg-surface flex flex-col overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 right-3 font-display font-heavy text-brand-500/10 leading-none select-none transition-colors duration-500 group-hover:text-brand-500/30 z-10"
              style={{ fontSize: 'clamp(4.5rem, 7vw, 7rem)' }}
            >{num}</span>

            <div className="bg-surface-alt border-b border-ink/10 aspect-[4/3] flex items-center justify-center p-8 md:p-10 overflow-hidden">
              {c.logo ? (
                <img
                  data-cert-badge
                  src={c.logo}
                  alt={`${c.name} certification badge`}
                  width="200"
                  height="200"
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.25em] text-ink/40">Certified</span>
              )}
            </div>

            <div className="relative p-7 md:p-8 flex-1 flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
                {prefix}{num}{c.tag ? ` · ${c.tag}` : ''}
              </span>
              <h3 className="mt-4 font-display font-heavy leading-tight text-xl md:text-2xl text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/70 leading-snug">{c.description}</p>
              <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-20"></div>
              {c.scope && <p className="mt-4 text-sm text-ink/70 leading-[1.6] flex-1">{c.scope}</p>}
              {c.pdf_url && (
                <a
                  href={c.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-brand-500 transition-colors duration-200 cursor-pointer"
                  aria-label={`Download ${c.name} certificate (PDF)`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Download PDF</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

---

### Task 9: Green certifications page — island + dynamic counts + enquiry form

**Files:**
- Modify: `src/pages/green-elysee/certifications/index.astro`

- [ ] **Step 1: Frontmatter — add imports and fallback**

Add to imports:
```astro
import CertificationsGrid from '../../../components/certifications/CertificationsGrid.tsx';
import EnquiryForm from '../../../components/contact/EnquiryForm.tsx';
```

Add after the existing `const desc = …`:
```ts
// Server-rendered fallback for the island when Supabase is unreachable.
const certFallback = greenCertificationItems.map((c) => ({
  name: c.name, description: c.description, scope: c.scope ?? null,
  tag: null, logo: c.logo, pdf_url: c.href,
}));
```

- [ ] **Step 2: Make the three count mentions dynamic**

1. Hero line `<span>Six certified standards</span>` → `<span><span data-cert-count>6</span> certified standards</span>`
2. Stat band `<dd data-counter="6" …>6</dd>` → `<dd data-counter="6" data-cert-count …>6</dd>`
3. Grid heading `Six standards. Six PDFs.` → `<span data-cert-count>6</span> standards. <span data-cert-count>6</span> PDFs.`

- [ ] **Step 3: Replace the hardcoded `<ol data-green-cert-grid>…</ol>` block** (the whole `<ol>` element) with:

```astro
<CertificationsGrid client:visible group="green" fallback={certFallback} />
```

- [ ] **Step 4: Delete the now-dead GSAP script block** (the entire `{/* ===== GSAP — certification badges stamp-in ===== */}` `<script>` at the bottom of the file — the island owns this animation now). Keep the motion (scroll bar + hero parallax) script.

- [ ] **Step 5: Rework the closing CTA into text + form** — replace the existing `{/* ===== CLOSING CTA ===== */}` section with:

```astro
{/* ===== CLOSING CTA — request a certificate ===== */}
<section class="bg-brand-500/10">
  <Container size="xl" class="py-16 md:py-24">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      <div class="lg:pt-4">
        <p data-reveal class="text-[11px] uppercase tracking-[0.4em] text-brand-500 mb-6">Request a certificate</p>
        <p data-reveal data-reveal-delay="120" class="text-base md:text-lg text-ink/80 leading-relaxed max-w-xl">
          Need an older certificate, a tender-ready bundle, or evidence for a specific product family? Our team can prepare it on request.
        </p>
        <a
          data-reveal
          data-reveal-delay="240"
          href="/contact/local/"
          class="group cursor-pointer mt-8 md:mt-10 inline-flex items-center gap-3 px-6 py-3 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] md:text-xs uppercase tracking-[0.25em] transition-colors duration-200"
        >
          <span>Contact our local network</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>

      <div data-reveal data-reveal-delay="200" class="bg-surface p-6 md:p-8 border border-ink/10">
        <EnquiryForm
          client:visible
          source="green-certifications"
          title="Request a certificate"
          subtitle="Tell us which certificate, bundle, or product family you need evidence for — the team will prepare it."
        />
      </div>
    </div>
  </Container>
</section>
```

---

### Task 10: Quality certifications page — island

**Files:**
- Modify: `src/pages/about-us/quality-certifications/index.astro`

- [ ] **Step 1: Frontmatter** — add import:

```astro
import CertificationsGrid from '../../../components/certifications/CertificationsGrid.tsx';
```

Add after `categoryImages`:
```ts
// Server-rendered fallback for the island when Supabase is unreachable.
const certFallback = (categories?.items ?? []).map((cat) => ({
  name: cat.title, description: cat.body, scope: null,
  tag: categoryImages[cat.number]?.tag ?? null,
  logo: categoryImages[cat.number]?.src ?? null,
  pdf_url: null,
}));
```

- [ ] **Step 2: Replace the hardcoded `<ol data-cert-grid>…</ol>` block** with:

```astro
<CertificationsGrid client:visible group="quality" fallback={certFallback} />
```

- [ ] **Step 3: Trim the GSAP script** — in the bottom GSAP script, delete only the certification-grid stamp-in part (the code operating on `[data-cert-grid]` / `[data-cert-card]` / `[data-cert-badge]`); keep the verify-rail cascade.

Note: the quality cards previously had a self-referencing "View certificates" link; the island shows a "Download PDF" link only when a PDF is attached, which is the desired behaviour.

---

### Task 11: Reports page — enquiry form

**Files:**
- Modify: `src/pages/green-elysee/reports/index.astro`

- [ ] **Step 1:** Add `import EnquiryForm from '../../../components/contact/EnquiryForm.tsx';` to frontmatter.

- [ ] **Step 2:** Replace the `{/* ===== CLOSING CTA ===== */}` section with the same two-column structure as Task 9 Step 5, with this left text and form props (keep the existing `href="/contact/local/"` secondary link with label `Contact our local network`):

- Left eyebrow: `Request an archive copy`
- Left paragraph (existing copy, unchanged): `Looking for an older annual report or a specific data series? Our sustainability team can share archived editions on request.`
- Form props:

```astro
<EnquiryForm
  client:visible
  source="green-reports"
  title="Request an archive copy"
  subtitle="Tell us which report or data series you need and the sustainability team will share the archived edition."
/>
```

---

### Task 12: Insights page — enquiry form

**Files:**
- Modify: `src/pages/green-elysee/insights/index.astro`

- [ ] **Step 1:** Add `import EnquiryForm from '../../../components/contact/EnquiryForm.tsx';` to frontmatter.

- [ ] **Step 2:** Replace the `{/* ===== CLOSING CTA ===== */}` section with the two-column structure. Keep BOTH existing buttons ("Browse the Press Room" + the second one) in the left column under the paragraph. Left eyebrow: `Press & partnerships`. Left paragraph (existing copy, unchanged): `Have a story idea, or want to feature the Green Elysée programme in your publication? Press inquiries and partnership requests are welcome.` Form props:

```astro
<EnquiryForm
  client:visible
  source="green-insights"
  title="Press & partnership enquiries"
  subtitle="Tell us about your publication or partnership idea and the Green Elysée team will get back to you."
/>
```

---

### Task 13: Contact pages — wise, prime, rohrsysteme forms

**Files:**
- Modify: `src/pages/contact/wise/index.astro`
- Modify: `src/pages/contact/prime/index.astro`
- Modify: `src/pages/contact/rohrsysteme/index.astro`

- [ ] **Step 1:** In each file add to frontmatter (adjust relative depth to match the file's existing imports):

```astro
import EnquiryForm from '../../../components/contact/EnquiryForm.tsx';
```

- [ ] **Step 2:** In each file, insert this section immediately BEFORE the closing CTA section (or before the final `<script>` blocks if there is no closing CTA). Use the matching `source` / `title` per page:

```astro
{/* ===== ENQUIRY FORM ===== */}
<Section bg="alt" spacing="lg">
  <Container size="lg">
    <div data-reveal class="mx-auto max-w-3xl bg-surface p-6 md:p-8 border border-ink/10">
      <EnquiryForm
        client:visible
        source="wise"
        title="Contact Elysée WISE"
        subtitle="Send us a message and the Elysée WISE team will get back to you."
      />
    </div>
  </Container>
</Section>
```

Per-page values:
| Page | source | title | subtitle |
|---|---|---|---|
| wise | `wise` | Contact Elysée WISE | Send us a message and the Elysée WISE team will get back to you. |
| prime | `prime` | Contact Elysée PRIME | Send us a message and the Elysée PRIME team will get back to you. |
| rohrsysteme | `rohrsysteme` | Contact Elysée Rohrsysteme | Send us a message and the Elysée Rohrsysteme team will get back to you. |

If a page does not already import `Section`/`Container`, add those imports too (both components exist in `src/components/`).

---

### Task 14: Apply migrations

- [ ] **Step 1:** `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx supabase db push` (project is already linked — `supabase/.temp/` exists). Expected: applies 0008, 0009, 0010.
- [ ] **Step 2:** If the CLI is not authenticated, fall back to pasting the three migration files into the Supabase dashboard SQL editor (same order), and note this in the final report.

---

### Task 15: Verification

- [ ] **Step 1:** `npx vitest run` — all suites pass (including the new `certifications.test.ts`).
- [ ] **Step 2:** `npx astro build` — builds clean (ignore the pre-existing tsconfig `baseUrl` deprecation warning from raw `tsc`).
- [ ] **Step 3:** Browser checks on http://localhost:4322 (Playwright or manual):
  - `/green-elysee/certifications/` — grid renders 6 cards from DB, counts show 6, form submits (row appears in admin Messages with source `green-certifications`).
  - `/about-us/quality-certifications/` — 6 category cards render from DB.
  - `/green-elysee/reports/` and `/green-elysee/insights/` — forms render.
  - `/contact/wise/`, `/contact/prime/`, `/contact/rohrsysteme/` — forms render.
  - `/admin/` — Certifications tab: create a test cert with PDF upload, see it appear on the public page, then delete it. Settings tab shows the 6 new sources.

---

## Self-Review Notes

- All copy/data values are copied verbatim from `src/data/site-content.ts` and the existing pages.
- `cert_group` is used (not `group`) to avoid quoting a reserved-ish identifier everywhere.
- The island falls back to server-provided data on error AND on empty-table (pre-migration) — admin-hidden-everything intentionally also falls back, which is the safer failure mode for a marketing page.
- `greenCertificationItems` stays in `site-content.ts` as the fallback source — do not delete it.
- No commits anywhere (user rule).
