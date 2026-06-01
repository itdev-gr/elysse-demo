import type { Post } from '../../types/post';

type Props = { post: Post };

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ post }: Props) {
  const author = post.author?.trim() || 'Elysée Group';
  const date = formatDate(post.published_at);
  const minutes = post.reading_minutes ?? 1;

  return (
    <a
      href={`/insights/blog/${post.slug}/`}
      className="group bg-surface border-l-4 border-brand-500 flex flex-col transition-colors duration-300 hover:bg-surface-alt"
    >
      <div className="relative w-full aspect-video bg-surface-alt overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/5">
            <span className="font-display font-heavy text-brand-500/30 text-4xl">E</span>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
          {[author, date, `${minutes} min read`].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-3 font-display font-heavy text-xl md:text-2xl text-ink leading-tight group-hover:text-brand-500 transition-colors duration-300">
          {post.title}
        </h3>
        <div aria-hidden="true" className="mt-4 h-px w-10 bg-brand-500"></div>
        <p className="mt-5 text-sm md:text-base text-ink/70 leading-[1.6] line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-brand-500 font-medium">
          Read article
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}
