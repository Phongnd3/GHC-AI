import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { BaseColors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import type { FilteredPatientData } from '@/types/patient';

export interface PatientCardProps {
  patient: FilteredPatientData;
  onPress: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => (
  <Card mode="elevated" style={styles.card} onPress={onPress}>
    <Card.Content>
      <Text variant="titleMedium" style={styles.name}>
        {patient.displayName}
      </Text>
      <Text variant="bodyMedium" style={styles.secondary}>
        {`ID: ${patient.patientId}  •  ${patient.age}  •  ${patient.gender}`}
      </Text>
      {patient.ward && (
        <Text variant="bodyMedium" style={styles.secondary}>
          {`Ward: ${patient.ward}`}
        </Text>
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xl,
    minHeight: 88,
  },
  name: {
    color: BaseColors.textPrimary,
  },
  secondary: {
    color: BaseColors.textSecondary,
  },
});
