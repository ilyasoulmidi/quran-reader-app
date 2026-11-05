import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useT } from '../i18n';
import { IconRadio, IconTv } from './Icons';

/** Onglets « Radios | Direct » en haut des deux pages d'écoute. */
export default function ListenTabs() {
  const t = useT();
  const tabs = [
    { to: '/radio', label: t('radio'), icon: IconRadio },
    { to: '/live', label: t('live'), icon: IconTv },
  ];
  return (
    <div className="listen-tabs" role="tablist">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="listen-tab" role="tab">
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="listen-pill" className="listen-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <Icon size={17} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
