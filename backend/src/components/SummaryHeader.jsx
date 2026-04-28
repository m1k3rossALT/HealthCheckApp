import styles from './SummaryHeader.module.css';

export default function SummaryHeader({ summary, totalCategories }) {
  const checked = summary.green + summary.orange + summary.red;
  const unchecked = totalCategories - checked;

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>Health Check Dashboard</h1>
      </div>

      <div className={styles.stats}>
        {summary.green > 0 && (
          <span className={`${styles.stat} ${styles.green}`}>
            {summary.green} OK
          </span>
        )}
        {summary.orange > 0 && (
          <span className={`${styles.stat} ${styles.orange}`}>
            {summary.orange} Partial
          </span>
        )}
        {summary.red > 0 && (
          <span className={`${styles.stat} ${styles.red}`}>
            {summary.red} Down
          </span>
        )}
        {unchecked > 0 && (
          <span className={`${styles.stat} ${styles.gray}`}>
            {unchecked} Unchecked
          </span>
        )}
      </div>
    </header>
  );
}
