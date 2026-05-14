export interface NavItem { label: string; href: string; children?: NavItem[]; }

export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Our Services', href: '/our-services/' },
  { label: 'Responsible Partner', href: '/responsible-partner/' },
  { label: 'Press Room', href: '/press-room/' },
  { label: 'Careers', href: '/careers/' },
  { label: 'Contact', href: '/contact/' },
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
