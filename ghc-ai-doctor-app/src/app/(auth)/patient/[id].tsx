import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useClinicalSummary } from '@/hooks/useClinicalSummary';
import { useMedications } from '@/hooks/useMedications';
import { useAllergies } from '@/hooks/useAllergies';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { DemographicsCard } from '@/components/DemographicsCard';
import { MedicationCard } from '@/components/MedicationCard';
import { AllergiesCard } from '@/components/AllergiesCard';
import { mapErrorToUserMessage } from '@/utils/errorHandler';
import { Spacing } from '@/theme/spacing';

export default function PatientScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();

  // Handle array params and empty strings
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const validId = id && id.trim() !== '' ? id : null;

  const {
    demographics,
    isLoading: demLoading,
    error: demError,
    mutate: demMutate,
  } = useClinicalSummary(validId);
  const {
    medications,
    isLoading: medLoading,
    error: medError,
    mutate: medMutate,
  } = useMedications(validId);
  const {
    allergies,
    isLoading: allLoading,
    error: allError,
    mutate: allMutate,
  } = useAllergies(validId);

  // Determine what to render (mutually exclusive states)
  const renderContent = () => {
    if (demLoading) {
      return <LoadingSkeleton count={4} />;
    }

    if (demError) {
      const errorMessage = mapErrorToUserMessage(demError);
      return (
        <ErrorState message={errorMessage?.message || 'An error occurred'} onRetry={demMutate} />
      );
    }

    if (demographics) {
      return (
        <>
          <DemographicsCard demographics={demographics} />
          <MedicationCard
            medications={medications}
            isLoading={medLoading}
            error={medError}
            onRetry={medMutate}
          />
          <AllergiesCard
            allergies={allergies}
            isLoading={allLoading}
            error={allError}
            onRetry={allMutate}
          />
        </>
      );
    }

    // Empty state - no loading, no error, no data
    return <ErrorState message="Patient not found" onRetry={demMutate} />;
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
