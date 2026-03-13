import { useState, useRef, type FormEvent } from 'react';
import styles from './TodoInput.module.css';

interface TodoInputProps {
  onAdd: (description: string) => Promise<void>;
  disabled?: boolean;
}

export function TodoInput({ onAdd, disabled }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      setError('Description is required');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setValue('');
      inputRef.current?.focus();
    } catch {
      // Input preserved on error — don't clear value
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="new-todo">
        Add a new task
      </label>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          id="new-todo"
          className={styles.input}
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          maxLength={300}
          placeholder="What needs to be done?"
          aria-describedby={error ? 'input-error' : undefined}
          aria-invalid={error ? true : undefined}
          disabled={submitting || disabled}
        />
        <button
          className={styles.submitButton}
          type="submit"
          disabled={submitting || disabled}
        >
          Add
        </button>
      </div>
      {error && (
        <p id="input-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

