# Story 2.8: [BUG] Login Fails on First Attempt with "An error occurred"

**Status:** done  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.8  
**Type:** Bug  
**Priority:** P0 - Blocking user access  
**Reported:** 2026-04-28

---

## Bug Report

**Observed Behavior:**  
When a doctor attempts to log in for the first time (or after app restart), the login fails with the message "An error occurred". Tapping Login a second time with the same credentials succeeds.

**Expected Behavior:**  
Login should succeed on the first attempt with valid credentials.

**Reproduction Steps:**
1. Open the app (fresh launch or after restart)
2. Enter valid OpenMRS username and password
3. Tap "Login"
4. Observe: "An error occurred" is shown
5. Tap "Login" again (same credentials, no changes)
6. Observe: Login succeeds and user is redirected to dashboard

**Frequency:** Reproducible on every first login attempt after app launch/restart.

---

## Story

As a doctor,  
I want my login to succeed on the first attempt,  
So that I can access my patients without confusion or repeated login attempts.

---

## Acceptance Criteria

**AC1.**  
**Given** I am on the login screen after a fresh app launch  
**When** I enter valid OpenMRS credentials and tap "Login"  
**Then** The login succeeds on the first attempt  
**And** I am redirected to the My Patients dashboard  
**And** No error message is shown

**AC2.**  
**Given** I am on the login screen  
**When** I enter valid credentials and tap "Login"  
**Then** The same behavior occurs on first attempt as on subsequent attempts

---

## Tasks / Subtasks

- [x] Task 1: Investigate root cause of first-attempt failure (AC: #1, #2)
  - [x] Check `src/services/api/auth.ts` `login()` for race conditions or uninitialized state
  - [x] Check `src/contexts/AuthContext.tsx` for initialization timing issues
  - [x] Check `src/services/api/client.ts` for lazy initialization that may fail on first call
  - [x] Check if SecureStore read on mount causes a state conflict with the login call
  - [x] Check if the error is swallowed/misclassified (network vs auth error)
  - [x] Add temporary logging to identify which layer throws on first attempt

- [x] Task 2: Fix the identified root cause (AC: #1, #2)
  - [x] Apply fix in the appropriate layer (auth service, API client, or AuthContext)
  - [x] Ensure no regression on: invalid credentials error (Story 2.2), network error (Story 2.3)

- [x] Task 3: Add regression test (AC: #1)
  - [x] Add unit/integration test that simulates first-attempt login and asserts success
  - [x] Test covers: fresh mount → login call → success (no prior state)

### Review Findings

- [x] [Review][Patch] `_isLoginRequest` string is duplicated across `auth.ts` and `client.ts` with no shared constant — a typo in either location silently breaks the guard [`auth.ts` line ~44, `client.ts` line ~18]
- [x] [Review][Defer] `logout()` DELETE is not guarded with `_isLoginRequest` — asymmetry with the comment, but correct behavior (logout should send the session cookie to invalidate server-side) [`client.ts`] — deferred, intentional asymmetry
- [x] [Review][Defer] iOS native cookie jar (`NSURLSession`) is not cleared — if a prior `JSESSIONID` is in the native cookie store, iOS may still attach it to the login POST below the Axios layer; fix is necessary but may not be sufficient on all iOS configurations [`auth.ts`] — deferred, requires native cookie clearing module out of scope for this fix
- [x] [Review][Defer] No test for `_isLoginRequest: false` (explicit false vs absent) — `=== true` guard is correct and the true case is tested; explicit-false case is a minor gap [`client.test.ts`] — deferred, low risk

---

## Dev Notes

### Likely Root Causes to Investigate

**1. API Client Initialization Race (Most Likely)**  
`src/services/api/client.ts` may perform async initialization (e.g., reading base URL from SecureStore or env). If `login()` is called before initialization completes, the first request may fail. Check if `apiClient` has an `initialize()` or similar async setup that isn't awaited before the first call.

**2. AuthContext Mount + SecureStore Read Conflict**  
`src/contexts/AuthContext.tsx` likely reads the stored session token on mount (to restore session). If the login call races with this async read, the context state may be in an inconsistent state during the first login attempt. Check the `useEffect` on mount and whether it interferes with the `login()` function.

**3. Error Misclassification**  
The centralized error handler (`src/utils/errorHandler.ts`) may be catching a non-error condition (e.g., a 401 on the initial session check) and surfacing it as "An error occurred" before the actual login call is made.

**4. Double-call / Stale Closure**  
The login button handler may be using a stale closure over an uninitialized state value, causing the first call to use empty/undefined credentials while the second call uses the correct values.

### Key Files to Examine

```
src/services/api/auth.ts          # login() implementation
src/services/api/client.ts        # API client setup and initialization
src/contexts/AuthContext.tsx      # login(), isAuthenticated state, mount effect
src/app/index.tsx                 # Login screen, form submit handler
src/utils/errorHandler.ts         # Error classification and display
```

### OpenMRS Session API (Reference)

- **Endpoint:** `POST /openmrs/ws/rest/v1/session`
- **Auth:** HTTP Basic Auth (`Authorization: Basic base64(username:password)`)
- **Success Response:** `{ "sessionId": "...", "authenticated": true, "user": {...} }`
- **Failure Response:** `{ "authenticated": false }` (200 status, not an error)

> ⚠️ Note: OpenMRS returns HTTP 200 even for invalid credentials — `authenticated: false` is the failure signal. Ensure the client is not treating this as a network error.

### Architecture Compliance

- All fixes must go through `src/services/api/` layer — no direct fetch calls in components
- Error display must use the centralized error handler pattern
- No credentials stored beyond the login call
- Session token stored in Expo SecureStore only on confirmed success

### Do Not Break

- Story 2.2: Invalid credentials must still show the correct error message
- Story 2.3: Network errors must still be handled and displayed correctly
- Story 2.4: Session timeout behavior must be unaffected
- Story 2.7: Session persistence on restart must be unaffected

---

## Dev Agent Record

### Completion Notes

**Root Cause (confirmed via device logs):**

The pre-login `DELETE /session` in `auth.ts` was the culprit. When it fired, the iOS native HTTP stack received a `Set-Cookie: JSESSIONID=...` from the DELETE response and cached it. The subsequent `POST /session` then had that cookie automatically attached by iOS. OpenMRS saw the existing `JSESSIONID`, reused the session, and returned the session data **without** a new `Set-Cookie` header — so `extractJSessionId` found nothing and threw "No session token received from server". `mapErrorToUserMessage` classified this as `UNKNOWN_ERROR` → "An unexpected error occurred."

The second tap worked because by then the iOS cookie cache had settled or the session had expired.

**Fix applied:**

1. `auth.ts` — Removed the pre-login `DELETE /session` entirely. The comment explains why it must not be added back.
2. `client.ts` — Added `_isLoginRequest` guard to the request interceptor so stored `JSESSIONID` cookies are never attached to login requests (defense-in-depth: prevents the same failure if a stale token is in SecureStore).

**Tests added:**
- `auth.test.ts`: regression test asserting `apiClient.delete` is NOT called during `login()`
- `client.test.ts`: regression test asserting Cookie header is NOT attached when `_isLoginRequest: true`

All 129 tests pass. TypeScript: clean. Lint: 0 errors.

---

## File List

**Modified Files:**
- `ghc-ai-doctor-app/src/services/api/auth.ts` — removed pre-login `DELETE /session`
- `ghc-ai-doctor-app/src/services/api/client.ts` — added `_isLoginRequest` guard to request interceptor
- `ghc-ai-doctor-app/src/services/api/__tests__/auth.test.ts` — added regression test
- `ghc-ai-doctor-app/src/services/__tests__/client.test.ts` — added regression test

---

## Change Log

**Date:** 2026-04-28

**Changes:**
- Removed pre-login `DELETE /session` from `auth.ts` (root cause of first-attempt login failure)
- Added `_isLoginRequest` guard to `client.ts` request interceptor (prevents stale cookie attachment on login)
- Added 2 regression tests covering both fix points
- All 129 tests pass
