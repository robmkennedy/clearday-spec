import type { Todo } from '../../types/todo';
import { TodoItem } from '../TodoItem/TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  togglingIds?: Set<number>;
  deletingIds?: Set<number>;
}

export function TodoList({ todos, onToggle, onDelete, togglingIds, deletingIds }: TodoListProps) {
  if (todos.length === 0) return null;

  return (
    <ul className={styles.todoList}>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          disableToggle={togglingIds?.has(todo.id)}
          disableDelete={deletingIds?.has(todo.id)}
        />
      ))}
    </ul>
  );
}

