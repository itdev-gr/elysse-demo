// Our Services section — agriculture, landscape, building & infrastructure,
// industry. Keyed by the English source string. Service names/headlines
// ('Agriculture', 'Landscape', 'Building & Infrastructure', 'Industry') and the
// 'Our Services' eyebrow live in home.ts / shared.ts and are reused — not re-added.
export const services: Record<string, string> = {
  // Sidebar nav (aria-label)
  'Services': 'Υπηρεσίες',

  // Hero sub-headlines (Hero.astro auto-translates eyebrow/headline/sub)
  'A reliable supplier of irrigation systems from the pump to the plant. Main, sub-main and laterals.':
    'Αξιόπιστος προμηθευτής συστημάτων άρδευσης από την αντλία έως το φυτό. Κεντρικοί, δευτερεύοντες και πλευρικοί αγωγοί.',
  'Specialist support for parks, campuses, and grounds — irrigation, turf, and ongoing care.':
    'Εξειδικευμένη υποστήριξη για πάρκα, εγκαταστάσεις και χώρους πρασίνου — άρδευση, χλοοτάπητας και διαρκής συντήρηση.',
  'Pipe and fitting systems for water supply, sewerage and drainage on construction projects of every scale.':
    'Συστήματα σωλήνων και εξαρτημάτων για ύδρευση, αποχέτευση και αποστράγγιση σε κατασκευαστικά έργα κάθε κλίμακας.',
  'Industrial-grade plastic piping, valves, and fittings engineered for plant uptime and regulatory compliance.':
    'Πλαστικοί σωλήνες, βάνες και εξαρτήματα βιομηχανικής κλάσης, σχεδιασμένα για τη συνεχή λειτουργία της εγκατάστασης και τη συμμόρφωση με τους κανονισμούς.',

  // --- Section content (rendered via the shared SectionRenderer — see report) ---

  // Agriculture
  'Built for the field': 'Φτιαγμένο για το χωράφι',
  "With a low environmental impact and a high return with regards to crop yield and water saving, Elysée's world-class products bring innovative and efficient solutions that can be tailored to your specific requirements. Reliable, consistent water flow from products that are durable and easy to install, brings measurable results with a system that has in-built longevity and low maintenance requirements. Elysée solutions are ideal for open-field farming such as crop rows and orchards, greenhouses, glasshouses, nurseries, and more.":
    'Με χαμηλό περιβαλλοντικό αποτύπωμα και υψηλή απόδοση όσον αφορά την παραγωγή των καλλιεργειών και την εξοικονόμηση νερού, τα παγκόσμιας κλάσης προϊόντα της Elysée προσφέρουν καινοτόμες και αποδοτικές λύσεις που μπορούν να προσαρμοστούν στις δικές σας απαιτήσεις. Η αξιόπιστη και σταθερή ροή νερού από προϊόντα ανθεκτικά και εύκολα στην εγκατάσταση αποφέρει μετρήσιμα αποτελέσματα, με ένα σύστημα που έχει ενσωματωμένη μακροζωία και χαμηλές απαιτήσεις συντήρησης. Οι λύσεις της Elysée είναι ιδανικές για καλλιέργειες ανοιχτού αγρού, όπως σειρές φυτών και οπωρώνες, θερμοκήπια, γυάλινα θερμοκήπια, φυτώρια και άλλα.',
  'Star products': 'Κορυφαία προϊόντα',

  // Landscape
  'Designed for outdoor environments': 'Σχεδιασμένα για υπαίθριους χώρους',
  'Elysée supplies the irrigation, turf, and water-management products that keep parks, campuses, sports facilities, and private grounds at their best. Our range covers micro-irrigation, sprinklers, control valves, and the pipework that ties it all together.':
    'Η Elysée προμηθεύει τα προϊόντα άρδευσης, χλοοτάπητα και διαχείρισης νερού που διατηρούν πάρκα, εγκαταστάσεις, αθλητικές υποδομές και ιδιωτικούς χώρους στην καλύτερη κατάστασή τους. Η γκάμα μας καλύπτει τη μικροάρδευση, τους εκτοξευτήρες, τις βαλβίδες ελέγχου και τη σωλήνωση που τα συνδέει όλα μεταξύ τους.',
  'Specialist support, season after season': 'Εξειδικευμένη υποστήριξη, εποχή με την εποχή',
  'From large public-works contracts to private estates, our team works alongside contractors and groundskeepers to plan irrigation, soil conditioning, and seasonal care programmes that match local climate and site conditions.':
    'Από μεγάλες συμβάσεις δημοσίων έργων έως ιδιωτικά κτήματα, η ομάδα μας συνεργάζεται με εργολάβους και υπεύθυνους συντήρησης για τον σχεδιασμό προγραμμάτων άρδευσης, βελτίωσης του εδάφους και εποχικής φροντίδας που ταιριάζουν στο τοπικό κλίμα και τις συνθήκες του χώρου.',

  // Building & Infrastructure
  'Pipe systems for the build': 'Συστήματα σωλήνων για την κατασκευή',
  'Polyethylene pipes, PVC pressure pipes, fittings, valves, and drainage solutions for water supply, sewerage, and infrastructure projects. Our products are certified to the most demanding European standards and proven across 40+ years of use in the field.':
    'Σωλήνες πολυαιθυλενίου, σωλήνες πίεσης PVC, εξαρτήματα, βάνες και λύσεις αποστράγγισης για έργα ύδρευσης, αποχέτευσης και υποδομών. Τα προϊόντα μας είναι πιστοποιημένα σύμφωνα με τα πιο απαιτητικά ευρωπαϊκά πρότυπα και έχουν αποδειχθεί σε πάνω από 40 χρόνια χρήσης στο πεδίο.',
  'Long-term partnership on the project': 'Μακροχρόνια συνεργασία στο έργο',
  'From private developers to public-works programmes, we work alongside engineering teams to specify the right products for each site, recommend installation best practices, and stay engaged through commissioning.':
    'Από ιδιώτες κατασκευαστές έως προγράμματα δημοσίων έργων, συνεργαζόμαστε με τις ομάδες μηχανικών για να καθορίσουμε τα κατάλληλα προϊόντα για κάθε χώρο, να προτείνουμε βέλτιστες πρακτικές εγκατάστασης και να παραμένουμε ενεργοί έως τη θέση σε λειτουργία.',

  // Industry
  'Industrial-grade piping': 'Σωληνώσεις βιομηχανικής κλάσης',
  'Plastic pipes, fittings, and valves engineered for industrial uptime — including cable applications, network drainage, and building sewerage systems. Our products meet ISO 9001 quality standards and carry DVGW, KIWA, WRAS, SII, and OVGW certifications where applicable.':
    'Πλαστικοί σωλήνες, εξαρτήματα και βάνες σχεδιασμένα για τη συνεχή βιομηχανική λειτουργία — συμπεριλαμβανομένων εφαρμογών καλωδίων, αποστράγγισης δικτύων και συστημάτων αποχέτευσης κτιρίων. Τα προϊόντα μας πληρούν τα πρότυπα ποιότητας ISO 9001 και φέρουν πιστοποιήσεις DVGW, KIWA, WRAS, SII και OVGW όπου εφαρμόζεται.',
  'Continuity for plant operations': 'Συνέχεια στη λειτουργία της εγκατάστασης',
  'Industrial customers value continuity. We invest in operational knowledge to recommend the right products, anticipate maintenance cycles, and respond quickly when plans change.':
    'Οι βιομηχανικοί πελάτες εκτιμούν τη συνέχεια. Επενδύουμε στη λειτουργική γνώση ώστε να προτείνουμε τα κατάλληλα προϊόντα, να προβλέπουμε τους κύκλους συντήρησης και να ανταποκρινόμαστε γρήγορα όταν τα σχέδια αλλάζουν.',

  // Shared section CTA
  'View the product catalogue': 'Δείτε τον κατάλογο προϊόντων',
};
