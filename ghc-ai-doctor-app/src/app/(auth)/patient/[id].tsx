import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { Spacing } from '@/theme/spacing';

export default function PatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Clinical Summary',
        }}
      />
      <View style={styles.container}>
        <Text variant="bodyMedium">{id}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
});
