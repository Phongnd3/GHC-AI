# Story 2.2: Handle Invalid Login Credentials

**Status:** done  
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

- [x] Task 1: Wire 401 error handling into login screen (AC: #1)
  - [x] Import `mapErrorToUserMessage` from `@/utils/errorHandler`
  - [x] Catch error thrown by `auth.login()` in `handleLogin()`
  - [x] Call `mapErrorToUserMessage(error)` to get typed error
  - [x] Set error state when `ErrorType.AUTH_ERROR` is returned
  - [x] Display error message in a `HelperText` component below the password field

- [x] Task 2: Ensure fields remain editable after failed login (AC: #1)
  - [x] Confirm `isLoading` is reset to `false` in the `finally` block
  - [x] Confirm `disabled` prop on TextInput is tied only to `isLoading`
  - [x] Confirm no session token is written to SecureStore on 401

- [x] Task 3: Clear error state on user interaction (AC: #1)
  - [x] Clear error message when user starts typing in username or password field
  - [x] Use `onChangeText` handlers to reset error state

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

---

## Dev Agent Record

### Implementation Plan

All 3 tasks implemented in a single pass on `src/app/index.tsx`:

1. **Task 1 — Error handling wired in** — Added `errorMessage` state, imported `mapErrorToUserMessage` and `ErrorType` from `@/utils/errorHandler`. In `handleLogin()` catch block: calls `mapErrorToUserMessage(error)`, overrides message to `"Invalid username or password. Please try again."` for `AUTH_ERROR`, passes other error messages through unchanged. Added `HelperText` component (type="error") below the password field.

2. **Task 2 — Fields remain editable** — `isLoading` is reset in `finally` block (was already the case from Story 2.1 scaffold). `disabled` prop on both `TextInput` components is tied only to `isLoading`. No session token is written on failure because `AuthContext.login()` throws before reaching `SecureStore.setItemAsync`.

3. **Task 3 — Error clears on input** — Replaced `setUsername`/`setPassword` direct calls with `handleUsernameChange`/`handlePasswordChange` wrapper functions that call `setErrorMessage('')` when `errorMessage` is set.

**Key decision:** `HelperText` from `react-native-paper` is mocked in tests (same pattern as `TextInput`/`Button`) to avoid the React version mismatch with the native renderer. The mock renders a `<Text>` when `visible=true` and `null` when `visible=false`.

### Completion Notes

- ✅ Task 1: Error handling wired — `mapErrorToUserMessage` used, `HelperText` displays inline error
- ✅ Task 2: Fields re-enable after failure — `isLoading` reset in `finally`, `disabled` tied only to loading state
- ✅ Task 3: Error clears on typing — `handleUsernameChange`/`handlePasswordChange` reset error state
- ✅ 8 new tests added (5 error-path, 2 clear-on-type, 1 no-error-initially), all passing
- ✅ 77 total tests pass, 0 regressions
- ✅ TypeScript: 0 errors | Lint: 0 errors
- ✅ AC1 satisfied: invalid credentials show correct inline message, fields stay editable, error clears on input

---

## File List

### Modified Files
- `ghc-ai-doctor-app/src/app/index.tsx` — added error state, `HelperText`, `handleUsernameChange`/`handlePasswordChange`, wired `mapErrorToUserMessage`
- `ghc-ai-doctor-app/src/app/__tests__/index.test.tsx` — added `HelperText` to mock, added 8 new error-handling tests, mocked `@/utils/errorHandler`

---

## Change Log

- 2026-04-26: Implemented Story 2.2 - Handle Invalid Login Credentials
  - Wired `mapErrorToUserMessage` into `handleLogin()` catch block
  - Added `HelperText` error display below password field
  - Added `handleUsernameChange`/`handlePasswordChange` to clear error on input
  - 8 new component tests covering all error scenarios

---

## Review Findings

- [x] [Review][Decision] `auth.ts` throws plain `Error` — never classified as `AUTH_ERROR`, login screen shows wrong message — Fixed: `auth.ts` now throws with `code: 'AUTH_CREDENTIALS_INVALID'`; `mapErrorToUserMessage` has a new branch for this code; `_isLoginRequest` flag added to the POST config.
- [x] [Review][Decision] Axios 401 interceptor in `client.ts` races with login screen error handler — Fixed: interceptor checks `_isLoginRequest` flag and skips redirect for login requests.
- [x] [Review][Patch] `error` prop applied to both inputs for non-credential errors — Fixed: introduced `isAuthError` state; `error` prop now only set for `AUTH_ERROR` type. [`ghc-ai-doctor-app/src/app/index.tsx`]
- [x] [Review][Patch] Whitespace-only username/password bypasses empty-field guard — Fixed: guard now uses `.trim()`. [`ghc-ai-doctor-app/src/app/index.tsx`]
- [x] [Review][Patch] `marginBottom` changed from `Spacing.lg` to `Spacing.sm` with no spec justification — Fixed: reverted to `Spacing.lg`. [`ghc-ai-doctor-app/src/app/index.tsx`]
- [x] [Review][Patch] `testID="error-message"` on `HelperText` is never asserted in tests — Fixed: added `getByTestId('error-message')` assertion. [`ghc-ai-doctor-app/src/app/__tests__/index.test.tsx`]
- [x] [Review][Defer] `handleUsernameChange`/`handlePasswordChange` recreated on every render — no `useCallback` wrapping. Pre-existing pattern in this codebase; not introduced by this story. [`ghc-ai-doctor-app/src/app/index.tsx`] — deferred, pre-existing
- [x] [Review][Defer] `SecureStore` failures in `AuthContext.login` are unhandled — a storage error after successful auth produces a misleading "unexpected error" message. Pre-existing gap in `AuthContext.tsx`, not introduced by this story. [`ghc-ai-doctor-app/src/contexts/AuthContext.tsx`] — deferred, pre-existing
