import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types/todo';
import * as todoApi from '../services/todoApi';

export interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  statusMessage: string;
  addTodo: (description: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  retry: () => void;
  submitting: boolean;
  togglingIds: Set<number>;
  deletingIds: Set<number>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todoApi.fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = useCallback(async (description: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const newTodo = await todoApi.createTodo({ description });
      setTodos(prev => [...prev, newTodo].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      setStatusMessage('Todo added');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setStatusMessage(`Error: ${message}`);
      throw err; // Re-throw so TodoInput knows to preserve input
    } finally {
      setSubmitting(false);
    }
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    setTogglingIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      const updated = await todoApi.toggleTodo(id);
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
      setStatusMessage(updated.completed ? 'Todo marked as completed' : 'Todo marked as active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatusMessage('Error: could not update todo');
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setStatusMessage('Todo deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatusMessage('Error: could not delete todo');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  return {
    todos,
    loading,
    error,
    statusMessage,
    addTodo,
    toggleTodo,
    deleteTodo,
    retry: loadTodos,
    submitting,
    togglingIds,
    deletingIds,
  };
}
