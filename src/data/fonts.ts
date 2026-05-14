// Font loading is delegated to the source site's existing third-party stylesheets.
// Reason: the primary typeface (Averta Standard W01) is served by Monotype's
// fast.fonts.net under a domain-locked license issued for sonanbunkers.com.
// Self-hosting via @fontsource would violate the license. The existing CSS
// link is reused verbatim. Roboto Slab is loaded from Google Fonts (public).
//
// BaseLayout (src/layouts/BaseLayout.astro) imports these and renders the
// corresponding <link> tags inside <head>.

export interface FontLink {
  rel: string;
  href: string;
  type?: string;
}

export const fontLinks: FontLink[] = [
  // Preconnect to Google's font CDN (the order matters for performance — preconnect first)
  { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
  // Monotype: Averta Standard W01 (primary typeface)
  { rel: 'stylesheet', type: 'text/css', href: '//fast.fonts.net/cssapi/41f6110b-1c65-4d7a-9430-ec766a66fd61.css' },
  // Google Fonts: Roboto Slab 300 (accent typeface used per DESIGN.md)
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300&display=swap' },
];
