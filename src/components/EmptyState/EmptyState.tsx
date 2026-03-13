import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>No todos yet! Add one above to get started.</p>
    </div>
  );
}

