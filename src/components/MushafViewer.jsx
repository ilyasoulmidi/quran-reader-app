import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import { API, TOTAL_PAGES, juzOfPage, pageViewBox } from '../api';
import { fetchTiming, setFollow, setPage } from '../store/quranSlice';
import { requestSeek, setPlaying } from '../store/playerSlice';
import { playSurah, selectActiveAyah } from '../store/thunks';
import { IconChevronLeft, IconChevronRight, IconTarget } from './Icons';

// Animation "page qui tourne" (le mushaf se lit de droite à gauche :
// la page suivante arrive par la gauche).
const variants = {
  enter: (d) => ({ x: d > 0 ? '-35%' : '35%', opacity: 0, rotateY: d > 0 ? -18 : 18 }),
  center: { x: 0, opacity: 1, rotateY: 0 },
  exit: (d) => ({ x: d > 0 ? '35%' : '-35%', opacity: 0, rotateY: d > 0 ? 18 : -18 }),
};

export default function MushafViewer() {
  const t = useT();
  const dispatch = useDispatch();
  const { page, suwar, readId, timings, follow, nightPage } = useSelector((s) => s.quran);
  const track = useSelector((s) => s.player.track);
  const active = useSelector(selectActiveAyah);
  const [dir, setDir] = useState(1);
  const [loadedPage, setLoadedPage] = useState(0);
  const loaded = loadedPage === page;
  const dragged = useRef(false);
  const [w, h] = pageViewBox(page);

  const pageSurahs = useMemo(
    () => suwar.filter((s) => s.start_page <= page && s.end_page >= page),
    [suwar, page]
  );

  // Minutage des sourates présentes sur la page (pour rendre les versets cliquables)
  useEffect(() => {
    pageSurahs.forEach((s) => dispatch(fetchTiming({ surah: s.id, read: readId })));
  }, [pageSurahs, readId, dispatch]);

  // Pré-chargement des pages voisines -> changement de page instantané
  useEffect(() => {
    [page + 1, page - 1, page + 2].forEach((n) => {
      if (n >= 1 && n <= TOTAL_PAGES) new Image().src = API.page(n);
    });
  }, [page]);

  const playingSurah = track?.kind === 'surah' ? track : null;

  const polygons = useMemo(
    () =>
      pageSurahs.flatMap((s) => {
        const key = playingSurah && playingSurah.id === s.id ? `${s.id}-${playingSurah.readId}` : `${s.id}-${readId}`;
        return (timings[key]?.data || [])
          .filter((x) => x.page === page && x.points)
          .map((x) => ({ ...x, surah: s.id, surahName: s.name }));
      }),
    [pageSurahs, timings, page, readId, playingSurah]
  );

  // Suivi automatique : la page tourne toute seule avec la récitation
  useEffect(() => {
    if (follow && active?.page && active.page !== page) {
      setDir(active.page > page ? 1 : -1);
      dispatch(setPage(active.page));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.ayah, active?.page, follow]);

  const go = (n) => {
    if (n < 1 || n > TOTAL_PAGES || n === page) return;
    setDir(n > page ? 1 : -1);
    if (playingSurah) dispatch(setFollow(false));
    dispatch(setPage(n));
  };

  // Clavier : ← page suivante, → page précédente (sens de lecture arabe)
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') go(page + 1);
      if (e.key === 'ArrowRight') go(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onAyah = (p) => {
    if (dragged.current) return;
    if (playingSurah && playingSurah.id === p.surah) {
      dispatch(requestSeek(p.start / 1000));
      dispatch(setPlaying(true));
      dispatch(setFollow(true));
    } else {
      dispatch(playSurah({ surahId: p.surah, ayah: p.ayah, movePage: false }));
    }
  };

  const isActive = (p) => active && playingSurah && playingSurah.id === p.surah && active.ayah === p.ayah;

  return (
    <div className="mushaf-viewer">
      <div className="mushaf-stage">
        <button className="page-arrow side-left" onClick={() => go(page + 1)} disabled={page >= TOTAL_PAGES} aria-label={t('next')}>
          <IconChevronLeft size={26} />
        </button>

        <div className="page-wrap">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={page}
              className={`page-paper ${nightPage ? 'night' : ''} ${loaded ? 'ready' : ''}`}
              style={{ '--ratio': `${w} / ${h}` }}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                setTimeout(() => (dragged.current = false), 60);
                if (info.offset.x > 70 || info.velocity.x > 600) go(page + 1);
                else if (info.offset.x < -70 || info.velocity.x < -600) go(page - 1);
              }}
            >
              <img
                src={API.page(page)}
                alt={`${t('page')} ${page}`}
                draggable={false}
                onLoad={() => setLoadedPage(page)}
              />
              <svg className="ayah-layer" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                {polygons.map((p) => (
                  <polygon
                    key={`${p.surah}-${p.ayah}`}
                    points={p.points}
                    className={`ayah ${isActive(p) ? 'active' : ''}`}
                    onClick={() => onAyah(p)}
                  >
                    <title>{`${p.surahName} · ${t('ayah')} ${p.ayah}`}</title>
                  </polygon>
                ))}
              </svg>
              {!loaded && <div className="page-shimmer" />}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {!follow && active && (
              <motion.button
                className="resume-follow"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={() => {
                  dispatch(setFollow(true));
                  if (active.page) {
                    setDir(active.page > page ? 1 : -1);
                    dispatch(setPage(active.page));
                  }
                }}
              >
                <IconTarget size={16} /> {t('resumeFollow')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button className="page-arrow side-right" onClick={() => go(page - 1)} disabled={page <= 1} aria-label={t('prev')}>
          <IconChevronRight size={26} />
        </button>
      </div>

      <div className="page-bar">
        <button className="ctrl" onClick={() => go(page + 1)} disabled={page >= TOTAL_PAGES} aria-label={t('next')}>
          <IconChevronLeft size={20} />
        </button>
        <div className="page-bar-mid">
          <input
            type="range"
            className="range page-range"
            dir="rtl"
            min={1}
            max={TOTAL_PAGES}
            value={page}
            style={{ '--p': `${((page - 1) / (TOTAL_PAGES - 1)) * 100}%` }}
            onChange={(e) => go(Number(e.target.value))}
            aria-label={t('page')}
          />
          <div className="page-label">
            <span>{t('page')} <b>{page}</b> / {TOTAL_PAGES}</span>
            <span className="dot-sep" />
            <span>{t('juz')} <b>{juzOfPage(page)}</b></span>
          </div>
        </div>
        <button className="ctrl" onClick={() => go(page - 1)} disabled={page <= 1} aria-label={t('prev')}>
          <IconChevronRight size={20} />
        </button>
      </div>
      <p className="hint">{t('tapAyah')}</p>
    </div>
  );
}
