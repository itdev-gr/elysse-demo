// English UI string → French for the ABOUT-US section: the Corporate Profile,
// History, Company Structure, Vision/Mission/Values and Quality & Certifications
// pages (plus the about-only AboutSubNav). Keyed by the English source text so
// it doubles as the fallback. Strings already in shared.ts (e.g. nav labels,
// "Read more") are NOT repeated. Brand/proper names (Elysée, Green Elysée),
// certification body names/acronyms (DVGW, KIWA, ISO …), emails, URLs, dates
// and numeric stats are intentionally left untranslated.
export const about: Record<string, string> = {
  // ───────────────────────── AboutSubNav (about-only) ─────────────────────────
  'In this section': "Dans cette section",
  'About Us section': "Section À propos",

  // ============================================================================
  // Corporate Profile — /about-us/
  // ============================================================================
  // Hero
  'A family business, since 1979.': "Une entreprise familiale, depuis 1979.",
  'Manufacturing piping and irrigation systems for water supply, irrigation, sewerage and energy — shipped from Cyprus to more than 65 destinations across four continents.':
    "Fabrication de systèmes de tuyauterie et d'irrigation pour l'adduction d'eau, l'irrigation, l'assainissement et l'énergie — expédiés depuis Chypre vers plus de 65 destinations sur quatre continents.",
  // Stat band
  'By the numbers': "En chiffres",
  'Founded in': "Fondée en",
  'Employees': "Employés",
  'Product Codes': "Codes produits",
  'Countries Worldwide': "Pays dans le monde",
  // Manifesto opening
  'Our purpose': "Notre raison d'être",
  'Base': "Siège",
  'Continents': "Continents",
  'Sectors': "Secteurs",
  'Ergates · Cyprus': "Ergates · Chypre",
  'Manufacturing since 1989': "Fabrication depuis 1989",
  // Editorial body
  'A note from the family': "Un mot de la famille",
  'Founder · Cyprus · 1979': "Fondateur · Chypre · 1979",
  'Est. 1979': "Fondée en 1979",
  'Three generations of Protopapas — same workshop in Ergates, same conviction that water deserves better pipes.':
    "Trois générations de Protopapas — le même atelier à Ergates, la même conviction que l'eau mérite de meilleurs tubes.",
  'Read the full history': "Lire l'histoire complète",
  'Who we are': "Qui nous sommes",
  'Save you time, save you money, and save the planet.':
    "Vous faire gagner du temps, vous faire économiser de l'argent et sauver la planète.",
  'Years of experience': "Années d'expérience",
  // Stand-out manifesto
  'What sets us apart': "Ce qui nous distingue",
  'Forty years, one workshop, zero shortcuts.':
    "Quarante ans, un atelier, zéro compromis.",
  // Streaming Water cinematic
  'Our founding conviction': "Notre conviction fondatrice",
  // Closing CTA
  'From the team to the technology, every part of Elysée is built to back the products we ship. Talk to us about a project, a custom run, or a long-term partnership.':
    "De l'équipe à la technologie, chaque partie d'Elysée est conçue pour soutenir les produits que nous expédions. Parlez-nous d'un projet, d'une production sur mesure ou d'un partenariat à long terme.",
  'Contact our network': "Contactez notre réseau",

  // Corporate Profile — dynamic content (from site-content.ts blocks).
  // whoP1.text is split at the first sentence boundary in the page, so the
  // two halves are keyed separately here as well as the full paragraph.
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy.':
    "Elysée fabrique et fournit des systèmes de tuyauterie et d'irrigation pour l'adduction d'eau, l'irrigation, l'assainissement et l'énergie.",
  'Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    "Basée à Chypre, un emplacement clé au carrefour de trois continents, Elysée dessert plus de 65 destinations en Europe, au Moyen-Orient, en Afrique du Sud, au Japon, en Australie et en Nouvelle-Zélande.",
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    "Elysée fabrique et fournit des systèmes de tuyauterie et d'irrigation pour l'adduction d'eau, l'irrigation, l'assainissement et l'énergie. Basée à Chypre, un emplacement clé au carrefour de trois continents, Elysée dessert plus de 65 destinations en Europe, au Moyen-Orient, en Afrique du Sud, au Japon, en Australie et en Nouvelle-Zélande.",
  'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.':
    "Il est dans notre nature, en tant qu'entreprise mais aussi en tant que personnes, d'être ambitieux et de nous fixer des objectifs élevés. Nous puisons notre inspiration dans nos 40 ans d'histoire et d'expérience, et nous envisageons notre cinquième décennie avec optimisme et confiance. De nos ingénieurs experts à notre personnel du service client hautement qualifié, le travail d'équipe joue un rôle considérable dans la réussite d'Elysée. La collaboration entre tous les départements, le souci du détail et beaucoup de travail acharné aboutissent à des produits remarquables, afin de créer des solutions brillantes qui peuvent être parfaitement adaptées à chaque client.",
  'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.':
    "Nous nous efforçons d'innover et de nous améliorer et, parce que nous disposons de notre propre département de R&D interne, nous pouvons garder une longueur d'avance lorsqu'il s'agit de développer et de créer des produits nouveaux et passionnants. Avec chaque nouveau produit, nous cherchons à maximiser non seulement son efficacité, mais aussi sa durabilité et sa facilité d'utilisation. Toujours soucieux de réduire l'impact environnemental et de maintenir des prix compétitifs pour vous et votre entreprise, nous voulons vous faire gagner du temps, vous faire économiser de l'argent et sauver la planète.",
  'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.':
    "Grâce à une structure organisationnelle flexible, Elysée assure une réponse rapide aux demandes, aux commandes et aux opportunités de collaboration des clients. De nouveaux produits sont développés chaque année et viennent s'ajouter pour améliorer les produits existants, créant ainsi une gamme en croissance constante.",
  'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.':
    "De nombreuses années d'expérience dans la conception, la fabrication et la fourniture de raccords se reflètent dans de nouveaux produits qui répondent aux besoins des clients, ainsi que dans notre capacité à produire et à livrer chaque commande à sa destination dans les délais.",
  'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.':
    "Nos produits sont certifiés par les organismes de normalisation internationaux les plus réputés, tels que DVGW, WRAS et KIWA, démontrant l'effort constant et continu de l'entreprise dans la production de produits de haute qualité.",
  'This product range has been proven in the field for forty years.':
    "Cette gamme de produits a fait ses preuves sur le terrain depuis quarante ans.",
  'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.':
    "Ces 40 années d'expérience ont fait mûrir les processus et la technologie de l'entreprise, qui comprend aujourd'hui les équipements de production et d'assemblage les plus modernes. La capacité est continuellement améliorée pour satisfaire la demande, tant en quantité qu'en technologie.",
  'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.':
    "Nous sommes une entreprise familiale et nous sommes fiers de ce que nous faisons. La responsabilité, l'honnêteté et une collaboration étroite sont présentes dans toutes les opérations.",
  'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.':
    "En tant qu'êtres humains, nous voulons la même chose pour nos Vies. Nous prenons soin de les conduire vers une destination sûre. En tant qu'entreprise, nous produisons des systèmes fiables pour faire circuler l'eau — et les fluides en général — en toute sécurité jusqu'à leur destination. En fin de compte, notre objectif est de guider la Vie sur une voie verte.",

  // ============================================================================
  // History — /about-us/history/
  // ============================================================================
  // Hero
  'Built one decade at a time.': "Bâtie une décennie à la fois.",
  'From a Cypriot greenhouse in the 1970s to a piping and irrigation manufacturer shipping to 65 destinations — the story of Elysée Irrigation, founded 16 April 1979.':
    "D'une serre chypriote dans les années 1970 à un fabricant de systèmes de tuyauterie et d'irrigation expédiant vers 65 destinations — l'histoire d'Elysée Irrigation, fondée le 16 avril 1979.",
  // Stat band
  'Markets served': "Marchés desservis",
  'Export awards': "Prix à l'exportation",
  'ISO 9001 since': "ISO 9001 depuis",
  // Origins
  'Origins · 1979': "Origines · 1979",
  'From the workshop': "Depuis l'atelier",
  'Drippers, sprinklers, fittings': "Goutteurs, arroseurs, raccords",
  'Founded': "Fondée",
  'Nicosia, Cyprus': "Nicosie, Chypre",
  'Founder': "Fondateur",
  'Agriculture & physics': "Agriculture et physique",
  'Original venture': "Projet initial",
  'Flowers': "Fleurs",
  'for the Middle East': "pour le Moyen-Orient",
  // Milestones
  'A timeline of forty-seven years': "Une chronologie de quarante-sept ans",
  'Milestones, by the decade.': "Les étapes clés, décennie par décennie.",
  'Today': "Aujourd'hui",
  // Today
  '65 markets. Four sectors. Three distribution hubs.':
    "65 marchés. Quatre secteurs. Trois pôles de distribution.",
  'Sectors served': "Secteurs desservis",
  'Distribution centres': "Centres de distribution",
  'Plus a network of local agents and sales representatives across all 65 markets.':
    "Plus un réseau d'agents locaux et de représentants commerciaux sur l'ensemble des 65 marchés.",
  'Water Supply': "Adduction d'eau",
  'Irrigation': "Irrigation",
  'Infrastructure': "Infrastructures",
  'Energy': "Énergie",
  'Austria': "Autriche",
  'Russia': "Russie",
  'Lebanon': "Liban",
  // Where it started
  'Where it started': "Là où tout a commencé",
  'The original line.': "La gamme d'origine.",
  'Drippers': "Goutteurs",
  'Sprinklers': "Arroseurs",
  'Compression fittings': "Raccords à compression",
  'Saddles': "Colliers de prise",
  'Threaded fittings': "Raccords filetés",
  // History — dynamic content. intro1.text is split into three sentences in
  // the page (originsHeadline / originsBody / originsTail), so each is keyed.
  'It was a love of nature that led to the birth of our company, Elysée.':
    "C'est l'amour de la nature qui a donné naissance à notre entreprise, Elysée.",
  'With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East.':
    "Issu du monde agricole et titulaire d'un diplôme en physique, le fondateur, Antonis Protopapas, eut l'idée de créer une entreprise axée sur la culture des plus belles fleurs du Moyen-Orient.",
  'And so, that was the start of this beautiful journey…':
    "Et c'est ainsi qu'a commencé ce beau voyage…",
  "It was a love of nature that led to the birth of our company, Elysée. With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East. And so, that was the start of this beautiful journey…":
    "C'est l'amour de la nature qui a donné naissance à notre entreprise, Elysée. Issu du monde agricole et titulaire d'un diplôme en physique, le fondateur, Antonis Protopapas, eut l'idée de créer une entreprise axée sur la culture des plus belles fleurs du Moyen-Orient. Et c'est ainsi qu'a commencé ce beau voyage…",
  'Through this venture, the need to know more about irrigation became a priority. Back in the 1970s the new art of irrigation was on the rise, and the know-how was brought in to help Elysée grow world-class flowers.':
    "À travers ce projet, le besoin d'en savoir plus sur l'irrigation est devenu une priorité. Dans les années 1970, le nouvel art de l'irrigation était en plein essor, et le savoir-faire fut acquis pour aider Elysée à cultiver des fleurs de classe mondiale.",
  'With our newly acquired knowledge of irrigation and irrigation needs, the next step was to move into irrigation trading, trading pipe fittings and then… into manufacturing them. So, in 1979, on 16 April, Elysée Irrigation was founded.':
    "Forts de nos connaissances nouvellement acquises sur l'irrigation et ses besoins, l'étape suivante fut de nous lancer dans le négoce de l'irrigation, le négoce de raccords de tuyauterie, puis… dans leur fabrication. C'est ainsi qu'en 1979, le 16 avril, Elysée Irrigation fut fondée.",
  'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.':
    "La même conviction qui a lancé l'entreprise l'anime encore aujourd'hui : construire des systèmes fiables qui acheminent l'eau — et la Vie — en toute sécurité là où elle est nécessaire.",
  'Elysée Irrigation founded': "Fondation d'Elysée Irrigation",
  'Founded on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas. The first production facility was co-located with farming and flower preparation for the international markets — exciting times where the exploration of the unknown field of plastic manufacturing was hard but rewarding for a young company.':
    "Fondée le 16 avril 1979 à Nicosie, Chypre, par Antonis Protopapas. La première unité de production partageait ses locaux avec l'agriculture et la préparation des fleurs destinées aux marchés internationaux — une époque passionnante où l'exploration du domaine inconnu de la fabrication du plastique était difficile mais gratifiante pour une jeune entreprise.",
  'As early as 1980, the first export activities began, in the nearby markets of the Middle East — an area which at the time was only starting to utilize irrigation techniques.':
    "Dès 1980, les premières activités d'exportation ont débuté, sur les marchés voisins du Moyen-Orient — une région qui, à l'époque, commençait tout juste à recourir aux techniques d'irrigation.",
  'Early success led to fast growth which demanded a dedicated industrial space. The current site in the Ergates Industrial Area was established. The product range at the time comprised a substantial series of drippers and sprinklers as well as an extensive range of compression fittings, saddles, and threaded fittings.':
    "Le succès précoce a entraîné une croissance rapide qui nécessitait un espace industriel dédié. Le site actuel dans la zone industrielle d'Ergates a été établi. La gamme de produits comprenait à l'époque une série importante de goutteurs et d'arroseurs, ainsi qu'une vaste gamme de raccords à compression, de colliers de prise et de raccords filetés.",
  'A piping system is never complete without a pipe, hence in 1991 a polyethylene pipe manufacturing unit was established at the Ergates site — Elysée could now offer a full water-supply solution. Its early success led to the extension of the range with PVC pipe manufacturing, entering the construction and infrastructure world.':
    "Un système de tuyauterie n'est jamais complet sans tube ; c'est pourquoi, en 1991, une unité de fabrication de tubes en polyéthylène a été établie sur le site d'Ergates — Elysée pouvait désormais offrir une solution complète d'adduction d'eau. Son succès précoce a conduit à l'extension de la gamme avec la fabrication de tubes en PVC, faisant son entrée dans le monde de la construction et des infrastructures.",
  'An extensive range of products meant the quality-control division had to be formally established, leading to the certification of the company with ISO 9001 as early as 1998.':
    "Une vaste gamme de produits impliquait que la division du contrôle qualité devait être officiellement établie, conduisant à la certification de l'entreprise selon ISO 9001 dès 1998.",
  'A new office building was erected to host the main offices of the company — until then located in central Nicosia — optimizing operations and preparing for the next step in expansion.':
    "Un nouveau bâtiment de bureaux a été érigé pour accueillir les bureaux principaux de l'entreprise — jusque-là situés dans le centre de Nicosie — optimisant les opérations et préparant la prochaine étape de l'expansion.",
  'The first recognition of international activity for Elysée came with the Special Export Award. That same year, a new function was born within the company: the Research and Development department, leading the advancement of technology and improvement of the product range. Elysée was now a complete and modern company, investing significantly in the international market.':
    "La première reconnaissance de l'activité internationale d'Elysée est venue avec le Prix spécial de l'exportation. Cette même année, une nouvelle fonction est née au sein de l'entreprise : le département Recherche et Développement, à la pointe de l'avancement de la technologie et de l'amélioration de la gamme de produits. Elysée était désormais une entreprise complète et moderne, investissant de manière significative sur le marché international.",
  'The years that followed saw a major expansion in global reach and market coverage. Elysée products could be found on all 5 continents and in a steadily growing number of countries. A series of 4 further Export Awards (2003, 2008, 2012 and 2016) is a testimony to just that.':
    "Les années qui ont suivi ont vu une expansion majeure de la portée mondiale et de la couverture des marchés. Les produits Elysée se trouvaient sur les 5 continents et dans un nombre de pays en constante augmentation. Une série de 4 Prix de l'exportation supplémentaires (2003, 2008, 2012 et 2016) en témoigne précisément.",
  'Our international network of selected partners currently spans 65 markets, where Elysée is active in 4 sectors — Water Supply, Irrigation, Infrastructure and Energy. To respond directly to the changing needs of the global market, Elysée has expanded its operations by establishing 3 distribution centres in Austria, Russia, and Lebanon.':
    "Notre réseau international de partenaires sélectionnés s'étend actuellement sur 65 marchés, où Elysée est active dans 4 secteurs — Adduction d'eau, Irrigation, Infrastructures et Énergie. Pour répondre directement aux besoins changeants du marché mondial, Elysée a étendu ses activités en établissant 3 centres de distribution en Autriche, en Russie et au Liban.",
  'Our international network of selected partners spans 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by 3 distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.':
    "Notre réseau international de partenaires sélectionnés s'étend sur 65 marchés répartis en quatre secteurs — Adduction d'eau, Irrigation, Infrastructures et Énergie — soutenu par 3 centres de distribution en Autriche, en Russie et au Liban, ainsi que par un réseau d'agents locaux et de représentants commerciaux.",
  'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:':
    "La gamme de produits qui a fait connaître Elysée dans les années 1980 reste le socle du catalogue aujourd'hui :",
  'Enquiries and orders reach us through our wide network of local agents and sales representatives.':
    "Les demandes et les commandes nous parviennent grâce à notre vaste réseau d'agents locaux et de représentants commerciaux.",

  // ============================================================================
  // Company Structure — /about-us/company-structure/
  // ============================================================================
  // Hero
  'An efficient team.': "Une équipe efficace.",
  'A clear structure.': "Une structure claire.",
  'Three divisions, one workshop in Cyprus — engineered around quick response, certified quality, and a growing product range.':
    "Trois divisions, un atelier à Chypre — conçu autour d'une réponse rapide, d'une qualité certifiée et d'une gamme de produits en croissance.",
  // Stat band
  'Production divisions': "Divisions de production",
  'Fittings catalogued': "Raccords catalogués",
  'Pipe diameter range (mm)': "Plage de diamètres des tubes (mm)",
  // Efficient team
  'An efficient team': "Une équipe efficace",
  "Built for the customer's call.": "Conçue pour l'appel du client.",
  'Three operating principles that keep our workshop in step with the people we ship to — from a first phone call through a custom order to a long-term partnership.':
    "Trois principes de fonctionnement qui maintiennent notre atelier en phase avec les personnes auxquelles nous expédions — d'un premier appel téléphonique à un partenariat à long terme, en passant par une commande sur mesure.",
  'From the floor': "Depuis l'atelier de production",
  'Engineers, consultants, makers': "Ingénieurs, consultants, fabricants",
  'Three principles. One workshop in Ergates.': "Trois principes. Un atelier à Ergates.",
  'Flexible by design': "Flexible par conception",
  'Engineering at the front desk': "L'ingénierie en première ligne",
  'Quality covers both sides': "La qualité couvre les deux aspects",
  // Divisions
  'Our divisions': "Nos divisions",
  'Three teams, one workshop.': "Trois équipes, un atelier.",
  'Fittings Division': "Division des raccords",
  'Pipes Division': "Division des tubes",
  'Quality Assurance Division': "Division de l'assurance qualité",
  'Explore Fittings': "Découvrir les raccords",
  'Explore Pipes': "Découvrir les tubes",
  'See certifications': "Voir les certifications",
  // Closing CTA
  'Want to discuss a specific application, a custom OEM run, or a project specification? Our engineers and technical consultants are available to advise.':
    "Vous souhaitez discuter d'une application spécifique, d'une production OEM sur mesure ou d'un cahier des charges de projet ? Nos ingénieurs et consultants techniques sont disponibles pour vous conseiller.",
  // Company Structure — dynamic content
  'With flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and we regularly upgrade existing products to create a constantly growing range.':
    "Grâce à une structure organisationnelle flexible, Elysée assure une réponse rapide aux demandes, aux commandes et aux opportunités de collaboration des clients. De nouveaux produits sont développés chaque année et nous améliorons régulièrement les produits existants afin de créer une gamme en croissance constante.",
  "Our team of expert engineers and technical consultants is constantly available to offer technical advice to our clients on the use of Elysée's fittings and piping systems.":
    "Notre équipe d'ingénieurs experts et de consultants techniques est constamment disponible pour offrir des conseils techniques à nos clients sur l'utilisation des raccords et des systèmes de tuyauterie d'Elysée.",
  'We at Elysée realize that from a customer\'s perspective, the term "quality" covers both the product and the service. Our ever growing customer list reflects our determination to settle for nothing less.':
    "Chez Elysée, nous comprenons que, du point de vue du client, le terme « qualité » couvre à la fois le produit et le service. Notre liste de clients en constante augmentation reflète notre détermination à ne nous contenter de rien de moins.",
  'As a business, our green credentials are very important to us, and so our desire to innovate extends from our product development to our business processes. Implementing Lean Kaizen techniques has brought with it an increase in efficiency and a decrease in waste. We\'ve reduced our environmental impact by reducing our energy consumption and keeping the waste we send to landfill to a minimum. By increasing our efficiency, we\'re boosting our productivity and protecting our planet too.':
    "En tant qu'entreprise, nos engagements écologiques sont très importants pour nous, et notre désir d'innover s'étend donc du développement de nos produits à nos processus d'affaires. La mise en œuvre des techniques Lean Kaizen a entraîné une augmentation de l'efficacité et une réduction des déchets. Nous avons réduit notre impact environnemental en diminuant notre consommation d'énergie et en réduisant au minimum les déchets que nous envoyons en décharge. En augmentant notre efficacité, nous stimulons notre productivité et protégeons également notre planète.",
  'Elysée operates through three core production divisions, each focused on a specific area of manufacturing and quality assurance.':
    "Elysée fonctionne à travers trois divisions de production principales, chacune axée sur un domaine spécifique de la fabrication et de l'assurance qualité.",
  'Focusing on the production of pipe fittings and irrigation accessories, the Fittings Division manufactures over 1000 items in different sizes and for diverse applications, made of the most suitable raw materials in each case, from polypropylene to polyacetal and nylon.':
    "Axée sur la production de raccords de tuyauterie et d'accessoires d'irrigation, la Division des raccords fabrique plus de 1000 articles de différentes tailles et pour diverses applications, réalisés à partir des matières premières les plus adaptées à chaque cas, du polypropylène au polyacétal et au nylon.",
  'The division manufactures PVC and PE pipes with a diameter range of 5–315 mm, suitable for a wide range of practical applications.':
    "La division fabrique des tubes en PVC et en PE d'une plage de diamètres de 5–315 mm, adaptés à un large éventail d'applications pratiques.",
  'The Quality Assurance Division is dedicated to implementing, sustaining and improving the quality at every level of production, from the raw material through to the finished product. With the aid of sophisticated equipment and apparatus, we can verify that the final products do in fact conform to national and international standards.':
    "La Division de l'assurance qualité se consacre à la mise en œuvre, au maintien et à l'amélioration de la qualité à chaque niveau de la production, de la matière première jusqu'au produit fini. À l'aide d'équipements et d'appareils sophistiqués, nous pouvons vérifier que les produits finaux sont effectivement conformes aux normes nationales et internationales.",
  'Green Operations': "Opérations vertes",
  'Our operating principle': "Notre principe de fonctionnement",

  // ============================================================================
  // Vision, Mission & Values — /about-us/vision-mission-values/
  // ============================================================================
  // Hero (h1 is split across a <br/> into two fragments)
  'Vision, Mission': "Vision, Mission",
  '& Values.': "& Valeurs.",
  'What drives us, every day, in every market.': "Ce qui nous motive, chaque jour, sur chaque marché.",
  // Framework
  'By the framework': "Selon le cadre",
  'One vision. Five pillars. Six values.': "Une vision. Cinq piliers. Six valeurs.",
  'Vision sets the destination. Mission sets the pace. Values set the tone. The W·I·S·E framework is the test we hold every product, every process and every partnership to.':
    "La vision fixe la destination. La mission fixe le rythme. Les valeurs donnent le ton. Le cadre W·I·S·E est le critère auquel nous soumettons chaque produit, chaque processus et chaque partenariat.",
  'Reads': "Se lit",
  'Top → bottom': "De haut → en bas",
  'Anchor': "Ancrage",
  'Updated': "Mis à jour",
  'Chapter One · Destination': "Chapitre Un · Destination",
  'Chapter Two · Pace': "Chapitre Deux · Rythme",
  'Chapter Three · Tone': "Chapitre Trois · Ton",
  'Anchor · The test': "Ancrage · Le critère",
  'Vision': "Vision",
  'Mission pillars': "Piliers de la mission",
  'Core values': "Valeurs fondamentales",
  'Framework': "Cadre",
  'A single statement of where Elysée is heading — green leadership worldwide through W·I·S·E piping systems.':
    "Une déclaration unique sur la direction que prend Elysée — un leadership vert à l'échelle mondiale grâce aux systèmes de tuyauterie W·I·S·E.",
  'Five commitments that translate the Vision into day-to-day priorities — for customers, people, growth and the planet.':
    "Cinq engagements qui traduisent la Vision en priorités quotidiennes — pour les clients, les collaborateurs, la croissance et la planète.",
  'Six principles that guide how we work with each other, with our customers and with the environment we operate in.':
    "Six principes qui guident notre manière de travailler les uns avec les autres, avec nos clients et avec l'environnement dans lequel nous évoluons.",
  'Worldwide. Innovative. Smart. Easy-to-Use. The four words we test every product, process and partnership against.':
    "Mondial. Innovant. Intelligent. Facile à utiliser. Les quatre mots à l'aune desquels nous évaluons chaque produit, processus et partenariat.",
  // Why we exist
  'Why we exist': "Pourquoi nous existons",
  'Customer-first, by design.': "Le client d'abord, par conception.",
  'Three sentences that set the operating philosophy for the entire company.':
    "Trois phrases qui définissent la philosophie de fonctionnement de toute l'entreprise.",
  // Vision cinematic
  'Chapter One · Our Vision': "Chapitre Un · Notre Vision",
  // WISE strip
  'The W·I·S·E framework': "Le cadre W·I·S·E",
  'Four letters, one operating philosophy.': "Quatre lettres, une philosophie de fonctionnement.",
  'Every product, every process, every partnership is tested against four words. They appear together as W·I·S·E — and they precede the Vision, the Mission, and every Value below.':
    "Chaque produit, chaque processus, chaque partenariat est évalué à l'aune de quatre mots. Ils apparaissent ensemble sous la forme W·I·S·E — et précèdent la Vision, la Mission et chaque Valeur ci-dessous.",
  'Worldwide': "Mondial",
  'Innovative': "Innovant",
  'Smart': "Intelligent",
  'Easy-to-Use': "Facile à utiliser",
  'Engineered for 65 destinations across four sectors.':
    "Conçus pour 65 destinations dans quatre secteurs.",
  'Forty years of R&D, six EU-funded research programmes.':
    "Quarante ans de R&D, six programmes de recherche financés par l'UE.",
  'Designed for easy install, low maintenance, long life.':
    "Conçus pour une installation facile, un faible entretien et une longue durée de vie.",
  'Field-proven fittings, intuitive systems, technical advice on call.':
    "Des raccords éprouvés sur le terrain, des systèmes intuitifs, des conseils techniques à la demande.",
  // Mission
  'Chapter Two · Our Mission': "Chapitre Deux · Notre Mission",
  'Five commitments. One workshop.': "Cinq engagements. Un atelier.",
  'Five commitments translate the Vision into day-to-day priorities — for our customers, our people, our growth, and the planet.':
    "Cinq engagements traduisent la Vision en priorités quotidiennes — pour nos clients, nos collaborateurs, notre croissance et la planète.",
  'Mission anchor': "Ancrage de la mission",
  'Streaming water, streaming life': "Streaming water, streaming life",
  'Five pillars that turn the brand promise into practice.':
    "Cinq piliers qui transforment la promesse de la marque en pratique.",
  'Preserve water for future generations': "Préserver l'eau pour les générations futures",
  'Give partners a competitive edge': "Offrir aux partenaires un avantage concurrentiel",
  'Lead our people to full potential': "Mener nos collaborateurs à leur plein potentiel",
  'Sustainable, profitable growth': "Une croissance durable et rentable",
  'Better Earth, better society': "Une meilleure Terre, une meilleure société",
  // Mission list (dynamic from site-content)
  'Develop W.I.S.E. Products to preserve water resources for future generations.':
    "Développer des produits W.I.S.E. pour préserver les ressources en eau pour les générations futures.",
  'Provide our Customers and Partners with a competitive edge.':
    "Offrir à nos Clients et Partenaires un avantage concurrentiel.",
  'Lead our people to meet their full potential.':
    "Mener nos collaborateurs à réaliser pleinement leur potentiel.",
  'Achieve sustainable and profitable company growth.':
    "Réaliser une croissance durable et rentable de l'entreprise.",
  'Contribute to Society and the Environment, making Earth a better place to live.':
    "Contribuer à la Société et à l'Environnement, en faisant de la Terre un meilleur endroit où vivre.",
  // Values
  'Chapter Three · Our Values': "Chapitre Trois · Nos Valeurs",
  'Six principles, not posters.': "Six principes, pas des affiches.",
  'Six principles that guide how we work — with each other, with our customers and with the environment we operate in.':
    "Six principes qui guident notre manière de travailler — les uns avec les autres, avec nos clients et avec l'environnement dans lequel nous évoluons.",
  'Business-driven innovation': "Une innovation guidée par l'entreprise",
  'Green thinking': "La pensée verte",
  'Customer commitment and value creation': "Engagement envers le client et création de valeur",
  'Quality and continuous improvement': "Qualité et amélioration continue",
  'Respect each other and win as a team': "Se respecter mutuellement et gagner en équipe",
  'Promote personal and professional growth': "Promouvoir le développement personnel et professionnel",
  'Every new product starts with a real-world problem we have heard from customers.':
    "Chaque nouveau produit part d'un problème concret que nous ont rapporté nos clients.",
  'Sustainability lives in our procurement, our process and our packaging.':
    "La durabilité est présente dans nos approvisionnements, nos procédés et nos emballages.",
  'Long-term partnerships beat one-off transactions, every time.':
    "Les partenariats à long terme l'emportent sur les transactions ponctuelles, à chaque fois.",
  'ISO 9001 since 1998. Improvement is a daily practice, not a target.':
    "ISO 9001 depuis 1998. L'amélioration est une pratique quotidienne, pas un objectif.",
  'Three generations of family business — built on accountability.':
    "Trois générations d'entreprise familiale — bâtie sur la responsabilité.",
  'We invest in the people who build, ship and back our products.':
    "Nous investissons dans les personnes qui fabriquent, expédient et soutiennent nos produits.",
  // VMV intro/vision (dynamic from site-content)
  'Our customers are at the heart of everything we do, so that is what we focus on. We design innovative piping solutions for easy installation, durability, and minimal maintenance — and we tailor them, through our expert advisors and OEM programmes, to the specific needs of each customer.':
    "Nos clients sont au cœur de tout ce que nous faisons ; c'est donc sur eux que nous nous concentrons. Nous concevons des solutions de tuyauterie innovantes pour une installation facile, une durabilité et un entretien minimal — et nous les adaptons, grâce à nos conseillers experts et à nos programmes OEM, aux besoins spécifiques de chaque client.",
  'To be a green leader worldwide through Innovative, Smart, Easy-to-Use Piping Systems.':
    "Être un leader vert à l'échelle mondiale grâce à des systèmes de tuyauterie innovants, intelligents et faciles à utiliser.",
  // VMV closing CTA
  'Our Vision, Mission and Values are not posters on a wall — they shape every decision we make, from product design to customer service. Talk to us about how we put them into practice.':
    "Notre Vision, notre Mission et nos Valeurs ne sont pas des affiches sur un mur — elles façonnent chaque décision que nous prenons, de la conception des produits au service client. Parlez-nous de la façon dont nous les mettons en pratique.",

  // ============================================================================
  // Quality & Certifications — /about-us/quality-certifications/
  // ============================================================================
  // Hero
  'Quality, by certificate.': "Qualité, certificat à l'appui.",
  // Stat band
  'Years accredited': "Années d'accréditation",
  'Certificate bodies': "Organismes de certification",
  'Batches certified': "Lots certifiés",
  // A matter of principle
  'A matter of principle': "Une question de principe",
  'Patented, engineered, certified.': "Brevetés, conçus, certifiés.",
  'Two paragraphs that anchor everything we do — from the resin we accept to the certificate we ship with every order.':
    "Deux paragraphes qui ancrent tout ce que nous faisons — de la résine que nous acceptons au certificat que nous expédions avec chaque commande.",
  // ISO callout
  'Cornerstone certification': "Certification fondamentale",
  // How we verify
  'How we verify': "Comment nous vérifions",
  'Four steps. Every batch. Every time.': "Quatre étapes. Chaque lot. À chaque fois.",
  'The same four checks happen on every shipment: incoming material, in-process QC, finished batch sampling and a traceable certificate.':
    "Les mêmes quatre contrôles ont lieu pour chaque expédition : matière entrante, contrôle qualité en cours de production, échantillonnage du lot fini et un certificat traçable.",
  'Cadence': "Cadence",
  'Every batch': "Chaque lot",
  'Standard': "Norme",
  'Step One · Material': "Étape Un · Matière",
  'Step Two · Process': "Étape Deux · Procédé",
  'Step Three · Product': "Étape Trois · Produit",
  'Step Four · Certificate': "Étape Quatre · Certificat",
  'Material check': "Contrôle de la matière",
  'In-process QC': "Contrôle qualité en cours de production",
  'Batch testing': "Essai de lot",
  'Documented release': "Libération documentée",
  'Every incoming PE and PVC resin batch is tested against our internal spec sheet before it enters production.':
    "Chaque lot de résine PE et PVC entrant est testé selon notre fiche de spécifications interne avant d'entrer en production.",
  'Continuous in-line monitoring during extrusion and moulding flags drift before it ever reaches a finished part.':
    "Une surveillance continue en ligne pendant l'extrusion et le moulage signale toute dérive avant qu'elle n'atteigne une pièce finie.",
  'Finished batches are sampled against ISO and EN test methods — burst, impact, environmental and dimensional.':
    "Les lots finis sont échantillonnés selon les méthodes d'essai ISO et EN — éclatement, choc, essais environnementaux et dimensionnels.",
  'Every shipment ships with traceable documentation — request a certificate for any tender or specification.':
    "Chaque expédition est accompagnée d'une documentation traçable — demandez un certificat pour tout appel d'offres ou cahier des charges.",
  // Six categories
  'Our certifications': "Nos certifications",
  'Six categories of certificate.': "Six catégories de certificats.",
  'View certificates': "Voir les certificats",
  // Closing CTA
  'Request a certificate': "Demander un certificat",
  'Need a specific certificate for a tender, regulatory submission, or specification document? Our team can provide it on request.':
    "Vous avez besoin d'un certificat spécifique pour un appel d'offres, une soumission réglementaire ou un document de spécifications ? Notre équipe peut vous le fournir sur demande.",
  'Contact our local network': "Contactez notre réseau local",
  // Q&C — dynamic content (from site-content.ts)
  'Developed to the highest of standards, Elysée products are patented and engineered in-house in our own R&D department. Offering eco-friendly, corrosion-free, and easy-to-install solutions at great value prices, resulting in the highest level of customer satisfaction.':
    "Développés selon les normes les plus élevées, les produits Elysée sont brevetés et conçus en interne dans notre propre département de R&D. Ils offrent des solutions écologiques, sans corrosion et faciles à installer à des prix très avantageux, garantissant ainsi le plus haut niveau de satisfaction client.",
  'Ever since our establishment, quality has been a major principle covering Elysée operations. By introducing a quality management system, we are able to monitor our activities and efficiency, in order to elevate our overall performance. Today Elysée Irrigation LTD proudly holds internationally renowned certificates of piping systems, a testimony of commitment to quality.':
    "Depuis notre création, la qualité est un principe majeur qui régit les opérations d'Elysée. En mettant en place un système de management de la qualité, nous sommes en mesure de suivre nos activités et notre efficacité, afin d'améliorer notre performance globale. Aujourd'hui, Elysée Irrigation LTD détient avec fierté des certificats de systèmes de tuyauterie de renommée internationale, témoignage de son engagement envers la qualité.",
  'Elysée products are certified by the most reputable international standards organizations. Our portfolio is organised into six categories, mirroring the way our products reach the market.':
    "Les produits Elysée sont certifiés par les organismes de normalisation internationaux les plus réputés. Notre portefeuille est organisé en six catégories, reflétant la manière dont nos produits parviennent sur le marché.",
  'Elysée achieved ISO 9001 certification in 1998 following the formal establishment of its quality-control division — a commitment to quality management that has been maintained and renewed continuously ever since.':
    "Elysée a obtenu la certification ISO 9001 en 1998, à la suite de l'établissement officiel de sa division du contrôle qualité — un engagement envers le management de la qualité qui a été maintenu et renouvelé sans interruption depuis lors.",
  'ISO 9001 since 1998': "ISO 9001 depuis 1998",
  'Management System': "Système de management",
  'General': "Général",
  'PE Pipes': "Tubes PE",
  'PVC Pipes': "Tubes PVC",
  'ISO 9001 quality management — certified since 1998 and renewed continuously.':
    "Management de la qualité ISO 9001 — certifié depuis 1998 et renouvelé en continu.",
  'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.':
    "Certifications transversales délivrées par des organismes internationalement reconnus, notamment DVGW, KIWA, SII et OVGW.",
  'Product certifications covering the full Elysée compression-fitting range for water-supply applications.':
    "Certifications de produits couvrant l'ensemble de la gamme de raccords à compression Elysée pour les applications d'adduction d'eau.",
  'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.':
    "Certifications de tubes en polyéthylène sur toute la plage de diamètres fabriqués, adaptés à l'eau potable, au gaz et aux fluides industriels.",
  'PVC pipe certifications for water-supply, drainage and infrastructure applications.':
    "Certifications de tubes en PVC pour les applications d'adduction d'eau, de drainage et d'infrastructures.",
  'Environmental and sustainability certifications attached to the Green Elysée product line.':
    "Certifications environnementales et de durabilité associées à la gamme de produits Green Elysée.",

  // ============================================================================
  // Quality & Certifications — category detail pages (shared chrome)
  // ============================================================================
  'All certificate categories': "Toutes les catégories de certificats",
  // Hero "<count> certified …" trailing phrase (count stays in its own span)
  'certified standards': "normes certifiées",
  'certified recognitions': "distinctions certifiées",
  'certified approvals': "agréments certifiés",
  'standards.': "normes.",
  'PDFs.': "PDF.",
  'Tap any badge below to download the current certificate.':
    "Appuyez sur n'importe quel badge ci-dessous pour télécharger le certificat actuel.",
  'Standard families': "Familles de normes",
  'Audit cadence': "Cadence des audits",
  'Annual': "Annuelle",
  'Markets covered': "Marchés couverts",
  'Product certificates': "Certificats de produits",
  // general.astro
  'Recognised, by certificate.': "Reconnue, certificat à l'appui.",
  'Beyond the product line': "Au-delà de la gamme de produits",
  'Recognitions': "Distinctions",
  'Productivity programme': "Programme de productivité",
  'Packaging recovery': "Récupération des emballages",
  'Review cadence': "Cadence de révision",
  'Beyond the product': "Au-delà du produit",
  'Quality, outside the box.': "La qualité, hors du cadre.",
  'Not every certificate fits a product family — some recognise how the company works, trains, and takes responsibility.':
    "Tous les certificats ne correspondent pas à une famille de produits — certains reconnaissent la manière dont l'entreprise fonctionne, forme et assume ses responsabilités.",
  "Pipes and fittings carry most of Elysée's certificates — but quality runs wider than the product catalogue. The recognitions on this page cover the company itself: the national productivity-improvement programme we take part in, and our membership of the Green Dot packaging recovery scheme.":
    "Les tubes et les raccords portent la plupart des certificats d'Elysée — mais la qualité va bien au-delà du catalogue de produits. Les distinctions présentées sur cette page concernent l'entreprise elle-même : le programme national d'amélioration de la productivité auquel nous participons, et notre adhésion au système de récupération des emballages Green Dot.",
  'Like every other certificate we hold, each one is issued by an independent body and downloadable below — the same documents we provide for tenders, partnerships, and corporate due diligence.':
    "Comme tous les autres certificats que nous détenons, chacun est délivré par un organisme indépendant et téléchargeable ci-dessous — les mêmes documents que nous fournissons pour les appels d'offres, les partenariats et les vérifications préalables d'entreprise.",
  'The wider picture': "La vue d'ensemble",
  'Quality is a habit, not a category.': "La qualité est une habitude, pas une catégorie.",
  'Our General Certifications': "Nos certifications générales",
  "Need an older certificate, a tender-ready bundle, or evidence of a recognition you don't see here? Our team can prepare it on request.":
    "Vous avez besoin d'un certificat plus ancien, d'un dossier prêt pour un appel d'offres ou d'une preuve d'une distinction que vous ne voyez pas ici ? Notre équipe peut le préparer sur demande.",
  // management-system.astro
  'Managed, by certificate.': "Gérée, certificat à l'appui.",
  'The management system': "Le système de management",
  'System certificates': "Certificats du système",
  'Why a system, not a checklist': "Pourquoi un système, pas une liste de contrôle",
  'One system. Four disciplines.': "Un système. Quatre disciplines.",
  'Quality, environment, energy, and health & safety — each independently certified, all bound by one integrated policy.':
    "Qualité, environnement, énergie et santé & sécurité — chacune certifiée indépendamment, toutes reliées par une politique intégrée unique.",
  'Elysée has run a certified quality management system since 1998. Over the years it has grown into a single integrated framework: ISO 9001 for quality, ISO 14001 and EMAS for the environment, ISO 50001 for energy, and ISO 45001 for the health and safety of everyone on site.':
    "Elysée exploite un système de management de la qualité certifié depuis 1998. Au fil des années, il s'est développé en un cadre intégré unique : ISO 9001 pour la qualité, ISO 14001 et EMAS pour l'environnement, ISO 50001 pour l'énergie, et ISO 45001 pour la santé et la sécurité de toutes les personnes présentes sur le site.",
  'Every standard below is audited by an independent certification body on an annual cycle, and every claim is backed by a downloadable certificate — the same documents we submit with tenders, regulatory filings, and specification packages.':
    "Chaque norme ci-dessous est auditée par un organisme de certification indépendant selon un cycle annuel, et chaque affirmation est étayée par un certificat téléchargeable — les mêmes documents que nous soumettons avec les appels d'offres, les dépôts réglementaires et les dossiers de spécifications.",
  'The discipline behind the product': "La discipline derrière le produit",
  'Say what you do. Do what you say. Prove it.':
    "Dites ce que vous faites. Faites ce que vous dites. Prouvez-le.",
  'Our Management System Certifications': "Nos certifications de système de management",
  'Need an older certificate, a tender-ready bundle, or evidence for a specific management standard? Our team can prepare it on request.':
    "Vous avez besoin d'un certificat plus ancien, d'un dossier prêt pour un appel d'offres ou d'une preuve pour une norme de management spécifique ? Notre équipe peut le préparer sur demande.",
  // compression-fittings.astro
  'Approved, by certificate.': "Approuvés, certificat à l'appui.",
  'The fittings programme': "Le programme des raccords",
  'Why approvals matter': "Pourquoi les agréments comptent",
  'One fitting. Twelve markets.': "Un raccord. Douze marchés.",
  'From KIWA to WaterMark — every market Elysée fittings ship to has its own approval body, and the range is certified in each one.':
    "De KIWA à WaterMark — chaque marché vers lequel les raccords Elysée sont expédiés possède son propre organisme d'agrément, et la gamme est certifiée dans chacun d'eux.",
  'Drinking water is the most regulated product there is — and every country guards it with its own approval scheme. The Elysée compression-fitting range carries them across Europe and beyond: DVGW in Germany, WRAS in the UK, KIWA in the Netherlands, SVGW in Switzerland, ÖVGW in Austria, WaterMark in Australia, and more.':
    "L'eau potable est le produit le plus réglementé qui soit — et chaque pays la protège avec son propre système d'agrément. La gamme de raccords à compression Elysée les porte à travers l'Europe et au-delà : DVGW en Allemagne, WRAS au Royaume-Uni, KIWA aux Pays-Bas, SVGW en Suisse, ÖVGW en Autriche, WaterMark en Australie, et bien d'autres.",
  'Each approval below is issued by an independent national body against EN 12201-3, ISO 17885, or the local water-contact regulations — and each one is downloadable as the current PDF, ready for tenders, specifications, and regulatory submissions.':
    "Chaque agrément ci-dessous est délivré par un organisme national indépendant selon EN 12201-3, ISO 17885 ou les réglementations locales relatives au contact avec l'eau — et chacun est téléchargeable sous forme de PDF actuel, prêt pour les appels d'offres, les spécifications et les soumissions réglementaires.",
  'Worldwide approvals': "Agréments dans le monde entier",
  'Approved at home — wherever home is.': "Approuvés chez soi — où que ce soit.",
  'Our Compression Fittings Certifications': "Nos certifications de raccords à compression",
  "Need an older certificate, a tender-ready bundle, or an approval for a market you don't see here? Our team can prepare it on request.":
    "Vous avez besoin d'un certificat plus ancien, d'un dossier prêt pour un appel d'offres ou d'un agrément pour un marché que vous ne voyez pas ici ? Notre équipe peut le préparer sur demande.",
  // pe-pipes.astro
  'Proven, by certificate.': "Éprouvés, certificat à l'appui.",
  'The PE programme': "Le programme PE",
  'Core standard': "Norme principale",
  'PE materials covered': "Matériaux PE couverts",
  'From resin to reel': "De la résine à la bobine",
  'Every diameter, certified.': "Chaque diamètre, certifié.",
  'From HDPE mains to LDPE irrigation lines — the polyethylene range is certified across every diameter we extrude.':
    "Des conduites principales en HDPE aux lignes d'irrigation en LDPE — la gamme de polyéthylène est certifiée pour chaque diamètre que nous extrudons.",
  "Polyethylene pipe carries water under pressure for decades — so its certification leaves no room for interpretation. Elysée's HDPE range is certified to EN 12201-2 across the manufactured diameter range, while the LDPE line carries the Cyprus national standard CYS 106.":
    "Le tube en polyéthylène transporte l'eau sous pression pendant des décennies — sa certification ne laisse donc aucune place à l'interprétation. La gamme HDPE d'Elysée est certifiée selon EN 12201-2 sur toute la plage de diamètres fabriqués, tandis que la ligne LDPE porte la norme nationale chypriote CYS 106.",
  'Around the core standards sit market approvals — AENOR certification to ISO 15875 and WRAS approval for stop valves in UK drinking-water installations. Every certificate is audited annually and downloadable below.':
    "Autour des normes principales se trouvent les agréments de marché — la certification AENOR selon ISO 15875 et l'agrément WRAS pour les robinets d'arrêt dans les installations d'eau potable du Royaume-Uni. Chaque certificat est audité chaque année et téléchargeable ci-dessous.",
  'Built for pressure': "Conçus pour la pression",
  'Pressure-rated. Paper-backed.': "Homologués en pression. Documents à l'appui.",
  'Our PE Pipes Certifications': "Nos certifications de tubes PE",
  'Need an older certificate, a tender-ready bundle, or evidence for a specific diameter class? Our team can prepare it on request.':
    "Vous avez besoin d'un certificat plus ancien, d'un dossier prêt pour un appel d'offres ou d'une preuve pour une classe de diamètre spécifique ? Notre équipe peut le préparer sur demande.",
  // pvc-pipes.astro
  'Specified, by certificate.': "Spécifiés, certificat à l'appui.",
  'The PVC programme': "Le programme PVC",
  'Drainage standard': "Norme de drainage",
  'Pressure standard': "Norme de pression",
  'Under every street': "Sous chaque rue",
  'Drainage to conduit, certified.': "Du drainage au conduit, certifiés.",
  'Four standards cover the PVC range — underground drainage, soil & waste, pressure systems, and electrical conduit.':
    "Quatre normes couvrent la gamme PVC — drainage enterré, eaux-vannes et eaux usées, systèmes sous pression et conduits électriques.",
  'PVC pipe disappears into the ground and stays there for generations — which is exactly why specifiers ask for the paperwork first. The Elysée PVC range is certified to EN 1401 for underground drainage and sewage, EN 1329 for soil and waste discharge, and EN ISO 1452 for pressure water supply.':
    "Le tube en PVC disparaît dans le sol et y demeure pendant des générations — c'est précisément pourquoi les prescripteurs demandent d'abord les documents. La gamme PVC d'Elysée est certifiée selon EN 1401 pour le drainage enterré et l'assainissement, EN 1329 pour l'évacuation des eaux-vannes et des eaux usées, et EN ISO 1452 pour l'adduction d'eau sous pression.",
  'A fourth standard, EN 61386, covers conduit systems for electrical infrastructure. Each certificate is audited annually by an independent body and downloadable below — ready for tenders, specifications, and regulatory submissions.':
    "Une quatrième norme, EN 61386, couvre les systèmes de conduits pour les infrastructures électriques. Chaque certificat est audité chaque année par un organisme indépendant et téléchargeable ci-dessous — prêt pour les appels d'offres, les spécifications et les soumissions réglementaires.",
  'Built to disappear': "Conçus pour disparaître",
  'Buried for decades. Certified for all of them.':
    "Enfouis pendant des décennies. Certifiés pour chacune d'elles.",
  'Our PVC Pipes Certifications': "Nos certifications de tubes PVC",
  'Need an older certificate, a tender-ready bundle, or evidence for a specific application class? Our team can prepare it on request.':
    "Vous avez besoin d'un certificat plus ancien, d'un dossier prêt pour un appel d'offres ou d'une preuve pour une classe d'application spécifique ? Notre équipe peut le préparer sur demande.",
  // QUALITY_CATEGORIES blurbs (rendered as {meta.blurb} on detail hero/intro)
  'Quality, environmental, energy, and health & safety management system certificates.':
    "Certificats de système de management de la qualité, de l'environnement, de l'énergie et de la santé & sécurité.",
  'Miscellaneous certificates and recognitions held by Elysée.':
    "Divers certificats et distinctions détenus par Elysée.",
  'Product certificates covering the full Elysée compression-fitting range.':
    "Certificats de produits couvrant l'ensemble de la gamme de raccords à compression Elysée.",
  'Polyethylene pipe certificates across the manufactured diameter range.':
    "Certificats de tubes en polyéthylène sur toute la plage de diamètres fabriqués.",
  'PVC pipe certificates for water-supply, drainage and infrastructure applications.':
    "Certificats de tubes en PVC pour les applications d'adduction d'eau, de drainage et d'infrastructures.",
};
