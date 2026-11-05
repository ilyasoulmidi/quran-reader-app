import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';
import { useT } from '../i18n';
import { TOTAL_AYAT, TOTAL_PAGES, TOTAL_SURAHS } from '../api';
import { fetchReads } from '../store/quranSlice';
import { playSurah } from '../store/thunks';
import {
  IconArrow, IconBeads, IconBook, IconLayers, IconMic, IconMoon, IconMosque, IconPin, IconPlay, IconRadio, IconSun, Star8,
} from '../components/Icons';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { PRAYER_ICONS } from './Prayer';
import { locationLabel } from '../components/LocationPicker';
import { defaultAdhkarKind, loadProgress } from './Adhkar';
import { MORNING, EVENING } from '../data/adhkar';
import { fmtCountdown } from '../time';

const POPULAR = [1, 18, 36, 55, 56, 67, 2, 112];

function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !to) return;
    let raf;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{to ? n.toLocaleString('en-US') : '…'}</span>;
}

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suwar, reads } = useSelector((s) => s.quran);
  const radios = useSelector((s) => s.radio.radios);
  const lastSurah = useSelector((s) => s.player.lastSurah);
  const last = suwar.find((s) => s.id === lastSurah);

  useEffect(() => {
    dispatch(fetchReads());
  }, [dispatch]);

  const listen = (id) => {
    dispatch(playSurah({ surahId: id, autoplay: false }));
    navigate('/mushaf');
  };

  const stats = [
    { n: TOTAL_SURAHS, label: t('statSurahs'), icon: IconLayers },
    { n: TOTAL_PAGES, label: t('statPages'), icon: IconBook },
    { n: TOTAL_AYAT, label: t('statAyat'), icon: Star8Icon },
    { n: reads.length, label: t('statReciters'), icon: IconMic },
    { n: radios.length, label: t('statRadios'), icon: IconRadio },
  ];

  const features = [
    { to: '/mushaf', icon: IconBook, title: t('fMushafT'), desc: t('fMushafD'), tone: 'emerald' },
    { to: '/prayer', icon: IconMosque, title: t('fPrayerT'), desc: t('fPrayerD'), tone: 'sky' },
    { to: '/adhkar', icon: IconBeads, title: t('fAdhkarT'), desc: t('fAdhkarD'), tone: 'gold' },
    { to: '/radio', icon: IconRadio, title: t('fListenT'), desc: t('fListenD', { n: radios.length || 100 }), tone: 'rose' },
  ];

  return (
    <div className="page container home">
      <section className="hero">
        <motion.span className="hero-badge" {...fade(0)}>
          <span className="pulse-dot" /> {t('heroBadge')}
        </motion.span>
        <motion.div className="hero-basmala" {...fade(1)}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</motion.div>
        <motion.h1 className="hero-title" {...fade(2)}>
          <span className="gradient-text">{t('heroTitle')}</span>
        </motion.h1>
        <motion.p className="hero-sub" {...fade(3)}>
          {t('heroSub', { n: reads.length || 100 })}
        </motion.p>
        <motion.div className="hero-cta" {...fade(4)}>
          <Link to="/mushaf" className="btn btn-primary btn-lg">
            <IconBook size={18} /> {t('startReading')}
          </Link>
          <Link to="/radio" className="btn btn-ghost btn-lg">
            <IconRadio size={18} /> {t('listenRadio')}
          </Link>
        </motion.div>
        <div className="hero-ornament" aria-hidden>
          <Star8 size={420} />
        </div>
      </section>

      <section className="today">
        <PrayerWidget />
        <AdhkarWidget />
      </section>

      <section className="stats">
        {stats.map(({ n, label, icon: Icon }, i) => (
          <motion.div key={label} className="stat glass" {...fade(5 + i)} whileHover={{ y: -4 }}>
            <span className="stat-ico"><Icon size={18} /></span>
            <b><CountUp to={n} /></b>
            <span>{label}</span>
          </motion.div>
        ))}
      </section>

      {last && (
        <section className="continue glass" data-aos="fade-up">
          <Star8 size={56} className="continue-star">{last.id}</Star8>
          <div className="continue-text">
            <small>{t('continue')}</small>
            <b>سورة {last.name}</b>
            <span className="muted">{last.nameTr || t('continueSub')}</span>
          </div>
          <button className="play-btn" onClick={() => listen(last.id)} aria-label={t('playSurah')}>
            <IconPlay size={20} />
          </button>
        </section>
      )}

      <section className="section">
        <div className="section-head" data-aos="fade-up">
          <h2>{t('featuresTitle')}</h2>
        </div>
        <div className="features">
          {features.map(({ to, icon: Icon, title, desc, tone }, i) => (
            <Link key={to} to={to} className={`feature glass tone-${tone}`} data-aos="fade-up" data-aos-delay={i * 100}>
              <span className="feature-ico"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="feature-link">{t('open')} <IconArrow size={16} className="flip-rtl" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head" data-aos="fade-up">
          <h2>{t('popular')}</h2>
        </div>
        <div className="popular">
          {POPULAR.map((id, i) => {
            const s = suwar.find((x) => x.id === id);
            return (
              <motion.button
                key={id}
                className="popular-card glass"
                onClick={() => listen(id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                data-aos="zoom-in"
                data-aos-delay={i * 50}
              >
                <Star8 size={38}>{id}</Star8>
                <span className="popular-name">{s ? s.name : '…'}</span>
                <span className="popular-tr">{s?.nameTr || (s ? `${s.end_page - s.start_page + 1} ${t('statPages')}` : '')}</span>
                <span className="popular-play"><IconPlay size={14} /></span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <footer className="footer">
        <Star8 size={22} /> <span>{t('footer')}</span>
      </footer>
    </div>
  );
}

const FIVE = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Carte « prochaine prière » avec compte à rebours. */
function PrayerWidget() {
  const t = useT();
  const lang = useSelector((s) => s.ui.lang);
  const pt = usePrayerTimes();
  return (
    <Link to="/prayer" className="today-card prayer-widget glass" data-aos="fade-up">
      <div className="today-head">
        <span className="today-ico sky-tone"><IconMosque size={18} /></span>
        <div className="today-title">
          <b>{t('prayerTitle')}</b>
          <small><IconPin size={12} /> {locationLabel(pt.location, lang)}</small>
        </div>
        <IconArrow size={16} className="flip-rtl today-arrow" />
      </div>
      {pt.ready ? (
        <>
          <div className="pw-main">
            <div>
              <small className="muted">{t('nextPrayer')}</small>
              <b className="pw-name">{t(pt.next.key.toLowerCase())} <span>{pt.next.time}</span></b>
            </div>
            <span className="pw-count">{fmtCountdown(pt.secondsLeft)}</span>
          </div>
          <div className="pw-row">
            {FIVE.map((k) => {
              const Icon = PRAYER_ICONS[k];
              return (
                <span key={k} className={`pw-chip ${k === pt.next.key ? 'next' : ''}`}>
                  <Icon size={15} />
                  <small>{t(k.toLowerCase())}</small>
                  <b>{pt.today.timings[k]}</b>
                </span>
              );
            })}
          </div>
        </>
      ) : (
        <div className="skeleton pw-skel" />
      )}
    </Link>
  );
}

/** Carte « adhkar du moment » (matin ou soir) avec la progression du jour. */
function AdhkarWidget() {
  const t = useT();
  const kind = defaultAdhkarKind();
  const list = kind === 'morning' ? MORNING : EVENING;
  const counts = loadProgress(kind);
  const done = list.filter((d) => (counts[d.id] || 0) >= d.count).length;
  const Icon = kind === 'morning' ? IconSun : IconMoon;
  return (
    <Link to={`/adhkar/${kind}`} className={`today-card adhkar-widget glass ${kind}`} data-aos="fade-up" data-aos-delay="80">
      <div className="today-head">
        <span className="today-ico gold-tone"><Icon size={18} /></span>
        <div className="today-title">
          <b>{kind === 'morning' ? t('morningAdhkar') : t('eveningAdhkar')}</b>
          <small>{t('adhkarNow')}</small>
        </div>
        <IconArrow size={16} className="flip-rtl today-arrow" />
      </div>
      <div className="aw-main">
        <div className="aw-left">
          <span className="aw-num" dir="ltr">{done}<small>/{list.length}</small></span>
          <small className="muted">{kind === 'morning' ? t('morningHint') : t('eveningHint')}</small>
        </div>
        <span className="btn btn-primary aw-btn">{done ? t('continueAdhkar') : t('start')}</span>
      </div>
      <div className="bar"><span style={{ width: `${(done / list.length) * 100}%` }} /></div>
    </Link>
  );
}

function Star8Icon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden>
      <rect x="20" y="20" width="60" height="60" rx="6" />
      <rect x="20" y="20" width="60" height="60" rx="6" transform="rotate(45 50 50)" />
    </svg>
  );
}
