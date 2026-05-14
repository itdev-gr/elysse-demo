# DESIGN.md — sonanbunkers.com runtime design tokens

Engineering reference synthesized from `recon/output/tokens.json` (runtime computed
styles on `https://www.sonanbunkers.com/` at viewport 1440x900) and the screenshots
under `recon/screenshots/{desktop-1440,mobile-390}/`. Every concrete value is
traceable back to one of those two sources; values not directly observed are
marked as derived.

## 1. Overview

Marketing brand site for a marine fuels/bunkering company. Design language is
**photography-led** (full-bleed dark blue ocean/cargo imagery), with a thin
white logo + minimal nav floated over the photo. Body content is set on a
white card / light surface against a deep navy footer. Primary mood is
corporate, maritime, premium-industrial. Typography is bold sans-serif for
display, light serif for paragraphs, producing a "magazine over photo"
aesthetic. Cards are sharp-cornered or slightly rounded; no heavy shadows
were detected in the rendered DOM.

## 2. Color palette

Source: `aggregate.colors` and `aggregate.backgrounds` (frequency-ranked rendered
computed styles). Bootstrap-style CSS custom properties (`--primary: #007bff`
etc.) are present on `:root` but the rendered colors below are what actually
appears on screen — the site overrides Bootstrap defaults in component styles.

| Role | HEX | RGB | Source / Notes |
|------|-----|-----|----------------|
| Ink (body text default) | `#212529` | rgb(33,37,41) | 142 elements — Bootstrap `--gray-dark` adjacent, used for `body` color |
| Surface — white | `#FFFFFF` | rgb(255,255,255) | 136 elements; `body` background and card surfaces |
| Brand primary — navy | `#274380` | rgb(39,67,128) | 107 elements; paragraph color + primary CTA fill (see contact.png "MESSAGE" buttons) |
| Brand secondary — deep navy | `#1D3274` | rgb(29,50,116) | Footer background (contact.png footer band) |
| Link blue (Bootstrap) | `#007BFF` | rgb(0,123,255) | 40 elements; matches `--primary` / `--blue` Bootstrap default for `<a>` |
| Muted blue-gray | `#D2D7E4` | rgb(210,215,228) | 16 elements; subtle dividers / muted text |
| Sea-foam teal | `#84A2A4` | rgb(132,162,164) | 16 backgrounds; band/separator panels |
| Sea-foam teal (alt) | `#86A4A6` | rgb(134,164,166) | 3 elements; secondary text/border |
| Light gray surface | `#EAEFEF` | rgb(234,239,239) | 2 backgrounds; alternate section fill |
| Accent — peach/orange | `#F1B578` | rgb(241,181,120) | 6 fg + 2 bg; small graphical accent (plus icons, hover bars) |
| Form input gray | `#545454` | rgb(84,84,84) | `input` color |
| Overlay scrim | `rgba(0,0,0,0.5)` | — | 3 elements; cookie banner + image overlays |

Notes:
- Bootstrap `--primary: #007BFF` exists on `:root` but designers replaced it
  with the navy `#274380` for actual brand usage. Treat `#274380` as the brand
  primary in the rebuild and the Bootstrap blue as a residual legacy value.
- The peach `#F1B578` is the only warm accent. Use sparingly (icon highlights).

## 3. Typography

Source: `elements.*` computed font properties; `aggregate.fontFamilies` for
frequency. The plan note that the site uses "Helvetica Neue + Roboto Slab" does
not match the runtime — see Source Observations.

**Font families (by frequency of rendered elements)**

| Family | Count | Role |
|--------|-------|------|
| `"Averta Standard W01", sans-serif` | 394 | Display / UI sans (headings, nav, buttons, body default) |
| `"Roboto Slab", serif` | 24 | Paragraph copy (`<p>`) |
| `"Open Sans", Arial, ... sans-serif` | 20 | Form inputs |
| `tahoma, arial, helvetica, sans-serif` | 6 | Cookie banner widget |
| `arial, helvetica, sans-serif` | 6 | Cookie banner widget |
| `"Trebuchet MS", Arial, sans-serif` | 1 | Cookie banner widget |

`Averta Standard W01` is served via Monotype's `fast.fonts.net` CSS API.
`Roboto Slab:wght@300` is served via Google Fonts.

**Per-element computed values** (homepage @ 1440 viewport)

| Selector | Family | Size | Line-height | Weight | Letter-sp | Transform | Color |
|----------|--------|------|-------------|--------|-----------|-----------|-------|
| `body` | Averta | 10px | 15px | 400 | normal | none | `#212529` |
| `h1` | Averta | 90px | 108px | 800 | normal | none | `#FFFFFF` |
| `h2` | Averta | 70px | 84px | 800 | normal | none | `#FFFFFF` |
| `h3`–`h6` | — | — | — | — | — | — | not present on `/` |
| `p` | Roboto Slab | 14px | 21.994px | 300 | normal | none | `#274380` |
| `a` | Averta | 10px | 15px | 400 | normal | none | `#007BFF` |
| `input` | Open Sans | 14px | 0px | 400 | normal | none | `#545454` |
| `header` | Averta | 10px | 15px | 400 | normal | none | `#212529` |

Notes:
- `body { font-size: 10px }` is unusually small — it functions as a rem-base reset
  rather than the visible body size. Actual readable copy is `<p>` at 14px / line-height ~22px.
- `h1` and `h2` are oversize (90/70px) — these are hero overlay headings
  observed in `home.png` ("fuelling the shipping industry").
- No `h3`–`h6` exist on the homepage; their type scale will need to be
  established from interior pages (e.g. about-us.png shows mid-size titles
  ~36–48px that are likely `h3`).

## 4. Spacing

Source: `elements.*.padding` / `.margin` and observed values on the homepage.

| Element | Padding | Margin |
|---------|---------|--------|
| `body` | `0px` | `0px` |
| `header` | `0px 70px` | `0px` |
| `h1` | `0px` | `0px 0px 5px` |
| `h2` | `0px` | `30px 100px 5px 40px` |
| `p` | `0px` | `0px 0px 10px` |

Container max-width: **1360px** (widest non-`body` container observed via
`contentContainerWidth`). Widest direct body child = `1440px` (= viewport),
so the outer wrapper is full-bleed and a `1360px` inner container is the
content guide. Use `max-width: 1360px; margin-inline: auto` in the rebuild.

Recurring numeric values worth noting: `70px` (header horizontal padding),
`40px` / `100px` (h2 side margins), `5px` / `10px` / `30px` (vertical
rhythm).

## 5. Layout / Grid

- Viewport meta: `width=device-width, initial-scale=1, shrink-to-fit=no`
- Bootstrap breakpoints exposed on `:root`:
  - `--breakpoint-xs: 0`
  - `--breakpoint-sm: 576px`
  - `--breakpoint-md: 768px`
  - `--breakpoint-lg: 992px`
  - `--breakpoint-xl: 1200px`
- Header height (desktop @ 1440): **80px**, transparent over hero image
  (`background-color` transitions over 0.5s on scroll — see Animation Hint).
- Mobile screenshots @ 390px confirm a single-column stack with the same hero
  image cropped, nav collapsed to a hamburger (top-right).
- Desktop hero spans full width; content cards (e.g. contact city cards) are
  laid out as a 3-column grid at 1440, collapsing to 1-column at 390.

## 6. Border radius

Source: `aggregate.borderRadii`.

| Value | Count | Typical use |
|-------|-------|-------------|
| `50%` | 12 | Circular icon backgrounds / avatar masks |
| `3px` | 3 | Buttons, form fields (Bootstrap default `--rounded` ≈ 3–4px) |
| `100%` | 2 | Round badges |
| `20px` | 2 | Pill-style elements |
| `2px` | 1 | Subtle chip |

No large rounded-card radius (e.g. 12–16px) is used. Cards on the
homepage/contact page render with square corners (see contact.png city cards).

## 7. Shadows

Source: `aggregate.boxShadows`. **No `box-shadow` other than `none` was
detected on any rendered element.** The design is flat — separation is
achieved via color contrast (white card on dark hero) and full-bleed
photography rather than elevation. The rebuild should mirror this: avoid
adding shadows unless the source CSS file actually contains them and we
simply didn't surface them at runtime.

## 8. Buttons / CTAs

`elements.button` and `elements.primaryCta` both returned `null` — no
`<button>`, `.button`, `.btn-primary`, or `[class*="primary"][class*="button"]`
is rendered above-the-fold on the homepage at first paint. From the
contact.png screenshot, the primary CTA pattern is:

- Background: `#274380` (brand navy)
- Foreground text: `#FFFFFF`
- Text: ALL CAPS short label, e.g. "MESSAGE >", "DISCOVER SONAN", "EXPLORE OUR SERVICES"
- Shape: small radius (`~3px`) rectangle, no shadow
- Affordance: trailing `>` glyph

Verify these by running an interior-page (`/contact/`) extraction in Task 9
or by reading the source HTML/CSS directly — the homepage alone is
insufficient. Mark the CTA spec as **provisional** until then.

## 9. Forms / inputs

From `elements.input` (the cookie-consent widget's email-style input, the only
visible input on the homepage):

- Font: `"Open Sans", Arial, "Trebuchet MS", "Segoe UI", Helvetica, sans-serif`
- Size: `14px`
- Color: `#545454`
- Background: transparent (`rgba(0,0,0,0)`)
- Radius: `0px`
- Padding: `0px`
- Border / box-shadow: none observed at runtime

This is not representative of branded form styling — the source has no form on
the homepage and there are 0 forms across the crawl (`PAGE_MAP.md` shows
`Forms: 0` for every page). Inputs encountered are part of third-party widgets
(cookie banner). Form design for the rebuild will need to be authored fresh.

## 10. Components inferred from screenshots

From `desktop-1440/home.png`, `mobile-390/home.png`, `about-us.png`,
`our-services.png`, `contact.png`:

| Section | Visual treatment |
|---------|------------------|
| Hero | Full-bleed dark ocean/container-ship photo; bold white H1 ("fuelling the shipping industry"); two stacked white CTA buttons under intro copy. |
| Nav bar | Transparent over hero, white logo (left) and `MENU` text + hamburger (right). Becomes solid on scroll (0.5s transition). |
| City strip | Horizontal row of uppercase city names (ROTTERDAM, OSLO, RIO DE JANEIRO, …) just below hero — appears to be a marquee/scroll teaser. |
| Section gallery (Our Services) | Full-bleed image header with title overlay; below, a white card with body copy + body padding. |
| Card grid | 3-column grid of square white cards each containing a 3-letter airport-style code (DXB, PA, RTM, ATH, LDN) + city name + address + navy "MESSAGE >" CTA. Source = contact.png. |
| Image+text panel | Half-image / half-text rows; image bleeds to one edge, white text panel on the other. Source = our-services.png. |
| Footer | Deep navy (`#1D3274`) full-width band, multi-column link list ("Discover Sonan / Connect"), small sonan logo, legal links, copyright + "Designed & Developed by Anubit" credit. |
| Scroll-up button | Circular peach icon (`#F1B578` 50% radius) anchored to bottom-center of section transitions. |
| Cookie banner | Bottom-left floating panel, dark background, green "ACCEPT ALL" pill + grey "DECLINE ALL" pill — Cookiebot widget (third-party). |

## 11. Animation hint

Source: `aggregate.transitionDurations` + `aggregate.transitionTimingFunctions`.

| Duration | Count | Likely role |
|----------|-------|-------------|
| `0.5s` | 18 | Header background-color transition on scroll; common UI hover |
| `0.1s` | 17 | Micro hover/focus feedback |
| `1s` | 7 | Section fade-ins |
| `2s` | 7 | Hero `h1`/`h2` opacity fade (confirmed: `elements.h1.transitionDuration = "2s"` on `opacity`) |
| `0.09s` | 1 | Carousel / select widget |
| `0.3s` (compound) | 1 | Multi-property select2 widget |

Timing functions:
- `ease-in-out` × 16 — most-used
- `cubic-bezier(0.1, 0.57, 0.1, 1)` × 9 — Material-style "decelerate" curve
- Default `ease` (excluded from frequency count)

This section is **expanded in Task 12 / ANIMATION_NOTES.md**.

## 12. Source observations

- **Font licensing — Monotype.** `Averta Standard W01` is served from
  `https://fast.fonts.net/cssapi/41f6110b-1c65-4d7a-9430-ec766a66fd61.css`.
  Monotype CSS-API licenses are **domain-locked**. Reusing that CSS link from
  a new domain or self-hosting the woff/woff2 files will violate the license.
  Confirm with the user before swapping in `@fontsource/averta` (which does
  not exist for Averta — Averta is not on Google/Fontsource) or before
  switching to a free near-match (e.g. Inter, Manrope, or Brandon Grotesque
  licensed separately). The plan's mention of "Helvetica Neue from Monotype"
  is incorrect — the runtime font is **Averta**, not Helvetica Neue.
- **CORS-blocked stylesheets** (logged in `tokens.json.sheetErrors`):
  `fast.fonts.net`, `fonts.googleapis.com`, `cdn.jsdelivr.net` (select2).
  This is why `fontFaces` is empty — `@font-face` declarations live in those
  cross-origin sheets and JS cannot read them. They are still applied in the
  browser; the issue is only in the introspection script. Self-hosting will
  surface these declarations correctly in the rebuild.
- **Bootstrap 4 vendor styles.** `:root` exposes the full Bootstrap 4 colour
  + breakpoint variable set. Designers overrode the visible colors in
  component CSS but the residual `--primary: #007BFF` still leaks via
  unstyled `<a>` tags (40 elements). The rebuild should drop Bootstrap and
  define a clean token set rather than carry the vendor variable namespace.
- **Body font size 10px.** `body { font-size: 10px }` is a rem-base hack
  (10px = 1rem makes downstream `1.4rem` = 14px). Note this when porting:
  prefer Astro/Tailwind defaults (16px base) and rescale tokens to avoid
  silently shrinking type elsewhere.
- **No `<button>` elements on home.** All CTAs are styled `<a>` tags. Plan
  for `<a class="cta">` patterns rather than `<button class="cta">`.
- **No forms on any page** (`PAGE_MAP.md`, 45 pages crawled, 0 forms). The
  rebuild's contact form is greenfield design.
- **Cloudflare in front of origin.** Asset cache headers, IP routing, and
  any future image-resizing/CDN setup should expect the source's existing
  Cloudflare layer (see Task 6 asset inventory for cf-* request URLs).
- **Accessibility flag.** Hero white-on-photo text (`#FFFFFF` on dark blue
  ocean) generally passes contrast, but light blue body copy `#274380` on
  white passes WCAG AA at 14px (contrast ratio ~9.8:1) only because of how
  dark navy actually is — fine for the rebuild. The Bootstrap link blue
  `#007BFF` on white is borderline at 4.06:1 (AA passes for normal text,
  fails AAA for normal); reconsider link color globally.
