# Responsive Notes

Source: full-page screenshots at `recon/screenshots/{desktop-1440,laptop-1024,tablet-768,mobile-390}/`.

## Breakpoints observed
| Width range | Label |
|---|---|
| ≥ 1440px | desktop |
| 1024–1439px | laptop |
| 768–1023px | tablet |
| < 768px | mobile |

Rebuild Tailwind config will use: sm=640, md=768, lg=1024, xl=1280, 2xl=1440.

## Header / navigation
The site uses a **hamburger-only navigation at every breakpoint** — there is no traditional horizontal nav bar even on desktop. The header is transparent over the hero image, fixed/sticky at the top.

- **desktop-1440:** Sonan wordmark logo top-left, centered water-drop icon (likely link to home), "MENU" text label + 3-line hamburger icon top-right. White text/icons on the dark hero. Vertical pagination dots visible on the right edge of the hero.
- **laptop-1024:** Same layout as desktop — logo left, drop icon center, "MENU" + hamburger right. Pagination dots still on right edge.
- **tablet-768:** Logo left, drop icon center, hamburger icon top-right. "MENU" text label appears dropped (icon only); verify in dev.
- **mobile-390:** Logo left, hamburger icon top-right. Center drop icon hidden. No visible nav links — all navigation is behind the hamburger.

## Hero (homepage)
- **desktop-1440:** Full-bleed shipping container photo. Headline "fuelling the shipping industry" sits left-of-center in large white sans-serif (feels large/medium — not huge). Below the headline: short paragraph ("Sonan Bunkers Group integrates business strategies whilst upholding the highest..."), then two CTAs side-by-side ("DISCOVER SONAN" outlined dark, "EXPLORE OUR SERVICES" outlined light). City strip ("ROTTERDAM · OSLO · RIO DE JANEIRO · SINGAPORE · DUBAI · PANAMA") sits below the CTAs at the bottom of the hero. A small downward scroll arrow is centered.
- **laptop-1024:** Same layout, narrower — headline wraps slightly tighter, CTAs remain side-by-side.
- **tablet-768:** Headline wraps to 2 lines ("fuelling the / shipping industry"). CTAs stack vertically. City strip wraps to 2 rows.
- **mobile-390:** Headline wraps to 2 lines, scaled down. Paragraph stacks below. CTAs stack vertically full-width. City strip wraps to 2 rows ("LONDON · ATHENS · ROTTERDAM" / "OSLO · RIO DE JANEIRO · SINGAPORE" / "DUBAI · PANAMA"). Image remains full-bleed behind.

## Content sections (homepage below the fold)
Most of the homepage below-the-fold is image-driven full-bleed sections rather than card grids (the cookie banner obscures part of the desktop capture — verify in dev).
- **desktop-1440:** Full-width photographic sections stacked vertically; no visible multi-column card grid in the captured viewport. Section headlines likely overlay imagery. Vertical pagination dots (right edge of hero) suggest the hero region itself may be a scroll-snap or slide carousel — verify in dev.
- **laptop-1024:** Same — full-bleed stacking, pagination dots still present.
- **tablet-768:** Same vertical stacking; pagination dots may move or hide — verify in dev.
- **mobile-390:** Same full-width stacking pattern — sections remain single-column at all widths. Vertical rhythm preserved. Pagination dots not visible in the captured viewport.

## Service detail pages (e.g., fuel-products)
- **desktop-1440:** Two-column layout. **Left sidebar** ("Our Services", ~25% width) with a vertical list of service categories (Fuel Products active/highlighted in navy, then Alternative Fuels, Marine Lubricants, Advisory Services, Risk Management / Hedging, Carbon Footprint, Fuel Traceability) and a "CONTACT US" button below. **Right main column** (~75%) has a hero image (green-pipe photo) edge-to-edge, breadcrumb ("Home > Our Services > Fuel Products"), H1 "Fuel Products", and body copy in a white card overlapping the hero image's bottom edge. Below: a full-bleed photographic section ("Sefune" tanker) with two location cards (DXB Dubai, PA Panama) anchored bottom-left in 2 columns.
- **laptop-1024 / tablet-768:** Same two-column structure assumed; sidebar likely narrows. Verify in dev whether the sidebar collapses earlier than mobile.
- **mobile-390:** Stacked. Hero image first → breadcrumb → H1 "Fuel Products" → body copy → then the "Our Services" sidebar moves **below** the content as a vertical list with the same highlight/links → CONTACT US button → full-bleed Sefune image → location cards stacked single-column.

## About-us layout
- **desktop-1440:** Dark teal hero with a centered shipping-container photo and overlaid white "About Us" H1 (large, centered). Below the H1, a 3-column row of section anchors: "YOUR MARINE ENERGY PROVIDER · GROUP CEO STATEMENT · GROUP CFO STATEMENT" (all-caps, light/medium weight, evenly distributed). City strip beneath. Pagination dots on right edge. Lower content cut off by cookie banner — verify in dev.
- **laptop-1024 / tablet-768:** Anchor row likely stays 3-column but tightens; verify whether it wraps to 2+1 on tablet.
- **mobile-390:** Same hero image, "About Us" H1 centered (scaled down). The 3 section anchors stack vertically (one per line, centered, all-caps). City strip wraps below.

## Contact page
- **desktop-1440:** Ocean wave photographic hero with "Contact us" H1 (white) and "SONAN GROUP LTD" + small LinkedIn icon row. Below the hero: an **8-card grid of city offices** (LDN, ATH, RTM, OSL, RJ, SG, DXB, PA) arranged as **3 columns × 3 rows** (last row has 2 cards aligned left). Each card is a white rectangle containing: city code in huge navy display type (feels ~64–80px), city name in dark sans-serif, postal address (multi-line), email address (with "E:" prefix), and a navy "MESSAGE +" button anchored bottom-left. Back-to-top arrow chip centered above footer. **No contact form** — only city cards with email + message buttons.
- **laptop-1024 / tablet-768:** Grid likely shifts to 2 columns on tablet; verify in dev.
- **mobile-390:** Hero shrinks; "Contact us" H1 stays. Cards stack to a **single column**, full-width, same content order (LDN visible first; cookie banner obscures cards below — verify full scroll order in dev). City code display type stays large relative to card width.

## Footer
- **desktop-1440:** Navy `#274380` background, **3-column layout**:
  1. Sonan logo (left)
  2. "Discover Sonan" column with links: Sonan Bunkers, About Us, Our Services, Responsible Partner, Modern Slavery Act Statement
  3. "Connect" column with LinkedIn icon
  Bottom bar: copyright left, sub-links center (Cookies · Privacy Policy · Terms of Use · Terms and Conditions of Sale), "Designed & Developed by Noetik" right.
- **mobile-390:** All 3 columns stack vertically, left-aligned. Logo on top, then Discover Sonan list, then Press Room / Contact / Careers / Legal block, then Connect/LinkedIn. Bottom bar links wrap to multiple lines centered.

## Cross-page observations
- Container appears to max out around 1360px (from DESIGN.md). On desktop-1440, ~40px gutters left/right.
- **Nav collapse point: N/A — hamburger menu is used at every breakpoint.** This is unusual but consistent. The only nav-region change is that the "MENU" text label appears to drop somewhere between 1024px and 768px, leaving the icon alone; verify exact threshold in dev.
- Photography-driven aesthetic at all breakpoints (full-bleed hero imagery on every page).
- Flat design (no shadows) preserved across breakpoints. Cards on contact + service pages are clean white rectangles with thin/no borders.
- Cookie banner (CookieScript) overlays the bottom-left of every page in every screenshot — obscures some below-fold detail; verify in dev.
- Brand navy `#274380` consistent: footer bg, primary buttons, body H1s, city code display type, sidebar active state.
- Button styling consistent: rectangular, no border-radius (or very tight), navy fill with white text for primary, white fill with navy text/border for inverse. "MESSAGE +" pattern uses a `+` glyph suffix.
- Breadcrumbs visible on service detail pages ("Home > Our Services > Fuel Products"); not visible on homepage/about/contact.
- Back-to-top arrow chip (small circle with up-arrow) appears above the footer on multi-section pages at all widths.
- Hero pagination dots (small vertical column, right edge) appear on home + about hero at desktop/laptop; not visible on mobile-390 — likely repositioned or hidden.
- Footer copy ("Designed & Developed by Noetik") right-aligned on desktop, wraps to its own line on mobile.

## Rebuild guidance for Tasks 19–27
- **Container:** `mx-auto px-4 sm:px-6 lg:px-8 max-w-content` (max-w-content = 1360px per tailwind-tokens.draft.mjs).
- **Header:** Hamburger pattern at all widths. Render `<button aria-label="Menu">` with icon + optional `<span class="hidden md:inline">MENU</span>` text label. Logo left, optional centered drop icon (`hidden md:block`), hamburger right. Header is transparent over hero — add scroll-state class to switch to solid white/navy background once scrolled past hero.
- **Hero:** Full-bleed background image with overlay copy. Use `grid` with a single content column + max-width inner block. Stack CTAs `flex flex-col sm:flex-row gap-3`. City strip `flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm tracking-widest`.
- **Service detail pages:** `grid lg:grid-cols-[260px_1fr] gap-8` — sidebar on lg+, sidebar moves below main on mobile. Use markup-order trick: place main first, sidebar second, then `order-1 lg:order-2` to put sidebar on the left at lg+ via `lg:grid-cols-[260px_1fr]` and explicit order classes. Or use a simpler approach: sidebar first in markup, `order-2 lg:order-1` to push it below main on mobile.
- **Contact grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (8 cards = 3+3+2 on lg).
- **Footer:** `grid grid-cols-1 md:grid-cols-3 gap-8` with bottom bar `flex flex-col md:flex-row md:items-center md:justify-between gap-4`.
- **Feature/anchor row (about-us):** `grid grid-cols-1 md:grid-cols-3 gap-4 text-center` with all-caps tracking.
- **Heading sizes:** use fluid `clamp()` per tokens.json normalized values. The contact-page city codes (LDN, ATH, RTM, etc.) want the biggest display tier — feels ~64–80px on desktop, scaling down ~48px on mobile.
- **Buttons:** square corners or very tight radius; navy fill primary, white-fill-with-border secondary; `+` suffix glyph on "MESSAGE +" CTAs.
- **No box shadows.** Use solid white cards on photographic backgrounds for the flat aesthetic.
- **Back-to-top chip:** small circular button (~48px) positioned above footer; show after scroll past first viewport.
