/**
 * Maps each timeline year (or year-range string) on the history page to an
 * image rendered by the hover-tooltip on /about-us/history/demo.
 *
 * Keys must match the `year` string used by the milestone items in
 * `src/data/site-content.ts` (aboutUsHistory.blocks → timeline.items).
 *
 * Images are pulled from /public/images/about — pick the best contextual
 * match for each milestone.
 */
export const historyTimelineImages: Record<string, { src: string; alt: string }> = {
  '1979': {
    src: '/images/about/founder-vintage.jpg',
    alt: 'Elysée founder Antonis Protopapas in the early years of the company',
  },
  '1980': {
    src: '/images/about/water-flowing.jpg',
    alt: 'Water flowing from an irrigation outlet — the first export markets',
  },
  '1989': {
    src: '/images/about/facility-exterior.jpg',
    alt: 'Exterior of the Ergates Industrial Area facility',
  },
  '1991': {
    src: '/images/about/pipes-warehouse.jpg',
    alt: 'Polyethylene pipe stock arranged in the Ergates warehouse',
  },
  '1998': {
    src: '/images/about/qa-lab.jpg',
    alt: 'Elysée quality-assurance laboratory',
  },
  '2001': {
    src: '/images/about/hq-aerial.jpg',
    alt: 'Aerial view of the Elysée Ergates headquarters',
  },
  '2002': {
    src: '/images/about/engineers-meeting.jpg',
    alt: 'Engineers and consultants in an R&D working session',
  },
  '2003 – 2016': {
    src: '/images/about/pipe-stack.jpg',
    alt: 'Stacks of pipe ready for outbound international shipment',
  },
  'Today': {
    src: '/images/about/facility-exterior.jpg',
    alt: 'The Elysée Ergates facility today',
  },
};

export function getTimelineImage(year: string): { src: string; alt: string } | null {
  return historyTimelineImages[year] ?? null;
}
