import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import {
  cycleRepeat, requestSeek, setBuffering, setDuration, setError, setNotice, setPlaying, setRate,
  setTime, setVolume, stop, togglePlay, toggleMute,
} from '../store/playerSlice';
import { audioFailed, audioOk, selectActiveAyah, skip } from '../store/thunks';
import {
  IconChevronDown, IconClose, IconMute, IconNext, IconPause, IconPlay, IconPrev, IconRepeat,
  IconVolume, Equalizer, Star8,
} from './Icons';

const RATES = [0.75, 1, 1.25, 1.5];

export const fmt = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

/** Infos affichées pour la piste courante (titre, sous-titre). */
function useTrackInfo() {
  const t = useT();
  const track = useSelector((s) => s.player.track);
  const suwar = useSelector((s) => s.quran.suwar);
  const reads = useSelector((s) => s.quran.reads);
  if (!track) return null;
  if (track.kind === 'radio') return { title: track.title, subtitle: t('radio'), badge: track.id };
  const surah = suwar.find((s) => s.id === track.id);
  const read = reads.find((r) => r.id === track.readId);
  return {
    title: surah ? `سورة ${surah.name}` : `#${track.id}`,
    tr: surah?.nameTr,
    subtitle: read?.name || '',
    badge: track.id,
  };
}

export default function PlayerBar() {
  const t = useT();
  const dispatch = useDispatch();
  const store = useStore();
  const audioRef = useRef(null);
  const pendingStart = useRef(0);
  const retries = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const p = useSelector((s) => s.player);
  const activeAyah = useSelector(selectActiveAyah);
  const info = useTrackInfo();
  const { track } = p;
  const isRadio = track?.kind === 'radio';

  // Nouvelle piste -> chargement + lecture
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    pendingStart.current = track.startAt || 0;
    retries.current = 0;
    a.src = track.url;
    a.playbackRate = isRadio ? 1 : p.rate;
    a.load();
    if (track.autoplay !== false) a.play().catch(() => dispatch(setPlaying(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.nonce]);

  // Les messages informatifs disparaissent seuls
  useEffect(() => {
    if (!p.notice) return;
    const id = setTimeout(() => dispatch(setNotice(null)), 4000);
    return () => clearTimeout(id);
  }, [p.notice, dispatch]);

  // Flux en erreur : 2 nouvelles tentatives, puis abandon (radio suivante)
  const onAudioError = () => {
    const a = audioRef.current;
    if (!track || !a) return;
    if (retries.current < 2) {
      retries.current += 1;
      const nonce = track.nonce;
      setTimeout(() => {
        if (store.getState().player.track?.nonce !== nonce) return;
        a.src = track.url;
        a.load();
        a.play().catch(() => {});
      }, 1200);
    } else {
      dispatch(audioFailed());
    }
  };

  // Lecture / pause demandées depuis n'importe quel composant
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (p.isPlaying && a.paused) a.play().catch(() => dispatch(setPlaying(false)));
    if (!p.isPlaying && !a.paused) a.pause();
  }, [p.isPlaying, track, dispatch]);

  useEffect(() => {
    if (p.seek && audioRef.current) audioRef.current.currentTime = p.seek.time;
  }, [p.seek]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = p.volume;
    a.muted = p.muted;
  }, [p.volume, p.muted]);

  useEffect(() => {
    if (audioRef.current && !isRadio) audioRef.current.playbackRate = p.rate;
  }, [p.rate, isRadio]);

  // Contrôles depuis l'écran de verrouillage du téléphone (Media Session API)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !info) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: info.title,
        artist: info.subtitle,
        album: 'Nour Al-Quran',
      });
      const ms = navigator.mediaSession;
      ms.setActionHandler('play', () => dispatch(setPlaying(true)));
      ms.setActionHandler('pause', () => dispatch(setPlaying(false)));
      ms.setActionHandler('nexttrack', () => dispatch(skip(1)));
      ms.setActionHandler('previoustrack', () => dispatch(skip(-1)));
    } catch {
      /* navigateur sans support complet */
    }
  }, [info?.title, info?.subtitle, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const onEnded = () => {
    if (isRadio) return;
    if (p.repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (p.repeat === 'next') {
      dispatch(skip(1, true));
    } else {
      dispatch(setPlaying(false));
    }
  };

  const progress = p.duration ? (p.currentTime / p.duration) * 100 : 0;
  const repeatLabel = { off: t('repeatOff'), one: t('repeatOne'), next: t('repeatNext') }[p.repeat];
  const nextRate = () => dispatch(setRate(RATES[(RATES.indexOf(p.rate) + 1) % RATES.length]));

  const audio = (
    <audio
      ref={audioRef}
      preload="auto"
      onPlay={() => dispatch(setPlaying(true))}
      onPause={() => dispatch(setPlaying(false))}
      onWaiting={() => dispatch(setBuffering(true))}
      onPlaying={() => {
        dispatch(setBuffering(false));
        dispatch(audioOk());
      }}
      onCanPlay={() => dispatch(setBuffering(false))}
      onLoadedMetadata={(e) => {
        if (pendingStart.current) {
          e.currentTarget.currentTime = pendingStart.current;
          pendingStart.current = 0;
        }
        dispatch(setDuration(e.currentTarget.duration));
      }}
      onTimeUpdate={(e) => dispatch(setTime(e.currentTarget.currentTime))}
      onError={onAudioError}
      onEnded={onEnded}
    />
  );

  const renderPlay = (big) => (
    <button
      className={`play-btn ${big ? 'big' : ''} ${p.buffering && p.isPlaying ? 'loading' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(togglePlay());
      }}
      aria-label={p.isPlaying ? 'Pause' : 'Play'}
    >
      {p.isPlaying ? <IconPause size={big ? 30 : 20} /> : <IconPlay size={big ? 30 : 20} />}
    </button>
  );

  const renderSeek = () =>
    isRadio ? (
      <div className="live-line">
        <span className="live-dot" /> {t('liveBadge')} · {fmt(p.currentTime)}
      </div>
    ) : (
      <div className="seek">
        <span className="time">{fmt(p.currentTime)}</span>
        <input
          type="range"
          className="range"
          min={0}
          max={p.duration || 0}
          step={0.1}
          value={Math.min(p.currentTime, p.duration || 0)}
          style={{ '--p': `${progress}%` }}
          onChange={(e) => dispatch(requestSeek(Number(e.target.value)))}
          aria-label="Seek"
        />
        <span className="time">{fmt(p.duration)}</span>
      </div>
    );

  return (
    <>
      {audio}
      <AnimatePresence>
        {track && info && (
          <motion.div
            className="player"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="player-progress" style={{ width: isRadio ? '100%' : `${progress}%` }} />

            <button className="player-info" onClick={() => setExpanded(true)} aria-label={info.title}>
              <span className={`player-art ${p.isPlaying ? 'spin' : ''}`}>
                <Star8 size={46}>{isRadio ? <IconRadioMini /> : info.badge}</Star8>
              </span>
              <span className="player-text">
                <span className="player-title">
                  {info.title}
                  {activeAyah && activeAyah.ayah > 0 && (
                    <span className="ayah-chip">{t('ayah')} {activeAyah.ayah}</span>
                  )}
                </span>
                <span className="player-sub">
                  {isRadio && <span className="live-dot" />}
                  {info.tr ? `${info.tr} · ` : ''}
                  {info.subtitle}
                </span>
              </span>
            </button>

            <div className="player-center">
              <div className="player-controls">
                <button className="ctrl" onClick={() => dispatch(skip(-1))} aria-label={t('prev')}>
                  <IconPrev size={18} />
                </button>
                {renderPlay()}
                <button className="ctrl" onClick={() => dispatch(skip(1))} aria-label={t('next')}>
                  <IconNext size={18} />
                </button>
              </div>
              {renderSeek()}
            </div>

            <div className="player-extra">
              {!isRadio && (
                <>
                  <button className={`ctrl small ${p.repeat !== 'off' ? 'on' : ''}`} onClick={() => dispatch(cycleRepeat())} title={repeatLabel} aria-label={repeatLabel}>
                    <IconRepeat size={17} />
                    {p.repeat === 'one' && <b className="repeat-one">1</b>}
                  </button>
                  <button className="ctrl small rate" onClick={nextRate} title={t('speed')}>
                    {p.rate}×
                  </button>
                </>
              )}
              <div className="volume">
                <button className="ctrl small" onClick={() => dispatch(toggleMute())} aria-label={t('volume')}>
                  {p.muted || p.volume === 0 ? <IconMute size={18} /> : <IconVolume size={18} />}
                </button>
                <input
                  type="range"
                  className="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={p.muted ? 0 : p.volume}
                  style={{ '--p': `${(p.muted ? 0 : p.volume) * 100}%` }}
                  onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
                  aria-label={t('volume')}
                />
              </div>
              <button className="ctrl small" onClick={() => dispatch(stop())} aria-label={t('close')}>
                <IconClose size={17} />
              </button>
            </div>

            <div className="player-mobile-ctrls">
              {renderPlay()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lecteur plein écran (téléphone) */}
      <AnimatePresence>
        {expanded && track && info && (
          <motion.div
            className="player-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && setExpanded(false)}
          >
            <div className="sheet-handle" />
            <button className="icon-btn sheet-close" onClick={() => setExpanded(false)} aria-label={t('close')}>
              <IconChevronDown />
            </button>
            <div className={`sheet-art ${p.isPlaying ? 'playing' : ''}`}>
              <div className="sheet-glow" />
              <Star8 size={200}>{isRadio ? <IconRadioMini big /> : info.badge}</Star8>
            </div>
            <div className="sheet-title">{info.title}</div>
            {info.tr && <div className="sheet-tr">{info.tr}</div>}
            <div className="sheet-sub">{info.subtitle}</div>
            {activeAyah && activeAyah.ayah > 0 && <div className="ayah-chip big">{t('ayah')} {activeAyah.ayah}</div>}
            <div className="sheet-seek">
              {renderSeek()}
            </div>
            <div className="sheet-controls">
              {!isRadio ? (
                <button className={`ctrl ${p.repeat !== 'off' ? 'on' : ''}`} onClick={() => dispatch(cycleRepeat())} aria-label={repeatLabel}>
                  <IconRepeat size={20} />
                  {p.repeat === 'one' && <b className="repeat-one">1</b>}
                </button>
              ) : <span className="ctrl ghost" />}
              <button className="ctrl" onClick={() => dispatch(skip(-1))} aria-label={t('prev')}>
                <IconPrev size={24} />
              </button>
              {renderPlay(true)}
              <button className="ctrl" onClick={() => dispatch(skip(1))} aria-label={t('next')}>
                <IconNext size={24} />
              </button>
              {!isRadio ? (
                <button className="ctrl rate" onClick={nextRate}>{p.rate}×</button>
              ) : <span className="ctrl ghost" />}
            </div>
            <div className="sheet-repeat-label">{!isRadio && repeatLabel}</div>
            {isRadio && <Equalizer active={p.isPlaying} />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(p.error || p.notice) && (
          <motion.div
            key={p.error ? 'error' : p.notice}
            className={`toast ${p.error ? '' : 'info'}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {p.error ? t(track?.kind === 'radio' ? 'radioError' : 'audioError') : t(p.notice)}
            <button
              className="icon-btn"
              onClick={() => (p.error ? dispatch(setError(false)) : dispatch(setNotice(null)))}
              aria-label={t('close')}
            >
              <IconClose size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconRadioMini({ big }) {
  const s = big ? 64 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49" />
    </svg>
  );
}
