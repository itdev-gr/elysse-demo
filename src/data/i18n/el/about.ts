// English UI string → Greek for the ABOUT-US section: the Corporate Profile,
// History, Company Structure, Vision/Mission/Values and Quality & Certifications
// pages (plus the about-only AboutSubNav). Keyed by the English source text so
// it doubles as the fallback. Strings already in shared.ts (e.g. nav labels,
// "Read more") are NOT repeated. Brand/proper names (Elysée, Green Elysée),
// certification body names/acronyms (DVGW, KIWA, ISO …), emails, URLs, dates
// and numeric stats are intentionally left untranslated.
export const about: Record<string, string> = {
  // ───────────────────────── AboutSubNav (about-only) ─────────────────────────
  'In this section': 'Σε αυτή την ενότητα',
  'About Us section': 'Ενότητα Σχετικά με εμάς',

  // ============================================================================
  // Corporate Profile — /about-us/
  // ============================================================================
  // Hero
  'A family business, since 1979.': 'Μια οικογενειακή επιχείρηση, από το 1979.',
  'Manufacturing piping and irrigation systems for water supply, irrigation, sewerage and energy — shipped from Cyprus to more than 65 destinations across four continents.':
    'Κατασκευή συστημάτων σωληνώσεων και άρδευσης για ύδρευση, άρδευση, αποχέτευση και ενέργεια — με αποστολή από την Κύπρο σε περισσότερους από 65 προορισμούς σε τέσσερις ηπείρους.',
  // Stat band
  'By the numbers': 'Με αριθμούς',
  'Founded in': 'Έτος ίδρυσης',
  'Employees': 'Εργαζόμενοι',
  'Product Codes': 'Κωδικοί Προϊόντων',
  'Countries Worldwide': 'Χώρες Παγκοσμίως',
  // Manifesto opening
  'Our purpose': 'Ο σκοπός μας',
  'Base': 'Έδρα',
  'Continents': 'Ήπειροι',
  'Sectors': 'Τομείς',
  'Ergates · Cyprus': 'Εργάτες · Κύπρος',
  'Manufacturing since 1989': 'Κατασκευή από το 1989',
  // Editorial body
  'A note from the family': 'Ένα μήνυμα από την οικογένεια',
  'Founder · Cyprus · 1979': 'Ιδρυτής · Κύπρος · 1979',
  'Est. 1979': 'Ιδρ. 1979',
  'Three generations of Protopapas — same workshop in Ergates, same conviction that water deserves better pipes.':
    'Τρεις γενιές Πρωτοπαπά — το ίδιο εργαστήριο στους Εργάτες, η ίδια πεποίθηση ότι το νερό αξίζει καλύτερους σωλήνες.',
  'Read the full history': 'Διαβάστε την πλήρη ιστορία',
  'Who we are': 'Ποιοι είμαστε',
  'Save you time, save you money, and save the planet.':
    'Να σας εξοικονομούμε χρόνο, να σας εξοικονομούμε χρήματα και να σώζουμε τον πλανήτη.',
  'Years of experience': 'Χρόνια εμπειρίας',
  // Stand-out manifesto
  'What sets us apart': 'Τι μας ξεχωρίζει',
  'Forty years, one workshop, zero shortcuts.':
    'Σαράντα χρόνια, ένα εργαστήριο, μηδέν συμβιβασμοί.',
  // Streaming Water cinematic
  'Our founding conviction': 'Η ιδρυτική μας πεποίθηση',
  // Closing CTA
  'From the team to the technology, every part of Elysée is built to back the products we ship. Talk to us about a project, a custom run, or a long-term partnership.':
    'Από την ομάδα έως την τεχνολογία, κάθε κομμάτι της Elysée είναι φτιαγμένο για να στηρίζει τα προϊόντα που αποστέλλουμε. Μιλήστε μας για ένα έργο, μια κατά παραγγελία παραγωγή ή μια μακροχρόνια συνεργασία.',
  'Contact our network': 'Επικοινωνήστε με το δίκτυό μας',

  // Corporate Profile — dynamic content (from site-content.ts blocks).
  // whoP1.text is split at the first sentence boundary in the page, so the
  // two halves are keyed separately here as well as the full paragraph.
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy.':
    'Η Elysée κατασκευάζει και προμηθεύει συστήματα σωληνώσεων και άρδευσης για ύδρευση, άρδευση, αποχέτευση και ενέργεια.',
  'Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Με έδρα την Κύπρο, καίριο σημείο στο σταυροδρόμι τριών ηπείρων, η Elysée εξυπηρετεί περισσότερους από 65 προορισμούς στην Ευρώπη, τη Μέση Ανατολή, τη Νότια Αφρική, την Ιαπωνία, την Αυστραλία και τη Νέα Ζηλανδία.',
  'Elysée manufactures and supplies piping and irrigation systems for water supply, irrigation, sewerage and energy. Based in Cyprus, a key location at crossroads of three continents, Elysée serves more than 65 destinations in Europe, the Middle East, South Africa, Japan, Australia and New Zealand.':
    'Η Elysée κατασκευάζει και προμηθεύει συστήματα σωληνώσεων και άρδευσης για ύδρευση, άρδευση, αποχέτευση και ενέργεια. Με έδρα την Κύπρο, καίριο σημείο στο σταυροδρόμι τριών ηπείρων, η Elysée εξυπηρετεί περισσότερους από 65 προορισμούς στην Ευρώπη, τη Μέση Ανατολή, τη Νότια Αφρική, την Ιαπωνία, την Αυστραλία και τη Νέα Ζηλανδία.',
  'It is in our nature as a company but also as people, to be ambitious and set high targets. We are inspired by our 40-year history and experience and we look forward to our fifth decade with optimism and confidence. From our expert engineers to our highly knowledgeable customer services staff, teamwork plays a huge part in the success of Elysée. Collaboration across all departments, attention to detail and a lot of hard work result in amazing products, to create brilliant solutions that can be tailored perfectly to every customer.':
    'Είναι στη φύση μας ως εταιρεία αλλά και ως άνθρωποι να είμαστε φιλόδοξοι και να θέτουμε υψηλούς στόχους. Εμπνεόμαστε από την 40χρονη ιστορία και εμπειρία μας και προσβλέπουμε στην πέμπτη δεκαετία μας με αισιοδοξία και αυτοπεποίθηση. Από τους έμπειρους μηχανικούς μας έως το άρτια καταρτισμένο προσωπικό εξυπηρέτησης πελατών, η ομαδική εργασία παίζει τεράστιο ρόλο στην επιτυχία της Elysée. Η συνεργασία σε όλα τα τμήματα, η προσοχή στη λεπτομέρεια και πολλή σκληρή δουλειά οδηγούν σε εκπληκτικά προϊόντα, για τη δημιουργία εξαιρετικών λύσεων που μπορούν να προσαρμοστούν τέλεια σε κάθε πελάτη.',
  'We strive to innovate and improve, and because we have our own in-house R&D department, we can be ahead of the crowd when it comes to developing and creating new and exciting products. With each new product we look to maximise not just the efficiency of the product, but also the durability and ease of use. Always with a thought to minimising environmental impact, and keeping prices competitive for you and your business, we want to save you time, save you money, and save the planet.':
    'Προσπαθούμε να καινοτομούμε και να βελτιωνόμαστε, και επειδή διαθέτουμε δικό μας τμήμα Έρευνας & Ανάπτυξης, μπορούμε να προηγούμαστε όταν πρόκειται για την ανάπτυξη και δημιουργία νέων και συναρπαστικών προϊόντων. Με κάθε νέο προϊόν επιδιώκουμε να μεγιστοποιήσουμε όχι μόνο την αποδοτικότητα, αλλά και την ανθεκτικότητα και την ευκολία χρήσης. Πάντα με γνώμονα την ελαχιστοποίηση των περιβαλλοντικών επιπτώσεων και τη διατήρηση ανταγωνιστικών τιμών για εσάς και την επιχείρησή σας, θέλουμε να σας εξοικονομούμε χρόνο, να σας εξοικονομούμε χρήματα και να σώζουμε τον πλανήτη.',
  'With a flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and are added to upgrade existing products to create a consistently growing range.':
    'Με ευέλικτη οργανωτική δομή, η Elysée εξασφαλίζει γρήγορη ανταπόκριση σε ερωτήματα, παραγγελίες και ευκαιρίες συνεργασίας πελατών. Νέα προϊόντα αναπτύσσονται κάθε χρόνο και προστίθενται για την αναβάθμιση των υφιστάμενων προϊόντων, δημιουργώντας μια συνεχώς αναπτυσσόμενη γκάμα.',
  'Many years of experience in fittings design, manufacture and supply are reflected in new products which respond to customer needs, and in our ability to produce and deliver every order to its destination on schedule.':
    'Τα πολλά χρόνια εμπειρίας στον σχεδιασμό, την κατασκευή και την προμήθεια εξαρτημάτων αντικατοπτρίζονται σε νέα προϊόντα που ανταποκρίνονται στις ανάγκες των πελατών, καθώς και στην ικανότητά μας να παράγουμε και να παραδίδουμε κάθε παραγγελία στον προορισμό της εγκαίρως.',
  'Our products are certified by the most reputable international standards organizations such as DVGW, WRAS and KIWA, demonstrating the steady and continuous effort of the company in producing high quality products.':
    'Τα προϊόντα μας είναι πιστοποιημένα από τους πλέον αναγνωρισμένους διεθνείς οργανισμούς προτύπων, όπως οι DVGW, WRAS και KIWA, αποδεικνύοντας τη σταθερή και συνεχή προσπάθεια της εταιρείας στην παραγωγή προϊόντων υψηλής ποιότητας.',
  'This product range has been proven in the field for forty years.':
    'Αυτή η γκάμα προϊόντων έχει δοκιμαστεί στο πεδίο επί σαράντα χρόνια.',
  'These 40 years of experience have matured the processes and technology of the company, today comprising the latest in production and assembly equipment. Capacity is continuously upgraded to satisfy demand in both quantity and technology.':
    'Αυτά τα 40 χρόνια εμπειρίας έχουν ωριμάσει τις διαδικασίες και την τεχνολογία της εταιρείας, που σήμερα περιλαμβάνει τον πλέον σύγχρονο εξοπλισμό παραγωγής και συναρμολόγησης. Η παραγωγική ικανότητα αναβαθμίζεται συνεχώς για να ικανοποιεί τη ζήτηση τόσο σε ποσότητα όσο και σε τεχνολογία.',
  'We are a family business and take pride in what we do. Accountability, honesty and close collaboration are present in all operations.':
    'Είμαστε μια οικογενειακή επιχείρηση και είμαστε υπερήφανοι για ό,τι κάνουμε. Η υπευθυνότητα, η εντιμότητα και η στενή συνεργασία είναι παρούσες σε όλες τις λειτουργίες.',
  'As humans, we want the same for our Lives. We care to drive them at a safe destination. As a company, we produce reliable systems to flow water — and fluids generally — safely to their destination. Ultimately, we aim to guide Life on a green path.':
    'Ως άνθρωποι, θέλουμε το ίδιο για τις ζωές μας. Φροντίζουμε να τις οδηγούμε σε έναν ασφαλή προορισμό. Ως εταιρεία, παράγουμε αξιόπιστα συστήματα για να ρέει το νερό — και τα ρευστά γενικότερα — με ασφάλεια στον προορισμό τους. Τελικά, στόχος μας είναι να καθοδηγούμε τη Ζωή σε μια πράσινη πορεία.',

  // ============================================================================
  // History — /about-us/history/
  // ============================================================================
  // Hero
  'Built one decade at a time.': 'Χτισμένη μία δεκαετία τη φορά.',
  'From a Cypriot greenhouse in the 1970s to a piping and irrigation manufacturer shipping to 65 destinations — the story of Elysée Irrigation, founded 16 April 1979.':
    'Από ένα κυπριακό θερμοκήπιο τη δεκαετία του 1970 σε έναν κατασκευαστή σωληνώσεων και άρδευσης που αποστέλλει σε 65 προορισμούς — η ιστορία της Elysée Irrigation, που ιδρύθηκε στις 16 Απριλίου 1979.',
  // Stat band
  'Markets served': 'Αγορές που εξυπηρετούνται',
  'Export awards': 'Βραβεία εξαγωγών',
  'ISO 9001 since': 'ISO 9001 από',
  // Origins
  'Origins · 1979': 'Καταγωγή · 1979',
  'From the workshop': 'Από το εργαστήριο',
  'Drippers, sprinklers, fittings': 'Σταλάκτες, εκτοξευτήρες, εξαρτήματα',
  'Founded': 'Ιδρύθηκε',
  'Nicosia, Cyprus': 'Λευκωσία, Κύπρος',
  'Founder': 'Ιδρυτής',
  'Agriculture & physics': 'Γεωργία & φυσική',
  'Original venture': 'Αρχικό εγχείρημα',
  'Flowers': 'Λουλούδια',
  'for the Middle East': 'για τη Μέση Ανατολή',
  // Milestones
  'A timeline of forty-seven years': 'Ένα χρονολόγιο σαράντα επτά ετών',
  'Milestones, by the decade.': 'Ορόσημα, ανά δεκαετία.',
  'Today': 'Σήμερα',
  // Today
  '65 markets. Four sectors. Three distribution hubs.':
    '65 αγορές. Τέσσερις τομείς. Τρεις κόμβοι διανομής.',
  'Sectors served': 'Τομείς που εξυπηρετούνται',
  'Distribution centres': 'Κέντρα διανομής',
  'Plus a network of local agents and sales representatives across all 65 markets.':
    'Συν ένα δίκτυο τοπικών αντιπροσώπων και εκπροσώπων πωλήσεων σε όλες τις 65 αγορές.',
  'Water Supply': 'Ύδρευση',
  'Irrigation': 'Άρδευση',
  'Infrastructure': 'Υποδομές',
  'Energy': 'Ενέργεια',
  'Austria': 'Αυστρία',
  'Russia': 'Ρωσία',
  'Lebanon': 'Λίβανος',
  // Where it started
  'Where it started': 'Από πού ξεκίνησε',
  'The original line.': 'Η αρχική σειρά.',
  'Drippers': 'Σταλάκτες',
  'Sprinklers': 'Εκτοξευτήρες',
  'Compression fittings': 'Εξαρτήματα μηχανικής σύσφιξης',
  'Saddles': 'Σέλες παροχής',
  'Threaded fittings': 'Σπειρωτά εξαρτήματα',
  // History — dynamic content. intro1.text is split into three sentences in
  // the page (originsHeadline / originsBody / originsTail), so each is keyed.
  'It was a love of nature that led to the birth of our company, Elysée.':
    'Ήταν η αγάπη για τη φύση που οδήγησε στη γέννηση της εταιρείας μας, της Elysée.',
  'With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East.':
    'Με καταγωγή από τη γεωργία και πτυχίο φυσικής, ο ιδρυτής, Αντώνης Πρωτοπαπάς, είχε την ιδέα να δημιουργήσει μια επιχείρηση επικεντρωμένη στην καλλιέργεια των καλύτερων λουλουδιών στη Μέση Ανατολή.',
  'And so, that was the start of this beautiful journey…':
    'Κι έτσι ξεκίνησε αυτό το όμορφο ταξίδι…',
  "It was a love of nature that led to the birth of our company, Elysée. With origins in agriculture and a degree in physics, the founder, Antonis Protopapas, had the idea to make a business focused on growing the best flowers in the Middle East. And so, that was the start of this beautiful journey…":
    'Ήταν η αγάπη για τη φύση που οδήγησε στη γέννηση της εταιρείας μας, της Elysée. Με καταγωγή από τη γεωργία και πτυχίο φυσικής, ο ιδρυτής, Αντώνης Πρωτοπαπάς, είχε την ιδέα να δημιουργήσει μια επιχείρηση επικεντρωμένη στην καλλιέργεια των καλύτερων λουλουδιών στη Μέση Ανατολή. Κι έτσι ξεκίνησε αυτό το όμορφο ταξίδι…',
  'Through this venture, the need to know more about irrigation became a priority. Back in the 1970s the new art of irrigation was on the rise, and the know-how was brought in to help Elysée grow world-class flowers.':
    'Μέσα από αυτό το εγχείρημα, η ανάγκη για περισσότερη γνώση γύρω από την άρδευση έγινε προτεραιότητα. Τη δεκαετία του 1970 η νέα τέχνη της άρδευσης βρισκόταν σε άνοδο, και η τεχνογνωσία αποκτήθηκε για να βοηθήσει την Elysée να καλλιεργήσει λουλούδια παγκόσμιας κλάσης.',
  'With our newly acquired knowledge of irrigation and irrigation needs, the next step was to move into irrigation trading, trading pipe fittings and then… into manufacturing them. So, in 1979, on 16 April, Elysée Irrigation was founded.':
    'Με τη νεοαποκτηθείσα γνώση μας γύρω από την άρδευση και τις ανάγκες της, το επόμενο βήμα ήταν η είσοδος στο εμπόριο άρδευσης, στο εμπόριο εξαρτημάτων σωληνώσεων και έπειτα… στην κατασκευή τους. Έτσι, το 1979, στις 16 Απριλίου, ιδρύθηκε η Elysée Irrigation.',
  'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.':
    'Η ίδια πεποίθηση που ξεκίνησε την εταιρεία την οδηγεί ακόμη και σήμερα: να κατασκευάζει αξιόπιστα συστήματα που μεταφέρουν το νερό — και τη Ζωή — με ασφάλεια εκεί που χρειάζεται.',
  'Elysée Irrigation founded': 'Ίδρυση της Elysée Irrigation',
  'Founded on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas. The first production facility was co-located with farming and flower preparation for the international markets — exciting times where the exploration of the unknown field of plastic manufacturing was hard but rewarding for a young company.':
    'Ιδρύθηκε στις 16 Απριλίου 1979 στη Λευκωσία της Κύπρου από τον Αντώνη Πρωτοπαπά. Η πρώτη μονάδα παραγωγής συστεγαζόταν με τη γεωργία και την προετοιμασία λουλουδιών για τις διεθνείς αγορές — συναρπαστικές εποχές, όπου η εξερεύνηση του άγνωστου πεδίου της παραγωγής πλαστικών ήταν δύσκολη αλλά ανταποδοτική για μια νεαρή εταιρεία.',
  'As early as 1980, the first export activities began, in the nearby markets of the Middle East — an area which at the time was only starting to utilize irrigation techniques.':
    'Ήδη από το 1980 ξεκίνησαν οι πρώτες εξαγωγικές δραστηριότητες, στις γειτονικές αγορές της Μέσης Ανατολής — μια περιοχή που εκείνη την εποχή μόλις άρχιζε να αξιοποιεί τεχνικές άρδευσης.',
  'Early success led to fast growth which demanded a dedicated industrial space. The current site in the Ergates Industrial Area was established. The product range at the time comprised a substantial series of drippers and sprinklers as well as an extensive range of compression fittings, saddles, and threaded fittings.':
    'Η πρώιμη επιτυχία οδήγησε σε ταχεία ανάπτυξη που απαιτούσε αποκλειστικό βιομηχανικό χώρο. Δημιουργήθηκε η σημερινή εγκατάσταση στη Βιομηχανική Περιοχή Εργατών. Η γκάμα προϊόντων εκείνη την εποχή περιλάμβανε μια σημαντική σειρά σταλακτών και εκτοξευτήρων, καθώς και μια εκτεταμένη γκάμα εξαρτημάτων μηχανικής σύσφιξης, σελών παροχής και σπειρωτών εξαρτημάτων.',
  'A piping system is never complete without a pipe, hence in 1991 a polyethylene pipe manufacturing unit was established at the Ergates site — Elysée could now offer a full water-supply solution. Its early success led to the extension of the range with PVC pipe manufacturing, entering the construction and infrastructure world.':
    'Ένα σύστημα σωληνώσεων δεν είναι ποτέ πλήρες χωρίς σωλήνα, γι’ αυτό το 1991 δημιουργήθηκε μονάδα κατασκευής σωλήνων πολυαιθυλενίου στην εγκατάσταση των Εργατών — η Elysée μπορούσε πλέον να προσφέρει ολοκληρωμένη λύση ύδρευσης. Η πρώιμη επιτυχία της οδήγησε στην επέκταση της γκάμας με την κατασκευή σωλήνων PVC, εισερχόμενη στον κόσμο των κατασκευών και των υποδομών.',
  'An extensive range of products meant the quality-control division had to be formally established, leading to the certification of the company with ISO 9001 as early as 1998.':
    'Η εκτεταμένη γκάμα προϊόντων σήμαινε ότι το τμήμα ελέγχου ποιότητας έπρεπε να συσταθεί επίσημα, οδηγώντας στην πιστοποίηση της εταιρείας με ISO 9001 ήδη από το 1998.',
  'A new office building was erected to host the main offices of the company — until then located in central Nicosia — optimizing operations and preparing for the next step in expansion.':
    'Ανεγέρθηκε νέο κτίριο γραφείων για να φιλοξενήσει τα κεντρικά γραφεία της εταιρείας — που μέχρι τότε βρίσκονταν στο κέντρο της Λευκωσίας — βελτιστοποιώντας τις λειτουργίες και προετοιμάζοντας το επόμενο βήμα της επέκτασης.',
  'The first recognition of international activity for Elysée came with the Special Export Award. That same year, a new function was born within the company: the Research and Development department, leading the advancement of technology and improvement of the product range. Elysée was now a complete and modern company, investing significantly in the international market.':
    'Η πρώτη αναγνώριση της διεθνούς δραστηριότητας της Elysée ήρθε με το Ειδικό Βραβείο Εξαγωγών. Την ίδια χρονιά γεννήθηκε μια νέα λειτουργία εντός της εταιρείας: το τμήμα Έρευνας και Ανάπτυξης, που ηγείται της προόδου της τεχνολογίας και της βελτίωσης της γκάμας προϊόντων. Η Elysée ήταν πλέον μια ολοκληρωμένη και σύγχρονη εταιρεία, που επένδυε σημαντικά στη διεθνή αγορά.',
  'The years that followed saw a major expansion in global reach and market coverage. Elysée products could be found on all 5 continents and in a steadily growing number of countries. A series of 4 further Export Awards (2003, 2008, 2012 and 2016) is a testimony to just that.':
    'Τα χρόνια που ακολούθησαν είδαν μια σημαντική επέκταση στην παγκόσμια εμβέλεια και την κάλυψη αγορών. Τα προϊόντα της Elysée μπορούσαν να βρεθούν και στις 5 ηπείρους και σε έναν σταθερά αυξανόμενο αριθμό χωρών. Μια σειρά 4 επιπλέον Βραβείων Εξαγωγών (2003, 2008, 2012 και 2016) αποτελεί απόδειξη ακριβώς αυτού.',
  'Our international network of selected partners currently spans 65 markets, where Elysée is active in 4 sectors — Water Supply, Irrigation, Infrastructure and Energy. To respond directly to the changing needs of the global market, Elysée has expanded its operations by establishing 3 distribution centres in Austria, Russia, and Lebanon.':
    'Το διεθνές μας δίκτυο επιλεγμένων συνεργατών εκτείνεται σήμερα σε 65 αγορές, όπου η Elysée δραστηριοποιείται σε 4 τομείς — Ύδρευση, Άρδευση, Υποδομές και Ενέργεια. Για να ανταποκριθεί άμεσα στις μεταβαλλόμενες ανάγκες της παγκόσμιας αγοράς, η Elysée επέκτεινε τις δραστηριότητές της δημιουργώντας 3 κέντρα διανομής στην Αυστρία, τη Ρωσία και τον Λίβανο.',
  'Our international network of selected partners spans 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by 3 distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.':
    'Το διεθνές μας δίκτυο επιλεγμένων συνεργατών εκτείνεται σε 65 αγορές σε τέσσερις τομείς — Ύδρευση, Άρδευση, Υποδομές και Ενέργεια — υποστηριζόμενο από 3 κέντρα διανομής στην Αυστρία, τη Ρωσία και τον Λίβανο, καθώς και από ένα δίκτυο τοπικών αντιπροσώπων και εκπροσώπων πωλήσεων.',
  'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:':
    'Η γκάμα προϊόντων που έβαλε την Elysée στον χάρτη τη δεκαετία του 1980 παραμένει η βάση του καταλόγου ακόμη και σήμερα:',
  'Enquiries and orders reach us through our wide network of local agents and sales representatives.':
    'Τα ερωτήματα και οι παραγγελίες φτάνουν σε εμάς μέσω του ευρέος δικτύου τοπικών αντιπροσώπων και εκπροσώπων πωλήσεων.',

  // ============================================================================
  // Company Structure — /about-us/company-structure/
  // ============================================================================
  // Hero
  'An efficient team.': 'Μια αποδοτική ομάδα.',
  'A clear structure.': 'Μια σαφής δομή.',
  'Three divisions, one workshop in Cyprus — engineered around quick response, certified quality, and a growing product range.':
    'Τρία τμήματα, ένα εργαστήριο στην Κύπρο — σχεδιασμένα γύρω από τη γρήγορη ανταπόκριση, την πιστοποιημένη ποιότητα και μια αναπτυσσόμενη γκάμα προϊόντων.',
  // Stat band
  'Production divisions': 'Τμήματα παραγωγής',
  'Fittings catalogued': 'Καταλογογραφημένα εξαρτήματα',
  'Pipe diameter range (mm)': 'Εύρος διαμέτρου σωλήνων (mm)',
  // Efficient team
  'An efficient team': 'Μια αποδοτική ομάδα',
  "Built for the customer's call.": 'Φτιαγμένη για το κάλεσμα του πελάτη.',
  'Three operating principles that keep our workshop in step with the people we ship to — from a first phone call through a custom order to a long-term partnership.':
    'Τρεις αρχές λειτουργίας που κρατούν το εργαστήριό μας σε αρμονία με τους ανθρώπους στους οποίους αποστέλλουμε — από το πρώτο τηλεφώνημα, μέσα από μια παραγγελία κατά παραγγελία, έως μια μακροχρόνια συνεργασία.',
  'From the floor': 'Από το πάτωμα παραγωγής',
  'Engineers, consultants, makers': 'Μηχανικοί, σύμβουλοι, κατασκευαστές',
  'Three principles. One workshop in Ergates.': 'Τρεις αρχές. Ένα εργαστήριο στους Εργάτες.',
  'Flexible by design': 'Ευέλικτη εκ σχεδιασμού',
  'Engineering at the front desk': 'Μηχανική στην πρώτη γραμμή',
  'Quality covers both sides': 'Η ποιότητα καλύπτει και τις δύο πλευρές',
  // Divisions
  'Our divisions': 'Τα τμήματά μας',
  'Three teams, one workshop.': 'Τρεις ομάδες, ένα εργαστήριο.',
  'Fittings Division': 'Τμήμα Εξαρτημάτων',
  'Pipes Division': 'Τμήμα Σωλήνων',
  'Quality Assurance Division': 'Τμήμα Διασφάλισης Ποιότητας',
  'Explore Fittings': 'Εξερευνήστε τα Εξαρτήματα',
  'Explore Pipes': 'Εξερευνήστε τους Σωλήνες',
  'See certifications': 'Δείτε τις πιστοποιήσεις',
  // Closing CTA
  'Want to discuss a specific application, a custom OEM run, or a project specification? Our engineers and technical consultants are available to advise.':
    'Θέλετε να συζητήσετε μια συγκεκριμένη εφαρμογή, μια κατά παραγγελία παραγωγή OEM ή μια προδιαγραφή έργου; Οι μηχανικοί και οι τεχνικοί μας σύμβουλοι είναι διαθέσιμοι για συμβουλές.',
  // Company Structure — dynamic content
  'With flexible organizational structure, Elysée ensures a quick response to customer enquiries, orders and opportunities for collaboration. New products are developed every year and we regularly upgrade existing products to create a constantly growing range.':
    'Με ευέλικτη οργανωτική δομή, η Elysée εξασφαλίζει γρήγορη ανταπόκριση σε ερωτήματα, παραγγελίες και ευκαιρίες συνεργασίας πελατών. Νέα προϊόντα αναπτύσσονται κάθε χρόνο και αναβαθμίζουμε τακτικά τα υφιστάμενα προϊόντα, δημιουργώντας μια συνεχώς αναπτυσσόμενη γκάμα.',
  "Our team of expert engineers and technical consultants is constantly available to offer technical advice to our clients on the use of Elysée's fittings and piping systems.":
    'Η ομάδα μας από έμπειρους μηχανικούς και τεχνικούς συμβούλους είναι διαρκώς διαθέσιμη για να προσφέρει τεχνικές συμβουλές στους πελάτες μας σχετικά με τη χρήση των εξαρτημάτων και των συστημάτων σωληνώσεων της Elysée.',
  'We at Elysée realize that from a customer\'s perspective, the term "quality" covers both the product and the service. Our ever growing customer list reflects our determination to settle for nothing less.':
    'Στην Elysée αντιλαμβανόμαστε ότι, από την οπτική του πελάτη, ο όρος «ποιότητα» καλύπτει τόσο το προϊόν όσο και την υπηρεσία. Η διαρκώς αυξανόμενη πελατειακή μας βάση αντικατοπτρίζει την αποφασιστικότητά μας να μην συμβιβαζόμαστε με τίποτα λιγότερο.',
  'As a business, our green credentials are very important to us, and so our desire to innovate extends from our product development to our business processes. Implementing Lean Kaizen techniques has brought with it an increase in efficiency and a decrease in waste. We\'ve reduced our environmental impact by reducing our energy consumption and keeping the waste we send to landfill to a minimum. By increasing our efficiency, we\'re boosting our productivity and protecting our planet too.':
    'Ως επιχείρηση, οι πράσινες αξίες μας είναι πολύ σημαντικές για εμάς, και έτσι η επιθυμία μας για καινοτομία εκτείνεται από την ανάπτυξη προϊόντων έως τις επιχειρηματικές μας διαδικασίες. Η εφαρμογή τεχνικών Lean Kaizen έχει φέρει αύξηση της αποδοτικότητας και μείωση των αποβλήτων. Έχουμε μειώσει το περιβαλλοντικό μας αποτύπωμα μειώνοντας την κατανάλωση ενέργειας και διατηρώντας στο ελάχιστο τα απόβλητα που οδηγούνται σε χώρους υγειονομικής ταφής. Αυξάνοντας την αποδοτικότητά μας, ενισχύουμε την παραγωγικότητά μας και προστατεύουμε και τον πλανήτη μας.',
  'Elysée operates through three core production divisions, each focused on a specific area of manufacturing and quality assurance.':
    'Η Elysée λειτουργεί μέσω τριών βασικών τμημάτων παραγωγής, καθένα από τα οποία επικεντρώνεται σε έναν συγκεκριμένο τομέα κατασκευής και διασφάλισης ποιότητας.',
  'Focusing on the production of pipe fittings and irrigation accessories, the Fittings Division manufactures over 1000 items in different sizes and for diverse applications, made of the most suitable raw materials in each case, from polypropylene to polyacetal and nylon.':
    'Εστιάζοντας στην παραγωγή εξαρτημάτων σωληνώσεων και αξεσουάρ άρδευσης, το Τμήμα Εξαρτημάτων κατασκευάζει πάνω από 1000 είδη σε διαφορετικά μεγέθη και για ποικίλες εφαρμογές, από τις πλέον κατάλληλες πρώτες ύλες σε κάθε περίπτωση, από πολυπροπυλένιο έως πολυακετάλη και νάιλον.',
  'The division manufactures PVC and PE pipes with a diameter range of 5–315 mm, suitable for a wide range of practical applications.':
    'Το τμήμα κατασκευάζει σωλήνες PVC και PE με εύρος διαμέτρου 5–315 mm, κατάλληλους για ένα ευρύ φάσμα πρακτικών εφαρμογών.',
  'The Quality Assurance Division is dedicated to implementing, sustaining and improving the quality at every level of production, from the raw material through to the finished product. With the aid of sophisticated equipment and apparatus, we can verify that the final products do in fact conform to national and international standards.':
    'Το Τμήμα Διασφάλισης Ποιότητας είναι αφοσιωμένο στην εφαρμογή, διατήρηση και βελτίωση της ποιότητας σε κάθε επίπεδο της παραγωγής, από την πρώτη ύλη έως το τελικό προϊόν. Με τη βοήθεια εξελιγμένου εξοπλισμού και οργάνων, μπορούμε να επαληθεύσουμε ότι τα τελικά προϊόντα όντως συμμορφώνονται με τα εθνικά και διεθνή πρότυπα.',
  'Green Operations': 'Πράσινες Λειτουργίες',
  'Our operating principle': 'Η αρχή λειτουργίας μας',

  // ============================================================================
  // Vision, Mission & Values — /about-us/vision-mission-values/
  // ============================================================================
  // Hero (h1 is split across a <br/> into two fragments)
  'Vision, Mission': 'Όραμα, Αποστολή',
  '& Values.': '& Αξίες.',
  'What drives us, every day, in every market.': 'Τι μας κινητοποιεί, κάθε μέρα, σε κάθε αγορά.',
  // Framework
  'By the framework': 'Με το πλαίσιο',
  'One vision. Five pillars. Six values.': 'Ένα όραμα. Πέντε πυλώνες. Έξι αξίες.',
  'Vision sets the destination. Mission sets the pace. Values set the tone. The W·I·S·E framework is the test we hold every product, every process and every partnership to.':
    'Το όραμα ορίζει τον προορισμό. Η αποστολή ορίζει τον ρυθμό. Οι αξίες ορίζουν το ύφος. Το πλαίσιο W·I·S·E είναι το κριτήριο με το οποίο αξιολογούμε κάθε προϊόν, κάθε διαδικασία και κάθε συνεργασία.',
  'Reads': 'Διαβάζεται',
  'Top → bottom': 'Από πάνω → κάτω',
  'Anchor': 'Άγκυρα',
  'Updated': 'Ενημερώθηκε',
  'Chapter One · Destination': 'Κεφάλαιο Πρώτο · Προορισμός',
  'Chapter Two · Pace': 'Κεφάλαιο Δεύτερο · Ρυθμός',
  'Chapter Three · Tone': 'Κεφάλαιο Τρίτο · Ύφος',
  'Anchor · The test': 'Άγκυρα · Το κριτήριο',
  'Vision': 'Όραμα',
  'Mission pillars': 'Πυλώνες αποστολής',
  'Core values': 'Βασικές αξίες',
  'Framework': 'Πλαίσιο',
  'A single statement of where Elysée is heading — green leadership worldwide through W·I·S·E piping systems.':
    'Μια ενιαία δήλωση για το πού κατευθύνεται η Elysée — πράσινη ηγεσία παγκοσμίως μέσα από συστήματα σωληνώσεων W·I·S·E.',
  'Five commitments that translate the Vision into day-to-day priorities — for customers, people, growth and the planet.':
    'Πέντε δεσμεύσεις που μεταφράζουν το Όραμα σε καθημερινές προτεραιότητες — για τους πελάτες, τους ανθρώπους, την ανάπτυξη και τον πλανήτη.',
  'Six principles that guide how we work with each other, with our customers and with the environment we operate in.':
    'Έξι αρχές που καθοδηγούν τον τρόπο που συνεργαζόμαστε μεταξύ μας, με τους πελάτες μας και με το περιβάλλον στο οποίο δραστηριοποιούμαστε.',
  'Worldwide. Innovative. Smart. Easy-to-Use. The four words we test every product, process and partnership against.':
    'Παγκόσμια. Καινοτόμα. Έξυπνα. Εύχρηστα. Οι τέσσερις λέξεις με τις οποίες αξιολογούμε κάθε προϊόν, διαδικασία και συνεργασία.',
  // Why we exist
  'Why we exist': 'Γιατί υπάρχουμε',
  'Customer-first, by design.': 'Ο πελάτης πρώτα, εκ σχεδιασμού.',
  'Three sentences that set the operating philosophy for the entire company.':
    'Τρεις προτάσεις που καθορίζουν τη φιλοσοφία λειτουργίας ολόκληρης της εταιρείας.',
  // Vision cinematic
  'Chapter One · Our Vision': 'Κεφάλαιο Πρώτο · Το Όραμά μας',
  // WISE strip
  'The W·I·S·E framework': 'Το πλαίσιο W·I·S·E',
  'Four letters, one operating philosophy.': 'Τέσσερα γράμματα, μία φιλοσοφία λειτουργίας.',
  'Every product, every process, every partnership is tested against four words. They appear together as W·I·S·E — and they precede the Vision, the Mission, and every Value below.':
    'Κάθε προϊόν, κάθε διαδικασία, κάθε συνεργασία αξιολογείται με βάση τέσσερις λέξεις. Εμφανίζονται μαζί ως W·I·S·E — και προηγούνται του Οράματος, της Αποστολής και κάθε Αξίας παρακάτω.',
  'Worldwide': 'Παγκόσμια',
  'Innovative': 'Καινοτόμα',
  'Smart': 'Έξυπνα',
  'Easy-to-Use': 'Εύχρηστα',
  'Engineered for 65 destinations across four sectors.':
    'Σχεδιασμένα για 65 προορισμούς σε τέσσερις τομείς.',
  'Forty years of R&D, six EU-funded research programmes.':
    'Σαράντα χρόνια Έρευνας & Ανάπτυξης, έξι χρηματοδοτούμενα από την ΕΕ ερευνητικά προγράμματα.',
  'Designed for easy install, low maintenance, long life.':
    'Σχεδιασμένα για εύκολη εγκατάσταση, χαμηλή συντήρηση, μεγάλη διάρκεια ζωής.',
  'Field-proven fittings, intuitive systems, technical advice on call.':
    'Εξαρτήματα δοκιμασμένα στο πεδίο, διαισθητικά συστήματα, τεχνικές συμβουλές κατ’ απαίτηση.',
  // Mission
  'Chapter Two · Our Mission': 'Κεφάλαιο Δεύτερο · Η Αποστολή μας',
  'Five commitments. One workshop.': 'Πέντε δεσμεύσεις. Ένα εργαστήριο.',
  'Five commitments translate the Vision into day-to-day priorities — for our customers, our people, our growth, and the planet.':
    'Πέντε δεσμεύσεις μεταφράζουν το Όραμα σε καθημερινές προτεραιότητες — για τους πελάτες μας, τους ανθρώπους μας, την ανάπτυξή μας και τον πλανήτη.',
  'Mission anchor': 'Άγκυρα αποστολής',
  'Streaming water, streaming life': 'Streaming water, streaming life',
  'Five pillars that turn the brand promise into practice.':
    'Πέντε πυλώνες που μετατρέπουν την υπόσχεση της μάρκας σε πράξη.',
  'Preserve water for future generations': 'Διατήρηση του νερού για τις μελλοντικές γενιές',
  'Give partners a competitive edge': 'Παροχή ανταγωνιστικού πλεονεκτήματος στους συνεργάτες',
  'Lead our people to full potential': 'Καθοδήγηση των ανθρώπων μας στο μέγιστο των δυνατοτήτων τους',
  'Sustainable, profitable growth': 'Βιώσιμη, κερδοφόρα ανάπτυξη',
  'Better Earth, better society': 'Καλύτερη Γη, καλύτερη κοινωνία',
  // Mission list (dynamic from site-content)
  'Develop W.I.S.E. Products to preserve water resources for future generations.':
    'Ανάπτυξη προϊόντων W.I.S.E. για τη διατήρηση των υδάτινων πόρων για τις μελλοντικές γενιές.',
  'Provide our Customers and Partners with a competitive edge.':
    'Παροχή ανταγωνιστικού πλεονεκτήματος στους Πελάτες και τους Συνεργάτες μας.',
  'Lead our people to meet their full potential.':
    'Καθοδήγηση των ανθρώπων μας ώστε να αξιοποιήσουν πλήρως τις δυνατότητές τους.',
  'Achieve sustainable and profitable company growth.':
    'Επίτευξη βιώσιμης και κερδοφόρας ανάπτυξης της εταιρείας.',
  'Contribute to Society and the Environment, making Earth a better place to live.':
    'Συνεισφορά στην Κοινωνία και το Περιβάλλον, κάνοντας τη Γη ένα καλύτερο μέρος για να ζούμε.',
  // Values
  'Chapter Three · Our Values': 'Κεφάλαιο Τρίτο · Οι Αξίες μας',
  'Six principles, not posters.': 'Έξι αρχές, όχι αφίσες.',
  'Six principles that guide how we work — with each other, with our customers and with the environment we operate in.':
    'Έξι αρχές που καθοδηγούν τον τρόπο που εργαζόμαστε — μεταξύ μας, με τους πελάτες μας και με το περιβάλλον στο οποίο δραστηριοποιούμαστε.',
  'Business-driven innovation': 'Καινοτομία με γνώμονα την επιχείρηση',
  'Green thinking': 'Πράσινη σκέψη',
  'Customer commitment and value creation': 'Δέσμευση στον πελάτη και δημιουργία αξίας',
  'Quality and continuous improvement': 'Ποιότητα και συνεχής βελτίωση',
  'Respect each other and win as a team': 'Σεβασμός μεταξύ μας και νίκη ως ομάδα',
  'Promote personal and professional growth': 'Προώθηση της προσωπικής και επαγγελματικής ανάπτυξης',
  'Every new product starts with a real-world problem we have heard from customers.':
    'Κάθε νέο προϊόν ξεκινά από ένα πραγματικό πρόβλημα που έχουμε ακούσει από τους πελάτες.',
  'Sustainability lives in our procurement, our process and our packaging.':
    'Η βιωσιμότητα υπάρχει στις προμήθειες, τη διαδικασία και τη συσκευασία μας.',
  'Long-term partnerships beat one-off transactions, every time.':
    'Οι μακροχρόνιες συνεργασίες υπερισχύουν των μεμονωμένων συναλλαγών, κάθε φορά.',
  'ISO 9001 since 1998. Improvement is a daily practice, not a target.':
    'ISO 9001 από το 1998. Η βελτίωση είναι καθημερινή πρακτική, όχι στόχος.',
  'Three generations of family business — built on accountability.':
    'Τρεις γενιές οικογενειακής επιχείρησης — χτισμένης πάνω στην υπευθυνότητα.',
  'We invest in the people who build, ship and back our products.':
    'Επενδύουμε στους ανθρώπους που κατασκευάζουν, αποστέλλουν και στηρίζουν τα προϊόντα μας.',
  // VMV intro/vision (dynamic from site-content)
  'Our customers are at the heart of everything we do, so that is what we focus on. We design innovative piping solutions for easy installation, durability, and minimal maintenance — and we tailor them, through our expert advisors and OEM programmes, to the specific needs of each customer.':
    'Οι πελάτες μας βρίσκονται στο επίκεντρο όλων όσων κάνουμε, και σε αυτό εστιάζουμε. Σχεδιάζουμε καινοτόμες λύσεις σωληνώσεων για εύκολη εγκατάσταση, ανθεκτικότητα και ελάχιστη συντήρηση — και τις προσαρμόζουμε, μέσω των έμπειρων συμβούλων μας και των προγραμμάτων OEM, στις συγκεκριμένες ανάγκες κάθε πελάτη.',
  'To be a green leader worldwide through Innovative, Smart, Easy-to-Use Piping Systems.':
    'Να είμαστε πράσινος ηγέτης παγκοσμίως μέσα από Καινοτόμα, Έξυπνα και Εύχρηστα Συστήματα Σωληνώσεων.',
  // VMV closing CTA
  'Our Vision, Mission and Values are not posters on a wall — they shape every decision we make, from product design to customer service. Talk to us about how we put them into practice.':
    'Το Όραμα, η Αποστολή και οι Αξίες μας δεν είναι αφίσες σε έναν τοίχο — διαμορφώνουν κάθε απόφαση που παίρνουμε, από τον σχεδιασμό του προϊόντος έως την εξυπηρέτηση πελατών. Μιλήστε μας για το πώς τις εφαρμόζουμε στην πράξη.',

  // ============================================================================
  // Quality & Certifications — /about-us/quality-certifications/
  // ============================================================================
  // Hero
  'Quality, by certificate.': 'Ποιότητα, με πιστοποιητικό.',
  // Stat band
  'Years accredited': 'Χρόνια πιστοποίησης',
  'Certificate bodies': 'Φορείς πιστοποίησης',
  'Batches certified': 'Παρτίδες πιστοποιημένες',
  // A matter of principle
  'A matter of principle': 'Ζήτημα αρχής',
  'Patented, engineered, certified.': 'Κατοχυρωμένα με δίπλωμα ευρεσιτεχνίας, σχεδιασμένα, πιστοποιημένα.',
  'Two paragraphs that anchor everything we do — from the resin we accept to the certificate we ship with every order.':
    'Δύο παράγραφοι που στηρίζουν όλα όσα κάνουμε — από τη ρητίνη που αποδεχόμαστε έως το πιστοποιητικό που αποστέλλουμε με κάθε παραγγελία.',
  // ISO callout
  'Cornerstone certification': 'Θεμελιώδης πιστοποίηση',
  // How we verify
  'How we verify': 'Πώς επαληθεύουμε',
  'Four steps. Every batch. Every time.': 'Τέσσερα βήματα. Κάθε παρτίδα. Κάθε φορά.',
  'The same four checks happen on every shipment: incoming material, in-process QC, finished batch sampling and a traceable certificate.':
    'Οι ίδιοι τέσσερις έλεγχοι γίνονται σε κάθε αποστολή: εισερχόμενο υλικό, έλεγχος ποιότητας κατά τη διεργασία, δειγματοληψία τελικής παρτίδας και ένα ιχνηλάσιμο πιστοποιητικό.',
  'Cadence': 'Συχνότητα',
  'Every batch': 'Κάθε παρτίδα',
  'Standard': 'Πρότυπο',
  'Step One · Material': 'Βήμα Πρώτο · Υλικό',
  'Step Two · Process': 'Βήμα Δεύτερο · Διεργασία',
  'Step Three · Product': 'Βήμα Τρίτο · Προϊόν',
  'Step Four · Certificate': 'Βήμα Τέταρτο · Πιστοποιητικό',
  'Material check': 'Έλεγχος υλικού',
  'In-process QC': 'Έλεγχος ποιότητας κατά τη διεργασία',
  'Batch testing': 'Δοκιμή παρτίδας',
  'Documented release': 'Τεκμηριωμένη αποδέσμευση',
  'Every incoming PE and PVC resin batch is tested against our internal spec sheet before it enters production.':
    'Κάθε εισερχόμενη παρτίδα ρητίνης PE και PVC ελέγχεται με βάση το εσωτερικό μας φύλλο προδιαγραφών πριν εισέλθει στην παραγωγή.',
  'Continuous in-line monitoring during extrusion and moulding flags drift before it ever reaches a finished part.':
    'Η συνεχής εν σειρά παρακολούθηση κατά την εξώθηση και τη χύτευση εντοπίζει αποκλίσεις πριν φτάσουν ποτέ σε ένα τελικό εξάρτημα.',
  'Finished batches are sampled against ISO and EN test methods — burst, impact, environmental and dimensional.':
    'Οι τελικές παρτίδες δειγματίζονται με βάση μεθόδους δοκιμών ISO και EN — διάρρηξης, κρούσης, περιβαλλοντικές και διαστασιολογικές.',
  'Every shipment ships with traceable documentation — request a certificate for any tender or specification.':
    'Κάθε αποστολή συνοδεύεται από ιχνηλάσιμη τεκμηρίωση — ζητήστε πιστοποιητικό για οποιονδήποτε διαγωνισμό ή προδιαγραφή.',
  // Six categories
  'Our certifications': 'Οι πιστοποιήσεις μας',
  'Six categories of certificate.': 'Έξι κατηγορίες πιστοποιητικών.',
  'View certificates': 'Δείτε τα πιστοποιητικά',
  // Closing CTA
  'Request a certificate': 'Ζητήστε ένα πιστοποιητικό',
  'Need a specific certificate for a tender, regulatory submission, or specification document? Our team can provide it on request.':
    'Χρειάζεστε ένα συγκεκριμένο πιστοποιητικό για διαγωνισμό, κανονιστική υποβολή ή έγγραφο προδιαγραφών; Η ομάδα μας μπορεί να το παρέχει κατόπιν αιτήματος.',
  'Contact our local network': 'Επικοινωνήστε με το τοπικό μας δίκτυο',
  // Q&C — dynamic content (from site-content.ts)
  'Developed to the highest of standards, Elysée products are patented and engineered in-house in our own R&D department. Offering eco-friendly, corrosion-free, and easy-to-install solutions at great value prices, resulting in the highest level of customer satisfaction.':
    'Αναπτυγμένα με βάση τα υψηλότερα πρότυπα, τα προϊόντα της Elysée είναι κατοχυρωμένα με δίπλωμα ευρεσιτεχνίας και σχεδιασμένα εσωτερικά στο δικό μας τμήμα Έρευνας & Ανάπτυξης. Προσφέρουν φιλικές προς το περιβάλλον, αντιδιαβρωτικές και εύκολες στην εγκατάσταση λύσεις σε τιμές εξαιρετικής αξίας, με αποτέλεσμα το υψηλότερο επίπεδο ικανοποίησης των πελατών.',
  'Ever since our establishment, quality has been a major principle covering Elysée operations. By introducing a quality management system, we are able to monitor our activities and efficiency, in order to elevate our overall performance. Today Elysée Irrigation LTD proudly holds internationally renowned certificates of piping systems, a testimony of commitment to quality.':
    'Από την ίδρυσή μας, η ποιότητα αποτελεί βασική αρχή που διέπει τις λειτουργίες της Elysée. Με την εισαγωγή ενός συστήματος διαχείρισης ποιότητας, είμαστε σε θέση να παρακολουθούμε τις δραστηριότητες και την αποδοτικότητά μας, ώστε να αναβαθμίζουμε τη συνολική μας απόδοση. Σήμερα η Elysée Irrigation LTD κατέχει με υπερηφάνεια διεθνώς αναγνωρισμένα πιστοποιητικά συστημάτων σωληνώσεων, απόδειξη της δέσμευσής της στην ποιότητα.',
  'Elysée products are certified by the most reputable international standards organizations. Our portfolio is organised into six categories, mirroring the way our products reach the market.':
    'Τα προϊόντα της Elysée είναι πιστοποιημένα από τους πλέον αναγνωρισμένους διεθνείς οργανισμούς προτύπων. Το χαρτοφυλάκιό μας οργανώνεται σε έξι κατηγορίες, αντικατοπτρίζοντας τον τρόπο με τον οποίο τα προϊόντα μας φτάνουν στην αγορά.',
  'Elysée achieved ISO 9001 certification in 1998 following the formal establishment of its quality-control division — a commitment to quality management that has been maintained and renewed continuously ever since.':
    'Η Elysée πέτυχε την πιστοποίηση ISO 9001 το 1998, μετά την επίσημη σύσταση του τμήματος ελέγχου ποιότητας — μια δέσμευση στη διαχείριση ποιότητας που έκτοτε διατηρείται και ανανεώνεται συνεχώς.',
  'ISO 9001 since 1998': 'ISO 9001 από το 1998',
  'Management System': 'Σύστημα Διαχείρισης',
  'General': 'Γενικά',
  'PE Pipes': 'Σωλήνες PE',
  'PVC Pipes': 'Σωλήνες PVC',
  'ISO 9001 quality management — certified since 1998 and renewed continuously.':
    'Διαχείριση ποιότητας ISO 9001 — πιστοποιημένη από το 1998 και ανανεούμενη συνεχώς.',
  'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.':
    'Διαπροϊοντικές πιστοποιήσεις από διεθνώς αναγνωρισμένους φορείς, όπως οι DVGW, KIWA, SII και OVGW.',
  'Product certifications covering the full Elysée compression-fitting range for water-supply applications.':
    'Πιστοποιήσεις προϊόντων που καλύπτουν ολόκληρη τη γκάμα εξαρτημάτων μηχανικής σύσφιξης της Elysée για εφαρμογές ύδρευσης.',
  'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.':
    'Πιστοποιήσεις σωλήνων πολυαιθυλενίου σε όλο το εύρος των κατασκευαζόμενων διαμέτρων, κατάλληλων για πόσιμο νερό, αέριο και βιομηχανικά ρευστά.',
  'PVC pipe certifications for water-supply, drainage and infrastructure applications.':
    'Πιστοποιήσεις σωλήνων PVC για εφαρμογές ύδρευσης, αποστράγγισης και υποδομών.',
  'Environmental and sustainability certifications attached to the Green Elysée product line.':
    'Περιβαλλοντικές πιστοποιήσεις και πιστοποιήσεις βιωσιμότητας που συνδέονται με τη σειρά προϊόντων Green Elysée.',

  // ============================================================================
  // Quality & Certifications — category detail pages (shared chrome)
  // ============================================================================
  'All certificate categories': 'Όλες οι κατηγορίες πιστοποιητικών',
  // Hero "<count> certified …" trailing phrase (count stays in its own span)
  'certified standards': 'πιστοποιημένα πρότυπα',
  'certified recognitions': 'πιστοποιημένες διακρίσεις',
  'certified approvals': 'πιστοποιημένες εγκρίσεις',
  'standards.': 'πρότυπα.',
  'PDFs.': 'PDF.',
  'Tap any badge below to download the current certificate.':
    'Πατήστε οποιοδήποτε σήμα παρακάτω για να κατεβάσετε το τρέχον πιστοποιητικό.',
  'Standard families': 'Οικογένειες προτύπων',
  'Audit cadence': 'Συχνότητα ελέγχων',
  'Annual': 'Ετήσια',
  'Markets covered': 'Αγορές που καλύπτονται',
  'Product certificates': 'Πιστοποιητικά προϊόντων',
  // general.astro
  'Recognised, by certificate.': 'Αναγνωρισμένη, με πιστοποιητικό.',
  'Beyond the product line': 'Πέρα από τη σειρά προϊόντων',
  'Recognitions': 'Διακρίσεις',
  'Productivity programme': 'Πρόγραμμα παραγωγικότητας',
  'Packaging recovery': 'Ανάκτηση συσκευασιών',
  'Review cadence': 'Συχνότητα αναθεώρησης',
  'Beyond the product': 'Πέρα από το προϊόν',
  'Quality, outside the box.': 'Ποιότητα, εκτός πλαισίου.',
  'Not every certificate fits a product family — some recognise how the company works, trains, and takes responsibility.':
    'Δεν ταιριάζει κάθε πιστοποιητικό σε μια οικογένεια προϊόντων — ορισμένα αναγνωρίζουν τον τρόπο με τον οποίο η εταιρεία λειτουργεί, εκπαιδεύει και αναλαμβάνει ευθύνη.',
  "Pipes and fittings carry most of Elysée's certificates — but quality runs wider than the product catalogue. The recognitions on this page cover the company itself: the national productivity-improvement programme we take part in, and our membership of the Green Dot packaging recovery scheme.":
    'Οι σωλήνες και τα εξαρτήματα φέρουν τα περισσότερα πιστοποιητικά της Elysée — αλλά η ποιότητα εκτείνεται πέρα από τον κατάλογο προϊόντων. Οι διακρίσεις σε αυτή τη σελίδα αφορούν την ίδια την εταιρεία: το εθνικό πρόγραμμα βελτίωσης παραγωγικότητας στο οποίο συμμετέχουμε και τη συμμετοχή μας στο σύστημα ανάκτησης συσκευασιών Green Dot.',
  'Like every other certificate we hold, each one is issued by an independent body and downloadable below — the same documents we provide for tenders, partnerships, and corporate due diligence.':
    'Όπως κάθε άλλο πιστοποιητικό που κατέχουμε, καθένα εκδίδεται από ανεξάρτητο φορέα και είναι διαθέσιμο για λήψη παρακάτω — τα ίδια έγγραφα που παρέχουμε για διαγωνισμούς, συνεργασίες και εταιρικό έλεγχο δέουσας επιμέλειας.',
  'The wider picture': 'Η ευρύτερη εικόνα',
  'Quality is a habit, not a category.': 'Η ποιότητα είναι συνήθεια, όχι κατηγορία.',
  'Our General Certifications': 'Οι Γενικές μας Πιστοποιήσεις',
  "Need an older certificate, a tender-ready bundle, or evidence of a recognition you don't see here? Our team can prepare it on request.":
    'Χρειάζεστε ένα παλαιότερο πιστοποιητικό, ένα έτοιμο για διαγωνισμό πακέτο ή απόδειξη μιας διάκρισης που δεν βλέπετε εδώ; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',
  // management-system.astro
  'Managed, by certificate.': 'Διαχειριζόμενη, με πιστοποιητικό.',
  'The management system': 'Το σύστημα διαχείρισης',
  'System certificates': 'Πιστοποιητικά συστήματος',
  'Why a system, not a checklist': 'Γιατί σύστημα, όχι λίστα ελέγχου',
  'One system. Four disciplines.': 'Ένα σύστημα. Τέσσερις πειθαρχίες.',
  'Quality, environment, energy, and health & safety — each independently certified, all bound by one integrated policy.':
    'Ποιότητα, περιβάλλον, ενέργεια και υγεία & ασφάλεια — καθεμία ανεξάρτητα πιστοποιημένη, όλες δεσμευμένες από μία ολοκληρωμένη πολιτική.',
  'Elysée has run a certified quality management system since 1998. Over the years it has grown into a single integrated framework: ISO 9001 for quality, ISO 14001 and EMAS for the environment, ISO 50001 for energy, and ISO 45001 for the health and safety of everyone on site.':
    'Η Elysée λειτουργεί πιστοποιημένο σύστημα διαχείρισης ποιότητας από το 1998. Με τα χρόνια εξελίχθηκε σε ένα ενιαίο ολοκληρωμένο πλαίσιο: ISO 9001 για την ποιότητα, ISO 14001 και EMAS για το περιβάλλον, ISO 50001 για την ενέργεια και ISO 45001 για την υγεία και την ασφάλεια όλων στις εγκαταστάσεις.',
  'Every standard below is audited by an independent certification body on an annual cycle, and every claim is backed by a downloadable certificate — the same documents we submit with tenders, regulatory filings, and specification packages.':
    'Κάθε πρότυπο παρακάτω ελέγχεται από ανεξάρτητο φορέα πιστοποίησης σε ετήσιο κύκλο, και κάθε ισχυρισμός υποστηρίζεται από ένα πιστοποιητικό διαθέσιμο για λήψη — τα ίδια έγγραφα που υποβάλλουμε σε διαγωνισμούς, κανονιστικές καταθέσεις και πακέτα προδιαγραφών.',
  'The discipline behind the product': 'Η πειθαρχία πίσω από το προϊόν',
  'Say what you do. Do what you say. Prove it.':
    'Πες τι κάνεις. Κάνε ό,τι λες. Απόδειξέ το.',
  'Our Management System Certifications': 'Οι Πιστοποιήσεις του Συστήματος Διαχείρισής μας',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific management standard? Our team can prepare it on request.':
    'Χρειάζεστε ένα παλαιότερο πιστοποιητικό, ένα έτοιμο για διαγωνισμό πακέτο ή απόδειξη για ένα συγκεκριμένο πρότυπο διαχείρισης; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',
  // compression-fittings.astro
  'Approved, by certificate.': 'Εγκεκριμένα, με πιστοποιητικό.',
  'The fittings programme': 'Το πρόγραμμα εξαρτημάτων',
  'Why approvals matter': 'Γιατί έχουν σημασία οι εγκρίσεις',
  'One fitting. Twelve markets.': 'Ένα εξάρτημα. Δώδεκα αγορές.',
  'From KIWA to WaterMark — every market Elysée fittings ship to has its own approval body, and the range is certified in each one.':
    'Από την KIWA έως το WaterMark — κάθε αγορά στην οποία αποστέλλονται τα εξαρτήματα της Elysée διαθέτει τον δικό της φορέα έγκρισης, και η γκάμα είναι πιστοποιημένη σε καθεμία.',
  'Drinking water is the most regulated product there is — and every country guards it with its own approval scheme. The Elysée compression-fitting range carries them across Europe and beyond: DVGW in Germany, WRAS in the UK, KIWA in the Netherlands, SVGW in Switzerland, ÖVGW in Austria, WaterMark in Australia, and more.':
    'Το πόσιμο νερό είναι το πλέον ρυθμιζόμενο προϊόν που υπάρχει — και κάθε χώρα το προστατεύει με το δικό της σύστημα έγκρισης. Η γκάμα εξαρτημάτων μηχανικής σύσφιξης της Elysée τα φέρει σε όλη την Ευρώπη και πέρα από αυτήν: DVGW στη Γερμανία, WRAS στο Ηνωμένο Βασίλειο, KIWA στις Κάτω Χώρες, SVGW στην Ελβετία, ÖVGW στην Αυστρία, WaterMark στην Αυστραλία και άλλα.',
  'Each approval below is issued by an independent national body against EN 12201-3, ISO 17885, or the local water-contact regulations — and each one is downloadable as the current PDF, ready for tenders, specifications, and regulatory submissions.':
    'Κάθε έγκριση παρακάτω εκδίδεται από ανεξάρτητο εθνικό φορέα με βάση το EN 12201-3, το ISO 17885 ή τους τοπικούς κανονισμούς επαφής με νερό — και καθεμία είναι διαθέσιμη για λήψη ως το τρέχον PDF, έτοιμη για διαγωνισμούς, προδιαγραφές και κανονιστικές υποβολές.',
  'Worldwide approvals': 'Παγκόσμιες εγκρίσεις',
  'Approved at home — wherever home is.': 'Εγκεκριμένα στην πατρίδα — όπου κι αν είναι αυτή.',
  'Our Compression Fittings Certifications': 'Οι Πιστοποιήσεις Εξαρτημάτων Μηχανικής Σύσφιξης',
  "Need an older certificate, a tender-ready bundle, or an approval for a market you don't see here? Our team can prepare it on request.":
    'Χρειάζεστε ένα παλαιότερο πιστοποιητικό, ένα έτοιμο για διαγωνισμό πακέτο ή έγκριση για μια αγορά που δεν βλέπετε εδώ; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',
  // pe-pipes.astro
  'Proven, by certificate.': 'Αποδεδειγμένα, με πιστοποιητικό.',
  'The PE programme': 'Το πρόγραμμα PE',
  'Core standard': 'Βασικό πρότυπο',
  'PE materials covered': 'Υλικά PE που καλύπτονται',
  'From resin to reel': 'Από τη ρητίνη στο κουλούρι',
  'Every diameter, certified.': 'Κάθε διάμετρος, πιστοποιημένη.',
  'From HDPE mains to LDPE irrigation lines — the polyethylene range is certified across every diameter we extrude.':
    'Από τους κεντρικούς αγωγούς HDPE έως τις γραμμές άρδευσης LDPE — η γκάμα πολυαιθυλενίου είναι πιστοποιημένη σε κάθε διάμετρο που εξωθούμε.',
  "Polyethylene pipe carries water under pressure for decades — so its certification leaves no room for interpretation. Elysée's HDPE range is certified to EN 12201-2 across the manufactured diameter range, while the LDPE line carries the Cyprus national standard CYS 106.":
    'Ο σωλήνας πολυαιθυλενίου μεταφέρει νερό υπό πίεση επί δεκαετίες — γι’ αυτό η πιστοποίησή του δεν αφήνει περιθώρια ερμηνείας. Η γκάμα HDPE της Elysée είναι πιστοποιημένη κατά EN 12201-2 σε όλο το εύρος των κατασκευαζόμενων διαμέτρων, ενώ η σειρά LDPE φέρει το εθνικό πρότυπο της Κύπρου CYS 106.',
  'Around the core standards sit market approvals — AENOR certification to ISO 15875 and WRAS approval for stop valves in UK drinking-water installations. Every certificate is audited annually and downloadable below.':
    'Γύρω από τα βασικά πρότυπα υπάρχουν εγκρίσεις αγορών — πιστοποίηση AENOR κατά ISO 15875 και έγκριση WRAS για δικλείδες διακοπής σε εγκαταστάσεις πόσιμου νερού του Ηνωμένου Βασιλείου. Κάθε πιστοποιητικό ελέγχεται ετησίως και είναι διαθέσιμο για λήψη παρακάτω.',
  'Built for pressure': 'Φτιαγμένα για πίεση',
  'Pressure-rated. Paper-backed.': 'Με ονομαστική πίεση. Με έγγραφη τεκμηρίωση.',
  'Our PE Pipes Certifications': 'Οι Πιστοποιήσεις Σωλήνων PE',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific diameter class? Our team can prepare it on request.':
    'Χρειάζεστε ένα παλαιότερο πιστοποιητικό, ένα έτοιμο για διαγωνισμό πακέτο ή απόδειξη για μια συγκεκριμένη κλάση διαμέτρου; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',
  // pvc-pipes.astro
  'Specified, by certificate.': 'Προδιαγεγραμμένα, με πιστοποιητικό.',
  'The PVC programme': 'Το πρόγραμμα PVC',
  'Drainage standard': 'Πρότυπο αποστράγγισης',
  'Pressure standard': 'Πρότυπο πίεσης',
  'Under every street': 'Κάτω από κάθε δρόμο',
  'Drainage to conduit, certified.': 'Από την αποστράγγιση στον σωλήνα διέλευσης, πιστοποιημένα.',
  'Four standards cover the PVC range — underground drainage, soil & waste, pressure systems, and electrical conduit.':
    'Τέσσερα πρότυπα καλύπτουν τη γκάμα PVC — υπόγεια αποστράγγιση, λύματα & απόβλητα, συστήματα πίεσης και ηλεκτρολογικούς σωλήνες διέλευσης.',
  'PVC pipe disappears into the ground and stays there for generations — which is exactly why specifiers ask for the paperwork first. The Elysée PVC range is certified to EN 1401 for underground drainage and sewage, EN 1329 for soil and waste discharge, and EN ISO 1452 for pressure water supply.':
    'Ο σωλήνας PVC χάνεται μέσα στο έδαφος και παραμένει εκεί επί γενιές — και ακριβώς γι’ αυτό οι μελετητές ζητούν πρώτα τα έγγραφα. Η γκάμα PVC της Elysée είναι πιστοποιημένη κατά EN 1401 για υπόγεια αποστράγγιση και αποχέτευση, EN 1329 για απορροή λυμάτων και αποβλήτων, και EN ISO 1452 για ύδρευση υπό πίεση.',
  'A fourth standard, EN 61386, covers conduit systems for electrical infrastructure. Each certificate is audited annually by an independent body and downloadable below — ready for tenders, specifications, and regulatory submissions.':
    'Ένα τέταρτο πρότυπο, το EN 61386, καλύπτει συστήματα σωλήνων διέλευσης για ηλεκτρολογικές υποδομές. Κάθε πιστοποιητικό ελέγχεται ετησίως από ανεξάρτητο φορέα και είναι διαθέσιμο για λήψη παρακάτω — έτοιμο για διαγωνισμούς, προδιαγραφές και κανονιστικές υποβολές.',
  'Built to disappear': 'Φτιαγμένα για να εξαφανίζονται',
  'Buried for decades. Certified for all of them.':
    'Θαμμένα επί δεκαετίες. Πιστοποιημένα για όλες τους.',
  'Our PVC Pipes Certifications': 'Οι Πιστοποιήσεις Σωλήνων PVC',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific application class? Our team can prepare it on request.':
    'Χρειάζεστε ένα παλαιότερο πιστοποιητικό, ένα έτοιμο για διαγωνισμό πακέτο ή απόδειξη για μια συγκεκριμένη κλάση εφαρμογής; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',
  // QUALITY_CATEGORIES blurbs (rendered as {meta.blurb} on detail hero/intro)
  'Quality, environmental, energy, and health & safety management system certificates.':
    'Πιστοποιητικά συστήματος διαχείρισης ποιότητας, περιβάλλοντος, ενέργειας και υγείας & ασφάλειας.',
  'Miscellaneous certificates and recognitions held by Elysée.':
    'Διάφορα πιστοποιητικά και διακρίσεις που κατέχει η Elysée.',
  'Product certificates covering the full Elysée compression-fitting range.':
    'Πιστοποιητικά προϊόντων που καλύπτουν ολόκληρη τη γκάμα εξαρτημάτων μηχανικής σύσφιξης της Elysée.',
  'Polyethylene pipe certificates across the manufactured diameter range.':
    'Πιστοποιητικά σωλήνων πολυαιθυλενίου σε όλο το εύρος των κατασκευαζόμενων διαμέτρων.',
  'PVC pipe certificates for water-supply, drainage and infrastructure applications.':
    'Πιστοποιητικά σωλήνων PVC για εφαρμογές ύδρευσης, αποστράγγισης και υποδομών.',
};
