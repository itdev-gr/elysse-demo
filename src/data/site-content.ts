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

export type ContentBlock =
  | HeadingBlock
  | RichBlock
  | ListBlock
  | CalloutBlock
  | StatBlock
  | TimelineBlock
  | PillarsBlock
  | ValueListBlock;

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
}

/** Office shape used by DirectoryPageLayout (contact pages). */
export interface Office {
  name: string;
  region?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  notes?: string;
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
        "The company's origins trace to founder Antonis Protopapas, who possessed a love of nature and an agricultural background with a physics education. His initial vision focused on cultivating premium flowers in the Middle East. During the 1970s, irrigation knowledge became essential to the flower business, which led to trading irrigation supplies, then to manufacturing.",
    },
    {
      kind: 'timeline',
      items: [
        { year: '1979', title: 'Elysée Irrigation founded', body: 'Established on April 16, 1979 in Nicosia, Cyprus.' },
        { year: '1980', body: 'Export activities commenced to nearby Middle Eastern markets.' },
        { year: '1989', body: 'Current facility opened in Ergates Industrial Area due to growth demands. Product range includes drippers, sprinklers, compression fittings, saddles, and threaded fittings.' },
        { year: '1991', body: 'Polyethylene pipe manufacturing unit launched, enabling complete water-supply solutions.' },
        { year: '1998', body: 'ISO 9001 certification achieved after formal quality-control division establishment.' },
        { year: '2001', body: 'New office building erected; headquarters relocated from central Nicosia.' },
        { year: '2002', body: 'Special Export Award received; Research and Development department created.' },
        { year: '2003–2016', body: 'Four further Export Awards (2003, 2008, 2012, 2016). Products now available on all five continents.' },
        { year: 'Today', body: 'Active in 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, Energy. Distribution centres in Austria, Russia, and Lebanon.' },
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Enquiries and orders can reach us through our wide network of local agents and sales representatives.',
    },
  ],
};

export const aboutUsVisionMissionValues: ContentPage = {
  title: 'Vision, Mission & Values',
  eyebrow: 'About Us',
  blocks: [
    { kind: 'heading', level: 2, text: 'Vision' },
    {
      kind: 'paragraph',
      text:
        'To be a green leader worldwide through Innovative, Smart, Easy-to-use Piping Systems.',
    },
    { kind: 'heading', level: 2, text: 'Mission' },
    {
      kind: 'list',
      items: [
        'Develop W.I.S.E. Products to preserve water resources for future generations (Worldwide, Innovative, Smart, Easy-to-use).',
        'Provide our Customers and Partners with a competitive edge.',
        'Lead our people to meet their full potential.',
        'Achieve sustainable and profitable company growth.',
        'Contribute to Society and the Environment making Earth a better place to live.',
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

/* =========================================================================
 * Green Elysée pillar
 * ========================================================================= */

export const greenElyseeAbout: ContentPage = {
  title: 'About Green Elysée',
  eyebrow: 'Green Elysée',
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

/* =========================================================================
 * Innovation pillar
 * ========================================================================= */

export const innovationWhy: ContentPage = {
  title: 'Why Innovation',
  eyebrow: 'Innovation',
  subtitle: 'Innovation Matters',
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
    { kind: 'heading', level: 2, text: 'What is innovation?' },
    {
      kind: 'paragraph',
      text:
        "Innovation can be a product, service, business model, or strategy that's both inventive and serviceable in the end. The innovation strategy aims for breakthroughs in technology or new business models, as well as straightforward upgrades to customer service or modern features added to existing products.",
    },
    { kind: 'heading', level: 2, text: 'The importance of innovation' },
    { kind: 'heading', level: 3, text: 'Innovation in Business' },
    {
      kind: 'list',
      items: [
        'Ensure success',
        'Safeguard existing position in the market',
        'Pursue essential growth',
        'Improve competitive positioning',
      ],
    },
    { kind: 'heading', level: 3, text: 'Disruptive' },
    {
      kind: 'paragraph',
      text:
        "Creation of additional market segments to serve a customer base the existing market doesn't reach. New-market disruption is always a challenge for Elysée.",
    },
    { kind: 'heading', level: 3, text: 'Sustaining' },
    {
      kind: 'paragraph',
      text:
        'Improvement of processes and technologies of product lines. Elysée wants to stay atop its market.',
    },
    { kind: 'heading', level: 2, text: 'Our four-step process' },
    {
      kind: 'list',
      ordered: true,
      items: ['Clarify', 'Ideate', 'Develop', 'Execute'],
    },
  ],
};
