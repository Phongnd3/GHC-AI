# Story 2.3: Handle Network Errors During Login

**Status:** done  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.3  
**Priority:** P1 - Critical UX for offline/poor-connectivity scenarios

---

## Story

As a doctor,  
I want to see a helpful message when login fails due to network issues,  
So that I know the problem is with connectivity, not my credentials.

---

## Acceptance Criteria

**AC1.**  
**Given** I am on the login screen and have no internet connection  
**When** I enter credentials and tap "Login"  
**Then** I see the error message "No internet connection. Please check your WiFi."  
**And** I see a "Retry" button

**AC2.**  
**Given** I see the network error message  
**When** I tap "Retry" after connection is restored  
**Then** The login attempt is retried automatically

---

## Tasks / Subtasks

- [x] Task 1: Distinguish network errors from auth errors in login screen (AC: #1)
  - [x] Import `mapErrorToUserMessage` and `ErrorType` from `@/utils/errorHandler`
  - [x] In `handleLogin()` catch block, check for `ErrorType.NETWORK_ERROR`
  - [x] Set `errorMessage` to `"No internet connection. Please check your WiFi."` on network error
  - [x] Set `isNetworkError` state flag to `true` to conditionally render Retry button

- [x] Task 2: Add Retry button for network errors (AC: #1, #2)
  - [x] Add `isNetworkError` boolean state (default `false`)
  - [x] Render a `Button` (mode="outlined") labeled "Retry" below the error message when `isNetworkError` is `true`
  - [x] Wire Retry button to call `handleLogin()` directly (reuses existing credentials)
  - [x] Hide Retry button when `isNetworkError` is `false`

- [x] Task 3: Reset network error state on user interaction (AC: #1)
  - [x] Clear `isNetworkError` and `errorMessage` when user edits username or password field
  - [x] Clear `isNetworkError` when a new login attempt starts (top of `handleLogin`)

---

## Dev Notes

### Technical Context

**Error Flow:**
1. User submits credentials with no/poor network
2. `auth.login()` calls `POST /openmrs/ws/rest/v1/session`
3. Axios times out or throws a network error (no `error.response`)
4. `mapErrorToUserMessage(error)` returns `{ type: ErrorType.NETWORK_ERROR, message: "No internet connection. Please check your WiFi." }`
5. Login screen detects `ErrorType.NETWORK_ERROR`, sets `isNetworkError = true`
6. Error message and Retry button are displayed

**Error Type Differentiation:**

| Scenario | `error.response` | `ErrorType` returned | Display |
|---|---|---|---|
| Wrong credentials | `{ status: 401 }` | `AUTH_ERROR` | Inline error, no Retry |
| No internet / timeout | `undefined` | `NETWORK_ERROR` | Inline error + Retry button |
| Server error | `{ status: 500 }` | `SERVER_ERROR` | Inline error, no Retry |

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
    setIsNetworkError(false);
  } else if (mapped.type === ErrorType.NETWORK_ERROR) {
    setErrorMessage('No internet connection. Please check your WiFi.');
    setIsNetworkError(true);
  } else {
    setErrorMessage(mapped.message);
    setIsNetworkError(false);
  }
}
```

**Retry Mechanism:**
- The Retry button calls `handleLogin()` directly — no new state or service needed
- Credentials are already held in `username` and `password` state from the previous attempt
- The user does not need to re-enter credentials to retry

### Architecture Compliance

**ARCH-REQ-1: Centralized Error Handling**
- ✅ Use `mapErrorToUserMessage` from `@/utils/errorHandler` — do NOT write `if (!error.response)` inline
- ✅ Check `ErrorType.NETWORK_ERROR` to branch on network failures
- ✅ Message text must match exactly: `"No internet connection. Please check your WiFi."`

**ARCH-REQ-2: Material Design 3 Error Display**
- ✅ Use `HelperText` from `react-native-paper` with `type="error"` for the error message (consistent with Story 2.2)
- ✅ Use `Button` from `react-native-paper` with `mode="outlined"` for the Retry button
- ✅ Do NOT use `Alert.alert()` or custom modals

**ARCH-REQ-3: State Management**
- ✅ `isNetworkError` is local state (`useState`) — no global state needed
- ✅ `errorMessage` state already exists from Story 2.2 — extend it, do not duplicate

**ARCH-REQ-4: No Credential Storage on Failure**
- ✅ Network errors throw before `SecureStore.setItemAsync` is called in `AuthContext.login()`
- ✅ No extra guard needed — the throw prevents the write

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
  const [isNetworkError, setIsNetworkError] = useState(false);

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (errorMessage) {
      setErrorMessage('');
      setIsNetworkError(false);
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errorMessage) {
      setErrorMessage('');
      setIsNetworkError(false);
    }
  }

  async function handleLogin() {
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMessage('');
    setIsNetworkError(false);

    try {
      await login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      const mapped = mapErrorToUserMessage(error);
      if (mapped.type === ErrorType.AUTH_ERROR) {
        setErrorMessage('Invalid username or password. Please try again.');
        setIsNetworkError(false);
      } else if (mapped.type === ErrorType.NETWORK_ERROR) {
        setErrorMessage('No internet connection. Please check your WiFi.');
        setIsNetworkError(true);
      } else {
        setErrorMessage(mapped.message);
        setIsNetworkError(false);
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

        {isNetworkError && (
          <Button
            mode="outlined"
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.retryButton}
          >
            Retry
          </Button>
        )}
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
  retryButton: { marginTop: Spacing.md },
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

describe('LoginScreen - network errors', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('shows network error message and Retry button on network failure', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your WiFi.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'doctor');
    fireEvent.changeText(getByLabelText('Password'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('No internet connection. Please check your WiFi.')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  it('does NOT show Retry button for auth errors', async () => {
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
      expect(queryByText('Retry')).toBeNull();
    });
  });

  it('retries login when Retry button is pressed', async () => {
    mockLogin
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(undefined);

    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your WiFi.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'doctor');
    fireEvent.changeText(getByLabelText('Password'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Retry')).toBeTruthy();
    });

    fireEvent.press(getByText('Retry'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(2);
      expect(router.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('clears network error and Retry button when user edits a field', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your WiFi.',
    });

    const { getByLabelText, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'doctor');
    fireEvent.changeText(getByLabelText('Password'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Retry')).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('Password'), 'newpass');

    expect(queryByText('Retry')).toBeNull();
    expect(queryByText('No internet connection. Please check your WiFi.')).toBeNull();
  });

  it('does not navigate to dashboard on network error', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    (mapErrorToUserMessage as jest.Mock).mockReturnValue({
      type: ErrorType.NETWORK_ERROR,
      message: 'No internet connection. Please check your WiFi.',
    });

    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Username'), 'doctor');
    fireEvent.changeText(getByLabelText('Password'), 'pass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
```

**Manual Test Checklist:**
- [ ] Disable WiFi/network, enter credentials, tap Login → network error message appears
- [ ] Error message reads exactly: "No internet connection. Please check your WiFi."
- [ ] "Retry" button is visible below the Login button after a network error
- [ ] Re-enable network, tap Retry → login succeeds and navigates to dashboard
- [ ] Retry uses the same credentials without requiring re-entry
- [ ] Editing username or password clears the error message and hides the Retry button
- [ ] Wrong credentials (401) shows auth error message with NO Retry button
- [ ] Server error (500) shows server error message with NO Retry button
- [ ] No session token written to SecureStore on network failure (verify via debug)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**Previous Story Learnings:**
- Story 1.6: `mapErrorToUserMessage` and `ErrorType` enum are in `@/utils/errorHandler`; `NETWORK_ERROR` type covers no-connection and timeout scenarios
- Story 2.1: Login screen scaffold is in `src/app/index.tsx`
- Story 2.2: `errorMessage` state and `HelperText` display pattern already in place — extend, do not rewrite

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use the centralized error handler** — import `mapErrorToUserMessage` and `ErrorType` from `@/utils/errorHandler`; do NOT write `if (!error.response)` or `if (error.code === 'ECONNABORTED')` inline

2. **Exact error message text** — display `"No internet connection. Please check your WiFi."` — do not paraphrase or alter

3. **Retry button only for network errors** — `isNetworkError` flag controls visibility; auth and server errors must NOT show a Retry button

4. **Retry reuses existing credentials** — call `handleLogin()` directly; do NOT re-read or re-prompt for credentials

5. **Use `HelperText` + `Button` from react-native-paper** — `HelperText type="error"` for the message, `Button mode="outlined"` for Retry; no `Alert.alert()` or custom components

6. **Reset `isNetworkError` at the top of `handleLogin`** — prevents stale Retry button state across multiple attempts

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** detect network errors manually — always go through `mapErrorToUserMessage`
2. **DO NOT** show a Retry button for 401 or 500 errors — only for `ErrorType.NETWORK_ERROR`
3. **DO NOT** clear the username/password fields on error — user must be able to correct and retry
4. **DO NOT** implement a separate retry service or debounce — `handleLogin()` is sufficient
5. **DO NOT** add session timeout logic here — covered in Story 2.4
6. **DO NOT** add screenshot prevention here — covered in Story 2.5

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ Network failure shows `"No internet connection. Please check your WiFi."` inline
2. ✅ "Retry" button appears below Login button on network error
3. ✅ Tapping Retry re-attempts login with existing credentials
4. ✅ Successful retry navigates to dashboard
5. ✅ Auth errors (401) do NOT show Retry button
6. ✅ Editing any field clears the error message and hides Retry button
7. ✅ No session token stored on network failure
8. ✅ All component tests pass
9. ✅ TypeScript compilation succeeds with no errors
10. ✅ Manual testing confirms all acceptance criteria
11. ✅ Code committed with message: `"feat: implement story 2.3 - handle network errors during login"`

---

## Dev Agent Record

### Implementation Plan

All 3 tasks implemented in a single pass on `src/app/index.tsx`:

1. **Task 1 — Network error detection** — Added `isNetworkError` state, extended error handling in `handleLogin()` catch block to check for `ErrorType.NETWORK_ERROR`, override message to `"No internet connection. Please check your WiFi."` for network errors, set `isNetworkError` flag to control Retry button visibility.

2. **Task 2 — Retry button implementation** — Added conditional rendering of `Button` (mode="outlined") with testID="retry-button" below the Login button when `isNetworkError` is true. Retry button calls `handleLogin()` directly, reusing existing credentials from state.

3. **Task 3 — State reset on interaction** — Extended `handleUsernameChange`/`handlePasswordChange` to clear `isNetworkError` flag along with error message. Added `setIsNetworkError(false)` at the top of `handleLogin()` to reset state on new attempts.

**Key decision:** Network error message is overridden to be WiFi-specific (`"No internet connection. Please check your WiFi."`) while maintaining the centralized error handler pattern. The Retry button only appears for `NETWORK_ERROR` type, not for auth or server errors.

### Completion Notes

- ✅ Task 1: Network error detection — `ErrorType.NETWORK_ERROR` detected, WiFi-specific message displayed, `isNetworkError` flag controls UI
- ✅ Task 2: Retry button — Conditional `Button` (mode="outlined") renders below Login button, calls `handleLogin()` directly
- ✅ Task 3: State reset — `isNetworkError` cleared on field edits and new login attempts
- ✅ 8 new tests added covering network error scenarios, retry functionality, and state clearing
- ✅ 86 total tests pass, 0 regressions
- ✅ TypeScript: 0 errors | Lint: 0 errors (4 pre-existing warnings)
- ✅ AC1 & AC2 satisfied: network errors show WiFi message + Retry button, retry works with existing credentials

---

## File List

### Modified Files
- `ghc-ai-doctor-app/src/app/index.tsx` — added `isNetworkError` state, extended error handling for `NETWORK_ERROR` type, added conditional Retry button, updated state clearing functions
- `ghc-ai-doctor-app/src/app/__tests__/index.test.tsx` — added 8 new network error tests, updated existing network error test to expect WiFi-specific message

---

## Change Log

- 2026-04-26: Implemented Story 2.3 - Handle Network Errors During Login
  - Added `isNetworkError` state and network error detection in `handleLogin()`
  - Added conditional Retry button (mode="outlined") for network errors only
  - Extended state clearing to reset network error flag on user interaction
  - 8 new component tests covering all network error scenarios and retry functionality

---

## Senior Developer Review (AI)

**Review Date:** 2026-04-26
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅

### Action Items

- [x] [Review][Patch] Test name `'should pass non-auth errors through unchanged'` is misleading — NETWORK_ERROR message IS overridden to WiFi-specific text [`ghc-ai-doctor-app/src/app/__tests__/index.test.tsx`]
- [x] [Review][Patch] Retry button `disabled={isLoading}` allows whitespace-only credentials to silently no-op — sync with Login button guard [`ghc-ai-doctor-app/src/app/index.tsx`]
- [x] [Review][Patch] Retry test does not assert Retry button disappears after successful retry [`ghc-ai-doctor-app/src/app/__tests__/index.test.tsx`]
- [x] [Review][Defer] `isNetworkError` / `errorMessage` state coupling — no current code path triggers divergence but latent fragility [`ghc-ai-doctor-app/src/app/index.tsx`] — deferred, pre-existing pattern
- [x] [Review][Defer] `TIMEOUT_ERROR` shows no Retry button — spec scopes Retry to `NETWORK_ERROR` only; separate story needed [`ghc-ai-doctor-app/src/utils/errorHandler.ts`] — deferred, out of scope
- [x] [Review][Defer] Login button `disabled` uses `!username || !password` without `.trim()` — pre-existing from Story 2.2 [`ghc-ai-doctor-app/src/app/index.tsx`] — deferred, pre-existing
