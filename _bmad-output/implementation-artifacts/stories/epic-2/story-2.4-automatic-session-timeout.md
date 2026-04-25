# Story 2.4: Automatic Session Timeout After 30 Minutes of Inactivity

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.4  
**Priority:** P0 - Critical security requirement (NFR9)

---

## Story

As a hospital administrator,  
I want doctor sessions to automatically expire after 30 minutes of inactivity,  
So that patient data remains secure if a device is left unattended.

---

## Acceptance Criteria

**AC1.**  
**Given** A doctor is logged in and using the app  
**When** 30 minutes pass with no user interaction  
**Then** The session automatically expires  
**And** The session token is cleared from secure storage  
**And** The doctor is redirected to the login screen  
**And** A message displays "Session expired due to inactivity. Please log in again."

**AC2.**  
**Given** A doctor is logged in  
**When** The doctor interacts with the app (tap, scroll, navigation)  
**Then** The 30-minute inactivity timer resets

---

## Tasks / Subtasks

- [ ] Task 1: Add inactivity timer to AuthContext (AC: #1)
  - [ ] Add `SESSION_TIMEOUT_MS = 1800000` constant (30 min) to `src/constants/auth.ts`
  - [ ] Add `inactivityTimerRef` (`useRef<ReturnType<typeof setTimeout> | null>`) to `AuthContext`
  - [ ] Implement `startInactivityTimer()` — clears existing timer, sets new 30-min timeout that calls `handleSessionExpiry()`
  - [ ] Implement `resetInactivityTimer()` — exported via context for consumers to call on user interaction
  - [ ] Implement `handleSessionExpiry()` — clears SecureStore, resets auth state, sets expiry message, navigates to login
  - [ ] Call `startInactivityTimer()` at the end of the `login()` function
  - [ ] Clear timer in the `logout()` function (prevent double-expiry)
  - [ ] Clear timer on `AuthProvider` unmount via `useEffect` cleanup

- [ ] Task 2: Expose `resetInactivityTimer` and `sessionExpiredMessage` via AuthContext (AC: #1, #2)
  - [ ] Add `resetInactivityTimer: () => void` to `AuthContextType` interface
  - [ ] Add `sessionExpiredMessage: string | null` to `AuthContextType` interface
  - [ ] Provide both values in `AuthContext.Provider` value object
  - [ ] Clear `sessionExpiredMessage` after login succeeds

- [ ] Task 3: Display session expiry message on login screen (AC: #1)
  - [ ] Read `sessionExpiredMessage` from `useAuth()` in `src/app/index.tsx`
  - [ ] Display message in a `Banner` or `HelperText` component above the login form when non-null
  - [ ] Clear message when user starts typing in either field

- [ ] Task 4: Wire interaction tracking in authenticated layout (AC: #2)
  - [ ] In `src/app/(auth)/_layout.tsx`, read `resetInactivityTimer` from `useAuth()`
  - [ ] Wrap the `Stack` in a `TouchableWithoutFeedback` (or `GestureDetector`) that calls `resetInactivityTimer` on any touch
  - [ ] Also reset timer on navigation events using Expo Router's `useNavigationContainerRef` focus listener

---

## Dev Notes

### Technical Context

**Inactivity Timer Strategy:**

The timer lives entirely inside `AuthContext` — no new files or libraries needed. A `useRef` holds the `setTimeout` handle so it can be cleared and restarted without triggering re-renders.

```
User interaction → resetInactivityTimer() → clearTimeout + setTimeout(30min)
                                                        ↓ (after 30 min of silence)
                                              handleSessionExpiry()
                                                        ↓
                                              clearSecureStore + setIsAuthenticated(false)
                                              + setSessionExpiredMessage(...) + router.replace('/')
```

**Constants file (`src/constants/auth.ts`):**
```typescript
/** 30 minutes in milliseconds */
export const SESSION_TIMEOUT_MS = 1800000;
```

**Updated `AuthContextType` interface:**
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimer: () => void;
  sessionExpiredMessage: string | null;
}
```

**Updated `AuthContext` (`src/contexts/AuthContext.tsx`):**

```typescript
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { login as apiLogin, logout as apiLogout } from '@/services/api/auth';
import { SESSION_TIMEOUT_MS } from '@/constants/auth';
import type { SessionResponse } from '@/services/api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  resetInactivityTimer: () => void;
  sessionExpiredMessage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const handleSessionExpiry = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('sessionToken');
      await SecureStore.deleteItemAsync('sessionUser');
    } catch (error) {
      console.error('Failed to clear session on expiry:', error);
    }
    setIsAuthenticated(false);
    setUser(null);
    setSessionExpiredMessage('Session expired due to inactivity. Please log in again.');
    router.replace('/');
  }, []);

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(handleSessionExpiry, SESSION_TIMEOUT_MS);
  }, [handleSessionExpiry]);

  const resetInactivityTimer = useCallback(() => {
    if (isAuthenticated) {
      startInactivityTimer();
    }
  }, [isAuthenticated, startInactivityTimer]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = await SecureStore.getItemAsync('sessionToken');
      const userJson = await SecureStore.getItemAsync('sessionUser');

      if (token && userJson) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userJson));
        startInactivityTimer();
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await apiLogin(username, password);

    await SecureStore.setItemAsync('sessionToken', response.sessionId);
    await SecureStore.setItemAsync('sessionUser', JSON.stringify(response.user));

    setIsAuthenticated(true);
    setUser(response.user);
    setSessionExpiredMessage(null);
    startInactivityTimer();
  }

  async function logout() {
    // Cancel inactivity timer on explicit logout
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await SecureStore.deleteItemAsync('sessionToken');
      await SecureStore.deleteItemAsync('sessionUser');
      setIsAuthenticated(false);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        resetInactivityTimer,
        sessionExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Interaction tracking in authenticated layout (`src/app/(auth)/_layout.tsx`):**

```typescript
import { useEffect, useCallback } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import { Stack, router, useNavigationContainerRef } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, resetInactivityTimer } = useAuth();

  // Reset timer on any touch within authenticated screens
  const handleUserInteraction = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Also reset timer on navigation (screen changes count as activity)
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    const unsubscribe = navigationRef?.addListener('state', () => {
      resetInactivityTimer();
    });
    return unsubscribe;
  }, [navigationRef, resetInactivityTimer]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={handleUserInteraction}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

**Session expiry message on login screen (`src/app/index.tsx` addition):**

```typescript
// Add to existing LoginScreen component:
const { login, sessionExpiredMessage } = useAuth();

// Add above the title Text:
{sessionExpiredMessage && (
  <HelperText
    type="error"
    visible={!!sessionExpiredMessage}
    style={styles.expiryMessage}
  >
    {sessionExpiredMessage}
  </HelperText>
)}

// Add to styles:
expiryMessage: {
  marginBottom: Spacing.lg,
  textAlign: 'center',
},
```

### Architecture Compliance

**ARCH-REQ-1: Timer in AuthContext**
- ✅ Inactivity timer lives in `AuthContext` — not in individual screens or components
- ✅ `useRef` for timer handle — avoids unnecessary re-renders
- ✅ `useCallback` for timer functions — stable references for consumers

**ARCH-REQ-2: SecureStore Cleanup**
- ✅ `handleSessionExpiry` deletes both `sessionToken` and `sessionUser` from SecureStore
- ✅ Same cleanup path as explicit `logout()` — consistent behavior

**ARCH-REQ-3: Navigation**
- ✅ Use `router.replace('/')` for expiry redirect — prevents back navigation to authenticated screens
- ✅ Expiry message passed via context, not navigation params — avoids serialization issues

**ARCH-REQ-4: Constants Naming**
- ✅ `SESSION_TIMEOUT_MS` follows `UPPER_SNAKE_CASE` convention for constants
- ✅ Defined in `src/constants/auth.ts` — not hardcoded inline

**ARCH-REQ-5: No New Libraries**
- ✅ Uses native `setTimeout`/`clearTimeout` — no additional packages needed
- ✅ `TouchableWithoutFeedback` from React Native core — already available

### Testing Requirements

**Integration Tests (`src/contexts/__tests__/AuthContext.test.tsx`):**

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '@/services/api/auth';
import { router } from 'expo-router';
import { SESSION_TIMEOUT_MS } from '@/constants/auth';

jest.mock('expo-secure-store');
jest.mock('@/services/api/auth');
jest.mock('expo-router');
jest.useFakeTimers();

describe('AuthContext - inactivity timeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('starts inactivity timer after login', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance timer to just before timeout — should still be authenticated
    act(() => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS - 1000);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('expires session after 30 minutes of inactivity', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance timer past timeout
    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.sessionExpiredMessage).toBe(
        'Session expired due to inactivity. Please log in again.'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionUser');
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('resets timer on resetInactivityTimer call', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    // Advance to 25 minutes
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // User interacts — reset timer
    act(() => {
      result.current.resetInactivityTimer();
    });

    // Advance another 25 minutes (50 min total, but only 25 since last reset)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Should still be authenticated (timer was reset)
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears timer on explicit logout', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      await result.current.logout();
    });

    // Advance past timeout — should NOT trigger expiry message (timer was cleared)
    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('clears sessionExpiredMessage after successful login', async () => {
    const mockSession = {
      sessionId: 'test-session',
      authenticated: true,
      user: {
        uuid: 'user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'testuser',
        person: { uuid: 'person-uuid', display: 'Test User' },
      },
    };

    (apiLogin as jest.Mock).mockResolvedValue(mockSession);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Trigger expiry
    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      jest.advanceTimersByTime(SESSION_TIMEOUT_MS + 100);
    });

    await waitFor(() => {
      expect(result.current.sessionExpiredMessage).not.toBeNull();
    });

    // Log back in — message should clear
    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.sessionExpiredMessage).toBeNull();
  });
});
```

**Component Test (`src/app/__tests__/index.test.tsx` addition):**

```typescript
it('displays session expired message when redirected from timeout', () => {
  (useAuth as jest.Mock).mockReturnValue({
    login: jest.fn(),
    sessionExpiredMessage: 'Session expired due to inactivity. Please log in again.',
  });

  const { getByText } = render(<LoginScreen />);

  expect(
    getByText('Session expired due to inactivity. Please log in again.')
  ).toBeTruthy();
});

it('does not display expiry message when null', () => {
  (useAuth as jest.Mock).mockReturnValue({
    login: jest.fn(),
    sessionExpiredMessage: null,
  });

  const { queryByText } = render(<LoginScreen />);

  expect(
    queryByText('Session expired due to inactivity. Please log in again.')
  ).toBeNull();
});
```

**Manual Test Checklist:**
- [ ] Log in, leave app idle for 30 minutes → redirected to login with expiry message
- [ ] Log in, interact every 25 minutes → session does NOT expire
- [ ] Tapping anywhere on an authenticated screen resets the timer (verify via shortened test timeout)
- [ ] Navigating between screens resets the timer
- [ ] Explicit logout does NOT show expiry message on login screen
- [ ] After expiry, logging back in clears the expiry message
- [ ] SecureStore is empty after session expiry (verify via debug)
- [ ] Back button after expiry does NOT navigate back to dashboard

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**Previous Story Learnings:**
- Story 2.1: `AuthContext` scaffold with `login()`, `logout()`, `isAuthenticated`, `isLoading` — this story extends it
- Story 2.1: `SecureStore` keys are `sessionToken` and `sessionUser`
- Story 2.2: `HelperText` from react-native-paper is the established pattern for inline messages on the login screen
- Story 2.3: `isNetworkError` pattern shows how to add boolean flags to login screen state without restructuring

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Timer lives in `AuthContext` only** — do NOT implement timeout logic in individual screens, layouts, or hooks outside of `AuthContext`

2. **Use `useRef` for the timer handle** — `useState` would cause unnecessary re-renders every time the timer is reset; `useRef` is the correct tool

3. **Use `useCallback` for timer functions** — `startInactivityTimer`, `resetInactivityTimer`, and `handleSessionExpiry` must be stable references to avoid infinite effect loops in consumers

4. **Clear timer on explicit logout** — prevents a race condition where the timer fires after the user has already logged out, setting `sessionExpiredMessage` incorrectly

5. **Use `router.replace('/')` not `router.push('/')`** — prevents the doctor from pressing back to return to an expired authenticated screen

6. **`SESSION_TIMEOUT_MS` must be a named constant** — defined in `src/constants/auth.ts` as `UPPER_SNAKE_CASE`; never hardcode `1800000` inline

7. **`resetInactivityTimer` must guard on `isAuthenticated`** — calling it when not authenticated should be a no-op to avoid starting a timer for unauthenticated users

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** use `setInterval` — use `setTimeout` that is restarted on each interaction; `setInterval` cannot be easily reset
2. **DO NOT** store the timer ID in `useState` — this causes a re-render on every reset, degrading performance
3. **DO NOT** implement logout confirmation here — that is Story 2.6
4. **DO NOT** add screenshot prevention here — that is Story 2.5
5. **DO NOT** implement session persistence validation here — that is Story 2.7
6. **DO NOT** use `AppState` for background detection — the requirement is inactivity (no interaction), not background/foreground state

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ Session expires automatically after exactly 30 minutes of no user interaction
2. ✅ Any tap or navigation event resets the 30-minute timer
3. ✅ On expiry: SecureStore cleared, `isAuthenticated` set to `false`, redirected to login
4. ✅ Login screen shows "Session expired due to inactivity. Please log in again." after expiry
5. ✅ Explicit logout clears the timer and does NOT show the expiry message
6. ✅ `SESSION_TIMEOUT_MS` constant defined in `src/constants/auth.ts`
7. ✅ `resetInactivityTimer` and `sessionExpiredMessage` exposed via `AuthContextType`
8. ✅ All integration tests pass (including fake timer tests)
9. ✅ TypeScript compilation succeeds with no errors
10. ✅ Manual testing confirms all acceptance criteria
11. ✅ Code committed with message: `"feat: implement story 2.4 - automatic session timeout after 30 minutes"`

---

**Story Created:** 2026-04-25  
**Ready for Implementation:** Yes  
**Blocking Stories:** None  
**Blocked By:** Story 2.1 (AuthContext scaffold) — must be complete  
**Estimated Effort:** 3-4 hours
