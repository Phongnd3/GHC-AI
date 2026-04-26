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
