# Story 1.5: Configure API Client (Axios with Interceptors)

**Status:** ready-for-dev  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.5  
**Priority:** P0 - Blocking all API-dependent features  
**Depends On:** Story 1.4 (Implement Theme System) ✅ ready-for-dev

---

## Story

As a developer,  
I want a configured Axios client with interceptors,  
So that all API calls have consistent error handling and auth token injection.

---

## Acceptance Criteria

**AC1.**  
**Given** The project has theme system configured  
**When** I create API client in `src/services/api/client.ts`  
**Then** Axios instance is configured with base URL from environment variables  
**And** Request interceptor adds session token to all requests  
**And** Response interceptor handles 401 errors (clears token and redirects to login)  
**And** 10-second timeout is configured  
**And** A sample API call demonstrates the client usage

---

## Tasks / Subtasks

- [ ] Task 1: Create Axios client instance (AC: #1)
  - [ ] Create `src/services/api/client.ts` with `axios.create()`
  - [ ] Configure `baseURL` from `ENV.API_BASE_URL` (fallback: `http://localhost:8080/openmrs/ws/rest/v1`)
  - [ ] Configure `timeout: ENV.REQUEST_TIMEOUT` (fallback: `10000`)
  - [ ] Set default `Content-Type: application/json` header

- [ ] Task 2: Implement request interceptor (AC: #1)
  - [ ] Read session token from `SecureStore` using key `'sessionToken'`
  - [ ] If token exists, set `Authorization: Bearer <token>` header using `config.headers.set()`
  - [ ] Use `InternalAxiosRequestConfig` type for TypeScript correctness (Axios v1.x)
  - [ ] Handle async SecureStore read correctly (interceptor must be async)

- [ ] Task 3: Implement response interceptor (AC: #1)
  - [ ] Pass-through successful responses unchanged
  - [ ] On 401 error: delete `'sessionToken'` from SecureStore, call `router.replace('/')`
  - [ ] Re-throw all errors via `Promise.reject(error)` for downstream handling
  - [ ] Use `AxiosError` type for TypeScript correctness

- [ ] Task 4: Create API layer type stubs (AC: #1)
  - [ ] Create `src/services/api/types.ts` with `SessionResponse` interface (stub for Story 2.x)
  - [ ] Create `src/services/api/auth.ts` stub (empty exports, Story 2.x will implement)
  - [ ] Create `src/services/api/patients.ts` stub (empty exports, Story 3.x will implement)

- [ ] Task 5: Write unit tests (AC: #1)
  - [ ] Test: request interceptor attaches `Authorization` header when token exists
  - [ ] Test: request interceptor skips header when no token
  - [ ] Test: response interceptor clears token and redirects on 401
  - [ ] Test: response interceptor passes through non-401 errors
  - [ ] Test: client has correct `baseURL` and `timeout` defaults
  - [ ] Place tests in `src/services/__tests__/client.test.ts`

---

## Dev Notes

### Technical Context

**Architecture Requirements:**
- **ARCH-REQ-4:** HTTP Client — Axios with interceptors for auth tokens, request/response transformation, automatic JSON handling
- **ARCH-REQ-24:** 401 error handling — auto-redirect to login, clear stored session token

**Axios Version:** `^1.6.0` (already installed in Story 1.1)  
**Expo SecureStore:** Built into Expo SDK (already available)  
**Expo Router:** `router.replace('/')` for login redirect (already installed)

### File to Create

**Primary file:** `src/services/api/client.ts`

```typescript
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { ENV } from '@/config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject session token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('sessionToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: handle 401 → redirect to login
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('sessionToken');
      router.replace('/');
    }
    return Promise.reject(error);
  }
);
```

### Environment Variable Dependency

Story 1.8 creates the full `src/config/env.ts`. For this story, use the fallback values directly or create a minimal stub:

```typescript
// src/config/env.ts (minimal stub if Story 1.8 not yet done)
export const ENV = {
  API_BASE_URL: 'http://localhost:8080/openmrs/ws/rest/v1',
  REQUEST_TIMEOUT: 10000,
  SESSION_TIMEOUT: 1800000,
  CACHE_DURATION: 300000,
};
```

> **NOTE:** If `src/config/env.ts` already exists from Story 1.8, use it as-is. Do NOT create a duplicate.

### API Layer Stubs (Minimal — Full Implementation in Later Stories)

```typescript
// src/services/api/types.ts
export interface SessionResponse {
  sessionId: string;
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
  };
}

// src/services/api/auth.ts
// Full implementation in Story 2.x (Authentication)
export {};

// src/services/api/patients.ts
// Full implementation in Story 3.x (My Patients Dashboard)
export {};
```

### Axios v1.x TypeScript Notes (Critical)

- Use `InternalAxiosRequestConfig` (not `AxiosRequestConfig`) for request interceptors — this is the correct type in Axios v1.x
- Use `config.headers.set('Authorization', ...)` — not `config.headers['Authorization'] = ...` (deprecated in v1.x)
- The request interceptor **must be async** because `SecureStore.getItemAsync` returns a Promise
- `AxiosError` is the correct type for error parameters in both interceptors

### SecureStore Key Convention

The session token key is `'sessionToken'` — this is the canonical key used across the entire app:
- Written by: `auth.ts` login function (Story 2.x)
- Read by: request interceptor in `client.ts` (this story)
- Deleted by: response interceptor on 401 (this story) + logout function (Story 2.x)

### Testing Approach

Mock both `expo-secure-store` and `expo-router` in tests:

```typescript
// src/services/__tests__/client.test.ts
import { apiClient } from '../api/client';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

describe('apiClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('attaches Authorization header when token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
    const config = await apiClient.interceptors.request.handlers[0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('skips Authorization header when no token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const config = await apiClient.interceptors.request.handlers[0].fulfilled({
      headers: new axios.AxiosHeaders(),
    } as any);
    expect(config.headers.get('Authorization')).toBeNull();
  });

  it('clears token and redirects on 401', async () => {
    const error = { response: { status: 401 } };
    await expect(
      apiClient.interceptors.response.handlers[0].rejected(error)
    ).rejects.toEqual(error);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessionToken');
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('passes through non-401 errors without redirect', async () => {
    const error = { response: { status: 500 } };
    await expect(
      apiClient.interceptors.response.handlers[0].rejected(error)
    ).rejects.toEqual(error);
    expect(router.replace).not.toHaveBeenCalled();
  });
});
```

> **NOTE:** The interceptor handler access pattern (`interceptors.request.handlers[0].fulfilled`) is for testing only. In production code, interceptors are invoked automatically by Axios.

### Architecture Compliance

**ARCH-REQ-4:** HTTP Client — Axios with interceptors  
- ✅ `axios.create()` with `baseURL` and `timeout`
- ✅ Request interceptor for auth token injection
- ✅ Response interceptor for 401 handling
- ✅ Centralized — all API calls use `apiClient`, never raw `axios`

**ARCH-REQ-24:** 401 error handling  
- ✅ Clears `sessionToken` from SecureStore on 401
- ✅ Redirects to login via `router.replace('/')`
- ✅ Error still re-thrown for downstream SWR error handling

**Project Structure Compliance:**
```
src/services/api/
├── client.ts      ← This story (Axios instance + interceptors)
├── auth.ts        ← Stub (Story 2.x implements)
├── patients.ts    ← Stub (Story 3.x implements)
└── types.ts       ← Minimal stub (SessionResponse interface)
```

**Import Alias:** Always import as `import { apiClient } from '@/services/api/client'`

### Testing Requirements

**Coverage Target:** 90%+ for API layer (per ARCH-REQ-8)

**Test File:** `src/services/__tests__/client.test.ts`

**Required Test Cases:**
1. ✅ Request interceptor attaches `Authorization: Bearer <token>` when token exists
2. ✅ Request interceptor does NOT attach header when token is null
3. ✅ Response interceptor calls `SecureStore.deleteItemAsync('sessionToken')` on 401
4. ✅ Response interceptor calls `router.replace('/')` on 401
5. ✅ Response interceptor re-throws 401 error (does not swallow it)
6. ✅ Response interceptor does NOT redirect on non-401 errors (e.g., 500)
7. ✅ `apiClient.defaults.baseURL` matches `ENV.API_BASE_URL`
8. ✅ `apiClient.defaults.timeout` matches `ENV.REQUEST_TIMEOUT`

**Manual Verification:**
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] All tests pass: `yarn test`
- [ ] No ESLint errors: `yarn lint`

### Previous Story Intelligence

**From Story 1.1 (Initialize Expo Project):**
- Axios `^1.6.0` is already installed — do NOT reinstall or change version
- `expo-secure-store` is available as part of Expo SDK — no additional install needed
- `expo-router` is installed — `router` can be imported from `'expo-router'`
- `babel-preset-expo` must be in `devDependencies` (already done in Story 1.1)
- Import aliases (`@/services`, `@/config`) are configured in `tsconfig.json` and `babel.config.js`
- `src/services/api/` directory already exists (created as empty in Story 1.1)

**From Story 1.1 Dev Agent Record (Deferred Item):**
> "Empty API service directory with no base client — axios and swr are installed but have no client setup. First network call will have no timeout, no auth header, and no error normalization."  
> **This story resolves that deferred item.**

### References

**Source Documents:**
- [Epic 1: Project Foundation & Core Infrastructure](_bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md) — Story 1.5
- [Architecture: Core Architectural Decisions](_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md) — API Integration & Communication, ARCH-REQ-4, ARCH-REQ-24
- [Architecture: Implementation Patterns & Consistency Rules](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md) — API Service patterns, Communication Patterns

**External Documentation:**
- [Axios v1.x Interceptors](https://axios-http.com/docs/interceptors)
- [Axios TypeScript Guide](https://axios-http.com/docs/typescript) — `InternalAxiosRequestConfig`, `AxiosResponse`, `AxiosError`
- [Expo SecureStore API](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Router Navigation](https://docs.expo.dev/router/navigating-pages/)

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Use `InternalAxiosRequestConfig` for request interceptors**
   - Axios v1.x changed the type — `AxiosRequestConfig` is for `axios.create()` options only
   - Request interceptor handlers receive `InternalAxiosRequestConfig`

2. **Request interceptor MUST be async**
   - `SecureStore.getItemAsync()` is async — the interceptor function must be `async`
   - Axios supports async request interceptors natively

3. **Use `config.headers.set()` not bracket notation**
   - `config.headers['Authorization'] = ...` is deprecated in Axios v1.x
   - Use `config.headers.set('Authorization', `Bearer ${token}`)` 

4. **Always re-throw errors in response interceptor**
   - After handling 401, still call `return Promise.reject(error)`
   - SWR and other callers need the error to update their error state

5. **`apiClient` is the ONLY Axios instance**
   - Never import raw `axios` for API calls in services or components
   - All API calls go through `apiClient` from `@/services/api/client`

6. **SecureStore key must be `'sessionToken'`**
   - This key is the contract between auth (Story 2.x) and the interceptor
   - Do NOT use a different key name

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** use `AxiosRequestConfig` for the request interceptor parameter type
2. **DO NOT** make the request interceptor synchronous (SecureStore is async)
3. **DO NOT** swallow the 401 error — always re-throw after redirect
4. **DO NOT** hardcode the base URL — use `ENV.API_BASE_URL`
5. **DO NOT** create a second Axios instance — one `apiClient` for the entire app
6. **DO NOT** implement auth service logic here — `auth.ts` is a stub for Story 2.x
7. **DO NOT** add SWR configuration here — SWR hooks are in `src/hooks/` (later stories)

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ `src/services/api/client.ts` exports `apiClient` with correct configuration
2. ✅ Request interceptor reads token from SecureStore and sets Authorization header
3. ✅ Response interceptor clears token and redirects to `/` on 401
4. ✅ `src/services/api/types.ts` has `SessionResponse` interface
5. ✅ `src/services/api/auth.ts` and `patients.ts` stubs exist
6. ✅ All 8 unit tests pass in `src/services/__tests__/client.test.ts`
7. ✅ TypeScript compilation passes with no errors (`npx tsc --noEmit`)
8. ✅ No ESLint errors (`yarn lint`)
9. ✅ Code committed: `"feat: configure Axios API client with auth interceptors (Story 1.5)"`

---

**Story Created:** 2026-04-23  
**Ready for Implementation:** Yes  
**Blocking Stories:** Story 2.x (Authentication), Story 3.x (Patients), all API-dependent features  
**Blocked By:** Story 1.1 (Expo init — ✅ done), Story 1.4 (Theme — for ENV config pattern)  
**Estimated Effort:** 1-2 hours
