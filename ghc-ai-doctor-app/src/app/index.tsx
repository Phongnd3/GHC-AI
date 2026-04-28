import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, sessionExpiredMessage, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);

  // Redirect to dashboard if session is already valid (e.g. app relaunch within 30 min).
  // Wait for isLoading to be false so checkSession() has finished before acting.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated]);

  // Task 3: Clear error when user starts typing
  function handleUsernameChange(value: string) {
    setUsername(value);
    if (errorMessage) {
      setErrorMessage('');
      setIsAuthError(false);
      setIsNetworkError(false);
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errorMessage) {
      setErrorMessage('');
      setIsAuthError(false);
      setIsNetworkError(false);
    }
  }

  async function handleLogin() {
    if (!username.trim() || !password.trim()) return;

    setIsLoginLoading(true);
    setErrorMessage('');
    setIsAuthError(false);
    setIsNetworkError(false);

    try {
      await login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      // Task 1: Use centralized error handler; override message for login context
      const mapped = mapErrorToUserMessage(error);
      if (mapped.type === ErrorType.AUTH_ERROR) {
        setErrorMessage('Invalid username or password. Please try again.');
        setIsAuthError(true);
        setIsNetworkError(false);
      } else if (mapped.type === ErrorType.NETWORK_ERROR) {
        setErrorMessage('No internet connection. Please check your WiFi.');
        setIsAuthError(false);
        setIsNetworkError(true);
      } else {
        setErrorMessage(mapped.message);
        setIsAuthError(false);
        setIsNetworkError(false);
      }
    } finally {
      // Task 2: Always reset loading so fields re-enable
      setIsLoginLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {sessionExpiredMessage && (
          <HelperText
            type="error"
            visible={!!sessionExpiredMessage}
            style={styles.expiryMessage}
            testID="session-expired-message"
          >
            {sessionExpiredMessage}
          </HelperText>
        )}

        <Text style={[styles.title, { color: theme.colors.onBackground }]} variant="headlineLarge">
          GHC-AI Doctor
        </Text>

        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          variant="bodyLarge"
        >
          Sign in with your OpenMRS credentials
        </Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={handleUsernameChange}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
          disabled={isLoginLoading}
          error={isAuthError}
          testID="username-input"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
          disabled={isLoginLoading}
          error={isAuthError}
          testID="password-input"
        />

        <HelperText type="error" visible={!!errorMessage} testID="error-message">
          {errorMessage}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoginLoading}
          disabled={!username || !password || isLoginLoading}
          style={styles.button}
          testID="login-button"
        >
          Login
        </Button>

        {isNetworkError && (
          <Button
            mode="outlined"
            onPress={handleLogin}
            disabled={!username.trim() || !password.trim() || isLoginLoading}
            style={styles.retryButton}
            testID="retry-button"
          >
            Retry
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: Spacing.lg,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  expiryMessage: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  title: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
