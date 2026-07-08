// English UI string → German for the ABOUT-US section: the Corporate Profile,
// History, Company Structure, Vision/Mission/Values and Quality & Certifications
// pages (plus the about-only AboutSubNav). Keyed by the English source text so
// it doubles as the fallback. Strings already in shared.ts (e.g. nav labels,
// "Read more") are NOT repeated. Brand/proper names (Elysée, Green Elysée),
// certification body names/acronyms (DVGW, KIWA, ISO …), emails, URLs, dates
// and numeric stats are intentionally left untranslated.
export const about: Record<string, string> = {
  // ───────────────────────── AboutSubNav (about-only) ─────────────────────────
  'In this section': 'In diesem Bereich',
  'About Us section': 'Bereich „Über uns"',

  // ============================================================================
  // Corporate Profile — /about-us/
  // ============================================================================
  // Hero
  'A family business, since 1979.': 'Ein Familienunternehmen, seit 1979.',
  'Manufacturing piping and irrigation systems for water supply, irrigation, sewerage and energy — shipped from Cyprus to more than 65 destinations across four continents.':
    'Herstellung von Rohr- und Bewässerungssystemen für Wasserversorgung, Bewässerung, Abwasser und Energie — versandt von Zypern an mehr als 65 Ziele auf vier Kontinenten.',
  // Stat band
  'By the numbers': 'In Zahlen',
  'Founded in': 'Gegründet',
  'Employees': 'Mitarbeiter',
  'Product Codes': 'Produktcodes',
  'Countries Worldwide': 'Länder weltweit',
  // Manifesto opening
  'Our purpose': 'Unser Zweck',
  'Base': 'Sitz',
  'Continents': 'Kontinente',
  'Sectors': 'Sektoren',
  'Ergates · Cyprus': 'Ergates · Zypern',
  'Manufacturing since 1989': 'Herstellung seit 1989',
  // Editorial body
  'A note from the family': 'Ein Wort der Familie',
  'Founder · Cyprus · 1979': 'Gründer · Zypern · 1979',
  'Est. 1979': 'Gegr. 1979',
  'Three generations of Protopapas — same workshop in Ergates, same conviction that water deserves better pipes.':
    'Drei Generationen Protopapas — dieselbe Werkstatt in Ergates, dieselbe Überzeugung, dass Wasser bessere Rohre verdient.',
  'Read the full history': 'Die vollständige Geschichte lesen',
  'Who we are': 'Wer wir sind',
  'Save you time, save you money, and save the planet.':
    'Ihnen Zeit sparen, Ihnen Geld sparen und den Planeten retten.',
  'Years of experience': 'Jahre Erfahrung',
  // Stand-out manifesto
  'What sets us apart': 'Was uns auszeichnet',
  'Forty years, one workshop, zero shortcuts.':
    'Vierzig Jahre, eine Werkstatt, keine Kompromisse.',
  // Streaming Water cinematic
  'Our founding conviction': 'Unsere Gründungsüberzeugung',
  // Closing CTA
  'From the team to the technology, every part of Elysée is built to back the products we ship. Talk to us about a project, a custom run, or a long-term partnership.':
    'Vom Team bis zur Technologie ist jeder Teil von Elysée darauf ausgelegt, die von uns versandten Produkte zu unterstützen. Sprechen Sie mit uns über ein Projekt, eine Sonderfertigung oder eine langfristige Partnerschaft.',
  'Contact our network': 'Kontaktieren Sie unser Netzwerk',

  // Corporate Profile — dynamic content (from site-content.ts blocks).
  // whoP1.text is split at the first sentence boundary in the page, so the
  // two halves are keyed separately here as well as the full paragraph.
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy.':
    'Elysée fertigt und liefert Rohr- und Bewässerungssysteme für Wasserversorgung, Bewässerung, Abwasser und Energie.',
  'Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Mit Sitz in Zypern, einem Schlüsselstandort am Schnittpunkt dreier Kontinente, beliefert Elysée mehr als 65 Ziele in Europa, im Nahen Osten, in Südafrika, Japan, Australien und Neuseeland.',
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Elysée fertigt und liefert Rohr- und Bewässerungssysteme für Wasserversorgung, Bewässerung, Abwasser und Energie. Mit Sitz in Zypern, einem Schlüsselstandort am Schnittpunkt dreier Kontinente, beliefert Elysée mehr als 65 Ziele in Europa, im Nahen Osten, in Südafrika, Japan, Australien und Neuseeland.',
  'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.':
    'Es liegt in unserer Natur als Unternehmen, aber auch als Menschen, ehrgeizig zu sein und uns hohe Ziele zu setzen. Wir lassen uns von unserer 40-jährigen Geschichte und Erfahrung inspirieren und blicken mit Optimismus und Zuversicht auf unser fünftes Jahrzehnt. Von unseren erfahrenen Ingenieuren bis zu unserem hervorragend geschulten Kundendienstpersonal spielt Teamarbeit eine enorme Rolle für den Erfolg von Elysée. Die Zusammenarbeit über alle Abteilungen hinweg, die Liebe zum Detail und viel harte Arbeit führen zu großartigen Produkten und schaffen brillante Lösungen, die sich perfekt an jeden Kunden anpassen lassen.',
  'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.':
    'Wir streben danach, zu innovieren und uns zu verbessern, und da wir über eine eigene interne F&E-Abteilung verfügen, können wir bei der Entwicklung und Schaffung neuer und spannender Produkte der Konkurrenz voraus sein. Bei jedem neuen Produkt möchten wir nicht nur die Effizienz des Produkts maximieren, sondern auch die Langlebigkeit und Benutzerfreundlichkeit. Stets mit dem Ziel, die Umweltauswirkungen zu minimieren und die Preise für Sie und Ihr Unternehmen wettbewerbsfähig zu halten, möchten wir Ihnen Zeit sparen, Ihnen Geld sparen und den Planeten retten.',
  'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.':
    'Mit einer flexiblen Organisationsstruktur gewährleistet Elysée eine schnelle Reaktion auf Kundenanfragen, Bestellungen und Möglichkeiten zur Zusammenarbeit. Jedes Jahr werden neue Produkte entwickelt und hinzugefügt, um bestehende Produkte zu erweitern und ein stetig wachsendes Sortiment zu schaffen.',
  'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.':
    'Langjährige Erfahrung in der Konstruktion, Herstellung und Lieferung von Fittings spiegelt sich in neuen Produkten wider, die auf die Bedürfnisse der Kunden eingehen, sowie in unserer Fähigkeit, jede Bestellung termingerecht an ihren Bestimmungsort zu produzieren und zu liefern.',
  'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.':
    'Unsere Produkte sind von den renommiertesten internationalen Normungsorganisationen wie DVGW, WRAS und KIWA zertifiziert, was das beständige und kontinuierliche Bestreben des Unternehmens bei der Herstellung hochwertiger Produkte belegt.',
  'This product range has been proven in the field for forty years.':
    'Dieses Produktsortiment hat sich seit vierzig Jahren im Feld bewährt.',
  'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.':
    'Diese 40 Jahre Erfahrung haben die Prozesse und die Technologie des Unternehmens reifen lassen, das heute über modernste Produktions- und Montageanlagen verfügt. Die Kapazität wird kontinuierlich ausgebaut, um die Nachfrage sowohl in Bezug auf Menge als auch auf Technologie zu befriedigen.',
  'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.':
    'Wir sind ein Familienunternehmen und sind stolz auf das, was wir tun. Verantwortlichkeit, Ehrlichkeit und enge Zusammenarbeit sind in allen Abläufen gegenwärtig.',
  'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.':
    'Als Menschen wollen wir dasselbe für unser Leben. Uns liegt daran, es an ein sicheres Ziel zu führen. Als Unternehmen fertigen wir zuverlässige Systeme, um Wasser — und Flüssigkeiten allgemein — sicher an ihr Ziel zu leiten. Letztlich möchten wir das Leben auf einen grünen Weg führen.',

  // ============================================================================
  // History — /about-us/history/
  // ============================================================================
  // Hero
  'Built one decade at a time.': 'Aufgebaut, ein Jahrzehnt nach dem anderen.',
  'From a Cypriot greenhouse in the 1970s to a piping and irrigation manufacturer shipping to 65 destinations — the story of Elysée Irrigation, founded 16 April 1979.':
    'Von einem zyprischen Gewächshaus in den 1970er-Jahren zu einem Hersteller von Rohr- und Bewässerungssystemen, der an 65 Ziele liefert — die Geschichte von Elysée Irrigation, gegründet am 16. April 1979.',
  // Stat band
  'Markets served': 'Belieferte Märkte',
  'Export awards': 'Exportpreise',
  'ISO 9001 since': 'ISO 9001 seit',
  // Origins
  'Origins · 1979': 'Ursprünge · 1979',
  'From the workshop': 'Aus der Werkstatt',
  'Drippers, sprinklers, fittings': 'Tropfer, Regner, Fittings',
  'Founded': 'Gegründet',
  'Nicosia, Cyprus': 'Nikosia, Zypern',
  'Founder': 'Gründer',
  'Agriculture & physics': 'Landwirtschaft & Physik',
  'Original venture': 'Ursprüngliches Vorhaben',
  'Flowers': 'Blumen',
  'for the Middle East': 'für den Nahen Osten',
  // Milestones
  'A timeline of forty-seven years': 'Eine Chronik von siebenundvierzig Jahren',
  'Milestones, by the decade.': 'Meilensteine, nach Jahrzehnten.',
  'Today': 'Heute',
  // Today
  '65 markets. Four sectors. Three distribution hubs.':
    '65 Märkte. Vier Sektoren. Drei Vertriebszentren.',
  'Sectors served': 'Bediente Sektoren',
  'Distribution centres': 'Vertriebszentren',
  'Plus a network of local agents and sales representatives across all 65 markets.':
    'Zusätzlich ein Netzwerk lokaler Handelsvertreter und Vertriebsmitarbeiter in allen 65 Märkten.',
  'Water Supply': 'Wasserversorgung',
  'Irrigation': 'Bewässerung',
  'Infrastructure': 'Infrastruktur',
  'Energy': 'Energie',
  'Austria': 'Österreich',
  'Russia': 'Russland',
  'Lebanon': 'Libanon',
  // Where it started
  'Where it started': 'Wo alles begann',
  'The original line.': 'Die ursprüngliche Produktreihe.',
  'Drippers': 'Tropfer',
  'Sprinklers': 'Regner',
  'Compression fittings': 'Klemmfittings',
  'Saddles': 'Anbohrschellen',
  'Threaded fittings': 'Gewindefittings',
  // History — dynamic content. intro1.text is split into three sentences in
  // the page (originsHeadline / originsBody / originsTail), so each is keyed.
  'It was a love of nature that led to the birth of our company, Elysée.':
    'Es war die Liebe zur Natur, die zur Geburt unseres Unternehmens Elysée führte.',
  'With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East.':
    'Mit Wurzeln in der Landwirtschaft und einem Abschluss in Physik hatte der Gründer, Antonis Protopapas, die Idee, ein Unternehmen aufzubauen, das sich auf die Kultivierung der besten Blumen im Nahen Osten konzentrierte.',
  'And so, that was the start of this beautiful journey…':
    'Und so begann diese wunderschöne Reise…',
  "It was a love of nature that led to the birth of our company, Elysée. With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East. And so, that was the start of this beautiful journey…":
    'Es war die Liebe zur Natur, die zur Geburt unseres Unternehmens Elysée führte. Mit Wurzeln in der Landwirtschaft und einem Abschluss in Physik hatte der Gründer, Antonis Protopapas, die Idee, ein Unternehmen aufzubauen, das sich auf die Kultivierung der besten Blumen im Nahen Osten konzentrierte. Und so begann diese wunderschöne Reise…',
  'Through this venture, the need to know more about irrigation became a priority. Back in the 1970s the new art of irrigation was on the rise, and the know-how was brought in to help Elysée grow world-class flowers.':
    'Durch dieses Vorhaben wurde das Bedürfnis, mehr über Bewässerung zu erfahren, zur Priorität. In den 1970er-Jahren war die neue Kunst der Bewässerung im Aufschwung, und das Know-how wurde herangezogen, um Elysée dabei zu helfen, Blumen von Weltklasse zu kultivieren.',
  'With our newly acquired knowledge of irrigation and irrigation needs, the next step was to move into irrigation trading, trading pipe fittings and then… into manufacturing them. So, in 1979, on 16 April, Elysée Irrigation was founded.':
    'Mit unserem neu erworbenen Wissen über Bewässerung und Bewässerungsbedarf war der nächste Schritt der Einstieg in den Bewässerungshandel, den Handel mit Rohrfittings und dann… in deren Herstellung. So wurde 1979, am 16. April, Elysée Irrigation gegründet.',
  'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.':
    'Dieselbe Überzeugung, mit der das Unternehmen begann, treibt es noch heute an: zuverlässige Systeme zu bauen, die Wasser — und das Leben — sicher dorthin bringen, wo es gebraucht wird.',
  'Elysée Irrigation founded': 'Elysée Irrigation gegründet',
  'Founded on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas. The first production facility was co-located with farming and flower preparation for the international markets — exciting times where the exploration of the unknown field of plastic manufacturing was hard but rewarding for a young company.':
    'Gegründet am 16. April 1979 in Nikosia, Zypern, von Antonis Protopapas. Die erste Produktionsstätte war mit der Landwirtschaft und der Blumenaufbereitung für die internationalen Märkte zusammengelegt — spannende Zeiten, in denen die Erkundung des unbekannten Feldes der Kunststoffherstellung schwierig, aber lohnend für ein junges Unternehmen war.',
  'As early as 1980, the first export activities began, in the nearby markets of the Middle East — an area which at the time was only starting to utilize irrigation techniques.':
    'Bereits 1980 begannen die ersten Exportaktivitäten in den nahegelegenen Märkten des Nahen Ostens — einer Region, die zu jener Zeit gerade erst begann, Bewässerungstechniken zu nutzen.',
  'Early success led to fast growth which demanded a dedicated industrial space. The current site in the Ergates Industrial Area was established. The product range at the time comprised a substantial series of drippers and sprinklers as well as an extensive range of compression fittings, saddles, and threaded fittings.':
    'Der frühe Erfolg führte zu schnellem Wachstum, das einen eigenen Industriestandort erforderte. Der heutige Standort im Industriegebiet Ergates wurde errichtet. Das Produktsortiment umfasste damals eine umfangreiche Reihe von Tropfern und Regnern sowie ein breites Sortiment an Klemmfittings, Anbohrschellen und Gewindefittings.',
  'A piping system is never complete without a pipe, hence in 1991 a polyethylene pipe manufacturing unit was established at the Ergates site — Elysée could now offer a full water-supply solution. Its early success led to the extension of the range with PVC pipe manufacturing, entering the construction and infrastructure world.':
    'Ein Rohrsystem ist ohne Rohr niemals vollständig, weshalb 1991 am Standort Ergates eine Fertigungseinheit für Polyethylenrohre eingerichtet wurde — Elysée konnte nun eine vollständige Wasserversorgungslösung anbieten. Der frühe Erfolg führte zur Erweiterung des Sortiments um die Herstellung von PVC-Rohren und zum Eintritt in die Welt des Bauwesens und der Infrastruktur.',
  'An extensive range of products meant the quality-control division had to be formally established, leading to the certification of the company with ISO 9001 as early as 1998.':
    'Ein umfangreiches Produktsortiment bedeutete, dass die Qualitätskontrollabteilung offiziell eingerichtet werden musste, was bereits 1998 zur Zertifizierung des Unternehmens nach ISO 9001 führte.',
  'A new office building was erected to host the main offices of the company — until then located in central Nicosia — optimizing operations and preparing for the next step in expansion.':
    'Ein neues Bürogebäude wurde errichtet, um die Hauptbüros des Unternehmens aufzunehmen — die sich bis dahin im Zentrum von Nikosia befanden — wodurch die Abläufe optimiert und der nächste Expansionsschritt vorbereitet wurden.',
  'The first recognition of international activity for Elysée came with the Special Export Award. That same year, a new function was born within the company: the Research and Development department, leading the advancement of technology and improvement of the product range. Elysée was now a complete and modern company, investing significantly in the international market.':
    'Die erste Anerkennung der internationalen Aktivität von Elysée kam mit dem Sonderpreis für Export. Im selben Jahr entstand eine neue Funktion im Unternehmen: die Abteilung für Forschung und Entwicklung, die den Fortschritt der Technologie und die Verbesserung des Produktsortiments anführt. Elysée war nun ein vollständiges und modernes Unternehmen, das erheblich in den internationalen Markt investierte.',
  'The years that followed saw a major expansion in global reach and market coverage. Elysée products could be found on all 5 continents and in a steadily growing number of countries. A series of 4 further Export Awards (2003, 2008, 2012 and 2016) is a testimony to just that.':
    'Die folgenden Jahre erlebten eine erhebliche Ausweitung der globalen Reichweite und Marktabdeckung. Produkte von Elysée waren auf allen 5 Kontinenten und in einer stetig wachsenden Zahl von Ländern zu finden. Eine Reihe von 4 weiteren Exportpreisen (2003, 2008, 2012 und 2016) ist genau dafür ein Beleg.',
  'Our international network of selected partners currently spans 65 markets, where Elysée is active in 4 sectors — Water Supply, Irrigation, Infrastructure and Energy. To respond directly to the changing needs of the global market, Elysée has expanded its operations by establishing 3 distribution centres in Austria, Russia, and Lebanon.':
    'Unser internationales Netzwerk ausgewählter Partner erstreckt sich derzeit über 65 Märkte, in denen Elysée in 4 Sektoren tätig ist — Wasserversorgung, Bewässerung, Infrastruktur und Energie. Um direkt auf die sich wandelnden Bedürfnisse des globalen Marktes zu reagieren, hat Elysée seine Tätigkeit durch die Einrichtung von 3 Vertriebszentren in Österreich, Russland und im Libanon erweitert.',
  'Our international network of selected partners spans 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by 3 distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.':
    'Unser internationales Netzwerk ausgewählter Partner erstreckt sich über 65 Märkte in vier Sektoren — Wasserversorgung, Bewässerung, Infrastruktur und Energie —, unterstützt von 3 Vertriebszentren in Österreich, Russland und im Libanon sowie einem Netzwerk lokaler Handelsvertreter und Vertriebsmitarbeiter.',
  'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:':
    'Das Produktsortiment, das Elysée in den 1980er-Jahren bekannt machte, bildet noch heute das Fundament des Katalogs:',
  'Enquiries and orders reach us through our wide network of local agents and sales representatives.':
    'Anfragen und Bestellungen erreichen uns über unser weitreichendes Netzwerk lokaler Handelsvertreter und Vertriebsmitarbeiter.',

  // ============================================================================
  // Company Structure — /about-us/company-structure/
  // ============================================================================
  // Hero
  'An efficient team.': 'Ein effizientes Team.',
  'A clear structure.': 'Eine klare Struktur.',
  'Three divisions, one workshop in Cyprus — engineered around quick response, certified quality, and a growing product range.':
    'Drei Abteilungen, eine Werkstatt in Zypern — ausgelegt auf schnelle Reaktion, zertifizierte Qualität und ein wachsendes Produktsortiment.',
  // Stat band
  'Production divisions': 'Produktionsabteilungen',
  'Fittings catalogued': 'Katalogisierte Fittings',
  'Pipe diameter range (mm)': 'Rohrdurchmesserbereich (mm)',
  // Efficient team
  'An efficient team': 'Ein effizientes Team',
  "Built for the customer's call.": 'Gebaut für den Anruf des Kunden.',
  'Three operating principles that keep our workshop in step with the people we ship to — from a first phone call through a custom order to a long-term partnership.':
    'Drei Betriebsprinzipien, die unsere Werkstatt im Einklang mit den Menschen halten, an die wir liefern — vom ersten Telefonanruf über eine Sonderbestellung bis hin zu einer langfristigen Partnerschaft.',
  'From the floor': 'Aus der Fertigung',
  'Engineers, consultants, makers': 'Ingenieure, Berater, Macher',
  'Three principles. One workshop in Ergates.': 'Drei Prinzipien. Eine Werkstatt in Ergates.',
  'Flexible by design': 'Flexibel konzipiert',
  'Engineering at the front desk': 'Technik am Empfang',
  'Quality covers both sides': 'Qualität deckt beide Seiten ab',
  // Divisions
  'Our divisions': 'Unsere Abteilungen',
  'Three teams, one workshop.': 'Drei Teams, eine Werkstatt.',
  'Fittings Division': 'Fittings-Abteilung',
  'Pipes Division': 'Rohr-Abteilung',
  'Quality Assurance Division': 'Qualitätssicherungs-Abteilung',
  'Explore Fittings': 'Fittings entdecken',
  'Explore Pipes': 'Rohre entdecken',
  'See certifications': 'Zertifizierungen ansehen',
  // Closing CTA
  'Want to discuss a specific application, a custom OEM run, or a project specification? Our engineers and technical consultants are available to advise.':
    'Möchten Sie eine bestimmte Anwendung, eine kundenspezifische OEM-Fertigung oder eine Projektspezifikation besprechen? Unsere Ingenieure und technischen Berater stehen Ihnen beratend zur Seite.',
  // Company Structure — dynamic content
  'With flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and we regularly upgrade existing products to create a constantly growing range.':
    'Mit einer flexiblen Organisationsstruktur gewährleistet Elysée eine schnelle Reaktion auf Kundenanfragen, Bestellungen und Möglichkeiten zur Zusammenarbeit. Jedes Jahr werden neue Produkte entwickelt, und wir aktualisieren regelmäßig bestehende Produkte, um ein stetig wachsendes Sortiment zu schaffen.',
  "Our team of expert engineers and technical consultants is constantly available to offer technical advice to our clients on the use of Elysée's fittings and piping systems.":
    'Unser Team aus erfahrenen Ingenieuren und technischen Beratern steht unseren Kunden ständig zur Verfügung, um technische Beratung zur Verwendung der Fittings und Rohrsysteme von Elysée zu bieten.',
  'We at Elysée realize that from a customer\'s perspective, the term "quality" covers both the product and the service. Our ever growing customer list reflects our determination to settle for nothing less.':
    'Wir bei Elysée wissen, dass der Begriff „Qualität" aus Sicht des Kunden sowohl das Produkt als auch die Dienstleistung umfasst. Unsere stetig wachsende Kundenliste spiegelt unsere Entschlossenheit wider, uns mit nichts Geringerem zufriedenzugeben.',
  'As a business, our green credentials are very important to us, and so our desire to innovate extends from our product development to our business processes. Implementing Lean Kaizen techniques has brought with it an increase in efficiency and a decrease in waste. We\'ve reduced our environmental impact by reducing our energy consumption and keeping the waste we send to landfill to a minimum. By increasing our efficiency, we\'re boosting our productivity and protecting our planet too.':
    'Als Unternehmen sind uns unsere grünen Werte sehr wichtig, und so erstreckt sich unser Innovationswille von der Produktentwicklung bis hin zu unseren Geschäftsprozessen. Die Einführung von Lean-Kaizen-Techniken hat eine Steigerung der Effizienz und eine Verringerung des Abfalls mit sich gebracht. Wir haben unsere Umweltauswirkungen reduziert, indem wir unseren Energieverbrauch gesenkt und die auf Deponien verbrachten Abfälle auf ein Minimum beschränkt haben. Durch die Steigerung unserer Effizienz erhöhen wir unsere Produktivität und schützen zugleich unseren Planeten.',
  'Elysée operates through three core production divisions, each focused on a specific area of manufacturing and quality assurance.':
    'Elysée arbeitet durch drei zentrale Produktionsabteilungen, von denen sich jede auf einen bestimmten Bereich der Fertigung und Qualitätssicherung konzentriert.',
  'Focusing on the production of pipe fittings and irrigation accessories, the Fittings Division manufactures over 1000 items in different sizes and for diverse applications, made of the most suitable raw materials in each case, from polypropylene to polyacetal and nylon.':
    'Mit Fokus auf die Produktion von Rohrfittings und Bewässerungszubehör fertigt die Fittings-Abteilung über 1000 Artikel in verschiedenen Größen und für unterschiedliche Anwendungen, jeweils aus den am besten geeigneten Rohstoffen, von Polypropylen über Polyacetal bis hin zu Nylon.',
  'The division manufactures PVC and PE pipes with a diameter range of 5–315 mm, suitable for a wide range of practical applications.':
    'Die Abteilung fertigt PVC- und PE-Rohre mit einem Durchmesserbereich von 5–315 mm, geeignet für ein breites Spektrum praktischer Anwendungen.',
  'The Quality Assurance Division is dedicated to implementing, sustaining and improving the quality at every level of production, from the raw material through to the finished product. With the aid of sophisticated equipment and apparatus, we can verify that the final products do in fact conform to national and international standards.':
    'Die Qualitätssicherungs-Abteilung widmet sich der Umsetzung, Aufrechterhaltung und Verbesserung der Qualität auf jeder Produktionsebene, vom Rohstoff bis zum Fertigprodukt. Mithilfe ausgefeilter Geräte und Apparate können wir überprüfen, dass die Endprodukte tatsächlich den nationalen und internationalen Normen entsprechen.',
  'Green Operations': 'Grüne Abläufe',
  'Our operating principle': 'Unser Betriebsprinzip',

  // ============================================================================
  // Vision, Mission & Values — /about-us/vision-mission-values/
  // ============================================================================
  // Hero (h1 is split across a <br/> into two fragments)
  'Vision, Mission': 'Vision, Mission',
  '& Values.': '& Werte.',
  'What drives us, every day, in every market.': 'Was uns antreibt, jeden Tag, in jedem Markt.',
  // Framework
  'By the framework': 'Nach dem Rahmenwerk',
  'One vision. Five pillars. Six values.': 'Eine Vision. Fünf Säulen. Sechs Werte.',
  'Vision sets the destination. Mission sets the pace. Values set the tone. The W·I·S·E framework is the test we hold every product, every process and every partnership to.':
    'Die Vision setzt das Ziel. Die Mission setzt das Tempo. Die Werte setzen den Ton. Das W·I·S·E-Rahmenwerk ist der Prüfstein, an dem wir jedes Produkt, jeden Prozess und jede Partnerschaft messen.',
  'Reads': 'Leserichtung',
  'Top → bottom': 'Oben → unten',
  'Anchor': 'Anker',
  'Updated': 'Aktualisiert',
  'Chapter One · Destination': 'Kapitel Eins · Ziel',
  'Chapter Two · Pace': 'Kapitel Zwei · Tempo',
  'Chapter Three · Tone': 'Kapitel Drei · Ton',
  'Anchor · The test': 'Anker · Der Prüfstein',
  'Vision': 'Vision',
  'Mission pillars': 'Säulen der Mission',
  'Core values': 'Kernwerte',
  'Framework': 'Rahmenwerk',
  'A single statement of where Elysée is heading — green leadership worldwide through W·I·S·E piping systems.':
    'Eine einzige Aussage darüber, wohin Elysée strebt — grüne Führungsrolle weltweit durch W·I·S·E-Rohrsysteme.',
  'Five commitments that translate the Vision into day-to-day priorities — for customers, people, growth and the planet.':
    'Fünf Verpflichtungen, die die Vision in tägliche Prioritäten übersetzen — für Kunden, Menschen, Wachstum und den Planeten.',
  'Six principles that guide how we work with each other, with our customers and with the environment we operate in.':
    'Sechs Prinzipien, die bestimmen, wie wir miteinander, mit unseren Kunden und mit der Umwelt, in der wir tätig sind, zusammenarbeiten.',
  'Worldwide. Innovative. Smart. Easy-to-Use. The four words we test every product, process and partnership against.':
    'Weltweit. Innovativ. Smart. Einfach zu bedienen. Die vier Wörter, an denen wir jedes Produkt, jeden Prozess und jede Partnerschaft messen.',
  // Why we exist
  'Why we exist': 'Warum wir existieren',
  'Customer-first, by design.': 'Der Kunde zuerst, von Grund auf.',
  'Three sentences that set the operating philosophy for the entire company.':
    'Drei Sätze, die die Betriebsphilosophie des gesamten Unternehmens festlegen.',
  // Vision cinematic
  'Chapter One · Our Vision': 'Kapitel Eins · Unsere Vision',
  // WISE strip
  'The W·I·S·E framework': 'Das W·I·S·E-Rahmenwerk',
  'Four letters, one operating philosophy.': 'Vier Buchstaben, eine Betriebsphilosophie.',
  'Every product, every process, every partnership is tested against four words. They appear together as W·I·S·E — and they precede the Vision, the Mission, and every Value below.':
    'Jedes Produkt, jeder Prozess, jede Partnerschaft wird an vier Wörtern gemessen. Sie erscheinen gemeinsam als W·I·S·E — und sie stehen vor der Vision, der Mission und jedem Wert unten.',
  'Worldwide': 'Weltweit',
  'Innovative': 'Innovativ',
  'Smart': 'Smart',
  'Easy-to-Use': 'Einfach zu bedienen',
  'Engineered for 65 destinations across four sectors.':
    'Konstruiert für 65 Ziele in vier Sektoren.',
  'Forty years of R&D, six EU-funded research programmes.':
    'Vierzig Jahre F&E, sechs EU-geförderte Forschungsprogramme.',
  'Designed for easy install, low maintenance, long life.':
    'Konzipiert für einfache Installation, geringen Wartungsaufwand, lange Lebensdauer.',
  'Field-proven fittings, intuitive systems, technical advice on call.':
    'Praxiserprobte Fittings, intuitive Systeme, technische Beratung auf Abruf.',
  // Mission
  'Chapter Two · Our Mission': 'Kapitel Zwei · Unsere Mission',
  'Five commitments. One workshop.': 'Fünf Verpflichtungen. Eine Werkstatt.',
  'Five commitments translate the Vision into day-to-day priorities — for our customers, our people, our growth, and the planet.':
    'Fünf Verpflichtungen übersetzen die Vision in tägliche Prioritäten — für unsere Kunden, unsere Mitarbeiter, unser Wachstum und den Planeten.',
  'Mission anchor': 'Anker der Mission',
  'Streaming water, streaming life': 'Streaming water, streaming life',
  'Five pillars that turn the brand promise into practice.':
    'Fünf Säulen, die das Markenversprechen in die Praxis umsetzen.',
  'Preserve water for future generations': 'Wasser für künftige Generationen bewahren',
  'Give partners a competitive edge': 'Partnern einen Wettbewerbsvorteil verschaffen',
  'Lead our people to full potential': 'Unsere Mitarbeiter zu ihrem vollen Potenzial führen',
  'Sustainable, profitable growth': 'Nachhaltiges, profitables Wachstum',
  'Better Earth, better society': 'Bessere Erde, bessere Gesellschaft',
  // Mission list (dynamic from site-content)
  'Develop W.I.S.E. Products to preserve water resources for future generations.':
    'W.I.S.E.-Produkte entwickeln, um Wasserressourcen für künftige Generationen zu bewahren.',
  'Provide our Customers and Partners with a competitive edge.':
    'Unseren Kunden und Partnern einen Wettbewerbsvorteil bieten.',
  'Lead our people to meet their full potential.':
    'Unsere Mitarbeiter dazu führen, ihr volles Potenzial auszuschöpfen.',
  'Achieve sustainable and profitable company growth.':
    'Nachhaltiges und profitables Unternehmenswachstum erreichen.',
  'Contribute to Society and the Environment, making Earth a better place to live.':
    'Zu Gesellschaft und Umwelt beitragen und die Erde zu einem besseren Ort zum Leben machen.',
  // Values
  'Chapter Three · Our Values': 'Kapitel Drei · Unsere Werte',
  'Six principles, not posters.': 'Sechs Prinzipien, keine Poster.',
  'Six principles that guide how we work — with each other, with our customers and with the environment we operate in.':
    'Sechs Prinzipien, die bestimmen, wie wir arbeiten — miteinander, mit unseren Kunden und mit der Umwelt, in der wir tätig sind.',
  'Business-driven innovation': 'Geschäftsorientierte Innovation',
  'Green thinking': 'Grünes Denken',
  'Customer commitment and value creation': 'Engagement für den Kunden und Wertschöpfung',
  'Quality and continuous improvement': 'Qualität und kontinuierliche Verbesserung',
  'Respect each other and win as a team': 'Einander respektieren und als Team gewinnen',
  'Promote personal and professional growth': 'Persönliches und berufliches Wachstum fördern',
  'Every new product starts with a real-world problem we have heard from customers.':
    'Jedes neue Produkt beginnt mit einem realen Problem, das wir von Kunden gehört haben.',
  'Sustainability lives in our procurement, our process and our packaging.':
    'Nachhaltigkeit lebt in unserer Beschaffung, unserem Prozess und unserer Verpackung.',
  'Long-term partnerships beat one-off transactions, every time.':
    'Langfristige Partnerschaften schlagen einmalige Transaktionen, jedes Mal.',
  'ISO 9001 since 1998. Improvement is a daily practice, not a target.':
    'ISO 9001 seit 1998. Verbesserung ist eine tägliche Praxis, kein Ziel.',
  'Three generations of family business — built on accountability.':
    'Drei Generationen Familienunternehmen — aufgebaut auf Verantwortlichkeit.',
  'We invest in the people who build, ship and back our products.':
    'Wir investieren in die Menschen, die unsere Produkte bauen, versenden und unterstützen.',
  // VMV intro/vision (dynamic from site-content)
  'Our customers are at the heart of everything we do, so that is what we focus on. We design innovative piping solutions for easy installation, durability, and minimal maintenance — and we tailor them, through our expert advisors and OEM programmes, to the specific needs of each customer.':
    'Unsere Kunden stehen im Mittelpunkt all dessen, was wir tun, und darauf konzentrieren wir uns. Wir entwerfen innovative Rohrlösungen für einfache Installation, Langlebigkeit und minimalen Wartungsaufwand — und passen sie über unsere fachkundigen Berater und OEM-Programme an die spezifischen Bedürfnisse jedes Kunden an.',
  'To be a green leader worldwide through Innovative, Smart, Easy-to-Use Piping Systems.':
    'Ein grüner Marktführer weltweit zu sein durch innovative, smarte, einfach zu bedienende Rohrsysteme.',
  // VMV closing CTA
  'Our Vision, Mission and Values are not posters on a wall — they shape every decision we make, from product design to customer service. Talk to us about how we put them into practice.':
    'Unsere Vision, Mission und Werte sind keine Poster an der Wand — sie prägen jede Entscheidung, die wir treffen, vom Produktdesign bis zum Kundenservice. Sprechen Sie mit uns darüber, wie wir sie in die Praxis umsetzen.',

  // ============================================================================
  // Quality & Certifications — /about-us/quality-certifications/
  // ============================================================================
  // Hero
  'Quality, by certificate.': 'Qualität, per Zertifikat.',
  // Stat band
  'Years accredited': 'Jahre akkreditiert',
  'Certificate bodies': 'Zertifizierungsstellen',
  'Batches certified': 'Zertifizierte Chargen',
  // A matter of principle
  'A matter of principle': 'Eine Frage des Prinzips',
  'Patented, engineered, certified.': 'Patentiert, konstruiert, zertifiziert.',
  'Two paragraphs that anchor everything we do — from the resin we accept to the certificate we ship with every order.':
    'Zwei Absätze, die alles verankern, was wir tun — vom Harz, das wir annehmen, bis zum Zertifikat, das wir mit jeder Bestellung versenden.',
  // ISO callout
  'Cornerstone certification': 'Eckpfeiler-Zertifizierung',
  // How we verify
  'How we verify': 'Wie wir prüfen',
  'Four steps. Every batch. Every time.': 'Vier Schritte. Jede Charge. Jedes Mal.',
  'The same four checks happen on every shipment: incoming material, in-process QC, finished batch sampling and a traceable certificate.':
    'Bei jeder Lieferung finden dieselben vier Prüfungen statt: Eingangsmaterial, prozessbegleitende Qualitätskontrolle, Stichprobenprüfung der fertigen Charge und ein rückverfolgbares Zertifikat.',
  'Cadence': 'Taktung',
  'Every batch': 'Jede Charge',
  'Standard': 'Norm',
  'Step One · Material': 'Schritt Eins · Material',
  'Step Two · Process': 'Schritt Zwei · Prozess',
  'Step Three · Product': 'Schritt Drei · Produkt',
  'Step Four · Certificate': 'Schritt Vier · Zertifikat',
  'Material check': 'Materialprüfung',
  'In-process QC': 'Prozessbegleitende Qualitätskontrolle',
  'Batch testing': 'Chargenprüfung',
  'Documented release': 'Dokumentierte Freigabe',
  'Every incoming PE and PVC resin batch is tested against our internal spec sheet before it enters production.':
    'Jede eingehende Charge von PE- und PVC-Harz wird vor Eintritt in die Produktion anhand unseres internen Spezifikationsblatts geprüft.',
  'Continuous in-line monitoring during extrusion and moulding flags drift before it ever reaches a finished part.':
    'Kontinuierliche Inline-Überwachung während der Extrusion und des Spritzgießens erkennt Abweichungen, bevor sie jemals ein Fertigteil erreichen.',
  'Finished batches are sampled against ISO and EN test methods — burst, impact, environmental and dimensional.':
    'Fertige Chargen werden anhand von ISO- und EN-Prüfverfahren stichprobenartig getestet — Berstdruck, Schlagfestigkeit, Umweltbeständigkeit und Maßhaltigkeit.',
  'Every shipment ships with traceable documentation — request a certificate for any tender or specification.':
    'Jede Lieferung wird mit rückverfolgbarer Dokumentation versendet — fordern Sie ein Zertifikat für jede Ausschreibung oder Spezifikation an.',
  // Six categories
  'Our certifications': 'Unsere Zertifizierungen',
  'Six categories of certificate.': 'Sechs Kategorien von Zertifikaten.',
  'View certificates': 'Zertifikate ansehen',
  // Closing CTA
  'Request a certificate': 'Ein Zertifikat anfordern',
  'Need a specific certificate for a tender, regulatory submission, or specification document? Our team can provide it on request.':
    'Benötigen Sie ein bestimmtes Zertifikat für eine Ausschreibung, eine behördliche Einreichung oder ein Spezifikationsdokument? Unser Team stellt es Ihnen auf Anfrage bereit.',
  'Contact our local network': 'Kontaktieren Sie unser lokales Netzwerk',
  // Q&C — dynamic content (from site-content.ts)
  'Developed to the highest of standards, Elysée products are patented and engineered in-house in our own R&D department. Offering eco-friendly, corrosion-free, and easy-to-install solutions at great value prices, resulting in the highest level of customer satisfaction.':
    'Nach höchsten Standards entwickelt, sind die Produkte von Elysée patentiert und werden intern in unserer eigenen F&E-Abteilung konstruiert. Sie bieten umweltfreundliche, korrosionsfreie und einfach zu installierende Lösungen zu Preisen mit hervorragendem Preis-Leistungs-Verhältnis, was zu höchster Kundenzufriedenheit führt.',
  'Ever since our establishment, quality has been a major principle covering Elysée operations. By introducing a quality management system, we are able to monitor our activities and efficiency, in order to elevate our overall performance. Today Elysée Irrigation LTD proudly holds internationally renowned certificates of piping systems, a testimony of commitment to quality.':
    'Seit unserer Gründung ist Qualität ein wesentliches Prinzip, das die Abläufe von Elysée durchdringt. Durch die Einführung eines Qualitätsmanagementsystems sind wir in der Lage, unsere Aktivitäten und Effizienz zu überwachen, um unsere Gesamtleistung zu steigern. Heute hält Elysée Irrigation LTD mit Stolz international renommierte Zertifikate für Rohrsysteme, ein Zeugnis des Engagements für Qualität.',
  'Elysée products are certified by the most reputable international standards organizations. Our portfolio is organised into six categories, mirroring the way our products reach the market.':
    'Die Produkte von Elysée sind von den renommiertesten internationalen Normungsorganisationen zertifiziert. Unser Portfolio ist in sechs Kategorien gegliedert, die widerspiegeln, wie unsere Produkte auf den Markt gelangen.',
  'Elysée achieved ISO 9001 certification in 1998 following the formal establishment of its quality-control division — a commitment to quality management that has been maintained and renewed continuously ever since.':
    'Elysée erlangte 1998 die ISO-9001-Zertifizierung nach der formellen Einrichtung seiner Qualitätskontrollabteilung — ein Bekenntnis zum Qualitätsmanagement, das seither kontinuierlich aufrechterhalten und erneuert wurde.',
  'ISO 9001 since 1998': 'ISO 9001 seit 1998',
  'Management System': 'Managementsystem',
  'General': 'Allgemein',
  'PE Pipes': 'PE-Rohre',
  'PVC Pipes': 'PVC-Rohre',
  'ISO 9001 quality management — certified since 1998 and renewed continuously.':
    'ISO-9001-Qualitätsmanagement — zertifiziert seit 1998 und kontinuierlich erneuert.',
  'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.':
    'Produktübergreifende Zertifizierungen von international anerkannten Stellen, darunter DVGW, KIWA, SII und OVGW.',
  'Product certifications covering the full Elysée compression-fitting range for water-supply applications.':
    'Produktzertifizierungen für das gesamte Klemmfitting-Sortiment von Elysée für Wasserversorgungsanwendungen.',
  'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.':
    'Zertifizierungen für Polyethylenrohre über den gesamten gefertigten Durchmesserbereich, geeignet für Trinkwasser, Gas und industrielle Flüssigkeiten.',
  'PVC pipe certifications for water-supply, drainage and infrastructure applications.':
    'Zertifizierungen für PVC-Rohre für Anwendungen in Wasserversorgung, Entwässerung und Infrastruktur.',
  'Environmental and sustainability certifications attached to the Green Elysée product line.':
    'Umwelt- und Nachhaltigkeitszertifizierungen, die mit der Produktlinie Green Elysée verbunden sind.',

  // ============================================================================
  // Quality & Certifications — category detail pages (shared chrome)
  // ============================================================================
  'All certificate categories': 'Alle Zertifikatskategorien',
  // Hero "<count> certified …" trailing phrase (count stays in its own span)
  'certified standards': 'zertifizierte Normen',
  'certified recognitions': 'zertifizierte Auszeichnungen',
  'certified approvals': 'zertifizierte Zulassungen',
  'standards.': 'Normen.',
  'PDFs.': 'PDFs.',
  'Tap any badge below to download the current certificate.':
    'Tippen Sie unten auf ein beliebiges Abzeichen, um das aktuelle Zertifikat herunterzuladen.',
  'Standard families': 'Normfamilien',
  'Audit cadence': 'Audit-Taktung',
  'Annual': 'Jährlich',
  'Markets covered': 'Abgedeckte Märkte',
  'Product certificates': 'Produktzertifikate',
  // general.astro
  'Recognised, by certificate.': 'Anerkannt, per Zertifikat.',
  'Beyond the product line': 'Über die Produktlinie hinaus',
  'Recognitions': 'Auszeichnungen',
  'Productivity programme': 'Produktivitätsprogramm',
  'Packaging recovery': 'Verpackungsverwertung',
  'Review cadence': 'Überprüfungs-Taktung',
  'Beyond the product': 'Über das Produkt hinaus',
  'Quality, outside the box.': 'Qualität, über den Tellerrand hinaus.',
  'Not every certificate fits a product family — some recognise how the company works, trains, and takes responsibility.':
    'Nicht jedes Zertifikat passt zu einer Produktfamilie — einige würdigen, wie das Unternehmen arbeitet, ausbildet und Verantwortung übernimmt.',
  "Pipes and fittings carry most of Elysée's certificates — but quality runs wider than the product catalogue. The recognitions on this page cover the company itself: the national productivity-improvement programme we take part in, and our membership of the Green Dot packaging recovery scheme.":
    'Rohre und Fittings tragen die meisten Zertifikate von Elysée — doch Qualität reicht weiter als der Produktkatalog. Die Auszeichnungen auf dieser Seite betreffen das Unternehmen selbst: das nationale Programm zur Produktivitätssteigerung, an dem wir teilnehmen, und unsere Mitgliedschaft im Green-Dot-Verpackungsrücknahmesystem.',
  'Like every other certificate we hold, each one is issued by an independent body and downloadable below — the same documents we provide for tenders, partnerships, and corporate due diligence.':
    'Wie jedes andere Zertifikat, das wir besitzen, wird jedes von einer unabhängigen Stelle ausgestellt und ist unten herunterladbar — dieselben Dokumente, die wir für Ausschreibungen, Partnerschaften und die unternehmerische Sorgfaltsprüfung bereitstellen.',
  'The wider picture': 'Das größere Bild',
  'Quality is a habit, not a category.': 'Qualität ist eine Gewohnheit, keine Kategorie.',
  'Our General Certifications': 'Unsere allgemeinen Zertifizierungen',
  "Need an older certificate, a tender-ready bundle, or evidence of a recognition you don't see here? Our team can prepare it on request.":
    'Benötigen Sie ein älteres Zertifikat, ein ausschreibungsfertiges Paket oder den Nachweis einer Auszeichnung, die Sie hier nicht sehen? Unser Team kann es auf Anfrage vorbereiten.',
  // management-system.astro
  'Managed, by certificate.': 'Gesteuert, per Zertifikat.',
  'The management system': 'Das Managementsystem',
  'System certificates': 'Systemzertifikate',
  'Why a system, not a checklist': 'Warum ein System, keine Checkliste',
  'One system. Four disciplines.': 'Ein System. Vier Disziplinen.',
  'Quality, environment, energy, and health & safety — each independently certified, all bound by one integrated policy.':
    'Qualität, Umwelt, Energie und Gesundheit & Sicherheit — jede unabhängig zertifiziert, alle durch eine integrierte Richtlinie verbunden.',
  'Elysée has run a certified quality management system since 1998. Over the years it has grown into a single integrated framework: ISO 9001 for quality, ISO 14001 and EMAS for the environment, ISO 50001 for energy, and ISO 45001 for the health and safety of everyone on site.':
    'Elysée betreibt seit 1998 ein zertifiziertes Qualitätsmanagementsystem. Über die Jahre ist es zu einem einzigen integrierten Rahmenwerk gewachsen: ISO 9001 für Qualität, ISO 14001 und EMAS für die Umwelt, ISO 50001 für Energie und ISO 45001 für die Gesundheit und Sicherheit aller vor Ort.',
  'Every standard below is audited by an independent certification body on an annual cycle, and every claim is backed by a downloadable certificate — the same documents we submit with tenders, regulatory filings, and specification packages.':
    'Jede Norm unten wird von einer unabhängigen Zertifizierungsstelle in einem jährlichen Zyklus auditiert, und jede Angabe ist durch ein herunterladbares Zertifikat belegt — dieselben Dokumente, die wir mit Ausschreibungen, behördlichen Einreichungen und Spezifikationspaketen einreichen.',
  'The discipline behind the product': 'Die Disziplin hinter dem Produkt',
  'Say what you do. Do what you say. Prove it.':
    'Sagen Sie, was Sie tun. Tun Sie, was Sie sagen. Beweisen Sie es.',
  'Our Management System Certifications': 'Unsere Managementsystem-Zertifizierungen',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific management standard? Our team can prepare it on request.':
    'Benötigen Sie ein älteres Zertifikat, ein ausschreibungsfertiges Paket oder den Nachweis für eine bestimmte Managementnorm? Unser Team kann es auf Anfrage vorbereiten.',
  // compression-fittings.astro
  'Approved, by certificate.': 'Zugelassen, per Zertifikat.',
  'The fittings programme': 'Das Fittings-Programm',
  'Why approvals matter': 'Warum Zulassungen wichtig sind',
  'One fitting. Twelve markets.': 'Ein Fitting. Zwölf Märkte.',
  'From KIWA to WaterMark — every market Elysée fittings ship to has its own approval body, and the range is certified in each one.':
    'Von KIWA bis WaterMark — jeder Markt, an den Fittings von Elysée geliefert werden, hat seine eigene Zulassungsstelle, und das Sortiment ist in jedem einzelnen zertifiziert.',
  'Drinking water is the most regulated product there is — and every country guards it with its own approval scheme. The Elysée compression-fitting range carries them across Europe and beyond: DVGW in Germany, WRAS in the UK, KIWA in the Netherlands, SVGW in Switzerland, ÖVGW in Austria, WaterMark in Australia, and more.':
    'Trinkwasser ist das am stärksten regulierte Produkt überhaupt — und jedes Land schützt es mit seinem eigenen Zulassungssystem. Das Klemmfitting-Sortiment von Elysée trägt sie in ganz Europa und darüber hinaus: DVGW in Deutschland, WRAS im Vereinigten Königreich, KIWA in den Niederlanden, SVGW in der Schweiz, ÖVGW in Österreich, WaterMark in Australien und weitere.',
  'Each approval below is issued by an independent national body against EN 12201-3, ISO 17885, or the local water-contact regulations — and each one is downloadable as the current PDF, ready for tenders, specifications, and regulatory submissions.':
    'Jede Zulassung unten wird von einer unabhängigen nationalen Stelle nach EN 12201-3, ISO 17885 oder den örtlichen Vorschriften für den Wasserkontakt ausgestellt — und jede ist als aktuelles PDF herunterladbar, bereit für Ausschreibungen, Spezifikationen und behördliche Einreichungen.',
  'Worldwide approvals': 'Weltweite Zulassungen',
  'Approved at home — wherever home is.': 'Zugelassen zu Hause — wo immer das Zuhause auch ist.',
  'Our Compression Fittings Certifications': 'Unsere Klemmfitting-Zertifizierungen',
  "Need an older certificate, a tender-ready bundle, or an approval for a market you don't see here? Our team can prepare it on request.":
    'Benötigen Sie ein älteres Zertifikat, ein ausschreibungsfertiges Paket oder eine Zulassung für einen Markt, den Sie hier nicht sehen? Unser Team kann es auf Anfrage vorbereiten.',
  // pe-pipes.astro
  'Proven, by certificate.': 'Nachgewiesen, per Zertifikat.',
  'The PE programme': 'Das PE-Programm',
  'Core standard': 'Kernnorm',
  'PE materials covered': 'Abgedeckte PE-Materialien',
  'From resin to reel': 'Vom Harz bis zur Rolle',
  'Every diameter, certified.': 'Jeder Durchmesser, zertifiziert.',
  'From HDPE mains to LDPE irrigation lines — the polyethylene range is certified across every diameter we extrude.':
    'Von HDPE-Hauptleitungen bis zu LDPE-Bewässerungsleitungen — das Polyethylen-Sortiment ist über jeden Durchmesser zertifiziert, den wir extrudieren.',
  "Polyethylene pipe carries water under pressure for decades — so its certification leaves no room for interpretation. Elysée's HDPE range is certified to EN 12201-2 across the manufactured diameter range, while the LDPE line carries the Cyprus national standard CYS 106.":
    'Polyethylenrohr leitet Wasser über Jahrzehnte unter Druck — daher lässt seine Zertifizierung keinen Raum für Interpretationen. Das HDPE-Sortiment von Elysée ist über den gesamten gefertigten Durchmesserbereich nach EN 12201-2 zertifiziert, während die LDPE-Reihe die zyprische nationale Norm CYS 106 trägt.',
  'Around the core standards sit market approvals — AENOR certification to ISO 15875 and WRAS approval for stop valves in UK drinking-water installations. Every certificate is audited annually and downloadable below.':
    'Um die Kernnormen herum liegen Marktzulassungen — AENOR-Zertifizierung nach ISO 15875 und WRAS-Zulassung für Absperrventile in Trinkwasserinstallationen im Vereinigten Königreich. Jedes Zertifikat wird jährlich auditiert und ist unten herunterladbar.',
  'Built for pressure': 'Für Druck gebaut',
  'Pressure-rated. Paper-backed.': 'Druckgeprüft. Urkundlich belegt.',
  'Our PE Pipes Certifications': 'Unsere PE-Rohr-Zertifizierungen',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific diameter class? Our team can prepare it on request.':
    'Benötigen Sie ein älteres Zertifikat, ein ausschreibungsfertiges Paket oder den Nachweis für eine bestimmte Durchmesserklasse? Unser Team kann es auf Anfrage vorbereiten.',
  // pvc-pipes.astro
  'Specified, by certificate.': 'Spezifiziert, per Zertifikat.',
  'The PVC programme': 'Das PVC-Programm',
  'Drainage standard': 'Entwässerungsnorm',
  'Pressure standard': 'Drucknorm',
  'Under every street': 'Unter jeder Straße',
  'Drainage to conduit, certified.': 'Von der Entwässerung bis zum Kabelschutzrohr, zertifiziert.',
  'Four standards cover the PVC range — underground drainage, soil & waste, pressure systems, and electrical conduit.':
    'Vier Normen decken das PVC-Sortiment ab — unterirdische Entwässerung, Schmutz- & Abwasser, Drucksysteme und elektrische Kabelschutzrohre.',
  'PVC pipe disappears into the ground and stays there for generations — which is exactly why specifiers ask for the paperwork first. The Elysée PVC range is certified to EN 1401 for underground drainage and sewage, EN 1329 for soil and waste discharge, and EN ISO 1452 for pressure water supply.':
    'PVC-Rohr verschwindet im Boden und bleibt dort über Generationen — genau deshalb verlangen Planer zuerst die Unterlagen. Das PVC-Sortiment von Elysée ist nach EN 1401 für unterirdische Entwässerung und Abwasser, EN 1329 für die Schmutz- und Abwasserableitung und EN ISO 1452 für die Druckwasserversorgung zertifiziert.',
  'A fourth standard, EN 61386, covers conduit systems for electrical infrastructure. Each certificate is audited annually by an independent body and downloadable below — ready for tenders, specifications, and regulatory submissions.':
    'Eine vierte Norm, EN 61386, deckt Kabelschutzrohrsysteme für die elektrische Infrastruktur ab. Jedes Zertifikat wird jährlich von einer unabhängigen Stelle auditiert und ist unten herunterladbar — bereit für Ausschreibungen, Spezifikationen und behördliche Einreichungen.',
  'Built to disappear': 'Gebaut, um zu verschwinden',
  'Buried for decades. Certified for all of them.':
    'Jahrzehntelang vergraben. Für sie alle zertifiziert.',
  'Our PVC Pipes Certifications': 'Unsere PVC-Rohr-Zertifizierungen',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific application class? Our team can prepare it on request.':
    'Benötigen Sie ein älteres Zertifikat, ein ausschreibungsfertiges Paket oder den Nachweis für eine bestimmte Anwendungsklasse? Unser Team kann es auf Anfrage vorbereiten.',
  // QUALITY_CATEGORIES blurbs (rendered as {meta.blurb} on detail hero/intro)
  'Quality, environmental, energy, and health & safety management system certificates.':
    'Zertifikate für Managementsysteme in den Bereichen Qualität, Umwelt, Energie und Gesundheit & Sicherheit.',
  'Miscellaneous certificates and recognitions held by Elysée.':
    'Verschiedene Zertifikate und Auszeichnungen, die Elysée innehat.',
  'Product certificates covering the full Elysée compression-fitting range.':
    'Produktzertifikate für das gesamte Klemmfitting-Sortiment von Elysée.',
  'Polyethylene pipe certificates across the manufactured diameter range.':
    'Zertifikate für Polyethylenrohre über den gesamten gefertigten Durchmesserbereich.',
  'PVC pipe certificates for water-supply, drainage and infrastructure applications.':
    'Zertifikate für PVC-Rohre für Anwendungen in Wasserversorgung, Entwässerung und Infrastruktur.',
};
