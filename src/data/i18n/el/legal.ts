// English legal-page string → Greek. Keyed by the EXACT English text the
// shared Hero / SectionRenderer outputs. Body strings are keyed per paragraph
// as split by the renderer on /\n\n+/ (single \n does NOT split a paragraph).
// Brand names (Elysée), registration numbers, addresses, emails, URLs, dates
// and bracketed placeholders are kept verbatim; only the legal prose is translated.
export const legal: Record<string, string> = {
  // ── Shared hero eyebrow on all three legal pages ──────────────────────────
  Legal: 'Νομικά',

  // ── Privacy Policy — hero ─────────────────────────────────────────────────
  // headline "Privacy Policy" is already in shared.ts (reused)
  'How Elysée Irrigation Ltd collects, uses, and protects personal information you share with us through elysee.com.cy.':
    'Πώς η Elysée Irrigation Ltd συλλέγει, χρησιμοποιεί και προστατεύει τα προσωπικά δεδομένα που μοιράζεστε μαζί μας μέσω του elysee.com.cy.',

  // ── Privacy Policy — intro section (body split on \n\n) ───────────────────
  'Last updated: [LAST_UPDATED_DATE].':
    'Τελευταία ενημέρωση: [LAST_UPDATED_DATE].',
  'This Privacy Policy explains how Elysée Irrigation Ltd ("Elysée", "we", "us", or "our") collects, uses, discloses, and safeguards personal information you provide through elysee.com.cy (the "Site") or in the course of dealings with us. It applies to information about identifiable individuals and is written to meet our obligations under the EU General Data Protection Regulation (Regulation (EU) 2016/679, "GDPR") and the Cyprus Law providing for the Protection of Natural Persons with regard to the Processing of Personal Data (Law 125(I)/2018).':
    'Η παρούσα Πολιτική Απορρήτου εξηγεί πώς η Elysée Irrigation Ltd («Elysée», «εμείς» ή «εμάς») συλλέγει, χρησιμοποιεί, γνωστοποιεί και διαφυλάσσει τα προσωπικά δεδομένα που παρέχετε μέσω του elysee.com.cy (ο «Ιστότοπος») ή στο πλαίσιο των συναλλαγών σας μαζί μας. Εφαρμόζεται σε πληροφορίες που αφορούν ταυτοποιήσιμα φυσικά πρόσωπα και έχει συνταχθεί ώστε να ανταποκρίνεται στις υποχρεώσεις μας βάσει του Γενικού Κανονισμού για την Προστασία Δεδομένων της ΕΕ (Κανονισμός (ΕΕ) 2016/679, «ΓΚΠΔ») και του Κυπριακού Νόμου που προβλέπει για την Προστασία των Φυσικών Προσώπων έναντι της Επεξεργασίας Δεδομένων Προσωπικού Χαρακτήρα (Νόμος 125(Ι)/2018).',
  'By using the Site, you confirm you have read and understood this Policy. If you do not agree with it, please do not use the Site.':
    'Με τη χρήση του Ιστότοπου, επιβεβαιώνετε ότι έχετε διαβάσει και κατανοήσει την παρούσα Πολιτική. Εάν δεν συμφωνείτε με αυτήν, παρακαλούμε να μην χρησιμοποιείτε τον Ιστότοπο.',

  // ── Privacy Policy — "Who we are" ─────────────────────────────────────────
  'Who we are': 'Ποιοι είμαστε',
  'Elysée Irrigation Ltd is the data controller responsible for the personal information described in this Policy.':
    'Η Elysée Irrigation Ltd είναι ο υπεύθυνος επεξεργασίας δεδομένων που φέρει την ευθύνη για τα προσωπικά δεδομένα που περιγράφονται στην παρούσα Πολιτική.',
  'Registered office: [REGISTERED_OFFICE_ADDRESS], Cyprus.\nCompany registration number: [COMPANY_REG_NUMBER].\nGeneral contact: [GENERAL_CONTACT_EMAIL].\nData Protection Officer: [DPO_EMAIL].':
    'Έδρα: [REGISTERED_OFFICE_ADDRESS], Κύπρος.\nΑριθμός εγγραφής εταιρείας: [COMPANY_REG_NUMBER].\nΓενική επικοινωνία: [GENERAL_CONTACT_EMAIL].\nΥπεύθυνος Προστασίας Δεδομένων: [DPO_EMAIL].',

  // ── Privacy Policy — "What information we collect" ────────────────────────
  'What information we collect': 'Ποιες πληροφορίες συλλέγουμε',
  'We collect personal information in the following categories:':
    'Συλλέγουμε προσωπικά δεδομένα στις ακόλουθες κατηγορίες:',
  'Information you give us directly. When you contact us through a form, by email, or by phone, we receive your name, email address, telephone number, company (if provided), and the content of your message.':
    'Πληροφορίες που μας δίνετε απευθείας. Όταν επικοινωνείτε μαζί μας μέσω φόρμας, email ή τηλεφώνου, λαμβάνουμε το όνομά σας, τη διεύθυνση email, τον αριθμό τηλεφώνου, την εταιρεία (εφόσον δηλωθεί) και το περιεχόμενο του μηνύματός σας.',
  'Information we collect automatically. When you visit the Site, our servers and analytics providers record technical data such as your IP address, browser type and version, device and operating system, referring URL, pages visited, time and date of your visit, and time spent on each page. This information is used to operate, secure, and improve the Site.':
    'Πληροφορίες που συλλέγουμε αυτόματα. Όταν επισκέπτεστε τον Ιστότοπο, οι διακομιστές μας και οι πάροχοι αναλυτικών στοιχείων καταγράφουν τεχνικά δεδομένα όπως η διεύθυνση IP σας, ο τύπος και η έκδοση του προγράμματος περιήγησης, η συσκευή και το λειτουργικό σύστημα, η διεύθυνση URL παραπομπής, οι σελίδες που επισκεφθήκατε, η ώρα και η ημερομηνία της επίσκεψής σας, καθώς και ο χρόνος παραμονής σε κάθε σελίδα. Οι πληροφορίες αυτές χρησιμοποιούνται για τη λειτουργία, την ασφάλεια και τη βελτίωση του Ιστότοπου.',
  'Cookies. The Site uses cookies and similar technologies as described in the "Cookies and similar technologies" section below.':
    'Cookies. Ο Ιστότοπος χρησιμοποιεί cookies και παρόμοιες τεχνολογίες όπως περιγράφεται στην ενότητα «Cookies και παρόμοιες τεχνολογίες» παρακάτω.',
  'We do not knowingly collect special-category data (such as health, religion, or political opinions) through the Site, and we ask that you do not send such information to us through the contact channels.':
    'Δεν συλλέγουμε εν γνώσει μας δεδομένα ειδικών κατηγοριών (όπως υγεία, θρησκεία ή πολιτικές απόψεις) μέσω του Ιστότοπου και σας παρακαλούμε να μην μας αποστέλλετε τέτοιες πληροφορίες μέσω των διαύλων επικοινωνίας.',

  // ── Privacy Policy — "Lawful bases for processing" (list) ─────────────────
  'Lawful bases for processing': 'Νομικές βάσεις επεξεργασίας',
  'Under the GDPR, we only process your personal information where we have a lawful basis. The bases we rely on are:':
    'Βάσει του ΓΚΠΔ, επεξεργαζόμαστε τα προσωπικά σας δεδομένα μόνο όταν διαθέτουμε νομική βάση. Οι βάσεις στις οποίες στηριζόμαστε είναι:',
  'Your consent — for example, when you accept non-essential cookies, or subscribe to a mailing list.':
    'Η συγκατάθεσή σας — για παράδειγμα, όταν αποδέχεστε μη απαραίτητα cookies ή εγγράφεστε σε μια λίστα αλληλογραφίας.',
  'Performance of a contract — when you ask us to provide products, services, or a quotation.':
    'Η εκτέλεση σύμβασης — όταν μας ζητάτε να παρέχουμε προϊόντα, υπηρεσίες ή προσφορά.',
  'Compliance with a legal obligation — for example, retaining invoices and tax records as required by Cyprus law.':
    'Η συμμόρφωση με νομική υποχρέωση — για παράδειγμα, η τήρηση τιμολογίων και φορολογικών αρχείων όπως απαιτείται από την κυπριακή νομοθεσία.',
  'Our legitimate interests — to operate and secure the Site, respond to enquiries, and improve our products and services, where these interests are not overridden by your rights and freedoms.':
    'Τα έννομα συμφέροντά μας — για τη λειτουργία και την ασφάλεια του Ιστότοπου, την ανταπόκριση σε αιτήματα και τη βελτίωση των προϊόντων και υπηρεσιών μας, εφόσον τα συμφέροντα αυτά δεν υπερισχύονται από τα δικαιώματα και τις ελευθερίες σας.',

  // ── Privacy Policy — "How we use your information" ────────────────────────
  'How we use your information': 'Πώς χρησιμοποιούμε τις πληροφορίες σας',
  'We use the personal information we collect to: respond to enquiries and provide the information, quotes, or services you request; manage our customer and supplier relationships; operate, maintain, secure, and improve the Site; comply with our legal and regulatory obligations; and, where you have consented, send you marketing communications.':
    'Χρησιμοποιούμε τα προσωπικά δεδομένα που συλλέγουμε για να: ανταποκρινόμαστε σε αιτήματα και να παρέχουμε τις πληροφορίες, προσφορές ή υπηρεσίες που ζητάτε· διαχειριζόμαστε τις σχέσεις μας με πελάτες και προμηθευτές· λειτουργούμε, συντηρούμε, ασφαλίζουμε και βελτιώνουμε τον Ιστότοπο· συμμορφωνόμαστε με τις νομικές και κανονιστικές μας υποχρεώσεις· και, εφόσον έχετε συγκατατεθεί, σας αποστέλλουμε εμπορικές επικοινωνίες.',
  'We do not use your information for automated decision-making that produces legal or similarly significant effects on you.':
    'Δεν χρησιμοποιούμε τις πληροφορίες σας για αυτοματοποιημένη λήψη αποφάσεων που παράγει έννομα ή παρόμοιας σημασίας αποτελέσματα για εσάς.',

  // ── Privacy Policy — "Cookies and similar technologies" ───────────────────
  'Cookies and similar technologies': 'Cookies και παρόμοιες τεχνολογίες',
  'A cookie is a small text file placed on your device when you visit a website. Cookies allow the Site to recognise your device and remember information such as preferences and previous actions.':
    'Ένα cookie είναι ένα μικρό αρχείο κειμένου που τοποθετείται στη συσκευή σας όταν επισκέπτεστε έναν ιστότοπο. Τα cookies επιτρέπουν στον Ιστότοπο να αναγνωρίζει τη συσκευή σας και να θυμάται πληροφορίες όπως προτιμήσεις και προηγούμενες ενέργειες.',
  'We use the following categories of cookies:':
    'Χρησιμοποιούμε τις ακόλουθες κατηγορίες cookies:',
  'Strictly necessary cookies — required for the Site to function. These do not require your consent.':
    'Απολύτως απαραίτητα cookies — απαιτούνται για τη λειτουργία του Ιστότοπου. Αυτά δεν απαιτούν τη συγκατάθεσή σας.',
  'Analytics cookies — set by [ANALYTICS_PROVIDER] to help us understand how visitors use the Site. These are only set with your consent.':
    'Cookies αναλυτικών στοιχείων — ορίζονται από τον [ANALYTICS_PROVIDER] για να μας βοηθήσουν να κατανοήσουμε πώς οι επισκέπτες χρησιμοποιούν τον Ιστότοπο. Αυτά ορίζονται μόνο με τη συγκατάθεσή σας.',
  'You can accept or refuse non-essential cookies through the cookie banner shown on your first visit, and change your choice at any time via [COOKIE_PREFERENCES_LINK]. You can also block or delete cookies through your browser settings; note that some parts of the Site may not function correctly if you do so.':
    'Μπορείτε να αποδεχθείτε ή να αρνηθείτε τα μη απαραίτητα cookies μέσω του banner cookies που εμφανίζεται κατά την πρώτη σας επίσκεψη και να αλλάξετε την επιλογή σας ανά πάσα στιγμή μέσω του [COOKIE_PREFERENCES_LINK]. Μπορείτε επίσης να αποκλείσετε ή να διαγράψετε cookies μέσω των ρυθμίσεων του προγράμματος περιήγησής σας· σημειώστε ότι ορισμένα τμήματα του Ιστότοπου ενδέχεται να μην λειτουργούν σωστά εάν το πράξετε.',

  // ── Privacy Policy — "Who we share your information with" (list) ──────────
  'Who we share your information with': 'Με ποιους μοιραζόμαστε τις πληροφορίες σας',
  'We do not sell your personal information. We share it only with the following categories of recipients, and only to the extent necessary:':
    'Δεν πουλάμε τα προσωπικά σας δεδομένα. Τα κοινοποιούμε μόνο στις ακόλουθες κατηγορίες αποδεκτών και μόνο στον βαθμό που είναι απαραίτητο:',
  'Service providers acting as processors on our behalf — for example, our website hosting provider, email and CRM platforms, and analytics provider. Each is bound by a written contract to process your information only on our instructions.':
    'Πάροχοι υπηρεσιών που ενεργούν ως εκτελούντες την επεξεργασία για λογαριασμό μας — για παράδειγμα, ο πάροχος φιλοξενίας του ιστότοπού μας, οι πλατφόρμες email και CRM και ο πάροχος αναλυτικών στοιχείων. Καθένας δεσμεύεται με γραπτή σύμβαση να επεξεργάζεται τις πληροφορίες σας αποκλειστικά σύμφωνα με τις οδηγίες μας.',
  'Professional advisers — such as lawyers, auditors, and insurers, where required for the establishment, exercise, or defence of legal claims.':
    'Επαγγελματίες σύμβουλοι — όπως δικηγόροι, ελεγκτές και ασφαλιστές, όπου απαιτείται για τη θεμελίωση, άσκηση ή υπεράσπιση νομικών αξιώσεων.',
  'Competent public authorities — where we are required to disclose information by law, court order, or regulatory request.':
    'Αρμόδιες δημόσιες αρχές — όπου υποχρεούμαστε να γνωστοποιήσουμε πληροφορίες βάσει νόμου, δικαστικής απόφασης ή κανονιστικού αιτήματος.',
  'Successors in interest — in the event of a merger, acquisition, or reorganisation of our business, subject to appropriate confidentiality protections.':
    'Διάδοχοι — σε περίπτωση συγχώνευσης, εξαγοράς ή αναδιοργάνωσης της επιχείρησής μας, με την επιφύλαξη κατάλληλων μέτρων εμπιστευτικότητας.',

  // ── Privacy Policy — "International transfers" ────────────────────────────
  'International transfers': 'Διεθνείς διαβιβάσεις',
  'Your personal information is primarily processed within the European Economic Area (EEA). Where a service provider processes information outside the EEA, we rely on the European Commission’s Standard Contractual Clauses, an adequacy decision, or another transfer mechanism recognised under the GDPR. You can request a copy of the safeguards we use by writing to [DPO_EMAIL].':
    'Τα προσωπικά σας δεδομένα επεξεργάζονται κατά κύριο λόγο εντός του Ευρωπαϊκού Οικονομικού Χώρου (ΕΟΧ). Όπου ένας πάροχος υπηρεσιών επεξεργάζεται πληροφορίες εκτός του ΕΟΧ, στηριζόμαστε στις Τυποποιημένες Συμβατικές Ρήτρες της Ευρωπαϊκής Επιτροπής, σε απόφαση επάρκειας ή σε άλλο μηχανισμό διαβίβασης που αναγνωρίζεται βάσει του ΓΚΠΔ. Μπορείτε να ζητήσετε αντίγραφο των εγγυήσεων που χρησιμοποιούμε γράφοντας στο [DPO_EMAIL].',

  // ── Privacy Policy — "How long we keep your information" ──────────────────
  'How long we keep your information': 'Για πόσο χρόνο διατηρούμε τις πληροφορίες σας',
  'We keep personal information only for as long as necessary for the purposes set out in this Policy, or as required by law.':
    'Διατηρούμε τα προσωπικά δεδομένα μόνο για όσο διάστημα είναι απαραίτητο για τους σκοπούς που ορίζονται στην παρούσα Πολιτική ή όπως απαιτείται από τον νόμο.',
  'Enquiry and contact-form data: [ENQUIRY_RETENTION_PERIOD].\nCustomer and supplier records: for the duration of the relationship and for [COMMERCIAL_RECORDS_RETENTION_PERIOD] thereafter, in line with Cyprus tax and commercial law.\nWebsite server logs: [LOG_RETENTION_PERIOD].':
    'Δεδομένα αιτημάτων και φόρμας επικοινωνίας: [ENQUIRY_RETENTION_PERIOD].\nΑρχεία πελατών και προμηθευτών: για τη διάρκεια της σχέσης και για [COMMERCIAL_RECORDS_RETENTION_PERIOD] εν συνεχεία, σύμφωνα με την κυπριακή φορολογική και εμπορική νομοθεσία.\nΑρχεία καταγραφής διακομιστή ιστότοπου: [LOG_RETENTION_PERIOD].',
  'At the end of the applicable period, we securely delete or anonymise the information.':
    'Στο τέλος της ισχύουσας περιόδου, διαγράφουμε ή ανωνυμοποιούμε με ασφάλεια τις πληροφορίες.',

  // ── Privacy Policy — "Your rights under the GDPR" (list) ──────────────────
  'Your rights under the GDPR': 'Τα δικαιώματά σας βάσει του ΓΚΠΔ',
  'Subject to the conditions set out in the GDPR, you have the right to:':
    'Με την επιφύλαξη των προϋποθέσεων που ορίζονται στον ΓΚΠΔ, έχετε το δικαίωμα να:',
  'Access — request confirmation that we hold personal information about you, and a copy of it.':
    'Πρόσβαση — να ζητήσετε επιβεβαίωση ότι τηρούμε προσωπικά δεδομένα που σας αφορούν, καθώς και αντίγραφο αυτών.',
  'Rectification — ask us to correct inaccurate or incomplete information.':
    'Διόρθωση — να μας ζητήσετε να διορθώσουμε ανακριβείς ή ελλιπείς πληροφορίες.',
  'Erasure — ask us to delete your information where one of the GDPR grounds applies.':
    'Διαγραφή — να μας ζητήσετε να διαγράψουμε τις πληροφορίες σας όπου ισχύει ένας από τους λόγους του ΓΚΠΔ.',
  'Restriction — ask us to limit how we use your information in certain circumstances.':
    'Περιορισμό — να μας ζητήσετε να περιορίσουμε τον τρόπο με τον οποίο χρησιμοποιούμε τις πληροφορίες σας σε ορισμένες περιπτώσεις.',
  'Data portability — receive the information you provided to us in a structured, commonly used, machine-readable format, or have it sent to another controller.':
    'Φορητότητα δεδομένων — να λάβετε τις πληροφορίες που μας παρείχατε σε δομημένο, κοινώς χρησιμοποιούμενο και αναγνώσιμο από μηχανήματα μορφότυπο ή να τις διαβιβάσετε σε άλλον υπεύθυνο επεξεργασίας.',
  'Objection — object to processing based on our legitimate interests, including profiling, and to direct marketing at any time.':
    'Εναντίωση — να αντιταχθείτε στην επεξεργασία που βασίζεται στα έννομα συμφέροντά μας, συμπεριλαμβανομένης της κατάρτισης προφίλ, και στην απευθείας εμπορική προώθηση ανά πάσα στιγμή.',
  'Withdrawal of consent — where we rely on your consent, you may withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal.':
    'Ανάκληση συγκατάθεσης — όπου στηριζόμαστε στη συγκατάθεσή σας, μπορείτε να την ανακαλέσετε ανά πάσα στιγμή χωρίς να θίγεται η νομιμότητα της επεξεργασίας που πραγματοποιήθηκε πριν από την ανάκληση.',
  'Complaint — lodge a complaint with the Office of the Commissioner for Personal Data Protection of the Republic of Cyprus (commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy) or with the supervisory authority in your country of residence.':
    'Καταγγελία — να υποβάλετε καταγγελία στο Γραφείο της Επιτρόπου Προστασίας Δεδομένων Προσωπικού Χαρακτήρα της Κυπριακής Δημοκρατίας (commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy) ή στην εποπτική αρχή της χώρας διαμονής σας.',

  // ── Privacy Policy — "Security" ───────────────────────────────────────────
  Security: 'Ασφάλεια',
  'We use appropriate technical and organisational measures to protect personal information against unauthorised access, alteration, disclosure, or destruction. These include access controls, encryption in transit, secure hosting, and staff training. However, no method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.':
    'Χρησιμοποιούμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών δεδομένων από μη εξουσιοδοτημένη πρόσβαση, αλλοίωση, γνωστοποίηση ή καταστροφή. Σε αυτά περιλαμβάνονται έλεγχοι πρόσβασης, κρυπτογράφηση κατά τη μεταφορά, ασφαλής φιλοξενία και εκπαίδευση του προσωπικού. Ωστόσο, καμία μέθοδος μετάδοσης μέσω του διαδικτύου ή μέθοδος ηλεκτρονικής αποθήκευσης δεν είναι απολύτως ασφαλής και δεν μπορούμε να εγγυηθούμε απόλυτη ασφάλεια.',

  // ── Privacy Policy — "Children’s privacy" ─────────────────────────────────
  'Children’s privacy': 'Απόρρητο των παιδιών',
  'The Site is not directed at children, and we do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information, please contact [DPO_EMAIL] and we will take steps to delete it.':
    'Ο Ιστότοπος δεν απευθύνεται σε παιδιά και δεν συλλέγουμε εν γνώσει μας προσωπικά δεδομένα από παιδιά κάτω των 16 ετών. Εάν πιστεύετε ότι ένα παιδί μάς έχει παράσχει προσωπικά δεδομένα, παρακαλούμε επικοινωνήστε στο [DPO_EMAIL] και θα προβούμε σε ενέργειες για τη διαγραφή τους.',

  // ── Privacy Policy — "Links to third-party sites" ─────────────────────────
  'Links to third-party sites': 'Σύνδεσμοι προς ιστότοπους τρίτων',
  'The Site may contain links to websites operated by third parties. We are not responsible for the privacy practices or the content of those sites. We encourage you to read the privacy policy of every website you visit.':
    'Ο Ιστότοπος ενδέχεται να περιέχει συνδέσμους προς ιστότοπους που διαχειρίζονται τρίτοι. Δεν είμαστε υπεύθυνοι για τις πρακτικές απορρήτου ή το περιεχόμενο των ιστότοπων αυτών. Σας ενθαρρύνουμε να διαβάζετε την πολιτική απορρήτου κάθε ιστότοπου που επισκέπτεστε.',

  // ── Privacy Policy — "Changes to this policy" ─────────────────────────────
  'Changes to this policy': 'Αλλαγές στην παρούσα πολιτική',
  'We may update this Policy from time to time to reflect changes in our practices or in applicable law. The "Last updated" date at the top of this Policy indicates when it was most recently revised. Material changes will be brought to your attention through the Site or, where appropriate, by direct notice.':
    'Ενδέχεται να επικαιροποιούμε την παρούσα Πολιτική κατά διαστήματα ώστε να αντικατοπτρίζει αλλαγές στις πρακτικές μας ή στην ισχύουσα νομοθεσία. Η ημερομηνία «Τελευταία ενημέρωση» στην αρχή της παρούσας Πολιτικής υποδεικνύει πότε αναθεωρήθηκε πιο πρόσφατα. Ουσιώδεις αλλαγές θα τίθενται υπόψη σας μέσω του Ιστότοπου ή, όπου ενδείκνυται, με απευθείας ειδοποίηση.',

  // ── Privacy Policy — "Contact us" (heading already in shared via "Contact us") ──
  'If you have questions about this Policy or wish to exercise your rights, please contact our Data Protection Officer:':
    'Εάν έχετε ερωτήσεις σχετικά με την παρούσα Πολιτική ή επιθυμείτε να ασκήσετε τα δικαιώματά σας, παρακαλούμε επικοινωνήστε με τον Υπεύθυνο Προστασίας Δεδομένων μας:',
  'Elysée Irrigation Ltd — Data Protection Officer\n[REGISTERED_OFFICE_ADDRESS], Cyprus\nEmail: [DPO_EMAIL]\nTelephone: [DPO_PHONE]':
    'Elysée Irrigation Ltd — Υπεύθυνος Προστασίας Δεδομένων\n[REGISTERED_OFFICE_ADDRESS], Κύπρος\nEmail: [DPO_EMAIL]\nΤηλέφωνο: [DPO_PHONE]',
  'You also have the right to lodge a complaint with the Office of the Commissioner for Personal Data Protection of the Republic of Cyprus — commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy.':
    'Έχετε επίσης το δικαίωμα να υποβάλετε καταγγελία στο Γραφείο της Επιτρόπου Προστασίας Δεδομένων Προσωπικού Χαρακτήρα της Κυπριακής Δημοκρατίας — commissioner@dataprotection.gov.cy, www.dataprotection.gov.cy.',

  // ── Terms of Usage — hero + section heading ───────────────────────────────
  'Terms of Usage': 'Όροι Χρήσης',
  'The information appearing on this Web site is provided in good faith. Every attempt has been taken by Elysée Irrigation employees to ensure its accuracy.':
    'Οι πληροφορίες που εμφανίζονται σε αυτόν τον ιστότοπο παρέχονται καλόπιστα. Έχει καταβληθεί κάθε προσπάθεια από τους εργαζομένους της Elysée Irrigation για τη διασφάλιση της ακρίβειάς τους.',
  'However, neither Elysée Irrigation nor any of its directors or employees gives any representation or warranty as to the reliability, accuracy or completeness of the information, nor do they accept any responsibility arising in any way (including negligence) for errors in, or omissions from, the information.':
    'Ωστόσο, ούτε η Elysée Irrigation ούτε κάποιος από τους διευθυντές ή τους εργαζομένους της παρέχει οποιαδήποτε δήλωση ή εγγύηση ως προς την αξιοπιστία, την ακρίβεια ή την πληρότητα των πληροφοριών, ούτε αναλαμβάνει οποιαδήποτε ευθύνη που προκύπτει με οποιονδήποτε τρόπο (συμπεριλαμβανομένης της αμέλειας) για σφάλματα ή παραλείψεις στις πληροφορίες.',
  'All content is copyright 2013 and any reproduction without the prior consent of Elysée Irrigation is prohibited.':
    'Όλο το περιεχόμενο προστατεύεται με δικαιώματα πνευματικής ιδιοκτησίας 2013 και οποιαδήποτε αναπαραγωγή χωρίς την προηγούμενη συγκατάθεση της Elysée Irrigation απαγορεύεται.',

  // ── Terms of Supply — section headings ────────────────────────────────────
  '1. Application': '1. Εφαρμογή',
  '2. Orders, prices and quotations': '2. Παραγγελίες, τιμές και προσφορές',
  '3. Delivery and risk': '3. Παράδοση και κίνδυνος',
  '4. Payment': '4. Πληρωμή',
  '5. Inspection and claims': '5. Επιθεώρηση και αξιώσεις',
  '6. Warranty': '6. Εγγύηση',
  '7. Limitation of liability': '7. Περιορισμός ευθύνης',
  '8. Compliance and export control': '8. Συμμόρφωση και έλεγχος εξαγωγών',
  '9. Governing law and jurisdiction': '9. Εφαρμοστέο δίκαιο και δικαιοδοσία',
  '10. Updates to these Terms': '10. Επικαιροποιήσεις των παρόντων Όρων',

  // ── Terms of Supply — section bodies (single paragraph each) ──────────────
  'These Terms of Supply ("Terms") govern every quotation, order and supply of products manufactured or distributed by Elysée Group and its subsidiaries (collectively, "Elysée"). Acceptance of a quotation or placement of an order constitutes acceptance of these Terms in full. Any terms proposed by the customer that conflict with these Terms are excluded unless expressly agreed in writing by an authorised representative of Elysée.':
    'Οι παρόντες Όροι Προμήθειας («Όροι») διέπουν κάθε προσφορά, παραγγελία και προμήθεια προϊόντων που κατασκευάζονται ή διανέμονται από τον Όμιλο Elysée και τις θυγατρικές του (από κοινού, «Elysée»). Η αποδοχή προσφοράς ή η υποβολή παραγγελίας συνιστά πλήρη αποδοχή των παρόντων Όρων. Οποιοιδήποτε όροι που προτείνονται από τον πελάτη και έρχονται σε σύγκρουση με τους παρόντες Όρους αποκλείονται, εκτός εάν συμφωνηθεί ρητώς εγγράφως από εξουσιοδοτημένο εκπρόσωπο της Elysée.',
  'Prices in published price lists and on the Elysée Web site are indicative and may be revised without notice. Binding prices are those stated in a written quotation issued by Elysée. Quotations remain valid for thirty (30) days unless a different validity is stated. Orders are accepted only on confirmation of stock availability and credit terms.':
    'Οι τιμές στους δημοσιευμένους τιμοκαταλόγους και στον ιστότοπο της Elysée είναι ενδεικτικές και ενδέχεται να αναθεωρηθούν χωρίς προειδοποίηση. Δεσμευτικές είναι οι τιμές που αναγράφονται σε γραπτή προσφορά που εκδίδεται από την Elysée. Οι προσφορές παραμένουν σε ισχύ για τριάντα (30) ημέρες, εκτός εάν δηλώνεται διαφορετική διάρκεια ισχύος. Οι παραγγελίες γίνονται δεκτές μόνο κατόπιν επιβεβαίωσης της διαθεσιμότητας αποθέματος και των όρων πίστωσης.',
  'Unless otherwise agreed, deliveries are made on an Ex Works (EXW Ergates, Cyprus) basis per Incoterms 2020. Title passes to the customer on full payment of the invoice; risk passes at the point of delivery or collection. Delivery dates are estimates and are not of the essence of the contract. Elysée is not liable for delays caused by events outside its reasonable control.':
    'Εκτός εάν συμφωνηθεί διαφορετικά, οι παραδόσεις πραγματοποιούνται σε βάση Ex Works (EXW Ergates, Κύπρος) σύμφωνα με τους Incoterms 2020. Η κυριότητα μεταβιβάζεται στον πελάτη με την πλήρη εξόφληση του τιμολογίου· ο κίνδυνος μεταβιβάζεται στο σημείο παράδοσης ή παραλαβής. Οι ημερομηνίες παράδοσης είναι εκτιμήσεις και δεν αποτελούν ουσιώδη όρο της σύμβασης. Η Elysée δεν ευθύνεται για καθυστερήσεις που προκαλούνται από γεγονότα εκτός του εύλογου ελέγχου της.',
  'Payment terms are stated on each invoice. Unless otherwise agreed in writing, invoices are payable within thirty (30) days from the invoice date. Overdue amounts accrue interest at the statutory commercial rate. Elysée reserves the right to suspend further deliveries while any invoice is overdue.':
    'Οι όροι πληρωμής αναγράφονται σε κάθε τιμολόγιο. Εκτός εάν συμφωνηθεί διαφορετικά εγγράφως, τα τιμολόγια είναι πληρωτέα εντός τριάντα (30) ημερών από την ημερομηνία του τιμολογίου. Τα ληξιπρόθεσμα ποσά επιβαρύνονται με τόκο με το νόμιμο εμπορικό επιτόκιο. Η Elysée διατηρεί το δικαίωμα να αναστείλει περαιτέρω παραδόσεις ενόσω οποιοδήποτε τιμολόγιο είναι ληξιπρόθεσμο.',
  'The customer must inspect products on receipt. Visible damage, shortages or non-conforming items must be notified to Elysée in writing within seven (7) days of delivery, with photographic evidence where applicable. Latent defects must be notified within thirty (30) days of discovery. Claims raised outside these periods will not be accepted.':
    'Ο πελάτης οφείλει να επιθεωρεί τα προϊόντα κατά την παραλαβή. Εμφανείς ζημίες, ελλείψεις ή μη συμμορφούμενα είδη πρέπει να γνωστοποιούνται στην Elysée εγγράφως εντός επτά (7) ημερών από την παράδοση, με φωτογραφικά αποδεικτικά στοιχεία όπου είναι εφικτό. Κρυφά ελαττώματα πρέπει να γνωστοποιούνται εντός τριάντα (30) ημερών από την ανακάλυψή τους. Αξιώσεις που εγείρονται εκτός των περιόδων αυτών δεν θα γίνονται δεκτές.',
  'Elysée warrants that products supplied conform to the published technical specifications at the point of delivery and are free from defects in materials and workmanship under normal use. The warranty period for piping and fitting products is twenty-four (24) months from delivery unless an extended period is stated in the product documentation. The warranty is limited, at Elysée\'s option, to the repair, replacement or refund of the affected products. Installation, handling outside the published guidelines, modification, or use outside the rated pressure, temperature or chemical envelope voids the warranty.':
    'Η Elysée εγγυάται ότι τα προμηθευόμενα προϊόντα συμμορφώνονται με τις δημοσιευμένες τεχνικές προδιαγραφές κατά το σημείο παράδοσης και είναι απαλλαγμένα από ελαττώματα υλικών και κατασκευής υπό κανονική χρήση. Η περίοδος εγγύησης για προϊόντα σωληνώσεων και εξαρτημάτων είναι είκοσι τέσσερις (24) μήνες από την παράδοση, εκτός εάν αναφέρεται παρατεταμένη περίοδος στην τεκμηρίωση του προϊόντος. Η εγγύηση περιορίζεται, κατ’ επιλογή της Elysée, στην επισκευή, αντικατάσταση ή επιστροφή του τιμήματος των προϊόντων που επηρεάζονται. Η εγκατάσταση, ο χειρισμός εκτός των δημοσιευμένων κατευθυντήριων οδηγιών, η τροποποίηση ή η χρήση εκτός της ονομαστικής πίεσης, θερμοκρασίας ή χημικού περιβάλλοντος ακυρώνει την εγγύηση.',
  'Elysée\'s aggregate liability under or in connection with a contract of supply is limited to the invoice value of the affected products. Elysée is not liable for any indirect, incidental, consequential, special or punitive damages, including loss of profit, loss of business, loss of data or downstream installation costs. Nothing in these Terms limits liability for fraud, death or personal injury caused by negligence, or any other liability that cannot be limited under applicable law.':
    'Η συνολική ευθύνη της Elysée βάσει ή σε σχέση με σύμβαση προμήθειας περιορίζεται στην αξία τιμολογίου των προϊόντων που επηρεάζονται. Η Elysée δεν ευθύνεται για οποιαδήποτε έμμεση, παρεπόμενη, αποθετική, ειδική ή τιμωρητική ζημία, συμπεριλαμβανομένης της απώλειας κέρδους, της απώλειας επιχειρηματικής δραστηριότητας, της απώλειας δεδομένων ή του κόστους εγκατάστασης σε μεταγενέστερο στάδιο. Κανένα σημείο των παρόντων Όρων δεν περιορίζει την ευθύνη για απάτη, θάνατο ή σωματική βλάβη που προκαλείται από αμέλεια, ή οποιαδήποτε άλλη ευθύνη που δεν μπορεί να περιοριστεί βάσει της ισχύουσας νομοθεσίας.',
  'The customer is responsible for ensuring that the use, import and re-export of the products complies with all applicable laws and regulations, including EU dual-use export controls, sanctions and end-user restrictions. The customer warrants that it will not knowingly resell or re-export the products to any sanctioned destination or restricted end-user.':
    'Ο πελάτης είναι υπεύθυνος να διασφαλίζει ότι η χρήση, η εισαγωγή και η επανεξαγωγή των προϊόντων συμμορφώνεται με όλους τους ισχύοντες νόμους και κανονισμούς, συμπεριλαμβανομένων των ελέγχων εξαγωγών διπλής χρήσης της ΕΕ, των κυρώσεων και των περιορισμών τελικού χρήστη. Ο πελάτης εγγυάται ότι δεν θα μεταπωλήσει ή επανεξαγάγει εν γνώσει του τα προϊόντα σε οποιονδήποτε προορισμό υπό κυρώσεις ή σε περιορισμένο τελικό χρήστη.',
  'These Terms and any contract of supply formed under them are governed by the laws of the Republic of Cyprus, without regard to its conflict-of-laws rules. The courts of Nicosia, Cyprus have exclusive jurisdiction over any dispute, except that Elysée may bring proceedings in the courts of the customer\'s place of business where necessary to enforce its rights.':
    'Οι παρόντες Όροι και οποιαδήποτε σύμβαση προμήθειας που συνάπτεται βάσει αυτών διέπονται από τους νόμους της Κυπριακής Δημοκρατίας, χωρίς αναφορά στους κανόνες της περί σύγκρουσης δικαίων. Τα δικαστήρια της Λευκωσίας, Κύπρος, έχουν αποκλειστική δικαιοδοσία επί οποιασδήποτε διαφοράς, εκτός του ότι η Elysée δύναται να κινήσει διαδικασίες ενώπιον των δικαστηρίων του τόπου επιχειρηματικής δραστηριότητας του πελάτη όπου είναι αναγκαίο για την προάσπιση των δικαιωμάτων της.',
  'Elysée may update these Terms from time to time. The version in force at the date of order acceptance applies to that order. The current version is always published at this URL.':
    'Η Elysée ενδέχεται να επικαιροποιεί τους παρόντες Όρους κατά διαστήματα. Η έκδοση που ισχύει κατά την ημερομηνία αποδοχής της παραγγελίας εφαρμόζεται στη συγκεκριμένη παραγγελία. Η τρέχουσα έκδοση δημοσιεύεται πάντοτε σε αυτή τη διεύθυνση URL.',
};
