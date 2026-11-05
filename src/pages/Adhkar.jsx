import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT, timesLabel } from '../i18n';
import { MORNING, EVENING } from '../data/adhkar';
import { load, save } from '../storage';
import { todayKey } from '../time';
import { IconCheck, IconMinus, IconMoon, IconPlus, IconRotate, IconSun, Star8 } from '../components/Icons';

const LISTS = { morning: MORNING, evening: EVENING };

/** Matin de 3 h à midi, soir le reste du temps. */
export const defaultAdhkarKind = () => {
  const h = new Date().getHours();
  return h >= 3 && h < 12 ? 'morning' : 'evening';
};

/** Progression du jour (remise à zéro automatiquement le lendemain). */
export function loadProgress(kind) {
  const saved = load(`adhkar-${kind}`, null);
  return saved && saved.date === todayKey() ? saved.counts : {};
}

const vibrate = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* non supporté */
  }
};

export default function Adhkar() {
  const t = useT();
  const navigate = useNavigate();
  const lang = useSelector((s) => s.ui.lang);
  const { kind: kindParam } = useParams();
  const kind = kindParam === 'morning' || kindParam === 'evening' ? kindParam : defaultAdhkarKind();
  const list = LISTS[kind];
  const [counts, setCounts] = useState(() => loadProgress(kind));
  const [size, setSize] = useState(() => load('adhkarSize', 1));
  const listRef = useRef(null);

  useEffect(() => setCounts(loadProgress(kind)), [kind]);
  useEffect(() => save(`adhkar-${kind}`, { date: todayKey(), counts }), [counts, kind]);
  useEffect(() => save('adhkarSize', size), [size]);

  const doneCount = list.filter((d) => (counts[d.id] || 0) >= d.count).length;
  const allDone = doneCount === list.length;
  const pct = (doneCount / list.length) * 100;

  const tap = (d, index) => {
    const c = counts[d.id] || 0;
    if (c >= d.count) return;
    const next = c + 1;
    setCounts((s) => ({ ...s, [d.id]: next }));
    vibrate(next >= d.count ? [20, 40, 30] : 12);
    if (next >= d.count) {
      // passe automatiquement au dhikr suivant non terminé
      const following = list.slice(index + 1).find((x) => (counts[x.id] || 0) < x.count);
      if (following) {
        setTimeout(() => {
          listRef.current?.querySelector(`[data-id="${following.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 380);
      }
    }
  };

  const tabs = useMemo(
    () => [
      { k: 'morning', label: t('morningAdhkar'), icon: IconSun },
      { k: 'evening', label: t('eveningAdhkar'), icon: IconMoon },
    ],
    [t]
  );

  return (
    <div className="page container adhkar-page">
      <div className="section-head">
        <span className="eyebrow">{t('adhkarEyebrow')}</span>
        <h1 className="gradient-text">{t('adhkarTitle')}</h1>
        <p className="muted">{kind === 'morning' ? t('morningHint') : t('eveningHint')}</p>
      </div>

      <div className="adhkar-tabs" role="tablist">
        {tabs.map(({ k, label, icon: Icon }) => (
          <button key={k} role="tab" aria-selected={kind === k} className={`adhkar-tab ${kind === k ? 'active' : ''} tab-${k}`} onClick={() => navigate(`/adhkar/${k}`)}>
            {kind === k && <motion.span layoutId="adhkar-pill" className="adhkar-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="adhkar-toolbar glass">
        <div className="adhkar-progress">
          <div className="adhkar-progress-top">
            <b dir="ltr">{doneCount} / {list.length}</b>
            <span className="muted">{t('tapToCount')}</span>
          </div>
          <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="adhkar-actions">
          <button className="icon-btn" onClick={() => setSize((s) => Math.max(0.85, +(s - 0.1).toFixed(2)))} aria-label={t('smallerText')} title={t('smallerText')}>
            <IconMinus size={16} />
          </button>
          <span className="size-label">{t('fontSize')}</span>
          <button className="icon-btn" onClick={() => setSize((s) => Math.min(1.5, +(s + 0.1).toFixed(2)))} aria-label={t('biggerText')} title={t('biggerText')}>
            <IconPlus size={16} />
          </button>
          <button className="icon-btn" onClick={() => setCounts({})} aria-label={t('resetAll')} title={t('resetAll')}>
            <IconRotate size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div className="adhkar-done glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Star8 size={56} className="done-star"><IconCheck size={24} /></Star8>
            <div>
              <b>{t('allDoneTitle', { name: kind === 'morning' ? t('morningAdhkar') : t('eveningAdhkar') })}</b>
              <span className="muted">{t('allDoneSub')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adhkar-list" ref={listRef} style={{ '--dhikr-size': size }}>
        {list.map((d, i) => {
          const c = counts[d.id] || 0;
          const done = c >= d.count;
          const ratio = c / d.count;
          return (
            <motion.div
              key={`${kind}-${d.id}`}
              data-id={d.id}
              className={`dhikr glass ${done ? 'done' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${i + 1}`}
              onClick={() => tap(d, i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tap(d, i))}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.04 }}
              whileTap={done ? undefined : { scale: 0.985 }}
            >
              <div className="dhikr-head">
                <Star8 size={34} className="dhikr-num">{i + 1}</Star8>
                <span className="dhikr-times">{timesLabel(lang, d.count)}</span>
                {d.note && <span className="dhikr-note">{t(`note${d.id}`)}</span>}
              </div>
              <p className="dhikr-text" lang="ar" dir="rtl">{d.text}</p>
              <div className="dhikr-foot">
                <div className="dhikr-bar"><span style={{ width: `${ratio * 100}%` }} /></div>
                <span className={`counter ${done ? 'ok' : ''}`}>
                  <svg viewBox="0 0 44 44" aria-hidden>
                    <circle cx="22" cy="22" r="19" className="ring-bg" />
                    <circle cx="22" cy="22" r="19" className="ring" style={{ strokeDashoffset: 119.4 * (1 - ratio) }} />
                  </svg>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.b key={done ? 'ok' : d.count - c} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.22 }}>
                      {done ? <IconCheck size={18} /> : d.count - c}
                    </motion.b>
                  </AnimatePresence>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="source-line muted">{t('adhkarSource')}</p>
    </div>
  );
}
