/**
 * Sub-categories per parent category slug, sourced from elysee.com.cy.
 * Keys match the slugs used in `src/content/categories/*.md` (and the
 * `CATEGORY_SLUGS` union in `src/content.config.ts`).
 *
 * Hrefs point to the live elysee.com.cy product pages. Update when local
 * sub-category routes become available.
 */
export type SubCategory = {
  name: string;
  href: string;
};

export const subCategoriesBySlug: Record<string, SubCategory[]> = {
  'compression-fittings': [
    { name: 'Epsilon Series (PN 16 bar)', href: 'https://elysee.com.cy/cat-e-epsilon-series-pn-16-bar-11001' },
    { name: 'Lambda Series (PN 10 bar)', href: 'https://elysee.com.cy/cat-l-lambda-series-pn-10-bar-11002' },
    { name: 'Zeta Series (PN 16 bar)', href: 'https://elysee.com.cy/cat-z-zeta-series-zero-force-pn-16-bar-11007' },
    { name: 'Omicron Series (PN 16 bar)', href: 'https://elysee.com.cy/cat-o-omicron-series-pn-16-bar-11004' },
    { name: 'Eta Series (PN 10 bar)', href: 'https://elysee.com.cy/cat-h-eta-series-pn-10-bar-11003' },
    { name: 'Zeeflex Series', href: 'https://elysee.com.cy/cat-zeeflex-series-11005' },
    { name: 'Special Fittings', href: 'https://elysee.com.cy/cat-special-fittings-11008' },
    { name: 'Spare Parts & Tools', href: 'https://elysee.com.cy/cat-spare-parts-tools-11010' },
  ],
  'hydraulic-fittings': [
    { name: 'Plastic Threaded Series', href: 'https://elysee.com.cy/cat-plastic-threaded-series-11101' },
    { name: 'Tank Outlets & Risers', href: 'https://elysee.com.cy/cat-tank-outlets-risers-11102' },
    { name: 'Lock Series', href: 'https://elysee.com.cy/cat-lock-series-11103' },
    { name: 'Galvanized Fittings', href: 'https://elysee.com.cy/cat-galvanized-fittings-11105' },
    { name: 'Brass Fittings', href: 'https://elysee.com.cy/cat-brass-fittings-11106' },
    { name: 'Spare Parts & Tools', href: 'https://elysee.com.cy/cat-spare-parts-tools-11107' },
  ],
  'saddles': [
    { name: 'Single', href: 'https://elysee.com.cy/cat-single-11201' },
    { name: 'Single Reinforced', href: 'https://elysee.com.cy/cat-single-reinforced-11204' },
    { name: 'Double', href: 'https://elysee.com.cy/cat-double-11202' },
    { name: 'Double Reinforced', href: 'https://elysee.com.cy/cat-double-reinforced-11205' },
    { name: 'Flat Seal', href: 'https://elysee.com.cy/cat-flat-seal-11206' },
    { name: 'Spare Parts & Tools', href: 'https://elysee.com.cy/cat-spare-parts-tools-11203' },
  ],
  'light-weight-fittings': [
    { name: 'Barbed Fittings', href: 'https://elysee.com.cy/cat-barbed-fittings-11301' },
    { name: 'Safety Fittings', href: 'https://elysee.com.cy/cat-safety-fittings-11302' },
    { name: 'Dripline Fittings', href: 'https://elysee.com.cy/cat-dripline-fittings-11303' },
    { name: 'Driptape Fittings', href: 'https://elysee.com.cy/cat-driptape-fittings-11304' },
    { name: 'Spare Parts & Tools', href: 'https://elysee.com.cy/cat-spare-parts-tools-11305' },
  ],
  'valves': [
    { name: 'PVC Ball Valves', href: 'https://elysee.com.cy/cat-pvc-ball-valves-11401' },
    { name: 'PP Ball Valves', href: 'https://elysee.com.cy/cat-pp-ball-valves-11402' },
    { name: 'Mini Valves', href: 'https://elysee.com.cy/cat-mini-valves-11403' },
    { name: 'Stop Tap & Quick Coupling Valve', href: 'https://elysee.com.cy/cat-stop-tap-quick-coupling-valve-11404' },
    { name: 'Brass Valves, Check Valves & More', href: 'https://elysee.com.cy/cat-brass-valves-check-valves-more-11405' },
    { name: 'Water Meters, Pressure Regulators & Air Valves', href: 'https://elysee.com.cy/cat-water-meters-pressure-regulators-air-valves-11406' },
    { name: 'Accessories', href: 'https://elysee.com.cy/cat-accessories-11407' },
  ],
  'filters-and-dosers': [
    { name: 'Plastic Screen Filters', href: 'https://elysee.com.cy/cat-plastic-screen-filters-11501' },
    { name: 'Plastic Disc Filters', href: 'https://elysee.com.cy/cat-plastic-disc-filters-11502' },
    { name: 'Metal Filters', href: 'https://elysee.com.cy/cat-metal-filters-11503' },
    { name: 'Venturi Injectors', href: 'https://elysee.com.cy/cat-venturi-injectors-11504' },
    { name: 'Spare Parts', href: 'https://elysee.com.cy/cat-spare-parts-11505' },
    { name: 'Water Tanks', href: 'https://elysee.com.cy/cat-water-tanks-11506' },
  ],
  'micro-irrigation-and-sprinklers': [
    { name: 'Standard Emitters', href: 'https://elysee.com.cy/cat-standard-emitters-11601' },
    { name: 'Pressure Compensated Emitters', href: 'https://elysee.com.cy/cat-pressure-compensated-emitters-11608' },
    { name: 'Bubblers & Sprayers', href: 'https://elysee.com.cy/cat-bubblers-sprayers-11602' },
    { name: 'Mini Sprinklers', href: 'https://elysee.com.cy/cat-mini-sprinklers-11603' },
    { name: 'Sprinklers', href: 'https://elysee.com.cy/cat-sprinklers-11604' },
    { name: 'Wedges & Ground Hooks', href: 'https://elysee.com.cy/cat-wedges-ground-hooks-11605' },
    { name: 'Micro Fittings', href: 'https://elysee.com.cy/cat-micro-fittings-11606' },
    { name: 'Tools', href: 'https://elysee.com.cy/cat-tools-11607' },
  ],
  'turf': [
    { name: 'Solenoid Valves & Valve Boxes', href: 'https://elysee.com.cy/cat-solenoid-valves-valve-boxes-11701' },
    { name: 'Manifolds & Swivel Fittings', href: 'https://elysee.com.cy/cat-manifolds-swivel-fittings-11702' },
    { name: 'Tap Timers & Controllers', href: 'https://elysee.com.cy/cat-tap-timers-controllers-11703' },
    { name: 'Pop Up & Nozzles', href: 'https://elysee.com.cy/cat-pop-up-nozzles-11704' },
    { name: 'Various Products', href: 'https://elysee.com.cy/cat-various-products-11705' },
  ],
  'polyethylene-pipes': [
    { name: 'PE Hoses', href: 'https://elysee.com.cy/cat-pe-hoses-11801' },
    { name: 'Driplines', href: 'https://elysee.com.cy/cat-driplines-11802' },
    { name: 'Driptapes', href: 'https://elysee.com.cy/cat-driptapes-11804' },
    { name: 'Layflat & Soft PVC Hoses', href: 'https://elysee.com.cy/cat-layflat-soft-pvc-hoses-11805' },
  ],
  'pvc-pressure-pipes-and-fittings': [
    { name: 'PVC – DIN Standard', href: 'https://elysee.com.cy/cat-pvc-din-standard-11901' },
    { name: 'PVC – EN ISO Standard', href: 'https://elysee.com.cy/cat-pvc-en-iso-standard-11902' },
    { name: 'PPR / PERT & Poolflex', href: 'https://elysee.com.cy/cat-ppr-pert-poolflex-11903' },
    { name: 'Tube Clips', href: 'https://elysee.com.cy/cat-tube-clips-11904' },
    { name: 'Solvent Cement Fittings', href: 'https://elysee.com.cy/cat-solvent-cement-fittings-11905' },
    { name: 'Pressure Fittings', href: 'https://elysee.com.cy/cat-pressure-fittings-11906' },
    { name: 'Accessories & Tools', href: 'https://elysee.com.cy/cat-accessories-tools-11907' },
    { name: 'Pex Fittings', href: 'https://elysee.com.cy/cat-pex-fittings-11908' },
    { name: 'UPVC (Cold Water)', href: 'https://elysee.com.cy/cat-upvc-pipes-and-fittings-for-cold-water-applications-11909' },
    { name: 'CPVC (Hot Water)', href: 'https://elysee.com.cy/cat-cpvc-pipes-and-fittings-for-hot-water-applications-11910' },
  ],
  'network-drainage': [
    { name: 'Drainage Pipes', href: 'https://elysee.com.cy/cat-drainage-pipes-12001' },
    { name: 'Drainage Fittings', href: 'https://elysee.com.cy/cat-drainage-fittings-12002' },
    { name: 'Sewerage Pipes EN 1401', href: 'https://elysee.com.cy/cat-sewerage-pipes-en1401-12003' },
    { name: 'Sewerage Fittings EN 1401', href: 'https://elysee.com.cy/cat-sewerage-fittings-en-1401-12004' },
    { name: 'Construction Materials', href: 'https://elysee.com.cy/cat-construction-materials-12005' },
  ],
  'cable-applications': [
    { name: 'Conduit Pipes', href: 'https://elysee.com.cy/cat-conduit-pipes-12101' },
    { name: 'Conduit Fittings', href: 'https://elysee.com.cy/cat-conduit-fittings-12102' },
    { name: 'Network Cable Pipes & Fittings', href: 'https://elysee.com.cy/cat-network-cable-pipes-fittings-12103' },
    { name: 'KVD Conduit Pipes & Fittings', href: 'https://elysee.com.cy/cat-kvd-conduit-pipes-fittings-12104' },
  ],
  'building-sewerage': [
    { name: 'Overflow Pipes & Fittings', href: 'https://elysee.com.cy/cat-overflow-pipes-fittings-12201' },
    { name: 'Discharge Pipes & Fittings', href: 'https://elysee.com.cy/cat-discharge-pipes-fittings-12202' },
    { name: 'Waste Fittings (EN 1329)', href: 'https://elysee.com.cy/cat-waste-fittings-en-1329-12203' },
    { name: 'Waste Fittings (EN 1329 / BS 4514)', href: 'https://elysee.com.cy/cat-waste-fittings-en-1329-bs-4514-12204' },
    { name: 'Sewerage Pipes', href: 'https://elysee.com.cy/cat-sewerage-pipes-12205' },
    { name: 'Sewerage Fittings (EN 1329 / BS 4514)', href: 'https://elysee.com.cy/cat-sewerage-fittings-en-1329-bs-4514-12206' },
    { name: 'Dblue Acoustic Pipes & Fittings', href: 'https://elysee.com.cy/cat-dblue-acoustic-pipes-and-fittings-12207' },
  ],
};

export function getSubCategoriesForSlug(slug: string): SubCategory[] {
  return subCategoriesBySlug[slug] ?? [];
}
