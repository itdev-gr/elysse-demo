# Bulk image download (ZIP) — design

**Date:** 2026-07-13
**Status:** drafted (design question timed out; follows the user's request and
their answered scope choice: download what's currently shown)

## Goal

One click in the admin Images tab downloads the library as a ZIP. The button
zips **what's currently shown**: all images with an empty search (462 files,
~203 MB today), or just the matches when a search is active. Read-only —
no database writes, no migrations, no interaction with the rename/cleanup
lifecycle.

## UI

- A "Download ZIP" button in the Library section header row (next to the
  image count), styled like the existing secondary actions.
- While running: button disabled, label shows live progress
  ("Zipping 37 / 462…").
- Output file: `elysse-images-YYYY-MM-DD.zip` (client date).
- Partial failure: the ZIP still completes with everything that fetched;
  the existing `libError` strip reports
  "Downloaded 459 of 462 — failed: a.jpg, b.jpg, … (+N more)" (first 5
  names). If every fetch fails, no ZIP is produced and the strip says so.
- The button is independent of upload/rename busy states (read-only), but
  disables itself while a download is running.

## Dependency

`client-zip` (MIT, ~2 KB) — assembles the archive as a stream and STOREs
entries without recompression. Images are already compressed; JSZip-style
DEFLATE over 203 MB would waste CPU and roughly double memory. First and
only zip need in the project.

## Pure helper: `src/lib/image-zip.ts` (vitest-covered)

`zipEntryNames(images: { filename: string | null; url: string }[]): string[]`
returns one archive entry name per image, order-preserving:

- base name = the TRIMMED display `filename` (so admin renames carry into
  the archive; leading/trailing whitespace is dropped because Windows strips
  it on extraction and a whitespace-only name must fall through); when
  null/empty, fall back to the storage basename from the URL (via
  `storagePathFromUrl`), and as a last resort `image-<index+1>`.
- names are otherwise untouched (ZIP handles spaces/UTF-8); no character
  sanitising.
- collisions are deduped by inserting " (2)", " (3)"… before the extension
  ("pipe.jpg", "pipe (2).jpg") — duplicate entry names corrupt the archive
  in some extractors, so dedupe is load-bearing. Dedupe is case-insensitive
  (Windows/macOS extract to case-insensitive filesystems).

## Flow (ImagesTab)

1. Button click → snapshot the current `visible` array.
2. Fetch each image URL (public bucket, plain `fetch`, no auth) with
   concurrency 4; count completions for the progress label.
3. Feed `{ name, input }` entries to `client-zip`'s `downloadZip`, produce a
   Blob, trigger the save via a temporary object-URL anchor click.
4. Failed fetches (non-OK or thrown) are skipped and their display names
   collected for the report; everything else still lands in the ZIP.

## Error handling

| Failure | Behaviour |
|---|---|
| some fetches fail | ZIP completes without them; error strip lists skipped names (first 5 + count) |
| all fetches fail | no ZIP; error strip: "Could not download any images." |
| zero images shown | button disabled (nothing to zip) |
| clicked twice | second click ignored while running (busy flag) |

## Testing

- vitest for `zipEntryNames`: display-name passthrough, null-filename URL
  fallback, index fallback, collision suffixing (incl. case-insensitive and
  multi-collision), extension-aware suffix placement, order preservation.
- Full suite + production build green.
- Manual: click on the deployed/dev admin → ZIP saves and opens; search →
  smaller ZIP with only matches.

## Out of scope

- Per-image download buttons; folder structure inside the ZIP; server-side
  zipping; downloads in the Families-tab picker; cancel mid-download
  (refresh aborts).
