// English UI string → German. Our Services section — agriculture, landscape,
// building & infrastructure, industry. Keyed by the English text so it
// doubles as the source.
export const services: Record<string, string> = {
  // Sidebar nav (aria-label)
  'Services': 'Leistungen',

  // Hero sub-headlines (Hero.astro auto-translates eyebrow/headline/sub)
  'A reliable supplier of irrigation systems from the pump to the plant. Main, sub-main and laterals.':
    'Ein zuverlässiger Lieferant von Bewässerungssystemen von der Pumpe bis zur Pflanze. Haupt-, Verteil- und Lateralleitungen.',
  'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.':
    'Spezialisierte Unterstützung für Parks, Anlagen und Grünflächen — Bewässerung, Rasenpflege und laufende Betreuung.',
  'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.':
    'Rohr- und Fittingsysteme für Wasserversorgung, Abwasser und Entwässerung bei Bauprojekten jeder Größenordnung.',
  'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.':
    'Kunststoffrohrleitungen, Armaturen und Fittings in Industriequalität, entwickelt für die Betriebskontinuität der Anlage und die Einhaltung gesetzlicher Vorschriften.',

  // --- Section content (rendered via the shared SectionRenderer — see report) ---

  // Agriculture
  'Built for the field': 'Für den Acker gebaut',
  "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements. Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.":
    'Mit geringer Umweltbelastung und hoher Rendite in Bezug auf Ernteertrag und Wassereinsparung bieten die Weltklasse-Produkte von Elysée innovative und effiziente Lösungen, die an Ihre individuellen Anforderungen angepasst werden können. Ein zuverlässiger, gleichmäßiger Wasserfluss aus langlebigen und leicht zu installierenden Produkten sorgt für messbare Ergebnisse dank eines Systems mit eingebauter Langlebigkeit und geringem Wartungsbedarf. Die Lösungen von Elysée eignen sich ideal für den Freilandanbau wie Reihenkulturen und Obstplantagen, für Gewächshäuser, Glashäuser, Baumschulen und mehr.',
  'Star products': 'Spitzenprodukte',

  // Landscape
  'Designed for outdoor environments': 'Entwickelt für den Außenbereich',
  'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best. Our range covers micro-irrigation, sprinklers, control valves, and the pipework that ties it all together.':
    'Elysée liefert die Bewässerungs-, Rasen- und Wassermanagementprodukte, die Parks, Anlagen, Sportstätten und private Grünflächen in bestem Zustand halten. Unser Sortiment umfasst Mikrobewässerung, Regner, Regelarmaturen und die Rohrleitungen, die alles miteinander verbinden.',
  'Specialist support, season after season': 'Fachkundige Unterstützung, Saison für Saison',
  'From large public-works contracts to private estates, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.':
    'Von großen öffentlichen Bauaufträgen bis hin zu privaten Anwesen arbeitet unser Team mit Bauunternehmern und Platzwarten zusammen, um Bewässerungs-, Bodenverbesserungs- und saisonale Pflegeprogramme zu planen, die auf das lokale Klima und die Standortbedingungen abgestimmt sind.',

  // Building & Infrastructure
  'Pipe systems for the build': 'Rohrsysteme für den Bau',
  'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects. Our products are certified to the most demanding European standards and proven across 40+ years of use in the field.':
    'Polyethylenrohre, PVC-Druckrohre, Fittings, Armaturen und Entwässerungslösungen für Wasserversorgung, Abwasser und Infrastrukturprojekte. Unsere Produkte sind nach den anspruchsvollsten europäischen Normen zertifiziert und haben sich in über 40 Jahren praktischem Einsatz bewährt.',
  'Long-term partnership on the project': 'Langfristige Partnerschaft im Projekt',
  'From private developers to public-works programmes, we work alongside engineering teams to specify the right products for each site, recommend installation best practices, and stay engaged through commissioning.':
    'Von privaten Bauträgern bis hin zu öffentlichen Bauprogrammen arbeiten wir eng mit Planungsteams zusammen, um für jeden Standort die richtigen Produkte auszuwählen, bewährte Installationspraktiken zu empfehlen und bis zur Inbetriebnahme eng eingebunden zu bleiben.',

  // Industry
  'Industrial-grade piping': 'Rohrleitungen in Industriequalität',
  'Plastic pipes, fittings, and valves engineered for industrial uptime — including cable applications, network drainage, and building sewerage systems. Our products meet ISO 9001 quality standards and carry DVGW, KIWA, WRAS, SII, and OVGW certifications where applicable.':
    'Kunststoffrohre, Fittings und Armaturen, entwickelt für industrielle Betriebskontinuität — einschließlich Kabelanwendungen, Netzentwässerung und Gebäudeabwassersysteme. Unsere Produkte erfüllen die Qualitätsstandards nach ISO 9001 und tragen, soweit zutreffend, die Zertifizierungen DVGW, KIWA, WRAS, SII und OVGW.',
  'Continuity for plant operations': 'Kontinuität für den Anlagenbetrieb',
  'Industrial customers value continuity. We invest in operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change.':
    'Industriekunden legen Wert auf Kontinuität. Wir investieren in betriebliches Know-how, um die richtigen Produkte zu empfehlen, Wartungszyklen vorherzusehen und schnell zu reagieren, wenn sich Pläne ändern.',

  // Shared section CTA
  'View the product catalogue': 'Produktkatalog ansehen',
};
