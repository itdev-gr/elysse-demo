/**
 * Catalogue fallback data, mirrored from elysee.com.cy/catalogues-leaflets-en.
 *
 * Source of truth at runtime is the `catalogues` table, managed in the admin
 * dashboard (categories + subcategories, each with an optional PDF). This
 * list is only used when Supabase is unreachable.
 */

export interface CatalogueSeed {
  name: string;
  description: string | null;
  pdf_url: string | null;
  children: CatalogueSeed[];
}

export const CATALOGUE_SEED: CatalogueSeed[] = [
  { name: 'A — Compression Fittings', description: 'Technical catalogue for the Compression Fittings range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-a-njVxM.pdf', children: [] },
  { name: 'B — Hydraulic Fittings', description: 'Technical catalogue for the Hydraulic Fittings range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-b-CFBt4.pdf', children: [] },
  { name: 'C — Saddles', description: 'Technical catalogue for the Saddles range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-c-zFYDM.pdf', children: [] },
  { name: 'D — Light-Weight Fittings', description: 'Technical manual for landscape and irrigation systems.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/for-internettechnical-manual-landscape-and-irrigation-system-nov-2026.pdf', children: [] },
  { name: 'E — Valves', description: 'Technical catalogue for the Valves range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-e-UBjyk.pdf', children: [] },
  { name: 'F — Filters & Dosers', description: 'Technical catalogue for Filters and Dosers.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-f-oCOnw.pdf', children: [] },
  { name: 'G — Micro Irrigation & Sprinklers', description: 'Technical catalogue covering micro-irrigation and sprinkler products.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-g-dNhfy.pdf', children: [] },
  { name: 'H — Turf', description: 'Technical catalogue for the Turf irrigation range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-h-3in3L.pdf', children: [] },
  { name: 'I — Polyethylene Pipes & Soft Hoses', description: 'Technical catalogue for polyethylene pipes and soft hoses.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/section-i-MGImH.pdf', children: [] },
  { name: 'PE — Polyethylene Pipes', description: 'Technical manual for the full polyethylene pipe range.', pdf_url: 'https://elysee.com.cy/uploads/originals/249/technical-manual-pe-pipes-MCeVe.pdf', children: [] },
];
