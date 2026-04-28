import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as api from '../api/categories';
import SummaryHeader from './SummaryHeader';
import CategoryRow from './CategoryRow';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [checkResults, setCheckResults] = useState({});
  const [checking, setChecking] = useState({});
  const [checkingAll, setCheckingAll] = useState(false);

  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData?.categories ?? {};
  const categoryNames = Object.keys(categories);

  async function handleCheck(name) {
    setChecking((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await api.checkCategory(name);
      setCheckResults((prev) => ({ ...prev, [name]: result }));
    } catch (err) {
      setCheckResults((prev) => ({ ...prev, [name]: { error: err.message } }));
    } finally {
      setChecking((prev) => ({ ...prev, [name]: false }));
    }
  }

  async function handleCheckAll() {
    setCheckingAll(true);
    await Promise.allSettled(categoryNames.map(handleCheck));
    setCheckingAll(false);
  }

  const summary = Object.values(checkResults).reduce(
    (acc, r) => {
      if (r?.status) acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { green: 0, orange: 0, red: 0 }
  );

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <p className={styles.stateText}>Loading categories…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorText}>Failed to load: {error.message}</p>
        <p className={styles.hint}>Is the backend running at {import.meta.env.VITE_API_URL}?</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SummaryHeader summary={summary} totalCategories={categoryNames.length} />

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <span className={styles.count}>{categoryNames.length} categories</span>
          <button
            className={styles.checkAllBtn}
            onClick={handleCheckAll}
            disabled={checkingAll || categoryNames.length === 0}
          >
            {checkingAll ? 'Checking all…' : 'Check all'}
          </button>
        </div>

        <div className={styles.list}>
          {categoryNames.length === 0 ? (
            <p className={styles.stateText}>No categories configured.</p>
          ) : (
            categoryNames.map((name) => (
              <CategoryRow
                key={name}
                name={name}
                meta={categories[name]}
                result={checkResults[name] ?? null}
                checking={!!checking[name]}
                onCheck={() => handleCheck(name)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
