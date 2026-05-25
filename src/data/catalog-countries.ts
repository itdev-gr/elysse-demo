export type Region = 'europe' | 'middle-east-africa' | 'asia-pacific' | 'americas';

export interface CountryDef {
  /** ISO 3166-1 alpha-2 lowercased. */
  code: string;
  /** Display label. */
  label: string;
  /** Region group used by the country modal. */
  region: Region;
}

export interface RegionDef {
  id: Region;
  label: string;
}

export const REGIONS: ReadonlyArray<RegionDef> = [
  { id: 'europe', label: 'Europe' },
  { id: 'middle-east-africa', label: 'Middle East & Africa' },
  { id: 'asia-pacific', label: 'Asia-Pacific' },
  { id: 'americas', label: 'Americas' },
];

export const COUNTRIES: ReadonlyArray<CountryDef> = [
  // Europe (8)
  { code: 'cy', label: 'Cyprus', region: 'europe' },
  { code: 'gr', label: 'Greece', region: 'europe' },
  { code: 'de', label: 'Germany', region: 'europe' },
  { code: 'at', label: 'Austria', region: 'europe' },
  { code: 'fr', label: 'France', region: 'europe' },
  { code: 'it', label: 'Italy', region: 'europe' },
  { code: 'es', label: 'Spain', region: 'europe' },
  { code: 'pt', label: 'Portugal', region: 'europe' },
  // Middle East & Africa (8)
  { code: 'lb', label: 'Lebanon', region: 'middle-east-africa' },
  { code: 'ae', label: 'United Arab Emirates', region: 'middle-east-africa' },
  { code: 'sa', label: 'Saudi Arabia', region: 'middle-east-africa' },
  { code: 'eg', label: 'Egypt', region: 'middle-east-africa' },
  { code: 'il', label: 'Israel', region: 'middle-east-africa' },
  { code: 'jo', label: 'Jordan', region: 'middle-east-africa' },
  { code: 'ma', label: 'Morocco', region: 'middle-east-africa' },
  { code: 'za', label: 'South Africa', region: 'middle-east-africa' },
  // Asia-Pacific (5)
  { code: 'jp', label: 'Japan', region: 'asia-pacific' },
  { code: 'au', label: 'Australia', region: 'asia-pacific' },
  { code: 'nz', label: 'New Zealand', region: 'asia-pacific' },
  { code: 'in', label: 'India', region: 'asia-pacific' },
  { code: 'sg', label: 'Singapore', region: 'asia-pacific' },
  // Americas (4)
  { code: 'us', label: 'United States', region: 'americas' },
  { code: 'ca', label: 'Canada', region: 'americas' },
  { code: 'br', label: 'Brazil', region: 'americas' },
  { code: 'mx', label: 'Mexico', region: 'americas' },
];

/** country-code → region lookup. */
export const COUNTRY_REGION: Record<string, Region> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.region]),
);

export type CountryCode = (typeof COUNTRIES)[number]['code'];

/** Countries grouped by region — used by CountryModal rendering. */
export function countriesByRegion(): { region: RegionDef; countries: CountryDef[] }[] {
  return REGIONS.map((r) => ({
    region: r,
    countries: COUNTRIES.filter((c) => c.region === r.id),
  }));
}
