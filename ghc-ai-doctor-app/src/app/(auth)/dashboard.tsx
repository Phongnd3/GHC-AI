import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Spacing } from '@/theme/spacing';

/**
 * My Patients dashboard — placeholder for Story 3.x implementation.
 * Authenticated users land here after login.
 */
export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">My Patients</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Dashboard coming in Epic 3
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  subtitle: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
});
