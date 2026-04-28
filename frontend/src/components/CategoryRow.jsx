import { useState } from 'react';
import StatusBadge from './StatusBadge';
import FailureList from './FailureList';
import styles from './CategoryRow.module.css';

export default function CategoryRow({ name, meta, result, checking, onCheck }) {
  const [expanded, setExpanded] = useState(false);

  const status = checking ? 'loading' : result?.status ?? null;
  const hasDetail = result && !result.error;

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className={styles.row}>
      <div className={styles.main}>

        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>
            {meta.urlCount} URL{meta.urlCount !== 1 ? 's' : ''}
            {meta.hasLogin ? ' · login' : ''}
          </span>
        </div>

        <div className={styles.controls}>
          <StatusBadge status={status} />

          {result?.checkedAt && (
            <span className={styles.time}>{formatTime(result.checkedAt)}</span>
          )}

          <button
            className={styles.checkBtn}
            onClick={onCheck}
            disabled={checking}
          >
            {checking ? 'Checking…' : 'Check'}
          </button>

          <button
            className={`${styles.expandBtn} ${!hasDetail ? styles.hidden : ''}`}
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

      </div>

      {expanded && hasDetail && (
        <FailureList urlResults={result.urls} loginResult={result.login} />
      )}

      {result?.error && (
        <div className={styles.errorBanner}>{result.error}</div>
      )}
    </div>
  );
}
