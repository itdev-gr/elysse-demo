import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import MarkdownEditor from './MarkdownEditor';
import { slugify, uploadExhibitionImage } from '../../lib/exhibitions';
import type { Exhibition, ExhibitionDraft } from '../../types/exhibition';
import { triggerPublish } from '../../lib/publish';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

type Props = { initial?: Exhibition; onSaved: () => void; onCancel: () => void };

function emptyDraft(): ExhibitionDraft {
  return { slug: '', title: '', excerpt: '', body: '', event_date: '', card_date: null,
    venue: null, stand: null, image: null, image_alt: null, is_published: true };
}
function toDraft(a: Exhibition): ExhibitionDraft {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = a; return rest;
}

export default function ExhibitionForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<ExhibitionDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const update = <K extends keyof ExhibitionDraft>(k: K, v: ExhibitionDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const onTitleBlur = () => { if (draft.slug.trim() === '' && draft.title.trim() !== '') update('slug', slugify(draft.title)); };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null; if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) { setError('Image must be JPEG, PNG or WebP.'); e.target.value = ''; return; }
    if (f.size > MAX_BYTES) { setError('Image must be 4 MB or smaller.'); e.target.value = ''; return; }
    setPendingFile(f); setPreviewUrl(URL.createObjectURL(f));
  };
  const removeImage = () => { setPendingFile(null); setPreviewUrl(null); update('image', null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    try {
      const slug = slugify(draft.slug.trim()) || slugify(draft.title.trim());
      if (!slug) throw new Error('Slug is required.');
      const payload: ExhibitionDraft = {
        ...draft, slug,
        card_date: draft.card_date?.trim() || null,
        venue: draft.venue?.trim() || null,
        stand: draft.stand?.trim() || null,
        image_alt: draft.image_alt?.trim() || null,
      };
      let row: Exhibition;
      if (initial) {
        const { data, error: err } = await supabase.from('exhibitions').update(payload).eq('id', initial.id).select().single();
        if (err) throw err; row = data as Exhibition;
      } else {
        const { data, error: err } = await supabase.from('exhibitions').insert(payload).select().single();
        if (err) throw err; row = data as Exhibition;
      }
      if (pendingFile) {
        const { url } = await uploadExhibitionImage(pendingFile, row.id);
        const { error: err } = await supabase.from('exhibitions').update({ image: url }).eq('id', row.id);
        if (err) throw err;
      }
      triggerPublish(); onSaved();
    } catch (err) { setError((err as Error).message); } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">{initial ? 'Edit exhibition' : 'New exhibition'}</h2>
        <button type="button" onClick={onCancel} className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer">Cancel</button>
      </header>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">{error}</p>}

      <Field label="Title" required>
        <input type="text" required value={draft.title} onChange={(e) => update('title', e.currentTarget.value)} onBlur={onTitleBlur} className={inputClass} />
      </Field>
      <Field label="Slug" required hint="Lowercase letters, digits, hyphens. Used in the URL.">
        <input type="text" required pattern="[a-z0-9-]+" value={draft.slug} onChange={(e) => update('slug', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Event date" required hint="Full human date, e.g. 10–14 November 2026.">
        <input type="text" required value={draft.event_date} onChange={(e) => update('event_date', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Card date" hint="Short label for the list card, e.g. Nov 2026. Defaults to the event date.">
        <input type="text" value={draft.card_date ?? ''} onChange={(e) => update('card_date', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Venue" hint="e.g. Fiere Expo Center, Bologna.">
        <input type="text" value={draft.venue ?? ''} onChange={(e) => update('venue', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Stand" hint="e.g. Hall 21, Stand B28.">
        <input type="text" value={draft.stand ?? ''} onChange={(e) => update('stand', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Excerpt" required hint="Shown on the list card.">
        <textarea required rows={2} maxLength={300} value={draft.excerpt} onChange={(e) => update('excerpt', e.currentTarget.value)} className={`${inputClass} resize-y`} />
      </Field>
      <Field label="Image" hint="JPEG, PNG, or WebP. Max 4 MB. Optional.">
        <div className="mt-2 flex items-center gap-4">
          {previewUrl ? (
            <div className="relative w-40 aspect-video bg-surface-alt rounded overflow-hidden border border-ink/10">
              <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-40 aspect-video bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No image</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="text-sm text-ink/80" />
            {(previewUrl || pendingFile) && (
              <button type="button" onClick={removeImage} className="text-[11px] uppercase tracking-[0.25em] text-red-600 hover:text-red-800 cursor-pointer text-left">
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>
      <Field label="Image alt" hint="Describe the image for screen readers.">
        <input type="text" value={draft.image_alt ?? ''} onChange={(e) => update('image_alt', e.currentTarget.value)} className={inputClass} />
      </Field>
      <Field label="Body" hint="Markdown supported (headings ##, lists, links, **bold**).">
        <MarkdownEditor rows={12} value={draft.body} onChange={(v) => update('body', v)} className={`${inputClass} font-mono resize-y`} />
      </Field>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={draft.is_published} onChange={(e) => update('is_published', e.currentTarget.checked)} />
        <span className="text-sm text-ink/85">Published</span>
      </label>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create exhibition'}
        </button>
      </div>
    </form>
  );
}

const inputClass = 'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">{label}{required && <span className="text-brand-500"> *</span>}</span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
