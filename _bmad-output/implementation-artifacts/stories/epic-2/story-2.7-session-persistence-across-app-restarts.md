# Story 2.7: Session Persistence Across App Restarts

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.7  
**Priority:** P0 - Core UX requirement (NFR8)

---

## Story

As a doctor,  
I want my session to persist when I close and reopen the app,  
So that I don't have to log in again unless my session has expired.

---

## Acceptance Criteria

**AC1.**  
**Given** I am logged in with an active session  
**When** I close the app and reopen it within 30 minutes  
**Then** I am automatically taken to the My Patients dashboard  
**And** My session token is still valid

**AC2.**  
**Given** I was logged in but closed the app  
**When** I reopen the app after 30 minutes of inactivity  
**Then** I am taken to the login screen  
**And** I see the message "Session expired. Please log in again."

---

## Tasks / Subtasks

- [ ] Task 1: Store session timestamp on login (AC: #1, #2)
  - [ ] In `AuthContext.login()`, after storing `sessionToken`, also store the current timestamp: `SecureStore.setItemAsync('sessionTimestamp', Date.now().toString())`
  - [ ] In `AuthContext.logout()`, delete `sessionTimestamp` from SecureStore alongside `sessionToken` and `sessionUser`
  - [ ] In `AuthContext.handleSessionExpiry()` (Story 2.4), delete `sessionTimestamp` from SecureStore

- [ ] Task 2: Validate session age on app launch (AC: #1, #2)
  - [ ] In `AuthContext.checkSession()`, after reading `sessionToken` and `sessionUser`, also read `sessionTimestamp`
  - [ ] Calculate elapsed time: `Date.now() - parseInt(sessionTimestamp, 10)`
  - [ ] If elapsed time < `SESSION_TIMEOUT_MS` (30 min): restore session, start inactivity timer → navigate to dashboard
  - [ ] If elapsed time >= `SESSION_TIMEOUT_MS`: clear all SecureStore keys, set `sessionExpiredMessage` to `"Session expired. Please log in again."` → show login screen

- [ ] Task 3: Update `(auth)/_layout.tsx` to handle initial navigation (AC: #1)
  - [ ] Confirm the existing redirect logic (`if (!isLoading && !isAuthenticated) router.replace('/')`) correctly handles both the valid-session and expired-session paths
  - [ ] No changes needed if Story 2.1's layout already handles this — document the verification

---

## Dev Notes

### Technical Context

**Why a timestamp is needed:**

The existing `checkSession()` in `AuthContext` (Story 2.1) only checks whether a token exists in SecureStore — it does not validate whether the token is still within the 30-minute window. When the app is closed, the inactivity timer (Story 2.4) is destroyed with the JavaScript runtime. On relaunch, there is no running timer to expire the session. The timestamp stored at login time is the only way to know how long the app has been closed.

**SecureStore keys summary after this story:**

| Key | Value | Set in | Cleared in |
|---|---|---|---|
| `sessionToken` | OpenMRS `sessionId` | `login()` | `logout()`, `handleSessionExpiry()`, `checkSession()` (expired) |
| `sessionUser` | JSON-serialised user object | `login()` | `logout()`, `handleSessionExpiry()`, `checkSession()` (expired) |
| `sessionTimestamp` | `Date.now().toString()` | `login()` | `logout()`, `handleSessionExpiry()`, `checkSession()` (expired) |

**Updated `AuthContext.checkSession()`:**

```typescript
async function checkSession() {
  try {
    const token = await SecureStore.getItemAsync('sessionToken');
    const userJson = await SecureStore.getItemAsync('sessionUser');
    const timestampStr = await SecureStore.getItemAsync('sessionTimestamp');

    if (token && userJson && timestampStr) {
      const elapsed = Date.now() - parseInt(timestampStr, 10);

      if (elapsed < SESSION_TIMEOUT_MS) {
        // Session is still valid — restore it
        setIsAuthenticated(true);
        setUser(JSON.parse(userJson));
        startInactivityTimer();
      } else {
        // Session has expired while app was closed — clean up
        await SecureStore.deleteItemAsync('sessionToken');
        await SecureStore.deleteItemAsync('sessionUser');
        await SecureStore.deleteItemAsync('sessionTimestamp');
        setSessionExpiredMessage('Session expired. Please log in again.');
      }
    }
  } catch (error) {
    console.error('Session check failed:', error);
  } finally {
    setIsLoading(false);
  }
}
```

**Updated `AuthContext.login()`:**

```typescript
async function login(username: string, password: string) {
  const response = await apiLogin(username, password);

  await SecureStore.setItemAsync('sessionToken', response.sessionId);
  await SecureStore.setItemAsync('sessionUser', JSON.stringify(response.user));
  await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString()); // NEW

  setIsAuthenticated(true);
  setUser(response.user);
  setSessionExpiredMessage(null);
  startInactivityTimer();
}
```

**Updated `AuthContext.logout()`:**

```typescript
async function logout() {
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
    await SecureStore.deleteItemAsync('sessionTimestamp'); // NEW
    setIsAuthenticated(false);
    setUser(null);
  }
}
```

**Updated `AuthContext.handleSessionExpiry()`:**

```typescript
const handleSessionExpiry = useCallback(async () => {
  try {
    await SecureStore.deleteItemAsync('sessionToken');
    await SecureStore.deleteItemAsync('sessionUser');
    await SecureStore.deleteItemAsync('sessionTimestamp'); // NEW
  } catch (error) {
    console.error('Failed to clear session on expiry:', error);
  }
  setIsAuthenticated(false);
  setUser(null);
  setSessionExpiredMessage('Session expired due to inactivity. Please log in again.');
  router.replace('/');
}, []);
```

**Expiry message distinction:**

| Trigger | Message |
|---|---|
| In-app inactivity timer fires (Story 2.4) | "Session expired due to inactivity. Please log in again." |
| App relaunched after > 30 min closed (Story 2.7) | "Session expired. Please log in again." |

Both messages are displayed via the existing `sessionExpiredMessage` state on the login screen (established in Story 2.4).

**Navigation flow on app launch:**

```
App opens
    ↓
AuthProvider mounts → checkSession() runs
    ↓
Token + user + timestamp found?
    ├── No  → isLoading = false, isAuthenticated = false → login screen (no message)
    ├── Yes, elapsed < 30 min → restore session, start timer → (auth)/_layout.tsx sees
    │         isAuthenticated = true → dashboard
    └── Yes, elapsed >= 30 min → clear SecureStore, set expiry message → login screen
                                   with "Session expired. Please log in again."
```

The `(auth)/_layout.tsx` redirect logic from Story 2.1 (`if (!isLoading && !isAuthenticated) router.replace('/')`) handles this correctly without modification — it waits for `isLoading = false` before acting.

### Architecture Compliance

**ARCH-REQ-1: SecureStore for all session data**
- ✅ `sessionTimestamp` stored in Expo SecureStore (Android Keystore) — consistent with `sessionToken` and `sessionUser`
- ✅ Never stored in `AsyncStorage`, `useState`, or module-level variables

**ARCH-REQ-2: Constants**
- ✅ Reuses `SESSION_TIMEOUT_MS` from `src/constants/auth.ts` (defined in Story 2.4) — no new constants needed

**ARCH-REQ-3: Minimal surface area**
- ✅ Changes confined to `AuthContext.tsx` only — `checkSession()`, `login()`, `logout()`, `handleSessionExpiry()`
- ✅ No new files, components, or hooks required

**ARCH-REQ-4: Consistent expiry message flow**
- ✅ Uses existing `sessionExpiredMessage` state from Story 2.4 — no new state or UI changes needed on the login screen

### Testing Requirements

**Integration Tests (`src/contexts/__tests__/AuthContext.test.tsx` additions):**

```typescript
import { SESSION_TIMEOUT_MS } from '@/constants/auth';

describe('AuthContext - session persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restores session on app relaunch within 30 minutes', async () => {
    const recentTimestamp = (Date.now() - 10 * 60 * 1000).toString(); // 10 min ago

    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sessionToken') return Promise.resolve('stored-token');
      if (key === 'sessionUser') return Promise.resolve(
        JSON.stringify({
          uuid: 'user-uuid',
          display: 'Test User',
          username: 'testuser',
          systemId: 'testuser',
          person: { uuid: 'person-uuid', display: 'Test User' },
        })
      );
      if (key === 'sessionTimestamp') return Promise.resolve(recentTimestamp);
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('testuser');
    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('expires session on app relaunch after 30 minutes', async () => {
    const expiredTimestamp = (Date.now() - SESSION_TIMEOUT_MS - 1000).toString(); // 31 min ago

    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'sessionToken') return Promise.resolve('stored-token');
      if (key === 'sessionUser') return Promise.resolve(
        JSON.stringify({
          uuid: 'user-uuid',
          display: 'Test User',
          username: 'testuser',
          systemId: 'testuser',
          person: { uuid: 'person-uuid', display: 'Test User' },
        })
      );
      if (key === 'sessionTimestamp') return Promise.resolve(expiredTimestamp);
      return Promise.resolve(null);
    });

    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionExpiredMessage).toBe(
      'Session expired. Please log in again.'
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionUser');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionTimestamp');
  });

  it('shows no message when no session exists on launch', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionExpiredMessage).toBeNull();
  });

  it('stores sessionTimestamp on login', async () => {
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
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'sessionTimestamp',
      expect.stringMatching(/^\d+$/) // numeric timestamp string
    );
  });

  it('deletes sessionTimestamp on logout', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionTimestamp');
  });
});
```

**Manual Test Checklist:**
- [ ] Log in → force-close the app → reopen within 30 minutes → lands on dashboard (no login required)
- [ ] Log in → force-close the app → wait 30+ minutes → reopen → lands on login screen with "Session expired. Please log in again."
- [ ] Log in → force-close the app → reopen within 30 minutes → verify inactivity timer is running (leave idle for 30 min → auto-logout)
- [ ] Fresh install (no stored session) → open app → lands on login screen with no expiry message
- [ ] Log out explicitly → reopen app → lands on login screen with no expiry message
- [ ] Verify SecureStore contains `sessionTimestamp` after login (via debug/Expo DevTools)
- [ ] Verify SecureStore is empty after logout (via debug/Expo DevTools)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**Previous Story Learnings:**
- Story 2.1: `checkSession()` scaffold reads `sessionToken` and `sessionUser` — this story extends it with timestamp validation
- Story 2.1: `login()` stores token and user — this story adds `sessionTimestamp` to the same write
- Story 2.4: `SESSION_TIMEOUT_MS`, `startInactivityTimer()`, `handleSessionExpiry()`, `sessionExpiredMessage` — all reused directly
- Story 2.4: `handleSessionExpiry()` already clears SecureStore — this story adds `sessionTimestamp` to that cleanup
- Story 2.4: Login screen already displays `sessionExpiredMessage` via `HelperText` — no UI changes needed

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Store `sessionTimestamp` as a string** — `SecureStore` only stores strings; use `Date.now().toString()` and `parseInt(timestampStr, 10)` to read it back

2. **Delete `sessionTimestamp` in ALL three cleanup paths** — `logout()`, `handleSessionExpiry()`, and `checkSession()` (expired branch); missing any one creates stale data that could cause incorrect session restoration on the next launch

3. **Reuse `SESSION_TIMEOUT_MS` from `src/constants/auth.ts`** — do NOT hardcode `1800000` or `30 * 60 * 1000` inline

4. **Call `startInactivityTimer()` after restoring session in `checkSession()`** — the in-app timer must be running after a valid session is restored, so the 30-minute countdown continues from the moment the app is opened

5. **Use distinct expiry messages** — `"Session expired. Please log in again."` (relaunch) vs `"Session expired due to inactivity. Please log in again."` (in-app timer); both use the same `sessionExpiredMessage` state

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** store the timestamp in `AsyncStorage` — use `SecureStore` for consistency with all other session data
2. **DO NOT** store the timestamp in React state or a module-level variable — it will not survive an app restart
3. **DO NOT** restart the 30-minute window from the moment the app reopens — the elapsed time since login/last-activity is what matters; if 31 minutes have passed, the session is expired regardless of when the app was reopened
4. **DO NOT** modify `(auth)/_layout.tsx` — the existing redirect logic handles both paths correctly
5. **DO NOT** add new UI components — the existing `sessionExpiredMessage` display on the login screen (Story 2.4) handles both expiry messages

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ `sessionTimestamp` is written to SecureStore on every successful login
2. ✅ `checkSession()` reads and validates the timestamp on app launch
3. ✅ App reopened within 30 min → session restored, inactivity timer started, dashboard shown
4. ✅ App reopened after 30+ min → SecureStore cleared, "Session expired. Please log in again." shown on login screen
5. ✅ `sessionTimestamp` deleted in `logout()`, `handleSessionExpiry()`, and expired `checkSession()` branch
6. ✅ Fresh launch with no stored session → login screen with no expiry message
7. ✅ All integration tests pass
8. ✅ TypeScript compilation succeeds with no errors
9. ✅ Manual testing confirms both acceptance criteria on a physical or emulated Android device
10. ✅ Code committed with message: `"feat: implement story 2.7 - session persistence across app restarts"`

---

**Story Created:** 2026-04-25  
**Ready for Implementation:** Yes  
**Blocking Stories:** None — this is the final story in Epic 2  
**Blocked By:** Story 2.1 (AuthContext + SecureStore scaffold), Story 2.4 (`SESSION_TIMEOUT_MS`, `startInactivityTimer`, `sessionExpiredMessage`)  
**Estimated Effort:** 2-3 hours

---

## Epic 2 Completion Note

With Story 2.7, all seven stories in Epic 2 (Authentication & Session Management) are specified and ready for development:

| Story | Title | Effort |
|---|---|---|
| 2.1 | Doctor Login with OpenMRS Credentials | 4-6 hrs |
| 2.2 | Handle Invalid Login Credentials | 1-2 hrs |
| 2.3 | Handle Network Errors During Login | 1-2 hrs |
| 2.4 | Automatic Session Timeout After 30 Minutes | 3-4 hrs |
| 2.5 | Prevent Screenshots on Clinical Screens | 0.5-1 hr |
| 2.6 | Doctor Logout with Confirmation | 2-3 hrs |
| 2.7 | Session Persistence Across App Restarts | 2-3 hrs |
| **Total** | | **~14-21 hrs** |
