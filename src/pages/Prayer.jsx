import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT, hijriMonth } from '../i18n';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { fetchPrayer } from '../store/prayerSlice';
import { fmtClock, fmtCountdown } from '../time';
import SkyArc from '../components/SkyArc';
import LocationPicker, { locationLabel } from '../components/LocationPicker';
import { ErrorBox } from '../components/Loader';
import { IconDawn, IconMoon, IconMosque, IconPin, IconSun, IconSunLow, IconSunrise, IconSunset, IconTarget } from '../components/Icons';

export const PRAYER_ICONS = {
  Fajr: IconDawn, Sunrise: IconSunrise, Dhuhr: IconSun, Asr: IconSunLow, Maghrib: IconSunset, Isha: IconMoon,
};

export default function Prayer() {
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const pt = usePrayerTimes();
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState(null); // prière choisie pour voir le ciel à son heure

  // l'aperçu revient automatiquement à "maintenant"
  useEffect(() => {
    if (!preview) return;
    const id = setTimeout(() => setPreview(null), 6000);
    return () => clearTimeout(id);
  }, [preview]);

  const label = locationLabel(pt.location, lang);
  const hijri = pt.today?.hijri;
  const greg = pt.today?.date?.split('-');

  return (
    <div className="page container prayer-page">
      <div className="prayer-head">
        <div>
          <span className="eyebrow"><IconMosque size={14} /> {t('prayerTimesEyebrow')}</span>
          <h1 className="gradient-text">{t('prayerTitle')}</h1>
          {hijri && (
            <p className="muted date-line">
              {hijri.day} {hijriMonth(lang, hijri.month)} {hijri.year} {lang === 'ar' ? 'هـ' : 'H'}
              <span className="dot-sep" />
              {greg && new Date(Date.UTC(greg[2], greg[1] - 1, greg[0])).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
            </p>
          )}
        </div>
        <button className="loc-chip" onClick={() => setPicker(true)} title={t('changeLocation')}>
          <span className="loc-ico"><IconPin size={16} /></span>
          <span className="loc-text">
            <small>{t('changeLocation')}</small>
            <b>{label}</b>
          </span>
        </button>
      </div>

      {pt.status === 'failed' && <ErrorBox onRetry={() => dispatch(fetchPrayer())} />}
      {!pt.ready && pt.status !== 'failed' && (
        <>
          <div className="skeleton sk-sky" />
          <div className="prayer-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton sk-prayer" />)}</div>
        </>
      )}

      {pt.ready && (
        <>
          <motion.section className="sky-card glass" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <SkyArc
              T={pt.T}
              events={pt.events}
              minute={preview ? pt.T[preview] : pt.now.min}
              activeKey={preview || pt.next.key}
              onPick={(k) => setPreview(k === preview ? null : k)}
              nowLabel={t('nextPrayer')}
            />
            <div className="sky-info">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div key="preview" className="sky-info-main" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <small>{t('previewOf')}</small>
                    <b>{t(preview.toLowerCase())} · {pt.today.timings[preview]}</b>
                  </motion.div>
                ) : (
                  <motion.div key="next" className="sky-info-main" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <small>{t('nextPrayer')}</small>
                    <b>{t(pt.next.key.toLowerCase())} · {pt.next.time}</b>
                  </motion.div>
                )}
              </AnimatePresence>
              {preview ? (
                <button className="btn btn-ghost" onClick={() => setPreview(null)}>
                  <IconTarget size={16} /> {t('backToNow')}
                </button>
              ) : (
                <div className="countdown">
                  <span className="countdown-num">{fmtCountdown(pt.secondsLeft)}</span>
                  <small>{t('localTime')} {fmtClock(pt.now.min)}</small>
                </div>
              )}
            </div>
            {!preview && (
              <div className="next-progress">
                <span style={{ width: `${pt.progress * 100}%` }} />
              </div>
            )}
          </motion.section>

          <div className="prayer-grid">
            {pt.events.map((e, i) => {
              const Icon = PRAYER_ICONS[e.key];
              const isNext = e.key === pt.next.key && !pt.next.tomorrow;
              const isCurrent = e.key === pt.currentKey;
              const isPast = e.min <= pt.now.min && !isCurrent;
              return (
                <motion.button
                  key={e.key}
                  className={`prayer-card ${isNext ? 'next' : ''} ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${preview === e.key ? 'previewed' : ''} ${e.key === 'Sunrise' ? 'is-sunrise' : ''}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => setPreview(preview === e.key ? null : e.key)}
                >
                  <span className="prayer-ico"><Icon size={22} /></span>
                  <span className="prayer-name">{t(e.key.toLowerCase())}</span>
                  <span className="prayer-time">{e.time}</span>
                  {isNext && <span className="prayer-badge">{t('next')}</span>}
                  {isCurrent && <span className="prayer-badge now">{t('nowLabel')}</span>}
                </motion.button>
              );
            })}
          </div>

          <p className="hint prayer-hint">{t('tapPrayer')}</p>
          <p className="method-line muted">
            {t('method')} : {pt.today.method?.name || '—'}
          </p>
        </>
      )}

      <LocationPicker open={picker} onClose={() => setPicker(false)} />
    </div>
  );
}

