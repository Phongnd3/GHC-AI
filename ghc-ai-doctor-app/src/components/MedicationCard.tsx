import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Spacing } from '@/theme/spacing';
import { BaseColors, ClinicalColors } from '@/theme/colors';
import type { Medication } from '@/types/clinical';

interface MedicationCardProps {
  medications: Medication[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medications,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon source="pill" size={20} color={BaseColors.textPrimary} />
          <Text variant="labelLarge" style={styles.headerText}>
            ACTIVE MEDICATIONS
          </Text>
        </View>

        {isLoading && <LoadingSkeleton count={2} />}

        {!isLoading && error && (
          <ErrorState message="Unable to load medications. Tap to retry." onRetry={onRetry} />
        )}

        {!isLoading && !error && medications && medications.length === 0 && (
          <View style={styles.emptyState}>
            <Icon source="information-outline" size={24} color={BaseColors.textSecondary} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No active medications recorded
            </Text>
          </View>
        )}

        {!isLoading && !error && medications && medications.length > 0 && (
          <View style={styles.list}>
            {medications.map((med, index) => (
              <View
                key={med.uuid}
                style={[
                  styles.medicationItem,
                  index < medications.length - 1 && styles.medicationItemBorder,
                ]}
              >
                <View style={styles.medicationRow}>
                  <Icon source="pill" size={20} color={ClinicalColors.medicationInfo} />
                  <View style={styles.medicationInfo}>
                    <Text variant="bodyLarge" style={styles.drugName}>
                      {med.drugName} {med.dosage}
                    </Text>
                    <Text variant="bodyMedium" style={styles.frequency}>
                      {med.frequency}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ClinicalColors.medicationSurface,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
  },
  drugName: {
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    color: BaseColors.textSecondary,
    marginLeft: Spacing.sm,
  },
  frequency: {
    color: BaseColors.textSecondary,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  headerText: {
    marginLeft: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  medicationInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  medicationItem: {
    paddingBottom: Spacing.md,
  },
  medicationItemBorder: {
    borderBottomColor: BaseColors.borderSubtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  medicationRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
