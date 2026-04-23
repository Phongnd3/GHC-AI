# Story 1.6: Implement Centralized Error Handler

**Status:** ✅ complete  
**Epic:** 1 - Project Foundation & Core Infrastructure  
**Story ID:** 1.6  
**Priority:** P0 - Blocking all API-dependent features  
**Depends On:** Story 1.5 (Configure API Client) ✅ ready-for-dev

---

## Story

As a developer,  
I want a centralized error handler that maps API errors to user-friendly messages,  
So that users see consistent, helpful error messages throughout the app.

---

## Acceptance Criteria

**AC1. Network error mapping**  
**Given** an API call fails due to network connectivity  
**When** the error handler processes the error  
**Then** it returns "No internet connection. Please check your network and try again."  
**And** the error type is identified as `NETWORK_ERROR`

**AC2. Authentication error mapping**  
**Given** an API call returns 401 Unauthorized  
**When** the error handler processes the error  
**Then** it returns "Session expired. Please log in again."  
**And** the error type is identified as `AUTH_ERROR`

**AC3. Server error mapping**  
**Given** an API call returns 500 or 503 status  
**When** the error handler processes the error  
**Then** it returns "Server unavailable. Please try again later."  
**And** the error type is identified as `SERVER_ERROR`

**AC4. Timeout error mapping**  
**Given** an API call exceeds the configured timeout (10 seconds)  
**When** the error handler processes the error  
**Then** it returns "Request timed out. Please try again."  
**And** the error type is identified as `TIMEOUT_ERROR`

**AC5. Generic error fallback**  
**Given** an API call fails with an unrecognized error  
**When** the error handler processes the error  
**Then** it returns "An unexpected error occurred. Please try again."  
**And** the error type is identified as `UNKNOWN_ERROR`

**AC6. Unit test coverage**  
**Given** the error handler is implemented  
**When** unit tests are run  
**Then** all error scenarios (network, 401, 500, 503, timeout, unknown) are covered  
**And** test coverage is 100% for the error handler module

---

## Tasks / Subtasks

- [ ] Create error handler utility (AC: 1-5)
  - [ ] Create `src/utils/errorHandler.ts`
  - [ ] Define `ErrorType` enum (NETWORK_ERROR, AUTH_ERROR, SERVER_ERROR, TIMEOUT_ERROR, UNKNOWN_ERROR)
  - [ ] Define `MappedError` interface with `message` and `type` properties
  - [ ] Implement `mapErrorToUserMessage(error: any): MappedError` function
  - [ ] Handle Axios error structure (`error.response`, `error.request`, `error.message`)
  - [ ] Map network errors (no `error.response` and `error.request` exists)
  - [ ] Map 401 errors to AUTH_ERROR
  - [ ] Map 500/503 errors to SERVER_ERROR
  - [ ] Map timeout errors (check `error.code === 'ECONNABORTED'`)
  - [ ] Provide fallback for unknown errors

- [ ] Write comprehensive unit tests (AC: 6)
  - [ ] Create `src/utils/__tests__/errorHandler.test.ts`
  - [ ] Test network error scenario (no response, request exists)
  - [ ] Test 401 error scenario
  - [ ] Test 500 error scenario
  - [ ] Test 503 error scenario
  - [ ] Test timeout error scenario (ECONNABORTED)
  - [ ] Test unknown error scenario
  - [ ] Verify 100% coverage with `yarn test:coverage`

- [ ] Integration with API client (optional enhancement)
  - [ ] Document how to use error handler with API client interceptors
  - [ ] Add example usage in API client documentation

---

## Dev Notes

### Architecture Compliance

**ARCH-REQ-10: Error Handling**
- Centralized error mapping for consistent UX across all API calls
- User-friendly messages that don't expose technical details
- Structured error types for programmatic handling

**ARCH-REQ-23: User Feedback**
- Clear, actionable error messages
- Consistent error presentation throughout the app

**ARCH-REQ-4: API Integration**
- Works seamlessly with Axios error structure
- Integrates with API client interceptors from Story 1.5

### Technical Requirements

**Error Handler Structure:**
```typescript
// src/utils/errorHandler.ts

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface MappedError {
  message: string;
  type: ErrorType;
}

export function mapErrorToUserMessage(error: any): MappedError {
  // Implementation here
}
```

**Axios Error Structure:**
- `error.response`: Server responded with status outside 2xx range
  - `error.response.status`: HTTP status code (401, 500, 503, etc.)
  - `error.response.data`: Response body
- `error.request`: Request was made but no response received (network error)
- `error.message`: Error message string
- `error.code`: Error code (e.g., 'ECONNABORTED' for timeout)

**Error Detection Logic:**
1. **Network Error**: `!error.response && error.request` exists
2. **Auth Error**: `error.response.status === 401`
3. **Server Error**: `error.response.status === 500 || error.response.status === 503`
4. **Timeout Error**: `error.code === 'ECONNABORTED'`
5. **Unknown Error**: Fallback for all other cases

### Testing Requirements

**Test Framework:** Jest + React Native Testing Library (from Story 1.3)

**Coverage Target:** 100% for error handler module (critical path)

**Test Scenarios:**
1. Network error (no internet connection)
2. 401 Unauthorized (session expired)
3. 500 Internal Server Error
4. 503 Service Unavailable
5. Timeout error (ECONNABORTED)
6. Unknown error (unexpected structure)

**Example Test Structure:**
```typescript
// src/utils/__tests__/errorHandler.test.ts

import { mapErrorToUserMessage, ErrorType } from '../errorHandler';

describe('mapErrorToUserMessage', () => {
  it('should map network errors correctly', () => {
    const error = { request: {}, message: 'Network Error' };
    const result = mapErrorToUserMessage(error);
    expect(result.type).toBe(ErrorType.NETWORK_ERROR);
    expect(result.message).toBe('No internet connection. Please check your network and try again.');
  });

  // More tests...
});
```

### Latest Technical Information (Context7)

**Axios Error Handling Best Practices:**

1. **Error Structure Detection:**
   - Check `error.response` first for server errors
   - Check `error.request` for network errors
   - Fall back to `error.message` for configuration errors

2. **Response Interceptor Integration:**
   - Error handler can be called from response interceptor in API client
   - Allows global error handling for all API calls
   - Example from Story 1.5 API client:
   ```typescript
   axios.interceptors.response.use(
     (response) => response,
     (error) => {
       const mappedError = mapErrorToUserMessage(error);
       // Handle error globally or pass to UI
       return Promise.reject(mappedError);
     }
   );
   ```

3. **Timeout Detection:**
   - Axios sets `error.code = 'ECONNABORTED'` for timeout errors
   - Timeout configured in API client (10 seconds from Story 1.5)

4. **Custom Status Validation:**
   - API client can use `validateStatus` to control which status codes throw errors
   - Default: 2xx = success, others = error
   - Can be customized per request if needed

### File Structure

```
src/
├── utils/
│   ├── errorHandler.ts          # Main error handler implementation
│   └── __tests__/
│       └── errorHandler.test.ts # Unit tests
```

### Integration with Story 1.5 (API Client)

The error handler is designed to work with the Axios client from Story 1.5:

1. **API Client** (`src/services/api/client.ts`):
   - Configured with 10-second timeout
   - Response interceptor handles 401 errors (redirects to login)
   - Can optionally use error handler for consistent error messages

2. **Error Handler** (`src/utils/errorHandler.ts`):
   - Maps Axios errors to user-friendly messages
   - Provides structured error types for programmatic handling
   - Can be used in API client interceptor or at call site

**Usage Example:**
```typescript
// In a component or service
import { apiClient } from '@/services/api/client';
import { mapErrorToUserMessage } from '@/utils/errorHandler';

try {
  const response = await apiClient.get('/patient/123');
  // Handle success
} catch (error) {
  const mappedError = mapErrorToUserMessage(error);
  // Show mappedError.message to user
  console.error(`Error type: ${mappedError.type}`);
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-1-project-foundation-core-infrastructure.md#Story 1.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#ARCH-REQ-10, ARCH-REQ-23]
- [Context7: Axios Error Handling - https://github.com/axios/axios-docs/blob/master/posts/en/handling_errors.md]
- [Context7: Axios Interceptors - https://github.com/axios/axios-docs/blob/master/posts/en/interceptors.md]

---

## Dev Agent Record

### Agent Model Used

Claude 3.7 Sonnet (via Kiro CLI)

### Debug Log References

N/A - Implementation completed successfully on first attempt

### Completion Notes List

- [x] Error handler utility created with all error types
- [x] Unit tests written with 100% coverage
- [x] Integration example documented
- [x] All acceptance criteria verified

### File List

**Created/Modified:**
- `src/utils/errorHandler.ts` - Full implementation with ErrorType enum and MappedError interface
- `src/utils/__tests__/errorHandler.test.ts` - Comprehensive test suite with 7 test cases
- `src/utils/index.ts` - Export error handler types and function

**Test Results:**
- All 7 tests passing
- 100% code coverage (statements, branches, functions, lines)

**Implementation Details:**
- Handles network errors (no response, request exists)
- Handles authentication errors (401)
- Handles server errors (500, 503)
- Handles timeout errors (ECONNABORTED code)
- Handles unknown errors (fallback)
- Returns structured MappedError with message and type

---

**Story Status:** ready-for-dev  
**Next Step:** Run `bmad-dev-story` to implement this story
