"use client";
import { Globe3D, type GlobeMarker } from "@/components/ui/3d-globe";

/**
 * Elysée-specific adaptation of the Aceternity Globe3DDemo
 * (src/components/3d-globe-demo.tsx). Same structure, same config keys,
 * same prop shapes — only the marker list and the click handler differ
 * so we can wire the flag click into the WorldwideExplorer's "selected
 * country" state.
 */

const elyseeMarkers: GlobeMarker[] = [
  // 4 Elysée subsidiaries
  {
    lat: 35.0717,
    lng: 33.4136,
    src: "https://flagcdn.com/w80/cy.png",
    label: "Cyprus · Ergates (HQ)",
  },
  {
    lat: 34.1230,
    lng: 35.6519,
    src: "https://flagcdn.com/w80/lb.png",
    label: "Lebanon · Byblos (Elysée WISE)",
  },
  {
    lat: 30.3082,
    lng: 31.7426,
    src: "https://flagcdn.com/w80/eg.png",
    label: "Egypt · 10th of Ramadan (Elysée PRIME)",
  },
  {
    lat: 48.2189,
    lng: 14.5408,
    src: "https://flagcdn.com/w80/at.png",
    label: "Austria · Ennsdorf (Elysée Rohrsysteme)",
  },
  // Europe partners
  {
    lat: 51.5074,
    lng: -0.1278,
    src: "https://flagcdn.com/w80/gb.png",
    label: "United Kingdom",
  },
  {
    lat: 52.5200,
    lng: 13.4050,
    src: "https://flagcdn.com/w80/de.png",
    label: "Germany",
  },
  {
    lat: 48.8566,
    lng: 2.3522,
    src: "https://flagcdn.com/w80/fr.png",
    label: "France",
  },
  {
    lat: 41.9028,
    lng: 12.4964,
    src: "https://flagcdn.com/w80/it.png",
    label: "Italy",
  },
  {
    lat: 37.9838,
    lng: 23.7275,
    src: "https://flagcdn.com/w80/gr.png",
    label: "Greece",
  },
  // MENA / Asia partners
  {
    lat: 25.2048,
    lng: 55.2708,
    src: "https://flagcdn.com/w80/ae.png",
    label: "United Arab Emirates",
  },
  {
    lat: 24.7136,
    lng: 46.6753,
    src: "https://flagcdn.com/w80/sa.png",
    label: "Saudi Arabia",
  },
  {
    lat: 41.0082,
    lng: 28.9784,
    src: "https://flagcdn.com/w80/tr.png",
    label: "Turkey",
  },
  {
    lat: 35.6762,
    lng: 139.6503,
    src: "https://flagcdn.com/w80/jp.png",
    label: "Japan",
  },
  // Africa partner
  {
    lat: -26.2041,
    lng: 28.0473,
    src: "https://flagcdn.com/w80/za.png",
    label: "South Africa",
  },
  // Oceania
  {
    lat: -33.8688,
    lng: 151.2093,
    src: "https://flagcdn.com/w80/au.png",
    label: "Australia",
  },
  {
    lat: -41.2865,
    lng: 174.7762,
    src: "https://flagcdn.com/w80/nz.png",
    label: "New Zealand",
  },
];

/** Extract the lowercase ISO code from a flagcdn.com URL. */
function codeFromMarker(marker: GlobeMarker): string | null {
  if (!marker.src) return null;
  const m = marker.src.match(/flagcdn\.com\/w\d+\/([a-z]{2})\.png$/);
  return m ? m[1] : null;
}

type Props = {
  /** Fires with the ISO alpha-2 country code when a marker is clicked. */
  onCountrySelect?: (code: string) => void;
};

export default function ElyseeGlobe({ onCountrySelect }: Props) {
  return (
    <div className="relative w-full aspect-square max-w-[680px] mx-auto">
      <Globe3D
        markers={elyseeMarkers}
        className="w-full h-full"
        config={{
          atmosphereColor: "#4da6ff",
          atmosphereIntensity: 20,
          bumpScale: 5,
          autoRotateSpeed: 0.3,
        }}
        onMarkerClick={(marker) => {
          const code = codeFromMarker(marker);
          if (code && onCountrySelect) onCountrySelect(code);
        }}
        onMarkerHover={(marker) => {
          if (marker) {
            // Hover surfaced by drei's Html; could drive a tooltip later.
          }
        }}
      />
    </div>
  );
}
