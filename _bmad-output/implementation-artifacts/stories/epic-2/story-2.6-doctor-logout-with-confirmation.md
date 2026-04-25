# Story 2.6: Doctor Logout with Confirmation

**Status:** ready-for-dev  
**Epic:** 2 - Authentication & Session Management  
**Story ID:** 2.6  
**Priority:** P1 - Core UX for session termination (FR22, UX-DR18)

---

## Story

As a doctor,  
I want to log out of the app with a confirmation dialog,  
So that I don't accidentally log out and lose my session.

---

## Acceptance Criteria

**AC1.**  
**Given** I am logged in and on the My Patients dashboard  
**When** I press the Android back button or tap the menu and select "Logout"  
**Then** A confirmation dialog appears asking "Are you sure you want to log out?"

**AC2.**  
**Given** The logout confirmation dialog is displayed  
**When** I tap "Yes"  
**Then** My session token is cleared from secure storage  
**And** I am redirected to the login screen

**AC3.**  
**Given** The logout confirmation dialog is displayed  
**When** I tap "No"  
**Then** The dialog closes and I remain on the dashboard

---

## Tasks / Subtasks

- [ ] Task 1: Add logout menu button to the dashboard header (AC: #1)
  - [ ] In `src/app/(auth)/dashboard.tsx`, add a header right action using Expo Router's `<Stack.Screen>` options
  - [ ] Use `IconButton` from `react-native-paper` with the `logout` or `exit-to-app` icon
  - [ ] Tapping the icon calls `handleLogoutPress()` which sets `showLogoutDialog` state to `true`

- [ ] Task 2: Handle Android back button on dashboard (AC: #1)
  - [ ] Import `useBackHandler` from `@react-native-community/hooks` OR use React Native's `BackHandler` directly
  - [ ] In `src/app/(auth)/dashboard.tsx`, intercept the Android back button press
  - [ ] On back press, show the logout confirmation dialog instead of navigating back
  - [ ] Return `true` from the back handler to prevent default back navigation

- [ ] Task 3: Implement logout confirmation dialog (AC: #1, #2, #3)
  - [ ] Add `showLogoutDialog` boolean state (default `false`) to the dashboard screen
  - [ ] Render a `Dialog` from `react-native-paper` controlled by `showLogoutDialog`
  - [ ] Dialog title: "Confirm Logout"
  - [ ] Dialog content text: "Are you sure you want to log out?"
  - [ ] Dialog actions: "No" button (dismisses dialog) and "Yes" button (calls `handleConfirmLogout()`)

- [ ] Task 4: Implement confirmed logout flow (AC: #2)
  - [ ] `handleConfirmLogout()` calls `logout()` from `useAuth()`
  - [ ] `logout()` in `AuthContext` calls `DELETE /openmrs/ws/rest/v1/session`, clears SecureStore, resets auth state
  - [ ] After `logout()` resolves, navigate to login via `router.replace('/')`
  - [ ] Show loading state on the "Yes" button while logout is in progress

---

## Dev Notes

### Technical Context

**`AuthContext.logout()` is already implemented in Story 2.1:**
- Calls `DELETE /openmrs/ws/rest/v1/session`
- Clears `sessionToken` and `sessionUser` from SecureStore
- Sets `isAuthenticated = false`, `user = null`
- Story 2.4 added timer cancellation to `logout()` as well

This story only adds the UI confirmation layer — no changes to `AuthContext` are needed.

**Android Back Button:**
React Native's `BackHandler` API intercepts the hardware back button. On the dashboard, the back button should show the logout dialog rather than navigating back (there is no previous screen in the authenticated stack after login).

```typescript
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Inside dashboard component:
useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowLogoutDialog(true);
      return true; // Prevent default back navigation
    });
    return () => subscription.remove();
  }, [])
);
```

**`useFocusEffect` is important** — it ensures the back handler is only active when the dashboard screen is focused, and is automatically removed when the screen loses focus.

**Dialog implementation (`src/app/(auth)/dashboard.tsx`):**

```typescript
import React, { useState, useCallback } from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, IconButton, useTheme } from 'react-native-paper';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing } from '@/theme/spacing';

export default function DashboardScreen() {
  const theme = useTheme();
  const { logout } = useAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Intercept Android back button to show logout confirmation
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setShowLogoutDialog(true);
        return true; // Prevent default back navigation
      });
      return () => subscription.remove();
    }, [])
  );

  function handleLogoutPress() {
    setShowLogoutDialog(true);
  }

  function handleDismissDialog() {
    setShowLogoutDialog(false);
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Patients',
          headerRight: () => (
            <IconButton
              icon="exit-to-app"
              iconColor={theme.colors.onSurface}
              onPress={handleLogoutPress}
              accessibilityLabel="Logout"
            />
          ),
        }}
      />

      {/* Dashboard content goes here (Story 3.1+) */}
      <View style={styles.container} />

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={handleDismissDialog}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDismissDialog} disabled={isLoggingOut}>
              No
            </Button>
            <Button
              onPress={handleConfirmLogout}
              loading={isLoggingOut}
              disabled={isLoggingOut}
            >
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

**`Portal` requirement:**  
React Native Paper's `Dialog` must be wrapped in `<Portal>` to render above all other content. `Portal` requires a `PaperProvider` ancestor — already present in `src/app/_layout.tsx` from Story 2.1.

### Architecture Compliance

**ARCH-REQ-1: Use `AuthContext.logout()`**
- ✅ Call `logout()` from `useAuth()` — do NOT call `apiClient.delete('/session')` directly in the screen
- ✅ `logout()` already handles SecureStore cleanup and state reset

**ARCH-REQ-2: Navigation after logout**
- ✅ Use `router.replace('/')` after logout — prevents back navigation to the dashboard
- ✅ Do NOT use `router.push('/')` — the authenticated stack must be cleared

**ARCH-REQ-3: Material Design 3 Components**
- ✅ `Dialog`, `Portal`, `Button`, `IconButton` from `react-native-paper`
- ✅ Theme colors via `useTheme()` — no hardcoded colors
- ✅ `Text variant="bodyMedium"` for dialog content — no hardcoded font sizes

**ARCH-REQ-4: Back Button Handling**
- ✅ Use `BackHandler` from React Native core — no new libraries
- ✅ Wrap in `useFocusEffect` — ensures handler is scoped to dashboard focus only
- ✅ Return `true` from handler — prevents default back navigation

**ARCH-REQ-5: Loading State**
- ✅ `isLoggingOut` state disables both dialog buttons and shows loading on "Yes" during the API call
- ✅ Prevents double-tap logout race condition

### Testing Requirements

**Component Tests (`src/app/(auth)/__tests__/dashboard.test.tsx`):**

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import DashboardScreen from '../dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

jest.mock('@/contexts/AuthContext');
jest.mock('expo-router');

describe('DashboardScreen - logout', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
  });

  it('shows logout confirmation dialog when logout icon is pressed', () => {
    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));

    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
  });

  it('dismisses dialog when "No" is tapped', () => {
    const { getByLabelText, getByText, queryByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    expect(getByText('Are you sure you want to log out?')).toBeTruthy();

    fireEvent.press(getByText('No'));

    expect(queryByText('Are you sure you want to log out?')).toBeNull();
  });

  it('calls logout and navigates to login when "Yes" is tapped', async () => {
    mockLogout.mockResolvedValue(undefined);

    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('Yes'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state on "Yes" button during logout', async () => {
    let resolveLogout: () => void;
    mockLogout.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      })
    );

    const { getByLabelText, getByText } = render(<DashboardScreen />);

    fireEvent.press(getByLabelText('Logout'));
    fireEvent.press(getByText('Yes'));

    // "Yes" button should be in loading/disabled state
    await waitFor(() => {
      expect(getByText('Yes').props.disabled).toBe(true);
    });

    resolveLogout!();
  });

  it('shows logout dialog when Android back button is pressed', () => {
    const { getByText } = render(<DashboardScreen />);

    // Simulate Android back button press
    BackHandler.mockPressBack();

    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
  });

  it('does not navigate back when Android back button is pressed', () => {
    render(<DashboardScreen />);

    const result = BackHandler.mockPressBack();

    // BackHandler returns true = back press was handled (no default navigation)
    expect(result).toBe(true);
  });
});
```

**Manual Test Checklist:**
- [ ] Tap the logout icon in the dashboard header → confirmation dialog appears
- [ ] Dialog shows title "Confirm Logout" and text "Are you sure you want to log out?"
- [ ] Tap "No" → dialog closes, remain on dashboard
- [ ] Tap "Yes" → loading indicator on button, then redirected to login screen
- [ ] After logout, pressing Android back does NOT return to dashboard
- [ ] Press Android hardware back button on dashboard → confirmation dialog appears
- [ ] Press Android hardware back button, then tap "No" → remain on dashboard
- [ ] Press Android hardware back button, then tap "Yes" → redirected to login
- [ ] SecureStore is empty after confirmed logout (verify via debug)
- [ ] Session expiry message does NOT appear after explicit logout (Story 2.4 behaviour)

### References

**Source Documents:**
- [Epic 2: Authentication & Session Management](_bmad-output/planning-artifacts/epics/epic-2-authentication-session-management.md)
- [Architecture: Implementation Patterns](_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md)

**External Documentation:**
- [React Native Paper — Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog)
- [React Native Paper — Portal](https://callstack.github.io/react-native-paper/docs/components/Portal)
- [React Native — BackHandler](https://reactnative.dev/docs/backhandler)
- [Expo Router — useFocusEffect](https://docs.expo.dev/router/reference/hooks/#usefocuseffect)

**Previous Story Learnings:**
- Story 2.1: `AuthContext.logout()` calls `DELETE /session`, clears SecureStore, resets state — no changes needed here
- Story 2.4: `logout()` also cancels the inactivity timer — confirmed no double-expiry message on explicit logout
- Story 2.1: `router.replace('/')` is the established pattern for post-auth navigation
- Story 2.1: `PaperProvider` is in root layout — `Portal` will work without additional setup

---

## Critical Developer Guardrails

### ⚠️ MANDATORY REQUIREMENTS

1. **Wrap `Dialog` in `<Portal>`** — without `Portal`, the dialog will be clipped by parent view boundaries and may not render correctly above other content

2. **Use `useFocusEffect` for the back handler** — plain `useEffect` would leave the handler active even when the screen is not focused; `useFocusEffect` scopes it correctly

3. **Return `true` from the back handler** — returning `false` or `undefined` allows the default back navigation to proceed, bypassing the confirmation dialog

4. **Use `router.replace('/')` after logout** — `router.push('/')` would leave the dashboard in the navigation stack, allowing the doctor to navigate back to it after logout

5. **Disable both dialog buttons during logout** — prevents a second tap on "Yes" or "No" while the API call is in flight

6. **Call `logout()` from `useAuth()`** — do NOT call the API directly; `AuthContext.logout()` handles all cleanup (SecureStore, state, timer)

### 🚫 COMMON MISTAKES TO AVOID

1. **DO NOT** use `Alert.alert()` for the confirmation — use `react-native-paper` `Dialog` for Material Design 3 consistency
2. **DO NOT** use `useEffect` for the back handler — use `useFocusEffect` to scope it to screen focus
3. **DO NOT** navigate before `logout()` resolves — wait for the promise to ensure SecureStore is cleared before leaving
4. **DO NOT** implement session timeout here — that is Story 2.4 (already done)
5. **DO NOT** implement screenshot prevention here — that is Story 2.5 (already done)
6. **DO NOT** implement session persistence here — that is Story 2.7

### ✅ DEFINITION OF DONE

This story is complete when:
1. ✅ Logout icon in dashboard header opens confirmation dialog
2. ✅ Android back button on dashboard opens confirmation dialog
3. ✅ "No" dismisses dialog and keeps doctor on dashboard
4. ✅ "Yes" calls `logout()`, clears session, navigates to login
5. ✅ "Yes" button shows loading state during logout API call
6. ✅ Both buttons disabled during logout to prevent double-tap
7. ✅ `router.replace('/')` used — back button after logout does NOT return to dashboard
8. ✅ All component tests pass
9. ✅ TypeScript compilation succeeds with no errors
10. ✅ Manual testing confirms all three acceptance criteria
11. ✅ Code committed with message: `"feat: implement story 2.6 - doctor logout with confirmation"`

---

**Story Created:** 2026-04-25  
**Ready for Implementation:** Yes  
**Blocking Stories:** None  
**Blocked By:** Story 2.1 (AuthContext `logout()` and dashboard scaffold), Story 2.4 (timer cancellation in `logout()`)  
**Estimated Effort:** 2-3 hours
