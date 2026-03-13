import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error string', () => {
    render(<ErrorMessage message="Something went wrong" onRetry={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has a retry button that fires callback', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has role="alert"', () => {
    render(<ErrorMessage message="Error" onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

