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
