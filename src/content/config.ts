import { defineCollection, z } from 'astro:content';
import { COUNTRIES } from '../data/catalog-countries';

/** Country codes accepted in product frontmatter — derived from the single
 *  source of truth (catalog-countries.ts) so the two lists can never drift. */
const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];

const CATEGORY_SLUGS = [
  'compression-fittings', 'hydraulic-fittings', 'saddles',
  'light-weight-fittings', 'valves', 'filters-and-dosers',
  'micro-irrigation-and-sprinklers', 'turf', 'polyethylene-pipes',
  'pvc-pressure-pipes-and-fittings', 'network-drainage',
  'cable-applications', 'building-sewerage',
] as const;

const products = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    categorySlug: z.enum(CATEGORY_SLUGS),
    blurb: z.string(),
    pressure: z.string(),
    sizeRange: z.string(),
    featured: z.boolean().default(false),
    image: z.string(),
    specs: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
    bim: z.boolean().default(false),
    datasheet: z.string().optional(),
    code: z.string().optional(),
    sectors: z.array(z.enum(['agriculture', 'landscape', 'building', 'industry'])).default([]),
    material: z.string().optional(),
    dnRange: z.tuple([z.number(), z.number()]).optional(),
    pnRating: z.number().optional(),
    standards: z.array(z.string()).default([]),
    imageUrls: z.array(z.string()).default([]),
    installation: z.string().optional(),
    availableCountries: z.array(z.enum(COUNTRY_CODES)).nonempty(),
  }),
});

export const collections = { products };
