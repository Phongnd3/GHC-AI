import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Spacing } from '@/theme/spacing';
import { BaseColors, ClinicalColors } from '@/theme/colors';
import type { Allergy } from '@/types/clinical';

interface AllergiesCardProps {
  allergies: Allergy[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export const AllergiesCard: React.FC<AllergiesCardProps> = ({
  allergies,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon source="alert-outline" size={20} color={BaseColors.textPrimary} />
          <Text variant="labelLarge" style={styles.headerText}>
            ALLERGIES
          </Text>
        </View>

        {isLoading && <LoadingSkeleton count={2} />}

        {!isLoading && error && (
          <ErrorState message="Unable to load allergies. Tap to retry." onRetry={onRetry} />
        )}

        {!isLoading && !error && allergies && allergies.length === 0 && (
          <View style={styles.emptyState}>
            <Icon source="check-circle-outline" size={24} color={ClinicalColors.success} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No known allergies
            </Text>
          </View>
        )}

        {!isLoading && !error && allergies && allergies.length > 0 && (
          <View style={styles.list}>
            {allergies.map((allergy, index) => (
              <View
                key={allergy.uuid}
                style={[
                  styles.allergyItem,
                  index < allergies.length - 1 && styles.allergyItemBorder,
                ]}
              >
                <View style={styles.allergyRow}>
                  <Icon source="alert" size={20} color={ClinicalColors.allergyAlert} />
                  <View style={styles.allergyInfo}>
                    <Text variant="bodyLarge" style={styles.allergyName}>
                      {allergy.allergenDisplay}
                      {allergy.severity ? ` (${allergy.severity})` : ''}
                    </Text>
                    {allergy.reactions.length > 0 && (
                      <Text variant="bodyMedium" style={styles.reactions}>
                        {allergy.reactions.join(', ')}
                      </Text>
                    )}
                    {allergy.comment && (
                      <Text variant="bodyMedium" style={styles.comment}>
                        {allergy.comment}
                      </Text>
                    )}
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
  allergyInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  allergyItem: {
    paddingBottom: Spacing.md,
  },
  allergyItemBorder: {
    borderBottomColor: BaseColors.borderSubtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  allergyName: {
    color: ClinicalColors.allergyAlert,
    fontWeight: 'bold',
  },
  allergyRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  card: {
    backgroundColor: ClinicalColors.allergySurface,
    borderColor: ClinicalColors.allergyAlert,
    borderWidth: 2,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
  },
  comment: {
    color: BaseColors.textSecondary,
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    color: ClinicalColors.success,
    marginLeft: Spacing.sm,
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
  reactions: {
    color: BaseColors.textSecondary,
  },
});
