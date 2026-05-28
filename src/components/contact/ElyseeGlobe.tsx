'use client';
/**
 * Elysée-specific wrapper around the Aceternity 3D globe.
 * Mounts as a React island on /contact/worldwide/ via `client:visible` so
 * the heavy Three.js bundle only loads when the user scrolls to the section.
 *
 * Markers: the four Elysée subsidiaries (Cyprus / Lebanon / Egypt / Austria)
 * plus a representative country in each export region. Flag images via
 * the free flagcdn.com CDN. Clicking a marker calls `onCountrySelect` with
 * the lowercase ISO alpha-2 code parsed from the marker's image URL.
 */
import { Globe3D, type GlobeMarker } from '@/components/ui/3d-globe';
import { useReducedMotion } from 'motion/react';

const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`;

const elyseeMarkers: GlobeMarker[] = [
  // 4 subsidiaries
  { lat: 35.0717, lng: 33.4136, src: flag('cy'), label: 'Cyprus · Ergates (HQ)' },
  { lat: 34.1230, lng: 35.6519, src: flag('lb'), label: 'Lebanon · Byblos (Elysée WISE)' },
  { lat: 30.3082, lng: 31.7426, src: flag('eg'), label: 'Egypt · 10th of Ramadan (Elysée PRIME)' },
  { lat: 48.2189, lng: 14.5408, src: flag('at'), label: 'Austria · Ennsdorf (Elysée Rohrsysteme)' },
  // Europe partners
  { lat: 51.5074, lng:  -0.1278, src: flag('gb'), label: 'United Kingdom' },
  { lat: 52.5200, lng:  13.4050, src: flag('de'), label: 'Germany' },
  { lat: 48.8566, lng:   2.3522, src: flag('fr'), label: 'France' },
  { lat: 41.9028, lng:  12.4964, src: flag('it'), label: 'Italy' },
  { lat: 37.9838, lng:  23.7275, src: flag('gr'), label: 'Greece' },
  // MENA / Asia partners
  { lat: 25.2048, lng:  55.2708, src: flag('ae'), label: 'United Arab Emirates' },
  { lat: 24.7136, lng:  46.6753, src: flag('sa'), label: 'Saudi Arabia' },
  { lat: 41.0082, lng:  28.9784, src: flag('tr'), label: 'Turkey' },
  { lat: 35.6762, lng: 139.6503, src: flag('jp'), label: 'Japan' },
  // Africa partner
  { lat: -26.2041, lng: 28.0473, src: flag('za'), label: 'South Africa' },
  // Oceania
  { lat: -33.8688, lng: 151.2093, src: flag('au'), label: 'Australia' },
  { lat: -41.2865, lng: 174.7762, src: flag('nz'), label: 'New Zealand' },
];

/** Extract the lowercase ISO code from a flagcdn.com URL. */
function codeFromMarker(marker: GlobeMarker): string | null {
  const m = marker.src.match(/flagcdn\.com\/w\d+\/([a-z]{2})\.png$/);
  return m ? m[1] : null;
}

type Props = {
  /** Fires with the ISO alpha-2 country code when a marker is clicked. */
  onCountrySelect?: (code: string) => void;
};

export default function ElyseeGlobe({ onCountrySelect }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="relative w-full aspect-square max-w-[680px] mx-auto">
      <Globe3D
        markers={elyseeMarkers}
        className="w-full h-full"
        config={{
          atmosphereColor: '#4c6830',
          atmosphereIntensity: reduce ? 8 : 18,
          bumpScale: 4,
          autoRotateSpeed: reduce ? 0 : 0.25,
        }}
        onMarkerClick={(marker) => {
          const code = codeFromMarker(marker);
          if (code && onCountrySelect) onCountrySelect(code);
        }}
      />
    </div>
  );
}
