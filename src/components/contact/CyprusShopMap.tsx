'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cyprus shop directory for /contact/local/.
 *
 * Left: the shops in a 2-column grid. Right: a branded Cyprus map (sticky on
 * desktop). Hovering or focusing a shop card highlights its pin on the map,
 * and hovering a pin highlights the matching card — a single `active` index
 * drives both directions.
 *
 * The coastline and the pins are drawn with the SAME `project()` function, so
 * a pin always lands at its real geographic spot on the outline. Longitude is
 * scaled by cos(latMid) so Cyprus keeps its true proportions.
 */

export interface ShopNode {
  name: string;
  region?: string;
  address?: string;
  phone?: string;
  phone2?: string;
  hours?: string;
  lat?: number;
  lng?: number;
}

interface Props {
  shops: ShopNode[];
}

// Fixed bounding box (with a little padding) keeps the framing stable.
const LNG_MIN = 32.2;
const LNG_MAX = 34.65;
const LAT_MIN = 34.5;
const LAT_MAX = 35.75;
const K = Math.cos((35.12 * Math.PI) / 180); // longitude compression at Cyprus' latitude
const GEO_W = (LNG_MAX - LNG_MIN) * K;
const GEO_H = LAT_MAX - LAT_MIN;
const VB_W = 1000;
const VB_H = Math.round((VB_W * GEO_H) / GEO_W); // preserve aspect ratio

const project = (lng: number, lat: number) => ({
  x: ((lng - LNG_MIN) * K) / GEO_W * VB_W,
  y: ((LAT_MAX - lat) / GEO_H) * VB_H,
});

// Simplified Cyprus coastline, clockwise from the Akamas (west) tip. [lng, lat]
const OUTLINE: [number, number][] = [
  [32.27, 35.06], [32.31, 35.18], [32.45, 35.18], [32.69, 35.18], [32.86, 35.16],
  [32.92, 35.4], [33.14, 35.33], [33.32, 35.34], [33.62, 35.34], [33.9, 35.4],
  [34.2, 35.55], [34.59, 35.69], [34.45, 35.55], [34.05, 35.3], [33.95, 35.12],
  [34.08, 34.96], [33.75, 34.97], [33.63, 34.92], [33.61, 34.83], [33.33, 34.73],
  [33.1, 34.7], [33.04, 34.67], [32.99, 34.56], [32.9, 34.66], [32.7, 34.66],
  [32.5, 34.7], [32.41, 34.75], [32.37, 34.86], [32.31, 34.97],
];

const OUTLINE_PATH =
  OUTLINE.map(([lng, lat], i) => {
    const { x, y } = project(lng, lat);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function CyprusShopMap({ shops }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const pinned = shops.map((s, i) => ({ ...s, i })).filter((s) => s.lat != null && s.lng != null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* ===== Shop cards — two columns ===== */}
      <ol className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
        {shops.map((shop, i) => {
          const isActive = active === i;
          return (
            <li key={shop.name}>
              <article
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn(
                  'group relative h-full flex flex-col p-6 md:p-7 outline-none transition-colors duration-300 cursor-default',
                  isActive ? 'bg-surface-alt' : 'bg-surface hover:bg-surface-alt',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display font-heavy leading-tight text-lg md:text-xl text-ink">{shop.name}</h3>
                  <span
                    className={cn(
                      'shrink-0 transition-colors duration-300',
                      isActive ? 'text-brand-500' : 'text-ink/25 group-hover:text-brand-500',
                    )}
                  >
                    <PinIcon />
                  </span>
                </div>
                {shop.region && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-brand-500">{shop.region}</p>
                )}
                <div
                  aria-hidden="true"
                  className={cn(
                    'mt-3 h-px bg-brand-500 transition-[width] duration-500 ease-out',
                    isActive ? 'w-16' : 'w-8',
                  )}
                />
                {shop.address && (
                  <p className="mt-4 text-sm text-ink/75 leading-relaxed whitespace-pre-line">{shop.address}</p>
                )}
                <dl className="mt-4 space-y-2 text-sm flex-1">
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-ink/80">
                      <span className="text-brand-500"><PhoneIcon /></span>
                      <dd className="flex flex-wrap gap-x-3">
                        <a href={`tel:${shop.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-500 transition-colors duration-200">{shop.phone}</a>
                        {shop.phone2 && (
                          <a href={`tel:${shop.phone2.replace(/[^+\d]/g, '')}`} className="hover:text-brand-500 transition-colors duration-200">{shop.phone2}</a>
                        )}
                      </dd>
                    </div>
                  )}
                  {shop.hours && (
                    <div className="flex items-start gap-2 text-ink/65">
                      <span className="text-brand-500 mt-0.5"><ClockIcon /></span>
                      <dd className="leading-relaxed whitespace-pre-line">{shop.hours}</dd>
                    </div>
                  )}
                </dl>
              </article>
            </li>
          );
        })}
      </ol>

      {/* ===== Cyprus map (sticky on desktop — inner wrapper sticks while the
             column stretches to the height of the shop list) ===== */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-32 relative bg-surface-alt border border-ink/10 p-4 md:p-6">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Map of Cyprus showing ${pinned.length} Elysée shop locations`}
          >
            {/* Island silhouette */}
            <path d={OUTLINE_PATH} className="fill-ink/[0.07] stroke-ink/20" strokeWidth={1.5} strokeLinejoin="round" />

            {pinned.map((shop) => {
              const { x, y } = project(shop.lng!, shop.lat!);
              const isActive = active === shop.i;
              return (
                <g
                  key={shop.name}
                  transform={`translate(${x} ${y})`}
                  onMouseEnter={() => setActive(shop.i)}
                  onMouseLeave={() => setActive(null)}
                  className="cursor-pointer"
                >
                  {/* Pulse ring on the active pin */}
                  {isActive && <circle r={26} className="fill-brand-500/15" />}
                  <circle
                    r={isActive ? 13 : 8}
                    className={cn(
                      'transition-all duration-300',
                      isActive ? 'fill-brand-500 stroke-surface' : 'fill-ink/45 stroke-surface',
                    )}
                    strokeWidth={3}
                  />
                  {/* Label appears for the active pin */}
                  {isActive && (
                    <g transform="translate(0 -22)">
                      <text
                        textAnchor="middle"
                        className="fill-ink font-semibold"
                        style={{ fontSize: '26px' }}
                      >
                        {shop.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-ink/45">
            Hover a shop to locate it
          </p>
        </div>
      </div>
    </div>
  );
}
