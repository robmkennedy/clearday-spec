import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  it('calls onAdd with trimmed description on form submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText(/add a new task/i);
    await userEvent.type(input, '  Buy groceries  ');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(onAdd).toHaveBeenCalledWith('Buy groceries');
  });

  it('shows validation error for empty submission', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('enforces maxLength on input', () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText(/add a new task/i);
    expect(input).toHaveAttribute('maxLength', '300');
  });

  it('clears input after successful add', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText(/add a new task/i);
    await userEvent.type(input, 'New todo');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('preserves input after failed add', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('Server error'));
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText(/add a new task/i);
    await userEvent.type(input, 'New todo');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(input).toHaveValue('New todo');
    });
  });

  it('submits on Enter key', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText(/add a new task/i);
    await userEvent.type(input, 'New todo{enter}');

    expect(onAdd).toHaveBeenCalledWith('New todo');
  });
});

