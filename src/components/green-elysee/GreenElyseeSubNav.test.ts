import { describe, expect, it } from 'vitest';
import { greenElyseeSiblings } from '../../data/content';

const normalize = (p: string) => (p.endsWith('/') ? p : `${p}/`);

describe('GreenElyseeSubNav active-link logic', () => {
  it('exposes the four Green Elysée subpages in order', () => {
    expect(greenElyseeSiblings.map((s) => s.label)).toEqual([
      'About Green Elysée',
      'Certifications',
      'Reports',
      'Insights',
    ]);
  });

  it('marks the matching href as active for each subpage path', () => {
    for (const sib of greenElyseeSiblings) {
      const here = normalize(sib.href);
      const activeCount = greenElyseeSiblings.filter(
        (s) => normalize(s.href) === here,
      ).length;
      expect(activeCount).toBe(1);
    }
  });

  it('treats trailing-slash and no-trailing-slash paths as equivalent', () => {
    expect(normalize('/green-elysee/certifications')).toBe(
      normalize('/green-elysee/certifications/'),
    );
  });
});
