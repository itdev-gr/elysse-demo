export interface NavItem { label: string; href: string; children?: NavItem[]; }

/**
 * Primary navigation — trimmed to the 10 routes actually rebuilt under the
 * Astro plan (Task 32). The source site has many more top-level sections, but
 * for the rebuild we keep the menu pointed only at pages that exist so there
 * are zero broken internal links.
 *
 * Rebuilt routes:
 *   /  ·  /about-us/  ·  /about-us/your-marine-energy-provider/
 *   /our-services/{agriculture,landscape,building-infrastructure,industry}/
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
    href: '/our-services/agriculture/',
    children: [
      { label: 'Agriculture', href: '/our-services/agriculture/' },
      { label: 'Landscape', href: '/our-services/landscape/' },
      { label: 'Building & Infrastructure', href: '/our-services/building-infrastructure/' },
      { label: 'Industry', href: '/our-services/industry/' },
    ],
  },
  { label: 'News', href: '/press-room/news/' },
  { label: 'Contact', href: '/contact/' },
];

/**
 * Footer link columns — trimmed alongside primaryNav (Task 32) so every link
 * resolves to a rebuilt page. The source site's footer carried "Discover Elysse"
 * and "Company" columns plus a Modern Slavery PDF link; we keep the two columns
 * but populate them only with rebuilt routes.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Discover Elysse',
    items: [
      { label: 'About Us', href: '/about-us/' },
      { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
      { label: 'Agriculture', href: '/our-services/agriculture/' },
      { label: 'Landscape', href: '/our-services/landscape/' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Building & Infrastructure', href: '/our-services/building-infrastructure/' },
      { label: 'Industry', href: '/our-services/industry/' },
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

/**
 * Mega-menu data — full source-site nav, 8 category groups arranged in a
 * 3-column desktop grid (col 1: 3 groups, col 2: 3 groups, col 3: 2 groups).
 * Mirrors the layout in docs/superpowers/plans/2026-05-15-mega-menu.md.
 */
export interface MegaGroup {
  title: string;
  /** Optional href if the heading itself is a link. */
  href?: string;
  items: NavItem[];
}

/** Tuple shape: [column 1 groups, column 2 groups, column 3 groups] */
export type MegaColumns = [MegaGroup[], MegaGroup[], MegaGroup[]];

export const megaNav: MegaColumns = [
  // Column 1
  [
    {
      title: 'Elysee',
      href: '/sonan-bunkers-people-working-together/',
      items: [
        { label: 'Our Commitment to Clients', href: '/sonan-bunkers-people-working-together/our-commitment-to-clients/' },
        { label: 'Our Team', href: '/sonan-bunkers-people-working-together/our-team/' },
      ],
    },
    {
      title: 'Responsible Partner',
      href: '/responsible-partner/',
      items: [
        { label: 'Compliance', href: '/responsible-partner/compliance/' },
        { label: 'CSR', href: '/responsible-partner/csr/' },
        { label: 'Data Protection', href: '/responsible-partner/data-protection-gdpr/' },
        { label: 'HSEQ', href: '/responsible-partner/hseq/' },
        { label: 'Anti-Corruption Policy', href: '/responsible-partner/anti-corruption-policy/' },
        { label: 'Sustainability', href: '/responsible-partner/sustainability/' },
      ],
    },
    {
      title: 'Careers',
      href: '/careers/',
      items: [
        { label: 'Join Us', href: '/careers/' },
      ],
    },
  ],
  // Column 2
  [
    {
      title: 'About Us',
      href: '/about-us/',
      items: [
        { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
        { label: 'Group CEO Statement', href: '/about-us/group-ceo-statement/' },
        { label: 'Group CFO Statement', href: '/about-us/group-cfo-statement/' },
      ],
    },
    {
      title: 'Press Room',
      href: '/press-room/',
      items: [
        { label: 'News', href: '/press-room/news/' },
        { label: 'Annual Reports', href: '/press-room/annual-reports/' },
      ],
    },
    {
      title: 'Legal',
      href: '/legal/',
      items: [
        { label: 'Cookies', href: '/legal/cookies/' },
        { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
        { label: 'Terms of Use', href: '/legal/terms-of-use/' },
        { label: 'Terms and Conditions of Sale', href: '/legal/terms-and-conditions-of-sale/' },
      ],
    },
  ],
  // Column 3
  [
    {
      title: 'Our Services',
      href: '/our-services/agriculture/',
      items: [
        { label: 'Agriculture', href: '/our-services/agriculture/' },
        { label: 'Landscape', href: '/our-services/landscape/' },
        { label: 'Building & Infrastructure', href: '/our-services/building-infrastructure/' },
        { label: 'Industry', href: '/our-services/industry/' },
      ],
    },
    {
      title: 'Contact',
      href: '/contact/',
      items: [
        { label: 'Worldwide Offices', href: '/contact/' },
      ],
    },
  ],
];

/**
 * Flat ordered list of every mega-menu group — consumed by PrimaryNav.astro and
 * MobileNav.astro so both renders stay in lockstep with the single source of truth.
 * Order is column-major: column 1 groups, then column 2, then column 3.
 */
export const navGroups: MegaGroup[] = megaNav.flat();
