// English UI string → Spanish. Shared chrome (nav, footer, common CTAs) reused
// across the whole site. Keyed by the English text so it doubles as the source.
export const shared: Record<string, string> = {
  'About Us': 'Sobre nosotros',
  'Our Services': 'Nuestros servicios',
  'Products': 'Productos',
  'Innovation': 'Innovación',
  'Insights': 'Novedades',
  'Contact': 'Contacto',
  'Home': 'Inicio',
  'Search…': 'Buscar…',
  'Search in category…': 'Buscar en la categoría…',
  'Site search': 'Búsqueda en el sitio',
  'Read more': 'Leer más',
  'Learn more': 'Más información',
  'Privacy Policy': 'Política de privacidad',
  'Terms of Use': 'Términos de uso',
  'Terms of Supply': 'Condiciones de suministro',
  'All rights reserved.': 'Todos los derechos reservados.',

  // Navigation — top-level group titles
  'Contact Us': 'Contacto',
  'Primary': 'Principal',

  // Navigation — About Us
  'Corporate Profile': 'Perfil corporativo',
  'History': 'Historia',
  'Company Structure': 'Estructura de la empresa',
  'Vision, Mission & Values': 'Visión, misión y valores',
  'Quality & Certifications': 'Calidad y certificaciones',

  // Navigation — Green Elysée
  'About Green Elysée': 'Sobre Green Elysée',
  'Certifications': 'Certificaciones',
  'Reports': 'Informes',

  // Navigation — Innovation
  'Why Innovation': 'Por qué innovación',
  'Research & Development': 'Investigación y desarrollo',
  'Funded Research Projects': 'Proyectos de investigación financiados',
  'Innovation Insights': 'Artículos de innovación',
  'Network Partners': 'Socios de la red',
  'Innovate with Us': 'Innove con nosotros',

  // Navigation — Products
  'Categories': 'Categorías',
  'Catalogues & Leaflets': 'Catálogos y folletos',
  'BIM Designs': 'Planos BIM',

  // Navigation — Insights
  'News': 'Noticias',
  'Blog': 'Blog',
  'Exhibitions': 'Exposiciones y eventos',
  'Media': 'Medios',
  'eBooks': 'eBooks',
  'Environmental Report': 'Informe medioambiental',

  // Navigation — Contact Us
  'Local Network': 'Red local',
  'Worldwide Network': 'Red mundial',
  'Careers': 'Empleo',

  // Footer — column titles
  'About us': 'Sobre nosotros',
  'Contact us': 'Contacto',

  // Footer — contact + newsletter
  'Tel': 'Tel',
  'Fax': 'Fax',
  'Newsletter': 'Boletín de noticias',
  'Subscribe to be the first to know about our news and future plans.':
    'Suscríbase para ser el primero en conocer nuestras novedades y planes futuros.',
  'Email address': 'Dirección de email',
  'Subscribe': 'Suscribirse',
  'By subscribing you agree to our': 'Al suscribirse, acepta nuestra',
  'Connect': 'Síganos',
  'Designed & Development by': 'Diseño y desarrollo por',

  // Mobile navigation — controls / labels
  'Open menu': 'Abrir menú',
  'Close menu': 'Cerrar menú',
  'Primary navigation': 'Navegación principal',
  'Mobile primary': 'Navegación principal móvil',
  'Menu': 'Menú',

  // aria-labels that embed the brand name (brand kept, descriptor translated)
  'Elysée — home': 'Elysée — inicio',
  'Elysée Group — home': 'Elysée Group — inicio',

  // Enquiry form — field labels
  'Name': 'Nombre',
  'Company': 'Empresa',
  'Email': 'Email',
  'Phone': 'Teléfono',
  'Message': 'Mensaje',

  // Enquiry form — placeholders & aria-labels
  'Contact form': 'Formulario de contacto',
  'Your full name': 'Su nombre completo',
  'Optional': 'Opcional',
  'How can we help?': '¿Cómo podemos ayudarle?',

  // Enquiry form — buttons, consent & messages
  'Send message': 'Enviar mensaje',
  'Sending…': 'Enviando…',
  'By submitting, you agree to be contacted by Elysée regarding your enquiry.':
    'Al enviar, acepta que Elysée se ponga en contacto con usted en relación con su consulta.',
  'Thank you.': 'Gracias.',
  'Your message is on its way — a member of the Elysée team will be in touch shortly.':
    'Su mensaje está en camino — un miembro del equipo de Elysée se pondrá en contacto con usted en breve.',
  'Something went wrong sending your message':
    'Se produjo un error al enviar su mensaje',
  '. Please try again or email us directly.':
    '. Vuelva a intentarlo o escríbanos directamente por email.',

  // Enquiry form — default & passed title/subtitle props
  'Send us a message': 'Envíenos un mensaje',
  'Fill in the form and the right Elysée team will get back to you.':
    'Rellene el formulario y el equipo de Elysée correspondiente se pondrá en contacto con usted.',
  'Talk to us': 'Hable con nosotros',
  'Send us a message and the Elysée team will get back to you.':
    'Envíenos un mensaje y el equipo de Elysée se pondrá en contacto con usted.',
  'Request a certificate': 'Solicitar un certificado',
  'Tell us which certificate or recognition you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué certificado o reconocimiento necesita una evidencia — nuestro equipo de calidad la preparará.',
  'Tell us which certificate, standard, or diameter class you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué certificado, norma o clase de diámetro necesita una evidencia — nuestro equipo de calidad la preparará.',
  'Tell us which certificate, standard, or product family you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué certificado, norma o familia de productos necesita una evidencia — nuestro equipo de calidad la preparará.',
  'Tell us which certificate, standard, or application you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué certificado, norma o aplicación necesita una evidencia — nuestro equipo de calidad la preparará.',
  'Tell us which approval, market, or product family you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué homologación, mercado o familia de productos necesita una evidencia — nuestro equipo de calidad la preparará.',
  'Tell us which certificate, standard, or bundle you need evidence for — our quality team will prepare it.':
    'Indíquenos para qué certificado, norma o paquete necesita una evidencia — nuestro equipo de calidad la preparará.',

  // Certifications grid
  'Certified': 'Certificado',
  'Download PDF': 'Descargar PDF',
  'Something missing?': '¿Falta algo?',
  'Need an older revision or a tender-ready bundle?':
    '¿Necesita una revisión anterior o un paquete listo para licitación?',

  // Header search — live dropdown results
  'View all results': 'Ver todos los resultados',
  'No results for': 'Sin resultados para',
  'Search is temporarily unavailable. Please try again.': 'La búsqueda no está disponible temporalmente. Inténtelo de nuevo.',

  // /search page
  'Search': 'Búsqueda',
  'Results for': 'Resultados para',
  'Searching…': 'Buscando…',
  'Type at least 2 characters to search.': 'Escriba al menos 2 caracteres para buscar.',
  'Search products, pages, insights…': 'Buscar productos, páginas, novedades…',

  // Search result kind labels
  'Series': 'Series',
  'Pages': 'Páginas',
  'Catalogues': 'Catálogos',
};
