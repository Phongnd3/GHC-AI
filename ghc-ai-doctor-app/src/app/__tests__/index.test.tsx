import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-native-paper to avoid native animation issues in test environment.
// React version mismatch (react@19.2.5 vs react-native-renderer@19.1.0) causes
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
    useTheme: () => ({
      colors: {
        background: '#ffffff',
        onBackground: '#000000',
        onSurfaceVariant: '#666666',
        primary: '#00897b',
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
    });
  });

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

  it('should not navigate if login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('username-input'), 'testuser');
    fireEvent.changeText(getByTestId('password-input'), 'wrong');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(router.replace).not.toHaveBeenCalled();
  });
});
