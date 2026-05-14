# Asset Notes

User owns the source domain (sonanbunkers.com), so all original assets are authorized for reuse.

## Inventory
See `recon/output/assets.json` for the full machine-readable list.

## Categories
- **Images** — to be optimized (resized + AVIF/WebP) during Astro build via `astro:assets`.
- **Fonts** — see Task 14; self-host via `@fontsource/*` or `/public/fonts/*`.
- **Icons** — extract SVG paths; inline as Astro components where possible (better tree-shaking, recolor).
- **Video** — keep MP4 + add WebM fallback during Task 16.

## Replacements
(None expected — user owns the site. If any asset turns out to be a 3rd-party stock photo without a license carried over, it will be listed here with a placeholder filename and original dimensions.)
