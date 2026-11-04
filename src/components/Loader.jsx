import { useT } from '../i18n';

export function Loader({ label }) {
  const t = useT();
  return (
    <div className="loader" role="status">
      <span className="loader-ring" />
      <span>{label || t('loading')}</span>
    </div>
  );
}

export function ErrorBox({ onRetry }) {
  const t = useT();
  return (
    <div className="errorbox">
      <p>{t('loadError')}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
    </div>
  );
}

export function Skeleton({ count = 8, className = 'sk-row' }) {
  return Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton ${className}`} />);
}
