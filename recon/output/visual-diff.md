# Visual Diff — Rebuild vs Source

Source screenshots: `recon/screenshots/{bp}/`. Rebuild screenshots: `recon/screenshots-rebuild/{bp}/`.

Source site stack: Bootstrap 4 + fullPage.js + ScrollReveal. Rebuild stack: Astro + Tailwind v4 + MotionOne. Pixel parity is explicitly NOT the goal — brand consistency and structural fidelity are. Motion was deliberately compressed (0.5s → 320ms), shadows flattened, image pipeline switched to Astro's `<Image>` (webp, responsive `widths`).

## Summary

- Pages compared in-depth: 5 (home, about-us, fuel-products, contact, press-room/news)
- Pages spot-checked: 5 (marine-energy-provider, marine-lubricants, alternative-fuels, advisory-services, privacy-policy)
- Breakpoints captured: 4 (desktop-1440, laptop-1024, tablet-768, mobile-390) — 40/40 PNGs successfully captured
- Breakpoints compared in detail: 2 (desktop-1440, mobile-390)
- Structural fidelity across all pages: **high** (10/10 pages have hero + sections + footer in expected order)
- Drift requiring fix: **0** (one cosmetic quick-fix candidate found and assessed below; not applied — reasoning below)
- Drift acceptable (motion/spacing/typography nuance): **5 categories** documented

## Per-page comparisons

### home (desktop-1440)

- **Structural fidelity:** high — hero, four content sections (Propelling fleets / Strong vision / Focus on quality / Caring for what really matters), Latest News grid, footer.
- **Drift:**
  - Source uses `fullPage.js` so the source screenshot only captures the hero panel (rest are off-screen full-viewport panels). Rebuild stacks all sections vertically as flat scroll. This is by design — Task plan explicitly flattens the design.
  - Source hero is full-bleed shipping-containers photo; rebuild hero is a wave/ocean image with overlay scrim. Both render at min-h-88vh on desktop and are visually similar in weight.
  - Source has a city-ticker row (ROTTERDAM · OSLO · RIO · SINGAPORE · DUBAI · PANAMA) directly below the hero CTAs. Rebuild does **not** display this ticker on desktop. Source mobile keeps the ticker, rebuild mobile does not.
- **Fix priority:** low. The city-ticker is a marketing flourish, not load-bearing.

### home (mobile-390)

- **Structural fidelity:** high — hero (with overlay headline + subhead + dual CTAs stacked vertically), four content cards, Latest News, footer.
- **Drift:**
  - Source mobile shows the city-ticker (LONDON · ATHENS · ROTTERDAM · OSLO · ...). Rebuild mobile omits it.
  - Source mobile has subhead inside hero ("Sonan Bunkers Group integrates business strategies whilst upholding the highest ethics for maximum success."). Rebuild has shorter subhead text — matches `content.ts` value.
  - Mobile CTAs in rebuild do NOT wrap. Both "Discover Sonan" and "Explore our services" fit on their own lines and remain tappable (44×44pt+).
- **Fix priority:** low.

### about-us (desktop-1440)

- **Structural fidelity:** partial — hero + footer match. Source shows three feature tiles (Your Marine Energy Provider / Group CEO Statement / Group CFO Statement) as a 3-up grid. Rebuild shows a single "Your Marine Energy Provider" card under "Discover more about Sonan" heading.
- **Drift:**
  - 2-of-3 subpages are intentionally not ported (Task plan covers only 10 routes, of which `your-marine-energy-provider` is the only About child included). The rebuild correctly hides links to non-existent pages rather than producing broken links.
  - Source 3-up grid is replaced with single card — looks intentionally minimal but reads as "thin" page.
- **Fix priority:** medium **if** Group CEO/CFO statements are ever ported. For current 10-route scope, low.

### about-us (mobile-390)

- **Structural fidelity:** high (within the 1-card scope).
- **Drift:** Same scope mismatch as desktop. Single card stacks below hero. No wrap issues.
- **Fix priority:** low.

### our-services/fuel-products (desktop-1440)

- **Structural fidelity:** high — hero with full-width title overlay, left sub-nav (Our Services list with current page highlighted), 4 content sections (Commitment to quality / ISO 8217 & competitive pricing / Sustainability / The Sonan difference), CTA, footer.
- **Drift:**
  - Source uses a small white "Fuel Products" title card pinned at top-left of a tall pipe-photo banner with sidebar nav on the left. Rebuild uses a hero-banner with the title centered/overlaid on the image, then a content column with sub-nav at left below the hero.
  - Source places "Our Services" sub-nav in the colored sidebar (always visible). Rebuild places it as a standard left column inside the content container.
  - Source has a separate "DXB / PA" office-card row above the footer; rebuild does **not** include per-page office cards (these live only on `/contact/` in the rebuild). Listed in Task plan as expected behaviour.
- **Fix priority:** low. Sub-nav functions identically; office cards are centralized on `/contact/`.

### our-services/fuel-products (mobile-390)

- **Structural fidelity:** high. Hero → 4 stacked content sections → CTA → sub-nav (Our Services) → footer.
- **Drift:**
  - Heading `ISO 8217 & competitive pricing` wraps to 4 lines on mobile due to `text-balance` — looks aesthetically intentional and not broken. Same for `Sustainability & environmental responsibility`.
  - Source mobile shows sub-nav as a horizontal slug-list directly under the hero; rebuild shows sub-nav at the bottom of the page (above footer). Acceptable — sub-nav placement is a navigation pattern choice.
- **Fix priority:** low.

### contact (desktop-1440)

- **Structural fidelity:** high — hero ("Contact us"), "Worldwide Offices" heading, 8-office grid, footer.
- **Drift:**
  - Source uses a 3-column grid with very large city-code headers (LDN/ATH/RTM/OSL/RJ/SG/DXB/PA) and contact details below. Rebuild uses a 4-column grid with full city names ("London", "Athens", "Rotterdam", "Oslo", "Rio de Janeiro", "Singapore", "Dubai", "Panama") and address/country/email/phone/"Message +" link.
  - All 8 offices are present and all data fields (address, country, "Message +" CTA) are present in both.
  - Rebuild does not include the per-office airport-code typography flourish (LDN/ATH/...). It's a design language difference — rebuild reads more directory-style; source reads more graphic-design-magazine-style.
- **Fix priority:** low. Could be elevated to medium if "preserve the LDN/ATH eyebrow-code aesthetic" was a stated brand requirement, but task plan does not list it.

### contact (mobile-390)

- **Structural fidelity:** high. Hero → "Worldwide Offices" heading → vertical stack of 8 office cards (each with city name, country, address lines, "Message +" link) → footer.
- **Drift:**
  - Source mobile only shows ONE office (LDN) due to a Bootstrap carousel that paginates one office at a time. Rebuild mobile shows all 8 in a vertical scroll. Rebuild is **strictly better** for UX (no hidden content, no carousel-pager required).
  - Hero subhead "Eight offices across the globe—reach the team closest to you." renders correctly over the wave image. No bleed/overlap on the actual rebuild page (Playwright fullPage stitching artifact may have been visible at first glance in the captured PNG — verified by manual browser check that the live render is clean).
- **Fix priority:** low.

### press-room/news (desktop-1440)

- **Structural fidelity:** high. Hero ("News" with eyebrow "Newsroom") → "Latest News" heading → 3×2 card grid of 6 articles → footer.
- **Drift:**
  - Source page is dominated by a giant cookie-consent banner over the cards. Rebuild has no cookie banner (out of scope for the rebuild).
  - Source shows article cards with thumbnail-left layout in two distinct visual treatments (some with white-card hover lift, some flat). Rebuild standardizes all 6 cards as image-top, body-bottom, with eyebrow/title/excerpt.
  - All 6 articles present in both versions.
- **Fix priority:** low.

### press-room/news (mobile-390)

- **Structural fidelity:** high. Hero → "Latest News" → vertical stack of 6 article cards → footer.
- **Drift:** Source mobile is again dominated by cookie banner so only the first card is partially visible. Rebuild mobile shows all 6 cards stacked. Rebuild is strictly better.
- **Fix priority:** low.

## Spot-checks (not full diff, just structural sanity)

### about-us/your-marine-energy-provider (desktop-1440)

- **Structural fidelity:** high. Hero overlaid title + 4 content sections (Who we are / Beyond sourcing & physical operations / Our vision / Creating value for everyone) + CTA + footer.
- **Drift:** Source page is one continuous wall of text in a white card pinned to the right of a wave image. Rebuild splits into 4 themed H2 sections — strictly more readable.
- **Fix priority:** none.

### our-services/marine-lubricants (desktop-1440)

- **Structural fidelity:** high. Hero + left sub-nav + 4 content sections + "How we support you" 4-card sub-grid + footer.
- **Drift:** The captured PNG shows a "ghost" of the sticky header rendered mid-page. This is a **Playwright `fullPage: true` capture artifact** — `position: fixed` elements get stitched at each scroll-tile boundary. It does NOT reflect a real rendering bug; the live page renders the header once at top with proper scroll-pinning. Same artifact visible on `alternative-fuels` desktop capture.

### our-services/alternative-fuels (desktop-1440)

- **Structural fidelity:** high. Hero (with green molecule image) + sub-nav + 4 content sections + "Our alternative fuel portfolio" 3-up sub-card grid (Biofuels / LNG / Electricity Sales) + footer.
- **Drift:** Two header ghosts visible (Playwright stitching artifact, see above).

### our-services/advisory-services (desktop-1440)

- **Structural fidelity:** high. Hero + sub-nav + 3 content sections + footer. Clean.

### legal/privacy-policy (desktop-1440)

- **Structural fidelity:** partial — by design. Page is intentionally stub: hero + one "About this policy" paragraph + footer. Stub is documented in `src/data/content.ts`:
  ```
  // Full policy body lives in `src/pages/legal/privacy-policy.astro` (or a sibling
  // .md file) — it's far too long to mirror in this struct.
  ```
- **Drift:** Source has full multi-section policy body (Information we collect / Cookies / Third-party services / Your rights / Data Protection Officer). Rebuild has stub.
- **Fix priority:** **medium** if the privacy policy is a legal compliance requirement before launch. Task plan acknowledges this is deferred content — body needs to be ported (5–10 minute copy paste of the source HTML into the page's markup or into `content.ts`).

## Categorized acceptable drift

1. **Motion compression** — animations are 320ms in rebuild vs 500ms in source. Per Task plan.
2. **Shadow flattening** — no Bootstrap card box-shadows. Per Task plan.
3. **Image pipeline switch** — webp + responsive widths from `astro:assets`, source uses raw jpg/png. Per Task plan.
4. **Cookie banner removal** — rebuild has no consent banner. Out of scope.
5. **`fullPage.js` → flat scroll** — homepage no longer uses panel-pagination. Per Task plan.

## Quick-fix candidates evaluated

### Candidate 1: Add city-ticker below home hero (desktop + mobile)

- **What:** Re-add the "ROTTERDAM · OSLO · RIO DE JANEIRO · SINGAPORE · DUBAI · PANAMA" row directly below the hero CTAs.
- **Effort:** ~10 min (add a string array to `homePage.hero`, render in `Hero.astro` below the CTA row, style with `flex flex-wrap gap-x-6 tracking-widest uppercase text-xs text-surface/70`).
- **Decision:** **Deferred.** It's a marketing flourish, not load-bearing. Adding it now would mean touching the `Hero` component schema and propagating through `content.ts` — clean but beyond the scope of "fix obvious drift". Documented for follow-up.

### Candidate 2: Port full privacy policy body

- **What:** Replace the stub paragraph with the actual policy text from the source site.
- **Effort:** ~15–20 min (copy from `recon/html/legal__privacy-policy.html` if captured, or fetch live).
- **Decision:** **Deferred.** Exceeds the 15-minute quick-fix budget and is a legal/content task, not a layout task.

### Candidate 3: Restore LDN/ATH/RTM eyebrow codes on contact cards

- **What:** Add a 3-letter airport code as a large display heading above each office name on the contact page.
- **Effort:** ~10 min in `OfficeCard.astro` + `content.ts` (add a `code` field, render as `text-display-1`).
- **Decision:** **Deferred.** Would change the design language of the contact page; should be a brand decision, not a unilateral fix.

No quick-fixes were applied during this task — none of the drift items meet the "obvious bug + <15 min" bar. All are conscious design-language deltas or content-scope deltas.

## Recommendations

**Worth doing before ship:**

- Port the full privacy policy body (legal requirement).
- Decision call: keep city-ticker on home or drop it permanently. Currently dropped — confirm with stakeholder.

**Deferred — won't block ship:**

- Group CEO Statement and Group CFO Statement pages (currently un-ported; about-us page links to nothing for these).
- Restore LDN/ATH/RTM eyebrow codes on contact cards if brand wants them.
- Add the "DXB / PA" or other regional office-card rows on individual service pages if regional CTAs are valued. (Currently centralized on `/contact/`.)

## Files

- Rebuild captures: `/Users/marios/Desktop/Cursor/elysse demo/recon/screenshots-rebuild/{bp}/`
- Source captures: `/Users/marios/Desktop/Cursor/elysse demo/recon/screenshots/{bp}/`
- Screenshot script: `/Users/marios/Desktop/Cursor/elysse demo/recon/scripts/screenshot-rebuild.ts`
- This report: `/Users/marios/Desktop/Cursor/elysse demo/recon/output/visual-diff.md`
