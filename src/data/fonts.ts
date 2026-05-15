// Per Elysée Brand Guidelines (09 Jan 2024, pp.16–17):
//
//   - Corporate font: Effra (Light, Regular, Medium, Bold, Heavy, italics).
//   - Online fallback: Roboto (Google Fonts) — the explicit web alternative
//     when Effra is unavailable.
//
// Effra is a Dalton Maag licensed typeface and is not freely hostable. If you
// have an Effra licence (Adobe Fonts kit, Monotype fast.fonts.net kit, or a
// self-hosted Dalton Maag bundle), add its <link> to the array below — it
// will take precedence because the font stack in global.css lists Effra
// first. Without that, Roboto (loaded below from Google Fonts) is what users
// will see, which matches the brand guideline's online fallback.
//
// BaseLayout (src/layouts/BaseLayout.astro) iterates this array to render
// the corresponding <link> tags inside <head>.

export interface FontLink {
  rel: string;
  href: string;
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
}

export const fontLinks: FontLink[] = [
  // Preconnect to Google's font CDN first — saves DNS+TLS on the stylesheet fetch.
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },

  // Roboto — brand-documented online fallback for Effra.
  // Weights chosen to match Effra's Light/Regular/Medium/Bold/Heavy ramp.
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
  },

  // Roboto Slab — kept for the slab variant utility (--font-slab).
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;700&display=swap',
  },

  // ⬇  To enable Effra, uncomment and replace KIT_ID with your licensed kit.
  // {
  //   rel: 'stylesheet',
  //   type: 'text/css',
  //   href: '//fast.fonts.net/cssapi/KIT_ID.css',          // Monotype kit
  //   // or: 'https://use.typekit.net/KIT_ID.css',          // Adobe Fonts kit
  // },
];
