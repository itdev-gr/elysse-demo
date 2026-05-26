import type { NavItem } from '../../data/navigation';

type IconKey = NonNullable<NavItem['icon']>;

const PATHS: Record<IconKey, string> = {
  sparkles: 'M12 3v3M12 18v3M5 12H2M22 12h-3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2',
  chart: 'M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6',
  lightbulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1.5 1.5 1.5 2.5h5c0-1 .8-1.8 1.5-2.5A6 6 0 0 0 12 3z',
  handshake: 'M3 12l4-4 3 3 4-4 4 4 3 3-3 3-4-4-4 4-3-3-4 2z',
  newspaper: 'M5 4h12v16H5zM8 8h6M8 12h6M8 16h4M17 8h2v12h-2',
  pencil: 'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',
  marquee: 'M3 7h18v10H3zM6 17v3M18 17v3',
  play: 'M8 5l11 7-11 7V5z',
  book: 'M5 4h11a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H5z M5 4v15h12',
  pin: 'M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  dot: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
};

export default function MegaThumb({ label, icon = 'dot' }: { label: string; icon?: IconKey }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-500/95 via-brand-500 to-brand-600 text-white/90"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10 opacity-90"
        aria-hidden="true"
      >
        <path d={PATHS[icon]} />
      </svg>
    </div>
  );
}
