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

export const footerNav: { title: string; items: NavItem[] }[] = []; // Task 21 will populate
export const social: { label: string; href: string; icon: string }[] = []; // Task 21
