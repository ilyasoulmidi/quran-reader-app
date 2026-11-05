import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '../i18n';
import { YT_CHANNELS, ytEmbed, ytLivePage } from '../api';
import { IconExternal, IconTv } from '../components/Icons';
import ListenTabs from '../components/ListenTabs';

export default function Live() {
  const t = useT();
  const [id, setId] = useState(YT_CHANNELS[0].id);
  const ch = YT_CHANNELS.find((c) => c.id === id);
  const title = (c) => (c.id === 'quran' ? t('quranChannel') : t('sunnaChannel'));

  return (
    <div className="page container">
      <ListenTabs />
      <div className="section-head">
        <span className="eyebrow"><span className="live-dot" /> {t('liveBadge')}</span>
        <h1 className="gradient-text">{t('live')}</h1>
        <p className="muted">{t('liveSub')}</p>
      </div>

      <div className="live-tabs" role="tablist">
        {YT_CHANNELS.map((c) => (
          <button key={c.id} role="tab" aria-selected={id === c.id} className={`live-tab ${id === c.id ? 'active' : ''}`} onClick={() => setId(c.id)}>
            {id === c.id && <motion.span layoutId="live-pill" className="live-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <IconTv size={18} />
            <span>
              <b>{title(c)}</b>
              <small>{t(c.place)}</small>
            </span>
          </button>
        ))}
      </div>

      <motion.div key={ch.id} className="video-card glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="video-head">
          <span className="live-badge"><span className="live-dot" /> {t('liveBadge')}</span>
          <h2>{title(ch)}</h2>
          <a className="btn btn-ghost" href={ytLivePage(ch.handle)} target="_blank" rel="noreferrer">
            <IconExternal size={16} /> <span>{t('openYoutube')}</span>
          </a>
        </div>
        <div className="video-frame">
          <iframe
            key={ch.id}
            src={ytEmbed(ch.video)}
            title={title(ch)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
}
