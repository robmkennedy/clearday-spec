import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from '../../types/todo';

const mockTodos: Todo[] = [
  { id: 1, description: 'First todo', completed: false, createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, description: 'Second todo', completed: true, createdAt: '2026-01-02T00:00:00Z' },
];

describe('TodoList', () => {
  it('renders a list of todos', () => {
    render(<TodoList todos={mockTodos} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('renders nothing when given empty array', () => {
    const { container } = render(<TodoList todos={[]} onToggle={() => {}} onDelete={() => {}} />);
    const list = container.querySelector('ul');
    expect(list).toBeNull();
  });

  it('renders correct number of list items', () => {
    render(<TodoList todos={mockTodos} onToggle={() => {}} onDelete={() => {}} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});

