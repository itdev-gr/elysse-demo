export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  /** Thumbnail shown in the mega-menu card. Leave undefined to render the branded `MegaThumb` placeholder. */
  image?: string;
  /** Optional one-line description shown below the card label. */
  caption?: string;
  /** Placeholder icon key for items without an image (matches `MegaThumb` icon registry). */
  icon?: 'sparkles' | 'chart' | 'lightbulb' | 'handshake' | 'newspaper' | 'pencil' | 'marquee' | 'play' | 'book' | 'pin' | 'globe' | 'dot';
  /** Mega-panel variant. Defaults to the standard `MegaPanel`. */
  variant?: 'pill-tabs';
}

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
    variant: 'pill-tabs',
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
  /** Optional variant flag matching `NavItem.variant`. */
  variant?: 'pill-tabs';
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
        { label: 'Corporate Profile', href: '/about-us/', image: '/images/about/facility-exterior.jpg', caption: 'Who we are, where we operate' },
        { label: 'History', href: '/about-us/history/', image: '/images/about/founder-vintage.jpg', caption: 'From 1968 to today' },
        { label: 'Company Structure', href: '/about-us/company-structure/', image: '/images/about/hq-aerial.jpg', caption: 'Group, brands & facilities' },
        { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/', image: '/images/about/engineers-meeting.jpg', caption: 'What drives us' },
        { label: 'Quality & Certifications', href: '/about-us/quality-certifications/', image: '/images/about/qa-lab.jpg', caption: 'ISO, EMAS, ISCC+ accreditations' },
      ],
    },
    {
      title: 'Green Elysée',
      href: '/green-elysee/',
      items: [
        { label: 'About Green Elysée', href: '/green-elysee/', image: '/images/about/water-flowing.jpg', caption: 'Our sustainability programme' },
        { label: 'Certifications', href: '/green-elysee/certifications/', image: '/images/certifications/categories/green-elysee.jpg', caption: 'Environmental credentials' },
        { label: 'Reports', href: '/green-elysee/reports/', image: '/images/about/pipes-warehouse.jpg', caption: 'Annual sustainability reports' },
        { label: 'Insights', href: '/green-elysee/insights/', icon: 'sparkles', caption: 'Stories from the green programme' },
      ],
    },
  ],
  // Column 2
  [
    {
      title: 'Innovation',
      href: '/innovation/why-innovation/',
      items: [
        { label: 'Why Innovation', href: '/innovation/why-innovation/', image: '/images/about/engineers-meeting.jpg', caption: 'The case for R&D investment' },
        { label: 'Research & Development', href: '/innovation/research-development/', image: '/images/about/qa-lab.jpg', caption: 'Materials & process labs' },
        { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/', icon: 'chart', caption: 'EU & national grant programmes' },
        { label: 'Innovation Insights', href: '/innovation/insights/', icon: 'lightbulb', caption: 'Papers, talks, breakthroughs' },
        { label: 'Network Partners', href: '/innovation/network-partners/', image: '/images/about/pipes-warehouse.jpg', caption: 'Universities & consortia' },
        { label: 'Innovate with Us', href: '/innovation/innovate-with-us/', icon: 'handshake', caption: 'Collaboration enquiries' },
      ],
    },
    {
      title: 'Products',
      href: '/products/',
      variant: 'pill-tabs',
      items: [
        { label: 'Categories', href: '/products/', image: '/images/products/epsilon-hero.svg', caption: 'Browse the full catalogue' },
        { label: 'Catalogues & Leaflets', href: '/products/catalogues/', image: '/images/products/coupling-transition.svg', caption: 'Downloadable PDFs' },
        { label: 'BIM Designs', href: 'https://elysee.partcommunity.com/', image: '/images/products/saddle-clamp.svg', caption: 'CAD/BIM library' },
      ],
    },
  ],
  // Column 3
  [
    {
      title: 'Insights',
      href: '/insights/news/',
      items: [
        { label: 'News', href: '/insights/news/', icon: 'newspaper', caption: 'Press releases & updates' },
        { label: 'Blog', href: '/insights/blog/', icon: 'pencil', caption: 'Technical articles & opinion' },
        { label: 'Exhibitions', href: '/insights/exhibitions/', icon: 'marquee', caption: 'Where to meet us' },
        { label: 'Media', href: '/insights/media/', icon: 'play', caption: 'Videos & galleries' },
        { label: 'eBooks', href: '/insights/ebooks/', icon: 'book', caption: 'Long-form guides' },
      ],
    },
    {
      title: 'Contact Us',
      href: '/contact/local/',
      items: [
        { label: 'Local Network', href: '/contact/local/', icon: 'pin', caption: 'Cyprus offices & dealers' },
        { label: 'Worldwide Network', href: '/contact/worldwide/', icon: 'globe', caption: 'Export representatives' },
        { label: 'Elysée WISE', href: '/contact/wise/', icon: 'dot', caption: 'Smart-water solutions' },
        { label: 'Elysée PRIME', href: '/contact/prime/', icon: 'dot', caption: 'Premium product line' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/', icon: 'dot', caption: 'German subsidiary' },
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

/** Social icons — matches elysee.com.cy connect row (Facebook · X · LinkedIn · YouTube). */
export const social: { label: string; href: string; icon: string }[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/elysee.cy/',
    icon: '<path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.51h-2l-.396 3.98h2.396v8.01z"/>',
  },
  {
    label: 'X',
    href: 'https://x.com/elysee_cy',
    icon: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/>',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/11204464/admin/',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@elyseegroup',
    icon: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
  },
];

/** Company contact details — mirrored from elysee.com.cy footer. */
export const companyContact = {
  tagline: 'Streaming Water. Streaming Life.',
  address: {
    line1: '5, Pentadaktylou street',
    line2: '2643 Ergates Industrial Zone',
    city: 'Nicosia, Cyprus',
  },
  phone: '+357-22-455000',
  fax: '+357-22-455055',
  email: 'info@elysee.com.cy',
};
