import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useClinicalSummary } from '@/hooks/useClinicalSummary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { DemographicsCard } from '@/components/DemographicsCard';
import { mapErrorToUserMessage } from '@/utils/errorHandler';
import { Spacing } from '@/theme/spacing';

export default function PatientScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();

  // Handle array params and empty strings
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = id && id.trim() !== '' ? id : null;

  const { demographics, isLoading, error, mutate } = useClinicalSummary(validId);

  // Determine what to render (mutually exclusive states)
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton count={3} />;
    }

    if (error) {
      const errorMessage = mapErrorToUserMessage(error);
      return <ErrorState message={errorMessage?.message || 'An error occurred'} onRetry={mutate} />;
    }

    if (demographics) {
      return <DemographicsCard demographics={demographics} />;
    }

    // Empty state - no loading, no error, no data
    return <ErrorState message="Patient not found" onRetry={mutate} />;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: demographics?.displayName ?? 'Clinical Summary',
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
});
