# Story 2.2: Handle Invalid Login Credentials

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.2  
**Priority:** P0 - Critical UX for authentication flow

---

## Story

As a doctor,  
I want to see a clear error message when I enter wrong credentials,  
So that I know what went wrong and can try again.

---

## Acceptance Criteria

**AC1.**  
**Given** I am on the login screen  
**When** I enter invalid username or password and tap "Login"  
**Then** I see the error message "Invalid username or password. Please try again."  
**And** The username and password fields remain editable  
**And** I can attempt to log in again  
**And** No session token is stored

---

## Tasks / Subtasks

- [ ] Task 1: Wire 401 error handling into login screen (AC: #1)
  - [ ] Import `mapErrorToUserMessage` from `@/utils/errorHandler`
  - [ ] Catch error thrown by `auth.login()` in `handleLogin()`
  - [ ] Call `mapErrorToUserMessage(error)` to get typed error
  - [ ] Set error state when `ErrorType.AUTH_ERROR` is returned
  - [ ] Display error message in a `HelperText` component below the password field

- [ ] Task 2: Ensure fields remain editable after failed login (AC: #1)
  - [ ] Confirm `isLoading` is reset to `false` in the `finally` block
  - [ ] Confirm `disabled` prop on TextInput is tied only to `isLoading`
  - [ ] Confirm no session token is written to SecureStore on 401

- [ ] Task 3: Clear error state on user interaction (AC: #1)
  - [ ] Clear error message when user starts typing in username or password field
  - [ ] Use `onChangeText` handlers to reset error state

---

## Dev Notes

### Technical Context

**Error Flow:**
1. User submits invalid credentials
2. `auth.login()` calls `POST /openmrs/ws/rest/v1/session`
3. OpenMRS returns `401 Unauthorized`
4. Axios throws an error with `error.response.status === 401`
5. `mapErrorToUserMessage(error)` returns `{ type: ErrorType.AUTH_ERROR, message: "Session expired. Please log in again." }`
6. **Override the message** for the login context: display `"Invalid username or password. Please try again."` instead

> **Why override?** The centralized error handler maps 401 to "Session expired..." which is correct for authenticated routes. On the login screen, a 401 means wrong credentials, so the message must be contextually overridden.

**OpenMRS 401 Response:**
```json
// POST /openmrs/ws/rest/v1/session with wrong credentials
// HTTP 401 Unauthorized
{
  "error": {
    "message": "Invalid credentials",
    "code": "org.openmrs.module.webservices.rest.web.response.UnauthorizedException"
  }
}
```

**Error Handler Reference (`src/utils/errorHandler.ts`):**
```typescript
// Already implemented in Story 1.6
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';

// Usage in login screen:
try {
  await login(username, password);
  router.replace('/dashboard');
} catch (error) {
  const mapped = mapErrorToUserMessage(error);
  if (mapped.type === ErrorType.AUTH_ERROR) {
    setErrorMessage('Invalid username or password. Please try again.');
  } else {
    setErrorMessage(mapped.message); // network/server errors pass through
  }
}
```

### Architecture Compliance

**ARCH-REQ-1: Centralized Error Handling**
- ✅ Use `mapErrorToUserMessage` from `@/utils/errorHandler` — do NOT write custom 401 detection
- ✅ Check `ErrorType` enum to branch on error category
- ✅ Override message text only for the login-screen context

**ARCH-REQ-2: No Credential Storage on Failure**
- ✅ `SecureStore.setItemAsync` is only called inside `AuthContext.login()` after a successful response
- ✅ A thrown error from `apiLogin()` prevents the SecureStore write — no extra guard needed

**ARCH-REQ-3: Material Design 3 Error Display**
- ✅ Use `HelperText` from `react-native-paper` with `type="error"` for inline error display
- ✅ Use `theme.colors.error` for error text color (do not hardcode red)
- ✅ Do NOT use `Alert.alert()` — inline error is the correct pattern

**ARCH-REQ-4: State Management**
- ✅ Error state is local to the login screen (`useState`)
- ✅ No global state needed for transient UI errors

### Implementation Details

**Updated Login Screen (`src/app/index.tsx`):**

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (errorMessage) setErrorMessage('');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errorMessage) setErrorMessage('');
  }

  async function handleLogin() {
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      const mapped = mapErrorToUserMessage(error);
      if (mapped.type === ErrorType.AUTH_ERROR) {
        setErrorMessage('Invalid username or password. Please try again.');
      } else {
        setErrorMessage(mapped.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          GHC-AI Doctor
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
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
          disabled={isLoading}
          error={!!errorMessage}
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
          disabled={isLoading}
          error={!!errorMessage}
        />

        <HelperText type="error" visible={!!errorMessage}>
          {errorMessage}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!username || !password || isLoading}
          style={styles.button}
        >
          Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  title: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  input: { marginBottom: Spacing.sm },
  button: { marginTop: Spacing.lg },
});
```

### Testing Requirements

**Unit / Component Tests (`src/app/__tests__/index.test.tsx`):**

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';
import { useAuth } from '@/contexts/AuthContext';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext');
jest.mock('@/utils/errorHandler');
jest.mock('expo-router');

describe('LoginScreen - invalid credentials', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('shows invalid credentials error on 401', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'wronguser');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
    });
  });

  it('fields remain editable after failed login', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'wronguser');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByLabelText('Username')).not.toBeDisabled();
      expect(getByLabelText('Password')).not.toBeDisabled();
    });
  });

  it('clears error message when user starts typing', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByLabelText, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'wronguser');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid username or password. Please try again.')).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('Username'), 'newuser');

    expect(queryByText('Invalid username or password. Please try again.')).toBeNull();
  });

  it('does not navigate to dashboard on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('401'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.AUTH_ERROR,
      message: 'Session expired. Please log in again.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'wronguser');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  it('passes non-auth errors through unchanged', async () => {
    mockLogin.mockRejectedValue(new Error('network'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your network and try again.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'user');
    fireEvent.changeText(getByLabelText('Password'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(
        getByText('No internet connection. Please check your network and try again.')
      ).toBeTruthy();
    });
  });
});
```

**Manual Test Checklist:**
- [ ] Enter wrong username/password → error message appears below password field
- [ ] Error message reads exactly: "Invalid username or password. Please try again."
- [ ] Both fields remain editable after error
- [ ] Can type new credentials and attempt login again
- [ ] Error message disappears when user starts typing in either field
- [ ] No session token written to SecureStore on failed login (verify via debug)
- [ ] Successful login after a failed attempt works correctly
- [ ] Network error shows network-specific message (not invalid credentials)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**Previous Story Learnings:**
- Story 1.6: `mapErrorToUserMessage` and `ErrorType` enum are in `@/utils/errorHandler`
- Story 2.1: Login screen scaffold is in `src/app/index.tsx`; `handleLogin` already has try/catch stub
- Story 2.1: `AuthContext.login()` throws on API failure — no extra wrapping needed

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use the centralized error handler** — import `mapErrorToUserMessage` and `ErrorType` from `@/utils/errorHandler`; do NOT write `if (error.response?.status === 401)` inline

2. **Override the message for login context** — `ErrorType.AUTH_ERROR` maps to "Session expired..." globally; on the login screen it must display "Invalid username or password. Please try again."

3. **Use `HelperText` from react-native-paper** — `type="error"` with `visible={!!errorMessage}`; do NOT use `Alert.alert()` or custom styled `Text`

4. **Reset `isLoading` in `finally`** — ensures fields are re-enabled regardless of success or failure

5. **Clear error on input change** — call `setErrorMessage('')` inside `handleUsernameChange` and `handlePasswordChange`

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** detect 401 manually — always go through `mapErrorToUserMessage`
2. **DO NOT** use `Alert.alert()` for credential errors — inline `HelperText` only
3. **DO NOT** clear the username/password fields on error — user must be able to correct and retry
4. **DO NOT** add a "Retry" button for auth errors — that is only for network errors (Story 2.3)
5. **DO NOT** implement network error handling here — Story 2.3 covers that separately

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ Invalid credentials show "Invalid username or password. Please try again." inline
2. ✅ Fields remain editable and re-enabled after a failed login
3. ✅ Error clears when user starts typing in either field
4. ✅ No session token is stored on failed login
5. ✅ Non-auth errors (network, server) display their own messages unchanged
6. ✅ All component tests pass
7. ✅ TypeScript compilation succeeds with no errors
8. ✅ Manual testing confirms all acceptance criteria
9. ✅ Code committed with message: "feat: implement story 2.2 - handle invalid login credentials"

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** None  
**Blocked By:** Story 2.1 (Login Screen scaffold) — must be complete  
**Estimated Effort:** 1-2 hours

---

**Ultimate context engine analysis completed - comprehensive developer guide created**
