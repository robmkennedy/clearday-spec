import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as todoApi from '../../services/todoApi';
import type { Todo } from '../../types/todo';

vi.mock('../../services/todoApi');

const mockTodos: Todo[] = [
  { id: 1, description: 'Buy groceries', completed: false, createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, description: 'Walk the dog', completed: true, createdAt: '2026-01-02T00:00:00Z' },
];

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state initially then displays todos', async () => {
    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);

    render(<App />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    vi.mocked(todoApi.fetchTodos).mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows empty state when no todos', async () => {
    vi.mocked(todoApi.fetchTodos).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  it('retries after error', async () => {
    vi.mocked(todoApi.fetchTodos)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });
});

