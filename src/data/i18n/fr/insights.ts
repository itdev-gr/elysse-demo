// English UI string → French. Insights listing + detail UI — static chrome only: eyebrows, hero copy, empty/error states, back links, share labels, buttons.
// Keyed by the English text so it doubles as the source.
export const insights: Record<string, string> = {
  // ===== Blog index =====
  'Insights · Blog': 'Actualités · Blog',
  'In-depth articles on piping technology, installation best practices, and sustainable solutions.':
    "Articles approfondis sur la technologie des canalisations, les meilleures pratiques d'installation et les solutions durables.",
  'From the blog': 'Depuis le blog',
  'Notes from our engineers.': 'Notes de nos ingénieurs.',

  // ===== News index =====
  'Insights · Newsroom': 'Actualités · Newsroom',
  'News.': 'Actualités.',
  'Product launches, company milestones, and industry updates from across the Elysée group.':
    "Lancements de produits, étapes clés de l'entreprise et actualités du secteur de l'ensemble du groupe Elysée.",
  'From the newsroom': 'Depuis la salle de presse',
  'The latest from Elysée.': "Les dernières actualités d'Elysée.",

  // ===== eBooks index =====
  'Reports, guides and publications from Elysée.':
    "Rapports, guides et publications d'Elysée.",
  'No eBooks published yet — check back soon.':
    'Aucun eBook publié pour le moment — revenez bientôt.',
  'From the library': 'Depuis la bibliothèque',
  'Guides, reports and publications.': 'Guides, rapports et publications.',

  // ===== Exhibitions index =====
  'Exhibitions.': 'Expositions.',
  'Where to meet Elysée — trade fairs and exhibitions across the group.':
    "Où rencontrer Elysée — salons professionnels et expositions dans l'ensemble du groupe.",
  'No exhibitions listed yet — check back soon.':
    'Aucune exposition répertoriée pour le moment — revenez bientôt.',
  'On the calendar': 'Au calendrier',
  'Meet Elysée in person.': 'Rencontrez Elysée en personne.',

  // ===== Media index =====
  'Media.': 'Médias.',
  'Videos, photographs, and broadcast coverage featuring Elysée.':
    'Vidéos, photographies et reportages télévisés consacrés à Elysée.',
  'No media published yet — check back soon.':
    'Aucun contenu média publié pour le moment — revenez bientôt.',
  'From the media library': 'Depuis la médiathèque',
  'Elysée in pictures and film.': 'Elysée en images et en vidéo.',

  // ===== InsightsList island — empty / error states =====
  'Nothing here yet — check back soon.':
    'Rien ici pour le moment — revenez bientôt.',
  'Temporarily unavailable — please try again shortly.':
    'Temporairement indisponible — veuillez réessayer sous peu.',

  // ===== Detail views — shared eyebrows =====
  'Insights · eBooks': 'Actualités · eBooks',
  'Insights · Exhibitions': 'Actualités · Exhibitions',
  'Insights · Media': 'Actualités · Media',

  // ===== Detail views — loading / not-found / error =====
  'Loading…': 'Chargement…',
  'Temporarily unavailable.': 'Temporairement indisponible.',
  'eBook not found.': 'eBook introuvable.',
  'Exhibition not found.': 'Exposition introuvable.',
  'Media not found.': 'Contenu média introuvable.',
  'The publication you are looking for may have been moved or unpublished.':
    'La publication que vous recherchez a peut-être été déplacée ou retirée.',
  'The exhibition you are looking for may have been moved or unpublished.':
    "L'exposition que vous recherchez a peut-être été déplacée ou retirée.",
  'The item you are looking for may have been moved or unpublished.':
    "L'élément que vous recherchez a peut-être été déplacé ou retiré.",

  // ===== Detail views — back links =====
  'Back to eBooks': 'Retour aux eBooks',
  'Back to Exhibitions': 'Retour aux expositions',
  'Back to Media': 'Retour aux médias',

  // ===== eBook detail — sidebar =====
  'Published': 'Publié',
  'Request a copy': 'Demander un exemplaire',

  // ===== ArticleDetail.astro — shared insights article chrome =====
  'Back to': 'Retour à',
  'Share': 'Partager',

  // ===== Blog & News islands — card CTAs / labels =====
  'Read article': "Lire l'article",
  'Latest': 'Dernier',
  'Insights · News': 'Actualités · News',

  // ===== Blog & News islands — empty / error eyebrows & states =====
  'Nothing yet': 'Rien pour le moment',
  'Temporarily unavailable': 'Temporairement indisponible',
  'Not found': 'Introuvable',
  'No posts yet.': 'Aucun article pour le moment.',
  'No news yet.': 'Aucune actualité pour le moment.',
  'Posts are temporarily unavailable.':
    'Les articles sont temporairement indisponibles.',
  'Check back soon — we publish new pieces from across the group regularly.':
    "Revenez bientôt — nous publions régulièrement de nouveaux articles de l'ensemble du groupe.",
  'Check back soon — we publish launches, milestones and updates from across the group regularly.':
    "Revenez bientôt — nous publions régulièrement des lancements, des étapes clés et des actualités de l'ensemble du groupe.",
  'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.':
    'Veuillez revenir sous peu. En attendant, vous pouvez consulter notre salle de presse pour connaître les dernières actualités.',
  'Visit the newsroom': 'Visiter la salle de presse',

  // ===== Blog & News post detail — not-found / error =====
  'Post not found.': 'Article introuvable.',
  'Article not found.': 'Article introuvable.',
  'Article temporarily unavailable.': 'Article temporairement indisponible.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.':
    "L'article que vous recherchez a peut-être été déplacé ou retiré. Parcourez ci-dessous tous nos derniers articles.",
  'The article you are looking for may have been moved or unpublished. Browse all our latest news below.':
    "L'article que vous recherchez a peut-être été déplacé ou retiré. Parcourez ci-dessous toutes nos dernières actualités.",
  'Back to all posts': 'Retour à tous les articles',
  'Back to all news': 'Retour à toutes les actualités',
};
