// Insights listing + detail UI strings → Greek. Keyed by the English source.
// Static chrome only: eyebrows, hero copy, empty/error states, back links,
// share labels, buttons. DB-authored content (titles, excerpts, bodies,
// authors, dates, tags) is never translated here. Strings already in
// shared.ts (e.g. 'Read more', 'Download PDF', 'Insights', 'eBooks',
// 'Exhibitions', 'Media') are reused, not redefined.
export const insights: Record<string, string> = {
  // ===== Blog index =====
  'Insights · Blog': 'Άρθρα & Ενημέρωση · Blog',
  'In-depth articles on piping technology, installation best practices, and sustainable solutions.':
    'Εμπεριστατωμένα άρθρα για την τεχνολογία σωληνώσεων, τις βέλτιστες πρακτικές εγκατάστασης και τις βιώσιμες λύσεις.',

  // ===== News index =====
  'Insights · Newsroom': 'Άρθρα & Ενημέρωση · Νέα',
  'News.': 'Νέα.',
  'Product launches, company milestones, and industry updates from across the Elysée group.':
    'Λανσαρίσματα προϊόντων, εταιρικά ορόσημα και ενημερώσεις του κλάδου από όλον τον όμιλο Elysée.',
  'From the newsroom': 'Από το γραφείο τύπου',
  'The latest from Elysée.': 'Τα τελευταία νέα από την Elysée.',

  // ===== eBooks index =====
  'Reports, guides and publications from Elysée.':
    'Εκθέσεις, οδηγοί και εκδόσεις από την Elysée.',
  'No eBooks published yet — check back soon.':
    'Δεν έχουν δημοσιευτεί ακόμη eBooks — επισκεφθείτε μας ξανά σύντομα.',

  // ===== Exhibitions index =====
  'Where to meet Elysée — trade fairs and exhibitions across the group.':
    'Πού θα συναντήσετε την Elysée — εμπορικές εκθέσεις και εκδηλώσεις σε όλον τον όμιλο.',
  'No exhibitions listed yet — check back soon.':
    'Δεν έχουν καταχωριστεί ακόμη εκθέσεις — επισκεφθείτε μας ξανά σύντομα.',

  // ===== Media index =====
  'Media.': 'Πολυμέσα.',
  'Videos, photographs, and broadcast coverage featuring Elysée.':
    'Βίντεο, φωτογραφίες και τηλεοπτική κάλυψη με την Elysée.',
  'No media published yet — check back soon.':
    'Δεν έχουν δημοσιευτεί ακόμη πολυμέσα — επισκεφθείτε μας ξανά σύντομα.',

  // ===== InsightsList island — empty / error states =====
  'Nothing here yet — check back soon.':
    'Δεν υπάρχει κάτι ακόμη — επισκεφθείτε μας ξανά σύντομα.',
  'Temporarily unavailable — please try again shortly.':
    'Προσωρινά μη διαθέσιμο — παρακαλούμε δοκιμάστε ξανά σύντομα.',

  // ===== Detail views — shared eyebrows =====
  'Insights · eBooks': 'Άρθρα & Ενημέρωση · eBooks',
  'Insights · Exhibitions': 'Άρθρα & Ενημέρωση · Εκθέσεις & Εκδηλώσεις',
  'Insights · Media': 'Άρθρα & Ενημέρωση · Πολυμέσα',

  // ===== Detail views — loading / not-found / error =====
  'Loading…': 'Φόρτωση…',
  'Temporarily unavailable.': 'Προσωρινά μη διαθέσιμο.',
  'eBook not found.': 'Το eBook δεν βρέθηκε.',
  'Exhibition not found.': 'Η έκθεση δεν βρέθηκε.',
  'Media not found.': 'Το πολυμέσο δεν βρέθηκε.',
  'The publication you are looking for may have been moved or unpublished.':
    'Η έκδοση που αναζητάτε ενδέχεται να έχει μετακινηθεί ή να μην είναι πλέον δημοσιευμένη.',
  'The exhibition you are looking for may have been moved or unpublished.':
    'Η έκθεση που αναζητάτε ενδέχεται να έχει μετακινηθεί ή να μην είναι πλέον δημοσιευμένη.',
  'The item you are looking for may have been moved or unpublished.':
    'Το στοιχείο που αναζητάτε ενδέχεται να έχει μετακινηθεί ή να μην είναι πλέον δημοσιευμένο.',

  // ===== Detail views — back links =====
  'Back to eBooks': 'Επιστροφή στα eBooks',
  'Back to Exhibitions': 'Επιστροφή στις Εκθέσεις & Εκδηλώσεις',
  'Back to Media': 'Επιστροφή στα Πολυμέσα',

  // ===== eBook detail — sidebar =====
  'Published': 'Δημοσιεύθηκε',
  'Request a copy': 'Ζητήστε ένα αντίγραφο',

  // ===== ArticleDetail.astro — shared insights article chrome =====
  'Back to': 'Επιστροφή σε',
  'Share': 'Κοινοποίηση',

  // ===== Blog & News islands — card CTAs / labels =====
  'Read article': 'Διαβάστε το άρθρο',
  'Latest': 'Τελευταίο',
  'Insights · News': 'Άρθρα & Ενημέρωση · Νέα',

  // ===== Blog & News islands — empty / error eyebrows & states =====
  'Nothing yet': 'Τίποτα ακόμη',
  'Temporarily unavailable': 'Προσωρινά μη διαθέσιμο',
  'Not found': 'Δεν βρέθηκε',
  'No posts yet.': 'Δεν υπάρχουν ακόμη άρθρα.',
  'No news yet.': 'Δεν υπάρχουν ακόμη νέα.',
  'Posts are temporarily unavailable.':
    'Τα άρθρα είναι προσωρινά μη διαθέσιμα.',
  'Check back soon — we publish new pieces from across the group regularly.':
    'Επισκεφθείτε μας ξανά σύντομα — δημοσιεύουμε τακτικά νέα άρθρα από όλον τον όμιλο.',
  'Check back soon — we publish launches, milestones and updates from across the group regularly.':
    'Επισκεφθείτε μας ξανά σύντομα — δημοσιεύουμε τακτικά λανσαρίσματα, ορόσημα και ενημερώσεις από όλον τον όμιλο.',
  'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.':
    'Παρακαλούμε επιστρέψτε σύντομα. Στο μεταξύ, μπορείτε να περιηγηθείτε στο γραφείο τύπου μας για τις τελευταίες ενημερώσεις.',
  'Visit the newsroom': 'Επισκεφθείτε το γραφείο τύπου',

  // ===== Blog & News post detail — not-found / error =====
  'Post not found.': 'Το άρθρο δεν βρέθηκε.',
  'Article not found.': 'Το άρθρο δεν βρέθηκε.',
  'Article temporarily unavailable.': 'Το άρθρο είναι προσωρινά μη διαθέσιμο.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.':
    'Το άρθρο που αναζητάτε ενδέχεται να έχει μετακινηθεί ή να μην είναι πλέον δημοσιευμένο. Δείτε όλα τα πιο πρόσφατα άρθρα μας παρακάτω.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest news below.':
    'Το άρθρο που αναζητάτε ενδέχεται να έχει μετακινηθεί ή να μην είναι πλέον δημοσιευμένο. Δείτε όλα τα πιο πρόσφατα νέα μας παρακάτω.',
  'Back to all posts': 'Επιστροφή σε όλα τα άρθρα',
  'Back to all news': 'Επιστροφή σε όλα τα νέα',
};
