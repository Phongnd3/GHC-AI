import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';
import { BaseColors } from '@/theme/colors';
import { ClinicalColors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, isRetrying = false }) => {
  return (
    <View style={styles.container}>
      <Icon source="alert-circle-outline" size={64} color={ClinicalColors.error} />
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
      <Button
        mode="contained"
        onPress={onRetry}
        loading={isRetrying}
        disabled={isRetrying}
        style={styles.button}
      >
        Retry
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  message: {
    color: BaseColors.textSecondary,
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});
