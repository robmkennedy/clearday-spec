import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className={styles.errorContainer} role="alert">
      <p className={styles.errorText}>{message}</p>
      <button className={styles.retryButton} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

