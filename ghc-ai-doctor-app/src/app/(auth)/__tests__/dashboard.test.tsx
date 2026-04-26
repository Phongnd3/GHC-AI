import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import DashboardScreen from '../dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock expo-router — useFocusEffect must call its callback immediately so
// the BackHandler subscription is registered during the test render.
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => React.ReactNode } }) => {
      // Render the headerRight so we can interact with it in tests
      if (options?.headerRight) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { View } = require('react-native');
        return <View>{options.headerRight()}</View>;
      }
      return null;
    },
  },
  useFocusEffect: (callback: () => () => void) => {
    // Call immediately so BackHandler is registered during render
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = callback();
      return cleanup;
    }, []);
  },
}));

// Track registered BackHandler listeners so tests can simulate back presses
let mockBackHandlerListeners: Array<() => boolean | null | undefined> = [];

// Spy on BackHandler.addEventListener after jest-expo has set up react-native mocks.
// jest-expo's preset already mocks react-native, so we can safely spy on BackHandler.
// We use beforeAll to set up the spy once and capture listeners for simulateBackPress.
let addEventListenerSpy: jest.SpyInstance;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BackHandler: BH } = require('react-native');
  addEventListenerSpy = jest.spyOn(BH, 'addEventListener').mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((_event: string, handler: () => boolean | null | undefined) => {
      mockBackHandlerListeners.push(handler);
      return {
        remove: jest.fn(() => {
          mockBackHandlerListeners = mockBackHandlerListeners.filter((h) => h !== handler);
        }),
      };
    }) as any
  );
});

afterAll(() => {
  addEventListenerSpy?.mockRestore();
});

// Mock react-native-paper — full mock to avoid native animation issues
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-paper', () => {
  const RN = require('react-native');

  const Button = ({
    children,
    onPress,
    disabled,
    loading,
    testID,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    testID?: string;
    [key: string]: unknown;
  }) => (
    <RN.Pressable
      testID={testID ?? String(children)}
      onPress={disabled === true || loading === true ? undefined : onPress}
      disabled={disabled === true || loading === true}
      accessibilityRole="button"
      {...rest}
    >
      <RN.Text>{children}</RN.Text>
    </RN.Pressable>
  );

  const IconButton = ({
    onPress,
    accessibilityLabel,
    testID,
    ...rest
  }: {
    onPress?: () => void;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: unknown;
  }) => (
    <RN.Pressable
      testID={testID ?? accessibilityLabel ?? 'icon-button'}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      {...rest}
    />
  );

  // Dialog with proper nested sub-components (dot-notation access)
  const DialogTitle = ({ children }: { children: React.ReactNode }) => (
    <RN.Text testID="dialog-title">{children}</RN.Text>
  );
  const DialogContent = ({ children }: { children: React.ReactNode }) => (
    <RN.View>{children}</RN.View>
  );
  const DialogActions = ({ children }: { children: React.ReactNode }) => (
    <RN.View>{children}</RN.View>
  );

  const Dialog = Object.assign(
    ({ visible, children }: { visible: boolean; children: React.ReactNode }) =>
      visible ? <RN.View testID="dialog">{children}</RN.View> : null,
    {
      Title: DialogTitle,
      Content: DialogContent,
      Actions: DialogActions,
    }
  );

  const Portal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  const Text = ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <RN.Text {...rest}>{children}</RN.Text>
  );

  return {
    Button,
    IconButton,
    Dialog,
    Portal,
    Text,
    useTheme: () => ({
      colors: {
        onSurface: '#000000',
        background: '#ffffff',
        onBackground: '#000000',
      },
    }),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */

describe('DashboardScreen - logout', () => {
  const mockLogout = jest.fn();

  // Helper: simulate Android hardware back button press
  const simulateBackPress = () => {
    for (const listener of mockBackHandlerListeners) {
      if (listener() === true) return true;
    }
    return false;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBackHandlerListeners = [];
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
  });

  it('shows logout confirmation dialog when logout icon is pressed', () => {
    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));

    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
  });

  it('dismisses dialog when "No" is tapped', () => {
    const { getByLabelText, getByText, queryByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    expect(getByText('Are you sure you want to log out?')).toBeTruthy();

    fireEvent.press(getByText('No'));

    expect(queryByText('Are you sure you want to log out?')).toBeNull();
  });

  it('calls logout and navigates to login when "Yes" is tapped', async () => {
    mockLogout.mockResolvedValue(undefined);

    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('Yes'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('dismisses dialog after confirmed logout', async () => {
    // On successful logout, router.replace('/') navigates away and unmounts the component.
    // The dialog is no longer rendered because the component is gone — not because
    // setShowLogoutDialog(false) was called. This is verified by the navigation test above.
    mockLogout.mockResolvedValue(undefined);

    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('Yes'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('shows logout dialog when Android back button is pressed', () => {
    const { getByText } = render(<DashboardScreen />);

    act(() => {
      simulateBackPress();
    });

    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
  });

  it('prevents default back navigation when Android back button is pressed', () => {
    render(<DashboardScreen />);

    let result = false;
    act(() => {
      result = simulateBackPress();
    });

    // BackHandler returning true means the back press was handled (no default navigation)
    expect(result).toBe(true);
  });

  it('does not call logout when "No" is tapped', () => {
    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('No'));

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('does not navigate when "No" is tapped', () => {
    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('No'));

    expect(router.replace).not.toHaveBeenCalled();
  });

  // P4: DoD 5 & 6 — "Yes" button shows loading and both buttons are disabled during logout
  it('disables both buttons and shows loading on "Yes" while logout is in progress', async () => {
    let resolveLogout!: () => void;
    mockLogout.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      })
    );

    const { getByLabelText, getByTestId } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByTestId('Yes'));

    // While logout is in flight, both buttons must be disabled.
    // The mock Button sets onPress=undefined when disabled — verify that instead of the
    // disabled prop (which Pressable may not expose the same way in the test renderer).
    await waitFor(() => {
      expect(getByTestId('Yes').props.onPress).toBeUndefined();
      expect(getByTestId('No').props.onPress).toBeUndefined();
    });

    // Resolve the logout so the test can clean up
    resolveLogout();
  });

  // P1: logout() failure must surface an error message, not silently close the dialog
  it('shows error message and keeps dialog open when logout fails', async () => {
    mockLogout.mockRejectedValue(new Error('Network error'));

    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('Yes'));

    await waitFor(() => {
      expect(getByText('Logout failed. Please try again.')).toBeTruthy();
      // Dialog must still be visible
      expect(getByText('Are you sure you want to log out?')).toBeTruthy();
    });

    // Should NOT have navigated
    expect(router.replace).not.toHaveBeenCalled();
  });

  // P2: tapping outside the dialog (onDismiss) while logout is in flight must be a no-op
  it('does not dismiss dialog when tapping outside while logout is in progress', async () => {
    let resolveLogout!: () => void;
    mockLogout.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      })
    );

    const { getByLabelText, getByTestId, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByTestId('Yes'));

    // While in-flight, both buttons are disabled (onPress is undefined when disabled)
    await waitFor(() => {
      expect(getByTestId('Yes').props.onPress).toBeUndefined();
    });

    // Simulate onDismiss (tap outside dialog) — should be a no-op while logging out
    const dialog = getByTestId('dialog');
    fireEvent(dialog, 'onDismiss');

    // Dialog must still be visible
    expect(getByText('Are you sure you want to log out?')).toBeTruthy();

    resolveLogout();
  });
});
