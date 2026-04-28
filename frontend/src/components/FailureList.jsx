import styles from './FailureList.module.css';

function UrlRow({ result }) {
  const statusClass = result.healthy ? styles.healthy : styles.unhealthy;
  return (
    <div className={styles.urlRow}>
      <span className={`${styles.dot} ${statusClass}`} />
      <span className={styles.url}>{result.url}</span>
      <span className={styles.meta}>
        {result.status ? `HTTP ${result.status}` : result.error ?? 'no response'}
      </span>
      {result.latencyMs != null && (
        <span className={styles.latency}>{result.latencyMs}ms</span>
      )}
    </div>
  );
}

export default function FailureList({ urlResults = [], loginResult = null }) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>URL checks</p>
        {urlResults.map((r) => (
          <UrlRow key={r.url} result={r} />
        ))}
      </div>

      {loginResult && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Login check</p>
          <div className={styles.urlRow}>
            <span className={`${styles.dot} ${loginResult.success ? styles.healthy : styles.unhealthy}`} />
            <span className={styles.url}>
              {loginResult.success ? 'Login passed' : loginResult.reason ?? 'Login failed'}
            </span>
            {loginResult.status && (
              <span className={styles.meta}>HTTP {loginResult.status}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
