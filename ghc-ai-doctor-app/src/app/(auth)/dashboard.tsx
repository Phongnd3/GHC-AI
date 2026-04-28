import React, { useState, useCallback } from 'react';
import { BackHandler, FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, IconButton, useTheme } from 'react-native-paper';
import { Stack, router, useFocusEffect } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { PatientCard } from '@/components/PatientCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';
import { Spacing } from '@/theme/spacing';
import { BaseColors } from '@/theme/colors';
import type { FilteredPatientData } from '@/types/patient';

export default function DashboardScreen() {
  const theme = useTheme();
  const { logout, user } = useAuth();
  const { patients, isLoading, isRefreshing, error, mutate, lastUpdatedAt } = usePatients(
    user?.uuid ?? null
  );

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

  function renderContent() {
    if (isLoading) {
      return <LoadingSkeleton count={3} />;
    }
    if (error) {
      const mapped = mapErrorToUserMessage(error);
      const errorMessage =
        mapped.type === ErrorType.NETWORK_ERROR
          ? 'Unable to load patients. Tap to retry.'
          : 'Unable to load patients. Please try again later.';

      return <ErrorState message={errorMessage} onRetry={mutate} isRetrying={isRefreshing} />;
    }
    if (patients.length === 0) {
      return <EmptyState icon="account-group" message="No active patients assigned to you" />;
    }
    return (
      <FlatList
        data={patients}
        keyExtractor={(item: FilteredPatientData) => item.visitUuid}
        renderItem={({ item }: { item: FilteredPatientData }) => (
          <PatientCard patient={item} onPress={() => router.push(`/patient/${item.patientUuid}`)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={mutate} />}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Patients',
          headerRight: () => (
            <View style={styles.headerActions}>
              <IconButton
                icon="refresh"
                iconColor={theme.colors.onSurface}
                onPress={mutate}
                accessibilityLabel="Refresh"
              />
              <IconButton
                icon="exit-to-app"
                iconColor={theme.colors.onSurface}
                onPress={handleLogoutPress}
                accessibilityLabel="Logout"
              />
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        {lastUpdatedAt !== null && (
          <Text variant="bodySmall" style={styles.lastUpdated}>
            {`Last updated: ${formatDistanceToNow(lastUpdatedAt, { addSuffix: true })}`}
          </Text>
        )}
        {renderContent()}
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
    flex: 1,
  },
  errorText: {
    color: 'red',
    marginTop: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  lastUpdated: {
    color: BaseColors.textSecondary,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  listContent: {
    padding: Spacing.md,
  },
});
