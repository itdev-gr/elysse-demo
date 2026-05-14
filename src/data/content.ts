// Page content — single source of truth for the static text + image references
// for each of the 10 pages chosen for rebuild. Pages become thin compositions
// of components + the structs exported here.
//
// Copy is extracted faithfully from the source site (https://www.sonanbunkers.com/).
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
import heroMarineEnergy from '../assets/images/shutterstock-1957229728-your-marine-energy-provider.jpg';
import heroFuelProducts from '../assets/images/shutterstock-377226832-fuel-products.jpg';
import heroMarineLubricants from '../assets/images/shutterstock-1007620258-scaled.jpg';
import heroAlternativeFuels from '../assets/images/green-hydrogen-shutterstock-1938738706.jpg';
import heroAdvisoryServices from '../assets/images/shutterstock-377226832-advisory-services.jpg';
import heroContact from '../assets/images/shutterstock-374742190-group-ceo-statement.jpg';
import heroNews from '../assets/images/services.jpg'; // press-room landing has no dedicated hero asset; reuse services banner.
import heroPrivacy from '../assets/images/shutterstock-377226832-privacy-policy.jpg';

// Section/article images.
import imgServicesPanel from '../assets/images/services.jpg';
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
  { label: 'Fuel Products', href: '/our-services/fuel-products/' },
  { label: 'Marine Lubricants', href: '/our-services/marine-lubricants/' },
  { label: 'Alternative Fuels', href: '/our-services/alternative-fuels/' },
  { label: 'Advisory Services', href: '/our-services/advisory-services/' },
];

/** Sibling lists for the "About Us" sidebar nav. */
export const aboutSiblings: { label: string; href: string }[] = [
  { label: 'Your Marine Energy Provider', href: '/about-us/your-marine-energy-provider/' },
  { label: 'Group CEO Statement', href: '/about-us/group-ceo-statement/' },
  { label: 'Group CFO Statement', href: '/about-us/group-cfo-statement/' },
];

// ---------- per-page content ----------

export const homePage: PageContent = {
  slug: '/',
  meta: {
    title: 'Sonan Bunkers — Fuelling the shipping industry',
    description:
      'Sonan Bunkers Group integrates business strategies whilst upholding the highest ethics for maximum success — a leading independent fuel and energy provider to the shipping industry.',
  },
  hero: {
    headline: 'fuelling the shipping industry',
    sub: 'Sonan Bunkers Group integrates business strategies whilst upholding the highest ethics for maximum success.',
    image: heroHome,
    cta: { label: 'DISCOVER SONAN', href: '/about-us/your-marine-energy-provider/' },
    ctaSecondary: { label: 'EXPLORE OUR SERVICES', href: '/our-services/' },
  },
  sections: [
    {
      kind: 'text',
      eyebrow: 'Services',
      heading: 'Propelling fleets into the future',
      body: 'Our team of skilled professionals are committed to exceeding expectations and going above and beyond to ensure that our customers are satisfied with the services we provide.',
      image: imgServicesPanel,
      cta: { label: 'EXPLORE SERVICES', href: '/our-services/' },
    },
    {
      kind: 'text',
      eyebrow: 'Core Values',
      heading: 'A strong vision for sustainable development',
      body: 'At Sonan Bunkers we are committed to providing our customers with the highest quality products and services while also upholding our values of sustainability and social responsibility. We believe that by taking care of our planet and its people, we can create a better future for everyone.\n\nWe prioritize the needs and satisfaction of our customers, and strive to create a positive and enjoyable experience for them every time they interact with our company. We value honesty, transparency, and respect, and strive to embody these values in all of our interactions with our customers and stakeholders.',
      image: imgCoreValues,
      cta: {
        label: 'LEARN MORE',
        href: '/sonan-bunkers-people-working-together/our-commitment-to-clients/',
      },
    },
    {
      kind: 'text',
      eyebrow: 'Responsible Partner',
      heading: 'Focus on extended quality control & constant innovation',
      body: 'We strive to be a responsible partner that our clients can rely on. We believe that trust and reliability are the cornerstones of any successful business relationship, and we work hard to earn and maintain the trust of our clients.',
      image: imgResponsiblePartner,
      cta: { label: 'LEARN MORE', href: '/responsible-partner/' },
    },
    {
      kind: 'text',
      eyebrow: 'We Care',
      heading: 'Caring for what really matters',
      body: 'Sonan Bunkers is committed to operating in an ethical and responsible manner, taking into account the impact of our actions on stakeholders such as employees, customers, and the environment.',
      image: imgWeCare,
      cta: { label: 'LEARN MORE', href: '/responsible-partner/csr/' },
    },
    {
      kind: 'news-list',
      eyebrow: 'Showing latest',
      heading: 'Latest News',
      articles: [
        {
          title:
            'Sonan Bunkers Expands into the Americas with the Launch of SONAN ENERGY Panama',
          slug: '/press-room/news/sonan-energy-panama-launch/',
          date: '10/1/2025',
          image: imgArticlePanama,
          excerpt:
            'Sonan Bunkers expands into the Americas with the launch of SONAN ENERGY PANAMA S.A. in Panama City. Led by industry veteran Hernán Ortiz, the new hub strengthens the company’s regional presence from Canada to Argentina and marks a key step in its transition toward cleaner marine energy solutions.',
        },
        {
          title:
            'Sonan Bunkers Secures Significant Funding to Propel Global Expansion',
          slug: '/press-room/news/hsbc-funding-increase-july-2024/',
          date: '7/29/2024',
          image: imgArticleHsbc,
          excerpt:
            'At Sonan Bunkers, we are thrilled to announce a major milestone in our journey towards global expansion. With the steadfast support of HSBC UK, our company is poised for significant growth, driven by a substantial funding increase that will enable us to meet rising demands and enhance our operations worldwide.',
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
    title: 'About Us — Sonan Bunkers',
    description:
      'Get to know Sonan Bunkers — our vision as a marine energy provider, our leadership statements, and our worldwide offices.',
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
      heading: 'Discover more about Sonan',
      items: [
        {
          title: 'Your Marine Energy Provider',
          eyebrow: 'Our Story',
          body: 'Sonan Bunkers was founded in 2014 with the goal of becoming a leading independent fuel and energy provider to the shipping industry.',
          href: '/about-us/your-marine-energy-provider/',
          image: heroMarineEnergy,
        },
        {
          title: 'Group CEO Statement',
          eyebrow: 'Leadership',
          href: '/about-us/group-ceo-statement/',
        },
        {
          title: 'Group CFO Statement',
          eyebrow: 'Leadership',
          href: '/about-us/group-cfo-statement/',
        },
      ],
    },
  ],
  siblings: aboutSiblings,
};

export const marineEnergyPage: PageContent = {
  slug: '/about-us/your-marine-energy-provider/',
  meta: {
    title: 'Your Marine Energy Provider — Sonan Bunkers',
    description:
      'Sonan Bunkers was founded in 2014 with the goal of becoming a leading independent fuel and energy provider to the shipping industry.',
  },
  hero: {
    eyebrow: 'About Us',
    headline: 'Your Marine Energy Provider',
    sub: 'Constantly seeking out exceptional products and services, exceeding our customers’ expectations, and helping them achieve their goals.',
    image: heroMarineEnergy,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Who we are',
      body: 'Sonan Bunkers was founded in 2014 with the goal of becoming a leading independent fuel and energy provider to the shipping industry. We understand that this industry can be complex and challenging, as it involves navigating dynamic and constantly changing markets. That’s why we have made it our mission to constantly seek out exceptional products and services, exceed our customers’ expectations, and help them achieve their goals.',
    },
    {
      kind: 'text',
      heading: 'Beyond sourcing & physical operations',
      body: 'At Sonan Bunkers, we are not just a sourcing and physical operation. We go beyond that by providing our customers with a range of value-added services, including an advisory service, risk management, and market analysis. These services enable us to support our customers throughout the entire lifecycle of their fuel needs, from sourcing and procurement to delivery.',
    },
    {
      kind: 'text',
      heading: 'Our vision',
      body: 'We take great pride in our commitment to customer service and excellence. Our vision is to be the go-to source for top-quality products and services in the industry. We aim to achieve this by living our mission and working towards our vision of being known for our excellent customer service, commitment to sustainability, and social responsibility.',
    },
    {
      kind: 'text',
      heading: 'Creating value for everyone',
      body: 'At Sonan Bunkers, we firmly believe that by creating value for our customers, we also create value for our employees and the community. We are proud of our team of experts who have extensive experience in the industry and are dedicated to providing exceptional service to our customers.\n\nWhether you are a small business or a large corporation, Sonan Bunkers is here to provide you with the highest quality fuel products and services, as well as the expertise and support you need to succeed. Contact us today to learn more about how we can help you achieve your goals.',
      cta: { label: 'Contact us', href: '/contact/' },
    },
  ],
  siblings: aboutSiblings,
};

export const fuelProductsPage: PageContent = {
  slug: '/our-services/fuel-products/',
  meta: {
    title: 'Fuel Products — Sonan Bunkers',
    description:
      'Sonan Bunkers provides exceptional fuel products to customers worldwide, strictly adhering to ISO 8217 standards across the product development process.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Fuel Products',
    sub: 'Exceptional fuel products to customers worldwide — held to the highest standards of excellence and built around safety and reliability.',
    image: heroFuelProducts,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Commitment to quality',
      body: 'At Sonan Bunkers, we take pride in our commitment to providing exceptional fuel products to our customers worldwide. We hold ourselves to the highest standards of excellence and prioritize safety and reliability. This is achieved by strictly adhering to the ISO 8217 standards in our product development process.',
    },
    {
      kind: 'text',
      heading: 'ISO 8217 & competitive pricing',
      body: 'Our rigorous adherence to these standards ensures that our oil products are of the highest quality and are suitable for use in a wide range of marine engines. We understand that price is a crucial factor in the energy sector, and we strive to offer competitive pricing without compromising the quality of our products.',
    },
    {
      kind: 'text',
      heading: 'Sustainability & environmental responsibility',
      body: 'Moreover, we recognize the importance of sustainability and environmental responsibility. We acknowledge the impact our operations have on the environment and work tirelessly to minimize that impact. We source our products from environmentally responsible suppliers and take steps to reduce emissions.',
    },
    {
      kind: 'text',
      heading: 'The Sonan difference',
      body: 'At Sonan Bunkers, we firmly believe that our combination of superior quality, competitive pricing, and a strong emphasis on sustainability and environmental responsibility makes us the optimal choice for customers seeking bunker requirements.',
      cta: { label: 'Get in touch', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const marineLubricantsPage: PageContent = {
  slug: '/our-services/marine-lubricants/',
  meta: {
    title: 'Marine Lubricants — Sonan Bunkers',
    description:
      'Sonan Bunkers helps customers improve operational efficiency through an extensive supply network of global major oil and independent suppliers in 1,000+ ports across 80+ countries.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Marine lubricants',
    sub: '24/7 supply with high flexibility and reliability, combining decades of marine lubricants experience.',
    image: heroMarineLubricants,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Operational efficiency, worldwide',
      body: 'Sonan Bunkers is looking to help its customers to improve their operational efficiency through an extensive supply network of global major oil and independent suppliers.\n\nOur primary objective is to ensure our customer’s peace of mind regarding their lubricant supplies and keep them satisfied by providing them with premium products at competitive prices at all ports around the world with a respective technical service whenever this is needed by a team of experts.',
    },
    {
      kind: 'text',
      heading: '24/7 service across 1,000+ ports',
      body: 'Our mission is to provide a 24/7 service to our customers with high flexibility and reliability combining our vast experience in the field of marine lubricants.\n\nOur partners’ network covers supplies in more than 1,000 ports and above 80 countries. Our day-to-day business is to keep constant contact with our customers and provide them with frequent updates regarding the progress of their orders.',
    },
    {
      kind: 'list',
      heading: 'Premium product range',
      intro: 'We offer a wide range of premium quality products covering well above manufacturer requirements such as:',
      items: [
        'Cylinder and system oils for crosshead engines and four-stroke diesel engines',
        'Hydraulic, gear oils',
        'Heat transfer oils',
        'Turbine, compressor oils',
        'Refrigeration oils',
        'Greases',
        'Environmentally responsible lubricants and great range of synthetics',
      ],
    },
    {
      kind: 'list',
      heading: 'Used oil analysis services',
      intro: 'Technical experts will offer the optimum lubricants and create a lubrication chart for each vessel with services such as:',
      items: [
        'Used Oil Analysis Service (UOA)',
        'Scavenging Drain Analysis (SDA)',
        'Cold Corrosion Monitoring (CCM)',
      ],
    },
    {
      kind: 'text',
      heading: 'A trustworthy partner under IMO 2020',
      body: 'Our dedicated team of marine lubricant experts provides the global shipping industry with optimal supply solutions and first-class technical services. With a focus on long-term relationships and value-for-money service offerings, we help our clients — owners and managers — to overcome the many challenges they face every day.\n\nIn a rapidly changing industry environment and with the IMO 2020 in place Sonan Bunkers Group is committed to supplying global coverage while being a trustworthy partner, guaranteeing smooth operations and the best fleet lubrication results.',
    },
    {
      kind: 'feature-grid',
      heading: 'How we support you',
      items: [
        {
          title: 'Fast-paced technical support',
          body: 'Conscious of efficiency, we offer fast-paced solutions with onshore and onboard technical support tailored to your maintenance needs.',
        },
        {
          title: 'Global coverage, local depth',
          body: 'Our broad international network of physical suppliers connects global majors with local distributors ensuring optimal supply coverage, even in remote areas.',
        },
        {
          title: 'Expert marine lubricants team',
          body: 'Our marine lubricant experts are well aware of the technical needs of your onboard and onshore teams, offering the best combination of well-rounded expertise, hands-on client service, and the usage of high-quality products from premium engines and auxiliary equipment manufacturers.',
        },
        {
          title: 'Preventive maintenance package',
          body: 'As part of Sonan Bunkers Lubricants Preventive Maintenance Package, we offer a classic lube monitor used oil analysis service for all types of vessels, as well as a cold corrosion control solution for marine main engine cylinders.',
        },
      ],
    },
  ],
  siblings: servicesSiblings,
};

export const alternativeFuelsPage: PageContent = {
  slug: '/our-services/alternative-fuels/',
  meta: {
    title: 'Alternative Fuels — Sonan Bunkers',
    description:
      'The shipping sector is crucial to a carbon-free future. Sonan Bunkers works with major energy and fuel producers to support the transition to biofuels, bio-LNG, bio-methanol and green hydrogen.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Alternative fuels',
    sub: 'Supporting the IMO’s 2050 decarbonisation targets — biofuels, bio-LNG, bio-methanol, electricity, and green hydrogen.',
    image: heroAlternativeFuels,
  },
  sections: [
    {
      kind: 'text',
      heading: 'A carbon-free future for shipping',
      body: 'The shipping sector is crucial to achieving a carbon-free future. In response to the Paris Climate Agreement, the International Maritime Organisation (IMO) has set an ambitious target to halve greenhouse gas emissions by 2050 compared to 2008 levels, while reducing carbon intensity by 40% by 2030 and 70% by 2050.\n\nFuture marine fuel markets will be increasingly diverse, dependent on a variety of energy sources and interconnected and linked to different geographical energy markets, production and industries.',
      image: imgShipInfographic,
    },
    {
      kind: 'text',
      heading: 'The future fuel mix',
      body: 'The future fuel mix and the uptake of carbon-neutral fuels will be primarily influenced by regulatory policy and primary energy pricing. To fully decarbonise shipping, the use of carbon-neutral fuels will need to increase from the mid-2030s and reach a 40% share of the fuel mix by 2050, according to current IMO targets.\n\nBy mid-century, the use of fossil fuel oil with very low sulphate content (VLSFO), marine gas oil (LSMGO) and LNG will rapidly decline or be phased out altogether in the most ambitious decarbonisation scenarios. Until then, however, LNG will be widely used and account for 20-30% of the fuel mix, accelerating the shift to zero-carbon fuels.',
      image: imgEnergyPrice,
    },
    {
      kind: 'text',
      heading: 'Sustainable biomass & e-fuels',
      body: 'With sufficient supply of sustainable biomass, bio-LNG, bio-MGO and bio-methanol, which are very energy-rich hydrocarbons, would be the preferred fuels. Compared to bio-MGO and bio-LNG, the acceptance of bio-methanol is particularly dependent on production costs. Due to the limited supply of sustainable biomass, biofuel prices are expected to be higher than those for e-fuels and blue fuels.\n\nThe use of different forms of carbon neutral fuels is constrained by the availability of sustainable energy sources and raw materials for production. The supply of electric fuels depends on the availability of renewable energy to produce hydrogen.',
      image: imgSustainableBiomass,
    },
    {
      kind: 'text',
      heading: 'Working with major producers',
      body: 'Sonan Bunkers aims to work with major energy and fuel producers. We will ensure that shore power and infrastructure for storage and refuelling of vessels with future fuels are provided from a single source. We will also help early adopters and support the development of green energy corridors or supply chains and work with the various ports that play an important role in the transition to green shipping.',
    },
    {
      kind: 'feature-grid',
      heading: 'Our alternative fuel portfolio',
      items: [
        { title: 'Biofuels', href: '/our-services/alternative-fuels/biofuels/' },
        { title: 'LNG', href: '/our-services/alternative-fuels/lng/' },
        { title: 'Electricity Sales', href: '/our-services/alternative-fuels/electricity-sales/' },
      ],
    },
  ],
  siblings: servicesSiblings,
};

export const advisoryServicesPage: PageContent = {
  slug: '/our-services/advisory-services/',
  meta: {
    title: 'Advisory Services — Sonan Bunkers',
    description:
      'Our Advisory Services Team helps customers optimise their fuel procurement and management processes — from market analysis and forecasting to risk management and procurement strategy.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Advisory Services',
    sub: 'Vast shipping knowledge translated into market analysis, risk management, and procurement strategy for our customers.',
    image: heroAdvisoryServices,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Collaborating with our customers',
      body: 'Sonan Bunkers is always looking at new ways to collaborate with customers and we believe that with our vast shipping knowledge, our Advisory Services Team can provide valuable support and guidance to customers looking to optimise their fuel procurement and management processes.\n\nThese services can take many forms, including market analysis and forecasting, risk management and procurement strategy development.',
    },
    {
      kind: 'text',
      heading: 'Making informed fuel decisions',
      body: 'One key benefit of using our Advisory Service Team is that they can help customers to make informed decisions about their fuel purchases. This might include providing guidance on market trends and conditions, helping customers to identify the best times to buy fuel, or assisting with the development of long-term procurement strategies. Advisory services can also help customers to manage risk by providing guidance on how to mitigate the impact of volatility in fuel prices or other market conditions.',
    },
    {
      kind: 'text',
      heading: 'Optimising fuel usage & efficiency',
      body: 'In addition to providing guidance on fuel procurement and management, the Advisory Team can also help customers to optimize their fuel usage and improve efficiency. This might include providing recommendations on the best types of fuel to use, helping customers to identify opportunities to reduce fuel consumption, or assisting with the implementation of fuel-saving technologies.',
      cta: { label: 'Talk to our team', href: '/contact/' },
    },
  ],
  siblings: servicesSiblings,
};

export const contactPage: PageContent = {
  slug: '/contact/',
  meta: {
    title: 'Contact — Sonan Bunkers',
    description:
      'Get in touch with Sonan Bunkers — offices in London, Athens, Rotterdam, Oslo, Rio de Janeiro, Singapore, Dubai, and Panama.',
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
          email: 'london@sonanbunkers.com',
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
          email: 'athens@sonanbunkers.com',
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
          email: 'rotterdam@sonanbunkers.com',
        },
        {
          city: 'Oslo',
          code: 'OSL',
          region: 'Norway',
          addressLines: ['Grundingen 6,', 'Oslo', '0250', 'Norway'],
          email: 'oslo@sonanbunkers.com',
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
          email: 'rio@sonanbunkers.com',
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
          email: 'singapore@sonanbunkers.com',
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
          email: 'dubai@sonanbunkers.com',
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
          email: 'panama@sonanbunkers.com',
        },
      ],
    },
  ],
};

export const newsIndexPage: PageContent = {
  slug: '/press-room/news/',
  meta: {
    title: 'News — Sonan Bunkers Press Room',
    description:
      'Latest news from Sonan Bunkers — expansion announcements, industry analysis, sustainability updates, and milestones from across our worldwide offices.',
  },
  hero: {
    eyebrow: 'Press Room',
    headline: 'News',
    sub: 'Announcements, industry analysis, and milestones from the Sonan Bunkers team.',
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
            'Sonan Bunkers Expands into the Americas with the Launch of SONAN ENERGY Panama',
          slug: '/press-room/news/sonan-energy-panama-launch/',
          date: '10/1/2025',
          image: imgArticlePanama,
          excerpt:
            'Sonan Bunkers expands into the Americas with the launch of SONAN ENERGY PANAMA S.A. in Panama City. Led by industry veteran Hernán Ortiz, the new hub strengthens the company’s regional presence from Canada to Argentina and marks a key step in its transition toward cleaner marine energy solutions.',
        },
        {
          title:
            'Sonan Bunkers Secures Significant Funding to Propel Global Expansion',
          slug: '/press-room/news/hsbc-funding-increase-july-2024/',
          date: '7/29/2024',
          image: imgArticleHsbc,
          excerpt:
            'At Sonan Bunkers, we are thrilled to announce a major milestone in our journey towards global expansion. With the steadfast support of HSBC UK, our company is poised for significant growth, driven by a substantial funding increase that will enable us to meet rising demands and enhance our operations worldwide.',
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
    title: 'Privacy Policy — Sonan Bunkers',
    description:
      'Your privacy is important to us. It is Sonan Bunkers’ policy to respect your privacy regarding any information we may collect from you across our website, www.sonanbunkers.com and other sites we own and operate.',
  },
  hero: {
    eyebrow: 'Legal',
    headline: 'Privacy Policy',
    sub: 'Your privacy is important to us. It is Sonan Bunkers’ policy to respect your privacy regarding any information we may collect from you.',
    image: heroPrivacy,
  },
  sections: [
    // Full policy body lives in `src/pages/legal/privacy-policy.astro` (or a sibling
    // .md file) — it's far too long to mirror in this struct. We render the hero
    // here and then the page composes the long-form text directly.
    {
      kind: 'text',
      heading: 'About this policy',
      body: 'Your privacy is important to us. It is Sonan Bunkers’ policy to respect your privacy regarding any information we may collect from you across our website, www.sonanbunkers.com and other sites we own and operate. The full policy text — covering log data, cookies, third-party services, your data-protection rights, and contact details for our Data Protection Officer — is published below.',
    },
  ],
};

// ---------- registry ----------

export const allPages: Record<string, PageContent> = {
  '/': homePage,
  '/about-us/': aboutUsPage,
  '/about-us/your-marine-energy-provider/': marineEnergyPage,
  '/our-services/fuel-products/': fuelProductsPage,
  '/our-services/marine-lubricants/': marineLubricantsPage,
  '/our-services/alternative-fuels/': alternativeFuelsPage,
  '/our-services/advisory-services/': advisoryServicesPage,
  '/contact/': contactPage,
  '/press-room/news/': newsIndexPage,
  '/legal/privacy-policy/': privacyPolicyPage,
};
