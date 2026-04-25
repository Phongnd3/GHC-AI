# Story 2.5: Prevent Screenshots on Clinical Screens

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.5  
**Priority:** P0 - Critical security requirement (NFR10)

---

## Story

As a hospital administrator,  
I want screenshots to be blocked on all screens after login,  
So that patient data cannot be captured and shared inappropriately.

---

## Acceptance Criteria

**AC1.**  
**Given** A doctor is logged in and viewing any screen  
**When** The doctor attempts to take a screenshot  
**Then** The screenshot is blocked (screen appears black in the capture)  
**And** This applies to all screens except the login screen  
**And** Screenshot prevention is active on Android devices

---

## Tasks / Subtasks

- [ ] Task 1: Enable screenshot prevention on all authenticated screens (AC: #1)
  - [ ] Import `usePreventScreenCapture` from `expo-screen-capture` in `src/app/(auth)/_layout.tsx`
  - [ ] Call `usePreventScreenCapture()` at the top of the `AuthLayout` component
  - [ ] Verify the hook activates on mount and deactivates on unmount automatically

- [ ] Task 2: Confirm login screen is NOT protected (AC: #1)
  - [ ] Confirm `src/app/index.tsx` does NOT call `usePreventScreenCapture()`
  - [ ] Confirm `src/app/_layout.tsx` (root layout) does NOT call `usePreventScreenCapture()`
  - [ ] Document the intentional exclusion in a code comment in `(auth)/_layout.tsx`

---

## Dev Notes

### Technical Context

**`expo-screen-capture` is already installed** — confirmed in `package.json` (`"expo-screen-capture": "~8.0.9"`). No installation or configuration steps needed.

**How `usePreventScreenCapture` works:**
- Calls the native Android `FLAG_SECURE` window flag on mount
- Removes the flag on unmount (when the user navigates away from authenticated routes)
- On Android, any screenshot attempt while the flag is active results in a black/blank capture
- The hook is idempotent — safe to call once at the layout level; it covers all child screens

**Why at the layout level, not per-screen:**
- `src/app/(auth)/_layout.tsx` is the root of all authenticated routes
- Placing the hook here means every screen inside `(auth)/` is automatically protected
- No need to add the hook to each individual screen (dashboard, clinical summary, etc.)
- The login screen (`src/app/index.tsx`) is outside `(auth)/` so it is naturally excluded

**Updated `(auth)/_layout.tsx`:**

```typescript
import { useEffect, useCallback } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import { Stack, router, useNavigationContainerRef } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, resetInactivityTimer } = useAuth();

  // Prevent screenshots on all authenticated screens (Story 2.5)
  // The login screen (src/app/index.tsx) is intentionally excluded — it contains no patient data
  usePreventScreenCapture();

  const handleUserInteraction = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    const unsubscribe = navigationRef?.addListener('state', () => {
      resetInactivityTimer();
    });
    return unsubscribe;
  }, [navigationRef, resetInactivityTimer]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={handleUserInteraction}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

### Architecture Compliance

**ARCH-REQ-1: Use Installed Library**
- ✅ `expo-screen-capture` is already in `package.json` — no new dependencies
- ✅ Use `usePreventScreenCapture` hook (not the imperative `preventScreenCaptureAsync` API)
- ✅ Hook-based approach integrates cleanly with the existing functional component pattern

**ARCH-REQ-2: Scope — Authenticated Routes Only**
- ✅ Hook placed in `src/app/(auth)/_layout.tsx` — covers all child routes automatically
- ✅ Login screen (`src/app/index.tsx`) is outside `(auth)/` — naturally excluded
- ✅ Root layout (`src/app/_layout.tsx`) does NOT call the hook

**ARCH-REQ-3: Android Target**
- ✅ `expo-screen-capture` uses `FLAG_SECURE` on Android — the target platform for this app
- ✅ No iOS-specific configuration needed (app is Android-only per project context)

**ARCH-REQ-4: No New Files**
- ✅ This story modifies only `src/app/(auth)/_layout.tsx` — one file change
- ✅ No new components, services, or contexts required

### Testing Requirements

**Unit / Component Test (`src/app/(auth)/__tests__/_layout.test.tsx`):**

```typescript
import { render } from '@testing-library/react-native';
import AuthLayout from '../_layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePreventScreenCapture } from 'expo-screen-capture';

jest.mock('@/contexts/AuthContext');
jest.mock('expo-screen-capture');
jest.mock('expo-router');

describe('AuthLayout - screenshot prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      resetInactivityTimer: jest.fn(),
    });
  });

  it('calls usePreventScreenCapture when authenticated', () => {
    render(<AuthLayout />);

    expect(usePreventScreenCapture).toHaveBeenCalledTimes(1);
  });

  it('calls usePreventScreenCapture even when not authenticated (hook always runs)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      resetInactivityTimer: jest.fn(),
    });

    render(<AuthLayout />);

    // Hook must always be called (React rules of hooks — no conditional hook calls)
    expect(usePreventScreenCapture).toHaveBeenCalledTimes(1);
  });
});
```

**Verify login screen is NOT protected (`src/app/__tests__/index.test.tsx` addition):**

```typescript
import { usePreventScreenCapture } from 'expo-screen-capture';

jest.mock('expo-screen-capture');

it('does NOT call usePreventScreenCapture on the login screen', () => {
  render(<LoginScreen />);

  expect(usePreventScreenCapture).not.toHaveBeenCalled();
});
```

**Manual Test Checklist:**
- [ ] Log in → navigate to dashboard → attempt screenshot → capture is black/blank
- [ ] Log in → navigate to a patient clinical summary screen → attempt screenshot → capture is black/blank
- [ ] On the login screen (before logging in) → attempt screenshot → capture succeeds normally
- [ ] Log out → attempt screenshot on login screen → capture succeeds normally
- [ ] Verify on a physical Android device (emulator may not enforce `FLAG_SECURE` reliably)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**External Documentation:**
- [Expo Screen Capture — usePreventScreenCapture](https://docs.expo.dev/versions/latest/sdk/screen-capture/)

**Previous Story Learnings:**
- Story 2.1: `(auth)/_layout.tsx` is the root layout for all authenticated routes — the correct place for app-wide authenticated behaviour
- Story 2.4: `(auth)/_layout.tsx` already wraps children in `TouchableWithoutFeedback` for inactivity tracking — `usePreventScreenCapture()` is simply added alongside it

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Place `usePreventScreenCapture()` in `(auth)/_layout.tsx` only** — do NOT add it to individual screens; the layout covers all children automatically

2. **Do NOT add it to the root layout or login screen** — the login screen must remain screenshottable (it contains no patient data)

3. **Always call the hook unconditionally** — React rules of hooks forbid conditional hook calls; `usePreventScreenCapture()` must be called at the top level of the component, not inside an `if` block

4. **Use the hook API, not the imperative API** — `usePreventScreenCapture()` (hook) is preferred over `preventScreenCaptureAsync()` / `allowScreenCaptureAsync()` (imperative) because it handles cleanup automatically on unmount

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** call `usePreventScreenCapture()` inside a `useEffect` — it is a hook, not an async function; call it directly in the component body
2. **DO NOT** add it to `src/app/_layout.tsx` (root layout) — this would block screenshots on the login screen too
3. **DO NOT** add it to each individual screen — the layout-level placement is sufficient and avoids duplication
4. **DO NOT** implement session timeout logic here — that is Story 2.4 (already done)
5. **DO NOT** implement logout confirmation here — that is Story 2.6

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ `usePreventScreenCapture()` is called in `src/app/(auth)/_layout.tsx`
2. ✅ All authenticated screens (dashboard, clinical summary, etc.) produce a black capture on screenshot
3. ✅ The login screen is NOT affected — screenshots work normally before login
4. ✅ No new dependencies added — `expo-screen-capture` was already installed
5. ✅ Component test confirms `usePreventScreenCapture` is called in `AuthLayout`
6. ✅ Component test confirms `usePreventScreenCapture` is NOT called in `LoginScreen`
7. ✅ TypeScript compilation succeeds with no errors
8. ✅ Manual testing on a physical Android device confirms black capture on authenticated screens
9. ✅ Code committed with message: `"feat: implement story 2.5 - prevent screenshots on clinical screens"`

---

**Story Created:** 2026-04-25  
**Ready for Implementation:** Yes  
**Blocking Stories:** None  
**Blocked By:** Story 2.1 (AuthLayout scaffold), Story 2.4 (AuthLayout inactivity wrapper) — both must be complete  
**Estimated Effort:** 30 minutes – 1 hour
