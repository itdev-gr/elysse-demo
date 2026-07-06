import type { ContentBlock, ContentPage } from '../data/site-content';
import {
  aboutUsCorporateProfile, aboutUsHistory, aboutUsVisionMissionValues,
  aboutUsCompanyStructure, aboutUsQualityCertifications,
  greenElyseeAbout, greenElyseeCertifications, greenElyseeReports,
  innovationWhy, innovationRD, innovationFundedProjects,
  innovationNetworkPartners, innovationInnovateWithUs,
  innovationInsightDetails, fundedProjectDetails,
  subBrandWise, subBrandPrime, subBrandRohrsysteme, contactCareers,
} from '../data/site-content';
import type { Section, PageContent } from '../data/content';
import {
  agriculturePage, landscapePage, buildingInfrastructurePage, industryPage,
  privacyPolicyPage, termsOfUsagePage, termsOfSupplyPage,
} from '../data/content';
import { EL } from '../data/i18n/el';

/**
 * Build-time index of the static pages (routes whose copy lives in the two
 * content registries rather than Supabase). Emitted as /search-index.json by
 * src/pages/search-index.json.ts and searched client-side by src/lib/search.ts.
 * Greek haystacks come from the EL dictionary, which is keyed by the English
 * string — chunks without a translation simply don't contribute to textEl.
 */
export interface PageIndexEntry {
  /** Site-relative route with leading + trailing slash. */
  path: string;
  title: string;
  titleEl?: string;
  /** Parent section shown as the result subtitle (English; tFor'd at render). */
  section: string;
  /** English haystack — newline-joined readable text chunks. */
  text: string;
  /** Greek haystack from EL-translated chunks (absent when none translate). */
  textEl?: string;
}

/** Readable text chunks (EN) on a site-content ContentBlock. */
export function blockText(b: ContentBlock): string[] {
  switch (b.kind) {
    case 'heading': return [b.text];
    case 'paragraph': return [b.text];
    case 'list': return b.items;
    case 'callout': return [b.title ?? '', b.body];
    case 'stats': return b.items.flatMap((i) => [i.label, i.value]);
    case 'timeline': return b.items.flatMap((i) => [i.title ?? '', i.body]);
    case 'pillars': return [b.intro ?? '', ...b.items.flatMap((i) => [i.title, i.body])];
    case 'valuelist': return b.items.flatMap((i) => [i.label, i.body ?? '']);
    case 'image': return [b.caption ?? ''];
    case 'imagegrid': return [b.intro ?? '', ...b.items.flatMap((i) => [i.title, i.body ?? '', ...(i.bullets ?? [])])];
    case 'process-icons': return b.items.map((i) => i.title);
    case 'partners': return b.items.map((i) => i.name);
    case 'projects': return [b.heading ?? '', ...b.items.flatMap((i) => [i.name, i.description ?? ''])];
    case 'idea-form': return [b.intro ?? '', b.confidentialityTitle ?? '', b.confidentialityBody ?? ''];
    default: return [];
  }
}

/** Readable text chunks (EN) on a legacy content.ts Section. */
export function sectionText(s: Section): string[] {
  switch (s.kind) {
    case 'text': return [s.eyebrow ?? '', s.heading ?? '', s.body];
    case 'feature-grid': return [s.heading ?? '', ...s.items.flatMap((i) => [i.title, i.body ?? ''])];
    case 'list': return [s.heading ?? '', s.intro ?? '', ...s.items];
    case 'offices': return [s.heading ?? '', ...s.offices.flatMap((o) => [o.city, o.region ?? ''])];
    case 'news-list': return [s.heading ?? ''];
    default: return [];
  }
}

function entry(path: string, title: string, section: string, chunks: string[]): PageIndexEntry {
  const clean = chunks.map((c) => c.trim()).filter(Boolean);
  const el = clean.map((c) => EL[c]).filter((t): t is string => Boolean(t && t.trim()));
  const titleEl = EL[title];
  return {
    path,
    title,
    ...(titleEl && titleEl.trim() ? { titleEl } : {}),
    section,
    text: clean.join('\n'),
    ...(el.length ? { textEl: el.join('\n') } : {}),
  };
}

const CONTENT_PAGES: { path: string; section: string; page: ContentPage }[] = [
  { path: '/about-us/', section: 'About Us', page: aboutUsCorporateProfile },
  { path: '/about-us/history/', section: 'About Us', page: aboutUsHistory },
  { path: '/about-us/vision-mission-values/', section: 'About Us', page: aboutUsVisionMissionValues },
  { path: '/about-us/company-structure/', section: 'About Us', page: aboutUsCompanyStructure },
  { path: '/about-us/quality-certifications/', section: 'About Us', page: aboutUsQualityCertifications },
  { path: '/green-elysee/', section: 'Green Elysée', page: greenElyseeAbout },
  { path: '/green-elysee/certifications/', section: 'Green Elysée', page: greenElyseeCertifications },
  { path: '/green-elysee/reports/', section: 'Green Elysée', page: greenElyseeReports },
  { path: '/innovation/why-innovation/', section: 'Innovation', page: innovationWhy },
  { path: '/innovation/research-development/', section: 'Innovation', page: innovationRD },
  { path: '/innovation/funded-research-projects/', section: 'Innovation', page: innovationFundedProjects },
  { path: '/innovation/network-partners/', section: 'Innovation', page: innovationNetworkPartners },
  { path: '/innovation/innovate-with-us/', section: 'Innovation', page: innovationInnovateWithUs },
  { path: '/contact/wise/', section: 'Contact', page: subBrandWise },
  { path: '/contact/prime/', section: 'Contact', page: subBrandPrime },
  { path: '/contact/rohrsysteme/', section: 'Contact', page: subBrandRohrsysteme },
  { path: '/contact/careers/', section: 'Contact', page: contactCareers },
];

const LEGACY_PAGES: { section: string; page: PageContent }[] = [
  { section: 'Our Services', page: agriculturePage },
  { section: 'Our Services', page: landscapePage },
  { section: 'Our Services', page: buildingInfrastructurePage },
  { section: 'Our Services', page: industryPage },
  { section: 'Legal', page: privacyPolicyPage },
  { section: 'Legal', page: termsOfUsagePage },
  { section: 'Legal', page: termsOfSupplyPage },
];

/** Listing/dynamic pages with no structured copy — title + keyword haystack. */
const MANUAL_PAGES: { path: string; title: string; section: string; keywords: string }[] = [
  { path: '/', title: 'Home', section: 'Elysée', keywords: 'Elysée piping irrigation systems Cyprus' },
  { path: '/products/', title: 'Products', section: 'Products', keywords: 'product categories catalog browse' },
  { path: '/products/catalogues/', title: 'Catalogues & Leaflets', section: 'Products', keywords: 'download product catalogues leaflets PDF' },
  { path: '/insights/news/', title: 'News', section: 'Insights', keywords: 'company news press announcements' },
  { path: '/insights/blog/', title: 'Blog', section: 'Insights', keywords: 'blog articles engineering piping' },
  { path: '/insights/exhibitions/', title: 'Exhibitions', section: 'Insights', keywords: 'trade fairs exhibitions events' },
  { path: '/insights/media/', title: 'Media', section: 'Insights', keywords: 'videos media gallery' },
  { path: '/insights/ebooks/', title: 'eBooks', section: 'Insights', keywords: 'ebooks guides downloads' },
  { path: '/green-elysee/insights/', title: 'Green Insights', section: 'Green Elysée', keywords: 'sustainability environment insights' },
  { path: '/innovation/insights/', title: 'Innovation Insights', section: 'Innovation', keywords: 'innovation news success stories activities' },
  { path: '/contact/local/', title: 'Local Network', section: 'Contact', keywords: 'contact shops Cyprus Strovolos Limassol Paphos' },
  { path: '/contact/worldwide/', title: 'Worldwide Network', section: 'Contact', keywords: 'export distributors worldwide countries' },
  { path: '/about-us/quality-certifications/compression-fittings/', title: 'Compression Fittings Certificates', section: 'Quality & Certifications', keywords: 'compression fittings quality certificates standards' },
  { path: '/about-us/quality-certifications/pe-pipes/', title: 'PE Pipes Certificates', section: 'Quality & Certifications', keywords: 'polyethylene PE pipes quality certificates standards' },
  { path: '/about-us/quality-certifications/pvc-pipes/', title: 'PVC Pipes Certificates', section: 'Quality & Certifications', keywords: 'PVC pipes quality certificates standards' },
  { path: '/about-us/quality-certifications/management-system/', title: 'Management System Certificates', section: 'Quality & Certifications', keywords: 'ISO management system certificates EMAS ISCC' },
  { path: '/about-us/quality-certifications/general/', title: 'General Certificates', section: 'Quality & Certifications', keywords: 'general quality certificates awards' },
];

export function buildPagesIndex(): PageIndexEntry[] {
  const out: PageIndexEntry[] = [];
  for (const { path, section, page } of CONTENT_PAGES) {
    out.push(entry(path, page.title, section, [
      page.eyebrow ?? '', page.subtitle ?? '', page.metaDescription ?? '',
      ...page.blocks.flatMap(blockText),
    ]));
  }
  for (const { section, page } of LEGACY_PAGES) {
    out.push(entry(page.slug, page.meta.title.split('—')[0].trim(), section, [
      page.meta.description, page.hero?.headline ?? '', page.hero?.sub ?? '',
      ...page.sections.flatMap(sectionText),
    ]));
  }
  for (const a of innovationInsightDetails) {
    out.push(entry(`/innovation/insights/${a.slug}/`, a.title, 'Innovation Insights',
      [a.excerpt, ...a.blocks.flatMap(blockText)]));
  }
  for (const p of fundedProjectDetails) {
    out.push(entry(`/innovation/funded-research-projects/${p.slug}/`, p.name, 'Funded Research Projects',
      [p.excerpt, ...p.blocks.flatMap(blockText)]));
  }
  for (const m of MANUAL_PAGES) out.push(entry(m.path, m.title, m.section, [m.title, m.keywords]));
  return out;
}
