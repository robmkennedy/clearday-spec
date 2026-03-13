import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders an encouragement message', () => {
    render(<EmptyState />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });
});

