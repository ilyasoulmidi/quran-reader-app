import { useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useT } from '../i18n';

// Ciel animé : le soleil suit un arc entre le lever (gauche) et le coucher (droite).
// Avant le lever (Fajr) et après le coucher (Isha), il passe sous l'horizon ;
// la nuit, c'est la lune qui traverse le ciel.

const EXT = 0.09; // portion de l'arc sous l'horizon (Fajr / Isha)
const GEO = {
  wide: { W: 640, H: 350, cx: 320, hy: 250, r: 200, font: 15 },
  compact: { W: 420, H: 300, cx: 210, hy: 222, r: 132, font: 14 },
};

export function sunParam(t, T) {
  if (t >= T.Sunrise && t <= T.Maghrib) return (t - T.Sunrise) / (T.Maghrib - T.Sunrise);
  if (t >= T.Fajr && t < T.Sunrise) return -EXT * ((T.Sunrise - t) / (T.Sunrise - T.Fajr));
  if (t > T.Maghrib && t <= T.Isha) return 1 + EXT * ((t - T.Maghrib) / (T.Isha - T.Maghrib));
  return null;
}

function moonParam(t, T) {
  const tt = t < T.Fajr ? t + 1440 : t;
  const k = (tt - T.Isha) / (T.Fajr + 1440 - T.Isha);
  return 0.06 + 0.88 * Math.min(1, Math.max(0, k));
}

export function skyPhase(t, T) {
  if (t < T.Fajr || t >= T.Isha) return 'night';
  if (t < T.Sunrise) return 'dawn';
  if (t < T.Sunrise + 50) return 'sunrise';
  if (t < T.Asr) return 'day';
  if (t < T.Maghrib - 45) return 'afternoon';
  if (t < T.Maghrib + 15) return 'sunset';
  return 'dusk';
}

const PHASES = ['night', 'dawn', 'sunrise', 'day', 'afternoon', 'sunset', 'dusk'];

// étoiles à positions fixes (pseudo-aléatoires)
const STARS = Array.from({ length: 38 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 62, r: 0.6 + ((i * 7) % 5) * 0.25, d: (i % 7) * 0.4 };
});

function useCompact() {
  const q = '(max-width: 600px)';
  const [c, setC] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setC(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return c;
}

export default function SkyArc({ T, events, minute, activeKey, onPick, nowLabel }) {
  const t = useT();
  const compact = useCompact();
  const g = compact ? GEO.compact : GEO.wide;
  const { W, H, cx, hy, r } = g;

  const pos = (p) => {
    const a = Math.PI * (1 - p);
    return { x: cx + r * Math.cos(a), y: hy - r * Math.sin(a) };
  };

  const target = sunParam(minute, T);
  const isNight = target == null;
  const targetP = isNight ? moonParam(minute, T) : target;
  const phase = skyPhase(minute, T);

  // Animation du soleil (ou de la lune) vers sa nouvelle position
  const [p, setP] = useState(isNight ? targetP : -EXT);
  const pRef = useRef(p);
  const nightRef = useRef(isNight);
  useEffect(() => {
    if (nightRef.current !== isNight) {
      nightRef.current = isNight;
      pRef.current = isNight ? 0 : -EXT;
    }
    const big = Math.abs(targetP - pRef.current) > 0.01;
    const ctrl = animate(pRef.current, targetP, {
      duration: big ? 1.6 : 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        pRef.current = v;
        setP(v);
      },
    });
    return () => ctrl.stop();
  }, [targetP, isNight]);

  // Arc complet (pointillés) et partie déjà parcourue
  const arcPath = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 80; i++) pts.push(pos(-EXT + ((1 + 2 * EXT) * i) / 80));
    return pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
  }, [W, H, cx, hy, r]); // eslint-disable-line react-hooks/exhaustive-deps

  const donePath = useMemo(() => {
    if (isNight) return '';
    const pts = [];
    const end = Math.max(-EXT, p);
    const n = 60;
    for (let i = 0; i <= n; i++) pts.push(pos(-EXT + ((end + EXT) * i) / n));
    return pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
  }, [p, isNight, cx, hy, r]); // eslint-disable-line react-hooks/exhaustive-deps

  const body = pos(p);

  const lineH = g.font * 1.15;
  const markers = events.map((e) => {
    const mp = e.key === 'Fajr' ? -EXT : e.key === 'Isha' ? 1 + EXT : Math.min(1, Math.max(0, sunParam(e.min, T) ?? 0));
    const q = pos(mp);
    const left = q.x < cx;
    const twoLines = !compact;
    let lx;
    let ly;
    let anchor;
    if (mp <= 0.04 || mp >= 0.96) {
      // horizon / sous l'horizon : étiquette à l'extérieur, sur le côté
      anchor = left ? 'end' : 'start';
      lx = q.x + (left ? -14 : 14);
      ly = q.y + (twoLines ? -lineH * 0.35 : g.font * 0.35);
    } else if (Math.abs(q.x - cx) < r * 0.3) {
      // haut de l'arc (Dhuhr) : au-dessus
      anchor = 'middle';
      lx = q.x;
      ly = q.y - 14 - (twoLines ? lineH : 0);
    } else {
      // sur l'arc : vers l'extérieur
      const nx = (q.x - cx) / r;
      const ny = (q.y - hy) / r;
      anchor = left ? 'end' : 'start';
      lx = q.x + nx * 16;
      ly = q.y + ny * 16 - (twoLines ? lineH * 0.3 : -g.font * 0.3);
    }
    return { ...e, q, lx, ly, anchor };
  });

  return (
    <div className={`sky phase-${phase}`}>
      {PHASES.map((ph) => (
        <span key={ph} className={`sky-layer sky-${ph}`} style={{ opacity: ph === phase ? 1 : 0 }} />
      ))}
      <svg className="sky-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={nowLabel} direction="ltr">
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="#fff7d6" stopOpacity="1" />
            <stop offset="0.35" stopColor="#ffd36b" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonGlow">
            <stop offset="0" stopColor="#e9f0ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#9fb4ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arcDone" x1="0" x2="1">
            <stop offset="0" stopColor="#ffd36b" />
            <stop offset="1" stopColor="#ff9f5a" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0d1d33" />
            <stop offset="1" stopColor="#03060f" />
          </linearGradient>
          <mask id="crescent">
            <rect x="-30" y="-30" width="60" height="60" fill="#fff" />
            <circle cx="7" cy="-5" r="13" fill="#000" />
          </mask>
        </defs>

        {/* étoiles */}
        <g className="stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={(s.x / 100) * W * 2 - W * 0.5} cy={(s.y / 100) * H} r={s.r} style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>

        {/* arc */}
        <path d={arcPath} className="arc-track" />
        {donePath && <path d={donePath} className="arc-done" />}

        {/* soleil / lune */}
        <g transform={`translate(${body.x.toFixed(1)} ${body.y.toFixed(1)})`} className={isNight ? 'moon' : 'sun'}>
          {isNight ? (
            <>
              <circle r="34" fill="url(#moonGlow)" />
              <circle r="15" className="moon-disc" mask="url(#crescent)" />
            </>
          ) : (
            <>
              <circle r="44" fill="url(#sunGlow)" className="sun-glow" />
              <g className="sun-rays">
                {Array.from({ length: 12 }, (_, i) => (
                  <line key={i} x1="0" y1="-22" x2="0" y2="-29" transform={`rotate(${i * 30})`} />
                ))}
              </g>
              <circle r="15" className="sun-core" />
            </>
          )}
        </g>

        {/* sol + silhouette de mosquée */}
        <g className="ground">
          <rect x={-W} y={hy} width={W * 3} height={H - hy} fill="url(#groundGrad)" className="ground-fill" />
          <g transform={`translate(${cx - 320 * (compact ? 0.62 : 1)} ${hy - 240 * (compact ? 0.62 : 1)}) scale(${compact ? 0.62 : 1})`} className="mosque">
            <rect x="250" y="205" width="140" height="35" />
            <path d="M282 205 Q282 160 320 148 Q358 160 358 205 Z" />
            <rect x="319" y="132" width="2" height="18" />
            <circle cx="320" cy="130" r="3" />
            <path d="M252 207 Q252 188 266 183 Q280 188 280 207 Z" />
            <path d="M360 207 Q360 188 374 183 Q388 188 388 207 Z" />
            <rect x="232" y="150" width="11" height="90" />
            <path d="M229 151 L237.5 126 L246 151 Z" />
            <rect x="228" y="172" width="19" height="5" rx="1" />
            <rect x="397" y="150" width="11" height="90" />
            <path d="M394 151 L402.5 126 L411 151 Z" />
            <rect x="393" y="172" width="19" height="5" rx="1" />
          </g>
          <line x1={-W} y1={hy} x2={W * 2} y2={hy} className="horizon" />
        </g>

        {/* repères des prières */}
        {markers.map((m) => (
          <g
            key={m.key}
            className={`marker ${m.key === activeKey ? 'active' : ''} ${m.key === 'Sunrise' ? 'sunrise' : ''}`}
            onClick={() => onPick?.(m.key)}
          >
            <circle cx={m.q.x} cy={m.q.y} r="9" className="marker-hit" />
            <circle cx={m.q.x} cy={m.q.y} r={m.key === activeKey ? 6 : 4.5} className="marker-dot" />
            <text x={m.lx} y={m.ly} textAnchor={m.anchor} className="marker-label" style={{ fontSize: g.font }}>
              <tspan>{t(m.key.toLowerCase())}</tspan>
              {!compact && (
                <tspan x={m.lx} dy="1.15em" className="marker-time">
                  {m.time}
                </tspan>
              )}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
