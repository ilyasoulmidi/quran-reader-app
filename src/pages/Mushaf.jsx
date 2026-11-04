import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import { fetchReads, setPage, toggleFavSurah, toggleNightPage, setFollow } from '../store/quranSlice';
import { togglePlay } from '../store/playerSlice';
import { playSurah } from '../store/thunks';
import SurahList from '../components/SurahList';
import MushafViewer from '../components/MushafViewer';
import ReciterPicker from '../components/ReciterPicker';
import { IconClose, IconEye, IconHeart, IconHeartFill, IconList, IconPause, IconPlay, IconTarget } from '../components/Icons';

export default function Mushaf() {
  const t = useT();
  const dispatch = useDispatch();
  const { surahId } = useParams();
  const { suwar, page, follow, nightPage, favorites } = useSelector((s) => s.quran);
  const track = useSelector((s) => s.player.track);
  const isPlaying = useSelector((s) => s.player.isPlaying);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    dispatch(fetchReads());
  }, [dispatch]);

  // Lien direct /mushaf/18 -> ouvre la sourate Al-Kahf
  useEffect(() => {
    const s = suwar.find((x) => x.id === Number(surahId));
    if (s) dispatch(setPage(s.start_page));
  }, [surahId, suwar, dispatch]);

  const pageSurahs = useMemo(() => suwar.filter((s) => s.start_page <= page && s.end_page >= page), [suwar, page]);
  const main = pageSurahs[pageSurahs.length - 1];
  const playingThis = track?.kind === 'surah' && main && track.id === main.id;
  const fav = main && favorites.includes(main.id);

  return (
    <div className="mushaf-layout">
      <AnimatePresence>
        {drawer && (
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
        )}
      </AnimatePresence>

      <aside className={`surah-panel ${drawer ? 'open' : ''}`}>
        <div className="drawer-head">
          <b>{t('surahs')}</b>
          <button className="icon-btn" onClick={() => setDrawer(false)} aria-label={t('close')}>
            <IconClose />
          </button>
        </div>
        <SurahList onPick={() => setDrawer(false)} />
      </aside>

      <section className="mushaf-main">
        <div className="mushaf-toolbar">
          <button className="btn btn-ghost drawer-toggle" onClick={() => setDrawer(true)}>
            <IconList size={18} /> <span>{t('surahs')}</span>
          </button>

          <div className="mushaf-title">
            <AnimatePresence mode="wait">
              <motion.div key={pageSurahs.map((s) => s.id).join('-')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <span className="mushaf-title-ar">{pageSurahs.map((s) => `سورة ${s.name}`).join(' · ') || '…'}</span>
                {main?.nameTr && <span className="mushaf-title-tr">{pageSurahs.map((s) => s.nameTr).join(' · ')}</span>}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mushaf-tools">
            {main && (
              <button
                className="btn btn-primary"
                onClick={() => (playingThis ? dispatch(togglePlay()) : dispatch(playSurah({ surahId: main.id })))}
              >
                {playingThis && isPlaying ? <IconPause size={16} /> : <IconPlay size={16} />}
                <span>{t('playSurah')}</span>
              </button>
            )}
            <ReciterPicker compact />
            <button className={`icon-btn ${follow ? 'on' : ''}`} onClick={() => dispatch(setFollow(!follow))} title={t('follow')} aria-pressed={follow}>
              <IconTarget size={18} />
            </button>
            <button className={`icon-btn ${nightPage ? 'on' : ''}`} onClick={() => dispatch(toggleNightPage())} title={t('nightPage')} aria-pressed={nightPage}>
              <IconEye size={18} />
            </button>
            {main && (
              <button className={`icon-btn ${fav ? 'on fav' : ''}`} onClick={() => dispatch(toggleFavSurah(main.id))} title={t('favorites')} aria-pressed={fav}>
                {fav ? <IconHeartFill size={18} /> : <IconHeart size={18} />}
              </button>
            )}
          </div>
        </div>

        <MushafViewer />
      </section>
    </div>
  );
}
