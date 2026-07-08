// English UI string → French. Our Services section — agriculture, landscape,
// building & infrastructure, industry. Keyed by the English text so it
// doubles as the source.
export const services: Record<string, string> = {
  // Sidebar nav (aria-label)
  'Services': 'Services',

  // Hero sub-headlines (Hero.astro auto-translates eyebrow/headline/sub)
  'A reliable supplier of irrigation systems from the pump to the plant. Main, sub-main and laterals.':
    "Un fournisseur fiable de systèmes d'irrigation, de la pompe à la plante. Conduites principales, secondaires et latérales.",
  'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.':
    'Accompagnement spécialisé pour les parcs, campus et espaces verts — irrigation, gazon et entretien continu.',
  'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.':
    "Systèmes de tuyaux et de raccords pour l'adduction d'eau, l'assainissement et le drainage sur des projets de construction de toute envergure.",
  'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.':
    "Tuyauterie plastique, robinets et raccords de qualité industrielle, conçus pour la continuité de fonctionnement de l'installation et la conformité réglementaire.",

  // --- Section content (rendered via the shared SectionRenderer — see report) ---

  // Agriculture
  'Built for the field': 'Conçu pour le champ',
  "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements. Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.":
    "Avec un faible impact environnemental et un rendement élevé en matière de récolte et d'économie d'eau, les produits de classe mondiale d'Elysée apportent des solutions innovantes et efficaces qui peuvent être adaptées à vos besoins spécifiques. Un débit d'eau fiable et constant, issu de produits durables et faciles à installer, apporte des résultats mesurables grâce à un système doté d'une longévité intégrée et de faibles besoins d'entretien. Les solutions Elysée sont idéales pour l'agriculture de plein champ, comme les rangs de cultures et les vergers, les serres, les serres en verre, les pépinières, et bien plus encore.",
  'Star products': 'Produits vedettes',

  // Landscape
  'Designed for outdoor environments': 'Conçu pour les environnements extérieurs',
  'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best. Our range covers micro-irrigation, sprinklers, control valves, and the pipework that ties it all together.':
    "Elysée fournit les produits d'irrigation, de gazon et de gestion de l'eau qui permettent aux parcs, campus, installations sportives et propriétés privées de rester dans un état optimal. Notre gamme couvre la micro-irrigation, les arroseurs, les robinets de régulation et la tuyauterie qui relie le tout.",
  'Specialist support, season after season': 'Accompagnement spécialisé, saison après saison',
  'From large public-works contracts to private estates, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.':
    "Des grands contrats de travaux publics aux propriétés privées, notre équipe travaille aux côtés des entrepreneurs et des jardiniers-paysagistes pour planifier des programmes d'irrigation, d'amélioration des sols et d'entretien saisonnier adaptés au climat local et aux conditions du site.",

  // Building & Infrastructure
  'Pipe systems for the build': 'Systèmes de tuyauterie pour la construction',
  'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects. Our products are certified to the most demanding European standards and proven across 40+ years of use in the field.':
    "Tubes en polyéthylène, tubes de pression en PVC, raccords, robinets et solutions de drainage pour les projets d'adduction d'eau, d'assainissement et d'infrastructure. Nos produits sont certifiés selon les normes européennes les plus exigeantes et ont fait leurs preuves sur plus de 40 ans d'utilisation sur le terrain.",
  'Long-term partnership on the project': 'Partenariat à long terme sur le projet',
  'From private developers to public-works programmes, we work alongside engineering teams to specify the right products for each site, recommend installation best practices, and stay engaged through commissioning.':
    "Des promoteurs privés aux programmes de travaux publics, nous travaillons aux côtés des équipes d'ingénierie pour définir les produits adaptés à chaque site, recommander les meilleures pratiques d'installation et rester impliqués jusqu'à la mise en service.",

  // Industry
  'Industrial-grade piping': 'Tuyauterie de qualité industrielle',
  'Plastic pipes, fittings, and valves engineered for industrial uptime — including cable applications, network drainage, and building sewerage systems. Our products meet ISO 9001 quality standards and carry DVGW, KIWA, WRAS, SII, and OVGW certifications where applicable.':
    "Tuyaux, raccords et robinets en plastique conçus pour la continuité de fonctionnement industrielle — y compris les applications de câbles, le drainage de réseaux et les systèmes d'assainissement des bâtiments. Nos produits répondent aux normes de qualité ISO 9001 et disposent, le cas échéant, des certifications DVGW, KIWA, WRAS, SII et OVGW.",
  'Continuity for plant operations': "Continuité de l'exploitation de l'installation",
  'Industrial customers value continuity. We invest in operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change.':
    "Les clients industriels accordent une grande importance à la continuité. Nous investissons dans la connaissance opérationnelle afin de recommander les bons produits, d'anticiper les cycles de maintenance et de réagir rapidement en cas de changement de plan.",

  // Shared section CTA
  'View the product catalogue': 'Voir le catalogue des produits',
};
