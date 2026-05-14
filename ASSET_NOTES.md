# Asset Notes

User owns the source domain (sonanbunkers.com), so all original assets are authorized for reuse.

## Inventory
See `recon/output/assets.json` for the full machine-readable list.

## Categories
- **Images** — to be optimized (resized + AVIF/WebP) during Astro build via `astro:assets`.
- **Fonts** — see Task 14; self-host via `@fontsource/*` or `/public/fonts/*`.
- **Icons** — extract SVG paths; inline as Astro components where possible (better tree-shaking, recolor).
- **Video** — keep MP4 + add WebM fallback during Task 16. (WebM still TODO.)

## Replacements
(None expected — user owns the site. If any asset turns out to be a 3rd-party stock photo without a license carried over, it will be listed here with a placeholder filename and original dimensions.)

## Task 16 — Move into Astro project

83 source files moved from `recon/assets/` (cache, gitignored) into the Astro tree. Layout:

| Bucket                          | Count | Destination            |
| ------------------------------- | ----- | ---------------------- |
| Brand SVG logos (≤ 5 KB)        | 3     | `src/assets/icons/`    |
| UI/menu PNG icons + small logos | 9     | `src/assets/icons/`    |
| Backgrounds + content JPG/PNG   | 70    | `src/assets/images/`   |
| Video                           | 1     | `public/media/`        |
| OG / social-share images        | 0     | `public/og/` (created) |

`public/favicon.ico` and `public/favicon.svg` from the Astro scaffold were kept as-is —
the recon inventory contains no favicon entry, so there's nothing to overwrite.

### SVGO optimization

3 SVGs in `src/assets/icons/` optimized with `svgo --multipass`:

- `logo.svg`: 3170 → 2711 B (−14.5%)
- `logo-7.svg`: 3167 → 2849 B (−10.0%)
- `logo-2.svg`: 3325 → 2133 B (−35.8%)

Total: 9662 → 7693 B, **1969 B saved (~20.4%)**.

JPEG/PNG were left at original resolution — `astro:assets` will resize and emit
AVIF/WebP at build time.

### Renames

Filename normalization rules applied to media files (and the renames log is at
`/tmp/asset-renames.tsv` for the duration of the session — not committed):

1. **Underscores → hyphens** for ergonomic ES module import names
   (e.g. `energy_price.jpg` → `energy-price.jpg`).
2. **Lowercase** everything (no source name had mixed case, but the helper
   normalizes anyway).
3. **One overlong filename truncated**:
   `green-hydrogen-h2-gas-molecule-production-of-green-h2-energy-is-a-sustainable-alternative-fuel-for-future-industry-credit-shutterstock_1938738706_crop-sca.jpg`
   → `green-hydrogen-shutterstock-1938738706.jpg`.
4. **One filename collision** resolved (two media IDs 1296 and 1297 both held
   `shutterstock_377226832_looking-at-ways.jpg`): the second copy became
   `shutterstock-377226832-looking-at-ways-2.jpg`.
5. The `media/<id>/<filename>` directory structure (Umbraco/WordPress media
   library convention) was **flattened** — `<filename>` alone is used at the
   destination. Task 17 should map page references via the `url → new filename`
   table derived from `recon/output/assets.json` plus the rename log.

### Where to find what (mapping from old URL pattern → new path)

- `https://www.sonanbunkers.com/images/<file>` → `src/assets/icons/<file>` (SVG logos, PNG icons, small PNG logos) or `src/assets/images/<file>` (`background-*.jpg`, `bg-*.jpg`).
- `https://www.sonanbunkers.com/media/<id>/<file>` → `src/assets/images/<normalized-file>` (still images) or `public/media/<file>` (video).

The recon cache at `recon/assets/` is untouched and remains gitignored for re-runs.

## Task 17 — Optimization log

Recorded sizes after the Task 16 move + SVGO pass. Build-time resizing and
AVIF/WebP transcoding are deferred to `astro:assets` — they apply only to
files imported via TypeScript, not anything under `public/`.

### SVG (SVGO --multipass)

| Path | Bytes |
|------|------:|
| icons/logo-2.svg | 2,133 |
| icons/logo-7.svg | 2,849 |
| icons/logo.svg   | 2,711 |

Total saved by SVGO: ~1,969 B (~20.4%) across 3 files.

### Raster icons (PNG, unoptimized)

9 PNG icons under `src/assets/icons/` (~45 KB total). Astro pipeline will
optimize on import; un-imported icons stay as authored.

### Content images (`src/assets/images/`)

- File count: **70**
- Total size: **80 MB** (originals, pre-pipeline)
- Largest 10 (most build-time savings expected):

| File | Original |
|------|---------:|
| shutterstock-699756580-2.jpg                            | 6,907 KB |
| shutterstock-377226832-csr.jpg                          | 6,288 KB |
| shutterstock-374742190-group-ceo-statement.jpg          | 5,203 KB |
| shutterstock-132708305-our-commitment-to-clients.png    | 4,951 KB |
| services.jpg                                            | 4,562 KB |
| shutterstock-1957229728-your-marine-energy-provider.jpg | 4,562 KB |
| shutterstock-147759191-group-cfo-statement.jpg          | 4,045 KB |
| shutterstock-377226832-core-values.jpg                  | 3,534 KB |
| shutterstock-377226832-compliance.jpg                   | 3,215 KB |
| shutterstock-377226832-carbon-footprint.jpg             | 2,890 KB |

These will be re-emitted by `astro:assets` at responsive widths (typically
480 / 960 / 1440) as AVIF + WebP with a JPEG fallback — expect ~85–95% byte
reduction per delivered variant vs. the originals listed above.

> **License note on `shutterstock-*` filenames**: filenames reflect the
> source CMS. Confirm relevant Shutterstock licenses cover redistribution
> on the rebuilt domain before shipping. If any image is not covered, it
> will be replaced with a same-dimensions placeholder and logged below
> under "Replacements".

### Video (`public/media/`)

| File | Size |
|------|-----:|
| 1052896514-hd.mp4 | 6.5 MB |

No WebM fallback yet. Add `<source type="video/webm">` in Task 22 if the
hero/feature reel ships in a `<video>` element.

## Replacements

_None._ User owns sonanbunkers.com so all original site assets are
authorized. This section will be appended to if any third-party stock asset
turns out to lack carryover license rights for the rebuilt domain.
