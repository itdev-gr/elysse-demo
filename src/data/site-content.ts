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
    { kind: 'heading', level: 2, text: 'Our Green Certifications' },
    {
      kind: 'list',
      items: [
        'ISO 14001 — Environmental Management System',
        'ISCC PLUS — International Sustainability and Carbon Certification',
        'ISO 14064-3:2019 — Greenhouse Gas Validation and Verification',
        'EMAS 2024 — EU Eco-Management and Audit Scheme',
        'CYS EN ISO 50001:2018 — Energy Management System',
        'Environmental Declaration 2024',
      ],
    },
  ],
};

export const greenElyseeReports: ContentPage = {
  title: 'Reports & eBooks',
  eyebrow: 'Green Elysée',
  subtitle: 'Transparency through our published environmental reports.',
  blocks: [
    { kind: 'heading', level: 2, text: 'Environmental Report 2024' },
    {
      kind: 'paragraph',
      text:
        'Our Environmental Report 2024 covers the "4.6 Green Policy" strategic direction — documenting Elysée\'s progress on emissions offsetting and green policy implementation across all operations.',
    },
    { kind: 'heading', level: 2, text: 'Green Elysée Yearly Report 2021' },
    {
      kind: 'paragraph',
      text:
        'The Green Elysée Yearly Report 2021 provides a comprehensive overview of our green journey, structured around the six strategic components of Pillar 4 of our Vision50 strategy.',
    },
    {
      kind: 'list',
      items: [
        'Introduction to the "Green Elysée" pillar and Vision50',
        '"Guiding Life on a green path" — our founding principle',
        'Carbon Footprint quantification methodology and results',
        'Green Energy investments and renewable energy progress',
        'Zero Waste initiatives and waste-to-landfill reduction',
        'Circular Economy philosophy and practical initiatives',
        'Green Circular Products and Technologies development',
        'Green Policy and emissions-offsetting projects',
      ],
    },
  ],
};

export interface InsightItem {
  title: string;
  date?: string;
  excerpt?: string;
  href?: string;
  image?: string;
}

export const greenElyseeInsightsItems: InsightItem[] = [
  {
    title: 'Our journey to becoming a Green leader',
    excerpt:
      'The circular economy concept aims at reducing waste as much as possible and, in effect, a product\'s life cycle is extended to the maximum.',
    href: '/press-room/news/',
  },
];

export const innovationInsightsItems: InsightItem[] = [
  {
    title: 'Industry 4.0 and Injection Molding Manufacturing Process',
    excerpt:
      'Injection molding, despite its long industrial history, continues to evolve towards improved dimensional accuracy, reduced energy consumption, and shorter production cycles. As one of the largest manufacturing sectors, it increasingly adopts Industry 4.0 technologies such as the Industrial Internet of Things (IIoT), machine learning, optimization techniques, and digital twins.',
  },
  {
    title: 'Success Entrepreneur Stories',
    excerpt:
      'In 2007 was teaching students how to use a computer aided design software, while she was studying in Perth, Australia.',
  },
  {
    title: 'Overmolding Injection Molding Process',
    excerpt:
      'Overmolding is often called two-shot injection molding since it consists of molding of one material over other(s) forming a multilayer part.',
  },
  {
    title: 'Micro Injection Molding',
    excerpt:
      'Micro injection molding is a very accurate injection molding technique that is employed for the construction of very small parts.',
  },
  {
    title: 'Gas-assisted Injection Molding',
    excerpt:
      'Gas-assisted injection molding was first proposed in 1970s, but it didn\'t gain commercial acceptance until 1990s.',
  },
];

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

export const innovationRD: ContentPage = {
  title: 'Research & Development',
  eyebrow: 'Innovation',
  subtitle: 'Investing in Research & Development.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'The R&D team contributes to the enhancement of all production stages, assuring productivity, design and development of products, procedure implementation and operational efficiency.',
    },
    { kind: 'heading', level: 2, text: 'Our R&D Disciplines' },
    { kind: 'heading', level: 3, text: 'Product Design and Development' },
    {
      kind: 'paragraph',
      text:
        'Given our position as "Green Leaders", our R&D department investigates new ideas for the development for our products. Our product development process follows a cyclical, multi-step process. Starting from conceptualization to the product deployment, the main goal of the process is to develop products according to customer requirements by covering current design and development issues. Such considerations include the identification of customer needs, design for manufacturing, prototyping and industrial design.',
    },
    { kind: 'heading', level: 3, text: 'Market Research' },
    {
      kind: 'paragraph',
      text:
        'The viability of new services or products is validated partly through close cooperation with potential customers. Inputs regarding market trends and needs are provided to the R&D team from the company\'s marketing department. These include consumer demands, purchasing methods, product sales and the existence and development of technology across relevant markets.',
    },
    { kind: 'heading', level: 3, text: 'Project Management' },
    {
      kind: 'paragraph',
      text:
        'Our project management system is made up of several frameworks and methods for organizing and monitoring a project\'s different stages. Our project management approach includes leading and collaborating with the team to complete the project on time and within budget. Usually, early in the development phase, the project documentation will include a description of this information. The three basic restrictions are budget, time, and scope.',
    },
    { kind: 'heading', level: 3, text: 'IP Procedure, Patent Attorneys' },
    {
      kind: 'paragraph',
      text:
        'Upon coming up with unique idea, we consult specialist attorneys to determine if there are conflicts with existing IP. Assuming there are no conflicts, all necessary steps are taken with the support of legal specialists in order to filing for a patent with the relevant intellectual property offices.',
    },
    { kind: 'heading', level: 3, text: 'Feasibility Studies' },
    {
      kind: 'paragraph',
      text:
        'Thorough feasibility studies provide detailed evaluations, which take into account all critical factors of our projects, forecasting their chances of being successful.',
    },
    { kind: 'heading', level: 3, text: 'Concept Generation' },
    {
      kind: 'paragraph',
      text:
        'Idea generation often involves a collaborative effort after gathering all relevant information, such as user, marketing, and competition research. The methods for generating ideas appear. Such a process is brainstorming, a group problem-solving technique that encourages the unplanned development of original ideas and solutions.',
    },
    { kind: 'heading', level: 3, text: 'Concept Evaluation' },
    {
      kind: 'paragraph',
      text:
        'Concept evaluation is a crucial phase in the R&D process, during which the customers\' perceptions of a potential new product are analysed.',
    },
    { kind: 'heading', level: 3, text: 'Concept Development' },
    {
      kind: 'paragraph',
      text:
        'Concept development and testing are both important phases, particularly for new items. It occurs at the very beginning of our projects to aid in the identification of problems and the development of our concepts by taking into consideration the important perceptions, user demands, and needs related to the product.',
    },
    { kind: 'heading', level: 3, text: 'Proof of Concept' },
    {
      kind: 'paragraph',
      text:
        'Following the Proof of Concept (PoC) methodology validates the viability and potential of innovative ideas to support the case for further development, with the end-goal of reaching full-scale production. Our robust PoC process enables us to identify potential technical and logistical issues which may hinder success.',
    },
    { kind: 'heading', level: 3, text: 'Prototyping' },
    {
      kind: 'paragraph',
      text:
        'Creating functional prototypes of new components and testing processes with conventional machining and additive manufacturing methods to ensure that functional requirements and technical standards are satisfied.',
    },
    { kind: 'heading', level: 3, text: 'Advanced Metrology Systems' },
    {
      kind: 'paragraph',
      text:
        '3D scanners, reverse engineering and smart measuring devices are used for the detailed measurement and analysis of our existing products and tooling, whether this involves the complete virtual 3D model reproduction of physical objects or simple measurements. This enables us to carry out corrective and improvement modifications to our existing products with a high degree of precision and accuracy, or design new products which are better than their predecessors.',
    },
    { kind: 'heading', level: 3, text: 'Verification & Validation Through Testing' },
    {
      kind: 'paragraph',
      text:
        'Upon materialising a new product, initial samples are verified and validated in close coordination with our QC department, in order to approve its production. During the production, checks by the QC team ensure products are produced to a high standard and superior quality.',
    },
  ],
};

export const innovationFundedProjects: ContentPage = {
  title: 'Funded Research Projects',
  eyebrow: 'Innovation',
  subtitle: 'Advancing knowledge through collaborative research funding.',
  blocks: [
    { kind: 'heading', level: 2, text: 'About Research Funding Activities' },
    {
      kind: 'paragraph',
      text:
        'Elysée actively participates in funded research projects in collaboration with academic institutions and industry partners, driving innovation and contributing to scientific advancement in our field.',
    },
    { kind: 'heading', level: 2, text: 'Active & Recent Projects' },
    { kind: 'heading', level: 3, text: 'Innova' },
    {
      kind: 'paragraph',
      text:
        'Duration: 1 August 2025 – 30 April 2026. Total Funding: €196,125.',
    },
    { kind: 'heading', level: 3, text: 'AgReCOMPOSITES' },
    {
      kind: 'paragraph',
      text:
        'Duration: 2 May 2024 – 1 May 2026. Total Funding: €598,046 | Elysée Funding: €221,130. The project AgReCOMPOSITES falls under the Pillar I "Smart Growth" that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes.',
    },
    { kind: 'heading', level: 3, text: 'PlantNGreen' },
    {
      kind: 'paragraph',
      text:
        'Duration: 1 February 2023 – 31 January 2025. Total Funding: €574,142.25 | Elysée Funding: €222,878.25. Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation.',
    },
  ],
};

export const innovationNetworkPartners: ContentPage = {
  title: 'Network & Partners',
  eyebrow: 'Innovation',
  subtitle: 'Building strong partnerships in academic and industrial sectors.',
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
      kind: 'list',
      items: [
        'University of Cyprus',
        'Cyprus University of Technology',
        'Frederick University',
        'Frederick Research Center',
        'Department of Environment',
        'CYS — Cyprus Organisation for Standardisation',
        'OEB — Cyprus Employers and Industrialists Federation',
        'Agriculture Research Institute',
        'Department of Forests',
        'Water Board of Nicosia',
        'KIOS Research and Innovation Center of Excellence',
        'CyRIC — Cyprus Research and Innovation Center',
        'Simlead',
        'CNE',
        'S.E.R.G',
        'AmaDema',
        'KTV Green Enterprises',
        'AgroTech Innovations',
      ],
    },
    {
      kind: 'callout',
      title: 'Join our Network & Become a Partner',
      body:
        'We are always looking to expand our network of partners. If you are interested in collaborating with Elysée on research, technological development, or innovation initiatives, we invite you to get in touch.',
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

export const insightsBlogItems: InsightItem[] = [
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
    title: 'PVC Fittings and Pipes for Waste and Soil Systems',
    excerpt:
      'Elysée Piping offers a comprehensive range of uPVC pipes and fittings designed for safe, hygienic and long-lasting soil and waste disposal systems. Manufactured from lead-free PVC-U and fully compliant with European standards EN 1329 and EN 1401.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'Elysée Irrigation Certified as a Great Place To Work®',
    excerpt:
      'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment, where trust, respect, and the development of its people are at the core.',
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
    href: undefined,
    image: undefined,
  },
  {
    title: 'EIMA 2022',
    date: 'Nov 2022',
    excerpt:
      'Elysée Irrigation was present at EIMA Exhibition in Bologna, Italy, 9–13 November 2022.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'Internationale Gartenbaumesse Tulln',
    date: 'Sep 2021',
    excerpt:
      'Elysée participated in the Internationale Gartenbaumesse Tulln, 2–6 September 2021.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'EIMA 2021',
    date: 'Oct 2021',
    excerpt:
      'Elysée was present at EIMA 2021 in Bologna, Italy, 19–23 October 2021, Stand B25 Hall 22.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'MCE Mostra Convegno',
    excerpt:
      'Elysée exhibited at MCE Mostra Convegno, Stand No. L69, Pavilion 14.',
    href: undefined,
    image: undefined,
  },
];

export const insightsMediaItems: InsightItem[] = [
  {
    title: 'Elysée 40 Year Anniversary Event',
    excerpt:
      'Video recording of the Elysée 40 Year Anniversary Event, celebrating four decades of manufacturing and innovation in piping and irrigation systems.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'European Business Award 2014',
    excerpt:
      'Video coverage of Elysée receiving the European Business Award 2014, recognising excellence in European business.',
    href: undefined,
    image: undefined,
  },
  {
    title: 'CYBC Documentary about Innovation in Cyprus — Elysée Irrigation',
    excerpt:
      'Cyprus Broadcasting Corporation documentary featuring Elysée Irrigation as a case study of innovation in Cypriot industry.',
    href: undefined,
    image: undefined,
  },
];

export const insightsEbooksItems: InsightItem[] = [
  {
    title: 'Green Elysée: Yearly Report 2021',
    excerpt:
      'Introduction to the "Green Elysée" pillar and Vision50, covering carbon footprint quantification, green energy investments, zero waste achievements, circular economy philosophy, green circular products and technologies, and green policy emissions offsetting.',
    href: undefined,
    image: undefined,
  },
];

export const innovationInnovateWithUs: ContentPage = {
  title: 'Innovate with Us',
  eyebrow: 'Innovation',
  subtitle: 'Ready for your exceptional ideas.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        'We innovate with partners, concentrating on exceptional ideas related to disruptive technologies. Are you working on something valuable that could match our field? Let\'s join forces to turn your breakthrough concept into a market-ready reality. Reach out to our team with a brief overview of your project and let\'s explore how we can shape the future together.',
    },
    {
      kind: 'callout',
      title: 'Confidentiality',
      body:
        'We only need basic information in your initial submission and will not ask for any details that compromise confidentiality. We could establish a separate confidentiality agreement with you before asking you to share any confidential information.',
    },
    { kind: 'heading', level: 2, text: 'How to submit your idea' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Prepare a brief overview of your project or technology.',
        'Submit your idea using the contact form or via email.',
        'Our team will review your submission and respond confidentially.',
        'If there is a mutual fit, we will discuss next steps and, where needed, establish a confidentiality agreement.',
      ],
    },
    {
      kind: 'callout',
      title: 'Get in touch',
      body:
        'Ready to innovate together? Contact us at info@elysee.com.cy to submit your idea or request more information about collaboration opportunities.',
    },
  ],
};

/* =========================================================================
 * Contact directories
 * ========================================================================= */

export const localOffices: Office[] = [
  {
    name: 'Strovolos Shop',
    region: 'Nicosia',
    address: '32 Solomou Solomou Street, 2032',
    phone: '+357 22 455 100',
    hours: 'Monday–Friday 07:00–13:00 & 13:30–16:30\nSaturday 07:30–13:00',
    notes: 'Alt phone: +357 22 317 913',
  },
  { name: 'Ergates Shop', region: 'Nicosia', notes: 'Contact head office for details.' },
  { name: 'Larnaca Shop', region: 'Larnaca', notes: 'Contact head office for details.' },
  { name: 'Frenaros Shop', region: 'Famagusta district', notes: 'Contact head office for details.' },
  { name: 'Limassol Shop', region: 'Limassol', notes: 'Contact head office for details.' },
  { name: 'Paphos Shop', region: 'Paphos', notes: 'Contact head office for details.' },
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
        'Address: 7 Vasileos Konstantinou, 2008 Strovolos, Nicosia, Cyprus\nPhone: +357 22 462 462\nEmail: careers@elysee.com.cy\nWebsite: www.elysee.com.cy',
    },
  ],
};
