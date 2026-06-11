import { describe, test, expect } from 'vitest';
import { primaryNav, megaNav, footerNav } from './navigation';
import { aboutSiblings, contactSiblings } from './content';

describe('Careers entry in About Us surfaces', () => {
  const CAREERS_HREF = '/about-us/careers/';

  test('primaryNav About Us children include Careers', () => {
    const about = primaryNav.find((n) => n.label === 'About Us');
    expect(about?.children?.some((c) => c.href === CAREERS_HREF)).toBe(true);
  });

  test('megaNav About Us group includes Careers with an image and caption', () => {
    const groups = megaNav.flat();
    const about = groups.find((g) => g.title === 'About Us');
    const careers = about?.items.find((i) => i.href === CAREERS_HREF);
    expect(careers).toBeDefined();
    expect(careers?.image).toBeTruthy();
    expect(careers?.caption).toBeTruthy();
  });

  test('footerNav About us column includes Careers', () => {
    const about = footerNav.find((c) => c.title === 'About us');
    expect(about?.items.some((i) => i.href === CAREERS_HREF)).toBe(true);
  });

  test('aboutSiblings includes Careers (so the sub-nav renders the tab)', () => {
    expect(aboutSiblings.some((s) => s.href === CAREERS_HREF)).toBe(true);
  });

  test('no surface still links to the old /contact/careers/ URL', () => {
    const all = [
      ...primaryNav.flatMap((n) => [n, ...(n.children ?? [])]),
      ...megaNav.flat().flatMap((g) => g.items),
      ...footerNav.flatMap((c) => c.items),
      ...aboutSiblings,
      ...contactSiblings,
    ];
    expect(all.some((i) => i.href === '/contact/careers/')).toBe(false);
  });
});
