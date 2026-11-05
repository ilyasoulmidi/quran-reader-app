import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import { fetchRadios, toggleFavRadio } from '../store/radioSlice';
import { togglePlay } from '../store/playerSlice';
import { playRadio, skip } from '../store/thunks';
import { ErrorBox, Skeleton } from '../components/Loader';
import ListenTabs from '../components/ListenTabs';
import { Equalizer, IconHeart, IconHeartFill, IconNext, IconPause, IconPlay, IconPrev, IconRadio, IconSearch } from '../components/Icons';

const cleanName = (n) => n.replace(/^(إذاعة|اذاعة|Radio)\s*/i, '');

export default function Radio() {
  const t = useT();
  const dispatch = useDispatch();
  const { radios, status, favorites, broken } = useSelector((s) => s.radio);
  const lang = useSelector((s) => s.ui.lang);
  const track = useSelector((s) => s.player.track);
  const isPlaying = useSelector((s) => s.player.isPlaying);
  const [q, setQ] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);

  const current = track?.kind === 'radio' ? track : null;

  const shown = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return radios.filter((r) => (!onlyFav || favorites.includes(r.id)) && (!nq || r.name.toLowerCase().includes(nq)));
  }, [radios, q, onlyFav, favorites]);

  return (
    <div className="page container">
      <ListenTabs />
      <motion.section className="radio-hero glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`radio-orb ${current && isPlaying ? 'playing' : ''}`}>
          <span className="ring r1" />
          <span className="ring r2" />
          <span className="ring r3" />
          <button
            className="orb-core"
            onClick={() => (current ? dispatch(togglePlay()) : radios[0] && dispatch(playRadio(radios[0])))}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {current && isPlaying ? <IconPause size={34} /> : <IconPlay size={34} />}
          </button>
        </div>
        <div className="radio-hero-text">
          <span className="eyebrow">
            {current ? (
              <>
                <span className="live-dot" /> {t('nowPlaying')}
              </>
            ) : (
              <>
                <IconRadio size={14} /> {t('radiosCount', { n: radios.length || '…' })}
              </>
            )}
          </span>
          <AnimatePresence mode="wait">
            <motion.h1 key={current?.id || 'none'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {current ? current.title : t('chooseRadio')}
            </motion.h1>
          </AnimatePresence>
          <div className="radio-hero-ctrls">
            <button className="ctrl" onClick={() => dispatch(current ? skip(-1) : playRadio(radios[radios.length - 1]))} disabled={!radios.length} aria-label={t('prev')}>
              <IconPrev size={20} />
            </button>
            <Equalizer active={!!current && isPlaying} />
            <button className="ctrl" onClick={() => dispatch(current ? skip(1) : playRadio(radios[0]))} disabled={!radios.length} aria-label={t('next')}>
              <IconNext size={20} />
            </button>
          </div>
        </div>
      </motion.section>

      <div className="list-toolbar">
        <label className="search grow">
          <IconSearch size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchRadio')} />
        </label>
        <div className="chips">
          <button className={`chip ${!onlyFav ? 'active' : ''}`} onClick={() => setOnlyFav(false)}>{t('all')}</button>
          <button className={`chip ${onlyFav ? 'active' : ''}`} onClick={() => setOnlyFav(true)}>
            <IconHeart size={14} /> {t('favorites')} {favorites.length ? `(${favorites.length})` : ''}
          </button>
        </div>
      </div>

      {status === 'failed' && <ErrorBox onRetry={() => dispatch(fetchRadios(lang))} />}
      <div className="radio-grid">
        {status === 'loading' && <Skeleton count={12} className="sk-card" />}
        {shown.map((r) => {
          const active = current?.id === r.id;
          const fav = favorites.includes(r.id);
          const off = broken.includes(r.id) && !active;
          return (
            <div
              key={r.id}
              className={`radio-card ${active ? 'active' : ''} ${off ? 'broken' : ''}`}
              title={off ? t('unavailable') : undefined}
              role="button"
              tabIndex={0}
              onClick={() => (active ? dispatch(togglePlay()) : dispatch(playRadio(r)))}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
            >
              <span className="radio-avatar" style={{ '--h': (r.id * 37) % 360 }}>
                {cleanName(r.name).charAt(0)}
              </span>
              <span className="radio-name">
                {r.name}
                {off && <small className="radio-off">{t('unavailable')}</small>}
              </span>
              <span className="radio-actions">
                {active && isPlaying ? <Equalizer /> : <span className="mini-play"><IconPlay size={14} /></span>}
                <button
                  className={`fav-btn ${fav ? 'on' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(toggleFavRadio(r.id));
                  }}
                  aria-label={t('favorites')}
                  aria-pressed={fav}
                >
                  {fav ? <IconHeartFill size={17} /> : <IconHeart size={17} />}
                </button>
              </span>
            </div>
          );
        })}
      </div>
      {status === 'succeeded' && !shown.length && <p className="empty">{t('noResult')}</p>}
    </div>
  );
}
