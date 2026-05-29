import { describe, test, expect } from 'vitest';
import { primaryNav, megaNav, footerNav } from './navigation';
import { contactSiblings } from './content';

describe('Careers entry in Contact Us surfaces', () => {
  const CAREERS_HREF = '/contact/careers/';

  test('primaryNav Contact Us children include Careers', () => {
    const contact = primaryNav.find((n) => n.label === 'Contact Us');
    expect(contact?.children?.some((c) => c.href === CAREERS_HREF)).toBe(true);
  });

  test('megaNav Contact Us group includes Careers with an image and caption', () => {
    const groups = megaNav.flat();
    const contact = groups.find((g) => g.title === 'Contact Us');
    const careers = contact?.items.find((i) => i.href === CAREERS_HREF);
    expect(careers).toBeDefined();
    expect(careers?.image).toBeTruthy();
    expect(careers?.caption).toBeTruthy();
  });

  test('footerNav Contact us column includes Careers', () => {
    const contact = footerNav.find((c) => c.title === 'Contact us');
    expect(contact?.items.some((i) => i.href === CAREERS_HREF)).toBe(true);
  });

  test('contactSiblings includes Careers (so the sub-nav renders the tab)', () => {
    expect(contactSiblings.some((s) => s.href === CAREERS_HREF)).toBe(true);
  });
});
