'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { i18nAttr, i18nAttrFor } from '@/lib/i18n';

/**
 * Shop locator for /contact/local/ — three panes:
 *   left   · selectable list of shop names
 *   centre · live Google map of the selected shop (Map/Satellite toggle)
 *   right  · "Contact Details" panel for the selected shop
 *
 * Selecting a shop on the left updates both the map and the details panel.
 * The map is an embedded Google map (no API key — the classic `output=embed`
 * endpoint), centred on the shop's coordinates with a marker.
 *
 * Clicking the marker inside that embed triggers Google's place-details card,
 * which fails with "place info couldn't load" (the reverse-geocoded place ID is
 * stale → Places API NOT_FOUND). To avoid it, a transparent overlay covers the
 * map and intercepts clicks, opening the location in Google Maps in a new tab
 * instead — so the broken in-embed card can never fire.
 */

export interface ShopNode {
  name: string;
  area?: string;
  street?: string;
  phone?: string;
  phone2?: string;
  hours?: string;
  lat?: number;
  lng?: number;
}

interface Props {
  shops: ShopNode[];
}

/** Query for the embedded map: precise coordinates when known, else the address. */
function mapQuery(s: ShopNode): string {
  return s.lat != null && s.lng != null
    ? `${s.lat},${s.lng}`
    : encodeURIComponent([s.street, s.area, 'Cyprus'].filter(Boolean).join(', '));
}

function mapSrc(s: ShopNode): string {
  return `https://maps.google.com/maps?q=${mapQuery(s)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

/** Full Google Maps URL the click-overlay opens in a new tab (with Directions). */
function mapsLink(s: ShopNode): string {
  return `https://www.google.com/maps/search/?api=1&query=${mapQuery(s)}`;
}

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const FaxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export default function ShopLocator({ shops }: Props) {
  const [sel, setSel] = useState(0);
  const shop = shops[sel];
  const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`;

  // This island renders translated nodes after hydration; re-fire the swap so
  // the already-loaded listener applies the active language on first load.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [sel]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink/10 border border-ink/10">
      {/* ===== Left — shop list ===== */}
      <ul className="lg:col-span-3 bg-surface divide-y divide-ink/10" role="tablist" aria-label="Shops" data-i18n-attr={i18nAttrFor({ 'aria-label': 'Shops' })}>
        {shops.map((s, i) => {
          const isSel = i === sel;
          return (
            <li key={s.name}>
              <button
                type="button"
                role="tab"
                aria-selected={isSel}
                onClick={() => setSel(i)}
                className={cn(
                  'group relative w-full text-left px-6 py-5 md:py-6 text-base md:text-lg transition-colors duration-200 cursor-pointer',
                  isSel ? 'text-brand-500 font-heavy' : 'text-ink hover:text-brand-500',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500 transition-opacity duration-200',
                    isSel ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {s.name}
              </button>
            </li>
          );
        })}
      </ul>

      {/* ===== Centre — live Google map ===== */}
      <div className="lg:col-span-6 bg-surface-alt relative min-h-[360px] md:min-h-[460px]">
        <iframe
          key={sel}
          title={`Map showing the Elysée ${shop.name} shop`}
          src={mapSrc(shop)}
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {/* Transparent overlay: intercepts clicks so the embed's broken
            place-details card never fires; opens full Google Maps instead. */}
        <a
          href={mapsLink(shop)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the Elysée ${shop.name} location in Google Maps`}
          className="group absolute inset-0 z-10 block cursor-pointer"
        >
          <span
            className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-surface opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            data-i18n={i18nAttr('Open in Google Maps')}
          >
            Open in Google Maps
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </span>
        </a>
      </div>

      {/* ===== Right — contact details ===== */}
      <aside className="lg:col-span-3 bg-surface-alt p-6 md:p-8">
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink" data-i18n={i18nAttr('Contact Details')}>Contact Details</h3>
        {shop.area && (
          <p className="mt-3 text-sm font-semibold text-brand-500">{shop.area}</p>
        )}
        <dl className="mt-7 space-y-5 text-sm text-ink/85">
          {shop.street && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-500 shrink-0"><PinIcon /></span>
              <dd>{shop.street}</dd>
            </div>
          )}
          {shop.phone && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-500 shrink-0"><PhoneIcon /></span>
              <dd><a href={telHref(shop.phone)} className="hover:text-brand-500 transition-colors duration-200">{shop.phone}</a></dd>
            </div>
          )}
          {shop.phone2 && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-500 shrink-0"><FaxIcon /></span>
              <dd><a href={telHref(shop.phone2)} className="hover:text-brand-500 transition-colors duration-200">{shop.phone2}</a></dd>
            </div>
          )}
          {shop.hours && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-500 shrink-0"><ClockIcon /></span>
              <dd className="leading-relaxed whitespace-pre-line">{shop.hours}</dd>
            </div>
          )}
        </dl>
      </aside>
    </div>
  );
}
