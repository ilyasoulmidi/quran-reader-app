import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import { setRead, fetchReads } from '../store/quranSlice';
import { playSurah, selectActiveAyah } from '../store/thunks';
import { IconCheck, IconClose, IconMic, IconSearch } from './Icons';
import { ErrorBox, Loader } from './Loader';

/** Bouton + fenêtre de choix du récitateur (avec recherche). */
export default function ReciterPicker({ compact = false }) {
  const t = useT();
  const dispatch = useDispatch();
  const store = useStore();
  const { reads, readsStatus, readId } = useSelector((s) => s.quran);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const current = reads.find((r) => r.id === readId);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const shown = useMemo(
    () => reads.filter((r) => !q || r.name.includes(q.trim()) || r.rewaya.includes(q.trim())),
    [reads, q]
  );

  const choose = (r) => {
    setOpen(false);
    if (r.id === readId) return;
    const state = store.getState();
    const track = state.player.track;
    const ayah = selectActiveAyah(state)?.ayah;
    dispatch(setRead(r.id));
    // Si une sourate est en cours : on la relance avec le nouveau récitateur, au même verset
    if (track?.kind === 'surah')
      dispatch(playSurah({ surahId: track.id, ayah: ayah || undefined, movePage: false, autoplay: state.player.isPlaying }));
  };

  return (
    <>
      <button className={`reciter-btn ${compact ? 'compact' : ''}`} onClick={() => setOpen(true)} title={t('chooseReciter')}>
        <span className="reciter-ico"><IconMic size={16} /></span>
        <span className="reciter-text">
          <small>{t('reciter')}</small>
          <b>{current?.name || '…'}</b>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              className="modal"
              role="dialog"
              aria-label={t('chooseReciter')}
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h3>{t('chooseReciter')}</h3>
                <span className="count">{reads.length}</span>
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('close')}>
                  <IconClose />
                </button>
              </div>
              <label className="search">
                <IconSearch size={18} />
                <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchReciter')} />
              </label>
              <div className="modal-list">
                {readsStatus === 'loading' && <Loader />}
                {readsStatus === 'failed' && <ErrorBox onRetry={() => dispatch(fetchReads())} />}
                {readsStatus === 'succeeded' && !shown.length && <p className="empty">{t('noResult')}</p>}
                {shown.map((r) => (
                  <button key={r.id} className={`reader-item ${r.id === readId ? 'active' : ''}`} onClick={() => choose(r)}>
                    <span className="reader-avatar" style={{ '--h': (r.id * 47) % 360 }}>{r.name.replace(/^ال/, '').charAt(0)}</span>
                    <span className="reader-meta">
                      <b>{r.name}</b>
                      <small>{r.rewaya} · {r.soar_count} سورة</small>
                    </span>
                    {r.id === readId && <IconCheck size={18} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
