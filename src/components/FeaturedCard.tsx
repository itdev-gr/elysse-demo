import { i18nAttr } from '../lib/i18n';

/**
 * The large "latest on top" hero card used at the head of every Insights index
 * list (News, Blog, Exhibitions, Media, eBooks). Two-column on desktop: cover
 * image left, copy right, with a corner badge. Lifted from the News featured
 * card so all the index pages lead with an identical featured block.
 */
interface Props {
  href?: string;
  image?: string | null;
  title: string;
  excerpt?: string;
  /** Small uppercase brand line above the title (author · date · read time, or a date). */
  meta?: string;
  /** Corner badge label. */
  badgeLabel?: string;
  /** Call-to-action label. */
  ctaLabel?: string;
}

const ArrowR = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export default function FeaturedCard({
  href,
  image,
  title,
  excerpt,
  meta,
  badgeLabel = 'Latest',
  ctaLabel = 'Read more',
}: Props) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      {...(href ? { href } : {})}
      className={`group grid grid-cols-1 lg:grid-cols-2 bg-surface border border-ink/10 overflow-hidden ${href ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-surface-alt overflow-hidden">
        {image ? (
          <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/5">
            <span className="font-display font-heavy text-brand-500/25" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>E</span>
          </div>
        )}
        <span data-i18n={i18nAttr(badgeLabel)} className="absolute top-4 left-4 inline-block bg-brand-500 text-surface text-[10px] uppercase tracking-[0.25em] px-3 py-1.5">
          {badgeLabel}
        </span>
      </div>
      <div className="p-7 md:p-10 lg:p-12 flex flex-col justify-center">
        {meta && <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">{meta}</p>}
        <h2 className={`${meta ? 'mt-4 ' : ''}font-display font-heavy leading-[1.05] tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-500`} style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}>
          {title}
        </h2>
        <div aria-hidden="true" className="mt-6 h-px w-12 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-24"></div>
        {excerpt && <p className="mt-6 text-base md:text-lg text-ink/70 leading-[1.6] line-clamp-3">{excerpt}</p>}
        {href && (
          <span className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-brand-500 font-medium">
            <span data-i18n={i18nAttr(ctaLabel)}>{ctaLabel}</span> <ArrowR className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </Tag>
  );
}
