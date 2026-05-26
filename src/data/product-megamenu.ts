import { productCategories, type ProductCategory } from './product-categories';

export type ProductPillId =
  | 'pipes'
  | 'fittings'
  | 'valves-control'
  | 'irrigation'
  | 'drainage-cable';

export interface ProductPillTab {
  id: ProductPillId;
  label: string;
  icon: 'pipe' | 'fitting' | 'valve' | 'sprinkler' | 'drain';
  imageSrc: string;
  imageAlt: string;
  leafSlugs: string[];
}

/**
 * Grouping of the 13 `productCategories` slugs into 5 pill tabs.
 * Order here is the order shown in the mega-menu (top to bottom).
 */
export const productPillTabs: ProductPillTab[] = [
  {
    id: 'pipes',
    label: 'Pipes',
    icon: 'pipe',
    imageSrc: '/images/products/megamenu/pipes.jpg',
    imageAlt: 'Coils of polyethylene pipe in the Elysée warehouse',
    leafSlugs: ['polyethylene-pipes', 'pvc-pressure-pipes-fittings'],
  },
  {
    id: 'fittings',
    label: 'Fittings',
    icon: 'fitting',
    imageSrc: '/images/products/megamenu/fittings.jpg',
    imageAlt: 'Assortment of Elysée compression and hydraulic fittings',
    leafSlugs: [
      'compression-fittings',
      'hydraulic-fittings',
      'saddles',
      'light-weight-fittings',
    ],
  },
  {
    id: 'valves-control',
    label: 'Valves & Control',
    icon: 'valve',
    imageSrc: '/images/products/megamenu/valves-control.jpg',
    imageAlt: 'Brass and polymer valves on an Elysée test rig',
    leafSlugs: ['valves', 'filters-dosers'],
  },
  {
    id: 'irrigation',
    label: 'Irrigation',
    icon: 'sprinkler',
    imageSrc: '/images/products/megamenu/irrigation.jpg',
    imageAlt: 'Field installation of micro-irrigation tubing',
    leafSlugs: ['micro-irrigation-sprinklers', 'turf'],
  },
  {
    id: 'drainage-cable',
    label: 'Drainage & Cable',
    icon: 'drain',
    imageSrc: '/images/products/megamenu/drainage-cable.jpg',
    imageAlt: 'Stacks of corrugated drainage and cable conduit pipe',
    leafSlugs: ['network-drainage', 'cable-applications', 'building-sewerage'],
  },
];

const slugToCategory = new Map<string, ProductCategory>(
  productCategories.map((c) => [c.slug, c]),
);

export function getLeavesForTab(id: ProductPillId): ProductCategory[] {
  const tab = productPillTabs.find((t) => t.id === id);
  if (!tab) return [];
  const out: ProductCategory[] = [];
  for (const slug of tab.leafSlugs) {
    const cat = slugToCategory.get(slug);
    if (cat) out.push(cat);
  }
  return out;
}

export function resolveDefaultTab(pathname: string): ProductPillId {
  const match = pathname.match(/\/catalog\/([^/]+)\/?/);
  const slug = match?.[1];
  if (slug) {
    const hit = productPillTabs.find((t) => t.leafSlugs.includes(slug));
    if (hit) return hit.id;
  }
  return 'pipes';
}
