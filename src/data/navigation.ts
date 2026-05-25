export interface NavItem { label: string; href: string; children?: NavItem[]; }

/**
 * Primary navigation — full rebuild mirroring elysee.com.cy's 6-pillar structure.
 * Source: https://elysee.com.cy/en (mega-menu, May 2026).
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: '/about-us/',
    children: [
      { label: 'Corporate Profile', href: '/about-us/' },
      { label: 'History', href: '/about-us/history/' },
      { label: 'Company Structure', href: '/about-us/company-structure/' },
      { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
      { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
    ],
  },
  {
    label: 'Green Elysée',
    href: '/green-elysee/',
    children: [
      { label: 'About Green Elysée', href: '/green-elysee/' },
      { label: 'Certifications', href: '/green-elysee/certifications/' },
      { label: 'Reports', href: '/green-elysee/reports/' },
      { label: 'Insights', href: '/green-elysee/insights/' },
    ],
  },
  {
    label: 'Innovation',
    href: '/innovation/why-innovation/',
    children: [
      { label: 'Why Innovation', href: '/innovation/why-innovation/' },
      { label: 'Research & Development', href: '/innovation/research-development/' },
      { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/' },
      { label: 'Innovation Insights', href: '/innovation/insights/' },
      { label: 'Network Partners', href: '/innovation/network-partners/' },
      { label: 'Innovate with Us', href: '/innovation/innovate-with-us/' },
    ],
  },
  {
    label: 'Products',
    href: '/products/',
    children: [
      { label: 'Categories', href: '/products/' },
      { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
      { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/' },
    ],
  },
  {
    label: 'Insights',
    href: '/insights/news/',
    children: [
      { label: 'News', href: '/insights/news/' },
      { label: 'Blog', href: '/insights/blog/' },
      { label: 'Exhibitions', href: '/insights/exhibitions/' },
      { label: 'Media', href: '/insights/media/' },
      { label: 'eBooks', href: '/insights/ebooks/' },
    ],
  },
  {
    label: 'Contact Us',
    href: '/contact/local/',
    children: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
    ],
  },
];

export interface MegaGroup {
  title: string;
  href?: string;
  items: NavItem[];
}

/** Tuple shape: [column 1 groups, column 2 groups, column 3 groups] */
export type MegaColumns = [MegaGroup[], MegaGroup[], MegaGroup[]];

/**
 * Mega-menu data — 6 categories arranged across 3 columns. Consumed via
 * `navGroups` by PrimaryNav.astro (desktop) and MobileNav.astro (mobile).
 */
export const megaNav: MegaColumns = [
  // Column 1
  [
    {
      title: 'About Us',
      href: '/about-us/',
      items: [
        { label: 'Corporate Profile', href: '/about-us/' },
        { label: 'History', href: '/about-us/history/' },
        { label: 'Company Structure', href: '/about-us/company-structure/' },
        { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
        { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
      ],
    },
    {
      title: 'Green Elysée',
      href: '/green-elysee/',
      items: [
        { label: 'About Green Elysée', href: '/green-elysee/' },
        { label: 'Certifications', href: '/green-elysee/certifications/' },
        { label: 'Reports', href: '/green-elysee/reports/' },
        { label: 'Insights', href: '/green-elysee/insights/' },
      ],
    },
  ],
  // Column 2
  [
    {
      title: 'Innovation',
      href: '/innovation/why-innovation/',
      items: [
        { label: 'Why Innovation', href: '/innovation/why-innovation/' },
        { label: 'Research & Development', href: '/innovation/research-development/' },
        { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/' },
        { label: 'Innovation Insights', href: '/innovation/insights/' },
        { label: 'Network Partners', href: '/innovation/network-partners/' },
        { label: 'Innovate with Us', href: '/innovation/innovate-with-us/' },
      ],
    },
    {
      title: 'Products',
      href: '/products/',
      items: [
        { label: 'Categories', href: '/products/' },
        { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
        { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/' },
      ],
    },
  ],
  // Column 3
  [
    {
      title: 'Insights',
      href: '/insights/news/',
      items: [
        { label: 'News', href: '/insights/news/' },
        { label: 'Blog', href: '/insights/blog/' },
        { label: 'Exhibitions', href: '/insights/exhibitions/' },
        { label: 'Media', href: '/insights/media/' },
        { label: 'eBooks', href: '/insights/ebooks/' },
      ],
    },
    {
      title: 'Contact Us',
      href: '/contact/local/',
      items: [
        { label: 'Local Network', href: '/contact/local/' },
        { label: 'Worldwide Network', href: '/contact/worldwide/' },
        { label: 'Elysée WISE', href: '/contact/wise/' },
        { label: 'Elysée PRIME', href: '/contact/prime/' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
      ],
    },
  ],
];

/** Flat list consumed by PrimaryNav and MobileNav (one source of truth). */
export const navGroups: MegaGroup[] = megaNav.flat();

/**
 * Footer link columns — mirrors live site footer (About us, Green Elysée,
 * Products, Insights, Contact us). 5 columns; bottom strip has Terms of Use,
 * Terms of Supply, Privacy Policy + copyright.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'About us',
    items: [
      { label: 'History', href: '/about-us/history/' },
      { label: 'Company Structure', href: '/about-us/company-structure/' },
      { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
      { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
    ],
  },
  {
    title: 'Green Elysée',
    items: [
      { label: 'About Green Elysée', href: '/green-elysee/' },
      { label: 'Certifications', href: '/green-elysee/certifications/' },
      { label: 'Reports', href: '/green-elysee/reports/' },
      { label: 'Insights', href: '/green-elysee/insights/' },
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Categories', href: '/products/' },
      { label: 'Catalogues & Leaflets', href: '/products/catalogues/' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'News', href: '/insights/news/' },
      { label: 'Blog', href: '/insights/blog/' },
      { label: 'Exhibitions', href: '/insights/exhibitions/' },
      { label: 'Media', href: '/insights/media/' },
      { label: 'eBooks', href: '/insights/ebooks/' },
      { label: 'Environmental Report', href: '/green-elysee/reports/' },
    ],
  },
  {
    title: 'Contact us',
    items: [
      { label: 'Local Network', href: '/contact/local/' },
      { label: 'Worldwide Network', href: '/contact/worldwide/' },
      { label: 'Elysée WISE', href: '/contact/wise/' },
      { label: 'Elysée PRIME', href: '/contact/prime/' },
      { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
    ],
  },
];

/** Legal/utility links rendered in the bottom strip beside the copyright. */
export const footerLegal: NavItem[] = [
  { label: 'Terms of Use', href: '/legal/terms-of-use/' },
  { label: 'Terms of Supply', href: '/legal/terms-of-supply/' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
];

/** Social icons — LinkedIn only (per source site Connect column). */
export const social: { label: string; href: string; icon: string }[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/11204464/admin/',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
];
