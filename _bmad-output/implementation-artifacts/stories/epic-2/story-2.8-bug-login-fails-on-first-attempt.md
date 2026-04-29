# Story 2.8: [BUG] Login Fails on First Attempt with "An error occurred"

**Status:** review  
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
  - [x] Test covers: fresh mount -> login call -> success (no prior state)

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

### Debug Log

- 2026-04-29: Confirmed story key 2.8 from `story-2.8-bug-login-fails-on-first-attempt.md`; no sprint-status file exists at configured implementation artifacts path.
- 2026-04-29: Inspected `auth.ts`, `client.ts`, `AuthContext.tsx`, login screen, and centralized error handler. Root cause isolated to `AuthContext` allowing `login()` to call the auth API while the initial SecureStore-backed `checkSession()` was still pending.
- 2026-04-29: Added failing regression test proving `apiLogin` was called before initial session restore completed.
- 2026-04-29: Implemented session-check promise tracking in `AuthContext` and made `login()` await the startup session check before calling `apiLogin`.
- 2026-04-29: Full test run initially exposed an unrelated stale patients endpoint assertion; updated the test to match the existing custom visit representation so regression validation can run cleanly.
- 2026-04-29: User reproduced first-login failure on fresh Expo run with "An unexpected error occurred"; added failing auth-service test for successful OpenMRS response where `Set-Cookie` is not exposed but `sessionId` is present in the response body.
- 2026-04-29: Updated `auth.ts` token extraction to fall back to `response.data.sessionId` when the JSESSIONID cookie header is unavailable.
- 2026-04-29: User still reproduced the same generic message after the sessionId fallback; removed dependency on native `btoa` by adding a local UTF-8 Base64 encoder and test coverage for native runtimes without `btoa`.
- 2026-04-29: User requested additional diagnostics after continued generic first-login failure; added sanitized login-flow logs across `auth.ts`, `AuthContext.tsx`, and the login screen catch path.
- 2026-04-29: Device log showed OpenMRS o3 returns `authenticated: true` but exposes neither `Set-Cookie` nor body `sessionId`; changed `SessionResponse.sessionId` to nullable and allowed authenticated runtime-cookie sessions to proceed without SecureStore token persistence.
- 2026-04-29: Removed temporary diagnostic logs after user confirmed login works.

### Completion Notes

- Fixed first-attempt login race by serializing login behind the initial session restore in `AuthContext`.
- Added a regression test for fresh mount with pending SecureStore read -> login call -> successful authentication.
- Verified invalid credentials and network error behavior through existing auth service and login screen suites.
- Updated stale patients service endpoint assertion encountered during full regression run; production patient service behavior was unchanged.
- Added response-body `sessionId` fallback so mobile runtimes that do not expose `Set-Cookie` can still persist the confirmed OpenMRS session on the first login attempt.
- Replaced `btoa(unescape(encodeURIComponent(...)))` with local UTF-8 Base64 encoding so native runtime globals cannot block the first login request.
- Added temporary sanitized diagnostics for first-login failure triage: request stage, response status/data/header keys, token source, AuthContext persistence stage, and final UI error mapping.
- Fixed confirmed o3 behavior where login succeeds but no session token is exposed to React Native; AuthContext now authenticates the user using the active native cookie session and skips stale SecureStore persistence when `sessionId` is null.
- Removed temporary login diagnostics from `auth.ts`, `AuthContext.tsx`, and `src/app/index.tsx`.
- Validation passed: `npm test -- --runTestsByPath src/services/api/__tests__/auth.test.ts --runInBand`, `npm test -- --runTestsByPath src/contexts/__tests__/AuthContext.test.tsx --runInBand`, `npm test -- --runTestsByPath src/app/__tests__/index.test.tsx --runInBand`, `npm run type-check`, `npm test -- --runInBand`, and `npm run lint` (0 errors, 5 existing warnings).

## File List

- `ghc-ai-doctor-app/src/contexts/AuthContext.tsx`
- `ghc-ai-doctor-app/src/contexts/__tests__/AuthContext.test.tsx`
- `ghc-ai-doctor-app/src/app/index.tsx`
- `ghc-ai-doctor-app/src/services/api/auth.ts`
- `ghc-ai-doctor-app/src/services/api/types.ts`
- `ghc-ai-doctor-app/src/services/api/__tests__/auth.test.ts`
- `ghc-ai-doctor-app/src/services/api/__tests__/patients.test.ts`
- `_bmad-output/implementation-artifacts/stories/epic-2/story-2.8-bug-login-fails-on-first-attempt.md`

## Change Log

- 2026-04-29: Fixed login startup race, added first-attempt regression coverage, aligned stale patients endpoint test, and marked story ready for review.
- 2026-04-29: Added OpenMRS response-body sessionId fallback after fresh Expo run still failed when Set-Cookie was unavailable on first login.
- 2026-04-29: Removed native `btoa` dependency from Basic Auth credential encoding and added regression coverage.
- 2026-04-29: Added sanitized diagnostic logs to capture the actual failing first-login stage on device.
- 2026-04-29: Allowed authenticated OpenMRS sessions with no exposed token to complete login using the native runtime cookie session.
- 2026-04-29: Removed temporary diagnostic logs after verification.
