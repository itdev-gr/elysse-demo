export interface NavItem { label: string; href: string; children?: NavItem[]; }

/**
 * Primary navigation — trimmed to the 10 routes actually rebuilt under the
 * Astro plan (Task 32). The source site has many more top-level sections, but
 * for the rebuild we keep the menu pointed only at pages that exist so there
 * are zero broken internal links.
 *
 * Rebuilt routes:
 *   /  ·  /about-us/  ·  /about-us/your-marine-energy-provider/
 *   /our-services/{fuel-products,marine-lubricants,alternative-fuels,advisory-services}/
 *   /contact/  ·  /press-room/news/  ·  /legal/privacy-policy/
 *
 * `children` are kept where a top-level entry has rebuilt sub-pages so the
 * mega-menu / mobile drawer can render them without extra plumbing.
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: '/about-us/',
    children: [
      { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
    ],
  },
  {
    label: 'Our Services',
    href: '/our-services/fuel-products/',
    children: [
      { label: 'Fuel Products', href: '/our-services/fuel-products/' },
      { label: 'Marine Lubricants', href: '/our-services/marine-lubricants/' },
      { label: 'Alternative Fuels', href: '/our-services/alternative-fuels/' },
      { label: 'Advisory Services', href: '/our-services/advisory-services/' },
    ],
  },
  { label: 'News', href: '/press-room/news/' },
  { label: 'Contact', href: '/contact/' },
];

/**
 * Footer link columns — trimmed alongside primaryNav (Task 32) so every link
 * resolves to a rebuilt page. The source site's footer carried "Discover Sonan"
 * and "Company" columns plus a Modern Slavery PDF link; we keep the two columns
 * but populate them only with rebuilt routes.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Discover Sonan',
    items: [
      { label: 'About Us', href: '/about-us/' },
      { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
      { label: 'Fuel Products', href: '/our-services/fuel-products/' },
      { label: 'Marine Lubricants', href: '/our-services/marine-lubricants/' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Alternative Fuels', href: '/our-services/alternative-fuels/' },
      { label: 'Advisory Services', href: '/our-services/advisory-services/' },
      { label: 'News', href: '/press-room/news/' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
];

/** Legal / utility links rendered in the bottom strip beside the copyright. */
export const footerLegal: NavItem[] = [
  { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
];

/**
 * Social icons — only LinkedIn is present on the source ("Connect" column).
 * `icon` is the inner-SVG markup; Footer.astro wraps it in <svg viewBox="0 0 24 24">.
 * Path is the LinkedIn glyph (Simple Icons, CC0).
 */
export const social: { label: string; href: string; icon: string }[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/11204464/admin/',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
];
