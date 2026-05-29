/**
 * Country -> contact details lookup for the worldwide globe explorer.
 *
 * Subsidiaries (CY / LB / EG / AT) get their own dedicated address + phone +
 * email pulled from src/data/site-content.ts. Partner countries route through
 * the Cyprus export desk (pulled from `worldwideOffices[0]`).
 *
 * Country codes are ISO 3166-1 alpha-2, lowercase.
 */

export interface CountryContact {
  /** ISO alpha-2 country code, lowercase (e.g. 'cy', 'lb'). */
  code: string;
  /** Human-readable country name. */
  country: string;
  /** Shown in the form's country field and the details card heading. */
  label: string;
  /** Whether this country hosts an Elysée subsidiary or routes via Cyprus. */
  kind: 'subsidiary' | 'partner';
  /** Multi-line postal address. Use \n for line breaks. */
  address: string;
  /** Phone in human-readable form. Use international format. */
  phone: string;
  /** Email — for partner countries, this is the Cyprus export desk. */
  email: string;
  /** Optional external website (subsidiaries only). */
  website?: string;
  /** Optional sub-line shown under the country in the details card. */
  note?: string;
  /** Pre-fills the form's message field. */
  prefilledMessage: string;
}

const exportDesk = {
  phone: '+357 22 455 008',
  email: 'yerolemos@elysee.com.cy',
  address: '5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
};

const partner = (code: string, country: string, label = country): CountryContact => ({
  code,
  country,
  label,
  kind: 'partner',
  address: exportDesk.address,
  phone: exportDesk.phone,
  email: exportDesk.email,
  note: 'Routed via the Cyprus Export Department',
  prefilledMessage: `Hi Elysée — I am enquiring from ${country}. Please put me in touch with your local distributor or representative.`,
});

export const worldwideContacts: Record<string, CountryContact> = {
  cy: {
    code: 'cy',
    country: 'Cyprus',
    label: 'Cyprus · Ergates (HQ)',
    kind: 'subsidiary',
    address: '5, Pentadaktylou street\n2643 Ergates Industrial Zone\nNicosia, Cyprus',
    phone: '+357-22-455000',
    email: 'info@elysee.com.cy',
    note: 'Group headquarters · Export desk',
    prefilledMessage: 'Hi Elysée — I would like to discuss a request with the Cyprus head office.',
  },
  lb: {
    code: 'lb',
    country: 'Lebanon',
    label: 'Lebanon · Byblos (Elysée WISE)',
    kind: 'subsidiary',
    address: 'Byblos – Gherfine - Main Road\nLebanon',
    phone: '00961 9 624551',
    email: 'sales@elyseewise.com',
    website: 'www.elyseewise.com',
    note: 'Polyethylene pipe manufacturing',
    prefilledMessage: 'Hi Elysée WISE — I would like to enquire about your Polyethylene pipe range.',
  },
  eg: {
    code: 'eg',
    country: 'Egypt',
    label: 'Egypt · 10th of Ramadan (Elysée PRIME)',
    kind: 'subsidiary',
    address: '3T15 Al Tajamouat Industrial Park\n10th of Ramadan, Egypt',
    phone: '+2 012 8901 1102',
    email: 'info@elyseeprime.com',
    website: 'www.elyseeprime.com',
    note: 'Irrigation hose manufacturing',
    prefilledMessage: 'Hi Elysée PRIME — I would like to enquire about your irrigation hose range.',
  },
  at: {
    code: 'at',
    country: 'Austria',
    label: 'Austria · Ennsdorf (Elysée Rohrsysteme)',
    kind: 'subsidiary',
    address: 'Wirtschaftspark Straße 3 / 4\nA-4482 Ennsdorf bei Enns, Austria',
    phone: '+43 (0) 7223-82700-18',
    email: 'info@elysee-rohrsysteme.com',
    website: 'www.elysee-rohrsysteme.com',
    note: 'European distribution & representation',
    prefilledMessage: 'Hi Elysée Rohrsysteme — I would like to discuss European distribution.',
  },
  gb: partner('gb', 'United Kingdom'),
  de: partner('de', 'Germany'),
  fr: partner('fr', 'France'),
  it: partner('it', 'Italy'),
  gr: partner('gr', 'Greece'),
  ae: partner('ae', 'United Arab Emirates', 'UAE'),
  sa: partner('sa', 'Saudi Arabia'),
  tr: partner('tr', 'Turkey'),
  jp: partner('jp', 'Japan'),
  za: partner('za', 'South Africa'),
  au: partner('au', 'Australia'),
  nz: partner('nz', 'New Zealand'),
};
