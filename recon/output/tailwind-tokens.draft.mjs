// recon/output/tailwind-tokens.draft.mjs
//
// Tailwind theme draft distilled from DESIGN.md + recon/output/tokens.json.
// Every value below traces back to one of those two files (rendered runtime
// computed styles on https://www.sonanbunkers.com/ @ 1440x900).
//
// IMPORTANT — font-size normalization:
// Source site uses a 10px rem-base hack (`body { font-size: 10px }`) so that
// downstream `1.4rem` = 14px. Tailwind/Astro use the standard 16px base.
// Values below are normalized to a 16px rem base: each px value from
// tokens.json is converted as `px / 16 = rem`. The rendered px result on the
// rebuild therefore matches the source one-for-one (e.g. h1 90px == 5.625rem).
//
// Breakpoints note: Tailwind defaults are kept (sm/md/lg/xl) and a `2xl: 1440px`
// stop is added. The 1440px anchor matches the source's widest body child
// (tokens.json `widestChild: 1440`) and the desktop screenshot width in
// recon/screenshots/desktop-1440/. The source's own Bootstrap-4 breakpoints
// (576/768/992/1200px, exposed on :root) overlap with Tailwind sm/md/lg/xl
// closely enough that we use Tailwind's standard set for consistency.

export default {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // Brand navy — DESIGN.md §2: paragraph color + primary CTA fill (107 elements).
        brand: {
          DEFAULT: '#274380',
          navy: '#274380',
          deep: '#1D3274', // footer band, DESIGN.md §2
        },
        // Body text default — Bootstrap --gray-dark adjacent, 142 elements.
        ink: {
          DEFAULT: '#212529',
          muted: '#545454', // form input gray, DESIGN.md §2 / §9
          form: '#545454',
        },
        // Surfaces — DESIGN.md §2.
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#EAEFEF', // light gray section fill (2 backgrounds)
          divider: '#D2D7E4', // muted blue-gray dividers / muted text (16 elements)
        },
        // Sea-foam teal band/separator panels — DESIGN.md §2.
        teal: {
          DEFAULT: '#84A2A4', // 16 backgrounds (band/separator)
          alt: '#86A4A6',     // 3 elements (secondary text/border)
        },
        // Only warm accent (peach/orange) — use sparingly per DESIGN.md §2.
        accent: {
          DEFAULT: '#F1B578',
          peach: '#F1B578',
        },
        // Bootstrap leakage: the unstyled <a> color is still #007BFF on 40
        // elements (DESIGN.md §2 + §12 "Source observations"). Tracked here so
        // we can intentionally match it for visual parity during the port,
        // then refactor links away from this borderline-AA value.
        bootstrapDefault: '#007BFF',
        // Scrim overlay used on cookie banner + image overlays (3 elements).
        scrim: 'rgba(0, 0, 0, 0.5)',
      },

      fontFamily: {
        // Primary UI sans — DESIGN.md §3 (394 elements). Served via Monotype
        // fast.fonts.net CSS API; the existing <link> is reused (see Task 15).
        sans: ['"Averta Standard W01"', 'system-ui', 'sans-serif'],
        // Paragraph copy — DESIGN.md §3 (24 elements, served via Google Fonts).
        slab: ['"Roboto Slab"', 'Georgia', 'serif'],
        // Form input stack — DESIGN.md §3 / §9 (20 elements; Open Sans is the
        // body font for form inputs in the source even though the homepage has
        // no forms — the cookie banner widget surfaces it).
        body: ['"Open Sans"', 'Arial', '"Trebuchet MS"', '"Segoe UI"', 'Helvetica', 'sans-serif'],
      },

      // Font sizes normalized to 16px rem base (see header note).
      // Each entry: [fontSize, { lineHeight, letterSpacing }]
      // Source px values come from tokens.json `elements.*`.
      fontSize: {
        // body: 10px / 15px / normal (tokens.json elements.body)
        'body-base': ['0.625rem', { lineHeight: '0.9375rem', letterSpacing: 'normal' }],
        // p: 14px / 21.994px / normal (tokens.json elements.p)
        'paragraph': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: 'normal' }],
        // a / header: 10px / 15px (tokens.json elements.a, elements.header)
        'link': ['0.625rem', { lineHeight: '0.9375rem', letterSpacing: 'normal' }],
        // input: 14px / 0px (tokens.json elements.input — line-height 0 is a
        // widget quirk; not propagated as a Tailwind utility).
        'input': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: 'normal' }],
        // h2: 70px / 84px / 800 (tokens.json elements.h2)
        'display-2': ['4.375rem', { lineHeight: '5.25rem', letterSpacing: 'normal' }],
        // h1: 90px / 108px / 800 (tokens.json elements.h1)
        'display-1': ['5.625rem', { lineHeight: '6.75rem', letterSpacing: 'normal' }],
      },

      fontWeight: {
        // Observed weights in tokens.json: 300 (p), 400 (body/a/input/header), 800 (h1/h2).
        light: '300',
        normal: '400',
        heavy: '800',
      },

      // Recurring numeric values from DESIGN.md §4 "Spacing".
      // `5px / 10px / 30px` vertical rhythm; `40px / 70px / 100px` horizontal.
      spacing: {
        '0.5': '5px',   // h1 margin-bottom, h2 margin-bottom
        '2.5': '10px',  // p margin-bottom
        '7.5': '30px',  // h2 margin-top
        '10': '40px',   // h2 margin-left
        '17.5': '70px', // header horizontal padding
        '25': '100px',  // h2 margin-right
        'header': '80px', // DESIGN.md §5: desktop header height (tokens.json.headerHeight)
      },

      // DESIGN.md §6: only a handful of radii rendered. No large card radius.
      borderRadius: {
        none: '0px',
        chip: '2px',
        btn: '3px',  // Buttons / form fields (Bootstrap default ~3px)
        pill: '20px',
        full: '50%', // Circular icon backgrounds (12 elements)
        round: '100%', // Round badges (2 elements)
      },

      // DESIGN.md §7: "site is intentionally flat — zero box-shadows rendered."
      // Override Tailwind's default ramp to enforce flatness.
      boxShadow: {
        none: 'none',
      },

      maxWidth: {
        // tokens.json.contentContainerWidth — widest non-body container (1360px).
        // Outer wrapper is full-bleed; this is the inner content guide.
        content: '1360px',
        // tokens.json.widestChild — full-bleed body child width.
        bleed: '1440px',
      },

      // DESIGN.md §11 "Animation hint": durations & timing functions actually
      // observed at runtime. Names chosen to map onto the rendered roles.
      transitionDuration: {
        micro: '100ms',   // 0.1s — micro hover/focus feedback (17 elements)
        fast: '200ms',    // derived alias between micro/base for hover affordances
        base: '500ms',    // 0.5s — header bg transition on scroll (18 elements)
        slow: '1000ms',   // 1s — section fade-ins (7 elements)
        hero: '2000ms',   // 2s — h1/h2 hero opacity fade (7 elements)
      },

      transitionTimingFunction: {
        // 16 elements — most-used curve in the source.
        'in-out': 'ease-in-out',
        // 9 elements — Material-style decelerate curve used on the source.
        'decelerate': 'cubic-bezier(0.1, 0.57, 0.1, 1)',
        // Standard Material "ease-out" emitted on 1 select widget element.
        'standard': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
};
