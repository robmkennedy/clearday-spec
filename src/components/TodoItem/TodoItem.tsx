import type { Todo } from '../../types/todo';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  disableToggle?: boolean;
  disableDelete?: boolean;
}

export function TodoItem({ todo, onToggle, onDelete, disableToggle, disableDelete }: TodoItemProps) {
  return (
    <li className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.description}" as ${todo.completed ? 'active' : 'completed'}`}
        disabled={disableToggle}
      />
      <label className={styles.label} onClick={() => onToggle(todo.id)}>
        {todo.description}
      </label>
      <button
        className={styles.deleteButton}
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete ${todo.description}`}
        disabled={disableDelete}
      >
        Delete
      </button>
    </li>
  );
}

