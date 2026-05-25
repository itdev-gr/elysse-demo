import { defineCollection, z } from 'astro:content';

/** ISO 3166-1 alpha-2 codes for countries we operate in. Kept in sync with
 *  src/data/catalog-countries.ts. The enum is duplicated here because Zod
 *  needs literal strings at schema-definition time. */
const COUNTRY_CODES = [
  'cy','gr','de','at','fr','it','es','pt',
  'lb','ae','sa','eg','il','jo','ma','za',
  'jp','au','nz','in','sg',
  'us','ca','br','mx',
] as const;

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

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    order: z.number().int().nonnegative(),
    image: z.string(),
    sourceImage: z.string().url().optional(),
    leafletPdf: z.string().optional(),
    blurb: z.string(),
  }),
});

export const collections = { products, categories };
