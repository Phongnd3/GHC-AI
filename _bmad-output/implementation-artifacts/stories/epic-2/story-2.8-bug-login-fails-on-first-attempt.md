# Story 2.8: [BUG] Login Fails on First Attempt with "An error occurred"

**Status:** ready-for-dev  
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

- [ ] Task 1: Investigate root cause of first-attempt failure (AC: #1, #2)
  - [ ] Check `src/services/api/auth.ts` `login()` for race conditions or uninitialized state
  - [ ] Check `src/contexts/AuthContext.tsx` for initialization timing issues
  - [ ] Check `src/services/api/client.ts` for lazy initialization that may fail on first call
  - [ ] Check if SecureStore read on mount causes a state conflict with the login call
  - [ ] Check if the error is swallowed/misclassified (network vs auth error)
  - [ ] Add temporary logging to identify which layer throws on first attempt

- [ ] Task 2: Fix the identified root cause (AC: #1, #2)
  - [ ] Apply fix in the appropriate layer (auth service, API client, or AuthContext)
  - [ ] Ensure no regression on: invalid credentials error (Story 2.2), network error (Story 2.3)

- [ ] Task 3: Add regression test (AC: #1)
  - [ ] Add unit/integration test that simulates first-attempt login and asserts success
  - [ ] Test covers: fresh mount → login call → success (no prior state)

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
