import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useT } from '../i18n';
import { toggleFavSurah, fetchSuwar } from '../store/quranSlice';
import { playSurah } from '../store/thunks';
import { ErrorBox, Skeleton } from './Loader';
import { Equalizer, IconHeart, IconHeartFill, IconSearch, Star8 } from './Icons';

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[ً-ٰٟ̀-ͯ'’\-\s]/g, '')
    .replace(/[أإآ]/g, 'ا');

export default function SurahList({ onPick }) {
  const t = useT();
  const dispatch = useDispatch();
  const { suwar, suwarStatus, favorites, page } = useSelector((s) => s.quran);
  const lang = useSelector((s) => s.ui.lang);
  const track = useSelector((s) => s.player.track);
  const isPlaying = useSelector((s) => s.player.isPlaying);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const listRef = useRef(null);

  const playingId = track?.kind === 'surah' ? track.id : null;
  const pageSurah = useMemo(
    () => [...suwar].reverse().find((s) => s.start_page <= page && s.end_page >= page)?.id,
    [suwar, page]
  );

  const shown = useMemo(() => {
    const nq = norm(q);
    return suwar.filter((s) => {
      if (filter === 'makki' && !s.makkia) return false;
      if (filter === 'madani' && s.makkia) return false;
      if (filter === 'fav' && !favorites.includes(s.id)) return false;
      if (!nq) return true;
      return String(s.id) === q.trim() || norm(s.name).includes(nq) || norm(s.nameTr).includes(nq);
    });
  }, [suwar, q, filter, favorites]);

  // Fait défiler la liste jusqu'à la sourate active
  const activeId = playingId || pageSurah;
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-id="${activeId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  const filters = [
    ['all', t('all')],
    ['makki', t('makki')],
    ['madani', t('madani')],
    ['fav', t('favorites')],
  ];

  return (
    <div className="surah-list">
      <div className="surah-list-head">
        <label className="search">
          <IconSearch size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchSurah')} />
        </label>
        <div className="chips">
          {filters.map(([k, label]) => (
            <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="surah-scroll" ref={listRef}>
        {suwarStatus === 'loading' && <Skeleton count={10} />}
        {suwarStatus === 'failed' && <ErrorBox onRetry={() => dispatch(fetchSuwar(lang))} />}
        {suwarStatus === 'succeeded' && !shown.length && <p className="empty">{t('noResult')}</p>}
        {shown.map((s) => {
          const fav = favorites.includes(s.id);
          const playing = playingId === s.id;
          return (
            <div
              key={s.id}
              data-id={s.id}
              role="button"
              tabIndex={0}
              className={`surah-item ${playing ? 'playing' : ''} ${!playingId && pageSurah === s.id ? 'current' : ''}`}
              onClick={() => {
                dispatch(playSurah({ surahId: s.id }));
                onPick?.();
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
            >
              <Star8 size={40} className="surah-num">{s.id}</Star8>
              <div className="surah-meta">
                <span className="surah-name-ar">{s.name}</span>
                <span className="surah-sub">
                  {s.nameTr && <span>{s.nameTr} · </span>}
                  <span className={`tag ${s.makkia ? 'tag-makki' : 'tag-madani'}`}>{s.makkia ? t('makki') : t('madani')}</span>
                  <span className="dim"> · {t('pages')} {s.start_page}–{s.end_page}</span>
                </span>
              </div>
              {playing && <Equalizer active={isPlaying} />}
              <button
                className={`fav-btn ${fav ? 'on' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(toggleFavSurah(s.id));
                }}
                aria-label={t('favorites')}
                aria-pressed={fav}
              >
                {fav ? <IconHeartFill size={18} /> : <IconHeart size={18} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
