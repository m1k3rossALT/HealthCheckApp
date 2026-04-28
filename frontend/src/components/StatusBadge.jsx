import styles from './StatusBadge.module.css';

const STATUS_MAP = {
  green:    { label: 'All OK',      cls: 'green'   },
  orange:   { label: 'Partial',     cls: 'orange'  },
  red:      { label: 'Down',        cls: 'red'     },
  disabled: { label: 'Disabled',    cls: 'gray'    },
  loading:  { label: 'Checking…',   cls: 'loading' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? { label: '—', cls: 'idle' };
  return (
    <span className={`${styles.badge} ${styles[config.cls]}`}>
      {config.label}
    </span>
  );
}
