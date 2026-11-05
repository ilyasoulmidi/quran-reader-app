import { NavLink, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useT, LANGS } from '../i18n';
import { setLang, toggleTheme } from '../store/uiSlice';
import { IconBeads, IconBook, IconHome, IconMoon, IconMosque, IconRadio, IconSun, Star8 } from './Icons';

// « Radios » couvre aussi la page Direct (onglets en haut de la page).
export const NAV = [
  { to: '/', key: 'home', icon: IconHome, end: true },
  { to: '/mushaf', key: 'mushaf', icon: IconBook },
  { to: '/prayer', key: 'prayer', icon: IconMosque },
  { to: '/adhkar', key: 'adhkar', icon: IconBeads },
  { to: '/radio', key: 'radio', icon: IconRadio, also: ['/live'] },
];

function useIsActive() {
  const { pathname } = useLocation();
  return (item, isActive) => isActive || (item.also || []).some((p) => pathname.startsWith(p));
}

export function Logo() {
  const t = useT();
  return (
    <Link to="/" className="logo" aria-label={t('appName')}>
      <Star8 size={34} className="logo-star" />
      <span className="logo-text">
        <span className="logo-ar">نور القرآن</span>
        <span className="logo-lat">Nour Al-Quran</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const t = useT();
  const dispatch = useDispatch();
  const { theme, lang } = useSelector((s) => s.ui);
  const activeFor = useIsActive();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Logo />

        <nav className="topnav" aria-label="Navigation">
          {NAV.map((item) => {
            const { to, key, icon: Icon, end } = item;
            return (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `topnav-link ${activeFor(item, isActive) ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  {activeFor(item, isActive) && (
                    <motion.span layoutId="nav-pill" className="topnav-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  <Icon size={18} />
                  <span>{t(key)}</span>
                </>
              )}
            </NavLink>
            );
          })}
        </nav>

        <div className="topbar-actions">
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`lang-btn ${lang === l.code ? 'active' : ''}`}
                onClick={() => dispatch(setLang(l.code))}
                title={l.name}
                aria-pressed={lang === l.code}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={() => dispatch(toggleTheme())} title={t('theme')} aria-label={t('theme')}>
            <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} style={{ display: 'flex' }}>
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </motion.span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const t = useT();
  const activeFor = useIsActive();
  return (
    <nav className="bottomnav" aria-label="Navigation">
      {NAV.map((item) => {
        const { to, key, icon: Icon, end } = item;
        return (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottomnav-link ${activeFor(item, isActive) ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              {activeFor(item, isActive) && <motion.span layoutId="bnav-pill" className="bottomnav-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <Icon size={22} />
              <span>{t(key)}</span>
            </>
          )}
        </NavLink>
        );
      })}
    </nav>
  );
}
