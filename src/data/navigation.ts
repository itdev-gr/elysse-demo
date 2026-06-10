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
      { label: 'Careers', href: '/contact/careers/' },
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
        { label: 'Insights', href: '/green-elysee/insights/', image: '/images/green-elysee/journey-to-green-leader.jpg', caption: 'Stories from the green programme' },
      ],
    },
  ],
  // Column 2
  [
    {
      title: 'Innovation',
      href: '/innovation/why-innovation/',
      items: [
        { label: 'Why Innovation', href: '/innovation/why-innovation/', image: '/images/innovation/why/innovation-in-business.png', caption: 'The case for R&D investment' },
        { label: 'Research & Development', href: '/innovation/research-development/', image: '/images/innovation/rd/product-design-and-development.jpg', caption: 'Materials & process labs' },
        { label: 'Funded Research Projects', href: '/innovation/funded-research-projects/', image: '/images/innovation/projects/innova.png', caption: 'EU & national grant programmes' },
        { label: 'Innovation Insights', href: '/innovation/insights/', image: '/images/innovation/insights/industry-40.png', caption: 'Papers, talks, breakthroughs' },
        { label: 'Network Partners', href: '/innovation/network-partners/', image: '/images/about/engineers-meeting.jpg', caption: 'Universities & consortia' },
        { label: 'Innovate with Us', href: '/innovation/innovate-with-us/', image: '/images/innovation/innovate/hero-illustration.png', caption: 'Collaboration enquiries' },
      ],
    },
    {
      title: 'Products',
      href: '/products/',
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
        { label: 'News', href: '/insights/news/', image: '/images/about/hq-aerial.jpg', caption: 'Press releases & updates' },
        { label: 'Blog', href: '/insights/blog/', image: '/images/about/engineers-meeting.jpg', caption: 'Technical articles & opinion' },
        { label: 'Exhibitions', href: '/insights/exhibitions/', image: '/images/about/facility-exterior.jpg', caption: 'Where to meet us' },
        { label: 'Media', href: '/insights/media/', image: '/images/about/water-flowing.jpg', caption: 'Videos & galleries' },
        { label: 'eBooks', href: '/insights/ebooks/', image: '/images/about/founder-vintage.jpg', caption: 'Long-form guides' },
      ],
    },
    {
      title: 'Contact Us',
      href: '/contact/local/',
      items: [
        { label: 'Local Network', href: '/contact/local/', image: '/images/about/facility-exterior.jpg', caption: 'Cyprus offices & dealers' },
        { label: 'Worldwide Network', href: '/contact/worldwide/', image: '/images/about/hq-aerial.jpg', caption: 'Export representatives' },
        { label: 'Elysée WISE', href: '/contact/wise/', image: '/images/about/water-flowing.jpg', caption: 'Smart-water solutions' },
        { label: 'Elysée PRIME', href: '/contact/prime/', image: '/images/about/pipes-warehouse.jpg', caption: 'Premium product line' },
        { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/', image: '/images/about/pipe-stack.jpg', caption: 'Austrian subsidiary' },
        { label: 'Careers', href: '/contact/careers/', image: '/images/about/engineers-meeting.jpg', caption: 'Join the group' },
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
      { label: 'Careers', href: '/contact/careers/' },
    ],
  },
];

/** Legal/utility links rendered in the bottom strip beside the copyright. */
export const footerLegal: NavItem[] = [
  { label: 'Terms of Use', href: '/legal/terms-of-use/' },
  { label: 'Terms of Supply', href: '/legal/terms-of-supply/' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy/' },
];

/** Social icons — official Elysée Irrigation profiles (Facebook · Instagram · LinkedIn · TikTok · YouTube). */
export const social: { label: string; href: string; icon: string }[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/elysee.cy/',
    icon: '<path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.51h-2l-.396 3.98h2.396v8.01z"/>',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/elysee.irrigation/',
    icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/elysee-irrigation-ltd/',
    icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@elysee.irrigation',
    icon: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@elyseeirrigation',
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
