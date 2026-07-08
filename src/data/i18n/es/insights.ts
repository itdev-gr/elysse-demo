// English UI string → Spanish. Insights listing + detail UI — static chrome only: eyebrows, hero copy, empty/error states, back links, share labels, buttons.
// Keyed by the English text so it doubles as the source.
export const insights: Record<string, string> = {
  // ===== Blog index =====
  'Insights · Blog': 'Novedades · Blog',
  'In-depth articles on piping technology, installation best practices, and sustainable solutions.':
    'Artículos en profundidad sobre tecnología de tuberías, mejores prácticas de instalación y soluciones sostenibles.',
  'From the blog': 'Del blog',
  'Notes from our engineers.': 'Notas de nuestros ingenieros.',

  // ===== News index =====
  'Insights · Newsroom': 'Novedades · Newsroom',
  'News.': 'Noticias.',
  'Product launches, company milestones, and industry updates from across the Elysée group.':
    'Lanzamientos de productos, hitos de la empresa y novedades del sector de todo el grupo Elysée.',
  'From the newsroom': 'Desde la sala de prensa',
  'The latest from Elysée.': 'Las últimas novedades de Elysée.',

  // ===== eBooks index =====
  'Reports, guides and publications from Elysée.':
    'Informes, guías y publicaciones de Elysée.',
  'No eBooks published yet — check back soon.':
    'Aún no se han publicado eBooks — vuelva a consultar pronto.',
  'From the library': 'Desde la biblioteca',
  'Guides, reports and publications.': 'Guías, informes y publicaciones.',

  // ===== Exhibitions index =====
  'Exhibitions.': 'Exposiciones.',
  'Where to meet Elysée — trade fairs and exhibitions across the group.':
    'Dónde encontrar a Elysée — ferias comerciales y exposiciones en todo el grupo.',
  'No exhibitions listed yet — check back soon.':
    'Aún no hay exposiciones listadas — vuelva a consultar pronto.',
  'On the calendar': 'En el calendario',
  'Meet Elysée in person.': 'Conozca a Elysée en persona.',

  // ===== Media index =====
  'Media.': 'Medios.',
  'Videos, photographs, and broadcast coverage featuring Elysée.':
    'Vídeos, fotografías y cobertura televisiva con Elysée.',
  'No media published yet — check back soon.':
    'Aún no se han publicado contenidos multimedia — vuelva a consultar pronto.',
  'From the media library': 'Desde la biblioteca multimedia',
  'Elysée in pictures and film.': 'Elysée en imágenes y vídeo.',

  // ===== InsightsList island — empty / error states =====
  'Nothing here yet — check back soon.':
    'Aún no hay nada aquí — vuelva a consultar pronto.',
  'Temporarily unavailable — please try again shortly.':
    'Temporalmente no disponible — inténtelo de nuevo en breve.',

  // ===== Detail views — shared eyebrows =====
  'Insights · eBooks': 'Novedades · eBooks',
  'Insights · Exhibitions': 'Novedades · Exhibitions',
  'Insights · Media': 'Novedades · Media',

  // ===== Detail views — loading / not-found / error =====
  'Loading…': 'Cargando…',
  'Temporarily unavailable.': 'Temporalmente no disponible.',
  'eBook not found.': 'eBook no encontrado.',
  'Exhibition not found.': 'Exposición no encontrada.',
  'Media not found.': 'Contenido multimedia no encontrado.',
  'The publication you are looking for may have been moved or unpublished.':
    'Es posible que la publicación que busca haya sido trasladada o retirada.',
  'The exhibition you are looking for may have been moved or unpublished.':
    'Es posible que la exposición que busca haya sido trasladada o retirada.',
  'The item you are looking for may have been moved or unpublished.':
    'Es posible que el elemento que busca haya sido trasladado o retirado.',

  // ===== Detail views — back links =====
  'Back to eBooks': 'Volver a eBooks',
  'Back to Exhibitions': 'Volver a las exposiciones',
  'Back to Media': 'Volver a los medios',

  // ===== eBook detail — sidebar =====
  'Published': 'Publicado',
  'Request a copy': 'Solicitar un ejemplar',

  // ===== ArticleDetail.astro — shared insights article chrome =====
  'Back to': 'Volver a',
  'Share': 'Compartir',

  // ===== Blog & News islands — card CTAs / labels =====
  'Read article': 'Leer artículo',
  'Latest': 'Más reciente',
  'Insights · News': 'Novedades · News',

  // ===== Blog & News islands — empty / error eyebrows & states =====
  'Nothing yet': 'Aún nada',
  'Temporarily unavailable': 'Temporalmente no disponible',
  'Not found': 'No encontrado',
  'No posts yet.': 'Aún no hay publicaciones.',
  'No news yet.': 'Aún no hay noticias.',
  'Posts are temporarily unavailable.':
    'Las publicaciones no están disponibles temporalmente.',
  'Check back soon — we publish new pieces from across the group regularly.':
    'Vuelva a consultar pronto — publicamos nuevos artículos de todo el grupo con regularidad.',
  'Check back soon — we publish launches, milestones and updates from across the group regularly.':
    'Vuelva a consultar pronto — publicamos lanzamientos, hitos y novedades de todo el grupo con regularidad.',
  'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.':
    'Vuelva pronto. Mientras tanto, puede consultar nuestra sala de prensa para conocer las últimas novedades.',
  'Visit the newsroom': 'Visitar la sala de prensa',

  // ===== Blog & News post detail — not-found / error =====
  'Post not found.': 'Publicación no encontrada.',
  'Article not found.': 'Artículo no encontrado.',
  'Article temporarily unavailable.': 'Artículo no disponible temporalmente.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.':
    'Es posible que el artículo que busca haya sido trasladado o retirado. Consulte a continuación todos nuestros últimos artículos.',
  'The article you are looking for may have been moved or unpublished. Browse all our latest news below.':
    'Es posible que el artículo que busca haya sido trasladado o retirado. Consulte a continuación todas nuestras últimas noticias.',
  'Back to all posts': 'Volver a todas las publicaciones',
  'Back to all news': 'Volver a todas las noticias',
};
