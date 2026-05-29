'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { worldwideContacts } from '@/data/worldwide-contacts';

/**
 * Flat 2D world map for /contact/worldwide/. Each marker fires
 * `onCountrySelect(code)`, which the parent (WorldwideExplorer) wires
 * into the contact form.
 *
 * Visual: equirectangular world map served from /public/images/world-map.svg
 * as a CSS mask (so we can colour the continents with a Tailwind utility
 * class). Markers are placed on top using the equirectangular projection:
 *   left % = (lng + 180) / 360
 *   top  % = (90  - lat) / 180
 *
 * Interaction: scroll-wheel + buttons zoom (1×–5×), drag to pan when
 * zoomed. A "did-move" guard suppresses the marker click if the pointer
 * was dragged more than PAN_THRESHOLD px between down and up.
 */

type Marker = {
  code: string;
  lat: number;
  lng: number;
  kind: 'subsidiary' | 'partner';
  /**
   * Visual nudge in percentage points of the map width/height. Used to
   * disperse the Eastern Mediterranean cluster (Cyprus, Lebanon, Egypt,
   * Greece, Turkey) which are geographically 5–20 px apart at 1× zoom
   * and otherwise overlap each other's hit areas.
   */
  nudge?: { x: number; y: number };
};

const markers: Marker[] = [
  // Subsidiaries
  { code: 'cy', lat: 35.0717, lng: 33.4136, kind: 'subsidiary' },
  { code: 'lb', lat: 34.1230, lng: 35.6519, kind: 'subsidiary', nudge: { x:  2.0, y:  0.5 } },
  { code: 'eg', lat: 30.3082, lng: 31.7426, kind: 'subsidiary', nudge: { x: -0.5, y:  2.5 } },
  { code: 'at', lat: 48.2189, lng: 14.5408, kind: 'subsidiary' },
  // Europe partners
  { code: 'gb', lat: 51.5074, lng: -0.1278, kind: 'partner' },
  { code: 'de', lat: 52.5200, lng: 13.4050, kind: 'partner' },
  { code: 'fr', lat: 48.8566, lng: 2.3522,  kind: 'partner' },
  { code: 'it', lat: 41.9028, lng: 12.4964, kind: 'partner' },
  { code: 'gr', lat: 37.9838, lng: 23.7275, kind: 'partner', nudge: { x: -1.5, y: -0.5 } },
  // MENA / Asia partners
  { code: 'ae', lat: 25.2048, lng: 55.2708, kind: 'partner' },
  { code: 'sa', lat: 24.7136, lng: 46.6753, kind: 'partner' },
  { code: 'tr', lat: 41.0082, lng: 28.9784, kind: 'partner', nudge: { x:  0,   y: -1.5 } },
  { code: 'jp', lat: 35.6762, lng: 139.6503, kind: 'partner' },
  // Africa
  { code: 'za', lat: -26.2041, lng: 28.0473, kind: 'partner' },
  // Oceania
  { code: 'au', lat: -33.8688, lng: 151.2093, kind: 'partner' },
  { code: 'nz', lat: -41.2865, lng: 174.7762, kind: 'partner' },
];

const project = (m: Marker) => {
  const baseX = ((m.lng + 180) / 360) * 100;
  const baseY = ((90 - m.lat) / 180) * 100;
  return {
    left: `${baseX + (m.nudge?.x ?? 0)}%`,
    top: `${baseY + (m.nudge?.y ?? 0)}%`,
  };
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.5;
const PAN_THRESHOLD = 5; // px — anything more is a drag, not a click

type Props = {
  /** Fires with the ISO alpha-2 country code when a marker is clicked. */
  onCountrySelect?: (code: string) => void;
  /** ISO alpha-2 code of the currently selected country, if any. */
  selectedCode?: string | null;
};

export default function ElyseeWorldMap({ onCountrySelect, selectedCode = null }: Props) {
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef({
    panning: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    didMove: false,
  });

  const clampPan = useCallback((x: number, y: number, z: number) => {
    const el = viewportRef.current;
    if (!el) return { x, y };
    const w = el.clientWidth;
    const h = el.clientHeight;
    const minX = -(z - 1) * w;
    const minY = -(z - 1) * h;
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      setZoom((prevZoom) => {
        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * factor));
        if (nextZoom === prevZoom) return prevZoom;
        setPan((prevPan) => {
          const lx = (cx - prevPan.x) / prevZoom;
          const ly = (cy - prevPan.y) / prevZoom;
          return clampPan(cx - lx * nextZoom, cy - ly * nextZoom, nextZoom);
        });
        return nextZoom;
      });
    },
    [clampPan],
  );

  const zoomToCenter = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    },
    [zoomAt],
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Native wheel listener so we can preventDefault (React's onWheel is passive).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 / 1.15 : 1.15;
      zoomAt(e.clientX, e.clientY, factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // Re-clamp pan whenever zoom changes (e.g. on reset, on viewport resize).
  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y, zoom));
  }, [zoom, clampPan]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If the pointer started on a marker button (or any button), let the
    // button handle its own click — capturing it on the viewport here
    // would suppress the click event on the original target.
    const target = e.target as HTMLElement | null;
    if (target?.closest('button')) return;
    panStateRef.current = {
      panning: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: pan.x,
      startTy: pan.y,
      didMove: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = panStateRef.current;
    if (!s.panning) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.didMove && Math.hypot(dx, dy) > PAN_THRESHOLD) {
      s.didMove = true;
    }
    if (s.didMove && zoom > 1) {
      setPan(clampPan(s.startTx + dx, s.startTy + dy, zoom));
    }
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    panStateRef.current.panning = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleMarkerClick = (code: string) => {
    if (panStateRef.current.didMove) return;
    onCountrySelect?.(code);
  };

  // Counter-scale style so marker dots/tooltips stay screen-constant in size
  // even as the underlying canvas zooms.
  const inverseScale = { transform: `scale(${1 / zoom})`, transformOrigin: 'center' };

  return (
    <div className="relative w-full">
      {/* Map viewport */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
        className={cn(
          'relative w-full aspect-[2/1] bg-surface-alt/40 border border-ink/10 overflow-hidden select-none touch-none',
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        )}
      >
        {/* Scene — everything that pans/zooms together */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Subtle grid lines (lat/lng) for graph-paper feel */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),' +
                'linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '12.5% 16.6667%',
            }}
          />

          {/* Continents — equirectangular SVG used as a mask so we can recolor */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/20"
            style={{
              WebkitMaskImage: 'url(/images/world-map.svg)',
              maskImage: 'url(/images/world-map.svg)',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />

          {/* Equator + prime meridian, faint */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-px bg-ink/10" />
          <div aria-hidden="true" className="absolute top-0 bottom-0 left-1/2 w-px bg-ink/10" />

          {/* Markers — partners rendered first so subsidiaries stack on top
              in the Eastern-Med cluster. */}
          {[...markers]
            .sort((a, b) => (a.kind === 'subsidiary' ? 1 : 0) - (b.kind === 'subsidiary' ? 1 : 0))
            .map((m) => {
              const pos = project(m);
              const contact = worldwideContacts[m.code];
              const isSelected = selectedCode === m.code;
              const isHovered = hoverCode === m.code;
              const isSubsidiary = m.kind === 'subsidiary';
              const isHQ = m.code === 'cy';
              const baseZ = isSubsidiary ? 'z-20' : 'z-10';

              return (
                <button
                  key={m.code}
                  type="button"
                  data-marker
                  onClick={() => handleMarkerClick(m.code)}
                  onMouseEnter={() => setHoverCode(m.code)}
                  onMouseLeave={() => setHoverCode(null)}
                  onFocus={() => setHoverCode(m.code)}
                  onBlur={() => setHoverCode(null)}
                  aria-label={contact?.label ?? m.code.toUpperCase()}
                  aria-pressed={isSelected}
                  style={pos}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2',
                    'flex items-center justify-center',
                    'w-6 h-6 rounded-full cursor-pointer',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    isHovered || isSelected ? 'z-30' : baseZ,
                  )}
                >
                  {/* Counter-scaled inner so dots + tooltips stay crisp at any zoom */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={inverseScale}
                  >
                    {/* HQ pulse */}
                    {isHQ && (
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-brand-500/40 animate-ping" />
                    )}
                    {/* Selected pulse */}
                    {isSelected && !isHQ && (
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-brand-500/50 animate-ping" />
                    )}
                    {/* Dot */}
                    <span
                      className={cn(
                        'block rounded-full ring-2 ring-surface transition-all duration-200',
                        isSubsidiary ? 'h-3 w-3' : 'h-2.5 w-2.5',
                        isSelected
                          ? 'bg-brand-700 scale-125'
                          : isSubsidiary
                          ? 'bg-brand-500'
                          : 'bg-ink/65',
                        (isHovered || isSelected) && 'scale-125 bg-brand-500',
                      )}
                    />
                    {/* Tooltip */}
                    <span
                      className={cn(
                        'absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap',
                        'text-[10px] uppercase tracking-[0.22em] font-medium',
                        'bg-ink text-surface px-2 py-1',
                        'transition-opacity duration-150',
                        isHovered || isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {contact?.country ?? m.code.toUpperCase()}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>

        {/* Zoom controls — fixed overlay (not scaled) */}
        <div className="absolute top-3 right-3 z-40 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoomToCenter(ZOOM_STEP); }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
            className="w-8 h-8 bg-surface text-ink shadow-sm border border-ink/15 hover:bg-brand-500 hover:text-surface hover:border-brand-500 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink disabled:hover:border-ink/15 transition-colors duration-150 flex items-center justify-center cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoomToCenter(1 / ZOOM_STEP); }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
            className="w-8 h-8 bg-surface text-ink shadow-sm border border-ink/15 hover:bg-brand-500 hover:text-surface hover:border-brand-500 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink disabled:hover:border-ink/15 transition-colors duration-150 flex items-center justify-center cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); reset(); }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            aria-label="Reset view"
            title="Reset view"
            className="w-8 h-8 bg-surface text-ink shadow-sm border border-ink/15 hover:bg-brand-500 hover:text-surface hover:border-brand-500 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink disabled:hover:border-ink/15 transition-colors duration-150 flex items-center justify-center cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.25em] text-ink/65">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-surface" />
          Subsidiary
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ink/65 ring-2 ring-surface" />
          Partner country
        </span>
        <span className="inline-flex items-center gap-2 ml-auto text-ink/45">
          <span aria-hidden="true">·</span>
          Scroll to zoom · Drag to pan
        </span>
      </div>
    </div>
  );
}
