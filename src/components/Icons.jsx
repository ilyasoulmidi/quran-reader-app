// Icônes SVG inline (aucune police d'icônes externe nécessaire).
const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

const make = (paths, filled = false) =>
  function Icon({ size = 20, className = '' }) {
    const p = base(size);
    if (filled) {
      p.fill = 'currentColor';
      p.stroke = 'none';
    }
    return (
      <svg {...p} className={className}>
        {paths}
      </svg>
    );
  };

export const IconHome = make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>);
export const IconBook = make(<><path d="M12 6.5C10.3 5 7.8 4.5 4 4.5v14c3.8 0 6.3.5 8 2 1.7-1.5 4.2-2 8-2v-14c-3.8 0-6.3.5-8 2Z" /><path d="M12 6.5v14" /></>);
export const IconRadio = make(<><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" /></>);
export const IconTv = make(<><rect x="2.5" y="6" width="19" height="13" rx="2.5" /><path d="m8 2.5 4 3.5 4-3.5" /></>);
export const IconPlay = make(<path d="M7 4.8v14.4a1 1 0 0 0 1.52.85l11.5-7.2a1 1 0 0 0 0-1.7L8.52 3.95A1 1 0 0 0 7 4.8Z" />, true);
export const IconPause = make(<><rect x="6" y="4" width="4.2" height="16" rx="1.4" /><rect x="13.8" y="4" width="4.2" height="16" rx="1.4" /></>, true);
export const IconNext = make(<><path d="M5 5.6v12.8a.9.9 0 0 0 1.4.75L15.5 13a1.2 1.2 0 0 0 0-2L6.4 4.85A.9.9 0 0 0 5 5.6Z" /><rect x="17" y="4.5" width="2.6" height="15" rx="1.1" /></>, true);
export const IconPrev = make(<><path d="M19 5.6v12.8a.9.9 0 0 1-1.4.75L8.5 13a1.2 1.2 0 0 1 0-2l9.1-6.15A.9.9 0 0 1 19 5.6Z" /><rect x="4.4" y="4.5" width="2.6" height="15" rx="1.1" /></>, true);
export const IconHeart = make(<path d="M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7-1.8 4.7-9.3 9.3-9.3 9.3Z" />);
export const IconHeartFill = make(<path d="M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7-1.8 4.7-9.3 9.3-9.3 9.3Z" />, true);
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconSun = make(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>);
export const IconMoon = make(<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />);
export const IconVolume = make(<><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>);
export const IconMute = make(<><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m22 9-6 6M16 9l6 6" /></>);
export const IconRepeat = make(<><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>);
export const IconChevronLeft = make(<path d="m15 18-6-6 6-6" />);
export const IconChevronRight = make(<path d="m9 18 6-6-6-6" />);
export const IconChevronDown = make(<path d="m6 9 6 6 6-6" />);
export const IconList = make(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>);
export const IconMic = make(<><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" /></>);
export const IconClose = make(<path d="M18 6 6 18M6 6l12 12" />);
export const IconCheck = make(<path d="M20 6 9 17l-5-5" />);
export const IconTarget = make(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 1.5V4M12 20v2.5M1.5 12H4M20 12h2.5" /></>);
export const IconEye = make(<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>);
export const IconExternal = make(<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>);
export const IconArrow = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconLayers = make(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>);

/** Étoile à huit branches (motif islamique) utilisée pour le logo et les numéros. */
export function Star8({ size = 40, className = '', children }) {
  return (
    <span className={`star8 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <rect x="18" y="18" width="64" height="64" rx="6" />
        <rect x="18" y="18" width="64" height="64" rx="6" transform="rotate(45 50 50)" />
      </svg>
      {children != null && <span className="star8-label">{children}</span>}
    </span>
  );
}

export function Equalizer({ active = true }) {
  return (
    <span className={`eq ${active ? 'on' : ''}`} aria-hidden>
      <i /><i /><i /><i />
    </span>
  );
}
