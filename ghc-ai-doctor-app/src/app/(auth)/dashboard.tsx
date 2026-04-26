import React, { useState, useCallback } from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, IconButton, useTheme } from 'react-native-paper';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing } from '@/theme/spacing';

/**
 * My Patients dashboard — placeholder content for Story 3.x.
 * Authenticated users land here after login.
 *
 * Story 2.6: Adds logout confirmation dialog triggered by:
 *   - Logout icon in the header (AC1)
 *   - Android hardware back button (AC1)
 * "Yes" clears the session and navigates to login (AC2).
 * "No" dismisses the dialog and keeps the doctor on the dashboard (AC3).
 */
export default function DashboardScreen() {
  const theme = useTheme();
  const { logout } = useAuth();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Intercept Android back button to show logout confirmation (AC1).
  // useFocusEffect scopes the handler to when this screen is focused only.
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

  // P2: Guard against dismissal while logout is in flight (e.g. tap outside dialog).
  // onDismiss fires unconditionally — this check prevents closing mid-logout.
  function handleDismissDialog() {
    if (isLoggingOut) return;
    setLogoutError(null);
    setShowLogoutDialog(false);
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.replace('/');
    } catch {
      // P1: Surface logout failure to the user instead of silently swallowing it.
      setLogoutError('Logout failed. Please try again.');
      setIsLoggingOut(false);
      // Keep dialog open so the user can retry or dismiss
    }
    // Note: setIsLoggingOut(false) / setShowLogoutDialog(false) are NOT in a finally block
    // on the success path — navigation away unmounts the component before they would run.
    // On the error path they are handled in the catch block above.
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

      {/* Dashboard content placeholder — full implementation in Story 3.x */}
      <View style={styles.container}>
        <Text variant="headlineMedium">My Patients</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Dashboard coming in Epic 3
        </Text>
      </View>

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={handleDismissDialog}>
          {/* P3: Plain string in Dialog.Title — avoids nested Paper Text double-styling */}
          {/* eslint-disable-next-line react-native/no-raw-text */}
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to log out?</Text>
            {logoutError && (
              <Text variant="bodySmall" style={styles.errorText}>
                {logoutError}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDismissDialog} disabled={isLoggingOut}>
              No
            </Button>
            <Button onPress={handleConfirmLogout} loading={isLoggingOut} disabled={isLoggingOut}>
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  errorText: {
    color: 'red',
    marginTop: Spacing.sm,
  },
  subtitle: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
});
