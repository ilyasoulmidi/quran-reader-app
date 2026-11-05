import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import { COUNTRIES, METHODS } from '../data/countries';
import { setLocation } from '../store/prayerSlice';
import { IconClose, IconPin, IconTarget } from './Icons';

const regionNames = {};
export function countryName(code, lang) {
  try {
    const l = lang === 'en' ? 'en' : lang;
    regionNames[l] = regionNames[l] || new Intl.DisplayNames([l], { type: 'region' });
    return regionNames[l].of(code);
  } catch {
    return code;
  }
}

/** "الدار البيضاء، المغرب" / "Casablanca, Maroc" */
export function locationLabel(loc, lang) {
  if (!loc) return '';
  if (loc.type === 'coords') {
    const city = loc.label?.city;
    const country = loc.label?.countryCode ? countryName(loc.label.countryCode, lang) : '';
    return [city, country].filter(Boolean).join('، ') || '📍';
  }
  const c = COUNTRIES.find((x) => x.code === loc.country);
  const city = c?.cities.find((x) => x[0] === loc.city);
  const cityName = lang === 'ar' && city ? city[1] : loc.city;
  return `${cityName}${lang === 'ar' ? '، ' : ', '}${countryName(loc.country, lang)}`;
}

export default function LocationPicker({ open, onClose }) {
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const loc = useSelector((s) => s.prayer.location);
  const [country, setCountry] = useState(loc.type === 'city' ? loc.country : 'MA');
  const [city, setCity] = useState(loc.type === 'city' ? loc.city : 'Casablanca');
  const [method, setMethod] = useState('auto');
  const [geo, setGeo] = useState('idle'); // idle | locating | denied

  useEffect(() => {
    if (!open) return;
    setGeo('idle');
    if (loc.type === 'city') {
      setCountry(loc.country);
      setCity(loc.city);
      const def = COUNTRIES.find((c) => c.code === loc.country)?.method;
      setMethod(loc.method === def ? 'auto' : String(loc.method));
    }
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const countries = useMemo(
    () => [...COUNTRIES].sort((a, b) => countryName(a.code, lang).localeCompare(countryName(b.code, lang), lang)),
    [lang]
  );
  const current = COUNTRIES.find((c) => c.code === country);

  const save = () => {
    const entry = current.cities.find((c) => c[0] === city) || current.cities[0];
    dispatch(
      setLocation({
        type: 'city',
        country,
        city: entry[0],
        extra: entry[2] || null,
        method: method === 'auto' ? current.method : Number(method),
      })
    );
    onClose();
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setGeo('denied');
    setGeo('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = +pos.coords.latitude.toFixed(4);
        const lng = +pos.coords.longitude.toFixed(4);
        let label = null;
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang === 'en' ? 'en' : lang}`
          );
          const j = await r.json();
          label = { city: j.city || j.locality || '', countryCode: j.countryCode || '' };
        } catch {
          /* le nom de la ville est facultatif */
        }
        dispatch(setLocation({ type: 'coords', lat, lng, method: null, label }));
        setGeo('idle');
        onClose();
      },
      () => setGeo('denied'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal loc-modal"
            role="dialog"
            aria-label={t('changeLocation')}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h3>{t('changeLocation')}</h3>
              <span className="spacer" />
              <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
                <IconClose />
              </button>
            </div>

            <button className="btn btn-ghost geo-btn" onClick={useMyLocation} disabled={geo === 'locating'}>
              <IconTarget size={18} />
              <span>{geo === 'locating' ? t('locating') : t('useMyLocation')}</span>
            </button>
            {geo === 'denied' && <p className="form-error">{t('geoDenied')}</p>}

            <div className="or-sep"><span>{t('orChoose')}</span></div>

            <label className="field">
              <span>{t('country')}</span>
              <select
                value={country}
                onChange={(e) => {
                  const c = COUNTRIES.find((x) => x.code === e.target.value);
                  setCountry(c.code);
                  setCity(c.cities[0][0]);
                  setMethod('auto');
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{countryName(c.code, lang)}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('city')}</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {current.cities.map(([en, ar]) => (
                  <option key={en} value={en}>{lang === 'ar' ? ar : en}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('method')}</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="auto">{t('methodAuto')} — {METHODS.find((m) => m[0] === current.method)?.[1]}</option>
                {METHODS.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>

            <button className="btn btn-primary btn-lg save-btn" onClick={save}>
              <IconPin size={18} /> {t('save')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
