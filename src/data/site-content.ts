/**
 * Site content registry — one named export per route. Consumed by the per-page
 * .astro files via ContentPageLayout / ListPageLayout / DirectoryPageLayout.
 * Text is sourced verbatim from elysee.com.cy live pages (English version).
 */

export interface RichBlock {
  /** Paragraph of body copy. */
  kind: 'paragraph';
  text: string;
}

export interface HeadingBlock {
  kind: 'heading';
  level: 2 | 3;
  text: string;
}

export interface ListBlock {
  kind: 'list';
  ordered?: boolean;
  items: string[];
}

export interface CalloutBlock {
  kind: 'callout';
  title?: string;
  body: string;
}

export interface StatBlock {
  kind: 'stats';
  items: { label: string; value: string }[];
}

export interface TimelineBlock {
  kind: 'timeline';
  items: { year: string; title?: string; body: string }[];
}

export interface PillarsBlock {
  kind: 'pillars';
  intro?: string;
  items: { number: number; title: string; body: string }[];
}

export interface ValueListBlock {
  kind: 'valuelist';
  items: { label: string; body?: string }[];
}

export interface ImageBlock {
  kind: 'image';
  src: string;
  alt: string;
  caption?: string;
  ratio?: '4/3' | '16/9' | '1/1';
}

export interface ImageGridBlock {
  kind: 'imagegrid';
  intro?: string;
  columns?: 2 | 3 | 4;
  items: {
    title: string;
    body?: string;
    bullets?: string[];
    image: string;
    alt: string;
  }[];
}

export interface ProcessIconsBlock {
  kind: 'process-icons';
  items: { step: number; title: string; image: string; alt: string }[];
}

export interface PartnersBlock {
  kind: 'partners';
  items: { name: string; logo: string }[];
  cta?: { label: string; href: string };
}

export interface ProjectsBlock {
  kind: 'projects';
  heading?: string;
  items: {
    name: string;
    status: 'Ongoing' | 'Completed';
    duration: string;
    totalFunding: string;
    elyseeFunding?: string;
    description?: string;
    image: string;
    href?: string;
  }[];
}

export interface IdeaFormBlock {
  kind: 'idea-form';
  intro?: string;
  heroImage?: string;
  confidentialityTitle?: string;
  confidentialityBody?: string;
  generalSubmissionLabel?: string;
  generalSubmissionHref?: string;
}

export type ContentBlock =
  | HeadingBlock
  | RichBlock
  | ListBlock
  | CalloutBlock
  | StatBlock
  | TimelineBlock
  | PillarsBlock
  | ValueListBlock
  | ImageBlock
  | ImageGridBlock
  | ProcessIconsBlock
  | PartnersBlock
  | ProjectsBlock
  | IdeaFormBlock;

export interface ContentPage {
  /** Browser title + h1 source. */
  title: string;
  /** Optional eyebrow shown above h1 (e.g. parent section name). */
  eyebrow?: string;
  /** Optional subtitle shown directly under the h1. */
  subtitle?: string;
  /** Page body in document order. */
  blocks: ContentBlock[];
  /** Meta description for <head>. Defaults to first paragraph if absent. */
  metaDescription?: string;
  /** Optional path under /public — when set, the hero switches from the
   * flat brand band to a full-bleed cover image with parallax + wash. */
  heroImage?: string;
  /** Alt text paired with heroImage. */
  heroImageAlt?: string;
}

/** Office shape used by DirectoryPageLayout (contact pages). */
export interface Office {
  name: string;
  region?: string;
  address?: string;
  /** Postal code + district line, shown as the heading of the contact panel. */
  area?: string;
  /** Street line, shown with a location-pin icon in the contact panel. */
  street?: string;
  phone?: string;
  /** Secondary / direct line shown beneath the main phone. */
  phone2?: string;
  fax?: string;
  email?: string;
  hours?: string;
  notes?: string;
  /** Geographic position — centres the shop's Google map + marker. */
  lat?: number;
  lng?: number;
}

/** Funded research project detail page (/innovation/funded-research-projects/<slug>/). */
export interface ProjectDetail {
  slug: string;
  /** Mirrors ProjectsBlock.name — deliberately not `title`. */
  name: string;
  status: 'Ongoing' | 'Completed';
  duration: string;
  totalFunding: string;
  elyseeFunding?: string;
  partners?: string[];
  image: string;
  imageAlt: string;
  /** 1–2 sentence summary for meta description. */
  excerpt: string;
  blocks: ContentBlock[];
}

/** Innovation insights article detail page (/innovation/insights/<slug>/). */
export interface ArticleDetail {
  slug: string;
  title: string;
  category?: 'Innovation News' | 'Success Stories' | 'Activities';
  /** As shown on live site, e.g. '17-12-2025'. */
  date?: string;
  /** e.g. 'Dr. Andreas Gregoriou'. */
  author?: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  blocks: ContentBlock[];
}


/* =========================================================================
 * About Us pillar
 * ========================================================================= */

export const aboutUsCorporateProfile: ContentPage = {
  title: 'Corporate Profile',
  eyebrow: 'About Us',
  blocks: [
    { kind: 'heading', level: 2, text: 'Who we are' },
    {
      kind: 'paragraph',
      text:
        'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.',
    },
    {
      kind: 'paragraph',
      text:
        'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.',
    },
    {
      kind: 'paragraph',
      text:
        'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.',
    },
    { kind: 'heading', level: 2, text: 'Years of experience' },
    {
      kind: 'paragraph',
      text:
        'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.',
    },
    {
      kind: 'paragraph',
      text:
        'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.',
    },
    {
      kind: 'stats',
      items: [
        { label: 'Founded in', value: '1979' },
        { label: 'Employees', value: '215+' },
        { label: 'Product Codes', value: '5000+' },
        { label: 'Countries Worldwide', value: '65+' },
      ],
    },
    { kind: 'heading', level: 2, text: 'What makes Elysée stand out' },
    {
      kind: 'list',
      items: [
        'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.',
        'This product range has been proven in the field for forty years.',
        'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.',
        'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.',
      ],
    },
    {
      kind: 'callout',
      title: 'Streaming Water, Streaming Life',
      body:
        'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.',
    },
  ],
};

export const aboutUsHistory: ContentPage = {
  title: 'History',
  eyebrow: 'About Us',
  subtitle: 'A family business, built one decade at a time.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "It was a love of nature that led to the birth of our company, Elysée. With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East. And so, that was the start of this beautiful journey…",
    },
    {
      kind: 'paragraph',
      text:
        "Through this venture, the need to know more about irrigation became a priority. Back in the 1970s the new art of irrigation was on the rise, and the know-how was brought in to help Elysée grow world-class flowers.",
    },
    {
      kind: 'paragraph',
      text:
        "With our newly acquired knowledge of irrigation and irrigation needs, the next step was to move into irrigation trading, trading pipe fittings and then… into manufacturing them. So, in 1979, on 16 April, Elysée Irrigation was founded.",
    },
    {
      kind: 'callout',
      title: 'Streaming Water, Streaming Life',
      body:
        'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.',
    },
    { kind: 'heading', level: 2, text: 'Milestones' },
    {
      kind: 'timeline',
      items: [
        { year: '1979', title: 'Elysée Irrigation founded', body: 'Founded on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas. The first production facility was co-located with farming and flower preparation for the international markets — exciting times where the exploration of the unknown field of plastic manufacturing was hard but rewarding for a young company.' },
        { year: '1980', body: 'As early as 1980, the first export activities began, in the nearby markets of the Middle East — an area which at the time was only starting to utilize irrigation techniques.' },
        { year: '1989', body: 'Early success led to fast growth which demanded a dedicated industrial space. The current site in the Ergates Industrial Area was established. The product range at the time comprised a substantial series of drippers and sprinklers as well as an extensive range of compression fittings, saddles, and threaded fittings.' },
        { year: '1991', body: 'A piping system is never complete without a pipe, hence in 1991 a polyethylene pipe manufacturing unit was established at the Ergates site — Elysée could now offer a full water-supply solution. Its early success led to the extension of the range with PVC pipe manufacturing, entering the construction and infrastructure world.' },
        { year: '1998', body: 'An extensive range of products meant the quality-control division had to be formally established, leading to the certification of the company with ISO 9001 as early as 1998.' },
        { year: '2001', body: 'A new office building was erected to host the main offices of the company — until then located in central Nicosia — optimizing operations and preparing for the next step in expansion.' },
        { year: '2002', body: 'The first recognition of international activity for Elysée came with the Special Export Award. That same year, a new function was born within the company: the Research and Development department, leading the advancement of technology and improvement of the product range. Elysée was now a complete and modern company, investing significantly in the international market.' },
        { year: '2003 – 2016', body: 'The years that followed saw a major expansion in global reach and market coverage. Elysée products could be found on all 5 continents and in a steadily growing number of countries. A series of 4 further Export Awards (2003, 2008, 2012 and 2016) is a testimony to just that.' },
        { year: 'Today', body: 'Our international network of selected partners currently spans 65 markets, where Elysée is active in 4 sectors — Water Supply, Irrigation, Infrastructure and Energy. To respond directly to the changing needs of the global market, Elysée has expanded its operations by establishing 3 distribution centres in Austria, Russia, and Lebanon.' },
      ],
    },
    { kind: 'heading', level: 2, text: 'Where we are today' },
    {
      kind: 'stats',
      items: [
        { label: 'Markets served', value: '65' },
        { label: 'Sectors', value: '4' },
        { label: 'Export awards', value: '5' },
        { label: 'ISO 9001 since', value: '1998' },
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Our international network of selected partners spans 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by 3 distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.',
    },
    { kind: 'heading', level: 3, text: 'Where it started' },
    {
      kind: 'paragraph',
      text:
        'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:',
    },
    {
      kind: 'list',
      items: [
        'Drippers',
        'Sprinklers',
        'Compression fittings',
        'Saddles',
        'Threaded fittings',
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Enquiries and orders reach us through our wide network of local agents and sales representatives.',
    },
  ],
};

export const aboutUsVisionMissionValues: ContentPage = {
  title: 'Vision, Mission & Values',
  eyebrow: 'About Us',
  subtitle: 'What drives us, every day, in every market.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Our customers are at the heart of everything we do, so that is what we focus on. We design innovative piping solutions for easy installation, durability, and minimal maintenance — and we tailor them, through our expert advisors and OEM programmes, to the specific needs of each customer.',
    },
    { kind: 'heading', level: 2, text: 'Vision' },
    {
      kind: 'paragraph',
      text:
        'To be a green leader worldwide through Innovative, Smart, Easy-to-Use Piping Systems.',
    },
    { kind: 'heading', level: 2, text: 'Mission' },
    {
      kind: 'list',
      items: [
        'Develop W.I.S.E. Products to preserve water resources for future generations.',
        'Provide our Customers and Partners with a competitive edge.',
        'Lead our people to meet their full potential.',
        'Achieve sustainable and profitable company growth.',
        'Contribute to Society and the Environment, making Earth a better place to live.',
      ],
    },
    { kind: 'heading', level: 2, text: 'Values' },
    {
      kind: 'valuelist',
      items: [
        { label: 'Business-driven innovation' },
        { label: 'Green thinking' },
        { label: 'Customer commitment and value creation' },
        { label: 'Quality and continuous improvement' },
        { label: 'Respect each other and win as a team' },
        { label: 'Promote personal and professional growth' },
      ],
    },
  ],
};

export const aboutUsCompanyStructure: ContentPage = {
  title: 'Company Structure',
  eyebrow: 'About Us',
  subtitle: 'An efficient team built for quality and quick response.',
  blocks: [
    { kind: 'heading', level: 2, text: 'An Efficient Team' },
    {
      kind: 'paragraph',
      text:
        'With flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and we regularly upgrade existing products to create a constantly growing range.',
    },
    {
      kind: 'paragraph',
      text:
        'Our team of expert engineers and technical consultants is constantly available to offer technical advice to our clients on the use of Elysée\'s fittings and piping systems.',
    },
    {
      kind: 'paragraph',
      text:
        'We at Elysée realize that from a customer\'s perspective, the term "quality" covers both the product and the service. Our ever growing customer list reflects our determination to settle for nothing less.',
    },
    {
      kind: 'callout',
      title: 'Green Operations',
      body:
        'As a business, our green credentials are very important to us, and so our desire to innovate extends from our product development to our business processes. Implementing Lean Kaizen techniques has brought with it an increase in efficiency and a decrease in waste. We\'ve reduced our environmental impact by reducing our energy consumption and keeping the waste we send to landfill to a minimum. By increasing our efficiency, we\'re boosting our productivity and protecting our planet too.',
    },
    { kind: 'heading', level: 2, text: 'Our Divisions' },
    {
      kind: 'paragraph',
      text:
        'Elysée operates through three core production divisions, each focused on a specific area of manufacturing and quality assurance.',
    },
    { kind: 'heading', level: 3, text: 'Fittings Division' },
    {
      kind: 'paragraph',
      text:
        'Focusing on the production of pipe fittings and irrigation accessories, the Fittings Division manufactures over 1000 items in different sizes and for diverse applications, made of the most suitable raw materials in each case, from polypropylene to polyacetal and nylon.',
    },
    { kind: 'heading', level: 3, text: 'Pipes Division' },
    {
      kind: 'paragraph',
      text:
        'The division manufactures PVC and PE pipes with a diameter range of 5–315 mm, suitable for a wide range of practical applications.',
    },
    { kind: 'heading', level: 3, text: 'Quality Assurance Division' },
    {
      kind: 'paragraph',
      text:
        'The Quality Assurance Division is dedicated to implementing, sustaining and improving the quality at every level of production, from the raw material through to the finished product. With the aid of sophisticated equipment and apparatus, we can verify that the final products do in fact conform to national and international standards.',
    },
  ],
};

export const aboutUsQualityCertifications: ContentPage = {
  title: 'Quality & Certifications',
  eyebrow: 'About Us',
  subtitle: 'Quality, a matter of principle and practice.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Developed to the highest of standards, Elysée products are patented and engineered in-house in our own R&D department. Offering eco-friendly, corrosion-free, and easy-to-install solutions at great value prices, resulting in the highest level of customer satisfaction.',
    },
    {
      kind: 'paragraph',
      text:
        'Ever since our establishment, quality has been a major principle covering Elysée operations. By introducing a quality management system, we are able to monitor our activities and efficiency, in order to elevate our overall performance. Today Elysée Irrigation LTD proudly holds internationally renowned certificates of piping systems, a testimony of commitment to quality.',
    },
    {
      kind: 'callout',
      title: 'ISO 9001 since 1998',
      body:
        'Elysée achieved ISO 9001 certification in 1998 following the formal establishment of its quality-control division — a commitment to quality management that has been maintained and renewed continuously ever since.',
    },
    { kind: 'heading', level: 2, text: 'Certifications' },
    {
      kind: 'paragraph',
      text:
        'Elysée products are certified by the most reputable international standards organizations. Our portfolio is organised into six categories, mirroring the way our products reach the market.',
    },
    {
      kind: 'pillars',
      items: [
        { number: 1, title: 'Management System', body: 'ISO 9001 quality management — certified since 1998 and renewed continuously.' },
        { number: 2, title: 'General', body: 'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.' },
        { number: 3, title: 'Compression Fittings', body: 'Product certifications covering the full Elysée compression-fitting range for water-supply applications.' },
        { number: 4, title: 'PE Pipes', body: 'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.' },
        { number: 5, title: 'PVC Pipes', body: 'PVC pipe certifications for water-supply, drainage and infrastructure applications.' },
        { number: 6, title: 'Green Elysée', body: 'Environmental and sustainability certifications attached to the Green Elysée product line.' },
      ],
    },
  ],
};

/* =========================================================================
 * Green Elysée pillar
 * ========================================================================= */

export const greenElyseeAbout: ContentPage = {
  title: 'About Green Elysée',
  eyebrow: 'Green Elysée',
  heroImage: '/images/green-elysee/about-hero.jpg',
  heroImageAlt:
    'Sprinklers irrigating rows of lush green crops at sunset — streaming water, streaming life',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "One of Elysée's main concerns is the protection of the environment, hence, we always strive to minimize our Carbon Footprint. We are committed to protecting the earth in every possible way, making it a better place to live, while maintaining our business-driven innovation, green thinking, and continuous improvement. For this reason, we wish to pave the road for becoming a leading green company, with effective, sustainable, innovative, and smart piping and fitting systems.",
    },
    {
      kind: 'paragraph',
      text:
        'Here at Elysée, we acknowledge both the benefits and the challenges that leading a green company comes with, and we still remain fully committed to sustainability. Our tag-line "streaming water streaming life" synopsizes perfectly the organization\'s beliefs and culture. It is not just a phrase; it is the foundation of all principles and strategies that define Elysée.',
    },
    {
      kind: 'callout',
      title: 'Vision',
      body:
        'Be a Green Leader Worldwide through Innovative, Smart, Easy-to-Use piping systems.',
    },
    { kind: 'heading', level: 2, text: 'Elysée Strategy50' },
    {
      kind: 'paragraph',
      text:
        "Elysée acknowledges that businesses have a tremendous impact to climate change and can help in the fight against it. For this reason, we are setting a strategic approach to help us ultimately lead the way to a circular economy model, a testimony of our commitment to quality, towards the fulfillment of our goals for sustainability.",
    },
    {
      kind: 'paragraph',
      text:
        "Elysée has set a 10-year strategy that delineates the way we aim to achieve our vision50 by 2029, when the company will turn 50 years old. This strategy encompasses the company's set of actions which are grouped in 6 strategic directions or Pillars. Each one of the six Strategic Pillars is further broken down to discrete projects while each project has a specific aim and timeframe. One of the strategic pillars, #4 Green Elysée, is illustrative of the aspiration to be a Green Leader in the industry.",
    },
    {
      kind: 'pillars',
      intro: 'Green Economy Pillar 4 — six strategic components:',
      items: [
        { number: 1, title: 'Carbon Footprint', body: 'Quantifying our environmental impact.' },
        { number: 2, title: 'Green Energy', body: 'Investing in renewable energy and significantly reducing the energy intensity of our production facilities.' },
        { number: 3, title: 'Zero Waste', body: 'Achieving Zero-waste-to-landfill as well as diverting piping waste from landfills.' },
        { number: 4, title: 'Circular Economy', body: 'Philosophy, initiatives, and Green thinking.' },
        { number: 5, title: 'Green Circular Products & Technologies', body: 'High quality, safe, and innovative products, particularly circular products and technologies of circularity.' },
        { number: 6, title: 'Green Policy', body: 'Investing in emissions-offsetting projects.' },
      ],
    },
  ],
};

export interface GreenCertification {
  name: string;
  description: string;
  /** Path under /public for the local SVG badge. */
  logo: string;
  /** PDF download URL on elysee.com.cy. */
  href: string;
  /** Optional pull-quote shown on the certification card. */
  scope?: string;
}

export const greenCertificationItems: GreenCertification[] = [
  {
    name: 'ISO 14001',
    description: 'Environmental Management System',
    logo: '/images/certifications/iso-14001.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng-P3D42.pdf',
    scope: 'Systematic management of environmental responsibilities across all operations.',
  },
  {
    name: 'ISCC PLUS',
    description: 'International Sustainability and Carbon Certification',
    logo: '/images/certifications/iscc-plus.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/certificate-2025.pdf',
    scope: 'Traceability of sustainable and recycled raw materials through the supply chain.',
  },
  {
    name: 'ISO 14064-3:2019',
    description: 'Greenhouse Gas Validation and Verification',
    logo: '/images/certifications/iso-14064-3.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/iso14064-year-2024-qZNLq.pdf',
    scope: 'Independent verification of greenhouse-gas emission statements.',
  },
  {
    name: 'EMAS 2024',
    description: 'EU Eco-Management and Audit Scheme',
    logo: '/images/certifications/emas.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469.pdf',
    scope: 'Public environmental statement audited under EU EMAS Regulation.',
  },
  {
    name: 'CYS EN ISO 50001:2018',
    description: 'Energy Management System',
    logo: '/images/certifications/iso-50001.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473.pdf',
    scope: 'Continual improvement of energy performance across production sites.',
  },
  {
    name: 'Environmental Declaration 2024',
    description: 'Annual environmental performance report',
    logo: '/images/certifications/environmental-declaration.svg',
    href: 'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-11WmU.pdf',
    scope: 'Annual disclosure of environmental performance, audited and published.',
  },
];

export const greenElyseeCertifications: ContentPage = {
  title: 'Certifications',
  eyebrow: 'Green Elysée',
  subtitle: 'Committed to drive life in a Green future.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée proudly holds internationally recognized certificates, a testimony of commitment to drive life in a Green future, and its efforts to be as Green as it gets in all of its operations.',
    },
    {
      kind: 'paragraph',
      text:
        'Six independently audited standards cover the full Green Elysée programme — environmental management, energy, sustainability of raw materials, greenhouse-gas accounting, and the annual public Environmental Declaration. Every certificate is downloadable below.',
    },
  ],
};

export interface GreenReport {
  title: string;
  section?: string;
  year: string;
  description: string;
  /** Local PNG/JPG cover image in /public. */
  cover: string;
  /** Direct PDF download URL. */
  href: string;
}

export interface GreenEbook {
  title: string;
  year: string;
  description: string;
  /** Bullet contents shown on the ebook card. */
  contents: string[];
  /** Local cover image in /public. */
  cover: string;
  /** Optional link to a dedicated landing page on elysee.com.cy. */
  href?: string;
}

export const greenReportItems: GreenReport[] = [
  {
    title: 'Environmental Report 2024',
    section: '4.6 Green Policy',
    year: '2024',
    description:
      'Our Environmental Report 2024 documents progress against the "4.6 Green Policy" strategic direction — emissions offsetting, energy intensity reductions, and green policy implementation across all Elysée operations.',
    cover: '/images/green-elysee/environmental-report-2024-cover.png',
    href: 'https://elysee.com.cy/pdf/503130/download',
  },
];

export const greenEbookItems: GreenEbook[] = [
  {
    title: 'Green Elysée: Yearly Report 2021',
    year: '2021',
    description:
      'A comprehensive introduction to the Green Elysée pillar and Vision50 — structured around the six strategic components of Pillar 4: Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products & Technologies, and Green Policy.',
    contents: [
      'Introduction to the Green Elysée pillar and Vision50',
      'Carbon Footprint quantification methodology and results',
      'Green Energy renewable-investment progress',
      'Zero Waste: achieving zero-waste-to-landfill and diverting piping waste',
      'Circular Economy philosophy and practical initiatives',
      'Green Circular Products and Technologies development',
      'Green Policy and emissions-offsetting projects',
    ],
    cover: '/images/green-elysee/yearly-report-2021-cover.jpg',
    href: 'https://elysee.com.cy/green-elysee-yearly-report-2021',
  },
];

export const greenElyseeReports: ContentPage = {
  title: 'Reports & eBooks',
  eyebrow: 'Green Elysée',
  subtitle: 'Transparency through our published environmental reports.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée publishes its environmental performance annually. The Environmental Report covers our progress against the six strategic components of Pillar 4 — Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products, and Green Policy.',
    },
  ],
};

export interface InsightItem {
  title: string;
  date?: string;
  excerpt?: string;
  href?: string;
  image?: string;
  category?: 'Innovation News' | 'Success Stories' | 'Activities';
}

export const greenElyseeInsightsItems: InsightItem[] = [
  {
    title: 'Our journey to becoming a Green leader',
    excerpt:
      'The circular economy concept aims at reducing waste as much as possible — and, in effect, a product\'s life cycle is extended to the maximum. Our journey from compression fittings in 1979 to a six-pillar Green programme in 2026 is one of constant compounding: every certificate, every audit, every recycled tonne of resin earns the next.',
    image: '/images/green-elysee/journey-to-green-leader.jpg',
    href: '/press-room/news/',
  },
];

export const innovationInsightsItems: InsightItem[] = [
  {
    title: 'Industry 4.0 and Injection Molding Manufacturing Process',
    category: 'Innovation News',
    image: '/images/innovation/insights/industry-40.png',
    excerpt:
      'Injection molding, despite its long industrial history, continues to evolve towards improved dimensional accuracy, reduced energy consumption, and shorter production cycles. As one of the largest manufacturing sectors, it increasingly adopts Industry 4.0 technologies such as the Industrial Internet of Things (IIoT), machine learning, optimization techniques, and digital twins.',
    href: '/innovation/insights/industry-4-0-and-injection-molding-manufacturing-process/',
  },
  {
    title: 'Success Entrepreneur Stories',
    category: 'Success Stories',
    image: '/images/innovation/insights/success-stories.jpg',
    excerpt:
      'In 2007 was teaching students how to use a computer aided design software, while she was studying in Perth, Australia.',
    href: '/innovation/insights/success-entrepreneur-stories/',
  },
  {
    title: 'Overmolding Injection Molding Process',
    category: 'Innovation News',
    image: '/images/innovation/insights/overmolding.jpg',
    excerpt:
      'Overmolding is often called two-shot injection molding since it consists of molding of one material over other(s) forming a multilayer part.',
    href: '/innovation/insights/overmolding-injection-molding-process/',
  },
  {
    title: 'Micro Injection Molding',
    category: 'Innovation News',
    image: '/images/innovation/insights/micro-injection.jpg',
    excerpt:
      'Micro injection molding is a very accurate injection molding technique that is employed for the construction of very small parts.',
    href: '/innovation/insights/micro-injection-molding/',
  },
  {
    title: 'Gas-assisted Injection Molding',
    category: 'Innovation News',
    image: '/images/innovation/insights/gas-assisted.jpg',
    excerpt:
      "Gas-assisted injection molding was first proposed in 1970s, but it didn't gain commercial acceptance until 1990s.",
    href: '/innovation/insights/gas-assisted-injection-molding/',
  },
  {
    title: 'Exploiting AI Quality Control for Injection Molding Process Optimization',
    category: 'Innovation News',
    image: '/images/innovation/insights/ai-processes.jpg',
    excerpt:
      'Automatic in-line quality control is essential for the optimization of injection molding regarding the efficiency of the process and the quality of the produced parts.',
    href: '/innovation/insights/exploiting-ai-quality-control-for-injection-molding-process-optimization/',
  },
];

/* =========================================================================
 * Innovation insights — article detail pages
 * Sourced verbatim from elysee.com.cy article pages (crawled June 2026).
 * ========================================================================= */

export const innovationInsightDetails: ArticleDetail[] = [
  {
    slug: 'industry-4-0-and-injection-molding-manufacturing-process',
    title: 'Industry 4.0 and Injection Molding Manufacturing Process',
    category: 'Innovation News',
    date: '17-12-2025',
    author: 'Dr. Andreas Gregoriou, Research Engineer',
    image: '/images/innovation/insights/industry-40.png',
    imageAlt: 'Industry 4.0 and injection molding manufacturing process',
    excerpt:
      'Injection molding, despite its long industrial history, continues to evolve towards improved dimensional accuracy, reduced energy consumption, and shorter production cycles. As one of the largest manufacturing sectors, it increasingly adopts Industry 4.0 technologies such as the Industrial Internet of Things (IIoT), machine learning, optimization techniques, and digital twins.',
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Even though Injection Molding counts several decades of practice, it can be further improved in terms of products dimensional accuracy, less energy consumption and the reduction time cycle during the manufacturing. It is worth noting that Injection Molding constitutes the third largest manufacturing sector, raising the interest of researchers to evolve injection molding process to by employing emerging technologies such as Industrial Internet of Things (IIoT) and machine learning (ML) alongside with optimization techniques.',
      },
      {
        kind: 'paragraph',
        text:
          'The Injection Molding industry nowadays focuses on manufacturing of plastic products/components characterized by good quality while limiting the production cost. This is achieved by employing the smart manufacturing towards a digitalization concept (e.g Injection 4.0 as a part of Industry 4.0). More specifically, process parameters data are collected using Internet of Things (IoT). Briefly described, IoT is a network comprising sensors and relevant software for collecting and exchanging data over the internet. This data can be processed using Machine Learning (ML) and optimization techniques so that Injection Molding process parameters are refined at the end of the optimization process chain. All the above are part of the Industry 4.0 or fourth generation industry.',
      },
      {
        kind: 'image',
        src: '/images/innovation/insights/details/industry-40-1.jpg',
        alt: 'Industry 4.0 and injection molding — article figure 1',
      },
      { kind: 'paragraph', text: 'The goals of Industry 4.0 are the following:' },
      {
        kind: 'list',
        items: [
          'Smart factories that optimize their products and processes',
          'Higher productivity and efficiency',
          'Lower operational cost',
        ],
      },
      {
        kind: 'paragraph',
        text:
          'An interesting example of Industry 4.0 in actions is the usage of Digital Twins that consist of machine copies or factories intended for simulations. These simulations replicate the manufacturing processes -e.g Injection Molding-, with ultimate target the optimization of the entire manufacturing process and the products.',
      },
      {
        kind: 'image',
        src: '/images/innovation/insights/details/industry-40-2.jpg',
        alt: 'Industry 4.0 and injection molding — article figure 2',
      },
    ],
  },
  {
    slug: 'success-entrepreneur-stories',
    title: 'Success Entrepreneur Stories',
    category: 'Success Stories',
    date: '13-01-2025',
    image: '/images/innovation/insights/success-stories.jpg',
    imageAlt: 'Success entrepreneur stories',
    excerpt:
      'In 2007 was teaching students how to use a computer aided design software, while she was studying in Perth, Australia.',
    blocks: [
      { kind: 'heading', level: 2, text: 'Melanie Perkins of Canva' },
      {
        kind: 'paragraph',
        text:
          'In 2007 was teaching students how to use a computer aided design software, while she was studying in Perth, Australia. The software was expensive, complex and the teaching was lasting a semester, prompting her to explore simpler alternatives. She aimed to create an online, cheaper, and simpler software solution.',
      },
      {
        kind: 'paragraph',
        text:
          'Her idea was turned down by over 100 investors. However, three years later an investor embraced her concept. Today, 60 million of users exploit the capabilities of Canva across 190 countries.',
      },
      { kind: 'heading', level: 2, text: 'Adi Dassler of Adidas' },
      {
        kind: 'paragraph',
        text:
          'Dassler began his shoemaking career in his mother\'s washroom in Bavaria, Germany, with a goal to fabricate the best possible athletic shoes. His effort was based on the feedback that he was receiving from the athletes regarding their opinion about the shoes, pain points that could be improved and their feeling about his early shoes.',
      },
    ],
  },
  {
    slug: 'overmolding-injection-molding-process',
    title: 'Overmolding Injection Molding Process',
    category: 'Innovation News',
    date: '13-01-2025',
    image: '/images/innovation/insights/overmolding.jpg',
    imageAlt: 'Overmolding injection molding process',
    excerpt:
      'Overmolding is often called two-shot injection molding since it consists of molding of one material over other(s) forming a multilayer part.',
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Overmolding is often called two-shot injection molding since it consists of molding of one material over other(s) forming a multilayer part. The process involves injecting resin into a mold (substrate) to solidify, then using a second injection unit to apply resin over the already-hardened layer. Common applications include parts with rubber handles where rubber is injected over plastic substrates.',
      },
      {
        kind: 'image',
        src: '/images/innovation/insights/details/overmolding-concept.jpg',
        alt: 'Overmolding concept diagram',
        caption: 'Fig. 1 Overmolding concept',
      },
      { kind: 'heading', level: 2, text: 'Materials commonly used' },
      {
        kind: 'list',
        items: [
          'Acrylonitrile Butadiene Styrene (ABS)',
          'High-density Polyethylene (HDPE)',
          'Polyether Ether Ketone (PEEK)',
          'Polyamide (Nylon)',
          'Polycarbonate (PC)',
          'Polyethylene (PE)',
          'Polyetherimide (PEI)',
          'Polybutylene Terephthalate (PBTR)',
          'Acrylic (PMMA)',
          'Polyoxymethylene (POM)',
          'Polypropylene (PP)',
          'Silicone (SI)',
          'Thermoplastic Elastomers (TPE)',
          'Thermoplastic Polyurethane (TPU)',
          'Thermoplastic Rubber (TPR)',
        ],
      },
    ],
  },
  {
    slug: 'micro-injection-molding',
    title: 'Micro Injection Molding',
    category: 'Innovation News',
    date: '13-01-2025',
    image: '/images/innovation/insights/micro-injection.jpg',
    imageAlt: 'Micro injection molding',
    excerpt:
      'Micro injection molding is a very accurate injection molding technique that is employed for the construction of very small parts.',
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Micro injection molding is a very accurate injection molding technique that is employed for the construction of very small parts. The technique enables production of parts weighing under one gram. The process involves injection of a very small amount of resin into a mold under high pressure via syringe-sized injection machine, requiring precise control of injection pressure, flow rate, and temperature before cooling and solidification.',
      },
      {
        kind: 'image',
        src: '/images/innovation/insights/details/micro-injection-molding.jpg',
        alt: 'Micro injection molding setup',
        caption: 'Fig. 1 Micro Injection Molding setup',
      },
      { kind: 'heading', level: 2, text: 'Mold Design' },
      {
        kind: 'paragraph',
        text:
          'Because micro injection molding produces high-accuracy parts, mold construction requires precision tooling. The process employs CNC and EDM (Electrical Discharge Machining) for mold construction. The cooling process within the mold and removal of excess material are critical considerations.',
      },
      { kind: 'heading', level: 2, text: 'Appropriate Materials for Micro Injection Molding' },
      {
        kind: 'list',
        items: [
          'Thermoplastic Elastomers (TPEs)',
          'Polyoxymethylene (POM)',
          'Polycarbonate (PC)',
          'Polyether Ether Keton (PEEK)',
          'Liquid Silicon Rubber (LSR)',
        ],
      },
      { kind: 'heading', level: 2, text: 'Bibliography' },
      {
        kind: 'list',
        items: [
          'AcoMold. (2024, 4 2). Retrieved from The Complete Guide to Micro Injection Molding: Processes, Benefits, and Applications: https://www.acomold.com/micro-injection-molding.html',
        ],
      },
    ],
  },
  {
    slug: 'gas-assisted-injection-molding',
    title: 'Gas-assisted injection Molding',
    category: 'Innovation News',
    date: '13-01-2025',
    image: '/images/innovation/insights/gas-assisted.jpg',
    imageAlt: 'Gas-assisted injection molding',
    excerpt:
      "Gas-assisted injection molding was first proposed in 1970s, but it didn't gain commercial acceptance until 1990s.",
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Gas-assisted injection molding was first proposed in 1970s, but it didn\'t gain commercial acceptance until 1990s (Gas Assisted Injection Molding: Definition, Purpose, and Process, 2023). Even though the Gas Assisted Injection Molding gain acceptance in 1990s, it is considered as innovative solution for the forming of plastic parts.',
      },
      {
        kind: 'paragraph',
        text:
          'In Gas-assisted injection molding (GAIM), gas is guided through a nozzle or directly to the core of the part to be injected, and it flows through the hot sections of the polymer, forcing the latter to occupy the cavities of the mold. The gas can be injected prior and/or simultaneously with the polymer.',
      },
      {
        kind: 'image',
        src: '/images/innovation/insights/details/gas-assisted-injection.jpg',
        alt: 'Gas-assisted injection molding principle',
        caption: 'Fig. 1 Gas Assisted Injection Molding principle (Gas-assisted injection molding, 2024)',
      },
      {
        kind: 'paragraph',
        text:
          'The main advantages of the Gas-assisted injection molding over the conventional Injection molding technique, is the reduction in cycle times, material cost, residual stresses and allows molding of parts with larger projected areas and cross sections.',
      },
      { kind: 'heading', level: 2, text: 'Bibliography' },
      {
        kind: 'list',
        items: [
          'Clark, C. L. (1994). Overcoming process control challenges of gas-assisted injection molding. ANTEC Technical Papers, 540-543.',
          'Gas Assisted Injection Molding: Definition, Purpose, and Process. (2023, August).',
          'Gas-assisted injection molding. (2024, 4 5).',
          'Jong, D. R., Huang, J. S., & Chang, Y. S. (1996). Experimental studies of design guidelines for gas-assisrted injection molding process. ANTEC, 668-673.',
          'Koelling, K., Gauri, V., Tendulkar, M., Kaminski, R., & Becker, O. (1997). Understanding the controlling mechanisms of gas- assisted injection molding through visualization. ANTEC Technical Papers, 3697-3701.',
          'M.A, P. N., Lam, Y. C., & Tor, S. B. (2002). Gas-assisted injection molding: the effects of process variables and channel geometry. Materials Processing Technology, 27-35.',
          'S.Y. Yang, S. J. (1994). Experimental study on gas - assisted injection molding. ANTEC Technical Papers, 404-407.',
        ],
      },
    ],
  },
  {
    slug: 'exploiting-ai-quality-control-for-injection-molding-process-optimization',
    title: 'Exploiting AI quality control for the optimization of injection molding process',
    category: 'Innovation News',
    date: '18-05-2023',
    image: '/images/innovation/insights/ai-processes.jpg',
    imageAlt: 'AI quality control for injection molding process optimization',
    excerpt:
      'Automatic in-line quality control is essential for the optimization of injection molding regarding the efficiency of the process and the quality of the produced parts.',
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Automatic in-line quality control is essential for the optimization of injection molding, regarding the efficiency of the process and the quality of the produced parts. A fully automated injection molding closed loop has been developed by a group of researchers (Aminabadi, et al., 2022) for the optimization of Injection molding for the fabrication of specific plastic parts. For the optimization of the entire injection molding process, three crucial aspects were taken into account, comprising of part weight, dimensions and surface quality.',
      },
      {
        kind: 'paragraph',
        text:
          'A series of experiments were conducted in order to train eight artificial intelligence nodes. Afterwards, the generated models have been applied with controller to control the quality aspect the injection molding process. Through this study, the researchers achieved to control the injection molding process parameters in a manner that good surface quality and dimensional accuracy obtained.',
      },
      { kind: 'heading', level: 2, text: 'Bibliography' },
      {
        kind: 'list',
        items: [
          'Aminabadi, S. S., Tabatabai, P., Steiner, A., Gruber, D. P., Friesenbichler, W., Habersohn, C., & Berger-Weber, a. (2022). Industry 4.0 In-Line AI Quality Control of Plastic Injection Molded Parts. Polymers.',
        ],
      },
    ],
  },
];

/* =========================================================================
 * Innovation pillar
 * ========================================================================= */

export const innovationWhy: ContentPage = {
  title: 'Why Innovation',
  eyebrow: 'Innovation',
  subtitle: 'Innovation Matters',
  heroImage: '/images/innovation/why-innovation-hero.jpg',
  heroImageAlt:
    'Shafts of sunlight breaking through a corrugated industrial roof — the directional, forward-looking mood behind Elysée\'s innovation programme.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "At Elysée, innovation matters and is the major key to succeeding. We are highly inspired and motivated, intending to launch modern technologies and breakthrough product solutions in our application field. Elysée's vision is to be a green leader worldwide through Innovative, Smart, Easy to use Piping Systems. Today's competitive perspective of Elysée highly relies on scientific and technical research and innovation activities.",
    },
    {
      kind: 'paragraph',
      text:
        'The company is strategically looking for new ways to innovate and bring new solutions to the market suitable for improving the end-user experience. By being innovative, we act dynamically for the national economy, achieving our business leadership. Inventiveness — the key component of innovation — fosters monadic ideas.',
    },
    {
      kind: 'callout',
      body:
        'For an idea to be innovative, it must also be serviceable. Creative notions do not always drive innovation. The key is to find viable solutions to problems through inventive ideas.',
    },
    { kind: 'heading', level: 2, text: 'What is innovation?' },
    {
      kind: 'paragraph',
      text:
        "Innovation can be a product, service, business model, or strategy that's both inventive and serviceable in the end. The innovation strategy aims for breakthroughs in technology or new business models, as well as straightforward upgrades to customer service or modern features added to existing products.",
    },
    { kind: 'heading', level: 2, text: 'The importance of innovation' },
    {
      kind: 'imagegrid',
      columns: 3,
      items: [
        {
          title: 'Innovation in Business',
          image: '/images/innovation/why/innovation-in-business.png',
          alt: 'Innovation in business illustration',
          bullets: [
            'Ensure success',
            'Safeguard existing position in the market',
            'Pursue essential growth',
            'Improve competitive positioning',
          ],
        },
        {
          title: 'Disruptive',
          image: '/images/innovation/why/disruptive.png',
          alt: 'Disruptive innovation illustration',
          body:
            "Creation of additional market segments to serve a customer base the existing market doesn't reach. New-market disruption is always a challenge for Elysée.",
        },
        {
          title: 'Sustaining',
          image: '/images/innovation/why/sustaining.png',
          alt: 'Sustaining innovation illustration',
          body:
            'Improvement of processes and technologies of product lines. Elysée wants to stay atop its market.',
        },
      ],
    },
    { kind: 'heading', level: 2, text: 'Our four-step process' },
    {
      kind: 'process-icons',
      items: [
        { step: 1, title: 'Clarify', image: '/images/innovation/why/clarify.png', alt: 'Clarify icon' },
        { step: 2, title: 'Ideate', image: '/images/innovation/why/ideate.png', alt: 'Ideate icon' },
        { step: 3, title: 'Develop', image: '/images/innovation/why/develop.png', alt: 'Develop icon' },
        { step: 4, title: 'Execute', image: '/images/innovation/why/execute.png', alt: 'Execute icon' },
      ],
    },
  ],
};

export const innovationRD: ContentPage = {
  title: 'Research & Development',
  eyebrow: 'Innovation',
  subtitle: 'Investing in Research & Development.',
  heroImage: '/images/innovation/research-development-hero.jpg',
  heroImageAlt:
    'Additive manufacturing in progress — a 3D printer running alongside an on-screen CAD model, illustrating Elysée\'s prototyping and concept-development workflow.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'The R&D team contributes to the enhancement of all production stages, assuring productivity, design and development of products, procedure implementation and operational efficiency.',
    },
    { kind: 'heading', level: 2, text: 'Our R&D Disciplines' },
    {
      kind: 'imagegrid',
      columns: 3,
      items: [
        {
          title: 'Product Design and Development',
          image: '/images/innovation/rd/product-design-and-development.jpg',
          alt: 'Product design and development',
          body:
            'Given our position as "Green Leaders", our R&D department investigates new ideas for the development for our products. Our product development process follows a cyclical, multi-step process. Starting from conceptualization to the product deployment, the main goal of the process is to develop products according to customer requirements by covering current design and development issues. Such considerations include the identification of customer needs, design for manufacturing, prototyping and industrial design.',
        },
        {
          title: 'Market Research',
          image: '/images/innovation/rd/market-research.jpg',
          alt: 'Market research',
          body:
            "The viability of new services or products is validated partly through close cooperation with potential customers. Inputs regarding market trends and needs are provided to the R&D team from the company's marketing department. These include consumer demands, purchasing methods, product sales and the existence and development of technology across relevant markets.",
        },
        {
          title: 'Project Management',
          image: '/images/innovation/rd/project-management.jpg',
          alt: 'Project management',
          body:
            "Our project management system is made up of several frameworks and methods for organizing and monitoring a project's different stages. Our project management approach includes leading and collaborating with the team to complete the project on time and within budget. Usually, early in the development phase, the project documentation will include a description of this information. The three basic restrictions are budget, time, and scope.",
        },
        {
          title: 'IP Procedure, Patent Attorneys',
          image: '/images/innovation/rd/ip-procedure-patent-attorneys.jpg',
          alt: 'IP procedure and patent attorneys',
          body:
            'Upon coming up with unique idea, we consult specialist attorneys to determine if there are conflicts with existing IP. Assuming there are no conflicts, all necessary steps are taken with the support of legal specialists in order to filing for a patent with the relevant intellectual property offices.',
        },
        {
          title: 'Feasibility Studies',
          image: '/images/innovation/rd/feasibility-studies.jpg',
          alt: 'Feasibility studies',
          body:
            'Thorough feasibility studies provide detailed evaluations, which take into account all critical factors of our projects, forecasting their chances of being successful.',
        },
        {
          title: 'Concept Generation',
          image: '/images/innovation/rd/concept-generation.jpg',
          alt: 'Concept generation',
          body:
            'Idea generation often involves a collaborative effort after gathering all relevant information, such as user, marketing, and competition research. The methods for generating ideas appear. Such a process is brainstorming, a group problem-solving technique that encourages the unplanned development of original ideas and solutions.',
        },
        {
          title: 'Concept Evaluation',
          image: '/images/innovation/rd/concept-evaluation.jpg',
          alt: 'Concept evaluation',
          body:
            "Concept evaluation is a crucial phase in the R&D process, during which the customers' perceptions of a potential new product are analysed.",
        },
        {
          title: 'Concept Development',
          image: '/images/innovation/rd/concept-development.jpg',
          alt: 'Concept development',
          body:
            'Concept development and testing are both important phases, particularly for new items. It occurs at the very beginning of our projects to aid in the identification of problems and the development of our concepts by taking into consideration the important perceptions, user demands, and needs related to the product.',
        },
        {
          title: 'Proof of Concept',
          image: '/images/innovation/rd/proof-of-concept.jpg',
          alt: 'Proof of concept',
          body:
            'Following the Proof of Concept (PoC) methodology validates the viability and potential of innovative ideas to support the case for further development, with the end-goal of reaching full-scale production. Our robust PoC process enables us to identify potential technical and logistical issues which may hinder success.',
        },
        {
          title: 'Prototyping',
          image: '/images/innovation/rd/prototyping.jpg',
          alt: 'Prototyping',
          body:
            'Creating functional prototypes of new components and testing processes with conventional machining and additive manufacturing methods to ensure that functional requirements and technical standards are satisfied.',
        },
        {
          title: 'Advanced Metrology Systems',
          image: '/images/innovation/rd/advanced-metrology-systems.jpg',
          alt: 'Advanced metrology systems',
          body:
            '3D scanners, reverse engineering and smart measuring devices are used for the detailed measurement and analysis of our existing products and tooling, whether this involves the complete virtual 3D model reproduction of physical objects or simple measurements. This enables us to carry out corrective and improvement modifications to our existing products with a high degree of precision and accuracy, or design new products which are better than their predecessors.',
        },
        {
          title: 'Verification & Validation Through Testing',
          image: '/images/innovation/rd/verification-validation-through-testing.jpg',
          alt: 'Verification and validation through testing',
          body:
            'Upon materialising a new product, initial samples are verified and validated in close coordination with our QC department, in order to approve its production. During the production, checks by the QC team ensure products are produced to a high standard and superior quality.',
        },
      ],
    },
  ],
};

export const innovationFundedProjects: ContentPage = {
  title: 'Funded Research Projects',
  eyebrow: 'Innovation',
  subtitle: 'Advancing knowledge through collaborative research funding.',
  heroImage: '/images/innovation/funded-research-projects-hero.jpg',
  heroImageAlt:
    'A research laboratory bench laid out with scientific equipment — representing the academic and industrial collaborations behind Elysée\'s funded research projects.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée maintains an active portfolio of funded research initiatives in collaboration with academic institutions and industry partners, driving innovation and contributing to scientific advancement in our field.',
    },
    {
      kind: 'projects',
      heading: 'Ongoing Projects',
      items: [
        {
          name: 'Innova',
          status: 'Ongoing',
          duration: '1/8/2025 – 30/4/2026',
          totalFunding: '€196,125',
          image: '/images/innovation/projects/innova.png',
          description: "Active research initiative under Elysée's 2025–2026 portfolio.",
          href: '/innovation/funded-research-projects/innova/',
        },
        {
          name: 'AgReCOMPOSITES',
          status: 'Ongoing',
          duration: '2/5/2024 – 1/5/2026',
          totalFunding: '€598,046',
          elyseeFunding: '€221,130',
          image: '/images/innovation/projects/agrecomposites.png',
          description:
            "Falls under the Pillar I 'Smart Growth' that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes.",
          href: '/innovation/funded-research-projects/agrecomposites/',
        },
      ],
    },
    {
      kind: 'projects',
      heading: 'Completed Projects',
      items: [
        {
          name: 'PlantNGreen',
          status: 'Completed',
          duration: '01/02/2023 – 31/01/2025',
          totalFunding: '€574,142.25',
          elyseeFunding: '€222,878.25',
          image: '/images/innovation/projects/plantngreen.png',
          description:
            'Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation.',
          href: '/innovation/funded-research-projects/plantngreen/',
        },
      ],
    },
  ],
};

/* =========================================================================
 * Funded research projects — detail pages
 * Sourced verbatim from elysee.com.cy project pages (crawled June 2026).
 * ========================================================================= */

export const fundedProjectDetails: ProjectDetail[] = [
  {
    slug: 'innova',
    name: 'Innova',
    status: 'Ongoing',
    duration: '1/8/2025 – 30/4/2026',
    totalFunding: '€196,125',
    image: '/images/innovation/projects/innova.png',
    imageAlt: 'Innova project logo',
    excerpt:
      'The funded project introduces the development of a Next-Generation Mini Valve for irrigation systems, developed by Elysée Irrigation Ltd., combining two patented innovations for low-pressure irrigation applications.',
    blocks: [
      { kind: 'paragraph', text: 'Proposal Number: FTI/0325/0006' },
      { kind: 'heading', level: 2, text: 'Project Summary' },
      {
        kind: 'paragraph',
        text:
          'The funded project introduces the development of a Next-Generation Mini Valve for irrigation systems, developed by Elysée Irrigation Ltd. The project combines two patented innovations - the double injection molded sealing system and the Dripline quick-connection technology - to create an optimized irrigation product. The invention is intended for low-pressure irrigation applications and began on 1/8/2025 with a nine-month duration.',
      },
      { kind: 'heading', level: 2, text: 'Project Objectives' },
      {
        kind: 'list',
        items: [
          'Development of a Next-Generation Mini Valve for irrigation purposes',
          'Incorporation of two patented features held by Elysee Irrigation (Dripline connection feature and double injection molded sealing system)',
          'Outstanding performance metrics: higher flow, better mechanical properties, improved sealing at higher operating pressures',
        ],
      },
    ],
  },
  {
    slug: 'agrecomposites',
    name: 'AgReCOMPOSITES',
    status: 'Ongoing',
    duration: '2/5/2024 – 1/5/2026',
    totalFunding: '€598,046',
    elyseeFunding: '€221,130',
    image: '/images/innovation/projects/agrecomposites.png',
    imageAlt: 'AgReCOMPOSITES project logo',
    excerpt:
      'The project aims to the development of innovative and sustainable polymer composites in the form of novel plastic products mainly for irrigation and water supply.',
    blocks: [
      { kind: 'paragraph', text: 'Proposal Number: CODEVELOP-AG-SH-HE/0823/0140' },
      { kind: 'heading', level: 2, text: 'Project Summary' },
      {
        kind: 'paragraph',
        text:
          'The project AgReCOMPOSITES falls under the Pillar I \'Smart Growth\' that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes of the Research and Innovation Foundation (RIF), and it is fully compatible with S3CY \'Agriculture- Food Industry\' priority sector.',
      },
      { kind: 'paragraph', text: 'The Host Organization of the project is Elysee.' },
      {
        kind: 'paragraph',
        text:
          'Carbon-based polymer composites are replacing many conventional materials due to their enhanced thermomechanical properties in various applications. Although, carbon-based fillers, including carbon nanotubes, carbon nano-fibers and graphene that are typically employed as additives, are not environmentally and economically viable.',
      },
      {
        kind: 'paragraph',
        text:
          'Thus, one of the project objectives is to develop sustainable, cost- effective and environmentally viable polymer composites. The latter is going to be achieved by incorporating biochar-based fillers deriving from pyrolysis of agricultural and livestock wastes.',
      },
      {
        kind: 'paragraph',
        text:
          'The project aims to the development of innovative and sustainable polymer composites in the form of novel plastic products mainly for irrigation and water supply.',
      },
      { kind: 'heading', level: 2, text: 'Project Objectives' },
      {
        kind: 'paragraph',
        text:
          'The main objective of the AgReComposites project is the employment of biochar-based additives in Polypropylene (PP) and Polyethylene (PE) virgin thermoplastics and thermoplastic recyclates for the fabrication of \'green\' plastic pipes and fittings.',
      },
      {
        kind: 'paragraph',
        text:
          'Furthermore, another important objective, is the enhancement of an effective collaboration between enterprises and research community, that aims to identify challenges and to develop new sustainable solutions by implementing R&D projects.',
      },
      { kind: 'heading', level: 2, text: 'Funding Agencies' },
      {
        kind: 'paragraph',
        text:
          'The Project CODEVELOP-AG-SH-HE/0823/0140 is funded by the European Union - NextGenerationEU, through the Research and Innovation Foundation.',
      },
    ],
  },
  {
    slug: 'plantngreen',
    name: 'PlantNGreen',
    status: 'Completed',
    duration: '01/02/2023 – 31/01/2025',
    totalFunding: '€574,142.25',
    elyseeFunding: '€222,878.25',
    partners: [
      'University of Cyprus (UCY/HO) — Host Organisation',
      'Cyprus University of Technology (CUT/PA1)',
      'Elysee Irrigation Ltd. (Elysee/PA2)',
      'Advanced Materials Design & Manufacturing Limited / AmaDema (AMDM/PA3)',
    ],
    image: '/images/innovation/projects/plantngreen.png',
    imageAlt: 'PlantNGreen project logo',
    excerpt:
      'The primary objective of PlantNGreen is the development of innovative biodegradable nano/microfibrous "green" plant nursery bags, functionalized with selected plant growth promoters for use in ecological seedlings cultivation.',
    blocks: [
      {
        kind: 'paragraph',
        text:
          'Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation',
      },
      { kind: 'paragraph', text: 'Proposal Number: CODEVELOP-GT/0322/033' },
      { kind: 'heading', level: 2, text: 'Project Summary' },
      {
        kind: 'paragraph',
        text:
          'Plant nursery bags that are typically used in seedlings production mainly consist of low-density polyethylene which is a non-biodegradable plastic material. As a consequence, upon seedling planting, a large amount of plastic waste ends up in the environment. The primary objective of PlantNGreen is the development of innovative biodegradable nano/microfibrous "green" plant nursery bags that will further functionalized with selected plant growth promoters for use in ecological seedlings cultivation, thus promoting both, environmental protection and seedlings growth promotion. The implementation of this project will be based on a strong and effective collaboration to be established between the 2 public academic institutions in Cyprus and 2 local enterprises.',
      },
      { kind: 'heading', level: 2, text: 'Project Objectives' },
      {
        kind: 'paragraph',
        text:
          'PlantNGreen is fully compatible with the specific objectives of the CO-DEVELOP Programme and the Green Transition priority area, as well as with the Priority Sector (S3Cy) of \'\'Sustainable Growth-Environment\'\' an extremely important Sector of Priority.',
      },
      {
        kind: 'list',
        items: [
          'Host Organisation: University of Cyprus (UCY/HO)',
          'Cyprus University of Technology (CUT/PA1)',
          'Elysee Irrigation Ltd. (Elysee/PA2)',
          'Advanced Materials Design & Manufacturing Limited / AmaDema (AMDM/PA3)',
          'Expertise areas spanned: materials engineering, polymer processing/electrospinning, plant physiology, irrigation systems',
        ],
      },
      {
        kind: 'paragraph',
        text:
          'This inter-disciplinary partnership ensures the successful project implementation resulting to a highly significant research/technological output.',
      },
      { kind: 'heading', level: 2, text: 'Funding Agencies' },
      {
        kind: 'paragraph',
        text:
          'The Project CODEVELOP-GT/0322/033 is funded by the European Union - NextGenerationEU, through the Research and Innovation Foundation.',
      },
    ],
  },
];

export const innovationNetworkPartners: ContentPage = {
  title: 'Network & Partners',
  eyebrow: 'Innovation',
  subtitle: 'Building strong partnerships in academic and industrial sectors.',
  heroImage: '/images/innovation/network-partners-hero.jpg',
  heroImageAlt:
    'Modern research-building facade with transparent glazing — symbolising the open academic and industrial network that supports Elysée\'s innovation programme.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'At Elysée, we strongly believe in partnerships to attempt research, technological development and innovation opportunities in both academic and industrial sectors, enhancing new insights and solutions for our customers.',
    },
    {
      kind: 'paragraph',
      text:
        'Additionally, Elysée is highly motivated to tackle the enormous environmental challenges ahead by implementing strategic plans to reduce energy consumption and CO2 emissions and improve production efficiency.',
    },
    { kind: 'heading', level: 2, text: 'Our Partners' },
    {
      kind: 'partners',
      cta: { label: 'Join our Network & Become a Partner', href: '/innovation/innovate-with-us/' },
      items: [
        { name: 'University of Cyprus', logo: '/images/innovation/partners/university-of-cyprus.png' },
        { name: 'Cyprus University of Technology', logo: '/images/innovation/partners/cyprus-university-of-technology.png' },
        { name: 'Frederick University', logo: '/images/innovation/partners/frederick-university.png' },
        { name: 'Frederick Research Center', logo: '/images/innovation/partners/frederick-research-center.png' },
        { name: 'Department of Environment', logo: '/images/innovation/partners/department-of-environment.png' },
        { name: 'CYS — Cyprus Organisation for Standardisation', logo: '/images/innovation/partners/cys.png' },
        { name: 'OEB — Cyprus Employers and Industrialists Federation', logo: '/images/innovation/partners/oeb.png' },
        { name: 'Agriculture Research Institute', logo: '/images/innovation/partners/agriculture-research-institute.png' },
        { name: 'Department of Forests', logo: '/images/innovation/partners/department-of-forests.png' },
        { name: 'Water Board of Nicosia', logo: '/images/innovation/partners/water-board-of-nicosia.png' },
        { name: 'KIOS Research and Innovation Center of Excellence', logo: '/images/innovation/partners/kios.png' },
        { name: 'CyRIC', logo: '/images/innovation/partners/cyric.jpg' },
        { name: 'Simlead', logo: '/images/innovation/partners/simlead.png' },
        { name: 'CNE', logo: '/images/innovation/partners/cne.png' },
        { name: 'S.E.R.G', logo: '/images/innovation/partners/serg.png' },
        { name: 'AmaDema', logo: '/images/innovation/partners/amadema.png' },
        { name: 'KTV Green Enterprises', logo: '/images/innovation/partners/ktv-green-enterprises.png' },
        { name: 'AgroTech Innovations', logo: '/images/innovation/partners/agrotech-innovations.png' },
      ],
    },
  ],
};

/* =========================================================================
 * Products — Catalogues & Leaflets
 * Sourced from elysee.com.cy/catalogues-leaflets-en (May 2026).
 * PDFs are gated behind a contact/request form on the live site;
 * no direct download URLs are publicly exposed — hrefs left undefined.
 * ========================================================================= */

export const productCataloguesItems: InsightItem[] = [
  {
    title: 'A — Compression Fittings',
    excerpt: 'Technical catalogue for the Compression Fittings range.',
  },
  {
    title: 'B — Hydraulic Fittings',
    excerpt: 'Technical catalogue for the Hydraulic Fittings range.',
  },
  {
    title: 'C — Saddles',
    excerpt: 'Technical catalogue for the Saddles range.',
  },
  {
    title: 'D — Light-Weight Fittings',
    excerpt: 'Technical manual for landscape and irrigation systems.',
  },
  {
    title: 'E — Valves',
    excerpt: 'Technical catalogue for the Valves range.',
  },
  {
    title: 'F — Filters & Dosers',
    excerpt: 'Technical catalogue for Filters and Dosers.',
  },
  {
    title: 'G — Micro Irrigation & Sprinklers',
    excerpt: 'Technical catalogue covering micro-irrigation and sprinkler products.',
  },
  {
    title: 'H — Turf',
    excerpt: 'Technical catalogue for the Turf irrigation range.',
  },
  {
    title: 'I — Polyethylene Pipes & Soft Hoses',
    excerpt: 'Technical catalogue for polyethylene pipes and soft hoses.',
  },
  {
    title: 'PE — Polyethylene Pipes',
    excerpt: 'Technical manual for the full polyethylene pipe range.',
  },
];

/* =========================================================================
 * Insights section — 5 list pages
 * Sourced verbatim from elysee.com.cy (May 2026).
 * ========================================================================= */

export const insightsNewsItems: InsightItem[] = [
  {
    title: 'The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings',
    excerpt:
      'ZEEFLEX fittings by Elysée offer a reliable, leak-free solution for connecting flexible PVC pool hoses. Designed for 50 mm and 63 mm hoses, they combine easy installation with exceptional durability in demanding pool environments.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'Meet the New and Improved Elysée Zero Force Range',
    excerpt:
      'The new Elysée Zero Force range (75mm–110mm) has been upgraded with refined technology designed to make pipe installation faster, easier and more efficient. Its innovative semi push-fit system allows installers to insert pipes with zero insertion force after loosening the cap just one turn.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer!',
    excerpt:
      'The Elysée Global Transition Range offers a universal solution for connecting different pipe materials, eliminating the need for multiple adapters and simplifying installations.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'Elysée Irrigation Certified as a Great Place To Work®',
    excerpt:
      'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment.',
    href: undefined,
    image: undefined,
  },
];

export const insightsExhibitionsItems: InsightItem[] = [
  {
    title: 'Elysée at EIMA International 2026: Meet Us in Bologna!',
    date: 'Nov 2026',
    excerpt:
      'Elysée will participate in EIMA International 2026, one of the world\'s leading exhibitions for agricultural and irrigation technology. Visit us at Hall 21, Stand B28 at Fiere Expo Center in Bologna, 10–14 November 2026.',
    href: '/insights/exhibitions/elysee-at-eima-international-2026-meet-us-in-bologna/',
    image: '/images/insights/exhibitions/eima-2026.png',
  },
  {
    title: 'EIMA 2022',
    date: 'Nov 2022',
    excerpt:
      'Elysée Irrigation was present at EIMA Exhibition in Bologna, Italy, 9–13 November 2022.',
    href: '/insights/exhibitions/eima-2022/',
    image: '/images/insights/exhibitions/eima-2022-signature.jpg',
  },
  {
    title: 'Internationale Gartenbaumesse Tulln',
    date: 'Sep 2021',
    excerpt:
      'Elysée participated in the Internationale Gartenbaumesse Tulln, 2–6 September 2021.',
    href: '/insights/exhibitions/internationale-gartenbaumesse-tulln/',
    image: undefined,
  },
  {
    title: 'EIMA 2021',
    date: 'Oct 2021',
    excerpt:
      'Elysée was present at EIMA 2021 in Bologna, Italy, 19–23 October 2021, Stand B25 Hall 22.',
    href: '/insights/exhibitions/eima-2021exhibition/',
    image: undefined,
  },
  {
    title: 'MCE Mostra Convegno',
    excerpt:
      'Elysée exhibited at MCE Mostra Convegno, Stand No. L69, Pavilion 14.',
    href: '/insights/exhibitions/mce-mostra-convegno/',
    image: undefined,
  },
  {
    title: 'Big 5 Exhibition',
    excerpt:
      'Elysée was present at the Big 5 in Dubai, Stand No. A120, Maktoum Hall.',
    href: '/insights/exhibitions/big-5-exhibition/',
    image: undefined,
  },
];


export const insightsMediaItems: InsightItem[] = [
  {
    title: 'Elysée 40 Year Anniversary Event',
    excerpt:
      'Video recording of the Elysée 40 Year Anniversary Event, celebrating four decades of manufacturing and innovation in piping and irrigation systems.',
    href: '/insights/media/elysee-40-year-anniversary-event/',
    image: '/images/insights/media/elysee-40-year-anniversary-event.jpg',
  },
  {
    title: 'European Business Award 2014',
    excerpt:
      'Video coverage of Elysée receiving the European Business Award 2014, recognising excellence in European business.',
    href: '/insights/media/european-business-award-2014/',
    image: '/images/insights/media/european-business-award-2014.jpg',
  },
  {
    title: 'CYBC Documentary about Innovation in Cyprus — Elysée Irrigation',
    excerpt:
      'Cyprus Broadcasting Corporation documentary featuring Elysée Irrigation as a case study of innovation in Cypriot industry.',
    href: '/insights/media/cybc-documentary-innovation-in-cyprus/',
    image: '/images/insights/media/cybc-documentary-innovation-in-cyprus.jpg',
  },
];


export const insightsEbooksItems: InsightItem[] = [
  {
    title: 'Green Elysée: Yearly Report 2021',
    excerpt:
      'Introduction to the "Green Elysée" pillar and Vision50, covering carbon footprint quantification, green energy investments, zero waste achievements, circular economy philosophy, green circular products and technologies, and green policy emissions offsetting.',
    href: '/insights/ebooks/green-elysee-yearly-report-2021/',
    image: '/images/insights/ebooks/green-elysee-yearly-report-2021.jpg',
  },
  {
    title: 'Environmental Report 2020',
    excerpt: 'Elysée\'s Environmental Report 2020, available as a direct PDF download.',
    href: '/insights/ebooks/environmental-report-2020/',
    image: '/images/insights/ebooks/environmental-report-2020.png',
  },
];


export const innovationInnovateWithUs: ContentPage = {
  title: 'Innovate with us',
  eyebrow: 'Innovation',
  subtitle: 'Ready for your exceptional ideas.',
  heroImage: '/images/innovation/innovate-with-us-hero.jpg',
  heroImageAlt:
    'A hand sketching a concept on paper — the first step of any idea Elysée co-develops with external inventors and partners.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "We innovate with partners, concentrating on exceptional ideas related to disruptive technologies. Are you working on something valuable that could match our field? Let's join forces to turn your breakthrough concept into a market-ready reality. Reach out to our team with a brief overview of your project and let's explore how we can shape the future together.",
    },
    {
      kind: 'idea-form',
      heroImage: '/images/innovation/innovate/hero-illustration.png',
      confidentialityTitle: 'Confidentiality',
      confidentialityBody:
        'We only need basic information in your initial submission and will not ask for any details that compromise confidentiality. We could establish a separate confidentiality agreement with you before asking you to share any confidential information.',
      generalSubmissionLabel: 'Make a general technical submission',
      generalSubmissionHref: 'mailto:info@elysee.com.cy?subject=General%20technical%20submission',
    },
  ],
};

/* =========================================================================
 * Contact directories
 * ========================================================================= */

export const localOffices: Office[] = [
  {
    name: 'Ergates Head Office',
    region: 'Nicosia',
    address: '5 Pentadaktylou Street\n2643 Ergates Industrial Area\nNicosia, Cyprus',
    phone: '+357 22 455 000',
    fax: '+357 22 455 055',
    email: 'info@elysee.com.cy',
  },
  {
    name: 'Strovolos Nicosia',
    region: 'Nicosia',
    area: '2032, Strovolos Nicosia',
    street: '32 Solomou Solomou Street',
    phone: '+357 22 455 100',
    phone2: '+357 22 317 913',
    hours: 'Monday–Friday 07:00–13:00 & 13:30–16:30\nSaturday 07:30–13:00',
    lat: 35.138,
    lng: 33.337,
  },
  {
    name: 'Ergates Nicosia',
    region: 'Nicosia',
    area: '2643, Ergates Industrial Area',
    street: '5 Pentadaktylou Street',
    phone: '+357 22 455 006',
    phone2: '+357 22 455 055',
    hours: 'Monday–Friday 07:30–16:00\nSaturday 07:30–12:30',
    lat: 35.045,
    lng: 33.248,
  },
  {
    name: 'Larnaca',
    region: 'Larnaca',
    area: '7101, Aradippou Industrial Area',
    street: '9 Acropoleos Street',
    phone: '+357 24 847 999',
    phone2: '+357 24 641 089',
    hours: 'Monday–Friday 07:30–16:00',
    lat: 34.952,
    lng: 33.588,
  },
  {
    name: 'Frenaros',
    region: 'Famagusta district',
    area: '5350, Frenaros Industrial Area',
    street: '9 Kavalou Street',
    phone: '+357 23 847 999',
    phone2: '+357 23 743 773',
    hours: 'Monday–Friday 07:30–16:00\nSaturday 07:30–12:30',
    lat: 35.043,
    lng: 33.913,
  },
  {
    name: 'Limassol',
    region: 'Limassol',
    area: '4101, Agios Athanasios Industrial Area',
    street: '3 Iapetou Street',
    phone: '+357 25 847 999',
    phone2: '+357 25 722 033',
    hours: 'Monday–Friday 07:30–16:00\nSaturday 07:30–12:30',
    lat: 34.706,
    lng: 32.997,
  },
  {
    name: 'Paphos',
    region: 'Paphos',
    area: '8300, Konia Paphos',
    street: 'Dimokratias Avenue',
    phone: '+357 26 847 999',
    phone2: '+357 26 962 122',
    hours: 'Monday–Friday 07:30–16:00',
    lat: 34.790,
    lng: 32.452,
  },
];

export const worldwideOffices: Office[] = [
  {
    name: 'Export Department',
    region: 'Cyprus (Head Office)',
    phone: '+357 22 455 008',
    email: 'yerolemos@elysee.com.cy',
    notes: 'Fax: +357 22 455 055 | Export Manager',
  },
];

/* =========================================================================
 * Contact — Sub-brand pages
 * ========================================================================= */

export const subBrandWise: ContentPage = {
  title: 'Elysée WISE',
  eyebrow: 'Contact Us',
  subtitle: 'Elysée\'s subsidiary company in Lebanon, manufacturing Polyethylene pipes.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée WISE is Elysée\'s subsidiary company based in Lebanon. It mainly focuses on manufacturing Polyethylene pipes.',
    },
    { kind: 'heading', level: 2, text: 'About Elysée WISE' },
    {
      kind: 'paragraph',
      text:
        'Operating from the Byblos–Gherfine area, Elysée WISE brings Elysée\'s manufacturing expertise to the Lebanese market and the wider region, producing high-quality PE pipes in line with the group\'s standards.',
    },
    {
      kind: 'callout',
      title: 'Get in touch',
      body:
        'Address: Byblos – Gherfine - Main Road, Lebanon\nPhone: 00961 9 624551\nEmail: sales@elyseewise.com\nWebsite: www.elyseewise.com',
    },
  ],
};

export const subBrandPrime: ContentPage = {
  title: 'Elysée PRIME',
  eyebrow: 'Contact Us',
  subtitle: 'Elysée\'s subsidiary company in Egypt, manufacturing irrigation hoses of various kinds.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée PRIME is Elysée\'s subsidiary company based in Egypt. It mainly focuses on manufacturing irrigation hoses of various kinds.',
    },
    { kind: 'heading', level: 2, text: 'About Elysée PRIME' },
    {
      kind: 'paragraph',
      text:
        'Located in the Al Tajamouat Industrial Park in the 10th of Ramadan City, Elysée PRIME serves regional markets with a broad range of irrigation hose products manufactured to the group\'s quality standards.',
    },
    {
      kind: 'callout',
      title: 'Get in touch',
      body:
        'Address: 3T15 Al Tajamouat Industrial Park, 10th of Ramadan, Egypt\nPhone: +2 012 8901 1102\nEmail: info@elyseeprime.com\nWebsite: www.elyseeprime.com',
    },
  ],
};

export const subBrandRohrsysteme: ContentPage = {
  title: 'Elysée Rohrsysteme',
  eyebrow: 'Contact Us',
  subtitle: 'Elysée\'s subsidiary company in Austria, serving European countries.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Elysée Rohrsysteme is Elysée\'s subsidiary company based in Austria. It mainly focuses on serving the European countries.',
    },
    { kind: 'heading', level: 2, text: 'About Elysée Rohrsysteme' },
    {
      kind: 'paragraph',
      text:
        'Based in Ennsdorf bei Enns, Austria, Elysée Rohrsysteme operates as the group\'s distribution and representation hub for European markets, bringing Elysée\'s piping and irrigation systems to customers across the continent.',
    },
    {
      kind: 'callout',
      title: 'Get in touch',
      body:
        'Address: Wirtschaftspark Straße 3 / 4 A-4482 Ennsdorf bei Enns, Austria\nPhone: +43/ (0) 7223 - 82700-18\nEmail: info@elysee-rohrsysteme.com\nWebsite: www.elysee-rohrsysteme.com',
    },
  ],
};

export const contactCareers: ContentPage = {
  title: 'Careers',
  eyebrow: 'Contact Us',
  subtitle:
    'Build your career with Elysée — engineering, manufacturing, R&D, and commercial roles across Cyprus, Lebanon, Egypt and Austria.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'Since 1968 Elysée has grown from a single Cypriot workshop into a four-country group of piping and irrigation specialists. The people behind that growth — engineers, machine operators, quality technicians, sales managers, R&D scientists — are what we hire for, not the seat we put them in.',
    },
    { kind: 'heading', level: 2, text: 'Why Elysée' },
    {
      kind: 'paragraph',
      text:
        'We invest in long careers, not short stints. Joining the group means working alongside materials labs in Strovolos, hose extrusion lines in the 10th of Ramadan, distribution teams in Ennsdorf, and PE manufacturing in Byblos — with internal moves between subsidiaries treated as a feature, not an exception.',
    },
    {
      kind: 'callout',
      title: 'How to apply',
      body:
        'Address: 7 Vasileos Konstantinou, 2008 Strovolos, Nicosia, Cyprus\nPhone: +357 22 462 462\nEmail: recruitment@elysee.com.cy\nWebsite: www.elysee.com.cy',
    },
  ],
};
