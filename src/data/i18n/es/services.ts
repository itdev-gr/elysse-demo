// English UI string → Spanish. Our Services section — agriculture, landscape,
// building & infrastructure, industry. Keyed by the English text so it
// doubles as the source.
export const services: Record<string, string> = {
  // Sidebar nav (aria-label)
  'Services': 'Servicios',

  // Hero sub-headlines (Hero.astro auto-translates eyebrow/headline/sub)
  'A reliable supplier of irrigation systems from the pump to the plant. Main, sub-main and laterals.':
    'Un proveedor fiable de sistemas de riego desde la bomba hasta la planta. Tuberías principales, secundarias y laterales.',
  'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.':
    'Asistencia especializada para parques, campus y espacios verdes — riego, césped y mantenimiento continuo.',
  'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.':
    'Sistemas de tuberías y accesorios para abastecimiento de agua, saneamiento y drenaje en proyectos de construcción de cualquier escala.',
  'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.':
    'Tuberías de plástico, válvulas y accesorios de calidad industrial, diseñados para la continuidad operativa de la planta y el cumplimiento normativo.',

  // --- Section content (rendered via the shared SectionRenderer — see report) ---

  // Agriculture
  'Built for the field': 'Diseñado para el campo',
  "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements. Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.":
    'Con un bajo impacto ambiental y un alto rendimiento en cuanto a la producción de los cultivos y el ahorro de agua, los productos de Elysée, de categoría mundial, ofrecen soluciones innovadoras y eficientes que pueden adaptarse a sus necesidades específicas. Un flujo de agua fiable y constante, procedente de productos duraderos y fáciles de instalar, aporta resultados medibles gracias a un sistema con longevidad incorporada y bajos requisitos de mantenimiento. Las soluciones de Elysée son ideales para el cultivo al aire libre, como hileras de cultivos y huertos, invernaderos, invernaderos de cristal, viveros y mucho más.',
  'Star products': 'Productos estrella',

  // Landscape
  'Designed for outdoor environments': 'Diseñado para entornos exteriores',
  'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best. Our range covers micro-irrigation, sprinklers, control valves, and the pipework that ties it all together.':
    'Elysée suministra los productos de riego, césped y gestión del agua que mantienen en las mejores condiciones parques, campus, instalaciones deportivas y fincas privadas. Nuestra gama abarca el microrriego, los aspersores, las válvulas de control y las tuberías que lo conectan todo.',
  'Specialist support, season after season': 'Asistencia especializada, temporada tras temporada',
  'From large public-works contracts to private estates, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.':
    'Desde grandes contratos de obra pública hasta fincas privadas, nuestro equipo trabaja junto a contratistas y jardineros para planificar programas de riego, acondicionamiento del suelo y cuidado estacional adaptados al clima local y a las condiciones del terreno.',

  // Building & Infrastructure
  'Pipe systems for the build': 'Sistemas de tuberías para la construcción',
  'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects. Our products are certified to the most demanding European standards and proven across 40+ years of use in the field.':
    'Tuberías de polietileno, tuberías de presión de PVC, accesorios, válvulas y soluciones de drenaje para proyectos de abastecimiento de agua, saneamiento e infraestructuras. Nuestros productos están certificados según las normas europeas más exigentes y avalados por más de 40 años de uso en el campo.',
  'Long-term partnership on the project': 'Colaboración a largo plazo en el proyecto',
  'From private developers to public-works programmes, we work alongside engineering teams to specify the right products for each site, recommend installation best practices, and stay engaged through commissioning.':
    'Desde promotores privados hasta programas de obra pública, trabajamos junto a los equipos de ingeniería para especificar los productos adecuados para cada emplazamiento, recomendar las mejores prácticas de instalación y mantenernos implicados hasta la puesta en marcha.',

  // Industry
  'Industrial-grade piping': 'Tuberías de calidad industrial',
  'Plastic pipes, fittings, and valves engineered for industrial uptime — including cable applications, network drainage, and building sewerage systems. Our products meet ISO 9001 quality standards and carry DVGW, KIWA, WRAS, SII, and OVGW certifications where applicable.':
    'Tuberías de plástico, accesorios y válvulas diseñados para la continuidad operativa industrial — incluidas aplicaciones para cables, drenaje de redes y sistemas de saneamiento de edificios. Nuestros productos cumplen las normas de calidad ISO 9001 y cuentan, cuando corresponde, con las certificaciones DVGW, KIWA, WRAS, SII y OVGW.',
  'Continuity for plant operations': 'Continuidad para las operaciones de la planta',
  'Industrial customers value continuity. We invest in operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change.':
    'Los clientes industriales valoran la continuidad. Invertimos en conocimiento operativo para recomendar los productos adecuados, anticipar los ciclos de mantenimiento y responder con rapidez cuando cambian los planes.',

  // Shared section CTA
  'View the product catalogue': 'Ver el catálogo de productos',
};
