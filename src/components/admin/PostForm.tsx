import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { slugify, calcReadingMinutes, uploadCoverImage } from '../../lib/posts';
import type { Post, PostDraft } from '../../types/post';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  initial?: Post;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): PostDraft {
  return {
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    cover_image: null,
    author: null,
    published_at: null,
    reading_minutes: null,
    is_published: true,
  };
}

function toDraft(p: Post): PostDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = p;
  return rest;
}

export default function PostForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<PostDraft>(() => initial ? toDraft(initial) : emptyDraft());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.cover_image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onTitleBlur = () => {
    if (draft.slug.trim() === '' && draft.title.trim() !== '') {
      update('slug', slugify(draft.title));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      setError('Image must be JPEG, PNG or WebP.');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Image must be 4 MB or smaller.');
      e.target.value = '';
      return;
    }
    setPendingFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const removeCover = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    update('cover_image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const slug = slugify(draft.slug.trim()) || slugify(draft.title.trim());
      if (!slug) throw new Error('Slug is required.');

      const reading_minutes = calcReadingMinutes(draft.body);
      const published_at = draft.is_published
        ? (draft.published_at && draft.published_at.trim() !== ''
            ? draft.published_at
            : new Date().toISOString())
        : draft.published_at || null;

      // Step 1: create or update the post WITHOUT the new file URL.
      // We need the row id to namespace the storage path.
      let post: Post;
      const payload: PostDraft = {
        ...draft,
        slug,
        author: draft.author?.trim() || null,
        published_at,
        reading_minutes,
      };

      if (initial) {
        const { data, error: err } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', initial.id)
          .select()
          .single();
        if (err) throw err;
        post = data as Post;
      } else {
        const { data, error: err } = await supabase
          .from('posts')
          .insert(payload)
          .select()
          .single();
        if (err) throw err;
        post = data as Post;
      }

      // Step 2: if there's a new file, upload it and update the row with the URL.
      if (pendingFile) {
        const { url } = await uploadCoverImage(pendingFile, post.id);
        const { error: err } = await supabase
          .from('posts')
          .update({ cover_image: url })
          .eq('id', post.id);
        if (err) throw err;
      }

      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const excerptCount = draft.excerpt.length;
  const excerptOver = excerptCount > 300;

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit post' : 'New post'}
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
          onBlur={onTitleBlur}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" required hint="Lowercase letters, digits, hyphens.">
        <input
          type="text"
          required
          pattern="[a-z0-9-]+"
          value={draft.slug}
          onChange={(e) => update('slug', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Author" hint="Defaults to 'Elysée Group' if empty.">
        <input
          type="text"
          value={draft.author ?? ''}
          onChange={(e) => update('author', e.currentTarget.value)}
          placeholder="Elysée Group"
          className={inputClass}
        />
      </Field>

      <Field label="Excerpt" required hint={`${excerptCount}/300 characters`}>
        <textarea
          required
          rows={2}
          maxLength={300}
          value={draft.excerpt}
          onChange={(e) => update('excerpt', e.currentTarget.value)}
          className={`${inputClass} resize-y ${excerptOver ? 'border-red-500' : ''}`}
        />
      </Field>

      <Field label="Cover image" hint="JPEG, PNG, or WebP. Max 4 MB.">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="text-sm text-ink/80"
            />
            {(previewUrl || pendingFile) && (
              <button
                type="button"
                onClick={removeCover}
                className="text-[11px] uppercase tracking-[0.25em] text-red-600 hover:text-red-800 cursor-pointer text-left"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Body" required hint="Markdown supported (headings ##, lists, links, **bold**).">
        <textarea
          required
          rows={15}
          value={draft.body}
          onChange={(e) => update('body', e.currentTarget.value)}
          className={`${inputClass} font-mono resize-y`}
        />
      </Field>

      <Field label="Publish date" hint="Defaults to now when first published.">
        <input
          type="datetime-local"
          value={draft.published_at ? draft.published_at.slice(0, 16) : ''}
          onChange={(e) => update('published_at', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
          className={inputClass}
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
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create post'}
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
