export interface NavItem { label: string; href: string; children?: NavItem[]; }

/**
 * Primary navigation — mirrors the source site's `.main-menu-title` blocks
 * (8 top-level sections plus a "Home" entry we add for the rebuild).
 *
 * Source order on https://www.sonanbunkers.com/ :
 *   Sonan Bunkers · About Us · Our Services · Responsible Partner ·
 *   Press Room · Contact · Careers · Legal
 *
 * The "Sonan Bunkers" top-level is a label only on the source (no anchor),
 * but its child links live under /sonan-bunkers-people-working-together/.
 * We point the top-level label at that hub so the menu remains navigable.
 *
 * `children` capture the source's sub-menu items so the eventual mega-menu /
 * mobile drawer can render them without re-querying the source.
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Sonan Bunkers',
    href: '/sonan-bunkers-people-working-together/',
    children: [
      { label: 'Our Commitment to Clients', href: '/sonan-bunkers-people-working-together/our-commitment-to-clients/' },
      { label: 'Our Team', href: '/sonan-bunkers-people-working-together/our-team/' },
    ],
  },
  {
    label: 'About Us',
    href: '/about-us/',
    children: [
      { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
      { label: 'Group CEO Statement', href: '/about-us/group-ceo-statement/' },
      { label: 'Group CFO Statement', href: '/about-us/group-cfo-statement/' },
    ],
  },
  {
    label: 'Our Services',
    href: '/our-services/',
    children: [
      { label: 'Fuel Products', href: '/our-services/fuel-products/' },
      { label: 'Marine Lubricants', href: '/our-services/marine-lubricants/' },
      { label: 'Alternative Fuels', href: '/our-services/alternative-fuels/' },
      { label: 'Advisory Services', href: '/our-services/advisory-services/' },
      { label: 'Risk Management / Hedging', href: '/our-services/risk-management-hedging/' },
      { label: 'Carbon Footprint', href: '/our-services/carbon-footprint-compensation/' },
      { label: 'Fuel Traceability', href: '/our-services/digital-physical-fuel-traceability/' },
    ],
  },
  {
    label: 'Responsible Partner',
    href: '/responsible-partner/',
    children: [
      { label: 'Compliance', href: '/responsible-partner/compliance/' },
      { label: 'CSR', href: '/responsible-partner/csr/' },
      { label: 'Data Protection', href: '/responsible-partner/data-protection-gdpr/' },
      { label: 'HSEQ', href: '/responsible-partner/hseq/' },
      { label: 'Anti-Corruption Policy', href: '/responsible-partner/anti-corruption-policy/' },
      { label: 'Sustainability', href: '/responsible-partner/sustainability/' },
    ],
  },
  {
    label: 'Press Room',
    href: '/press-room/',
    children: [
      { label: 'News', href: '/press-room/news/' },
      { label: 'Annual Reports', href: '/press-room/annual-reports/' },
    ],
  },
  { label: 'Contact', href: '/contact/' },
  { label: 'Careers', href: '/careers/' },
  {
    label: 'Legal',
    href: '/legal/',
    children: [
      { label: 'Cookies', href: '/legal/cookies/' },
      { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
      { label: 'Terms of Use', href: '/legal/terms-of-use/' },
      { label: 'Terms and Conditions of Sale', href: '/legal/terms-and-conditions-of-sale/' },
    ],
  },
];

/**
 * Footer link columns — mirrors source structure observed on
 * https://www.sonanbunkers.com/ (div-based markup, captured manually because
 * the Task 4 crawler couldn't infer a semantic `<footer>`).
 *
 * Source layout: 4 cols on desktop — [logo][Discover Sonan][unlabeled][Connect].
 * We collapse the logo column into Footer.astro (it's not a link list) and
 * keep the two link columns + a trailing legal row rendered separately.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Discover Sonan',
    items: [
      { label: 'Sonan Bunkers', href: '/sonan-bunkers-people-working-together/' },
      { label: 'About Us', href: '/about-us/' },
      { label: 'Our Services', href: '/our-services/' },
      { label: 'Responsible Partner', href: '/responsible-partner/' },
      { label: 'Modern Slavery Act Statement', href: '/media/1305/signedmsas.pdf' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Press Room', href: '/press-room/' },
      { label: 'Contact', href: '/contact/' },
      { label: 'Careers', href: '/careers/' },
      { label: 'Legal', href: '/legal/' },
    ],
  },
];

/** Legal / utility links rendered in the bottom strip beside the copyright. */
export const footerLegal: NavItem[] = [
  { label: 'Cookies', href: '/legal/cookies/' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
  { label: 'Terms of use', href: '/legal/terms-of-use/' },
  { label: 'Terms and Conditions of Sale', href: '/legal/terms-and-conditions-of-sale/' },
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
