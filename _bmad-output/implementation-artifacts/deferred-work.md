# Deferred Work

This file tracks issues identified during code reviews that are deferred to later stories or sprints.

## Deferred from: code review of story-1.1-initialize-expo-project (2026-04-23)

- **Empty API service directory with no base client** — API service directory is empty; axios and swr are installed but have no client setup. First network call will have no timeout, no auth header, and no error normalization. (Likely addressed in later stories)
- **No test script or test dependencies** — No test script or test dependencies despite 90%/80% coverage targets in sprint plan. (Story 1.3 handles testing infrastructure)
- **No ESLint, Prettier, or Husky** — No ESLint, Prettier, or Husky in devDependencies or scripts. (Story 1.2 handles development tooling)

## Deferred from: code review of story-2.1-doctor-login-openmrs-credentials (2026-04-25)

- [D1] No error UI for login failures in `app/index.tsx` — catch block only logs; user has no feedback on wrong password, network error, etc. Deferred to Story 2.2 per spec.
- [D2] Session not validated against server on app mount — `checkSession()` only checks SecureStore presence, not a live `/session` GET. A stale/expired token is accepted as valid. Deferred to Story 2.4 (session timeout).
- [D3] `logout()` swallows server-side logout failure — intentional per spec ("clear local session regardless of API result"). No action needed.
- [R7] Double navigation race: 401 interceptor in `client.ts` and `AuthLayout` useEffect both call `router.replace('/')` concurrently on session expiry. Fix: remove `router.replace` from interceptor and let AuthContext state propagate to AuthLayout. Deferred to Story 2.4 (session management).

## Deferred from: code review of story-2.2-handle-invalid-login-credentials (2026-04-26)

- **`handleUsernameChange`/`handlePasswordChange` recreated on every render** — no `useCallback` wrapping. Pre-existing pattern in this codebase; not introduced by this story. Consider wrapping with `useCallback` in a future refactor pass.
- **`SecureStore` failures in `AuthContext.login` are unhandled** — a storage error after successful authentication produces a misleading "An unexpected error occurred" message even though credentials were valid. Pre-existing gap in `AuthContext.tsx`. Should be addressed when hardening the auth flow (Story 2.4 or a dedicated hardening story).

## Deferred from: code review of story-2.3-handle-network-errors-during-login (2026-04-26)

- **`isNetworkError` / `errorMessage` state coupling** — both states are always set together, but the clear guard in change handlers only checks `if (errorMessage)`. If a future change clears `errorMessage` without clearing `isNetworkError`, the Retry button would persist stale. Consider a single `errorState: { message: string; type: ErrorType | null }` object to keep them atomic.
- **`TIMEOUT_ERROR` shows no Retry button** — a request timeout is functionally a network failure from the user's perspective, but the spec scopes Retry to `NETWORK_ERROR` only. A future UX improvement story should consider showing Retry for `TIMEOUT_ERROR` as well.
- **Login button `disabled` uses `!username || !password` without `.trim()`** — pre-existing from Story 2.2. The `handleLogin` guard uses `.trim()`, creating a mismatch where whitespace-only credentials enable the Login button but pressing it silently no-ops. Fix in a future cleanup pass.

## Deferred from: code review of story-2.4-automatic-session-timeout (2026-04-26)

- **`JSON.parse(userJson)` blind-cast without schema validation in `checkSession()`** — pre-existing in `AuthContext.tsx` from Story 2.1. A corrupt but parseable JSON object would silently set `user` to an unexpected shape. Consider adding a runtime type guard (e.g., checking for required fields like `uuid` and `username`) in a future hardening pass.

## Deferred from: code review of story-2.5-prevent-screenshots-clinical-screens (2026-04-26)

- **FLAG_SECURE set on login screen window via deep-link into `(auth)/` before auth resolves** — If a deep link targets an `(auth)/` route and Expo Router mounts `AuthLayout` before `useAuth` resolves `isAuthenticated`, `usePreventScreenCapture()` fires and FLAG_SECURE is set. If auth then fails and the router redirects to `/`, the login screen renders inside the same Android window with FLAG_SECURE active until `AuthLayout` fully unmounts. Requires Expo Router navigation architecture change to fix; deferred as out of scope for this story.

## Deferred from: code review of story-2.6-doctor-logout-with-confirmation (2026-04-26)

- **State update on unmounted component after `router.replace('/')`** — `handleConfirmLogout`'s `finally` block calls `setIsLoggingOut(false)` and `setShowLogoutDialog(false)` after `router.replace('/')` has already navigated away. React 19 handles this gracefully (no crash, warning suppressed), but it is technically a state update on an unmounted component. Fixing requires an `isMounted` ref pattern for minimal practical gain. Deferred to a future hardening pass.

## Deferred from: code review of story-2.7-session-persistence-across-app-restarts (2026-04-26)

- **`parseInt(timestampStr, 10)` NaN not guarded explicitly** — if `timestampStr` is non-numeric, `NaN < SESSION_TIMEOUT_MS` evaluates to `false`, so the code falls into the safe expired branch. Behavior is correct but implicit. Adding an explicit `isNaN(elapsed)` guard with a log would make intent clear. Low priority cosmetic fix.
- **Clock skew can prematurely expire a valid session** — `sessionTimestamp` is a wall-clock value from `Date.now()`. If the device clock jumps forward (NTP sync, manual change) between login and relaunch, `elapsed` is artificially large and a valid session is expired. Inherent limitation of wall-clock timestamps; no standard fix without server-side token validation.
- **`checkSession()` no-session path does not call `setSessionExpiredMessage(null)`** — when all SecureStore keys are null, `sessionExpiredMessage` is not explicitly cleared. Unreachable in practice since `logout()` and `handleSessionExpiry()` both clear state before keys are removed. Low risk; consider adding for defensive completeness in a future hardening pass.
- **No test asserts navigation to dashboard after valid session restore** — `checkSession()` sets `isAuthenticated = true` and the layout's redirect logic handles navigation, but no test covers this end-to-end path. Requires integration test infrastructure (e.g., Detox or a full router mock) not yet in place.
