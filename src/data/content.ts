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

/** Home-page service cards — image is optional until category photography is supplied. */
export const servicesCards: {
  label: string;
  href: string;
  blurb: string;
  image?: ImageMetadata;
}[] = [
  {
    label: 'Agriculture',
    href: '/our-services/agriculture/',
    blurb: 'Reliable irrigation systems from the pump to the plant — main, sub-main and laterals.',
  },
  {
    label: 'Landscape',
    href: '/our-services/landscape/',
    blurb: 'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.',
  },
  {
    label: 'Building & Infrastructure',
    href: '/our-services/building-infrastructure/',
    blurb: 'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.',
  },
  {
    label: 'Industry',
    href: '/our-services/industry/',
    blurb: 'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.',
  },
];

/** Sibling lists for the "About Us" sidebar nav. */
export const aboutSiblings: { label: string; href: string }[] = [
  { label: 'Corporate Profile', href: '/about-us/' },
  { label: 'History', href: '/about-us/history/' },
  { label: 'Company Structure', href: '/about-us/company-structure/' },
  { label: 'Vision, Mission & Values', href: '/about-us/vision-mission-values/' },
  { label: 'Quality & Certifications', href: '/about-us/quality-certifications/' },
];

/** Siblings used by the Contact sub-nav (mirrors aboutSiblings). */
export const contactSiblings: { label: string; href: string }[] = [
  { label: 'Local Network', href: '/contact/local/' },
  { label: 'Worldwide Network', href: '/contact/worldwide/' },
  { label: 'Elysée WISE', href: '/contact/wise/' },
  { label: 'Elysée PRIME', href: '/contact/prime/' },
  { label: 'Elysée Rohrsysteme', href: '/contact/rohrsysteme/' },
];

// ---------- per-page content ----------

export const homePage: PageContent = {
  slug: '/',
  meta: {
    title: 'Elysée — The Leading Green Company in Innovative & Smart Piping Systems',
    description:
      'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key Mediterranean location, serving 65+ destinations worldwide.',
  },
  hero: {
    headline: 'The leading green company',
    sub: 'With innovative and smart piping and fitting systems for water supply, irrigation, sewerage and energy.',
    image: heroHome,
    video: '/media/hero-elysee.mp4',
    cta: { label: 'discover Elysée', href: '/about-us/' },
    ctaSecondary: { label: 'EXPLORE OUR PRODUCTS', href: '/products/' },
  },
  sections: [
    {
      kind: 'text',
      eyebrow: 'Services',
      heading: 'Solutions across four sectors',
      body: "From the pump to the plant and from the building site to the industrial plant — Elysée's world-class products bring innovative and efficient solutions, tailored to each sector's specific demands.",
      image: imgServicesPanel,
      cta: { label: 'EXPLORE SECTORS', href: '/our-services/agriculture/' },
    },
    {
      kind: 'text',
      eyebrow: 'Green Elysée',
      heading: 'Streaming Water, Streaming Life',
      body: 'We are committed to protecting the earth in every possible way, making it a better place to live, while maintaining our business-driven innovation, green thinking, and continuous improvement. Our tag-line “Streaming Water, Streaming Life” synopsizes our beliefs and culture — it is the foundation of all principles and strategies that define Elysée.',
      image: imgCoreValues,
      cta: {
        label: 'DISCOVER GREEN ELYSÉE',
        href: '/green-elysee/',
      },
    },
    {
      kind: 'text',
      eyebrow: 'Innovation Matters',
      heading: 'Innovation Pillar',
      body: "Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy-to-use Piping Systems. Today's competitive perspective of Elysée highly relies on scientific and technical research and innovation activities.",
      image: imgResponsiblePartner,
      cta: { label: 'DISCOVER INNOVATION', href: '/innovation/why-innovation/' },
    },
    {
      kind: 'text',
      eyebrow: 'Knowledge & Experience',
      heading: 'With knowledge and experience',
      body: 'Founded in 1979, Elysée combines 40+ years of experience with continuous in-house R&D. We serve 65+ countries with 5000+ product codes, supported by 215+ team members. Our products are certified by DVGW, KIWA, WRAS, SII, OVGW, and the most reputable international standards organizations.',
      image: imgWeCare,
      cta: { label: 'LEARN MORE ABOUT US', href: '/about-us/' },
    },
    {
      kind: 'news-list',
      eyebrow: 'Latest from Elysée',
      heading: 'News & Updates',
      articles: [
        {
          title: 'Elysée launches new W.I.S.E. compression-fitting range',
          slug: '/insights/news/wise-compression-fittings-launch/',
          date: '10/1/2025',
          image: imgArticlePanama,
          excerpt:
            'Elysée expands its WISE (Worldwide, Innovative, Smart, Easy-to-use) product family with a new line of certified compression fittings, engineered to extend the established 40-year track record across European and Middle Eastern markets.',
        },
        {
          title: 'New distribution centre opens in Lebanon',
          slug: '/insights/news/lebanon-distribution-centre/',
          date: '7/29/2024',
          image: imgArticleHsbc,
          excerpt:
            'Following successful operations in Austria and Russia, Elysée opens a new distribution centre in Lebanon, strengthening our reach across the Middle East and supporting fast lead times for irrigation and infrastructure projects.',
        },
        {
          title: '45 years of Streaming Water, Streaming Life',
          slug: '/insights/news/45-year-anniversary/',
          date: '4/30/2024',
          image: imgArticleTenYear,
          excerpt:
            'On April 16, 2024 Elysée Irrigation marked 45 years since its founding in Nicosia. Read about our journey from premium-flower cultivation to a 65-country presence in piping systems.',
        },
      ],
    },
  ],
};

export const aboutUsPage: PageContent = {
  slug: '/about-us/',
  meta: {
    title: 'About Us — Elysée',
    description:
      'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, serving 65+ destinations.',
  },
  hero: {
    eyebrow: 'About Us',
    headline: 'Corporate Profile',
    sub: 'A family business founded in 1979 — manufacturing piping and irrigation systems for water supply, irrigation, sewerage and energy across more than 65 countries.',
    image: heroAboutUs,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Who we are',
      body: 'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at the crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.\n\nIt is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer-services staff, teamwork plays a huge part in the success of Elysée.',
    },
    {
      kind: 'text',
      heading: 'Years of experience',
      body: 'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and added to upgrade existing products, creating a consistently growing range. Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.',
    },
    {
      kind: 'feature-grid',
      heading: 'Discover more about Elysée',
      items: [
        {
          title: 'History',
          eyebrow: 'Our journey',
          body: 'From premium-flower cultivation in the 1970s to a 65-country presence today — the milestones that built Elysée.',
          href: '/about-us/history/',
          image: heroStreamingWater,
        },
        {
          title: 'Company Structure',
          eyebrow: 'How we are organized',
          body: 'The departments and divisions that keep Elysée operating across its production, distribution, and R&D activities.',
          href: '/about-us/company-structure/',
          image: heroStreamingWater,
        },
        {
          title: 'Vision, Mission & Values',
          eyebrow: 'What drives us',
          body: 'To be a green leader worldwide through Innovative, Smart, Easy-to-use Piping Systems — and the values that take us there.',
          href: '/about-us/vision-mission-values/',
          image: heroStreamingWater,
        },
        {
          title: 'Quality & Certifications',
          eyebrow: 'How we prove it',
          body: 'ISO 9001 since 1998, plus DVGW, KIWA, WRAS, SII and OVGW product certifications.',
          href: '/about-us/quality-certifications/',
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
    title: 'Agriculture — Elysée',
    description:
      "A reliable supplier of irrigation systems from the pump to the plant — Elysée's world-class products bring innovative and efficient solutions for open-field farming, greenhouses, and nurseries.",
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Agriculture',
    sub: 'A reliable supplier of irrigation systems from the pump to the plant. Main, sub-main and laterals.',
    image: heroFuelProducts,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Built for the field',
      body: "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements. Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.",
    },
    {
      kind: 'text',
      heading: 'Star products',
      body: 'Ledra (No. 182). PVC Riser 3" (No. 580). Adaptor Flanged Set (No. 330D). No. 2 (No. 442B). Single 4 Bolts (No. 550B). Venturi Injectors (No. 190). Coupling (No. 381). Mini Valve Gromet with Rubber × Dripline (No. 127D).',
      cta: { label: 'View the product catalogue', href: '/products/' },
    },
  ],
  siblings: servicesSiblings,
};

export const landscapePage: PageContent = {
  slug: '/our-services/landscape/',
  meta: {
    title: 'Landscape — Elysée',
    description:
      'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Landscape',
    sub: 'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.',
    image: heroMarineLubricants,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Designed for outdoor environments',
      body: 'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best. Our range covers micro-irrigation, sprinklers, control valves, and the pipework that ties it all together.',
    },
    {
      kind: 'text',
      heading: 'Specialist support, season after season',
      body: 'From large public-works contracts to private estates, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.',
      cta: { label: 'View the product catalogue', href: '/products/' },
    },
  ],
  siblings: servicesSiblings,
};

export const buildingInfrastructurePage: PageContent = {
  slug: '/our-services/building-infrastructure/',
  meta: {
    title: 'Building & Infrastructure — Elysée',
    description:
      'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects — certified to the most demanding European standards.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Building & Infrastructure',
    sub: 'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.',
    image: heroAlternativeFuels,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Pipe systems for the build',
      body: 'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects. Our products are certified to the most demanding European standards and proven across 40+ years of use in the field.',
    },
    {
      kind: 'text',
      heading: 'Long-term partnership on the project',
      body: 'From private developers to public-works programmes, we work alongside engineering teams to specify the right products for each site, recommend installation best practices, and stay engaged through commissioning.',
      cta: { label: 'View the product catalogue', href: '/products/' },
    },
  ],
  siblings: servicesSiblings,
};

export const industryPage: PageContent = {
  slug: '/our-services/industry/',
  meta: {
    title: 'Industry — Elysée',
    description:
      'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance — certified to ISO 9001 and carrying DVGW, KIWA, WRAS, SII, and OVGW certifications.',
  },
  hero: {
    eyebrow: 'Our Services',
    headline: 'Industry',
    sub: 'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.',
    image: heroAdvisoryServices,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Industrial-grade piping',
      body: 'Plastic pipes, fittings, and valves engineered for industrial uptime — including cable applications, network drainage, and building sewerage systems. Our products meet ISO 9001 quality standards and carry DVGW, KIWA, WRAS, SII, and OVGW certifications where applicable.',
    },
    {
      kind: 'text',
      heading: 'Continuity for plant operations',
      body: 'Industrial customers value continuity. We invest in operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change.',
      cta: { label: 'View the product catalogue', href: '/products/' },
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
    title: 'Privacy Policy — Elysée Irrigation Ltd',
    description:
      'How Elysée Irrigation Ltd collects, uses, and protects personal information from visitors to elysee.com.cy, in line with the EU General Data Protection Regulation (GDPR) and Cyprus data-protection law.',
  },
  hero: {
    eyebrow: 'Legal',
    headline: 'Privacy Policy',
    sub: 'How Elysée Irrigation Ltd collects, uses, and protects personal information you share with us through elysee.com.cy.',
    image: heroPrivacy,
  },
  sections: [
    {
      kind: 'text',
      body: 'Last updated: [LAST_UPDATED_DATE].\n\nThis Privacy Policy explains how Elysée Irrigation Ltd ("Elysée", "we", "us", or "our") collects, uses, discloses, and safeguards personal information you provide through elysee.com.cy (the "Site") or in the course of dealings with us. It applies to information about identifiable individuals and is written to meet our obligations under the EU General Data Protection Regulation (Regulation (EU) 2016/679, "GDPR") and the Cyprus Law providing for the Protection of Natural Persons with regard to the Processing of Personal Data (Law 125(I)/2018).\n\nBy using the Site, you confirm you have read and understood this Policy. If you do not agree with it, please do not use the Site.',
    },
    {
      kind: 'text',
      heading: 'Who we are',
      body: 'Elysée Irrigation Ltd is the data controller responsible for the personal information described in this Policy.\n\nRegistered office: [REGISTERED_OFFICE_ADDRESS], Cyprus.\nCompany registration number: [COMPANY_REG_NUMBER].\nGeneral contact: [GENERAL_CONTACT_EMAIL].\nData Protection Officer: [DPO_EMAIL].',
    },
    {
      kind: 'text',
      heading: 'What information we collect',
      body: 'We collect personal information in the following categories:\n\nInformation you give us directly. When you contact us through a form, by email, or by phone, we receive your name, email address, telephone number, company (if provided), and the content of your message.\n\nInformation we collect automatically. When you visit the Site, our servers and analytics providers record technical data such as your IP address, browser type and version, device and operating system, referring URL, pages visited, time and date of your visit, and time spent on each page. This information is used to operate, secure, and improve the Site.\n\nCookies. The Site uses cookies and similar technologies as described in the "Cookies and similar technologies" section below.\n\nWe do not knowingly collect special-category data (such as health, religion, or political opinions) through the Site, and we ask that you do not send such information to us through the contact channels.',
    },
    {
      kind: 'list',
      heading: 'Lawful bases for processing',
      intro: 'Under the GDPR, we only process your personal information where we have a lawful basis. The bases we rely on are:',
      items: [
        'Your consent — for example, when you accept non-essential cookies, or subscribe to a mailing list.',
        'Performance of a contract — when you ask us to provide products, services, or a quotation.',
        'Compliance with a legal obligation — for example, retaining invoices and tax records as required by Cyprus law.',
        'Our legitimate interests — to operate and secure the Site, respond to enquiries, and improve our products and services, where these interests are not overridden by your rights and freedoms.',
      ],
    },
    {
      kind: 'text',
      heading: 'How we use your information',
      body: 'We use the personal information we collect to: respond to enquiries and provide the information, quotes, or services you request; manage our customer and supplier relationships; operate, maintain, secure, and improve the Site; comply with our legal and regulatory obligations; and, where you have consented, send you marketing communications.\n\nWe do not use your information for automated decision-making that produces legal or similarly significant effects on you.',
    },
    {
      kind: 'text',
      heading: 'Cookies and similar technologies',
      body: 'A cookie is a small text file placed on your device when you visit a website. Cookies allow the Site to recognise your device and remember information such as preferences and previous actions.\n\nWe use the following categories of cookies:\n\nStrictly necessary cookies — required for the Site to function. These do not require your consent.\n\nAnalytics cookies — set by [ANALYTICS_PROVIDER] to help us understand how visitors use the Site. These are only set with your consent.\n\nYou can accept or refuse non-essential cookies through the cookie banner shown on your first visit, and change your choice at any time via [COOKIE_PREFERENCES_LINK]. You can also block or delete cookies through your browser settings; note that some parts of the Site may not function correctly if you do so.',
    },
    {
      kind: 'list',
      heading: 'Who we share your information with',
      intro: 'We do not sell your personal information. We share it only with the following categories of recipients, and only to the extent necessary:',
      items: [
        'Service providers acting as processors on our behalf — for example, our website hosting provider, email and CRM platforms, and analytics provider. Each is bound by a written contract to process your information only on our instructions.',
        'Professional advisers — such as lawyers, auditors, and insurers, where required for the establishment, exercise, or defence of legal claims.',
        'Competent public authorities — where we are required to disclose information by law, court order, or regulatory request.',
        'Successors in interest — in the event of a merger, acquisition, or reorganisation of our business, subject to appropriate confidentiality protections.',
      ],
    },
    {
      kind: 'text',
      heading: 'International transfers',
      body: 'Your personal information is primarily processed within the European Economic Area (EEA). Where a service provider processes information outside the EEA, we rely on the European Commission’s Standard Contractual Clauses, an adequacy decision, or another transfer mechanism recognised under the GDPR. You can request a copy of the safeguards we use by writing to [DPO_EMAIL].',
    },
    {
      kind: 'text',
      heading: 'How long we keep your information',
      body: 'We keep personal information only for as long as necessary for the purposes set out in this Policy, or as required by law.\n\nEnquiry and contact-form data: [ENQUIRY_RETENTION_PERIOD].\nCustomer and supplier records: for the duration of the relationship and for [COMMERCIAL_RECORDS_RETENTION_PERIOD] thereafter, in line with Cyprus tax and commercial law.\nWebsite server logs: [LOG_RETENTION_PERIOD].\n\nAt the end of the applicable period, we securely delete or anonymise the information.',
    },
    {
      kind: 'list',
      heading: 'Your rights under the GDPR',
      intro: 'Subject to the conditions set out in the GDPR, you have the right to:',
      items: [
        'Access — request confirmation that we hold personal information about you, and a copy of it.',
        'Rectification — ask us to correct inaccurate or incomplete information.',
        'Erasure — ask us to delete your information where one of the GDPR grounds applies.',
        'Restriction — ask us to limit how we use your information in certain circumstances.',
        'Data portability — receive the information you provided to us in a structured, commonly used, machine-readable format, or have it sent to another controller.',
        'Objection — object to processing based on our legitimate interests, including profiling, and to direct marketing at any time.',
        'Withdrawal of consent — where we rely on your consent, you may withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal.',
        'Complaint — lodge a complaint with the Office of the Commissioner for Personal Data Protection of the Republic of Cyprus (commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy) or with the supervisory authority in your country of residence.',
      ],
    },
    {
      kind: 'text',
      heading: 'Security',
      body: 'We use appropriate technical and organisational measures to protect personal information against unauthorised access, alteration, disclosure, or destruction. These include access controls, encryption in transit, secure hosting, and staff training. However, no method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.',
    },
    {
      kind: 'text',
      heading: 'Children’s privacy',
      body: 'The Site is not directed at children, and we do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information, please contact [DPO_EMAIL] and we will take steps to delete it.',
    },
    {
      kind: 'text',
      heading: 'Links to third-party sites',
      body: 'The Site may contain links to websites operated by third parties. We are not responsible for the privacy practices or the content of those sites. We encourage you to read the privacy policy of every website you visit.',
    },
    {
      kind: 'text',
      heading: 'Changes to this policy',
      body: 'We may update this Policy from time to time to reflect changes in our practices or in applicable law. The "Last updated" date at the top of this Policy indicates when it was most recently revised. Material changes will be brought to your attention through the Site or, where appropriate, by direct notice.',
    },
    {
      kind: 'text',
      heading: 'Contact us',
      body: 'If you have questions about this Policy or wish to exercise your rights, please contact our Data Protection Officer:\n\nElysée Irrigation Ltd — Data Protection Officer\n[REGISTERED_OFFICE_ADDRESS], Cyprus\nEmail: [DPO_EMAIL]\nTelephone: [DPO_PHONE]\n\nYou also have the right to lodge a complaint with the Office of the Commissioner for Personal Data Protection of the Republic of Cyprus — commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy.',
    },
  ],
};

export const termsOfUsagePage: PageContent = {
  slug: '/legal/terms-of-use/',
  meta: {
    title: 'Terms of Usage — Elysse Group',
    description:
      'The information appearing on this Web site is provided in good faith. Every attempt has been taken by Elysée Irrigation employees to ensure its accuracy.',
  },
  hero: {
    eyebrow: 'Legal',
    headline: 'Terms of Usage',
    image: heroPrivacy,
  },
  sections: [
    {
      kind: 'text',
      heading: 'Terms of Usage',
      body: 'The information appearing on this Web site is provided in good faith. Every attempt has been taken by Elysée Irrigation employees to ensure its accuracy.\n\nHowever, neither Elysée Irrigation nor any of its directors or employees gives any representation or warranty as to the reliability, accuracy or completeness of the information, nor do they accept any responsibility arising in any way (including negligence) for errors in, or omissions from, the information.\n\nAll content is copyright 2013 and any reproduction without the prior consent of Elysée Irrigation is prohibited.',
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
  '/legal/terms-of-use/': termsOfUsagePage,
};
