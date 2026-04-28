import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders error icon, message, and retry button', () => {
    render(<ErrorState message="Test error message" onRetry={jest.fn()} />);

    expect(screen.getByText('Test error message')).toBeOnTheScreen();
    expect(screen.getByText('Retry')).toBeOnTheScreen();
  });

  it('calls onRetry when retry button is tapped', () => {
    const mockRetry = jest.fn();
    render(<ErrorState message="Test error" onRetry={mockRetry} />);

    fireEvent.press(screen.getByText('Retry'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on retry button when isRetrying is true', () => {
    render(<ErrorState message="Test error" onRetry={jest.fn()} isRetrying={true} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeDisabled();
  });

  it('disables retry button when isRetrying is true', () => {
    render(<ErrorState message="Test error" onRetry={jest.fn()} isRetrying={true} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeDisabled();
  });
});
