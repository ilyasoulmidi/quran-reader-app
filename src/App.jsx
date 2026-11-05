import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import AOS from 'aos';
import Header, { BottomNav } from './components/Header';
import PlayerBar from './components/PlayerBar';
import Home from './pages/Home';
import Mushaf from './pages/Mushaf';
import Radio from './pages/Radio';
import Live from './pages/Live';
import Prayer from './pages/Prayer';
import Adhkar from './pages/Adhkar';
import { fetchSuwar } from './store/quranSlice';
import { fetchRadios } from './store/radioSlice';
import { LANGS } from './i18n';

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setTimeout(() => AOS.refreshHard(), 50);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={['radio', 'live'].includes(location.pathname.split('/')[1]) ? 'listen' : location.pathname.split('/')[1]}
        className="main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/mushaf/:surahId?" element={<Mushaf />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/adhkar/:kind?" element={<Adhkar />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="/live" element={<Live />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { theme, lang } = useSelector((s) => s.ui);
  const hasTrack = useSelector((s) => !!s.player.track);

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 40 });
  }, []);

  // Données dépendantes de la langue (noms des sourates / radios)
  useEffect(() => {
    dispatch(fetchSuwar(lang));
    dispatch(fetchRadios(lang));
  }, [lang, dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = lang;
    root.dir = LANGS.find((l) => l.code === lang)?.dir || 'rtl';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070b16' : '#f6f1e6');
  }, [theme, lang]);

  return (
    <HashRouter>
      <div className={`app-shell ${hasTrack ? 'has-player' : ''}`}>
        <div className="aurora" aria-hidden>
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
          <span className="pattern" />
        </div>
        <Header />
        <AnimatedRoutes />
        <PlayerBar />
        <BottomNav />
      </div>
    </HashRouter>
  );
}
