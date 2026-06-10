/**
 * Quality certificate categories + the certificates inside each one.
 *
 * Source of truth at runtime is the `certifications` table
 * (cert_group='quality', category=<slug>), managed in the admin dashboard.
 * This file provides:
 *   - the fixed category taxonomy (slugs, titles, blurbs) used to build the
 *     /about-us/quality-certifications/<category>/ pages, and
 *   - the seed/fallback list mirrored from elysee.com.cy, used when Supabase
 *     is unreachable.
 */

export interface QualityCategory {
  slug: string;
  title: string;
  blurb: string;
}

export const QUALITY_CATEGORIES: QualityCategory[] = [
  {
    slug: 'management-system',
    title: 'Management System',
    blurb: 'Quality, environmental, energy, and health & safety management system certificates.',
  },
  {
    slug: 'general',
    title: 'General',
    blurb: 'Miscellaneous certificates and recognitions held by Elysée.',
  },
  {
    slug: 'compression-fittings',
    title: 'Compression Fittings',
    blurb: 'Product certificates covering the full Elysée compression-fitting range.',
  },
  {
    slug: 'pe-pipes',
    title: 'PE Pipes',
    blurb: 'Polyethylene pipe certificates across the manufactured diameter range.',
  },
  {
    slug: 'pvc-pipes',
    title: 'PVC Pipes',
    blurb: 'PVC pipe certificates for water-supply, drainage and infrastructure applications.',
  },
];

export interface QualityCertificateSeed {
  name: string;
  description: string | null;
  pdf_url: string;
}

/** Mirrored from the live elysee.com.cy category pages. */
export const QUALITY_CERTIFICATE_SEED: Record<string, QualityCertificateSeed[]> = {
  'management-system': [
    { name: 'CYS EN ISO 9001:2015', description: 'Quality management system', pdf_url: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-90012015-eng-kBb3u.pdf' },
    { name: 'CYS EN ISO 14001', description: 'Environmental management system', pdf_url: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng.pdf' },
    { name: 'ISO 45001', description: 'Occupational health & safety management', pdf_url: 'https://elysee.com.cy/uploads/originals/249/iso-45001-eng.pdf' },
    { name: 'Integrated Management System Policy', description: 'Company policy covering quality, environmental, and safety management', pdf_url: 'https://elysee.com.cy/uploads/originals/249/integrated-management-system-policy.pdf' },
    { name: 'EMAS 2024', description: 'EU Eco-Management and Audit Scheme (Regulation 1221/2009)', pdf_url: 'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469-mQoSw.pdf' },
    { name: 'Environmental Declaration 2024', description: 'Annual environmental performance statement', pdf_url: 'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-5xnre.pdf' },
    { name: 'CYS EN ISO 50001:2018', description: 'Energy management system', pdf_url: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473-45GgF.pdf' },
  ],
  general: [
    { name: 'ANAD Productivity Improvement', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/1/anad-productivity-improvment.pdf' },
    { name: 'Green Dot Elysée', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/green-dot-elysee.pdf' },
  ],
  'compression-fittings': [
    { name: 'KIWA Certificate PP Clamp Fittings', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/kiwa-elysee-102044-02.pdf' },
    { name: 'Czech Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/czech-itc-certificate-eng.pdf' },
    { name: 'WRAS Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/elysee-wras-certificate-final.pdf' },
    { name: 'SAI Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/certificate-smk26038-20230712.pdf' },
    { name: 'OFI Certificate EN 12201-3', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/elysee-en12201-3-until-2026.pdf' },
    { name: 'OVGW Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/ovgw-certificate-3H0eU.pdf' },
    { name: 'DVGW Elysée', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/dvgw-elysee-WMF8U.pdf' },
    { name: 'OFI Certificate ISO 17885', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/elysee-iso17885.pdf' },
    { name: 'SVGW Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/svgw-zert-1810-6790-certificate-24-e.pdf' },
    { name: 'Elysée Zero Force', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/dvgw-zero-force-20mm-upto-110mm-exp-2029.pdf' },
    { name: 'DVGW Elysée Push Fit', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/dvgw-push-fit-certificate-2025-d5Vqe.pdf' },
    { name: 'BDS ISO 17885:2022', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/bulgarkontrola-until-3-8-2026-eng.pdf' },
    { name: 'SII Elysée Rohrsysteme Zero Force', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/sii-elysee-roahrsystem-certificate-2026-pn10-pn16-zf-b8p4z.pdf' },
    { name: 'WRAS Elysée Epsilon Series', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/wras-certificate-elysee-e-series-2207346-until-2027.pdf' },
    { name: 'Poland ITB', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/poland.pdf' },
    { name: 'Poland PZH Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/pzh-certificate-until-111026.pdf' },
    { name: 'SAI WaterMark Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/watermark-certno-wmk260385-eyCcC.pdf' },
    { name: 'Elysée AgriFlow', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/nsai-1613-uppercross-enterprises-limited-certificate-2025.pdf' },
    { name: 'ÖA Registration Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/a-zertifikat-elysee-rohrsysteme.pdf' },
    { name: 'Slovakia Certificate', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/slovakia-vusapl-certificate-2026-1.pdf' },
  ],
  'pe-pipes': [
    { name: 'EN 12201-2', description: 'HDPE pipes according to EN 12201', pdf_url: 'https://elysee.com.cy/uploads/originals/249/en-12201-2-7-ofi-2025.pdf' },
    { name: 'AENOR Certificate ISO 15875', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/ce001marcan007535-in-2025-07-16.pdf' },
    { name: 'WRAS Certificate Stop Valves', description: null, pdf_url: 'https://elysee.com.cy/uploads/originals/249/wras-stop-valves-certificate-all.pdf' },
    { name: 'CYS 106', description: 'LDPE pipes according to CYS 106', pdf_url: 'https://elysee.com.cy/uploads/originals/249/cys-106.pdf' },
  ],
  'pvc-pipes': [
    { name: 'EN 1401', description: 'Underground drainage and sewage', pdf_url: 'https://elysee.com.cy/uploads/originals/249/en-1401-24112027.pdf' },
    { name: 'EN 1329', description: 'Soil and waste discharge', pdf_url: 'https://elysee.com.cy/uploads/originals/249/en-1329-1-elysee-until-06072028.pdf' },
    { name: 'EN ISO 1452', description: 'Pressure water supply, sewage and drainage', pdf_url: 'https://elysee.com.cy/uploads/originals/249/en-iso-1452-certificate.pdf' },
    { name: 'EN 61386', description: 'Conduit pipes', pdf_url: 'https://elysee.com.cy/uploads/originals/249/en-61386-cert-until-19-11-2030-cqk6w.pdf' },
  ],
};
