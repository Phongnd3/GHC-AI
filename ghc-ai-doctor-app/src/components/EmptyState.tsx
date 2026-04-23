import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';
import { BaseColors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

interface EmptyStateProps {
  icon: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={BaseColors.textSecondary} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onActionPress && (
        <Button mode="contained" onPress={onActionPress}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  message: {
    ...Typography.bodyLarge,
    color: BaseColors.textSecondary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
