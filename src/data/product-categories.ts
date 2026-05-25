export interface ProductCategory {
  name: string;
  slug: string;
  /** Optional PDF catalogue download URL. Leave undefined when not available. */
  pdf?: string;
}

/** 13 product categories from elysee.com.cy/products-catalogue-en (May 2026). */
export const productCategories: ProductCategory[] = [
  { name: 'Compression Fittings', slug: 'compression-fittings' },
  { name: 'Hydraulic Fittings', slug: 'hydraulic-fittings' },
  { name: 'Saddles', slug: 'saddles' },
  { name: 'Light-Weight Fittings', slug: 'light-weight-fittings' },
  { name: 'Valves', slug: 'valves' },
  { name: 'Filters & Dosers', slug: 'filters-dosers' },
  { name: 'Micro Irrigation & Sprinklers', slug: 'micro-irrigation-sprinklers' },
  { name: 'Turf', slug: 'turf' },
  { name: 'Polyethylene Pipes', slug: 'polyethylene-pipes' },
  { name: 'PVC Pressure Pipes & Fittings', slug: 'pvc-pressure-pipes-fittings' },
  { name: 'Network Drainage', slug: 'network-drainage' },
  { name: 'Cable Applications', slug: 'cable-applications' },
  { name: 'Building Sewerage', slug: 'building-sewerage' },
];
