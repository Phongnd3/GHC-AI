import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// expo-router is already mocked in jest.setup.ts

// Mock expo-router Stack
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Stack: ({ children }: { children?: React.ReactNode }) => children ?? null,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useNavigationContainerRef: jest.fn(() => ({
    current: null, // null triggers the early-return guard in the useEffect
    addListener: jest.fn(),
  })),
}));

// Mock LoadingSkeleton — require() is used because jest.mock factories cannot
// reference top-level imports (hoisting prevents access to out-of-scope vars).
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@/components', () => ({
  LoadingSkeleton: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View, Text } = require('react-native');
    return (
      <View testID="loading-skeleton">
        <Text>Loading...</Text>
      </View>
    );
  },
}));
/* eslint-enable @typescript-eslint/no-require-imports */

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show LoadingSkeleton while loading', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      resetInactivityTimer: jest.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AuthLayout = require('../(auth)/_layout').default as React.ComponentType;
    const { getByTestId } = render(<AuthLayout />);

    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('should redirect to login when not authenticated and not loading', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      resetInactivityTimer: jest.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AuthLayout = require('../(auth)/_layout').default as React.ComponentType;
    render(<AuthLayout />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('should render Stack when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      resetInactivityTimer: jest.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AuthLayout = require('../(auth)/_layout').default as React.ComponentType;
    render(<AuthLayout />);

    // Should NOT redirect to login when authenticated
    expect(router.replace).not.toHaveBeenCalled();
  });
});
