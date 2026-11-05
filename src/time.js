// Outils de date / heure dans le fuseau horaire de la ville choisie.
const pad2 = (n) => String(n).padStart(2, '0');

/** Date et heure actuelles dans le fuseau `tz` (ou celui du navigateur). */
export function tzNow(tz) {
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz || undefined,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
  } catch {
    fmt = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
  }
  const parts = fmt.formatToParts(new Date());
  const g = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
  const h = g('hour') % 24;
  return {
    y: g('year'), m: g('month'), d: g('day'),
    min: h * 60 + g('minute') + g('second') / 60,
    sec: h * 3600 + g('minute') * 60 + g('second'),
  };
}

/**
 * Date et heure actuelles pour un décalage UTC donné (en minutes).
 * Indépendant de la base de fuseaux du navigateur : le décalage vient de l'API.
 */
export function offsetNow(offsetMin) {
  const d = new Date(Date.now() + offsetMin * 60000);
  const h = d.getUTCHours();
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    min: h * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60,
    sec: h * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds(),
  };
}

/** "+01:00" -> 60, "-05:00" -> -300 */
export const parseOffset = (iso) => {
  const m = String(iso).match(/([+-])(\d{2}):?(\d{2})$/);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
};

export const ddmmyyyy = ({ d, m, y }) => `${pad2(d)}-${pad2(m)}-${y}`;

export function addDays({ d, m, y }, n) {
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return { d: dt.getUTCDate(), m: dt.getUTCMonth() + 1, y: dt.getUTCFullYear() };
}

/** "05:23" -> 323 (minutes depuis minuit) */
export const toMin = (hhmm) => {
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number);
  return h * 60 + m;
};

/** 3725 -> "01:02:05" */
export const fmtCountdown = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};

export const fmtClock = (min) => `${pad2(Math.floor(min / 60) % 24)}:${pad2(Math.floor(min % 60))}`;

/** Date du jour (navigateur) au format AAAA-MM-JJ — sert à remettre les adhkar à zéro chaque jour. */
export const todayKey = () => {
  const n = tzNow();
  return `${n.y}-${pad2(n.m)}-${pad2(n.d)}`;
};
