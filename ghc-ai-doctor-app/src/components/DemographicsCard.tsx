import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Spacing } from '@/theme/spacing';
import { BaseColors } from '@/theme/colors';
import type { PatientDemographics } from '@/types/patient';

interface DemographicsCardProps {
  demographics: PatientDemographics;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({ demographics }) => {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text variant="labelLarge" style={styles.header}>
          DEMOGRAPHICS
        </Text>
        <DemographicsRow label="Name" value={demographics.displayName} />
        <DemographicsRow label="Patient ID" value={demographics.patientId} />
        <DemographicsRow label="Age" value={demographics.age} />
        <DemographicsRow label="Gender" value={demographics.gender} />
      </Card.Content>
    </Card>
  );
};

function DemographicsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}:
      </Text>
      <Text variant="bodyLarge" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BaseColors.background,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  label: {
    color: BaseColors.textSecondary,
    marginRight: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  value: {
    flex: 1,
  },
});
