import { describe, expect, it } from 'vitest';
import {
  sortCertifications,
  nextSortOrder,
  validateCertificationFile,
} from './certifications';
import type { Certification } from '../types/certification';

const cert = (over: Partial<Certification>): Certification => ({
  id: 'x', cert_group: 'green', category: null, name: 'A', description: 'd',
  scope: null, tag: null, logo: null, pdf_url: null, sort_order: 0,
  is_active: true, created_at: '', updated_at: '', ...over,
});

describe('sortCertifications', () => {
  it('orders by sort_order, then name', () => {
    const out = sortCertifications([
      cert({ name: 'B', sort_order: 2 }),
      cert({ name: 'Z', sort_order: 1 }),
      cert({ name: 'A', sort_order: 2 }),
    ]);
    expect(out.map((c) => c.name)).toEqual(['Z', 'A', 'B']);
  });

  it('does not mutate the input array', () => {
    const input = [cert({ sort_order: 2 }), cert({ sort_order: 1 })];
    sortCertifications(input);
    expect(input[0].sort_order).toBe(2);
  });
});

describe('nextSortOrder', () => {
  it('returns 1 for an empty list', () => {
    expect(nextSortOrder([])).toBe(1);
  });

  it('returns max + 1', () => {
    expect(nextSortOrder([cert({ sort_order: 4 }), cert({ sort_order: 9 })])).toBe(10);
  });
});

describe('validateCertificationFile', () => {
  it('accepts a small PDF as pdf', () => {
    expect(validateCertificationFile({ type: 'application/pdf', size: 1024 }, 'pdf')).toBeNull();
  });

  it('rejects a non-PDF as pdf', () => {
    expect(validateCertificationFile({ type: 'image/png', size: 1024 }, 'pdf')).toMatch(/PDF/);
  });

  it('rejects a PDF over 10 MB', () => {
    expect(
      validateCertificationFile({ type: 'application/pdf', size: 11 * 1024 * 1024 }, 'pdf'),
    ).toMatch(/10 MB/);
  });

  it('accepts svg/png/jpeg/webp as badge', () => {
    for (const type of ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']) {
      expect(validateCertificationFile({ type, size: 1024 }, 'badge')).toBeNull();
    }
  });

  it('rejects a badge over 2 MB', () => {
    expect(
      validateCertificationFile({ type: 'image/png', size: 3 * 1024 * 1024 }, 'badge'),
    ).toMatch(/2 MB/);
  });

  it('rejects a pdf file as badge', () => {
    expect(validateCertificationFile({ type: 'application/pdf', size: 1024 }, 'badge')).toMatch(/image/i);
  });
});
