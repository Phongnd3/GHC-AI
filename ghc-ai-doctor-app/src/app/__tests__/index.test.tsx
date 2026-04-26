import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';
import { useAuth } from '@/contexts/AuthContext';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';
import { router } from 'expo-router';
import { preventScreenCaptureAsync, allowScreenCaptureAsync } from 'expo-screen-capture';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn().mockResolvedValue(undefined),
  allowScreenCaptureAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/errorHandler', () => ({
  mapErrorToUserMessage: jest.fn(),
  ErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
}));

// Mock react-native-paper to avoid native animation issues in test environment.
// React version mismatch (react@19.1.0 vs react-native-renderer) causes
// TextInput's Animated API to fail when connecting to the native renderer.
// require() is used inside the factory because jest.mock hoisting prevents
// top-level imports from being accessible inside the factory function.
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  return {
    TextInput: ({
      label,
      value,
      onChangeText,
      testID,
      disabled,
      secureTextEntry,
      ...rest
    }: {
      label?: string;
      value?: string;
      onChangeText?: (text: string) => void;
      testID?: string;
      disabled?: boolean;
      secureTextEntry?: boolean;
      [key: string]: unknown;
    }) => (
      <RN.TextInput
        testID={testID ?? label}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        secureTextEntry={secureTextEntry}
        placeholder={label}
        accessibilityLabel={label}
        {...rest}
      />
    ),
    Button: ({
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
        testID={testID ?? 'button'}
        onPress={disabled === true || loading === true ? undefined : onPress}
        disabled={disabled === true || loading === true}
        accessibilityRole="button"
        {...rest}
      >
        <RN.Text>{children}</RN.Text>
      </RN.Pressable>
    ),
    Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.Text {...rest}>{children}</RN.Text>
    ),
    HelperText: ({
      children,
      visible,
      testID,
      ...rest
    }: {
      children: React.ReactNode;
      visible?: boolean;
      testID?: string;
      [key: string]: unknown;
    }) =>
      visible ? (
        <RN.Text testID={testID ?? 'helper-text'} {...rest}>
          {children}
        </RN.Text>
      ) : null,
    useTheme: () => ({
      colors: {
        background: '#ffffff',
        onBackground: '#000000',
        onSurfaceVariant: '#666666',
        primary: '#00897b',
        error: '#b00020',
      },
    }),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */

// expo-router is already mocked in jest.setup.ts

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Default: no error mapping needed for happy-path tests
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred. Please try again.',
    });
  });

  // ── Existing happy-path tests ──────────────────────────────────────────────

  it('should render the app title', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('GHC-AI Doctor')).toBeTruthy();
  });

  it('should render the subtitle', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign in with your OpenMRS credentials')).toBeTruthy();
  });

  it('should render username and password inputs', () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId('username-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('should render a Login button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Login')).toBeTruthy();
  });

  it('should not call login when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Login'));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should not call login when fields contain only whitespace', () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('username-input'), '   ');
    fireEvent.changeText(getByTestId('password-input'), '   ');
    fireEvent.press(getByText('Login'));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login with credentials and navigate on success', async () => {
    mockLogin.mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'testuser');
    fireEvent.changeText(getByTestId('password-input'), 'password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
      expect(router.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ── Task 1: Wire 401 error handling ───────────────────────────────────────

  it('should show invalid credentials error message on AUTH_ERROR', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
      // Verify the HelperText element is rendered via its testID
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });

  it('should call mapErrorToUserMessage when login fails', async () => {
    const error = new Error('401');
    mockLogin.mockRejectedValue(error);
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mapErrorToUserMessage).toHaveBeenCalledWith(error);
    });
  });

  it('should show WiFi-specific message for NETWORK_ERROR type', async () => {
    mockLogin.mockRejectedValue(new Error('network'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'user');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('No internet connection. Please check your WiFi.')).toBeTruthy();
    });
  });

  it('should not navigate to dashboard on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  // ── Task 2: Fields remain editable after failed login ─────────────────────

  it('should re-enable fields after failed login', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      // editable prop should be true (not disabled)
      expect(getByTestId('username-input').props.editable).toBe(true);
      expect(getByTestId('password-input').props.editable).toBe(true);
    });
  });

  // ── Task 3: Clear error on user interaction ────────────────────────────────

  it('should clear error message when user types in username field', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('username-input'), 'newuser');

    expect(queryByText('Invalid username or password. Please try again.')).toBeNull();
  });

  it('should clear error message when user types in password field', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('password-input'), 'newpass');

    expect(queryByText('Invalid username or password. Please try again.')).toBeNull();
  });

  it('should not show error message initially', () => {
    const { queryByText } = render(<LoginScreen />);
    expect(queryByText('Invalid username or password. Please try again.')).toBeNull();
  });

  // ── Story 2.3: Network Error Handling ──────────────────────────────────────

  it('should show network error message and Retry button on network failure', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('No internet connection. Please check your WiFi.')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  it('should NOT show Retry button for auth errors', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByTestId, getByText, queryByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'wronguser');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
      expect(queryByTestId('retry-button')).toBeNull();
    });
  });

  it('should retry login when Retry button is pressed', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(undefined);

    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText, queryByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(2);
      expect(router.replace).toHaveBeenCalledWith('/dashboard');
      expect(queryByTestId('retry-button')).toBeNull();
    });
  });

  it('should clear network error and Retry button when user edits username field', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText, queryByTestId, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('username-input'), 'newdoctor');

    expect(queryByTestId('retry-button')).toBeNull();
    expect(queryByText('No internet connection. Please check your WiFi.')).toBeNull();
  });

  it('should clear network error and Retry button when user edits password field', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText, queryByTestId, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('password-input'), 'newpass');

    expect(queryByTestId('retry-button')).toBeNull();
    expect(queryByText('No internet connection. Please check your WiFi.')).toBeNull();
  });

  it('should not navigate to dashboard on network error', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  it('should NOT show Retry button for server errors', async () => {
    mockLogin.mockRejectedValue(new Error('500'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.SERVER_ERROR,
      message: 'Server unavailable. Please try again later.',
    });

    const { getByTestId, getByText, queryByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'doctor');
    fireEvent.changeText(getByTestId('password-input'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Server unavailable. Please try again later.')).toBeTruthy();
      expect(queryByTestId('retry-button')).toBeNull();
    });
  });

  // ── Story 2.4: Session Expiry Message Display ─────────────────────────────

  it('should display session expired message when redirected from timeout', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: 'Session expired due to inactivity. Please log in again.',
      isAuthenticated: false,
      isLoading: false,
    });

    const { getByText, getByTestId } = render(<LoginScreen />);

    expect(getByText('Session expired due to inactivity. Please log in again.')).toBeTruthy();
    expect(getByTestId('session-expired-message')).toBeTruthy();
  });

  it('should not display expiry message when null', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: false,
      isLoading: false,
    });

    const { queryByText, queryByTestId } = render(<LoginScreen />);

    expect(queryByText('Session expired due to inactivity. Please log in again.')).toBeNull();
    expect(queryByTestId('session-expired-message')).toBeNull();
  });

  it('should display session expired message above the title', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: 'Session expired due to inactivity. Please log in again.',
      isAuthenticated: false,
      isLoading: false,
    });

    const { getByText } = render(<LoginScreen />);

    // Both should be present
    expect(getByText('Session expired due to inactivity. Please log in again.')).toBeTruthy();
    expect(getByText('GHC-AI Doctor')).toBeTruthy();
  });

  // Story 2.5: Login screen must NOT have screenshot prevention
  it('does NOT call preventScreenCaptureAsync on the login screen', () => {
    // P4: explicit clear ensures this assertion is non-vacuous even if other
    // tests in this file somehow triggered the mock
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LoginScreen />);

    expect(preventScreenCaptureAsync).not.toHaveBeenCalled();
    expect(allowScreenCaptureAsync).not.toHaveBeenCalled();
  });

  // Story 2.7: Session persistence — redirect to dashboard on valid session restore
  it('redirects to dashboard when session is already valid on app launch', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: true,
      isLoading: false,
    });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does not redirect while session check is still loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(<LoginScreen />);

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('does not redirect when session check completes with no valid session', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      sessionExpiredMessage: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LoginScreen />);

    expect(router.replace).not.toHaveBeenCalled();
  });
});
