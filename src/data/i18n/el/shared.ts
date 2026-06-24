// English UI string → Greek. Shared chrome (nav, footer, common CTAs) reused
// across the whole site. Keyed by the English text so it doubles as the source.
export const shared: Record<string, string> = {
  'About Us': 'Σχετικά με εμάς',
  'Our Services': 'Οι υπηρεσίες μας',
  'Products': 'Προϊόντα',
  'Innovation': 'Καινοτομία',
  'Insights': 'Άρθρα & Ενημέρωση',
  'Contact': 'Επικοινωνία',
  'Home': 'Αρχική',
  'Read more': 'Διαβάστε περισσότερα',
  'Learn more': 'Μάθετε περισσότερα',
  'Privacy Policy': 'Πολιτική Απορρήτου',
  'Terms of Use': 'Όροι Χρήσης',
  'Terms of Supply': 'Όροι Προμήθειας',
  'All rights reserved.': 'Με την επιφύλαξη παντός δικαιώματος.',

  // Navigation — top-level group titles
  'Contact Us': 'Επικοινωνία',
  'Primary': 'Κύρια',

  // Navigation — About Us
  'Corporate Profile': 'Εταιρικό Προφίλ',
  'History': 'Ιστορία',
  'Company Structure': 'Δομή Εταιρείας',
  'Vision, Mission & Values': 'Όραμα, Αποστολή & Αξίες',
  'Quality & Certifications': 'Ποιότητα & Πιστοποιήσεις',

  // Navigation — Green Elysée
  'About Green Elysée': 'Σχετικά με το Green Elysée',
  'Certifications': 'Πιστοποιήσεις',
  'Reports': 'Εκθέσεις',

  // Navigation — Innovation
  'Why Innovation': 'Γιατί Καινοτομία',
  'Research & Development': 'Έρευνα & Ανάπτυξη',
  'Funded Research Projects': 'Χρηματοδοτούμενα Ερευνητικά Έργα',
  'Innovation Insights': 'Άρθρα Καινοτομίας',
  'Network Partners': 'Συνεργάτες Δικτύου',
  'Innovate with Us': 'Καινοτομήστε μαζί μας',

  // Navigation — Products
  'Categories': 'Κατηγορίες',
  'Catalogues & Leaflets': 'Κατάλογοι & Φυλλάδια',
  'BIM Designs': 'Σχέδια BIM',

  // Navigation — Insights
  'News': 'Νέα',
  'Blog': 'Blog',
  'Exhibitions': 'Εκθέσεις & Εκδηλώσεις',
  'Media': 'Πολυμέσα',
  'eBooks': 'eBooks',
  'Environmental Report': 'Περιβαλλοντική Έκθεση',

  // Navigation — Contact Us
  'Local Network': 'Τοπικό Δίκτυο',
  'Worldwide Network': 'Παγκόσμιο Δίκτυο',
  'Careers': 'Καριέρα',

  // Footer — column titles
  'About us': 'Σχετικά με εμάς',
  'Contact us': 'Επικοινωνία',

  // Footer — contact + newsletter
  'Tel': 'Τηλ',
  'Fax': 'Φαξ',
  'Newsletter': 'Ενημερωτικό δελτίο',
  'Subscribe to be the first to know about our news and future plans.':
    'Εγγραφείτε για να ενημερώνεστε πρώτοι για τα νέα και τα μελλοντικά μας σχέδια.',
  'Email address': 'Διεύθυνση email',
  'Subscribe': 'Εγγραφή',
  'By subscribing you agree to our': 'Με την εγγραφή σας αποδέχεστε την',
  'Connect': 'Συνδεθείτε',
  'Designed & Development by': 'Σχεδιασμός & Ανάπτυξη από',

  // Mobile navigation — controls / labels
  'Open menu': 'Άνοιγμα μενού',
  'Close menu': 'Κλείσιμο μενού',
  'Primary navigation': 'Κύρια πλοήγηση',
  'Mobile primary': 'Κύρια πλοήγηση κινητού',
  'Menu': 'Μενού',

  // aria-labels that embed the brand name (brand kept, descriptor translated)
  'Elysée — home': 'Elysée — αρχική',
  'Elysée Group — home': 'Elysée Group — αρχική',

  // Enquiry form — field labels
  'Name': 'Όνομα',
  'Company': 'Εταιρεία',
  'Email': 'Email',
  'Phone': 'Τηλέφωνο',
  'Message': 'Μήνυμα',

  // Enquiry form — placeholders & aria-labels
  'Contact form': 'Φόρμα επικοινωνίας',
  'Your full name': 'Το πλήρες όνομά σας',
  'Optional': 'Προαιρετικό',
  'How can we help?': 'Πώς μπορούμε να βοηθήσουμε;',

  // Enquiry form — buttons, consent & messages
  'Send message': 'Αποστολή μηνύματος',
  'Sending…': 'Αποστολή…',
  'By submitting, you agree to be contacted by Elysée regarding your enquiry.':
    'Με την υποβολή, συμφωνείτε να επικοινωνήσει μαζί σας η Elysée σχετικά με το αίτημά σας.',
  'Thank you.': 'Σας ευχαριστούμε.',
  'Your message is on its way — a member of the Elysée team will be in touch shortly.':
    'Το μήνυμά σας στάλθηκε — ένα μέλος της ομάδας της Elysée θα επικοινωνήσει μαζί σας σύντομα.',
  'Something went wrong sending your message':
    'Κάτι πήγε στραβά κατά την αποστολή του μηνύματός σας',
  '. Please try again or email us directly.':
    '. Παρακαλούμε δοκιμάστε ξανά ή στείλτε μας email απευθείας.',

  // Enquiry form — default & passed title/subtitle props
  'Send us a message': 'Στείλτε μας ένα μήνυμα',
  'Fill in the form and the right Elysée team will get back to you.':
    'Συμπληρώστε τη φόρμα και η αρμόδια ομάδα της Elysée θα επικοινωνήσει μαζί σας.',
  'Talk to us': 'Επικοινωνήστε μαζί μας',
  'Send us a message and the Elysée team will get back to you.':
    'Στείλτε μας ένα μήνυμα και η ομάδα της Elysée θα επικοινωνήσει μαζί σας.',
  'Request a certificate': 'Ζητήστε ένα πιστοποιητικό',
  'Tell us which certificate or recognition you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό ή αναγνώριση χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',
  'Tell us which certificate, standard, or diameter class you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό, πρότυπο ή κλάση διαμέτρου χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',
  'Tell us which certificate, standard, or product family you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό, πρότυπο ή οικογένεια προϊόντων χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',
  'Tell us which certificate, standard, or application you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό, πρότυπο ή εφαρμογή χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',
  'Tell us which approval, market, or product family you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποια έγκριση, αγορά ή οικογένεια προϊόντων χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',
  'Tell us which certificate, standard, or bundle you need evidence for — our quality team will prepare it.':
    'Πείτε μας για ποιο πιστοποιητικό, πρότυπο ή πακέτο χρειάζεστε αποδεικτικά — η ομάδα ποιότητάς μας θα το ετοιμάσει.',

  // Certifications grid
  'Certified': 'Πιστοποιημένο',
  'Download PDF': 'Λήψη PDF',
  'Something missing?': 'Λείπει κάτι;',
  'Need an older revision or a tender-ready bundle?':
    'Χρειάζεστε παλαιότερη έκδοση ή πακέτο έτοιμο για διαγωνισμό;',
};
