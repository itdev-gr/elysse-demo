import type { CountryCode } from '../../data/catalog-countries';
export type { CountryCode as Country } from '../../data/catalog-countries';

export type Sector = 'agriculture' | 'landscape' | 'building' | 'industry';

export type CategorySlug =
  | 'compression-fittings' | 'hydraulic-fittings' | 'saddles'
  | 'light-weight-fittings' | 'valves' | 'filters-and-dosers'
  | 'micro-irrigation-and-sprinklers' | 'turf' | 'polyethylene-pipes'
  | 'pvc-pressure-pipes-and-fittings' | 'network-drainage'
  | 'cable-applications' | 'building-sewerage';

export const CATEGORY_SLUGS: ReadonlyArray<CategorySlug> = [
  'compression-fittings', 'hydraulic-fittings', 'saddles',
  'light-weight-fittings', 'valves', 'filters-and-dosers',
  'micro-irrigation-and-sprinklers', 'turf', 'polyethylene-pipes',
  'pvc-pressure-pipes-and-fittings', 'network-drainage',
  'cable-applications', 'building-sewerage',
] as const;

export interface CatalogProduct {
  slug: string;
  name: string;
  /** Name by language (incl. `en`), for the storefront language swap. Falls back to `name`. */
  nameI18n?: Record<string, string>;
  code?: string;
  categorySlug: CategorySlug;
  /** When set, the detail link points at THIS category instead of
   *  `categorySlug`. Used by cross-listed cards: they sit on the extra
   *  category's page (categorySlug = that page, so the client-side category
   *  filter keeps them) but link to their canonical home page. */
  detailCategorySlug?: CategorySlug;
  sectors: Sector[];
  material?: string;
  dnRange?: [number, number];
  pnRating?: number;
  standards: string[];
  imageUrls: string[];
  image: string;
  blurb: string;
  pressure: string;
  sizeRange: string;
  bim: boolean;
  datasheet?: string;
  installation?: string;
  specs: { key: string; value: string }[];
  featured: boolean;
  availableCountries: CountryCode[];
  /** True when a per-product detail page exists (markdown products). DB-sourced products omit this. */
  hasDetailPage?: boolean;
}

export interface Filters {
  search: string;
  sectors: Sector[];
  materials: string[];
  standards: string[];
  dn?: [number, number];
  pn?: [number, number];
  hasDatasheet: boolean;
  bimAvailable: boolean;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  sectors: [],
  materials: [],
  standards: [],
  hasDatasheet: false,
  bimAvailable: false,
};

export type SortKey = 'relevance' | 'name-asc' | 'pressure-desc' | 'newest';

export interface BasketItem {
  slug: string;
  code?: string;
  name: string;
  thumb: string;
  qty: number;
}
