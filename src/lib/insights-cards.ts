import type { Exhibition } from '../types/exhibition';
import type { Media } from '../types/media';
import type { Ebook } from '../types/ebook';

export interface InsightCard {
  title: string;
  date?: string;
  excerpt?: string;
  href: string;
  image?: string;
}

export function exhibitionToCard(e: Exhibition): InsightCard {
  const card: InsightCard = { title: e.title, excerpt: e.excerpt, href: `/insights/exhibitions/${e.slug}/` };
  const date = e.card_date ?? e.event_date;
  if (date) card.date = date;
  if (e.image) card.image = e.image;
  return card;
}

export function mediaToCard(m: Media): InsightCard {
  const card: InsightCard = { title: m.title, excerpt: m.excerpt, href: `/insights/media/${m.slug}/` };
  if (m.poster_image) card.image = m.poster_image;
  return card;
}

export function ebookToCard(b: Ebook): InsightCard {
  const card: InsightCard = { title: b.title, excerpt: b.excerpt, href: `/insights/ebooks/${b.slug}/` };
  if (b.cover_image) card.image = b.cover_image;
  return card;
}
