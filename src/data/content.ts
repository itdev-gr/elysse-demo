// Page content — single source of truth for the static text + image references
// for each of the 10 pages chosen for rebuild. Pages become thin compositions
// of components + the structs exported here.
//
// Copy is extracted faithfully from the source site (https://www.elyssegroup.com/).
// The user owns the source, so reproducing on-page text verbatim is authorised;
// we deliberately mirror the source's exact wording rather than paraphrase.
//
// Image references resolve to files under `src/assets/images/` (Task 18 copied
// and renamed 70 assets from the source). The page → image mapping comes from
// `recon/output/assets.json`'s `usedOn` field.

import type { ImageMetadata } from 'astro';

// Hero images — one per page (where the source has a clear hero asset).
import heroHome from '../assets/images/ocean-1440x900.jpg';
import heroAboutUs from '../assets/images/shutterstock-699756580-2.jpg';
import heroStreamingWater from '../assets/images/streaming-water.jpg';
import heroFuelProducts from '../assets/images/shutterstock-377226832-fuel-products.jpg';
import heroMarineLubricants from '../assets/images/shutterstock-1007620258-scaled.jpg';
import heroAlternativeFuels from '../assets/images/green-hydrogen-shutterstock-1938738706.jpg';
import heroAdvisoryServices from '../assets/images/shutterstock-377226832-advisory-services.jpg';
import heroContact from '../assets/images/shutterstock-374742190-group-ceo-statement.jpg';
import heroNews from '../assets/images/landscape.jpg'; // press-room landing has no dedicated hero asset; reuse landscape banner.
import heroPrivacy from '../assets/images/shutterstock-377226832-privacy-policy.jpg';

// Section/article images.
import imgServicesPanel from '../assets/images/landscape.jpg';
import imgCoreValues from '../assets/images/shutterstock-377226832-core-values.jpg';
import imgResponsiblePartner from '../assets/images/shutterstock-377226832-responsible-partner.jpg';
import imgWeCare from '../assets/images/shutterstock-377226832-we-care.jpg';

import imgArticlePanama from '../assets/images/untitled-1.png';
import imgArticleHsbc from '../assets/images/barge-graphic.jpg';
import imgArticleTenYear from '../assets/images/10-year-celebration.jpg';
import imgArticleHseq from '../assets/images/shutterstock-377226832-hseq-article.jpg';
import imgArticleMethane from '../assets/images/shutterstock-377226832-looking-at-ways.jpg';
import imgArticleDrs from '../assets/images/shutterstock-309247196.jpg'; // No dedicated DRS asset in repo; reuse a generic environmental image. TODO confirm.

// Infographic / supporting assets for the Alternative Fuels page.
import imgShipInfographic from '../assets/images/ship-infographic.jpg';
import imgSustainableBiomass from '../assets/images/sustainable-biomass.jpg';
import imgEnergyPrice from '../assets/images/energy-price.jpg';

// ---------- shared types ----------

export interface CTA {
  label: string;
  href: string;
}

export interface HeroBlock {
  eyebrow?: string;
  headline: string;
  sub?: string;
  image?: ImageMetadata;
  /** Public-folder URL of a background video; if set, the Hero plays this instead of `image` and reuses `image` as the poster. */
  video?: string;
  cta?: CTA;
  ctaSecondary?: CTA;
}

export interface TextSection {
  kind: 'text';
  eyebrow?: string;
  heading?: string;
  /** One or more paragraphs joined by `\n\n`. */
  body: string;
  image?: ImageMetadata;
  cta?: CTA;
}

export interface FeatureGridSection {
  kind: 'feature-grid';
  heading?: string;
  eyebrow?: string;
  items: {
    title: string;
    eyebrow?: string;
    body?: string;
    href?: string;
    image?: ImageMetadata;
  }[];
}

export interface ListSection {
  kind: 'list';
  heading?: string;
  eyebrow?: string;
  intro?: string;
  items: string[];
}

export interface OfficeListSection {
  kind: 'offices';
  heading?: string;
  offices: {
    city: string;
    code?: string;
    region?: string;
    addressLines?: string[];
    phones?: string[];
    email?: string;
  }[];
}

export interface NewsListSection {
  kind: 'news-list';
  heading?: string;
  eyebrow?: string;
  articles: {
    title: string;
    slug: string;
    date?: string;
    image?: ImageMetadata;
    eyebrow?: string;
    excerpt?: string;
  }[];
}

export type Section =
  | TextSection
  | FeatureGridSection
  | ListSection
  | OfficeListSection
  | NewsListSection;

export interface PageContent {
  slug: string;
  meta: { title: string; description: string };
  hero?: HeroBlock;
  sections: Section[];
  /** Sibling page navigation for service / sub-section sidebars. */
  siblings?: { label: string; href: string }[];
}

// ---------- shared sibling lists ----------

/** Sibling lists for the "Our Services" sidebar nav. */
export const servicesSiblings: { label: string; href: string }[] = [
  { label: 'Agriculture', href: '/our-services/agriculture/' },
  { label: 'Landscape', href: '/our-services/landscape/' },
  { label: 'Building & Infrastructure', href: '/our-services/building-infrastructure/' },
  { label: 'Industry', href: '/our-services/industry/' },
];

/** Sibling lists for the "About Us" sidebar nav. Trimmed in Task 32 to only the
 *  about-us sub-pages we rebuilt (CEO/CFO statements were out of scope). */
export const aboutSiblings: { label: string; href: string }[] = [
  { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
];

// ---------- per-page content ----------

export const homePage: PageContent = {
  slug: '/',
  meta: {
    title: 'Elysse Group — Fuelling the shipping industry',
    description:
      'Elysse Group integrates business strategies whilst upholding the highest ethics for maximum success — a leading independent fuel and energy provider to the shipping industry.',
  },
  hero: {
    headline: 'Text Placeholder',
    sub: 'Elysse Group integrates business strategies whilst upholding the highest ethics for maximum success.',
    image: heroHome,
    video: '/media/hero-elysee.mp4',
    cta: { label: 'discover Elysse', href: '/about-us/your-marine-energy-provider/' },
    ctaSecondary: { label: 'EXPLORE OUR SERVICES', href: '/our-services/agriculture/' },
  },
  sections: [
    {
      kind: 'text',
      eyebrow: 'Services',
      heading: 'Propelling fleets into the future',
      body: 'Our team of skilled professionals are committed to exceeding expectations and going above and beyond to ensure that our customers are satisfied with the services we provide.',
      image: imgServicesPanel,
      cta: { label: 'EXPLORE SERVICES', href: '/our-services/agriculture/' },
    },
    {
      kind: 'text',
      eyebrow: 'Core Values',
      heading: 'A strong vision for sustainable development',
      body: 'At Elysse Group we are committed to providing our customers with the highest quality products and services while also upholding our values of sustainability and social responsibility. We believe that by taking care of our planet and its people, we can create a better future for everyone.\n\nWe prioritize the needs and satisfaction of our customers, and strive to create a positive and enjoyable experience for them every time they interact with our company. We value honesty, transparency, and respect, and strive to embody these values in all of our interactions with our customers and stakeholders.',
      image: imgCoreValues,
      cta: {
        label: 'LEARN MORE ABOUT OUR VALUES',
        href: '/about-us/your-marine-energy-provider/',
      },
    },
    {
      kind: 'text',
      eyebrow: 'Responsible Partner',
      heading: 'Focus on extended quality control & constant innovation',
      body: 'We strive to be a responsible partner that our clients can rely on. We believe that trust and reliability are the cornerstones of any successful business relationship, and we work hard to earn and maintain the trust of our clients.',
      image: imgResponsiblePartner,
      cta: { label: 'LEARN MORE ABOUT OUR SERVICES', href: '/our-services/industry/' },
    },
    {
      kind: 'text',
      eyebrow: 'We Care',
      heading: 'Caring for what really matters',
      body: 'Elysse Group is committed to operating in an ethical and responsible manner, taking into account the impact of our actions on stakeholders such as employees, customers, and the environment.',
      image: imgWeCare,
      cta: { label: 'LEARN MORE ABOUT ELYSSE', href: '/about-us/' },
    },
    {
      kind: 'news-list',
      eyebrow: 'Showing latest',
      heading: 'Latest News',
      articles: [
        {
          title:
            'Elysse Group Expands into the Americas with the Launch of ELYSSE ENERGY Panama',
          slug: '/press-room/news/elysse-energy-panama-launch/',
          date: '10/1/2025',
          image: imgArticlePanama,
          excerpt:
            'Elysse Group expands into the Americas with the launch of ELYSSE ENERGY PANAMA S.A. in Panama City. Led by industry veteran Hernán Ortiz, the new hub strengthens the company’s regional presence from Canada to Argentina and marks a key step in its transition toward cleaner marine energy solutions.',
        },
        {
          title:
            'Elysse Group Secures Significant Funding to Propel Global Expansion',
          slug: '/press-room/news/hsbc-funding-increase-july-2024/',
          date: '7/29/2024',
          image: imgArticleHsbc,
          excerpt:
            'At Elysse Group, we are thrilled to announce a major milestone in our journey towards global expansion. With the steadfast support of HSBC UK, our company is poised for significant growth, driven by a substantial funding increase that will enable us to meet rising demands and enhance our operations worldwide.',
        },
        {
          title: 'CELEBRATING A DECADE OF EXCELLENCE',
          slug: '/press-room/news/10-year-celebration/',
          date: '4/30/2024',
          image: imgArticleTenYear,
          excerpt:
            'We proudly celebrated our 10th Anniversary on April 30th, marking a decade of achievements and growth.',
        },
      ],
    },
  ],
};

export const aboutUsPage: PageContent = {
  slug: '/about-us/',
  meta: {
    title: 'About Us — Elysse Group',
    description:
      'Get to know Elysse Group — our vision as a marine energy provider, our leadership statements, and our worldwide offices.',
  },
  hero: {
    eyebrow: 'About Us',
    headline: 'About Us',
    sub: 'A leading independent fuel and energy provider to the shipping industry — founded in 2014 with offices across eight cities worldwide.',
    image: heroAboutUs,
  },
  sections: [
    {
      kind: 'feature-grid',
      heading: 'Discover more about Elysse',
      items: [
        {
          title: 'Streaming Water, Streaming Life',
          eyebrow: 'Our Story',
          body: 'Elysse Group was founded in 2014 with the goal of becoming a leading independent fuel and energy provider to the shipping industry.',
          href: '/about-us/your-marine-energy-provider/',
          image: heroStreamingWater,
        },
      ],
    },
  ],
  siblings: aboutSiblings,
};

export const marineEnergyPage: PageContent = {
  slug: '/about-us/your-marine-energy-provider/',
  meta: {
    title: 'Your Marine Energy Provider — Elysse Group',
    description:
      'Elysse Group was founded in 2014 with the goal of becoming a leading independent fuel and energy provider to the shipping industry.',
  },
  hero: {
    eyebrow: 'About Us',
    headline: 'Streaming Water, Streaming Life',
    sub: 'Constantly seeking out exceptional products and services, exceeding our customers’ expectations, and helping them achieve their goals.',
    image: heroStreamingWater,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Who we are',
      body: 'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.\n\nIt is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysee. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.\n\nWe strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. We also love to add in new features that make your life easier. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet. We’re proud to say that we manage to achieve these targets time and time again, thanks to every member of the Elysee team.',
    },
    {
      kind: 'text',
      heading: 'Beyond sourcing & physical operations',
      body: 'At Elysse Group, we are not just a sourcing and physical operation. We go beyond that by providing our customers with a range of value-added services, including an advisory service, risk management, and market analysis. These services enable us to support our customers throughout the entire lifecycle of their fuel needs, from sourcing and procurement to delivery.',
    },
    {
      kind: 'text',
      heading: 'Our vision',
      body: 'We take great pride in our commitment to customer service and excellence. Our vision is to be the go-to source for top-quality products and services in the industry. We aim to achieve this by living our mission and working towards our vision of being known for our excellent customer service, commitment to sustainability, and social responsibility.',
    },
    {
      kind: 'text',
      heading: 'Creating value for everyone',
      body: 'At Elysse Group, we firmly believe that by creating value for our customers, we also create value for our employees and the community. We are proud of our team of experts who have extensive experience in the industry and are dedicated to providing exceptional service to our customers.\n\nWhether you are a small business or a large corporation, Elysse Group is here to provide you with the highest quality fuel products and services, as well as the expertise and support you need to succeed. Contact us today to learn more about how we can help you achieve your goals.',
      cta: { label: 'Contact us', href: '/contact/' },
    },
  ],
  siblings: aboutSiblings,
};

// ---------- Service pages — Elysee Group's 4 sectors ----------
// Heroes reuse the previously-imported shutterstock photos as placeholders;
// swap to dedicated category photography when available. Body copy below is
// short placeholder text — replace with real sector content.

export const agriculturePage: PageContent = {
  slug: '/our-services/agriculture/',
  meta: {
    title: 'Agriculture — Elysse Group',
    description:
      'Solutions for agricultural operations — from irrigation systems and water management to soil preparation, planting, and harvesting support.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Agriculture',
    sub: 'Equipment, expertise, and supply solutions for modern agricultural operations.',
    image: heroFuelProducts,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Built for the field',
      body: 'Elysee Group supports farmers and agricultural operators with a full range of equipment, materials, and advisory services. Our solutions span irrigation, soil preparation, planting, harvesting, and post-harvest logistics — engineered to perform reliably in the most demanding conditions.',
    },
    {
      kind: 'text',
      heading: 'Working in partnership',
      body: 'We work directly with growers, cooperatives, and agribusinesses to understand their operational needs and recommend the right combination of products and services. From smallholdings to industrial-scale operations, our team brings the same commitment to quality and follow-through.',
      cta: { label: 'Talk to our team', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const landscapePage: PageContent = {
  slug: '/our-services/landscape/',
  meta: {
    title: 'Landscape — Elysse Group',
    description:
      'Solutions for landscape design, installation, and maintenance — turfgrass care, irrigation, hardscape construction, and ongoing grounds management.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Landscape',
    sub: 'Design, installation, and ongoing care for outdoor environments — public, commercial, and residential.',
    image: heroMarineLubricants,
  },
  sections: [
    {
      kind: 'text',
      heading: 'From concept to upkeep',
      body: 'Our landscape practice covers every stage of an outdoor project — initial design, installation, planting, and the long-term maintenance that keeps grounds looking their best. We supply the equipment, materials, and the technical know-how to deliver consistent results at any scale.',
    },
    {
      kind: 'text',
      heading: 'Specialist support',
      body: 'Whether the project is a public park, a corporate campus, or a private estate, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.',
      cta: { label: 'Talk to our team', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const buildingInfrastructurePage: PageContent = {
  slug: '/our-services/building-infrastructure/',
  meta: {
    title: 'Building & Infrastructure — Elysse Group',
    description:
      'Equipment, materials, and project support for building and infrastructure works — from groundworks and structural construction to roads, utilities, and public works.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Building & Infrastructure',
    sub: 'End-to-end support for construction and civil-engineering projects, large and small.',
    image: heroAlternativeFuels,
  },
  sections: [
    {
      kind: 'text',
      heading: 'On site, on schedule',
      body: 'We supply equipment, materials, and technical support across the building and infrastructure sectors — including groundworks, structural construction, roadworks, drainage, and utilities installation. Our network keeps contractors moving on tight schedules and difficult sites.',
    },
    {
      kind: 'text',
      heading: 'Project-tailored partnership',
      body: 'From private developers to public-works programmes, we build long-term relationships with project teams and adapt our offer to the specific demands of each job. Our specialists help plan logistics, recommend the right kit, and stay engaged through commissioning.',
      cta: { label: 'Talk to our team', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const industryPage: PageContent = {
  slug: '/our-services/industry/',
  meta: {
    title: 'Industry — Elysse Group',
    description:
      'Solutions for industrial operations — from manufacturing and processing to maintenance, retrofits, and plant-side technical support.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Industry',
    sub: 'Equipment, supply, and technical services for industrial plants and manufacturing operations.',
    image: heroAdvisoryServices,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Plant-side support',
      body: 'Elysee Group works with industrial operators across manufacturing, processing, and heavy-asset sectors. We supply the equipment and consumables your operation needs and provide technical specialists who understand the demands of plant uptime, maintenance windows, and regulatory compliance.',
    },
    {
      kind: 'text',
      heading: 'Long-term partner, not a one-off vendor',
      body: 'Our industrial customers value continuity. We invest in the operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change. The result is fewer surprises and a partner you can rely on across multi-year programmes.',
      cta: { label: 'Talk to our team', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const contactPage: PageContent = {
  slug: '/contact/',
  meta: {
    title: 'Contact — Elysse Group',
    description:
      'Get in touch with Elysse Group — offices in London, Athens, Rotterdam, Oslo, Rio de Janeiro, Singapore, Dubai, and Panama.',
  },
  hero: {
    eyebrow: 'Contact',
    headline: 'Contact us',
    sub: 'Eight offices across the globe — reach the team closest to you.',
    image: heroContact,
  },
  sections: [
    {
      kind: 'offices',
      heading: 'Worldwide Offices',
      offices: [
        {
          city: 'London',
          code: 'LDN',
          region: 'United Kingdom',
          addressLines: [
            'Ground Floor,',
            '10 Coldbath Square',
            'London EC1R 5HL',
            'United Kingdom',
          ],
          email: 'london@elyssegroup.com',
        },
        {
          city: 'Athens',
          code: 'ATH',
          region: 'Greece',
          addressLines: [
            'Ave. Vouliagmenis 82,',
            'Glyfada, 166 75,',
            'Greece',
          ],
          email: 'athens@elyssegroup.com',
        },
        {
          city: 'Rotterdam',
          code: 'RTM',
          region: 'Netherlands',
          addressLines: [
            'World Trade Center,',
            'Beursplein 37, 3011 AA,',
            '3rd floor, Room 3.03',
            'Rotterdam',
            'Netherlands',
          ],
          email: 'rotterdam@elyssegroup.com',
        },
        {
          city: 'Oslo',
          code: 'OSL',
          region: 'Norway',
          addressLines: ['Grundingen 6,', 'Oslo', '0250', 'Norway'],
          email: 'oslo@elyssegroup.com',
        },
        {
          city: 'Rio de Janeiro',
          code: 'RJ',
          region: 'Brazil',
          addressLines: [
            'Rua da Quitanda',
            '52 -1002,',
            'CEP 20.011-030 Centro',
          ],
          email: 'rio@elyssegroup.com',
        },
        {
          city: 'Singapore',
          code: 'SG',
          region: 'Singapore',
          addressLines: [
            '16 Raffles Quay',
            '#17-03',
            'Hong Leong Building',
            '048581',
            'Singapore',
          ],
          email: 'singapore@elyssegroup.com',
        },
        {
          city: 'Dubai',
          code: 'DXB',
          region: 'United Arab Emirates',
          addressLines: [
            'JLT Cluster I',
            'Platinum Tower #2703-2704',
            'Jumeirah Lake Towers',
            'Dubai',
            'United Arab Emirates',
          ],
          email: 'dubai@elyssegroup.com',
        },
        {
          city: 'Panama',
          code: 'PA',
          region: 'Panama',
          addressLines: [
            'World Trade Center',
            'Calle 53 Este, Oficina 705',
            'Marbella, Panama',
          ],
          phones: ['+507 6461 5040'],
          email: 'panama@elyssegroup.com',
        },
      ],
    },
  ],
};

export const newsIndexPage: PageContent = {
  slug: '/press-room/news/',
  meta: {
    title: 'News — Elysse Group Press Room',
    description:
      'Latest news from Elysse Group — expansion announcements, industry analysis, sustainability updates, and milestones from across our worldwide offices.',
  },
  hero: {
    eyebrow: 'Press Room',
    headline: 'News',
    sub: 'Announcements, industry analysis, and milestones from the Elysse Group team.',
    image: heroNews,
  },
  sections: [
    {
      kind: 'news-list',
      eyebrow: 'Showing latest',
      heading: 'Latest News',
      articles: [
        {
          title:
            'Elysse Group Expands into the Americas with the Launch of ELYSSE ENERGY Panama',
          slug: '/press-room/news/elysse-energy-panama-launch/',
          date: '10/1/2025',
          image: imgArticlePanama,
          excerpt:
            'Elysse Group expands into the Americas with the launch of ELYSSE ENERGY PANAMA S.A. in Panama City. Led by industry veteran Hernán Ortiz, the new hub strengthens the company’s regional presence from Canada to Argentina and marks a key step in its transition toward cleaner marine energy solutions.',
        },
        {
          title:
            'Elysse Group Secures Significant Funding to Propel Global Expansion',
          slug: '/press-room/news/hsbc-funding-increase-july-2024/',
          date: '7/29/2024',
          image: imgArticleHsbc,
          excerpt:
            'At Elysse Group, we are thrilled to announce a major milestone in our journey towards global expansion. With the steadfast support of HSBC UK, our company is poised for significant growth, driven by a substantial funding increase that will enable us to meet rising demands and enhance our operations worldwide.',
        },
        {
          title: 'CELEBRATING A DECADE OF EXCELLENCE',
          slug: '/press-room/news/10-year-celebration/',
          date: '4/30/2024',
          image: imgArticleTenYear,
          excerpt:
            'We proudly celebrated our 10th Anniversary on April 30th, marking a decade of achievements and growth. The milestone was commemorated with joyous celebrations held across all our offices, bringing together teams from every corner of our organization to reflect on our journey and look forward to an even brighter future.',
        },
        {
          title:
            'HSEQ standards continue to drive innovation in the bunker industry',
          slug: '/press-room/news/hseq-article/',
          date: '12/21/2022',
          image: imgArticleHseq,
          excerpt:
            'The importance of HSEQ (health, safety, environmental, and quality) standards in the bunker industry has never been greater.',
        },
        {
          title:
            'Looking at ways the oil and gas industry can reduce the methane emissions.',
          slug: '/press-room/news/looking-at-ways-to-reduce-methane-gas-emissions/',
          date: '11/24/2022',
          image: imgArticleMethane,
          excerpt:
            'Oil and gas industry leaders are taking steps to reduce methane emissions in an effort to combat climate change and protect the environment.',
        },
        {
          title: 'DRS standards for pollution',
          slug: '/press-room/news/drs-standards-for-pollution/',
          date: '12/21/2021',
          image: imgArticleDrs,
          excerpt:
            'A Design-for-Recycling approach seeks to make plastic products or parts more easily recyclable, with the objective of ensuring that a consistent amount of plastic waste is recycled and can be used again.',
        },
      ],
    },
  ],
};

export const privacyPolicyPage: PageContent = {
  slug: '/legal/privacy-policy/',
  meta: {
    title: 'Privacy Policy — Elysse Group',
    description:
      'Your privacy is important to us. It is Elysse Group’ policy to respect your privacy regarding any information we may collect from you across our website, www.elyssegroup.com and other sites we own and operate.',
  },
  hero: {
    eyebrow: 'Legal',
    headline: 'Privacy Policy',
    sub: 'Your privacy is important to us. It is Elysse Group’ policy to respect your privacy regarding any information we may collect from you.',
    image: heroPrivacy,
  },
  sections: [
    // Full policy body lives in `src/pages/legal/privacy-policy.astro` (or a sibling
    // .md file) — it's far too long to mirror in this struct. We render the hero
    // here and then the page composes the long-form text directly.
    {
      kind: 'text',
      heading: 'About this policy',
      body: 'Your privacy is important to us. It is Elysse Group’ policy to respect your privacy regarding any information we may collect from you across our website, www.elyssegroup.com and other sites we own and operate. The full policy text — covering log data, cookies, third-party services, your data-protection rights, and contact details for our Data Protection Officer — is published below.',
    },
  ],
};

// ---------- registry ----------

export const allPages: Record<string, PageContent> = {
  '/': homePage,
  '/about-us/': aboutUsPage,
  '/about-us/your-marine-energy-provider/': marineEnergyPage,
  '/our-services/agriculture/': agriculturePage,
  '/our-services/landscape/': landscapePage,
  '/our-services/building-infrastructure/': buildingInfrastructurePage,
  '/our-services/industry/': industryPage,
  '/contact/': contactPage,
  '/press-room/news/': newsIndexPage,
  '/legal/privacy-policy/': privacyPolicyPage,
};
