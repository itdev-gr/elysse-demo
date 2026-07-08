// English UI string → Spanish for the ABOUT-US section: the Corporate Profile,
// History, Company Structure, Vision/Mission/Values and Quality & Certifications
// pages (plus the about-only AboutSubNav). Keyed by the English source text so
// it doubles as the source. Strings already in shared.ts (e.g. nav labels,
// "Read more") are NOT repeated. Brand/proper names (Elysée, Green Elysée),
// certification body names/acronyms (DVGW, KIWA, ISO …), emails, URLs, dates
// and numeric stats are intentionally left untranslated.
export const about: Record<string, string> = {
  // ───────────────────────── AboutSubNav (about-only) ─────────────────────────
  'In this section': 'En esta sección',
  'About Us section': 'Sección Sobre nosotros',

  // ============================================================================
  // Corporate Profile — /about-us/
  // ============================================================================
  // Hero
  'A family business, since 1979.': 'Una empresa familiar, desde 1979.',
  'Manufacturing piping and irrigation systems for water supply, irrigation, sewerage and energy — shipped from Cyprus to more than 65 destinations across four continents.':
    'Fabricación de sistemas de tuberías y riego para abastecimiento de agua, riego, saneamiento y energía — con envío desde Chipre a más de 65 destinos en cuatro continentes.',
  // Stat band
  'By the numbers': 'En cifras',
  'Founded in': 'Año de fundación',
  'Employees': 'Empleados',
  'Product Codes': 'Códigos de producto',
  'Countries Worldwide': 'Países en todo el mundo',
  // Manifesto opening
  'Our purpose': 'Nuestro propósito',
  'Base': 'Sede',
  'Continents': 'Continentes',
  'Sectors': 'Sectores',
  'Ergates · Cyprus': 'Ergates · Chipre',
  'Manufacturing since 1989': 'Fabricación desde 1989',
  // Editorial body
  'A note from the family': 'Una nota de la familia',
  'Founder · Cyprus · 1979': 'Fundador · Chipre · 1979',
  'Est. 1979': 'Fund. 1979',
  'Three generations of Protopapas — same workshop in Ergates, same conviction that water deserves better pipes.':
    'Tres generaciones de Protopapas — el mismo taller en Ergates, la misma convicción de que el agua merece mejores tuberías.',
  'Read the full history': 'Lea la historia completa',
  'Who we are': 'Quiénes somos',
  'Save you time, save you money, and save the planet.':
    'Ahorrarle tiempo, ahorrarle dinero y salvar el planeta.',
  'Years of experience': 'Años de experiencia',
  // Stand-out manifesto
  'What sets us apart': 'Lo que nos distingue',
  'Forty years, one workshop, zero shortcuts.':
    'Cuarenta años, un taller, cero atajos.',
  // Streaming Water cinematic
  'Our founding conviction': 'Nuestra convicción fundacional',
  // Closing CTA
  'From the team to the technology, every part of Elysée is built to back the products we ship. Talk to us about a project, a custom run, or a long-term partnership.':
    'Desde el equipo hasta la tecnología, cada parte de Elysée está concebida para respaldar los productos que enviamos. Háblenos de un proyecto, una producción personalizada o una colaboración a largo plazo.',
  'Contact our network': 'Póngase en contacto con nuestra red',

  // Corporate Profile — dynamic content (from site-content.ts blocks).
  // whoP1.text is split at the first sentence boundary in the page, so the
  // two halves are keyed separately here as well as the full paragraph.
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy.':
    'Elysée fabrica y suministra sistemas de tuberías y riego para abastecimiento de agua, riego, saneamiento y energía.',
  'Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Con sede en Chipre, un enclave clave en la encrucijada de tres continentes, Elysée da servicio a más de 65 destinos en Europa, Oriente Medio, Sudáfrica, Japón, Australia y Nueva Zelanda.',
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Elysée fabrica y suministra sistemas de tuberías y riego para abastecimiento de agua, riego, saneamiento y energía. Con sede en Chipre, un enclave clave en la encrucijada de tres continentes, Elysée da servicio a más de 65 destinos en Europa, Oriente Medio, Sudáfrica, Japón, Australia y Nueva Zelanda.',
  'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.':
    'Está en nuestra naturaleza como empresa, pero también como personas, ser ambiciosos y fijarnos objetivos elevados. Nos inspiran nuestros 40 años de historia y experiencia, y afrontamos nuestra quinta década con optimismo y confianza. Desde nuestros ingenieros expertos hasta nuestro personal de atención al cliente altamente cualificado, el trabajo en equipo desempeña un papel enorme en el éxito de Elysée. La colaboración entre todos los departamentos, la atención al detalle y mucho esfuerzo dan como resultado productos asombrosos, para crear soluciones brillantes que pueden adaptarse a la perfección a cada cliente.',
  'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.':
    'Nos esforzamos por innovar y mejorar y, gracias a que contamos con nuestro propio departamento interno de I+D, podemos ir por delante del resto a la hora de desarrollar y crear productos nuevos y atractivos. Con cada nuevo producto buscamos maximizar no solo la eficiencia del producto, sino también su durabilidad y facilidad de uso. Siempre con la mira puesta en minimizar el impacto ambiental y mantener precios competitivos para usted y su empresa, queremos ahorrarle tiempo, ahorrarle dinero y salvar el planeta.',
  'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.':
    'Con una estructura organizativa flexible, Elysée garantiza una respuesta rápida a las consultas, los pedidos y las oportunidades de colaboración de los clientes. Cada año se desarrollan nuevos productos que se incorporan para mejorar los existentes y crear una gama en constante crecimiento.',
  'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.':
    'Los muchos años de experiencia en el diseño, la fabricación y el suministro de accesorios se reflejan en nuevos productos que responden a las necesidades de los clientes, así como en nuestra capacidad para producir y entregar cada pedido en su destino según lo previsto.',
  'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.':
    'Nuestros productos están certificados por los organismos de normalización internacionales más prestigiosos, como DVGW, WRAS y KIWA, lo que demuestra el esfuerzo constante y continuo de la empresa en la fabricación de productos de alta calidad.',
  'This product range has been proven in the field for forty years.':
    'Esta gama de productos lleva cuarenta años demostrando su eficacia sobre el terreno.',
  'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.':
    'Estos 40 años de experiencia han hecho madurar los procesos y la tecnología de la empresa, que hoy incluyen los equipos de producción y montaje más avanzados. La capacidad se mejora continuamente para satisfacer la demanda tanto en cantidad como en tecnología.',
  'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.':
    'Somos una empresa familiar y nos enorgullecemos de lo que hacemos. La responsabilidad, la honestidad y la estrecha colaboración están presentes en todas las operaciones.',
  'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.':
    'Como seres humanos, queremos lo mismo para nuestras vidas. Nos preocupamos por conducirlas a un destino seguro. Como empresa, fabricamos sistemas fiables para que el agua — y los fluidos en general — fluyan con seguridad hasta su destino. En definitiva, nuestro objetivo es guiar la Vida por un camino verde.',

  // ============================================================================
  // History — /about-us/history/
  // ============================================================================
  // Hero
  'Built one decade at a time.': 'Construida década a década.',
  'From a Cypriot greenhouse in the 1970s to a piping and irrigation manufacturer shipping to 65 destinations — the story of Elysée Irrigation, founded 16 April 1979.':
    'De un invernadero chipriota en la década de 1970 a un fabricante de tuberías y riego que envía a 65 destinos — la historia de Elysée Irrigation, fundada el 16 de abril de 1979.',
  // Stat band
  'Markets served': 'Mercados atendidos',
  'Export awards': 'Premios a la exportación',
  'ISO 9001 since': 'ISO 9001 desde',
  // Origins
  'Origins · 1979': 'Orígenes · 1979',
  'From the workshop': 'Desde el taller',
  'Drippers, sprinklers, fittings': 'Goteros, aspersores, accesorios',
  'Founded': 'Fundada',
  'Nicosia, Cyprus': 'Nicosia, Chipre',
  'Founder': 'Fundador',
  'Agriculture & physics': 'Agricultura y física',
  'Original venture': 'Iniciativa original',
  'Flowers': 'Flores',
  'for the Middle East': 'para Oriente Medio',
  // Milestones
  'A timeline of forty-seven years': 'Una cronología de cuarenta y siete años',
  'Milestones, by the decade.': 'Hitos, década a década.',
  'Today': 'Hoy',
  // Today
  '65 markets. Four sectors. Three distribution hubs.':
    '65 mercados. Cuatro sectores. Tres centros de distribución.',
  'Sectors served': 'Sectores atendidos',
  'Distribution centres': 'Centros de distribución',
  'Plus a network of local agents and sales representatives across all 65 markets.':
    'Además de una red de agentes locales y representantes de ventas en los 65 mercados.',
  'Water Supply': 'Abastecimiento de agua',
  'Irrigation': 'Riego',
  'Infrastructure': 'Infraestructura',
  'Energy': 'Energía',
  'Austria': 'Austria',
  'Russia': 'Rusia',
  'Lebanon': 'Líbano',
  // Where it started
  'Where it started': 'Dónde empezó',
  'The original line.': 'La línea original.',
  'Drippers': 'Goteros',
  'Sprinklers': 'Aspersores',
  'Compression fittings': 'Accesorios de compresión',
  'Saddles': 'Collarines de toma',
  'Threaded fittings': 'Accesorios roscados',
  // History — dynamic content. intro1.text is split into three sentences in
  // the page (originsHeadline / originsBody / originsTail), so each is keyed.
  'It was a love of nature that led to the birth of our company, Elysée.':
    'Fue el amor por la naturaleza lo que dio origen a nuestra empresa, Elysée.',
  'With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East.':
    'Con raíces en la agricultura y una licenciatura en física, el fundador, Antonis Protopapas, tuvo la idea de crear un negocio centrado en cultivar las mejores flores de Oriente Medio.',
  'And so, that was the start of this beautiful journey…':
    'Y así comenzó este hermoso viaje…',
  "It was a love of nature that led to the birth of our company, Elysée. With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East. And so, that was the start of this beautiful journey…":
    'Fue el amor por la naturaleza lo que dio origen a nuestra empresa, Elysée. Con raíces en la agricultura y una licenciatura en física, el fundador, Antonis Protopapas, tuvo la idea de crear un negocio centrado en cultivar las mejores flores de Oriente Medio. Y así comenzó este hermoso viaje…',
  'Through this venture, the need to know more about irrigation became a priority. Back in the 1970s the new art of irrigation was on the rise, and the know-how was brought in to help Elysée grow world-class flowers.':
    'A través de esta iniciativa, la necesidad de saber más sobre el riego se convirtió en una prioridad. En la década de 1970 el nuevo arte del riego estaba en auge, y se incorporó el conocimiento técnico para ayudar a Elysée a cultivar flores de talla mundial.',
  'With our newly acquired knowledge of irrigation and irrigation needs, the next step was to move into irrigation trading, trading pipe fittings and then… into manufacturing them. So, in 1979, on 16 April, Elysée Irrigation was founded.':
    'Con nuestros conocimientos recién adquiridos sobre el riego y sus necesidades, el siguiente paso fue entrar en el comercio del riego, comerciando con accesorios de tubería y, después… fabricándolos. Así, en 1979, el 16 de abril, se fundó Elysée Irrigation.',
  'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.':
    'La misma convicción que dio origen a la empresa la impulsa aún hoy: construir sistemas fiables que lleven el agua — y la Vida — con seguridad hasta donde se necesita.',
  'Elysée Irrigation founded': 'Fundación de Elysée Irrigation',
  'Founded on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas. The first production facility was co-located with farming and flower preparation for the international markets — exciting times where the exploration of the unknown field of plastic manufacturing was hard but rewarding for a young company.':
    'Fundada el 16 de abril de 1979 en Nicosia, Chipre, por Antonis Protopapas. La primera planta de producción compartía ubicación con la agricultura y la preparación de flores para los mercados internacionales — tiempos apasionantes en los que la exploración del desconocido campo de la fabricación de plásticos resultaba difícil pero gratificante para una empresa joven.',
  'As early as 1980, the first export activities began, in the nearby markets of the Middle East — an area which at the time was only starting to utilize irrigation techniques.':
    'Ya en 1980 comenzaron las primeras actividades de exportación, en los mercados cercanos de Oriente Medio — una zona que en aquel momento apenas empezaba a utilizar técnicas de riego.',
  'Early success led to fast growth which demanded a dedicated industrial space. The current site in the Ergates Industrial Area was established. The product range at the time comprised a substantial series of drippers and sprinklers as well as an extensive range of compression fittings, saddles, and threaded fittings.':
    'El éxito temprano dio lugar a un rápido crecimiento que exigía un espacio industrial propio. Se estableció la sede actual en la Zona Industrial de Ergates. La gama de productos de la época comprendía una importante serie de goteros y aspersores, así como una amplia gama de accesorios de compresión, collarines de toma y accesorios roscados.',
  'A piping system is never complete without a pipe, hence in 1991 a polyethylene pipe manufacturing unit was established at the Ergates site — Elysée could now offer a full water-supply solution. Its early success led to the extension of the range with PVC pipe manufacturing, entering the construction and infrastructure world.':
    'Un sistema de tuberías nunca está completo sin un tubo, de modo que en 1991 se estableció en la sede de Ergates una unidad de fabricación de tubería de polietileno — Elysée podía ofrecer ahora una solución completa de abastecimiento de agua. Su éxito temprano llevó a ampliar la gama con la fabricación de tubería de PVC, entrando en el mundo de la construcción y las infraestructuras.',
  'An extensive range of products meant the quality-control division had to be formally established, leading to the certification of the company with ISO 9001 as early as 1998.':
    'Una amplia gama de productos hizo necesario establecer formalmente la división de control de calidad, lo que condujo a la certificación de la empresa con ISO 9001 ya en 1998.',
  'A new office building was erected to host the main offices of the company — until then located in central Nicosia — optimizing operations and preparing for the next step in expansion.':
    'Se erigió un nuevo edificio de oficinas para albergar las oficinas principales de la empresa — hasta entonces situadas en el centro de Nicosia — optimizando las operaciones y preparando el siguiente paso de la expansión.',
  'The first recognition of international activity for Elysée came with the Special Export Award. That same year, a new function was born within the company: the Research and Development department, leading the advancement of technology and improvement of the product range. Elysée was now a complete and modern company, investing significantly in the international market.':
    'El primer reconocimiento a la actividad internacional de Elysée llegó con el Premio Especial a la Exportación. Ese mismo año nació una nueva función dentro de la empresa: el departamento de Investigación y Desarrollo, que lidera el avance de la tecnología y la mejora de la gama de productos. Elysée era ya una empresa completa y moderna, que invertía de forma significativa en el mercado internacional.',
  'The years that followed saw a major expansion in global reach and market coverage. Elysée products could be found on all 5 continents and in a steadily growing number of countries. A series of 4 further Export Awards (2003, 2008, 2012 and 2016) is a testimony to just that.':
    'Los años siguientes fueron testigos de una gran expansión del alcance global y de la cobertura de mercados. Los productos de Elysée podían encontrarse en los 5 continentes y en un número cada vez mayor de países. Una serie de 4 Premios a la Exportación adicionales (2003, 2008, 2012 y 2016) es prueba precisamente de ello.',
  'Our international network of selected partners currently spans 65 markets, where Elysée is active in 4 sectors — Water Supply, Irrigation, Infrastructure and Energy. To respond directly to the changing needs of the global market, Elysée has expanded its operations by establishing 3 distribution centres in Austria, Russia, and Lebanon.':
    'Nuestra red internacional de socios seleccionados abarca actualmente 65 mercados, donde Elysée está presente en 4 sectores — Abastecimiento de agua, Riego, Infraestructura y Energía. Para responder directamente a las cambiantes necesidades del mercado global, Elysée ha ampliado sus operaciones estableciendo 3 centros de distribución en Austria, Rusia y Líbano.',
  'Our international network of selected partners spans 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by 3 distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.':
    'Nuestra red internacional de socios seleccionados abarca 65 mercados en cuatro sectores — Abastecimiento de agua, Riego, Infraestructura y Energía — respaldada por 3 centros de distribución en Austria, Rusia y Líbano y una red de agentes locales y representantes de ventas.',
  'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:':
    'La gama de productos que puso a Elysée en el mapa en la década de 1980 sigue siendo hoy la base del catálogo:',
  'Enquiries and orders reach us through our wide network of local agents and sales representatives.':
    'Las consultas y los pedidos nos llegan a través de nuestra amplia red de agentes locales y representantes de ventas.',

  // ============================================================================
  // Company Structure — /about-us/company-structure/
  // ============================================================================
  // Hero
  'An efficient team.': 'Un equipo eficiente.',
  'A clear structure.': 'Una estructura clara.',
  'Three divisions, one workshop in Cyprus — engineered around quick response, certified quality, and a growing product range.':
    'Tres divisiones, un taller en Chipre — concebidos en torno a la respuesta rápida, la calidad certificada y una gama de productos en crecimiento.',
  // Stat band
  'Production divisions': 'Divisiones de producción',
  'Fittings catalogued': 'Accesorios catalogados',
  'Pipe diameter range (mm)': 'Rango de diámetro de tubería (mm)',
  // Efficient team
  'An efficient team': 'Un equipo eficiente',
  "Built for the customer's call.": 'Preparado para la llamada del cliente.',
  'Three operating principles that keep our workshop in step with the people we ship to — from a first phone call through a custom order to a long-term partnership.':
    'Tres principios operativos que mantienen nuestro taller en sintonía con las personas a las que enviamos — desde una primera llamada telefónica, pasando por un pedido personalizado, hasta una colaboración a largo plazo.',
  'From the floor': 'Desde la planta de producción',
  'Engineers, consultants, makers': 'Ingenieros, consultores, fabricantes',
  'Three principles. One workshop in Ergates.': 'Tres principios. Un taller en Ergates.',
  'Flexible by design': 'Flexible por diseño',
  'Engineering at the front desk': 'Ingeniería en primera línea',
  'Quality covers both sides': 'La calidad cubre ambos lados',
  // Divisions
  'Our divisions': 'Nuestras divisiones',
  'Three teams, one workshop.': 'Tres equipos, un taller.',
  'Fittings Division': 'División de Accesorios',
  'Pipes Division': 'División de Tuberías',
  'Quality Assurance Division': 'División de Garantía de Calidad',
  'Explore Fittings': 'Explore los Accesorios',
  'Explore Pipes': 'Explore las Tuberías',
  'See certifications': 'Vea las certificaciones',
  // Closing CTA
  'Want to discuss a specific application, a custom OEM run, or a project specification? Our engineers and technical consultants are available to advise.':
    '¿Desea comentar una aplicación específica, una producción OEM personalizada o la especificación de un proyecto? Nuestros ingenieros y consultores técnicos están a su disposición para asesorarle.',
  // Company Structure — dynamic content
  'With flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and we regularly upgrade existing products to create a constantly growing range.':
    'Con una estructura organizativa flexible, Elysée garantiza una respuesta rápida a las consultas, los pedidos y las oportunidades de colaboración de los clientes. Cada año se desarrollan nuevos productos y mejoramos periódicamente los existentes para crear una gama en constante crecimiento.',
  "Our team of expert engineers and technical consultants is constantly available to offer technical advice to our clients on the use of Elysée's fittings and piping systems.":
    'Nuestro equipo de ingenieros expertos y consultores técnicos está permanentemente disponible para ofrecer asesoramiento técnico a nuestros clientes sobre el uso de los accesorios y los sistemas de tuberías de Elysée.',
  'We at Elysée realize that from a customer\'s perspective, the term "quality" covers both the product and the service. Our ever growing customer list reflects our determination to settle for nothing less.':
    'En Elysée somos conscientes de que, desde la perspectiva del cliente, el término «calidad» abarca tanto el producto como el servicio. Nuestra lista de clientes en constante crecimiento refleja nuestra determinación de no conformarnos con menos.',
  'As a business, our green credentials are very important to us, and so our desire to innovate extends from our product development to our business processes. Implementing Lean Kaizen techniques has brought with it an increase in efficiency and a decrease in waste. We\'ve reduced our environmental impact by reducing our energy consumption and keeping the waste we send to landfill to a minimum. By increasing our efficiency, we\'re boosting our productivity and protecting our planet too.':
    'Como empresa, nuestras credenciales ecológicas son muy importantes para nosotros, y por ello nuestro afán de innovar se extiende desde el desarrollo de productos hasta nuestros procesos empresariales. La aplicación de técnicas Lean Kaizen ha traído consigo un aumento de la eficiencia y una reducción de los residuos. Hemos reducido nuestro impacto ambiental disminuyendo el consumo de energía y manteniendo al mínimo los residuos que enviamos a vertedero. Al aumentar nuestra eficiencia, impulsamos nuestra productividad y protegemos también nuestro planeta.',
  'Elysée operates through three core production divisions, each focused on a specific area of manufacturing and quality assurance.':
    'Elysée opera a través de tres divisiones de producción principales, cada una centrada en un área específica de fabricación y garantía de calidad.',
  'Focusing on the production of pipe fittings and irrigation accessories, the Fittings Division manufactures over 1000 items in different sizes and for diverse applications, made of the most suitable raw materials in each case, from polypropylene to polyacetal and nylon.':
    'Centrada en la producción de accesorios de tubería y accesorios de riego, la División de Accesorios fabrica más de 1000 artículos en diferentes tamaños y para diversas aplicaciones, elaborados con las materias primas más adecuadas en cada caso, desde el polipropileno hasta el poliacetal y el nailon.',
  'The division manufactures PVC and PE pipes with a diameter range of 5–315 mm, suitable for a wide range of practical applications.':
    'La división fabrica tuberías de PVC y PE con un rango de diámetros de 5–315 mm, adecuadas para una amplia variedad de aplicaciones prácticas.',
  'The Quality Assurance Division is dedicated to implementing, sustaining and improving the quality at every level of production, from the raw material through to the finished product. With the aid of sophisticated equipment and apparatus, we can verify that the final products do in fact conform to national and international standards.':
    'La División de Garantía de Calidad se dedica a implantar, mantener y mejorar la calidad en todos los niveles de producción, desde la materia prima hasta el producto acabado. Con la ayuda de equipos y aparatos sofisticados, podemos verificar que los productos finales cumplen efectivamente las normas nacionales e internacionales.',
  'Green Operations': 'Operaciones ecológicas',
  'Our operating principle': 'Nuestro principio de funcionamiento',

  // ============================================================================
  // Vision, Mission & Values — /about-us/vision-mission-values/
  // ============================================================================
  // Hero (h1 is split across a <br/> into two fragments)
  'Vision, Mission': 'Visión, Misión',
  '& Values.': '& Valores.',
  'What drives us, every day, in every market.': 'Lo que nos impulsa, cada día, en cada mercado.',
  // Framework
  'By the framework': 'Según el marco',
  'One vision. Five pillars. Six values.': 'Una visión. Cinco pilares. Seis valores.',
  'Vision sets the destination. Mission sets the pace. Values set the tone. The W·I·S·E framework is the test we hold every product, every process and every partnership to.':
    'La visión fija el destino. La misión marca el ritmo. Los valores establecen el tono. El marco W·I·S·E es la prueba a la que sometemos cada producto, cada proceso y cada colaboración.',
  'Reads': 'Se lee',
  'Top → bottom': 'De arriba → abajo',
  'Anchor': 'Ancla',
  'Updated': 'Actualizado',
  'Chapter One · Destination': 'Capítulo Uno · Destino',
  'Chapter Two · Pace': 'Capítulo Dos · Ritmo',
  'Chapter Three · Tone': 'Capítulo Tres · Tono',
  'Anchor · The test': 'Ancla · La prueba',
  'Vision': 'Visión',
  'Mission pillars': 'Pilares de la misión',
  'Core values': 'Valores fundamentales',
  'Framework': 'Marco',
  'A single statement of where Elysée is heading — green leadership worldwide through W·I·S·E piping systems.':
    'Una única declaración de hacia dónde se dirige Elysée — liderazgo ecológico a escala mundial mediante sistemas de tuberías W·I·S·E.',
  'Five commitments that translate the Vision into day-to-day priorities — for customers, people, growth and the planet.':
    'Cinco compromisos que traducen la Visión en prioridades cotidianas — para los clientes, las personas, el crecimiento y el planeta.',
  'Six principles that guide how we work with each other, with our customers and with the environment we operate in.':
    'Seis principios que orientan cómo trabajamos entre nosotros, con nuestros clientes y con el entorno en el que operamos.',
  'Worldwide. Innovative. Smart. Easy-to-Use. The four words we test every product, process and partnership against.':
    'Mundial. Innovador. Inteligente. Fácil de usar. Las cuatro palabras con las que evaluamos cada producto, proceso y colaboración.',
  // Why we exist
  'Why we exist': 'Por qué existimos',
  'Customer-first, by design.': 'El cliente primero, por diseño.',
  'Three sentences that set the operating philosophy for the entire company.':
    'Tres frases que definen la filosofía de funcionamiento de toda la empresa.',
  // Vision cinematic
  'Chapter One · Our Vision': 'Capítulo Uno · Nuestra Visión',
  // WISE strip
  'The W·I·S·E framework': 'El marco W·I·S·E',
  'Four letters, one operating philosophy.': 'Cuatro letras, una filosofía de funcionamiento.',
  'Every product, every process, every partnership is tested against four words. They appear together as W·I·S·E — and they precede the Vision, the Mission, and every Value below.':
    'Cada producto, cada proceso, cada colaboración se evalúa con cuatro palabras. Aparecen juntas como W·I·S·E — y preceden a la Visión, la Misión y cada Valor que figura a continuación.',
  'Worldwide': 'Mundial',
  'Innovative': 'Innovador',
  'Smart': 'Inteligente',
  'Easy-to-Use': 'Fácil de usar',
  'Engineered for 65 destinations across four sectors.':
    'Diseñados para 65 destinos en cuatro sectores.',
  'Forty years of R&D, six EU-funded research programmes.':
    'Cuarenta años de I+D, seis programas de investigación financiados por la UE.',
  'Designed for easy install, low maintenance, long life.':
    'Diseñados para una instalación fácil, un mantenimiento reducido y una larga vida útil.',
  'Field-proven fittings, intuitive systems, technical advice on call.':
    'Accesorios probados sobre el terreno, sistemas intuitivos, asesoramiento técnico a demanda.',
  // Mission
  'Chapter Two · Our Mission': 'Capítulo Dos · Nuestra Misión',
  'Five commitments. One workshop.': 'Cinco compromisos. Un taller.',
  'Five commitments translate the Vision into day-to-day priorities — for our customers, our people, our growth, and the planet.':
    'Cinco compromisos traducen la Visión en prioridades cotidianas — para nuestros clientes, nuestro personal, nuestro crecimiento y el planeta.',
  'Mission anchor': 'Ancla de la misión',
  'Streaming water, streaming life': 'Streaming water, streaming life',
  'Five pillars that turn the brand promise into practice.':
    'Cinco pilares que convierten la promesa de marca en práctica.',
  'Preserve water for future generations': 'Preservar el agua para las generaciones futuras',
  'Give partners a competitive edge': 'Dar a los socios una ventaja competitiva',
  'Lead our people to full potential': 'Llevar a nuestro personal a su máximo potencial',
  'Sustainable, profitable growth': 'Crecimiento sostenible y rentable',
  'Better Earth, better society': 'Mejor Tierra, mejor sociedad',
  // Mission list (dynamic from site-content)
  'Develop W.I.S.E. Products to preserve water resources for future generations.':
    'Desarrollar Productos W.I.S.E. para preservar los recursos hídricos para las generaciones futuras.',
  'Provide our Customers and Partners with a competitive edge.':
    'Proporcionar a nuestros Clientes y Socios una ventaja competitiva.',
  'Lead our people to meet their full potential.':
    'Guiar a nuestro personal para que alcance su máximo potencial.',
  'Achieve sustainable and profitable company growth.':
    'Lograr un crecimiento empresarial sostenible y rentable.',
  'Contribute to Society and the Environment, making Earth a better place to live.':
    'Contribuir a la Sociedad y el Medioambiente, haciendo de la Tierra un lugar mejor para vivir.',
  // Values
  'Chapter Three · Our Values': 'Capítulo Tres · Nuestros Valores',
  'Six principles, not posters.': 'Seis principios, no carteles.',
  'Six principles that guide how we work — with each other, with our customers and with the environment we operate in.':
    'Seis principios que orientan cómo trabajamos — entre nosotros, con nuestros clientes y con el entorno en el que operamos.',
  'Business-driven innovation': 'Innovación impulsada por el negocio',
  'Green thinking': 'Pensamiento ecológico',
  'Customer commitment and value creation': 'Compromiso con el cliente y creación de valor',
  'Quality and continuous improvement': 'Calidad y mejora continua',
  'Respect each other and win as a team': 'Respetarnos mutuamente y ganar como equipo',
  'Promote personal and professional growth': 'Fomentar el crecimiento personal y profesional',
  'Every new product starts with a real-world problem we have heard from customers.':
    'Cada nuevo producto parte de un problema real que nos han planteado los clientes.',
  'Sustainability lives in our procurement, our process and our packaging.':
    'La sostenibilidad está presente en nuestras compras, nuestro proceso y nuestro embalaje.',
  'Long-term partnerships beat one-off transactions, every time.':
    'Las colaboraciones a largo plazo superan a las transacciones puntuales, siempre.',
  'ISO 9001 since 1998. Improvement is a daily practice, not a target.':
    'ISO 9001 desde 1998. La mejora es una práctica diaria, no un objetivo.',
  'Three generations of family business — built on accountability.':
    'Tres generaciones de empresa familiar — construida sobre la responsabilidad.',
  'We invest in the people who build, ship and back our products.':
    'Invertimos en las personas que fabrican, envían y respaldan nuestros productos.',
  // VMV intro/vision (dynamic from site-content)
  'Our customers are at the heart of everything we do, so that is what we focus on. We design innovative piping solutions for easy installation, durability, and minimal maintenance — and we tailor them, through our expert advisors and OEM programmes, to the specific needs of each customer.':
    'Nuestros clientes están en el centro de todo lo que hacemos, y en eso nos centramos. Diseñamos soluciones de tuberías innovadoras para una instalación fácil, la durabilidad y un mantenimiento mínimo — y las adaptamos, a través de nuestros asesores expertos y nuestros programas OEM, a las necesidades específicas de cada cliente.',
  'To be a green leader worldwide through Innovative, Smart, Easy-to-Use Piping Systems.':
    'Ser un líder ecológico a escala mundial mediante Sistemas de Tuberías Innovadores, Inteligentes y Fáciles de usar.',
  // VMV closing CTA
  'Our Vision, Mission and Values are not posters on a wall — they shape every decision we make, from product design to customer service. Talk to us about how we put them into practice.':
    'Nuestra Visión, Misión y Valores no son carteles en una pared — moldean cada decisión que tomamos, desde el diseño del producto hasta la atención al cliente. Háblenos de cómo los llevamos a la práctica.',

  // ============================================================================
  // Quality & Certifications — /about-us/quality-certifications/
  // ============================================================================
  // Hero
  'Quality, by certificate.': 'Calidad, con certificado.',
  // Stat band
  'Years accredited': 'Años de acreditación',
  'Certificate bodies': 'Organismos de certificación',
  'Batches certified': 'Lotes certificados',
  // A matter of principle
  'A matter of principle': 'Una cuestión de principios',
  'Patented, engineered, certified.': 'Patentados, diseñados, certificados.',
  'Two paragraphs that anchor everything we do — from the resin we accept to the certificate we ship with every order.':
    'Dos párrafos que sustentan todo lo que hacemos — desde la resina que aceptamos hasta el certificado que enviamos con cada pedido.',
  // ISO callout
  'Cornerstone certification': 'Certificación fundamental',
  // How we verify
  'How we verify': 'Cómo verificamos',
  'Four steps. Every batch. Every time.': 'Cuatro pasos. Cada lote. Cada vez.',
  'The same four checks happen on every shipment: incoming material, in-process QC, finished batch sampling and a traceable certificate.':
    'Los mismos cuatro controles se realizan en cada envío: material entrante, control de calidad en proceso, muestreo del lote acabado y un certificado trazable.',
  'Cadence': 'Frecuencia',
  'Every batch': 'Cada lote',
  'Standard': 'Norma',
  'Step One · Material': 'Paso Uno · Material',
  'Step Two · Process': 'Paso Dos · Proceso',
  'Step Three · Product': 'Paso Tres · Producto',
  'Step Four · Certificate': 'Paso Cuatro · Certificado',
  'Material check': 'Control de material',
  'In-process QC': 'Control de calidad en proceso',
  'Batch testing': 'Ensayo de lote',
  'Documented release': 'Liberación documentada',
  'Every incoming PE and PVC resin batch is tested against our internal spec sheet before it enters production.':
    'Cada lote entrante de resina de PE y PVC se ensaya conforme a nuestra hoja de especificaciones interna antes de entrar en producción.',
  'Continuous in-line monitoring during extrusion and moulding flags drift before it ever reaches a finished part.':
    'La monitorización continua en línea durante la extrusión y el moldeo detecta las desviaciones antes de que lleguen siquiera a una pieza acabada.',
  'Finished batches are sampled against ISO and EN test methods — burst, impact, environmental and dimensional.':
    'Los lotes acabados se muestrean conforme a los métodos de ensayo ISO y EN — de rotura, de impacto, ambientales y dimensionales.',
  'Every shipment ships with traceable documentation — request a certificate for any tender or specification.':
    'Cada envío se despacha con documentación trazable — solicite un certificado para cualquier licitación o especificación.',
  // Six categories
  'Our certifications': 'Nuestras certificaciones',
  'Six categories of certificate.': 'Seis categorías de certificado.',
  'View certificates': 'Ver certificados',
  // Closing CTA
  'Request a certificate': 'Solicitar un certificado',
  'Need a specific certificate for a tender, regulatory submission, or specification document? Our team can provide it on request.':
    '¿Necesita un certificado específico para una licitación, una presentación reglamentaria o un documento de especificaciones? Nuestro equipo puede facilitárselo previa solicitud.',
  'Contact our local network': 'Póngase en contacto con nuestra red local',
  // Q&C — dynamic content (from site-content.ts)
  'Developed to the highest of standards, Elysée products are patented and engineered in-house in our own R&D department. Offering eco-friendly, corrosion-free, and easy-to-install solutions at great value prices, resulting in the highest level of customer satisfaction.':
    'Desarrollados conforme a las normas más exigentes, los productos de Elysée están patentados y diseñados internamente en nuestro propio departamento de I+D. Ofrecen soluciones respetuosas con el medioambiente, resistentes a la corrosión y fáciles de instalar, a precios de gran valor, lo que se traduce en el máximo nivel de satisfacción del cliente.',
  'Ever since our establishment, quality has been a major principle covering Elysée operations. By introducing a quality management system, we are able to monitor our activities and efficiency, in order to elevate our overall performance. Today Elysée Irrigation LTD proudly holds internationally renowned certificates of piping systems, a testimony of commitment to quality.':
    'Desde nuestra fundación, la calidad ha sido un principio fundamental que rige las operaciones de Elysée. Al implantar un sistema de gestión de la calidad, podemos supervisar nuestras actividades y nuestra eficiencia con el fin de elevar nuestro rendimiento global. Hoy, Elysée Irrigation LTD ostenta con orgullo certificados de sistemas de tuberías reconocidos internacionalmente, testimonio de su compromiso con la calidad.',
  'Elysée products are certified by the most reputable international standards organizations. Our portfolio is organised into six categories, mirroring the way our products reach the market.':
    'Los productos de Elysée están certificados por los organismos de normalización internacionales más prestigiosos. Nuestra cartera está organizada en seis categorías, que reflejan la forma en que nuestros productos llegan al mercado.',
  'Elysée achieved ISO 9001 certification in 1998 following the formal establishment of its quality-control division — a commitment to quality management that has been maintained and renewed continuously ever since.':
    'Elysée obtuvo la certificación ISO 9001 en 1998 tras el establecimiento formal de su división de control de calidad — un compromiso con la gestión de la calidad que se ha mantenido y renovado continuamente desde entonces.',
  'ISO 9001 since 1998': 'ISO 9001 desde 1998',
  'Management System': 'Sistema de Gestión',
  'General': 'General',
  'PE Pipes': 'Tuberías de PE',
  'PVC Pipes': 'Tuberías de PVC',
  'ISO 9001 quality management — certified since 1998 and renewed continuously.':
    'Gestión de la calidad ISO 9001 — certificada desde 1998 y renovada continuamente.',
  'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.':
    'Certificaciones transversales de organismos reconocidos internacionalmente, como DVGW, KIWA, SII y OVGW.',
  'Product certifications covering the full Elysée compression-fitting range for water-supply applications.':
    'Certificaciones de producto que cubren toda la gama de accesorios de compresión de Elysée para aplicaciones de abastecimiento de agua.',
  'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.':
    'Certificaciones de tubería de polietileno en toda la gama de diámetros fabricados, adecuadas para agua potable, gas y fluidos industriales.',
  'PVC pipe certifications for water-supply, drainage and infrastructure applications.':
    'Certificaciones de tubería de PVC para aplicaciones de abastecimiento de agua, drenaje e infraestructura.',
  'Environmental and sustainability certifications attached to the Green Elysée product line.':
    'Certificaciones ambientales y de sostenibilidad asociadas a la línea de productos Green Elysée.',

  // ============================================================================
  // Quality & Certifications — category detail pages (shared chrome)
  // ============================================================================
  'All certificate categories': 'Todas las categorías de certificados',
  // Hero "<count> certified …" trailing phrase (count stays in its own span)
  'certified standards': 'normas certificadas',
  'certified recognitions': 'reconocimientos certificados',
  'certified approvals': 'homologaciones certificadas',
  'standards.': 'normas.',
  'PDFs.': 'PDF.',
  'Tap any badge below to download the current certificate.':
    'Toque cualquier distintivo de abajo para descargar el certificado actual.',
  'Standard families': 'Familias de normas',
  'Audit cadence': 'Frecuencia de auditoría',
  'Annual': 'Anual',
  'Markets covered': 'Mercados cubiertos',
  'Product certificates': 'Certificados de producto',
  // general.astro
  'Recognised, by certificate.': 'Reconocida, con certificado.',
  'Beyond the product line': 'Más allá de la línea de productos',
  'Recognitions': 'Reconocimientos',
  'Productivity programme': 'Programa de productividad',
  'Packaging recovery': 'Recuperación de envases',
  'Review cadence': 'Frecuencia de revisión',
  'Beyond the product': 'Más allá del producto',
  'Quality, outside the box.': 'Calidad, fuera de la caja.',
  'Not every certificate fits a product family — some recognise how the company works, trains, and takes responsibility.':
    'No todos los certificados encajan en una familia de productos — algunos reconocen cómo trabaja, forma y asume responsabilidades la empresa.',
  "Pipes and fittings carry most of Elysée's certificates — but quality runs wider than the product catalogue. The recognitions on this page cover the company itself: the national productivity-improvement programme we take part in, and our membership of the Green Dot packaging recovery scheme.":
    'Las tuberías y los accesorios reúnen la mayoría de los certificados de Elysée — pero la calidad se extiende más allá del catálogo de productos. Los reconocimientos de esta página abarcan a la propia empresa: el programa nacional de mejora de la productividad en el que participamos y nuestra adhesión al sistema de recuperación de envases Green Dot.',
  'Like every other certificate we hold, each one is issued by an independent body and downloadable below — the same documents we provide for tenders, partnerships, and corporate due diligence.':
    'Como todos los demás certificados que poseemos, cada uno es emitido por un organismo independiente y puede descargarse a continuación — los mismos documentos que facilitamos para licitaciones, colaboraciones y procesos de diligencia debida corporativa.',
  'The wider picture': 'La visión de conjunto',
  'Quality is a habit, not a category.': 'La calidad es un hábito, no una categoría.',
  'Our General Certifications': 'Nuestras Certificaciones Generales',
  "Need an older certificate, a tender-ready bundle, or evidence of a recognition you don't see here? Our team can prepare it on request.":
    '¿Necesita un certificado más antiguo, un paquete listo para licitación o la constancia de un reconocimiento que no ve aquí? Nuestro equipo puede prepararlo previa solicitud.',
  // management-system.astro
  'Managed, by certificate.': 'Gestionada, con certificado.',
  'The management system': 'El sistema de gestión',
  'System certificates': 'Certificados del sistema',
  'Why a system, not a checklist': 'Por qué un sistema, no una lista de verificación',
  'One system. Four disciplines.': 'Un sistema. Cuatro disciplinas.',
  'Quality, environment, energy, and health & safety — each independently certified, all bound by one integrated policy.':
    'Calidad, medioambiente, energía y salud y seguridad — cada una certificada de forma independiente, todas regidas por una única política integrada.',
  'Elysée has run a certified quality management system since 1998. Over the years it has grown into a single integrated framework: ISO 9001 for quality, ISO 14001 and EMAS for the environment, ISO 50001 for energy, and ISO 45001 for the health and safety of everyone on site.':
    'Elysée gestiona un sistema certificado de gestión de la calidad desde 1998. Con los años ha evolucionado hasta convertirse en un único marco integrado: ISO 9001 para la calidad, ISO 14001 y EMAS para el medioambiente, ISO 50001 para la energía e ISO 45001 para la salud y la seguridad de todas las personas en las instalaciones.',
  'Every standard below is audited by an independent certification body on an annual cycle, and every claim is backed by a downloadable certificate — the same documents we submit with tenders, regulatory filings, and specification packages.':
    'Cada norma que figura a continuación es auditada por un organismo de certificación independiente en un ciclo anual, y cada afirmación está respaldada por un certificado descargable — los mismos documentos que presentamos con las licitaciones, las presentaciones reglamentarias y los paquetes de especificaciones.',
  'The discipline behind the product': 'La disciplina detrás del producto',
  'Say what you do. Do what you say. Prove it.':
    'Diga lo que hace. Haga lo que dice. Demuéstrelo.',
  'Our Management System Certifications': 'Nuestras Certificaciones del Sistema de Gestión',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific management standard? Our team can prepare it on request.':
    '¿Necesita un certificado más antiguo, un paquete listo para licitación o la constancia de una norma de gestión específica? Nuestro equipo puede prepararlo previa solicitud.',
  // compression-fittings.astro
  'Approved, by certificate.': 'Homologados, con certificado.',
  'The fittings programme': 'El programa de accesorios',
  'Why approvals matter': 'Por qué importan las homologaciones',
  'One fitting. Twelve markets.': 'Un accesorio. Doce mercados.',
  'From KIWA to WaterMark — every market Elysée fittings ship to has its own approval body, and the range is certified in each one.':
    'De KIWA a WaterMark — cada mercado al que se envían los accesorios de Elysée tiene su propio organismo de homologación, y la gama está certificada en cada uno de ellos.',
  'Drinking water is the most regulated product there is — and every country guards it with its own approval scheme. The Elysée compression-fitting range carries them across Europe and beyond: DVGW in Germany, WRAS in the UK, KIWA in the Netherlands, SVGW in Switzerland, ÖVGW in Austria, WaterMark in Australia, and more.':
    'El agua potable es el producto más regulado que existe — y cada país la protege con su propio sistema de homologación. La gama de accesorios de compresión de Elysée las reúne por toda Europa y más allá: DVGW en Alemania, WRAS en el Reino Unido, KIWA en los Países Bajos, SVGW en Suiza, ÖVGW en Austria, WaterMark en Australia y más.',
  'Each approval below is issued by an independent national body against EN 12201-3, ISO 17885, or the local water-contact regulations — and each one is downloadable as the current PDF, ready for tenders, specifications, and regulatory submissions.':
    'Cada homologación que figura a continuación es emitida por un organismo nacional independiente conforme a EN 12201-3, ISO 17885 o la normativa local de contacto con el agua — y cada una puede descargarse como el PDF actual, lista para licitaciones, especificaciones y presentaciones reglamentarias.',
  'Worldwide approvals': 'Homologaciones en todo el mundo',
  'Approved at home — wherever home is.': 'Homologados en casa — dondequiera que esté esa casa.',
  'Our Compression Fittings Certifications': 'Nuestras Certificaciones de Accesorios de Compresión',
  "Need an older certificate, a tender-ready bundle, or an approval for a market you don't see here? Our team can prepare it on request.":
    '¿Necesita un certificado más antiguo, un paquete listo para licitación o una homologación para un mercado que no ve aquí? Nuestro equipo puede prepararlo previa solicitud.',
  // pe-pipes.astro
  'Proven, by certificate.': 'Probadas, con certificado.',
  'The PE programme': 'El programa de PE',
  'Core standard': 'Norma principal',
  'PE materials covered': 'Materiales de PE cubiertos',
  'From resin to reel': 'De la resina al rollo',
  'Every diameter, certified.': 'Cada diámetro, certificado.',
  'From HDPE mains to LDPE irrigation lines — the polyethylene range is certified across every diameter we extrude.':
    'De las conducciones principales de HDPE a las líneas de riego de LDPE — la gama de polietileno está certificada en cada diámetro que extruimos.',
  "Polyethylene pipe carries water under pressure for decades — so its certification leaves no room for interpretation. Elysée's HDPE range is certified to EN 12201-2 across the manufactured diameter range, while the LDPE line carries the Cyprus national standard CYS 106.":
    'La tubería de polietileno transporta agua a presión durante décadas — por lo que su certificación no deja lugar a interpretaciones. La gama HDPE de Elysée está certificada conforme a EN 12201-2 en toda la gama de diámetros fabricados, mientras que la línea LDPE lleva la norma nacional chipriota CYS 106.',
  'Around the core standards sit market approvals — AENOR certification to ISO 15875 and WRAS approval for stop valves in UK drinking-water installations. Every certificate is audited annually and downloadable below.':
    'En torno a las normas principales se sitúan las homologaciones de mercado — la certificación AENOR conforme a ISO 15875 y la homologación WRAS para válvulas de corte en instalaciones de agua potable del Reino Unido. Cada certificado se audita anualmente y puede descargarse a continuación.',
  'Built for pressure': 'Concebidas para la presión',
  'Pressure-rated. Paper-backed.': 'Con presión nominal. Con respaldo documental.',
  'Our PE Pipes Certifications': 'Nuestras Certificaciones de Tuberías de PE',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific diameter class? Our team can prepare it on request.':
    '¿Necesita un certificado más antiguo, un paquete listo para licitación o la constancia de una clase de diámetro específica? Nuestro equipo puede prepararlo previa solicitud.',
  // pvc-pipes.astro
  'Specified, by certificate.': 'Especificadas, con certificado.',
  'The PVC programme': 'El programa de PVC',
  'Drainage standard': 'Norma de drenaje',
  'Pressure standard': 'Norma de presión',
  'Under every street': 'Bajo cada calle',
  'Drainage to conduit, certified.': 'Del drenaje al conducto, certificado.',
  'Four standards cover the PVC range — underground drainage, soil & waste, pressure systems, and electrical conduit.':
    'Cuatro normas cubren la gama de PVC — drenaje subterráneo, aguas fecales y residuales, sistemas de presión y conductos eléctricos.',
  'PVC pipe disappears into the ground and stays there for generations — which is exactly why specifiers ask for the paperwork first. The Elysée PVC range is certified to EN 1401 for underground drainage and sewage, EN 1329 for soil and waste discharge, and EN ISO 1452 for pressure water supply.':
    'La tubería de PVC desaparece bajo tierra y permanece allí durante generaciones — que es precisamente el motivo por el que los prescriptores piden primero la documentación. La gama de PVC de Elysée está certificada conforme a EN 1401 para drenaje subterráneo y alcantarillado, EN 1329 para evacuación de aguas fecales y residuales, y EN ISO 1452 para abastecimiento de agua a presión.',
  'A fourth standard, EN 61386, covers conduit systems for electrical infrastructure. Each certificate is audited annually by an independent body and downloadable below — ready for tenders, specifications, and regulatory submissions.':
    'Una cuarta norma, EN 61386, cubre los sistemas de conductos para infraestructura eléctrica. Cada certificado se audita anualmente por un organismo independiente y puede descargarse a continuación — listo para licitaciones, especificaciones y presentaciones reglamentarias.',
  'Built to disappear': 'Concebidas para desaparecer',
  'Buried for decades. Certified for all of them.':
    'Enterradas durante décadas. Certificadas durante todas ellas.',
  'Our PVC Pipes Certifications': 'Nuestras Certificaciones de Tuberías de PVC',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific application class? Our team can prepare it on request.':
    '¿Necesita un certificado más antiguo, un paquete listo para licitación o la constancia de una clase de aplicación específica? Nuestro equipo puede prepararlo previa solicitud.',
  // QUALITY_CATEGORIES blurbs (rendered as {meta.blurb} on detail hero/intro)
  'Quality, environmental, energy, and health & safety management system certificates.':
    'Certificados de sistema de gestión de calidad, medioambiente, energía y salud y seguridad.',
  'Miscellaneous certificates and recognitions held by Elysée.':
    'Certificados y reconocimientos diversos que posee Elysée.',
  'Product certificates covering the full Elysée compression-fitting range.':
    'Certificados de producto que cubren toda la gama de accesorios de compresión de Elysée.',
  'Polyethylene pipe certificates across the manufactured diameter range.':
    'Certificados de tubería de polietileno en toda la gama de diámetros fabricados.',
  'PVC pipe certificates for water-supply, drainage and infrastructure applications.':
    'Certificados de tubería de PVC para aplicaciones de abastecimiento de agua, drenaje e infraestructura.',
};
