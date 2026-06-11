# Media + eBook detail pages — crawled 2026-06-11

Sources: live https://elysee.com.cy (WebFetch markdown extraction + Playwright rendered-DOM crawl).

## Media list discovery (/media-list-en)

Page title (h1): **"Media"**

The media list page has two sections: **Videos** and **Photographs**.

IMPORTANT FINDING: the three video cards do NOT link to internal detail pages on elysee.com.cy.
Each card's href points directly to YouTube. There are no media detail slugs to crawl —
the "detail page" for each media item is the YouTube video itself.

### Items found: title → href → thumbnail

1. **Elysee 40 year Anniversary Event**
   - href: `www.youtube.com/watch?v=RGgYIZMK7GU&feature=youtu.be` (note: stored without protocol on the live site)
   - thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/2/the3366-vtNEn.JPG

2. **EUROPEAN BUSINESS AWARD 2014**
   - href: https://www.youtube.com/watch?v=irmQi6HPS18
   - thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/1/group-5589.jpg

3. **CYBC Documentary about Innovation in Cyprus - Elysee Irrigation**
   - href: https://www.youtube.com/watch?v=Dh_k0xo1F8c
   - thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/1/outside-factory-ghSXb.jpg

### Photographs section (lightbox items, no captions)

| Thumbnail | Full image |
|---|---|
| https://elysee.com.cy/portal-img/media_photos_thumb/2/the3366-vtNEn.JPG | https://elysee.com.cy/portal-img/default/2/the3366-vtNEn.JPG |
| https://elysee.com.cy/portal-img/media_photos_thumb/2/the3263.JPG | https://elysee.com.cy/portal-img/default/2/the3263.JPG |
| https://elysee.com.cy/portal-img/media_photos_thumb/2/the3381.JPG | https://elysee.com.cy/portal-img/default/2/the3381.JPG |

## Media item 1 — Elysee 40 year Anniversary Event

- Title (card text, verbatim): "Elysee 40 year Anniversary Event"
- No internal detail page exists; card links straight to YouTube.
- Video URL: https://www.youtube.com/watch?v=RGgYIZMK7GU&feature=youtu.be
  - Embeddable form: https://www.youtube.com/embed/RGgYIZMK7GU
- Poster/thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/2/the3366-vtNEn.JPG
- No body text beyond the title on the list page.

## Media item 2 — EUROPEAN BUSINESS AWARD 2014

- Title (card text, verbatim): "EUROPEAN BUSINESS AWARD 2014"
- No internal detail page exists; card links straight to YouTube.
- Video URL: https://www.youtube.com/watch?v=irmQi6HPS18
  - Embeddable form: https://www.youtube.com/embed/irmQi6HPS18
- Poster/thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/1/group-5589.jpg
- No body text beyond the title on the list page.

## Media item 3 — CYBC Documentary about Innovation in Cyprus - Elysee Irrigation

- Title (card text, verbatim): "CYBC Documentary about Innovation in Cyprus - Elysee Irrigation"
- No internal detail page exists; card links straight to YouTube.
- Video URL: https://www.youtube.com/watch?v=Dh_k0xo1F8c
  - Embeddable form: https://www.youtube.com/embed/Dh_k0xo1F8c
- Poster/thumbnail: https://elysee.com.cy/portal-img/video_thumb_img/1/outside-factory-ghSXb.jpg
- No body text beyond the title on the list page.

## /green-elysee-yearly-report-2021

Browser page title: "Green Elysee Yearly Report 2021"

### Verbatim content

Eyebrow/kicker: **GREEN ELYSEE**

H1: **Green Elysee: Yearly Report 2021**

> Download Elysee's 2021 Green report and learn "How Elysee aims to circle the square"

Button: **DOWNLOAD**

H2: **What's Inside This Book**

> Elysée acknowledges that businesses have a tremendous impact on climate change and can help in the fight against it. For this reason, we are setting a strategic approach to help us ultimately lead the way to a circular economy model, a testimony of our commitment to quality, towards the fulfillment of our goals for sustainability. Generally, a company's minimized carbon footprint is what leads to carbon neutrality.
>
> We are dedicated to our dream to guide Life on a green path.

Bulleted list (verbatim):
- An introduction to "Green Elysee" pillar and our Vision50
- What we have in mind for guiding Life on a green path
- Carbon Footprint: Quantifying our environmental impact
- Green Energy: Investing in renewable energy and reducing significantly the energy intensity of our production facilities
- Zero Waste: Achieving Zero-waste-to-landfill as well as diverting piping waste from landfill
- Circular Economy: Philosophy, initiatives, and Green thinking
- Green Circular products and Technologies for Circularity: High quality, safe, and innovative products, particularly circular products and technologies of circularity
- Green Policy: Investing in emissions offsetting projects

CTA section:
- **DOWNLOAD NOW**
- **Get Your Free Copy Today**

H2: **Our Long History Uncovered**

> Elysee has been supplying irrigation systems for more than four decades and has successfully supplied the highest quality products to clients in over 65 countries. Over the years we have won many awards for our products and we hold many internationally renowned certificates of quality.
>
> Being a long-established business, through our attention to detail, experience, use of state-of-the-art machinery, and diligent manufacturing of innovative and high-quality products, our long history in the irrigation industry has paved the road to targeted customer service, tailored to your specific needs.
>
> We have a very large selection of eco-friendly, corrosion-free, durable, and easy-to-install innovative landscaping products and irrigation systems – smart, flexible, and perfect to cover all types of projects, from small gardens to large-scale landscapes.

### Download mechanism (no direct PDF link)

There is NO direct .pdf anchor on this page. Download is gated behind a lead-capture modal/form:
- Form POSTs to `https://elysee.com.cy/contact-en` with hidden fields `_token`, `contact_type`, `ebook_id`, `ebook_title`
- Visible fields: First name*, Last name*, Email*, Phone Number, Job Position, Company*, Country* (select, default Cyprus)
- Checkboxes (verbatim labels):
  - "I agree with the processing of personal data according to the Privacy Policy."
  - "Yes, I would like to receive regular updates via email from Elysee Irrigation."
- Google reCAPTCHA (`g-recaptcha-response` textarea)
- Buttons: "Download" (opens modal), submit button "Download the ebook here"

### Image URLs / Download links

- Cover image: https://elysee.com.cy/portal-img/default/249/green-elysee-2021-report-eksofyllo.JPG
- Decorative banner leaves: https://elysee.com.cy/theme/assets/img/banner-leaves@2x.png
- Decorative banner leaves 2: https://elysee.com.cy/theme/assets/img/banner-leaves-2@2x.png
- "Our Long History Uncovered" section image: https://elysee.com.cy/portal-img/default/249/elysee-our-long-history-uncovered-9FKXR.jpg
- PDF download link: none (form-gated; see above)

## /environmental-report-2020

Browser page title: "Elysee - Environmental Report 2020"

### Verbatim content

This page is minimal — rendered DOM main content is exactly:

H1: **Environmental Report 2020**

(an inline cover image — see below)

Link text: **Click to Download**

There is no other body text in the main content area (only empty paragraphs / non-breaking spaces).

Note: WebFetch's static-markdown extraction initially returned the main content as empty/truncated
(the cover image is embedded as a ~900 KB base64 data URI, which broke text extraction). A Playwright
rendered-DOM crawl confirmed the actual content above.

### Image URLs / Download links

- Cover image: embedded inline as a base64 `data:image/png` URI (~904,750 chars) directly in the page HTML — there is NO hosted cover image URL for this report.
- Banner decoration: https://elysee.com.cy/assets/img/banner-radius.svg
- PDF download link ("Click to Download"):
  - Raw href as found in markup: `../../../uploads/originals/249/environmental-report-2020.pdf`
  - Resolved absolute URL: https://elysee.com.cy/uploads/originals/249/environmental-report-2020.pdf
  - Unlike the 2021 report, this PDF is a direct, ungated link.

## Failures / caveats

- No fetches failed outright. One retry was needed for /environmental-report-2020 (WebFetch could not extract the main content due to the giant inline base64 image; resolved via Playwright rendered crawl).
- The "3 media detail pages" expected by the brief do not exist as internal pages — media list cards link directly to YouTube. Recorded YouTube URLs + thumbnails instead.
- The first video's href is stored on the live site without a protocol (`www.youtube.com/...`), which a rebuild should normalize to `https://`.
