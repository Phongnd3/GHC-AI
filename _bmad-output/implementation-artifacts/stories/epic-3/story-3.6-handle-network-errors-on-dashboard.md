# Story 3.6: Handle Network Errors on Dashboard

**Status:** done  
**Epic:** 3 - My Patients Dashboard  
**Story ID:** 3.6  
**Priority:** P1 - Critical UX for offline/poor-connectivity scenarios

---

## Story

As a doctor,  
I want to see a helpful error message when the patient list fails to load,  
So that I understand what went wrong and can retry.

---

## Acceptance Criteria

**AC1.**  
**Given** I am viewing the My Patients dashboard  
**When** The patient list fails to load due to network error  
**Then** I see the message "Unable to load patients. Tap to retry."  
**And** A retry button is displayed

**AC2.**  
**Given** I see the network error message  
**When** I tap the retry button  
**Then** The app attempts to load the patient list again

**AC3.**  
**Given** The patient list fails to load due to a server error (not network)  
**When** I view the error message  
**Then** I see "Unable to load patients. Please try again later."  
**And** A retry button is displayed

---

## Tasks / Subtasks

- [ ] Task 1: Add error state UI to dashboard screen (AC: #1, #3)
  - [ ] In `src/app/(auth)/dashboard.tsx`: check if `error` from `usePatients()` is truthy
  - [ ] When error exists, render an `ErrorState` component (create if not exists) instead of patient list
  - [ ] `ErrorState` should display error icon, error message, and retry button
  - [ ] Use `mapErrorToUserMessage` from `@/utils/errorHandler` to get user-friendly message
  - [ ] For `ErrorType.NETWORK_ERROR`: "Unable to load patients. Tap to retry."
  - [ ] For other errors: "Unable to load patients. Please try again later."

- [ ] Task 2: Implement retry functionality (AC: #2)
  - [ ] Wire retry button to call `mutate()` from `usePatients()` hook
  - [ ] `mutate()` triggers SWR to refetch data
  - [ ] Show loading state during retry attempt
  - [ ] Clear error state if retry succeeds

- [ ] Task 3: Handle error state during pull-to-refresh (AC: #2)
  - [ ] Verify that pull-to-refresh gesture works even when error state is displayed
  - [ ] Ensure error UI is replaced by loading indicator during refresh
  - [ ] If refresh succeeds, show patient list; if fails, show error again

- [ ] Task 4: Add tests for error handling (AC: #1, #2, #3)
  - [ ] In `src/app/(auth)/__tests__/dashboard.test.tsx`: add test for network error display
  - [ ] Test that error message appears when `usePatients` returns error
  - [ ] Test that retry button calls `mutate()` when tapped
  - [ ] Test that server error shows different message than network error
  - [ ] Mock `mapErrorToUserMessage` to return predictable error types

---

## Dev Notes

### Technical Context

**Error Flow:**
1. User opens dashboard or pulls to refresh
2. `usePatients()` hook calls `getActiveVisits()` via SWR
3. API request fails (network timeout, server error, etc.)
4. SWR returns `error` object in hook result
5. Dashboard screen detects `error`, renders `ErrorState` component
6. User taps retry → calls `mutate()` → SWR refetches data

**Error Type Differentiation:**

| Scenario | `error.response` | `ErrorType` returned | Display Message |
|---|---|---|---|
| No internet / timeout | `undefined` | `NETWORK_ERROR` | "Unable to load patients. Tap to retry." |
| Server error (500) | `{ status: 500 }` | `SERVER_ERROR` | "Unable to load patients. Please try again later." |
| Auth error (401) | `{ status: 401 }` | `AUTH_ERROR` | "Session expired. Please log in again." |

**SWR Error Handling:**

SWR automatically provides error state when fetcher throws:

```typescript
const { data, error, isLoading, mutate } = useSWR(
  providerUuid ? '/visit?includeInactive=false&v=full' : null,
  () => getActiveVisits(),
  { dedupingInterval: 300000, revalidateOnFocus: true }
);

// error will be the thrown error object from getActiveVisits()
```

**Retry with SWR:**

```typescript
// In dashboard.tsx
const handleRetry = () => {
  mutate(); // Triggers refetch
};

// SWR will:
// 1. Set isValidating = true (show loading)
// 2. Call getActiveVisits() again
// 3. Either populate data (success) or error (failure)
```

---

### Component Structure: ErrorState

Create a reusable `ErrorState` component for displaying errors with retry:

```typescript
// src/components/ErrorState.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseColors, Spacing } from '@/theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  isRetrying = false 
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="alert-circle-outline" 
        size={64} 
        color={BaseColors.error} 
      />
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
      <Button 
        mode="contained" 
        onPress={onRetry}
        loading={isRetrying}
        disabled={isRetrying}
        style={styles.button}
      >
        Retry
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  message: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    color: BaseColors.textSecondary,
  },
  button: {
    minWidth: 120,
  },
});
```

**Usage in dashboard:**

```typescript
// src/app/(auth)/dashboard.tsx

import { ErrorState } from '@/components/ErrorState';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';

const DashboardScreen = () => {
  const { patients, isLoading, error, mutate } = usePatients(providerUuid);

  if (error) {
    const mapped = mapErrorToUserMessage(error);
    const errorMessage = mapped.type === ErrorType.NETWORK_ERROR
      ? 'Unable to load patients. Tap to retry.'
      : 'Unable to load patients. Please try again later.';

    return (
      <ErrorState 
        message={errorMessage} 
        onRetry={() => mutate()} 
        isRetrying={isLoading}
      />
    );
  }

  // ... rest of dashboard rendering
};
```

---

### UX Specification Compliance

From `screen-wireframes-user-flows.md` (UX-DR19):

> **Error Handling:** All API failures show inline error messages with retry options. Network errors are distinguished from server errors.

**Error State Layout:**

```
┌─────────────────────────────────────┐
│  My Patients              [logout]  │
├─────────────────────────────────────┤
│                                     │
│           ⚠️                        │
│                                     │
│   Unable to load patients.          │
│   Tap to retry.                     │
│                                     │
│        [ Retry ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Styling:**
- Icon: 64dp, `BaseColors.error` (red)
- Message: Body Large (16sp), `BaseColors.textSecondary`, center-aligned
- Button: Contained, primary color, min-width 120dp
- Spacing: 16dp between elements

---

### Edge Cases

| Scenario | Behavior | Rationale |
|---|---|---|
| Error on initial load | Show error state immediately | User needs to know why no patients appear |
| Error after successful load | Show error state, clear patient list | Prevents showing stale data with error |
| Retry succeeds | Replace error state with patient list | Normal flow resumes |
| Retry fails again | Keep error state, update message if different | User can retry again |
| Pull-to-refresh during error | Trigger retry via mutate() | Consistent retry mechanism |
| Session expired (401) | Show "Session expired" message + retry | Retry will redirect to login if still expired |

---

### Architecture Compliance

| Requirement | Source | Implementation |
|---|---|---|
| Use centralized error handler | `core-architectural-decisions.md` | `mapErrorToUserMessage` from Story 1.6 |
| SWR for data fetching | `core-architectural-decisions.md` | `usePatients` hook uses SWR |
| Reusable error UI component | `implementation-patterns-consistency-rules.md` | `ErrorState` component |
| No inline styles | `implementation-patterns-consistency-rules.md` | Use `StyleSheet.create` |
| Material icons for error state | `theme-system.md` | `MaterialCommunityIcons` |

---

### Files To Create (NEW)

| File | Purpose |
|---|---|
| `src/components/ErrorState.tsx` | Reusable error display component with retry button |
| `src/components/__tests__/ErrorState.test.tsx` | Unit tests for ErrorState component |

---

### Files To Update (EXISTING)

| File | Change | Preserve |
|---|---|---|
| `src/app/(auth)/dashboard.tsx` | Add error state rendering before patient list | All existing dashboard logic, logout, timestamp |
| `src/app/(auth)/__tests__/dashboard.test.tsx` | Add tests for error display and retry | All existing dashboard tests |

---

### Testing Requirements

**Unit — `src/components/__tests__/ErrorState.test.tsx`**
- Renders error icon, message, and retry button
- Calls `onRetry` when retry button is tapped
- Shows loading state on retry button when `isRetrying` is true
- Disables retry button when `isRetrying` is true

**Integration — `src/app/(auth)/__tests__/dashboard.test.tsx`**
- Shows error state when `usePatients` returns error (AC1)
- Shows network error message for network errors (AC1)
- Shows generic error message for server errors (AC3)
- Calls `mutate()` when retry button is tapped (AC2)
- Hides error state when retry succeeds (AC2)
- Shows error state again if retry fails

**Test Pattern:**

```typescript
// Mock usePatients to return error
jest.mock('@/hooks/usePatients', () => ({
  usePatients: jest.fn(() => ({
    patients: [],
    isLoading: false,
    error: new Error('Network error'),
    mutate: jest.fn(),
    lastUpdatedAt: null,
  })),
}));

// Test error display
it('shows error state when patient list fails to load', () => {
  render(<DashboardScreen />);
  expect(screen.getByText(/Unable to load patients/i)).toBeOnTheScreen();
  expect(screen.getByText('Retry')).toBeOnTheScreen();
});

// Test retry
it('calls mutate when retry button is tapped', () => {
  const mockMutate = jest.fn();
  (usePatients as jest.Mock).mockReturnValue({
    patients: [],
    isLoading: false,
    error: new Error('Network error'),
    mutate: mockMutate,
    lastUpdatedAt: null,
  });

  render(<DashboardScreen />);
  fireEvent.press(screen.getByText('Retry'));
  expect(mockMutate).toHaveBeenCalledTimes(1);
});
```

---

### Previous Story Intelligence

From Story 3.1:
- `usePatients` hook already exists in `src/hooks/usePatients.ts`
- Hook returns `{ patients, isLoading, error, mutate, lastUpdatedAt }`
- Dashboard screen at `src/app/(auth)/dashboard.tsx` already consumes `usePatients()`
- SWR is configured with `dedupingInterval: 300000` and `revalidateOnFocus: true`

From Story 1.6:
- `mapErrorToUserMessage` utility exists in `src/utils/errorHandler.ts`
- Returns `{ type: ErrorType, message: string }`
- Handles `NETWORK_ERROR`, `AUTH_ERROR`, `SERVER_ERROR`, `UNKNOWN_ERROR`

From Story 2.3:
- Network error handling pattern established for login screen
- Retry button pattern: outlined button, calls original function again
- Error type differentiation: network vs server vs auth

**This means:**
- Error handling infrastructure is already in place
- Need to create `ErrorState` component (reusable)
- Need to add error state rendering to dashboard
- Need to wire retry button to `mutate()`

---

### Implementation Checklist

**Phase 1: Create ErrorState Component**
- [ ] Create `src/components/ErrorState.tsx` with props: `message`, `onRetry`, `isRetrying`
- [ ] Style with Material icon, centered layout, primary button
- [ ] Create `src/components/__tests__/ErrorState.test.tsx` with 4 tests

**Phase 2: Integrate Error State in Dashboard**
- [ ] Import `ErrorState` and `mapErrorToUserMessage` in dashboard
- [ ] Add error check before patient list rendering
- [ ] Map error to user-friendly message based on error type
- [ ] Wire retry button to `mutate()` from `usePatients`
- [ ] Pass `isLoading` as `isRetrying` prop to show loading state

**Phase 3: Testing**
- [ ] Add 6 integration tests to `dashboard.test.tsx`
- [ ] Mock `usePatients` to return error states
- [ ] Verify error messages for different error types
- [ ] Verify retry button calls `mutate()`
- [ ] Verify error state clears on successful retry

**Phase 4: Manual Testing**
- [ ] Test with airplane mode (network error)
- [ ] Test with invalid API endpoint (server error)
- [ ] Test retry after restoring connection
- [ ] Test pull-to-refresh during error state
- [ ] Test session expiry (401 error)

---

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Kiro CLI)

### Debug Log References

- All tests passing (34 tests total)
- TypeScript compilation successful
- No linting errors

### Completion Notes List

1. **Created ErrorState Component** (`src/components/ErrorState.tsx`)
   - Reusable error display component with red alert icon
   - Accepts `message`, `onRetry`, and `isRetrying` props
   - Shows loading state on retry button when retrying
   - Uses `ClinicalColors.error` for icon color (red)
   - Follows project styling patterns with `StyleSheet.create`

2. **Updated Dashboard Screen** (`src/app/(auth)/dashboard.tsx`)
   - Added error type differentiation using `mapErrorToUserMessage`
   - Network errors show: "Unable to load patients. Tap to retry."
   - Server/other errors show: "Unable to load patients. Please try again later."
   - Retry button wired to `mutate()` from `usePatients` hook
   - Loading state passed to ErrorState via `isRefreshing` prop

3. **Created ErrorState Tests** (`src/components/__tests__/ErrorState.test.tsx`)
   - 4 unit tests covering all component functionality
   - Tests icon, message, and retry button rendering
   - Tests retry callback invocation
   - Tests loading and disabled states

4. **Added Dashboard Error Tests** (`src/app/(auth)/__tests__/dashboard.test.tsx`)
   - 6 integration tests for error handling scenarios
   - Tests network error message display (AC1)
   - Tests server error message display (AC3)
   - Tests retry button functionality (AC2)
   - Tests loading state during retry
   - Tests error state clearing on successful retry
   - Tests error state persistence on failed retry

### File List

**Created:**
- `ghc-ai-doctor-app/src/components/ErrorState.tsx` - Error display component
- `ghc-ai-doctor-app/src/components/__tests__/ErrorState.test.tsx` - Unit tests

**Modified:**
- `ghc-ai-doctor-app/src/app/(auth)/dashboard.tsx` - Added error handling with type differentiation
- `ghc-ai-doctor-app/src/app/(auth)/__tests__/dashboard.test.tsx` - Added 6 error handling tests

**Test Results:**
- ✅ All 4 ErrorState unit tests passing
- ✅ All 30 dashboard tests passing (including 6 new error tests)
- ✅ TypeScript compilation successful
- ✅ All acceptance criteria met
