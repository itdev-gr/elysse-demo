# Image rename (real file rename) — design

**Date:** 2026-07-13
**Status:** drafted for user review (design question timed out; follows the
user's explicit choices: real URL rename, maximum robustness)

## Goal

Admins can rename images in the Images library, and the rename is REAL: the
storage object moves to a path containing the new name, so the public URL
changes. The live site must keep working at every instant — before, during,
and after the rename, and under every failure mode.

## Why this is the hard version

An image's identity across the system is its URL:

- `product_images.url` — the library row (admin Images tab)
- `product_family_images.url` — family gallery rows; the ONLY source the
  public catalog renders from (mirror columns were retired in 0039/0040)
- storage bucket `product-images`, object path `uploads/{uuid}-{name}`
- `run_product_data_checks()` flags any DB URL whose storage object is
  missing (`broken_image_ref`)

Catalog pages are `prerender = false` (SSR from live DB per request), so a
committed DB rewrite takes effect immediately; only transient caches
(browser bfcache, possible edge caching) briefly hold the old URL.

The 2026-07-06 "disappearing images" incident came from exactly this class
of operation. The design rule for every step below: **a referenced URL must
never, at any instant, lack its storage object.**

## Approach: copy → atomic rewrite → deferred re-checked cleanup

### 1. UI (Images tab only)

- `ImageCard` gains an optional `onRename?: (img: ProductImage) => void`
  prop, rendered as a "Rename" action next to Delete. Only ImagesTab passes
  it; the Families-tab picker is unchanged.
- Clicking Rename opens `prompt()` pre-filled with the current filename
  (same idiom as FamiliesTab's rename-code). Empty/cancel = no-op.
- The file extension is preserved automatically: the new display name and
  new storage path always carry the original extension (the file's bytes
  and content-type do not change, so the name must not lie about the type).
- While a rename is in flight the tab sets a busy flag (rename/delete
  actions disabled); errors surface in the existing `libError` strip.

### 2. Pure helper: `src/lib/image-rename.ts` (vitest-covered)

`planImageRename(current: { url: string; filename: string | null }, requestedName: string, uuid: string)`
returns `{ newFilename, newPath }` or `{ error }`:

- trims the input; empty → error; identical to current name → error
  ("already called that")
- sanitises for the path with the SAME rule uploads use
  (`name.replace(/[^a-zA-Z0-9.\-]+/g, '-')`)
- preserves the extension of the current stored object (derived from the
  storage path, falling back to the filename); a typed IMAGE extension (or
  one matching the stored extension) is stripped and the original
  re-appended, while a dotted version suffix like "valve-v1.2" is kept as
  part of the name; if the stored object has no extension at all, none is
  appended and the typed name is used as-is
- new path: `uploads/{uuid}-{sanitisedName}` — same scheme as uploads; the
  fresh uuid rules out collisions
- `sanitiseName` currently exists as duplicated private copies in ImagesTab
  and FamiliesTab; it moves into this lib and both tabs import it (targeted
  dedupe of code this feature touches — no other refactoring).

### 3. Migration `0044_rename_library_image.sql` — the atomic core

**Table `image_cleanup_queue`**: `id uuid pk`, `storage_path text not null`,
`enqueued_at timestamptz not null default now()`. RLS enabled; authenticated
full access; NO anon policies.

**RPC `rename_library_image(p_id uuid, p_new_url text, p_new_filename text)`**
— plpgsql, SECURITY INVOKER, one transaction:

1. `select url from product_images where id = p_id for update` — missing →
   `{renamed:false, reason:'not_found'}`; unchanged URL → `'same_url'`.
2. Update `product_images` set `url = p_new_url, filename = p_new_filename`.
3. Update `product_family_images` set `url = p_new_url` where
   `url = old_url` (all galleries follow in the same transaction).
4. Derive the old storage path from the old URL in SQL
   (`url_decode(split_part(old_url, '/storage/v1/object/public/product-images/', 2))`
   — same expression the data checker uses) and insert it into
   `image_cleanup_queue`. Non-bucket URLs (no marker) skip the enqueue.
5. Return `{renamed:true, old_url, gallery_rows: <count updated>}`.

Grants per this repo's ACL rule: `revoke all ... from public;` then
`grant execute ... to authenticated;` and explicitly
`revoke ... from anon;` (the 0041 hardening trap).

**RPC `due_image_cleanups()`** — returns queue rows where
`enqueued_at < now() - interval '24 hours'` AND the path is not referenced:
no `product_images.url` and no `product_family_images.url` resolves (via
the same split/decode expression) to that path. Same grants.

### 4. Client rename flow (ImagesTab)

1. `planImageRename(...)` — validation errors shown, nothing touched.
2. `storage.copy(oldPath, newPath)` — failure → error shown; system
   unchanged. (Old object untouched throughout.)
3. `getPublicUrl(newPath)` → `rename_library_image(id, newUrl, newFilename)`
   — failure → best-effort `storage.remove([newPath])` to drop the orphan
   copy, error shown; DB and old object unchanged.
4. Success → reload library, `triggerPublish()` (consistent with every
   other admin mutation; SSR pages already serve the new URL from the DB).

During the grace window both objects exist, so any cached page, open admin
tab, or back-forward navigation keeps rendering.

### 5. Deferred cleanup (no cron, no edge functions)

On Images tab mount, after the library loads: call `due_image_cleanups()` to
enumerate candidates, then for each row call `claim_image_cleanup(id)` —
which atomically re-verifies the path is still unreferenced AND deletes the
queue row in the same statement (returning the path on success, `NULL`
otherwise). Only when the claim returns a path does the client call
`storage.remove([path])`. Claim-then-remove, not remove-then-delete: a
failure after the claim only orphans a file (harmless, invisible to the data
checker), whereas removing the file before the row is claimed would reopen
the TOCTOU window this ordering exists to close.

Self-healing property: if a stale admin tab re-inserts an old URL into a
gallery during the grace window, the atomic claim is what closes the race —
`claim_image_cleanup` re-checks references and deletes the row in one
statement, so a late re-insert can never land between the re-check and the
file removal. If the re-insert happens before the claim runs, the claim's
own `not exists` check fails, the row is kept (not deleted), and the old
object correctly outlives the reference; the queue row simply waits for a
later visit when the path is unreferenced again.

### 6. Interactions audited

- `delete_library_image` reads the row's CURRENT url — delete-after-rename
  works; its refusal check also covers the new URL in galleries.
- Data checker: at every step each referenced URL has its object (new file
  exists before the rewrite commits; old file outlives all references by
  ≥24h). Orphaned files are not flagged by any check.
- `product_images.family_code` is untouched by rename (it reflects
  allocation, not the name).
- Rename during an in-flight upload or delete: actions are serialized by
  the tab's busy flags.
- Double rename before cleanup: two independent queue entries; each is
  re-checked; order irrelevant.

## Error handling summary

| Failure point | State afterwards | User sees |
|---|---|---|
| validation | nothing changed | inline error |
| storage copy | nothing changed | error strip |
| RPC | old URL everywhere, old file present; orphan new file best-effort removed | error strip |
| cleanup claim (RPC error, or re-check fails and row is kept) | queue row unchanged; nothing removed; retried next visit | nothing (silent retry) |
| cleanup remove (after a successful claim) | queue row already gone (deleted atomically by the claim); file removal failure just orphans the file | nothing (harmless orphan) |

## Testing

- vitest: `planImageRename` (empty, same-name, sanitisation, extension
  preservation/stripping, uuid injection), `storagePathFromUrl` reuse.
- Full suite + production build green.
- Manual admin walkthrough: rename an allocated image → catalog page shows
  it immediately; old URL still resolves; after the window, cleanup removes
  it; Data Errors tab stays clean throughout.
- Migration applied to the live DB via the Management API only with
  explicit user consent at release time.

## Out of scope

- Renaming from the Families-tab picker.
- Bulk rename.
- Changing file extension/format.
- A visible "pending cleanup" admin UI (queue is invisible plumbing).
- Editing `family_code` or `source` on library rows.
