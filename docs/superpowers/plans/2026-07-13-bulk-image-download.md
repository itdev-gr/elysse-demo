# Bulk Image Download (ZIP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "Download ZIP" button in the admin Images tab that downloads the currently shown images (all 462 / ~203 MB when unfiltered, the search matches otherwise) as one archive, with live progress and skipped-file reporting.

**Architecture:** Pure naming helper (`zipEntryNames`, vitest-covered) computes collision-free archive entry names from display filenames; ImagesTab fetches the shown images' public URLs with bounded concurrency, feeds them to `client-zip` (STORE, no recompression), and saves the blob via a temporary anchor. Read-only end to end — no DB writes, no migrations.

**Tech Stack:** Astro 6 + React 19 islands, `client-zip` (new dependency, ~2 KB), vitest.

**Spec:** `docs/superpowers/specs/2026-07-13-bulk-image-download-design.md`

## Global Constraints

- **NO `git commit` / `git push` at any point.** The user reviews the working tree first (standing rule). New files get `git add -N`; `package.json`/`package-lock.json` changes stay unstaged-tracked as usual.
- No database or storage writes anywhere in this feature — it is strictly read-only.
- Entry names: the TRIMMED display `filename` (no character sanitising — ZIP handles spaces/UTF-8; trim only, since Windows strips edge whitespace on extraction); null/empty falls back to the storage basename via `storagePathFromUrl`, then `image-<index+1>`; collisions deduped case-insensitively with " (2)", " (3)"… inserted before the extension.
- Fetch concurrency: 4. Output name: `elysse-images-YYYY-MM-DD.zip`.
- Failure copy (exact): partial → `Downloaded ${ok} of ${total} — failed: ${firstFiveNames.join(', ')}${more > 0 ? ` (+${more} more)` : ''}`; total failure → `Could not download any images.`
- Only these files change: `package.json` + `package-lock.json` (dependency), `src/lib/image-zip.ts` (+test), `src/components/admin/ImagesTab.tsx`.
- Tests: `npx vitest run <file>` per task; full `npm test` + `npm run build` at the end.

---

### Task 1: `zipEntryNames` helper + `client-zip` dependency

**Files:**
- Modify: `package.json` / `package-lock.json` (via `npm install client-zip`)
- Create: `src/lib/image-zip.ts`
- Create: `src/lib/image-zip.test.ts`

**Interfaces:**
- Consumes: `storagePathFromUrl(url: string): string | null` from `src/lib/image-refs.ts` (existing).
- Produces: `zipEntryNames(images: { filename: string | null; url: string }[]): string[]` — order-preserving, one entry per image, collision-free. Task 2 zips `visible[i]` under name `zipEntryNames(visible)[i]`.

- [ ] **Step 1: Install the dependency**

Run: `npm install client-zip`
Expected: `client-zip` added to `dependencies` in package.json; lockfile updated; no peer warnings.

- [ ] **Step 2: Write the failing tests**

Create `src/lib/image-zip.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { zipEntryNames } from './image-zip';

const BUCKET = 'https://x.supabase.co/storage/v1/object/public/product-images/';
const img = (filename: string | null, path = 'uploads/u1-file.jpg') =>
  ({ filename, url: `${BUCKET}${path}` });

describe('zipEntryNames', () => {
  it('uses the display filename as-is', () => {
    expect(zipEntryNames([img('Epsilon Valve 1.2.png')])).toEqual(['Epsilon Valve 1.2.png']);
  });
  it('preserves input order', () => {
    expect(zipEntryNames([img('b.jpg'), img('a.jpg')])).toEqual(['b.jpg', 'a.jpg']);
  });
  it('falls back to the storage basename when filename is null or empty', () => {
    expect(zipEntryNames([img(null, 'uploads/u1-pipe.png')])).toEqual(['u1-pipe.png']);
    expect(zipEntryNames([img('', 'uploads/u1-pipe.png')])).toEqual(['u1-pipe.png']);
  });
  it('falls back to image-<n> when there is no usable name at all', () => {
    expect(zipEntryNames([{ filename: null, url: 'not-a-bucket-url' }])).toEqual(['image-1']);
  });
  it('dedupes collisions with a numbered suffix before the extension', () => {
    expect(zipEntryNames([img('pipe.jpg'), img('pipe.jpg'), img('pipe.jpg')]))
      .toEqual(['pipe.jpg', 'pipe (2).jpg', 'pipe (3).jpg']);
  });
  it('dedupes case-insensitively', () => {
    expect(zipEntryNames([img('Pipe.JPG'), img('pipe.jpg')]))
      .toEqual(['Pipe.JPG', 'pipe (2).jpg']);
  });
  it('suffixes extension-less names at the end', () => {
    expect(zipEntryNames([img('scan'), img('scan')])).toEqual(['scan', 'scan (2)']);
  });
  it('keeps counting past suffixes that are already taken', () => {
    expect(zipEntryNames([img('pipe.jpg'), img('pipe (2).jpg'), img('pipe.jpg')]))
      .toEqual(['pipe.jpg', 'pipe (2).jpg', 'pipe (3).jpg']);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/image-zip.test.ts`
Expected: FAIL — cannot resolve `./image-zip`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/image-zip.ts`:

```ts
/**
 * Pure naming for the Images tab's bulk ZIP download. Archive entries carry
 * the admin-facing display filename; duplicate names are deduped because ZIP
 * archives with repeated entry names extract unpredictably (or refuse to) in
 * some tools. Colocated tests in image-zip.test.ts.
 */
import { storagePathFromUrl } from './image-refs';

/** Split "name.ext" so the dedupe suffix lands before the extension. */
function splitExt(name: string): { stem: string; ext: string } {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return { stem: name, ext: '' };
  return { stem: name.slice(0, dot), ext: name.slice(dot) };
}

/**
 * One collision-free archive entry name per image, order-preserving.
 * Base name: display filename → storage basename → "image-<n>".
 * Collisions (case-insensitive) get " (2)", " (3)"… before the extension.
 */
export function zipEntryNames(images: { filename: string | null; url: string }[]): string[] {
  const taken = new Set<string>();
  return images.map((img, i) => {
    const base =
      (img.filename ?? '').trim() ||
      (storagePathFromUrl(img.url)?.split('/').pop() ?? '') ||
      `image-${i + 1}`;
    let name = base;
    const { stem, ext } = splitExt(base);
    for (let n = 2; taken.has(name.toLowerCase()); n++) {
      name = `${stem} (${n})${ext}`;
    }
    taken.add(name.toLowerCase());
    return name;
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/image-zip.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Verify no regressions and stage new files**

Run: `npx vitest run`
Expected: all suites PASS.

Run: `git add -N src/lib/image-zip.ts src/lib/image-zip.test.ts`

---

### Task 2: ImagesTab — Download ZIP button and flow

**Files:**
- Modify: `src/components/admin/ImagesTab.tsx`

**Interfaces:**
- Consumes: `zipEntryNames` (Task 1), `downloadZip` from `client-zip`, existing `visible`, `libError`.

- [ ] **Step 1: Add imports and state**

In `src/components/admin/ImagesTab.tsx`, add after the existing imports:

```tsx
import { downloadZip } from 'client-zip';
import { zipEntryNames } from '../../lib/image-zip';
```

Below `const [renaming, setRenaming] = useState(false);` add:

```tsx
  const [zipProgress, setZipProgress] = useState<{ done: number; total: number } | null>(null);
```

(`null` = idle; non-null = a download is running and the button is disabled.)

- [ ] **Step 2: Add the download handler**

After `handleRename`, add:

```tsx
  // ── bulk ZIP download ────────────────────────────────────────────────────
  // Read-only: fetches the SHOWN images' public URLs (concurrency 4), stores
  // them uncompressed in a ZIP (they're already-compressed images), and saves
  // it. Failed fetches are skipped and reported; everything else still lands
  // in the archive.
  const handleDownloadZip = async () => {
    if (zipProgress || visible.length === 0) return;
    const targets = [...visible];
    const names = zipEntryNames(targets);
    setLibError(null);
    setZipProgress({ done: 0, total: targets.length });

    const entries: { name: string; input: Blob }[] = [];
    const failed: string[] = [];
    let cursor = 0;
    let completed = 0;
    const worker = async () => {
      while (cursor < targets.length) {
        const i = cursor++;
        try {
          const res = await fetch(targets[i].url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          entries[i] = { name: names[i], input: await res.blob() };
        } catch {
          failed.push(names[i]);
        }
        completed++;
        setZipProgress({ done: completed, total: targets.length });
      }
    };

    try {
      await Promise.all(Array.from({ length: 4 }, worker));
      const ok = entries.filter(Boolean);
      if (ok.length === 0) {
        setLibError('Could not download any images.');
        return;
      }
      const blob = await downloadZip(ok).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `elysse-images-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
      if (failed.length > 0) {
        const shown = failed.slice(0, 5).join(', ');
        const more = failed.length - 5;
        setLibError(`Downloaded ${ok.length} of ${targets.length} — failed: ${shown}${more > 0 ? ` (+${more} more)` : ''}`);
      }
    } finally {
      setZipProgress(null);
    }
  };
```

The shared `completed` counter keeps the progress label strictly monotonic across the 4 workers.

- [ ] **Step 3: Render the button**

In the Library section header, change:

```tsx
          {images && (
            <span className="text-xs text-ink/55">
              {query.trim() !== ''
                ? `${visible.length} of ${images.length}`
                : `${images.length} image${images.length !== 1 ? 's' : ''}`}
            </span>
          )}
```

to:

```tsx
          <div className="flex items-center gap-4">
            {images && (
              <span className="text-xs text-ink/55">
                {query.trim() !== ''
                  ? `${visible.length} of ${images.length}`
                  : `${images.length} image${images.length !== 1 ? 's' : ''}`}
              </span>
            )}
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={zipProgress !== null || visible.length === 0}
              className="text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-ink/15 hover:border-brand-500 hover:text-brand-500 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {zipProgress ? `Zipping ${zipProgress.done} / ${zipProgress.total}…` : 'Download ZIP'}
            </button>
          </div>
```

(The outer header div already lays out title-left / actions-right via `justify-between`; the new wrapper keeps count + button grouped on the right.)

- [ ] **Step 4: Verify no regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 3: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite + production build**

Run: `npm test` — every suite PASS (including the 8 new image-zip tests).
Run: `npm run build` — completes with no TypeScript/JSX errors (confirms the `client-zip` import resolves in the production bundle).

- [ ] **Step 2: Confirm scope**

`git diff HEAD --stat` shows ONLY: `package.json`, `package-lock.json`, `src/lib/image-zip.ts` (+test), `src/components/admin/ImagesTab.tsx`, plus the spec/plan docs.

- [ ] **Step 3: Manual smoke (user or logged-in browser session)**

On the admin Images tab: click Download ZIP with no search → progress counts to 462 → `elysse-images-<date>.zip` saves and opens with 462 entries named by display filename; type a search → button downloads only the matches; empty result set → button disabled.
