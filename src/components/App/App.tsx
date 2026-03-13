import { useTodos } from '../../hooks/useTodos';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { EmptyState } from '../EmptyState/EmptyState';
import { TodoInput } from '../TodoInput/TodoInput';
import { TodoList } from '../TodoList/TodoList';
import styles from './App.module.css';

function App() {
  const { todos, loading, error, statusMessage, addTodo, toggleTodo, deleteTodo, retry, submitting, togglingIds, deletingIds } = useTodos();

  const handleAddTodo = async (description: string) => {
    await addTodo(description);
    // Focus returns to input after adding (handled by TodoInput internally)
  };

  return (
    <div className={styles.app}>
      <h1>Todo App</h1>

      <TodoInput onAdd={handleAddTodo} disabled={submitting} />

      {loading && <LoadingSpinner />}

      {error && !loading && <ErrorMessage message={error} onRetry={retry} />}

      {!loading && !error && todos.length === 0 && <EmptyState />}

      {!loading && !error && todos.length > 0 && (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          togglingIds={togglingIds}
          deletingIds={deletingIds}
        />
      )}

      {/* Screen reader status announcements */}
      <div
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>
    </div>
  );
}

export default App;

