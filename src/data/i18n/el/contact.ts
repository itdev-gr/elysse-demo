// English UI string → Greek for the CONTACT section: the Local Network,
// Worldwide Network, Careers and the three subsidiary pages (Elysée WISE /
// PRIME / Rohrsysteme), plus the contact-only components (ShopLocator,
// WorldwideExplorer, JobsList/JobCard). Keyed by the English source text so it
// doubles as the fallback. Strings already in shared.ts (nav labels, "Tel",
// "Fax", "Email", "Phone", "Send message", enquiry-form UI, etc.) are NOT
// repeated here. Brand/subsidiary names (Elysée, WISE, PRIME, Rohrsysteme,
// Green Elysée), city/country names, addresses, emails, phones, URLs and
// numeric stats are intentionally left untranslated.
export const contact: Record<string, string> = {
  // ───────────────────────── ContactSubNav (contact-only) ─────────────────────────
  'In this section': 'Σε αυτή την ενότητα',
  'Contact Us section': 'Ενότητα Επικοινωνίας',

  // ───────────────────────── Generic contact-card labels ─────────────────────────
  'Address': 'Διεύθυνση',
  'Website': 'Ιστότοπος',
  'Hours': 'Ώρες λειτουργίας',
  'Also': 'Επίσης',
  'Get in touch': 'Επικοινωνήστε μαζί μας',

  // ============================================================================
  // Local Network — /contact/local/
  // ============================================================================
  // Hero
  'Contact Us · Cyprus': 'Επικοινωνία · Κύπρος',
  'Local Network.': 'Τοπικό Δίκτυο.',
  "Six shops across the island plus the Ergates head office. Drop in, give us a call, or send a message — we'll route your enquiry to the closest Elysée location.":
    'Έξι καταστήματα σε όλο το νησί συν τα κεντρικά γραφεία στο Εργάτες. Επισκεφθείτε μας, καλέστε μας ή στείλτε μήνυμα — θα προωθήσουμε το αίτημά σας στο πλησιέστερο σημείο της Elysée.',
  // Stat band
  'By the network': 'Με το δίκτυο',
  'Shops island-wide': 'Καταστήματα σε όλο το νησί',
  'Cities covered': 'Πόλεις κάλυψης',
  'Cyprus since': 'Στην Κύπρο από',
  'Years on the island': 'Χρόνια στο νησί',
  // Head office
  'Head office': 'Κεντρικά γραφεία',
  'Visit, call, or send a message. The head office routes enquiries to the right shop.':
    'Επισκεφθείτε μας, καλέστε ή στείλτε μήνυμα. Τα κεντρικά γραφεία προωθούν τα αιτήματα στο κατάλληλο κατάστημα.',
  // Shop cards header
  'Across the island': 'Σε όλο το νησί',
  'Find your nearest shop.': 'Βρείτε το πλησιέστερο κατάστημα.',
  'Six Elysée locations covering Nicosia, Larnaca, Limassol, Famagusta district and Paphos.':
    'Έξι σημεία της Elysée που καλύπτουν Λευκωσία, Λάρνακα, Λεμεσό, επαρχία Αμμοχώστου και Πάφο.',
  // Contact-form band
  'Prefer to write?': 'Προτιμάτε να γράψετε;',
  'Send us a message.': 'Στείλτε μας ένα μήνυμα.',
  "Drop us a line and we'll route your enquiry to the right Cyprus location.":
    'Στείλτε μας δύο γραμμές και θα προωθήσουμε το αίτημά σας στο κατάλληλο σημείο στην Κύπρο.',
  // Closing CTA
  'Looking for export, technical advice, or one of our international subsidiaries? Continue to the Worldwide Network.':
    'Αναζητάτε εξαγωγές, τεχνικές συμβουλές ή κάποια από τις διεθνείς θυγατρικές μας; Συνεχίστε στο Παγκόσμιο Δίκτυο.',

  // ============================================================================
  // ShopLocator (contact-only component)
  // ============================================================================
  'Shops': 'Καταστήματα',
  'Contact Details': 'Στοιχεία επικοινωνίας',
  'Open in Google Maps': 'Άνοιγμα στους Χάρτες Google',

  // ============================================================================
  // Worldwide Network — /contact/worldwide/
  // ============================================================================
  // Hero
  'Contact Us · Export hub': 'Επικοινωνία · Κέντρο εξαγωγών',
  'Worldwide Network.': 'Παγκόσμιο Δίκτυο.',
  'Elysée ships to more than 65 destinations from a single export hub in Cyprus — coordinated through a network of distributors and representatives across four world regions.':
    'Η Elysée αποστέλλει σε περισσότερους από 65 προορισμούς από ένα και μόνο κέντρο εξαγωγών στην Κύπρο — με συντονισμό μέσω δικτύου διανομέων και αντιπροσώπων σε τέσσερις περιοχές του κόσμου.',
  // Stat band
  'By the reach': 'Με την εμβέλεια',
  'Destinations': 'Προορισμοί',
  'Continents reached': 'Ήπειροι κάλυψης',
  'Exporting since': 'Εξαγωγές από',
  'Export hub · Cyprus': 'Κέντρο εξαγωγών · Κύπρος',
  // Export intro
  'Why one hub': 'Γιατί ένα κέντρο',
  'One workshop. Sixty-five destinations.': 'Ένα εργοστάσιο. Εξήντα πέντε προορισμοί.',
  'Everything ships out of Ergates, Cyprus — at the crossroads of three continents.':
    'Όλα αποστέλλονται από το Εργάτες της Κύπρου — στο σταυροδρόμι τριών ηπείρων.',
  'Every Elysée pipe, fitting and irrigation product is manufactured under one ISO 9001 management system in Ergates, Cyprus — then shipped through a network of distributors and representatives covering Europe, the Middle East, Africa and Asia-Pacific.':
    'Κάθε σωλήνας, εξάρτημα και προϊόν άρδευσης της Elysée κατασκευάζεται υπό ένα ενιαίο σύστημα διαχείρισης ISO 9001 στο Εργάτες της Κύπρου — και στη συνέχεια αποστέλλεται μέσω δικτύου διανομέων και αντιπροσώπων που καλύπτει την Ευρώπη, τη Μέση Ανατολή, την Αφρική και την περιοχή Ασίας-Ειρηνικού.',
  "For territory enquiries, tender support and OEM programmes, route through the Export Department below — they'll connect you to the right partner in your region.":
    'Για αιτήματα ανά περιοχή, υποστήριξη διαγωνισμών και προγράμματα OEM, απευθυνθείτε στο Τμήμα Εξαγωγών παρακάτω — θα σας συνδέσουν με τον κατάλληλο συνεργάτη στην περιοχή σας.',
  // Export Department card
  'First point of contact': 'Πρώτο σημείο επικοινωνίας',
  'Export Department.': 'Τμήμα Εξαγωγών.',
  // Continents section
  'Coverage': 'Κάλυψη',
  'Four continents.': 'Τέσσερις ήπειροι.',
  "The Export Department routes enquiries through the closest local partner. Tell us your continent and we'll connect you.":
    'Το Τμήμα Εξαγωγών προωθεί τα αιτήματα μέσω του πλησιέστερου τοπικού συνεργάτη. Πείτε μας την ήπειρό σας και θα σας συνδέσουμε.',
  'Europe': 'Ευρώπη',
  'Asia': 'Ασία',
  'Africa': 'Αφρική',
  'Oceania': 'Ωκεανία',
  "EU, UK and the Balkans — Elysée's primary export market, served from Cyprus and the Austrian hub.":
    'ΕΕ, Ηνωμένο Βασίλειο και Βαλκάνια — η κύρια εξαγωγική αγορά της Elysée, που εξυπηρετείται από την Κύπρο και το κέντρο στην Αυστρία.',
  'From the Levant and the Gulf through to Japan — distributors across the Middle East, South-East and East Asia.':
    'Από τη Μέση Ανατολή και τον Κόλπο έως την Ιαπωνία — διανομείς σε όλη τη Μέση Ανατολή, τη Νοτιοανατολική και την Ανατολική Ασία.',
  'North Africa via the Egyptian PRIME plant, plus selected partners reaching down to South Africa.':
    'Βόρεια Αφρική μέσω του εργοστασίου PRIME στην Αίγυπτο, καθώς και επιλεγμένοι συνεργάτες που φτάνουν έως τη Νότια Αφρική.',
  'Australia and New Zealand — Elysée products on the other side of the world.':
    'Αυστραλία και Νέα Ζηλανδία — προϊόντα Elysée στην άλλη άκρη του κόσμου.',
  // World map section
  'Where we ship': 'Πού αποστέλλουμε',
  'Sixty-five destinations.': 'Εξήντα πέντε προορισμοί.',
  "Tap any marker — Elysée's four subsidiaries or any of the partner countries — and the local contact details appear under the map, with a pre-written message ready to send from the form on the right.":
    'Πατήστε οποιονδήποτε δείκτη — τις τέσσερις θυγατρικές της Elysée ή οποιαδήποτε από τις χώρες-συνεργάτες — και τα τοπικά στοιχεία επικοινωνίας εμφανίζονται κάτω από τον χάρτη, με ένα προετοιμασμένο μήνυμα έτοιμο για αποστολή από τη φόρμα στα δεξιά.',
  // Closing CTA + export enquiry
  'Export enquiries': 'Αιτήματα εξαγωγών',
  'Reach our export team.': 'Επικοινωνήστε με την ομάδα εξαγωγών μας.',
  'Tell us about your market and requirements and the export department will get back to you. Looking for one of our regional manufacturing subsidiaries? Visit Elysée WISE in Lebanon, PRIME in Egypt, or Rohrsysteme in Austria.':
    'Πείτε μας για την αγορά και τις απαιτήσεις σας και το τμήμα εξαγωγών θα επικοινωνήσει μαζί σας. Αναζητάτε κάποια από τις περιφερειακές παραγωγικές θυγατρικές μας; Επισκεφθείτε την Elysée WISE στον Λίβανο, την PRIME στην Αίγυπτο ή την Rohrsysteme στην Αυστρία.',
  'Visit Elysée WISE': 'Επισκεφθείτε την Elysée WISE',
  // Enquiry-form props (worldwide)
  'Export enquiry': 'Αίτημα εξαγωγής',
  'Share your market and needs — our export team will respond.':
    'Μοιραστείτε την αγορά και τις ανάγκες σας — η ομάδα εξαγωγών μας θα απαντήσει.',

  // ============================================================================
  // WorldwideExplorer (contact-only component)
  // ============================================================================
  'Map temporarily unavailable': 'Ο χάρτης δεν είναι προσωρινά διαθέσιμος',
  'Tap any country': 'Πατήστε οποιαδήποτε χώρα',
  'Pick a marker on the map to see local contact details — we will route your message to the closest Elysée office or partner.':
    'Επιλέξτε έναν δείκτη στον χάρτη για να δείτε τα τοπικά στοιχεία επικοινωνίας — θα προωθήσουμε το μήνυμά σας στο πλησιέστερο γραφείο ή συνεργάτη της Elysée.',
  'Subsidiary': 'Θυγατρική',
  'Partner country': 'Χώρα-συνεργάτης',
  'Send a message': 'Στείλτε ένα μήνυμα',
  'Country': 'Χώρα',
  'Your name': 'Το όνομά σας',
  'Select a country…': 'Επιλέξτε μια χώρα…',
  'Loading countries…': 'Φόρτωση χωρών…',
  'Pick a country on the map to pre-fill, or write your enquiry here.':
    'Επιλέξτε μια χώρα στον χάρτη για αυτόματη συμπλήρωση ή γράψτε εδώ το αίτημά σας.',
  'No country picked — your message will be routed to the Export Department in Cyprus.':
    'Δεν επιλέχθηκε χώρα — το μήνυμά σας θα προωθηθεί στο Τμήμα Εξαγωγών στην Κύπρο.',

  // ============================================================================
  // Careers — /contact/careers/
  // ============================================================================
  // Hero
  'Contact Us · Group-wide': 'Επικοινωνία · Σε όλο τον όμιλο',
  'Careers.': 'Καριέρα.',
  'Join Elysée': 'Γίνετε μέλος της Elysée',
  // Subtitle + intro prose (from site-content)
  'Build your career with Elysée — engineering, manufacturing, R&D, and commercial roles across Cyprus, Lebanon, Egypt and Austria.':
    'Χτίστε την καριέρα σας με την Elysée — θέσεις μηχανικής, παραγωγής, έρευνας & ανάπτυξης και εμπορικού τομέα σε Κύπρο, Λίβανο, Αίγυπτο και Αυστρία.',
  'Since 1968 Elysée has grown from a single Cypriot workshop into a four-country group of piping and irrigation specialists. The people behind that growth — engineers, machine operators, quality technicians, sales managers, R&D scientists — are what we hire for, not the seat we put them in.':
    'Από το 1968 η Elysée εξελίχθηκε από ένα μεμονωμένο κυπριακό εργαστήριο σε έναν όμιλο ειδικών στις σωληνώσεις και την άρδευση τεσσάρων χωρών. Οι άνθρωποι πίσω από αυτή την ανάπτυξη — μηχανικοί, χειριστές μηχανών, τεχνικοί ποιότητας, διευθυντές πωλήσεων, επιστήμονες έρευνας & ανάπτυξης — είναι αυτό για το οποίο προσλαμβάνουμε, όχι η θέση στην οποία τους τοποθετούμε.',
  'We invest in long careers, not short stints. Joining the group means working alongside materials labs in Strovolos, hose extrusion lines in the 10th of Ramadan, distribution teams in Ennsdorf, and PE manufacturing in Byblos — with internal moves between subsidiaries treated as a feature, not an exception.':
    'Επενδύουμε σε μακροχρόνιες καριέρες, όχι σε σύντομες θητείες. Το να γίνετε μέλος του ομίλου σημαίνει να εργάζεστε δίπλα σε εργαστήρια υλικών στον Στρόβολο, σε γραμμές εξώθησης σωλήνων στην πόλη 10th of Ramadan, σε ομάδες διανομής στο Ennsdorf και στην παραγωγή PE στη Βύβλο — με τις εσωτερικές μετακινήσεις μεταξύ θυγατρικών να αντιμετωπίζονται ως πλεονέκτημα, όχι ως εξαίρεση.',
  // Stat band
  'By the group': 'Με τον όμιλο',
  'Family-owned since': 'Οικογενειακή επιχείρηση από',
  'Countries we hire from': 'Χώρες από όπου προσλαμβάνουμε',
  'Manufacturing subsidiaries': 'Παραγωγικές θυγατρικές',
  'Years building careers': 'Χρόνια οικοδόμησης καριέρας',
  // About
  'About Careers at Elysée': 'Σχετικά με την Καριέρα στην Elysée',
  'Long careers, four countries.': 'Μακροχρόνιες καριέρες, τέσσερις χώρες.',
  'Engineering, manufacturing, R&D and commercial roles across the group.':
    'Θέσεις μηχανικής, παραγωγής, έρευνας & ανάπτυξης και εμπορικού τομέα σε όλο τον όμιλο.',
  // Cinematic moment
  'Join the group': 'Γίνετε μέλος του ομίλου',
  'We hire people, not seats.': 'Προσλαμβάνουμε ανθρώπους, όχι θέσεις.',
  // Open positions
  'Now hiring': 'Προσλαμβάνουμε τώρα',
  'Open positions.': 'Διαθέσιμες θέσεις.',
  'Current roles across the group — engineering, manufacturing, R&D and commercial. Tap a card to read the full role.':
    'Τρέχουσες θέσεις σε όλο τον όμιλο — μηχανική, παραγωγή, έρευνα & ανάπτυξη και εμπορικός τομέας. Πατήστε μια κάρτα για να διαβάσετε ολόκληρη τη θέση.',
  // How to apply card
  'How to apply': 'Πώς να υποβάλετε αίτηση',
  'Send us your CV.': 'Στείλτε μας το βιογραφικό σας.',
  // Closing CTA
  'Start the conversation.': 'Ξεκινήστε τη συζήτηση.',
  "Prefer to start a conversation in person? Visit the Cyprus head office on the Local Network page, or step back to the group's worldwide subsidiaries.":
    'Προτιμάτε να ξεκινήσετε μια συζήτηση από κοντά; Επισκεφθείτε τα κεντρικά γραφεία στην Κύπρο στη σελίδα Τοπικού Δικτύου ή επιστρέψτε στις παγκόσμιες θυγατρικές του ομίλου.',
  'Email recruitment@elysee.com.cy': 'Email recruitment@elysee.com.cy',
  'Back to Local Network': 'Πίσω στο Τοπικό Δίκτυο',
  // Enquiry-form props (careers)
  'Send us your details': 'Στείλτε μας τα στοιχεία σας',
  'Tell us about yourself and the recruitment team will be in touch.':
    'Πείτε μας για εσάς και η ομάδα προσλήψεων θα επικοινωνήσει μαζί σας.',

  // ============================================================================
  // JobsList / JobCard (careers, contact-only components)
  // ============================================================================
  'No open positions right now.': 'Δεν υπάρχουν διαθέσιμες θέσεις αυτή τη στιγμή.',
  'Open positions are temporarily unavailable.': 'Οι διαθέσιμες θέσεις δεν είναι προσωρινά διαθέσιμες.',
  'We hire people, not seats — send your CV anyway and we will get in touch when something matches.':
    'Προσλαμβάνουμε ανθρώπους, όχι θέσεις — στείλτε μας ούτως ή άλλως το βιογραφικό σας και θα επικοινωνήσουμε μαζί σας όταν προκύψει κάτι κατάλληλο.',
  'Please reach out by email and we will reply with the current openings.':
    'Επικοινωνήστε μαζί μας μέσω email και θα σας απαντήσουμε με τις τρέχουσες διαθέσιμες θέσεις.',
  'No openings': 'Καμία διαθέσιμη θέση',
  'Temporarily unavailable': 'Προσωρινά μη διαθέσιμο',
  'Apply': 'Υποβολή αίτησης',
  'Read less': 'Διαβάστε λιγότερα',

  // ============================================================================
  // Subsidiary pages — shared scaffolding
  // ============================================================================
  'By the subsidiary': 'Με τη θυγατρική',
  'Of three subsidiaries': 'Από τρεις θυγατρικές',
  'Subsidiary · 01 of 03': 'Θυγατρική · 01 από 03',
  'Subsidiary · 02 of 03': 'Θυγατρική · 02 από 03',
  'Subsidiary · 03 of 03': 'Θυγατρική · 03 από 03',

  // ── Elysée WISE — /contact/wise/ ─────────────────────────────────────────
  'Contact Us · Lebanon': 'Επικοινωνία · Λίβανος',
  "Elysée's subsidiary company in Lebanon, manufacturing Polyethylene pipes.":
    'Η θυγατρική εταιρεία της Elysée στον Λίβανο, που κατασκευάζει σωλήνες πολυαιθυλενίου.',
  "Elysée WISE is Elysée's subsidiary company based in Lebanon. It mainly focuses on manufacturing Polyethylene pipes.":
    'Η Elysée WISE είναι η θυγατρική εταιρεία της Elysée με έδρα τον Λίβανο. Επικεντρώνεται κυρίως στην κατασκευή σωλήνων πολυαιθυλενίου.',
  "Operating from the Byblos–Gherfine area, Elysée WISE brings Elysée's manufacturing expertise to the Lebanese market and the wider region, producing high-quality PE pipes in line with the group's standards.":
    'Με έδρα την περιοχή Βύβλος–Gherfine, η Elysée WISE μεταφέρει την κατασκευαστική τεχνογνωσία της Elysée στη λιβανική αγορά και την ευρύτερη περιοχή, παράγοντας σωλήνες PE υψηλής ποιότητας σύμφωνα με τα πρότυπα του ομίλου.',
  'PE pipes': 'Σωλήνες PE',
  'Manufacturing focus': 'Εστίαση παραγωγής',
  'Plant location': 'Τοποθεσία εργοστασίου',
  'About Elysée WISE': 'Σχετικά με την Elysée WISE',
  'The Lebanese plant.': 'Το λιβανικό εργοστάσιο.',
  'Polyethylene pipe manufacturing for the Lebanese and regional markets.':
    'Κατασκευή σωλήνων πολυαιθυλενίου για τη λιβανική και τις περιφερειακές αγορές.',
  'Polyethylene pipes, from Byblos to the region.':
    'Σωλήνες πολυαιθυλενίου, από τη Βύβλο σε ολόκληρη την περιοχή.',
  'Contact Elysée WISE': 'Επικοινωνήστε με την Elysée WISE',
  'Send us a message and the Elysée WISE team will get back to you.':
    'Στείλτε μας ένα μήνυμα και η ομάδα της Elysée WISE θα επικοινωνήσει μαζί σας.',
  'Visit the full Elysée WISE site for product specifications and regional distribution, or continue to Elysée PRIME in Egypt.':
    'Επισκεφθείτε τον πλήρη ιστότοπο της Elysée WISE για προδιαγραφές προϊόντων και περιφερειακή διανομή ή συνεχίστε στην Elysée PRIME στην Αίγυπτο.',
  'Visit elyseewise.com': 'Επισκεφθείτε το elyseewise.com',
  'Next · Elysée PRIME': 'Επόμενο · Elysée PRIME',

  // ── Elysée PRIME — /contact/prime/ ───────────────────────────────────────
  'Contact Us · Egypt': 'Επικοινωνία · Αίγυπτος',
  "Elysée's subsidiary company in Egypt, manufacturing irrigation hoses of various kinds.":
    'Η θυγατρική εταιρεία της Elysée στην Αίγυπτο, που κατασκευάζει σωλήνες άρδευσης διαφόρων ειδών.',
  "Elysée PRIME is Elysée's subsidiary company based in Egypt. It mainly focuses on manufacturing irrigation hoses of various kinds.":
    'Η Elysée PRIME είναι η θυγατρική εταιρεία της Elysée με έδρα την Αίγυπτο. Επικεντρώνεται κυρίως στην κατασκευή σωλήνων άρδευσης διαφόρων ειδών.',
  "Located in the Al Tajamouat Industrial Park in the 10th of Ramadan City, Elysée PRIME serves regional markets with a broad range of irrigation hose products manufactured to the group's quality standards.":
    'Με έδρα το Al Tajamouat Industrial Park στην πόλη 10th of Ramadan, η Elysée PRIME εξυπηρετεί τις περιφερειακές αγορές με ευρεία γκάμα προϊόντων σωλήνων άρδευσης που κατασκευάζονται σύμφωνα με τα πρότυπα ποιότητας του ομίλου.',
  'Hoses': 'Σωλήνες',
  'Irrigation focus': 'Εστίαση στην άρδευση',
  'Industrial park': 'Βιομηχανικό πάρκο',
  'About Elysée PRIME': 'Σχετικά με την Elysée PRIME',
  'The Egyptian plant.': 'Το αιγυπτιακό εργοστάσιο.',
  'Irrigation hose manufacturing for the Egyptian and regional markets.':
    'Κατασκευή σωλήνων άρδευσης για την αιγυπτιακή και τις περιφερειακές αγορές.',
  'Irrigation hoses, from the 10th of Ramadan.':
    'Σωλήνες άρδευσης, από την πόλη 10th of Ramadan.',
  'Contact Elysée PRIME': 'Επικοινωνήστε με την Elysée PRIME',
  'Send us a message and the Elysée PRIME team will get back to you.':
    'Στείλτε μας ένα μήνυμα και η ομάδα της Elysée PRIME θα επικοινωνήσει μαζί σας.',
  'Visit the full Elysée PRIME site for irrigation product details, or continue to Elysée Rohrsysteme in Austria.':
    'Επισκεφθείτε τον πλήρη ιστότοπο της Elysée PRIME για λεπτομέρειες προϊόντων άρδευσης ή συνεχίστε στην Elysée Rohrsysteme στην Αυστρία.',
  'Visit elyseeprime.com': 'Επισκεφθείτε το elyseeprime.com',
  'Next · Elysée Rohrsysteme': 'Επόμενο · Elysée Rohrsysteme',

  // ── Elysée Rohrsysteme — /contact/rohrsysteme/ ───────────────────────────
  'Contact Us · Austria': 'Επικοινωνία · Αυστρία',
  "Elysée's subsidiary company in Austria, serving European countries.":
    'Η θυγατρική εταιρεία της Elysée στην Αυστρία, που εξυπηρετεί τις ευρωπαϊκές χώρες.',
  "Elysée Rohrsysteme is Elysée's subsidiary company based in Austria. It mainly focuses on serving the European countries.":
    'Η Elysée Rohrsysteme είναι η θυγατρική εταιρεία της Elysée με έδρα την Αυστρία. Επικεντρώνεται κυρίως στην εξυπηρέτηση των ευρωπαϊκών χωρών.',
  "Based in Ennsdorf bei Enns, Austria, Elysée Rohrsysteme operates as the group's distribution and representation hub for European markets, bringing Elysée's piping and irrigation systems to customers across the continent.":
    'Με έδρα το Ennsdorf bei Enns της Αυστρίας, η Elysée Rohrsysteme λειτουργεί ως το κέντρο διανομής και αντιπροσώπευσης του ομίλου για τις ευρωπαϊκές αγορές, μεταφέροντας τα συστήματα σωληνώσεων και άρδευσης της Elysée σε πελάτες σε ολόκληρη την ήπειρο.',
  'Distribution market': 'Αγορά διανομής',
  'Office location': 'Τοποθεσία γραφείου',
  'About Elysée Rohrsysteme': 'Σχετικά με την Elysée Rohrsysteme',
  'The Austrian hub.': 'Το αυστριακό κέντρο.',
  'Distribution and representation across European markets.':
    'Διανομή και αντιπροσώπευση σε όλες τις ευρωπαϊκές αγορές.',
  'Distribution across Europe, from Ennsdorf bei Enns.':
    'Διανομή σε όλη την Ευρώπη, από το Ennsdorf bei Enns.',
  'Contact Elysée Rohrsysteme': 'Επικοινωνήστε με την Elysée Rohrsysteme',
  'Send us a message and the Elysée Rohrsysteme team will get back to you.':
    'Στείλτε μας ένα μήνυμα και η ομάδα της Elysée Rohrsysteme θα επικοινωνήσει μαζί σας.',
  'Visit the full Elysée Rohrsysteme site for European product distribution, or return to the Cyprus Local Network.':
    'Επισκεφθείτε τον πλήρη ιστότοπο της Elysée Rohrsysteme για τη διανομή προϊόντων στην Ευρώπη ή επιστρέψτε στο Τοπικό Δίκτυο της Κύπρου.',
  'Visit elysee-rohrsysteme.com': 'Επισκεφθείτε το elysee-rohrsysteme.com',
  'Next · Careers': 'Επόμενο · Καριέρα',
};
