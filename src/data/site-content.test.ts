import { describe, expect, it } from 'vitest';
import {
  greenCertificationItems,
  greenReportItems,
  greenEbookItems,
  greenElyseeInsightsItems,
  greenElyseeCertifications,
  greenElyseeReports,
} from './site-content';

describe('Green Elysée data exports', () => {
  it('has 6 certifications, each with a PDF href on elysee.com.cy', () => {
    expect(greenCertificationItems).toHaveLength(6);
    for (const c of greenCertificationItems) {
      expect(c.href).toMatch(/^https:\/\/elysee\.com\.cy\/.*\.pdf$/);
      expect(c.logo).toMatch(/^\/images\/certifications\/.*\.svg$/);
      expect(c.scope?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it('contains the Environmental Report 2024 and its PDF download URL', () => {
    expect(greenReportItems).toHaveLength(1);
    const rep = greenReportItems[0];
    expect(rep.title).toBe('Environmental Report 2024');
    expect(rep.year).toBe('2024');
    expect(rep.href).toBe('https://elysee.com.cy/pdf/503130/download');
    expect(rep.cover).toBe('/images/green-elysee/environmental-report-2024-cover.png');
  });

  it('contains the 2021 Yearly Report ebook with 7 contents bullets', () => {
    expect(greenEbookItems).toHaveLength(1);
    const e = greenEbookItems[0];
    expect(e.title).toBe('Green Elysée: Yearly Report 2021');
    expect(e.contents).toHaveLength(7);
    expect(e.cover).toBe('/images/green-elysee/yearly-report-2021-cover.jpg');
  });

  it('has the journey-to-green-leader insight with hero image', () => {
    expect(greenElyseeInsightsItems).toHaveLength(1);
    expect(greenElyseeInsightsItems[0].image).toBe(
      '/images/green-elysee/journey-to-green-leader.jpg',
    );
  });

  it('keeps the original Certifications + Reports ContentPage titles', () => {
    expect(greenElyseeCertifications.title).toBe('Certifications');
    expect(greenElyseeReports.title).toBe('Reports & eBooks');
  });
});
