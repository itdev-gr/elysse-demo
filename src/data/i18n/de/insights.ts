// English UI string → German. Insights listing + detail UI — static chrome only: eyebrows, hero copy, empty/error states, back links, share labels, buttons.
// Keyed by the English text so it doubles as the source.
export const insights: Record<string, string> = {
  // ===== Blog index =====
  'Insights · Blog': 'Aktuelles · Blog',
  'In-depth articles on piping technology, installation best practices, and sustainable solutions.':
    'Ausführliche Artikel zu Rohrleitungstechnik, bewährten Installationspraktiken und nachhaltigen Lösungen.',
  'From the blog': 'Aus dem Blog',
  'Notes from our engineers.': 'Notizen unserer Ingenieure.',

  // ===== News index =====
  'Insights · Newsroom': 'Aktuelles · Newsroom',
  'News.': 'Neuigkeiten.',
  'Product launches, company milestones, and industry updates from across the Elysée group.':
    'Produkteinführungen, Unternehmensmeilensteine und Branchen-Updates aus der gesamten Elysée-Gruppe.',
  'From the newsroom': 'Aus dem Newsroom',
  'The latest from Elysée.': 'Die neuesten Nachrichten von Elysée.',

  // ===== eBooks index =====
  'Reports, guides and publications from Elysée.':
    'Berichte, Leitfäden und Veröffentlichungen von Elysée.',
  'No eBooks published yet — check back soon.':
    'Noch keine eBooks veröffentlicht — schauen Sie bald wieder vorbei.',
  'From the library': 'Aus der Bibliothek',
  'Guides, reports and publications.': 'Leitfäden, Berichte und Veröffentlichungen.',

  // ===== Exhibitions index =====
  'Exhibitions.': 'Ausstellungen.',
  'Where to meet Elysée — trade fairs and exhibitions across the group.':
    'Wo Sie Elysée treffen — Fachmessen und Ausstellungen in der gesamten Gruppe.',
  'No exhibitions listed yet — check back soon.':
    'Noch keine Ausstellungen gelistet — schauen Sie bald wieder vorbei.',
  'On the calendar': 'Im Kalender',
  'Meet Elysée in person.': 'Treffen Sie Elysée persönlich.',

  // ===== Media index =====
  'Media.': 'Medien.',
  'Videos, photographs, and broadcast coverage featuring Elysée.':
    'Videos, Fotografien und Fernsehberichte mit Elysée.',
  'No media published yet — check back soon.':
    'Noch keine Medien veröffentlicht — schauen Sie bald wieder vorbei.',
  'From the media library': 'Aus der Mediathek',
  'Elysée in pictures and film.': 'Elysée in Bildern und Filmen.',

  // ===== InsightsList island — empty / error states =====
  'Nothing here yet — check back soon.':
    'Hier gibt es noch nichts — schauen Sie bald wieder vorbei.',
  'Temporarily unavailable — please try again shortly.':
    'Vorübergehend nicht verfügbar — bitte versuchen Sie es in Kürze erneut.',

  // ===== Detail views — shared eyebrows =====
  'Insights · eBooks': 'Aktuelles · eBooks',
  'Insights · Exhibitions': 'Aktuelles · Exhibitions',
  'Insights · Media': 'Aktuelles · Media',

  // ===== Detail views — loading / not-found / error =====
  'Loading…': 'Wird geladen…',
  'Temporarily unavailable.': 'Vorübergehend nicht verfügbar.',
  'eBook not found.': 'eBook nicht gefunden.',
  'Exhibition not found.': 'Ausstellung nicht gefunden.',
  'Media not found.': 'Medium nicht gefunden.',
  'The publication you are looking for may have been moved or unpublished.':
    'Die gesuchte Veröffentlichung wurde möglicherweise verschoben oder zurückgezogen.',
  'The exhibition you are looking for may have been moved or unpublished.':
    'Die gesuchte Ausstellung wurde möglicherweise verschoben oder zurückgezogen.',
  'The item you are looking for may have been moved or unpublished.':
    'Das gesuchte Element wurde möglicherweise verschoben oder zurückgezogen.',

  // ===== Detail views — back links =====
  'Back to eBooks': 'Zurück zu eBooks',
  'Back to Exhibitions': 'Zurück zu den Ausstellungen',
  'Back to Media': 'Zurück zu den Medien',

  // ===== eBook detail — sidebar =====
  'Published': 'Veröffentlicht',
  'Request a copy': 'Exemplar anfordern',

  // ===== ArticleDetail.astro — shared insights article chrome =====
  'Back to': 'Zurück zu',
  'Share': 'Teilen',

  // ===== Blog & News islands — card CTAs / labels =====
  'Read article': 'Artikel lesen',
  'Latest': 'Neueste',
  'Insights · News': 'Aktuelles · News',

  // ===== Blog & News islands — empty / error eyebrows & states =====
  'Nothing yet': 'Noch nichts',
  'Temporarily unavailable': 'Vorübergehend nicht verfügbar',
  'Not found': 'Nicht gefunden',
  'No posts yet.': 'Noch keine Beiträge.',
  'No news yet.': 'Noch keine Neuigkeiten.',
  'Posts are temporarily unavailable.':
    'Beiträge sind vorübergehend nicht verfügbar.',
  'Check back soon — we publish new pieces from across the group regularly.':
    'Schauen Sie bald wieder vorbei — wir veröffentlichen regelmäßig neue Beiträge aus der gesamten Gruppe.',
  'Check back soon — we publish launches, milestones and updates from across the group regularly.':
    'Schauen Sie bald wieder vorbei — wir veröffentlichen regelmäßig Produkteinführungen, Meilensteine und Updates aus der gesamten Gruppe.',
  'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.':
    'Bitte kommen Sie in Kürze wieder. In der Zwischenzeit können Sie in unserem Newsroom die neuesten Updates durchsehen.',
  'Visit the newsroom': 'Newsroom besuchen',

  // ===== Blog & News post detail — not-found / error =====
  'Post not found.': 'Beitrag nicht gefunden.',
  'Article not found.': 'Artikel nicht gefunden.',
  'Article temporarily unavailable.': 'Artikel vorübergehend nicht verfügbar.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.':
    'Der gesuchte Artikel wurde möglicherweise verschoben oder zurückgezogen. Durchsuchen Sie unten alle unsere neuesten Beiträge.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest news below.':
    'Der gesuchte Artikel wurde möglicherweise verschoben oder zurückgezogen. Durchsuchen Sie unten alle unsere neuesten Nachrichten.',
  'Back to all posts': 'Zurück zu allen Beiträgen',
  'Back to all news': 'Zurück zu allen Neuigkeiten',
};
