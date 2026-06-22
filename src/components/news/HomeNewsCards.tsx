import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchHomeFeatured, hrefFor } from '../../lib/home-featured';

/** Card shape shared by live data and the server-provided fallback. */
export interface HomeNewsItem {
  href: string | null;
  title: string;
  /** ISO timestamp (live) or any parseable date string (fallback). */
  date: string | null;
  image: string | null;
}

interface Props {
  /** Server-rendered fallback used when Supabase is unreachable. */
  fallback: HomeNewsItem[];
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HomeNewsCards({ fallback }: Props) {
  const [items, setItems] = useState<HomeNewsItem[]>(fallback);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const featured = await fetchHomeFeatured();
      if (cancelled || !featured || featured.length === 0) return;
      setItems(
        featured.map((item) => ({
          href: hrefFor(item),
          title: item.title,
          date: item.published_at,
          image: item.cover_image,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {items.map((a, i) => {
        const Tag = a.href ? 'a' : 'div';
        return (
          <Tag
            key={a.href ?? `${a.title}-${i}`}
            {...(a.href ? { href: a.href } : {})}
            className={`group block overflow-hidden bg-surface-alt transition-all duration-base ease-out-quint will-change-transform ${
              a.href ? 'hover:bg-surface hover:-translate-y-1 hover:shadow-lg' : ''
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
              {a.image ? (
                <img
                  src={a.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-out-quint group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-500/5">
                  <span className="font-display font-heavy text-brand-500/25" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                    E
                  </span>
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              {a.date && (
                <p className="text-xs uppercase tracking-widest text-brand-500 mb-2">{formatDate(a.date)}</p>
              )}
              <h3 className="text-2xl md:text-3xl font-display leading-tight">{a.title}</h3>
              {a.href && (
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink group-hover:text-brand-500 transition-colors duration-fast">
                  Learn more
                  <span aria-hidden="true" className="transition-transform duration-fast group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              )}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
