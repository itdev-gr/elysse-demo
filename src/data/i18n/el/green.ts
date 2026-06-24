// English UI/prose string → Greek for the Green Elysée section
// (/green-elysee/, /certifications/, /reports/, /insights/). Keyed by the
// English source text. Brand names ("Green Elysée", "Elysée"), certification
// acronyms, report/eBook titles & filenames, dates and numeric stats stay
// untranslated. Strings already in shared.ts are not repeated here.
export const green: Record<string, string> = {
  // ===== Eyebrow descriptors (bare-text runs beside the brand eyebrow) =====
  ' · About the programme': ' · Σχετικά με το πρόγραμμα',
  ' · Independently audited': ' · Ανεξάρτητα ελεγμένο',
  ' · Annual reporting': ' · Ετήσια αναφορά',

  // ===== index.astro (About the programme) =====
  'As Green as it gets.': 'Όσο πιο πράσινο γίνεται.',
  'Committed to protecting the earth in every possible way — with effective, sustainable, innovative, and smart piping and fitting systems.':
    'Δεσμευμένοι να προστατεύουμε τη γη με κάθε δυνατό τρόπο — με αποτελεσματικά, βιώσιμα, καινοτόμα και έξυπνα συστήματα σωληνώσεων και εξαρτημάτων.',
  'Streaming water, streaming life': 'Ρέει το νερό, ρέει η ζωή',

  // Stat band — index
  'The programme at a glance': 'Το πρόγραμμα με μια ματιά',
  'Journey started': 'Ξεκίνημα της πορείας',
  'Year strategy': 'Στρατηγική ετών',
  'Strategic pillars': 'Στρατηγικοί πυλώνες',
  'Vision50 target': 'Στόχος Vision50',

  // Editorial intro — index
  'Why we go green': 'Γιατί γινόμαστε πράσινοι',
  'Committed to the earth.': 'Δεσμευμένοι στη γη.',
  'Business-driven innovation, green thinking, and continuous improvement — with the smallest possible carbon footprint.':
    'Καινοτομία με γνώμονα την επιχείρηση, πράσινη σκέψη και συνεχής βελτίωση — με το μικρότερο δυνατό αποτύπωμα άνθρακα.',

  // Strategy50 section — index
  'Ten years. Six pillars. One vision.':
    'Δέκα χρόνια. Έξι πυλώνες. Ένα όραμα.',

  // Explore the programme — index (inline tiles + headings)
  'Go deeper': 'Εμβαθύνετε',
  'Explore the Green programme.': 'Εξερευνήστε το πράσινο πρόγραμμα.',
  'Six independently audited standards — every certificate downloadable as a PDF.':
    'Έξι ανεξάρτητα ελεγμένα πρότυπα — κάθε πιστοποιητικό διαθέσιμο για λήψη σε μορφή PDF.',
  'Annual environmental reports and the yearly report library, free to read.':
    'Ετήσιες περιβαλλοντικές εκθέσεις και η βιβλιοθήκη ετήσιων εκθέσεων, ελεύθερα προς ανάγνωση.',
  'Stories and articles from the journey to becoming a Green leader.':
    'Ιστορίες και άρθρα από την πορεία προς το να γίνουμε πράσινος ηγέτης.',
  'Visit page': 'Επισκεφθείτε τη σελίδα',

  // Closing CTA — index
  'Talk to the Green team': 'Μιλήστε με την πράσινη ομάδα',
  'Questions about the Green Elysée programme, our strategic pillars, or how our circular products can support your project? The team is happy to talk.':
    'Έχετε ερωτήσεις για το πρόγραμμα Green Elysée, τους στρατηγικούς μας πυλώνες ή για το πώς τα κυκλικά μας προϊόντα μπορούν να υποστηρίξουν το έργο σας; Η ομάδα μας είναι στη διάθεσή σας.',
  'See our green certifications': 'Δείτε τις πράσινες πιστοποιήσεις μας',
  'Contact our local network': 'Επικοινωνήστε με το τοπικό μας δίκτυο',

  // ===== Data-driven prose (src/data/site-content.ts → greenElyseeAbout) =====
  "One of Elysée's main concerns is the protection of the environment, hence, we always strive to minimize our Carbon Footprint. We are committed to protecting the earth in every possible way, making it a better place to live, while maintaining our business-driven innovation, green thinking, and continuous improvement. For this reason, we wish to pave the road for becoming a leading green company, with effective, sustainable, innovative, and smart piping and fitting systems.":
    'Μία από τις κύριες προτεραιότητες της Elysée είναι η προστασία του περιβάλλοντος· γι’ αυτό προσπαθούμε πάντα να ελαχιστοποιούμε το αποτύπωμα άνθρακα. Είμαστε δεσμευμένοι να προστατεύουμε τη γη με κάθε δυνατό τρόπο, κάνοντάς την ένα καλύτερο μέρος για να ζούμε, διατηρώντας παράλληλα την καινοτομία με γνώμονα την επιχείρηση, την πράσινη σκέψη και τη συνεχή βελτίωση. Για τον λόγο αυτό, επιθυμούμε να ανοίξουμε τον δρόμο ώστε να γίνουμε μια κορυφαία πράσινη εταιρεία, με αποτελεσματικά, βιώσιμα, καινοτόμα και έξυπνα συστήματα σωληνώσεων και εξαρτημάτων.',
  'Here at Elysée, we acknowledge both the benefits and the challenges that leading a green company comes with, and we still remain fully committed to sustainability. Our tag-line "streaming water streaming life" synopsizes perfectly the organization\'s beliefs and culture. It is not just a phrase; it is the foundation of all principles and strategies that define Elysée.':
    'Εδώ στην Elysée, αναγνωρίζουμε τόσο τα οφέλη όσο και τις προκλήσεις που συνεπάγεται η διοίκηση μιας πράσινης εταιρείας, και παραμένουμε πλήρως δεσμευμένοι στη βιωσιμότητα. Το σύνθημά μας «ρέει το νερό, ρέει η ζωή» συνοψίζει τέλεια τις πεποιθήσεις και την κουλτούρα του οργανισμού. Δεν είναι απλώς μια φράση· είναι το θεμέλιο όλων των αρχών και στρατηγικών που ορίζουν την Elysée.',
  'Vision': 'Όραμα',
  'Be a Green Leader Worldwide through Innovative, Smart, Easy-to-Use piping systems.':
    'Να γίνουμε πράσινος ηγέτης παγκοσμίως μέσα από καινοτόμα, έξυπνα και εύχρηστα συστήματα σωληνώσεων.',
  "Elysée acknowledges that businesses have a tremendous impact to climate change and can help in the fight against it. For this reason, we are setting a strategic approach to help us ultimately lead the way to a circular economy model, a testimony of our commitment to quality, towards the fulfillment of our goals for sustainability.":
    'Η Elysée αναγνωρίζει ότι οι επιχειρήσεις έχουν τεράστια επίδραση στην κλιματική αλλαγή και μπορούν να συμβάλουν στην αντιμετώπισή της. Για τον λόγο αυτό, υιοθετούμε μια στρατηγική προσέγγιση που θα μας οδηγήσει τελικά στο μοντέλο της κυκλικής οικονομίας, ως απόδειξη της δέσμευσής μας στην ποιότητα, προς την επίτευξη των στόχων μας για τη βιωσιμότητα.',
  "Elysée has set a 10-year strategy that delineates the way we aim to achieve our vision50 by 2029, when the company will turn 50 years old. This strategy encompasses the company's set of actions which are grouped in 6 strategic directions or Pillars. Each one of the six Strategic Pillars is further broken down to discrete projects while each project has a specific aim and timeframe. One of the strategic pillars, #4 Green Elysée, is illustrative of the aspiration to be a Green Leader in the industry.":
    'Η Elysée έχει θεσπίσει μια 10ετή στρατηγική που περιγράφει τον τρόπο με τον οποίο στοχεύουμε να επιτύχουμε το vision50 έως το 2029, όταν η εταιρεία θα συμπληρώσει 50 χρόνια. Η στρατηγική αυτή περιλαμβάνει το σύνολο των δράσεων της εταιρείας, οι οποίες ομαδοποιούνται σε 6 στρατηγικές κατευθύνσεις ή Πυλώνες. Καθένας από τους έξι Στρατηγικούς Πυλώνες αναλύεται περαιτέρω σε επιμέρους έργα, ενώ κάθε έργο έχει συγκεκριμένο στόχο και χρονοδιάγραμμα. Ένας από τους στρατηγικούς πυλώνες, ο #4 Green Elysée, αντικατοπτρίζει τη φιλοδοξία μας να γίνουμε πράσινος ηγέτης στον κλάδο.',

  // Pillars — index
  'Green Economy Pillar 4 — six strategic components:':
    'Πυλώνας 4 Πράσινης Οικονομίας — έξι στρατηγικά συστατικά:',
  'Carbon Footprint': 'Αποτύπωμα Άνθρακα',
  'Quantifying our environmental impact.':
    'Ποσοτικοποίηση του περιβαλλοντικού μας αποτυπώματος.',
  'Green Energy': 'Πράσινη Ενέργεια',
  'Investing in renewable energy and significantly reducing the energy intensity of our production facilities.':
    'Επενδύουμε σε ανανεώσιμες πηγές ενέργειας και μειώνουμε σημαντικά την ενεργειακή ένταση των παραγωγικών μας εγκαταστάσεων.',
  'Zero Waste': 'Μηδενικά Απόβλητα',
  'Achieving Zero-waste-to-landfill as well as diverting piping waste from landfills.':
    'Επίτευξη μηδενικών αποβλήτων προς υγειονομική ταφή, καθώς και εκτροπή των αποβλήτων σωληνώσεων από τους χώρους ταφής.',
  'Circular Economy': 'Κυκλική Οικονομία',
  'Philosophy, initiatives, and Green thinking.':
    'Φιλοσοφία, πρωτοβουλίες και πράσινη σκέψη.',
  'Green Circular Products & Technologies': 'Πράσινα Κυκλικά Προϊόντα & Τεχνολογίες',
  'High quality, safe, and innovative products, particularly circular products and technologies of circularity.':
    'Προϊόντα υψηλής ποιότητας, ασφαλή και καινοτόμα, ιδίως κυκλικά προϊόντα και τεχνολογίες κυκλικότητας.',
  'Green Policy': 'Πράσινη Πολιτική',
  'Investing in emissions-offsetting projects.':
    'Επενδύσεις σε έργα αντιστάθμισης εκπομπών.',

  // ===== certifications/index.astro =====
  'Green, by certificate.': 'Πράσινο, με πιστοποιητικό.',
  ' certified standards': ' πιστοποιημένα πρότυπα',
  'The Green programme': 'Το πράσινο πρόγραμμα',
  'Green certifications': 'Πράσινες πιστοποιήσεις',
  'Standard families': 'Οικογένειες προτύπων',
  'Latest declaration': 'Τελευταία δήλωση',
  'Audit cadence': 'Συχνότητα ελέγχου',
  'Why certificates matter': 'Γιατί έχουν σημασία τα πιστοποιητικά',
  'Audited, not asserted.': 'Ελεγμένα, όχι απλώς δηλωμένα.',
  'Every green claim Elysée makes is backed by a third-party audit and a downloadable certificate.':
    'Κάθε πράσινος ισχυρισμός της Elysée τεκμηριώνεται από ανεξάρτητο έλεγχο και ένα πιστοποιητικό διαθέσιμο για λήψη.',
  'As Green as it gets': 'Όσο πιο πράσινο γίνεται',
  'Streaming water, streaming life.': 'Ρέει το νερό, ρέει η ζωή.',
  'Our Green Certifications': 'Οι πράσινες πιστοποιήσεις μας',
  ' standards. ': ' πρότυπα. ',
  ' PDFs.': ' αρχεία PDF.',
  'Tap any badge below to download the current certificate.':
    'Πατήστε οποιοδήποτε σήμα παρακάτω για να κατεβάσετε το τρέχον πιστοποιητικό.',
  'Need an older certificate, a tender-ready bundle, or evidence for a specific product family? Our team can prepare it on request.':
    'Χρειάζεστε παλαιότερο πιστοποιητικό, πακέτο έτοιμο για διαγωνισμό ή αποδεικτικά για συγκεκριμένη οικογένεια προϊόντων; Η ομάδα μας μπορεί να το ετοιμάσει κατόπιν αιτήματος.',

  // certifications — data-driven intro prose
  'Elysée proudly holds internationally recognized certificates, a testimony of commitment to drive life in a Green future, and its efforts to be as Green as it gets in all of its operations.':
    'Η Elysée κατέχει με υπερηφάνεια διεθνώς αναγνωρισμένα πιστοποιητικά, απόδειξη της δέσμευσής της να οδηγεί τη ζωή σε ένα πράσινο μέλλον και των προσπαθειών της να είναι όσο πιο πράσινη γίνεται σε όλες τις δραστηριότητές της.',
  'Six independently audited standards cover the full Green Elysée programme — environmental management, energy, sustainability of raw materials, greenhouse-gas accounting, and the annual public Environmental Declaration. Every certificate is downloadable below.':
    'Έξι ανεξάρτητα ελεγμένα πρότυπα καλύπτουν ολόκληρο το πρόγραμμα Green Elysée — περιβαλλοντική διαχείριση, ενέργεια, βιωσιμότητα πρώτων υλών, λογιστική αερίων θερμοκηπίου και την ετήσια δημόσια Περιβαλλοντική Δήλωση. Κάθε πιστοποιητικό είναι διαθέσιμο για λήψη παρακάτω.',
  'Committed to drive life in a Green future.':
    'Δεσμευμένοι να οδηγούμε τη ζωή σε ένα πράσινο μέλλον.',

  // ===== reports/index.astro =====
  'Reports & eBooks.': 'Εκθέσεις & eBooks.',
  'Read the latest disclosures': 'Διαβάστε τις τελευταίες δημοσιοποιήσεις',
  'Disclosures at a glance': 'Οι δημοσιοποιήσεις με μια ματιά',
  'Latest report': 'Τελευταία έκθεση',
  'Strategic pillars covered': 'Καλυπτόμενοι στρατηγικοί πυλώνες',
  'Free to download': 'Δωρεάν λήψη',
  'Publication cadence': 'Συχνότητα δημοσίευσης',
  'Why we publish': 'Γιατί δημοσιεύουμε',
  'Transparency, by document.': 'Διαφάνεια, με έγγραφο.',
  'Public reports, downloadable PDFs, year-on-year comparable disclosures.':
    'Δημόσιες εκθέσεις, λήψη αρχείων PDF, συγκρίσιμες δημοσιοποιήσεις από έτος σε έτος.',
  'Environmental Reports': 'Περιβαλλοντικές Εκθέσεις',
  'The Environmental Report.': 'Η Περιβαλλοντική Έκθεση.',
  'Yearly Report library.': 'Βιβλιοθήκη ετήσιων εκθέσεων.',
  'Read the report': 'Διαβάστε την έκθεση',
  'Request an archive copy': 'Ζητήστε αντίγραφο από το αρχείο',
  'Looking for an older annual report or a specific data series? Our sustainability team can share archived editions on request.':
    'Αναζητάτε παλαιότερη ετήσια έκθεση ή συγκεκριμένη σειρά δεδομένων; Η ομάδα βιωσιμότητάς μας μπορεί να κοινοποιήσει αρχειοθετημένες εκδόσεις κατόπιν αιτήματος.',
  'Transparency through our published environmental reports.':
    'Διαφάνεια μέσα από τις δημοσιευμένες περιβαλλοντικές μας εκθέσεις.',

  // reports — data-driven intro + items
  'Elysée publishes its environmental performance annually. The Environmental Report covers our progress against the six strategic components of Pillar 4 — Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products, and Green Policy.':
    'Η Elysée δημοσιεύει την περιβαλλοντική της επίδοση κάθε χρόνο. Η Περιβαλλοντική Έκθεση καλύπτει την πρόοδό μας ως προς τα έξι στρατηγικά συστατικά του Πυλώνα 4 — Αποτύπωμα Άνθρακα, Πράσινη Ενέργεια, Μηδενικά Απόβλητα, Κυκλική Οικονομία, Πράσινα Κυκλικά Προϊόντα και Πράσινη Πολιτική.',
  'Our Environmental Report 2024 documents progress against the "4.6 Green Policy" strategic direction — emissions offsetting, energy intensity reductions, and green policy implementation across all Elysée operations.':
    'Η Περιβαλλοντική μας Έκθεση 2024 τεκμηριώνει την πρόοδο ως προς τη στρατηγική κατεύθυνση «4.6 Πράσινη Πολιτική» — αντιστάθμιση εκπομπών, μειώσεις ενεργειακής έντασης και εφαρμογή πράσινης πολιτικής σε όλες τις δραστηριότητες της Elysée.',
  'A comprehensive introduction to the Green Elysée pillar and Vision50 — structured around the six strategic components of Pillar 4: Carbon Footprint, Green Energy, Zero Waste, Circular Economy, Green Circular Products & Technologies, and Green Policy.':
    'Μια ολοκληρωμένη εισαγωγή στον πυλώνα Green Elysée και στο Vision50 — δομημένη γύρω από τα έξι στρατηγικά συστατικά του Πυλώνα 4: Αποτύπωμα Άνθρακα, Πράσινη Ενέργεια, Μηδενικά Απόβλητα, Κυκλική Οικονομία, Πράσινα Κυκλικά Προϊόντα & Τεχνολογίες και Πράσινη Πολιτική.',
  'Introduction to the Green Elysée pillar and Vision50':
    'Εισαγωγή στον πυλώνα Green Elysée και στο Vision50',
  'Carbon Footprint quantification methodology and results':
    'Μεθοδολογία και αποτελέσματα ποσοτικοποίησης του αποτυπώματος άνθρακα',
  'Green Energy renewable-investment progress':
    'Πρόοδος επενδύσεων σε ανανεώσιμη πράσινη ενέργεια',
  'Zero Waste: achieving zero-waste-to-landfill and diverting piping waste':
    'Μηδενικά Απόβλητα: επίτευξη μηδενικών αποβλήτων προς ταφή και εκτροπή αποβλήτων σωληνώσεων',
  'Circular Economy philosophy and practical initiatives':
    'Φιλοσοφία κυκλικής οικονομίας και πρακτικές πρωτοβουλίες',
  'Green Circular Products and Technologies development':
    'Ανάπτυξη πράσινων κυκλικών προϊόντων και τεχνολογιών',
  'Green Policy and emissions-offsetting projects':
    'Πράσινη Πολιτική και έργα αντιστάθμισης εκπομπών',

  // ===== insights/index.astro =====
  'Green Elysée · Stories': 'Green Elysée · Ιστορίες',
  'Insights.': 'Άρθρα & Ενημέρωση.',
  "Stories and articles from our green journey — from circular-economy thinking to the people behind the certificates.":
    'Ιστορίες και άρθρα από την πράσινη πορεία μας — από τη σκέψη της κυκλικής οικονομίας έως τους ανθρώπους πίσω από τα πιστοποιητικά.',
  'From the programme': 'Από το πρόγραμμα',
  'The story so far': 'Η ιστορία μέχρι σήμερα',
  'Economy model': 'Μοντέλο οικονομίας',
  'Why we tell these stories': 'Γιατί διηγούμαστε αυτές τις ιστορίες',
  'The people behind the certificates.': 'Οι άνθρωποι πίσω από τα πιστοποιητικά.',
  'Every audit, every recycled tonne of resin, every Pillar-4 project has a face and a story.':
    'Κάθε έλεγχος, κάθε ανακυκλωμένος τόνος ρητίνης, κάθε έργο του Πυλώνα 4 έχει ένα πρόσωπο και μια ιστορία.',
  "Certificates and reports document where we are. Insights tell you how we got here — and where we're going. Read the articles, profiles and field stories that sit behind the Green Elysée programme.":
    'Τα πιστοποιητικά και οι εκθέσεις τεκμηριώνουν πού βρισκόμαστε. Τα άρθρα σάς λένε πώς φτάσαμε εδώ — και πού πηγαίνουμε. Διαβάστε τα άρθρα, τα προφίλ και τις ιστορίες από το πεδίο που βρίσκονται πίσω από το πρόγραμμα Green Elysée.',
  'Featured': 'Προβεβλημένο',
  'Article · Green Elysée': 'Άρθρο · Green Elysée',
  'Continue reading': 'Συνεχίστε την ανάγνωση',
  'More stories': 'Περισσότερες ιστορίες',
  'From the Green programme.': 'Από το πράσινο πρόγραμμα.',
  'Read story': 'Διαβάστε την ιστορία',
  'Press & partnerships': 'Τύπος & συνεργασίες',
  'Have a story idea, or want to feature the Green Elysée programme in your publication? Press inquiries and partnership requests are welcome.':
    'Έχετε μια ιδέα για άρθρο ή θέλετε να προβάλετε το πρόγραμμα Green Elysée στην έκδοσή σας; Τα αιτήματα τύπου και συνεργασίας είναι ευπρόσδεκτα.',
  'Browse the Newsroom': 'Περιηγηθείτε στην Αίθουσα Τύπου',
  'Pitch a story': 'Προτείνετε ένα άρθρο',

  // insights — data-driven item prose
  'Our journey to becoming a Green leader':
    'Η πορεία μας προς το να γίνουμε πράσινος ηγέτης',
  "The circular economy concept aims at reducing waste as much as possible — and, in effect, a product's life cycle is extended to the maximum. Our journey from compression fittings in 1979 to a six-pillar Green programme in 2026 is one of constant compounding: every certificate, every audit, every recycled tonne of resin earns the next.":
    'Η έννοια της κυκλικής οικονομίας στοχεύει στη μείωση των αποβλήτων όσο το δυνατόν περισσότερο — και, ουσιαστικά, στη μέγιστη δυνατή επέκταση του κύκλου ζωής ενός προϊόντος. Η πορεία μας, από τα εξαρτήματα σύσφιξης το 1979 έως ένα πρόγραμμα πράσινης ανάπτυξης έξι πυλώνων το 2026, είναι μια διαρκής συσσώρευση: κάθε πιστοποιητικό, κάθε έλεγχος, κάθε ανακυκλωμένος τόνος ρητίνης κερδίζει τον επόμενο.',

  // ===== EnquiryForm passed title/subtitle props used in this section =====
  'Tell us which certificate, bundle, or product family you need evidence for — the team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό, πακέτο ή οικογένεια προϊόντων χρειάζεστε αποδεικτικά — η ομάδα θα το ετοιμάσει.',
  'Press & partnership enquiries': 'Αιτήματα τύπου & συνεργασίας',
  'Tell us about your publication or partnership idea and the Green Elysée team will get back to you.':
    'Πείτε μας για την έκδοση ή την ιδέα συνεργασίας σας και η ομάδα Green Elysée θα επικοινωνήσει μαζί σας.',
  'Tell us which report or data series you need and the sustainability team will share the archived edition.':
    'Πείτε μας ποια έκθεση ή σειρά δεδομένων χρειάζεστε και η ομάδα βιωσιμότητας θα μοιραστεί την αρχειοθετημένη έκδοση.',
  'Ask the Green Elysée team': 'Ρωτήστε την ομάδα Green Elysée',
  "Tell us what you'd like to know about the programme, the pillars, or our circular products — the team will get back to you.":
    'Πείτε μας τι θα θέλατε να μάθετε για το πρόγραμμα, τους πυλώνες ή τα κυκλικά μας προϊόντα — η ομάδα θα επικοινωνήσει μαζί σας.',

  // ===== GreenElyseeSubNav =====
  'In this section': 'Σε αυτήν την ενότητα',
  'Reports & eBooks': 'Εκθέσεις & eBooks',
};
