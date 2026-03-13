import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo';

const mockTodo: Todo = {
  id: 1,
  description: 'Buy groceries',
  completed: false,
  createdAt: '2026-01-01T00:00:00Z',
};

const completedTodo: Todo = {
  id: 2,
  description: 'Walk the dog',
  completed: true,
  createdAt: '2026-01-02T00:00:00Z',
};

describe('TodoItem', () => {
  it('renders the description', () => {
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('displays completed status visually', () => {
    render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    const label = screen.getByText('Walk the dog');
    expect(label).toBeInTheDocument();
    // The completed todo should have a visual class applied
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('uses semantic <li> element', () => {
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('checkbox toggle calls onToggle with todo id', async () => {
    const onToggle = vi.fn();
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={onToggle} onDelete={() => {}} />
      </ul>
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('completed styling applied (checkbox checked)', () => {
    render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('uncompleted checkbox is not checked', () => {
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('delete button calls onDelete with todo id', async () => {
    const onDelete = vi.fn();
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={onDelete} />
      </ul>
    );
    await userEvent.click(screen.getByRole('button', { name: /delete buy groceries/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('delete button has accessible aria-label', () => {
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>
    );
    expect(screen.getByRole('button', { name: 'Delete Buy groceries' })).toBeInTheDocument();
  });

  it('single-click triggers delete (no confirmation)', async () => {
    const onDelete = vi.fn();
    render(
      <ul>
        <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={onDelete} />
      </ul>
    );
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});


