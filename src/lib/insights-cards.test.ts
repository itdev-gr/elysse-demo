import { describe, it, expect } from 'vitest';
import { exhibitionToCard, mediaToCard, ebookToCard } from './insights-cards';
import type { Exhibition } from '../types/exhibition';
import type { Media } from '../types/media';
import type { Ebook } from '../types/ebook';

const base = { id: '1', body: '', is_published: true, created_at: '', updated_at: '' };

it('exhibition card uses card_date, falling back to event_date', () => {
  const row = { ...base, slug: 'eima-2026', title: 'EIMA', excerpt: 'x',
    event_date: '10–14 November 2026', card_date: 'Nov 2026',
    venue: null, stand: null, image: '/i.png', image_alt: null } as Exhibition;
  expect(exhibitionToCard(row)).toEqual({
    title: 'EIMA', date: 'Nov 2026', excerpt: 'x',
    href: '/insights/exhibitions/eima-2026/', image: '/i.png',
  });
  expect(exhibitionToCard({ ...row, card_date: null }).date).toBe('10–14 November 2026');
});

it('media card maps poster_image to image', () => {
  const row = { ...base, slug: 'anniv', title: 'Anniv', excerpt: 'y',
    video_url: 'https://www.youtube.com/embed/x', poster_image: '/p.jpg', image_alt: null } as Media;
  expect(mediaToCard(row)).toEqual({
    title: 'Anniv', excerpt: 'y', href: '/insights/media/anniv/', image: '/p.jpg',
  });
});

it('ebook card maps cover_image to image', () => {
  const row = { ...base, slug: 'rep-2020', title: 'Report', excerpt: 'z',
    year: '2020', cover_image: '/c.png', image_alt: null, download_url: null } as Ebook;
  expect(ebookToCard(row)).toEqual({
    title: 'Report', excerpt: 'z', href: '/insights/ebooks/rep-2020/', image: '/c.png',
  });
});
