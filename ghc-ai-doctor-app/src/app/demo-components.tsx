import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { EmptyState, LoadingSkeleton } from '@/components';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function DemoComponentsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Component Demo</Text>

      <Text style={styles.sectionTitle}>EmptyState with Action</Text>
      <View style={styles.demoBox}>
        <EmptyState
          icon="inbox"
          message="No patients assigned"
          actionLabel="Refresh"
          onActionPress={() => console.log('Refresh pressed')}
        />
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>EmptyState without Action</Text>
      <View style={styles.demoBox}>
        <EmptyState icon="alert-circle" message="No data available" />
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>LoadingSkeleton (Default Count)</Text>
      <LoadingSkeleton />

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>LoadingSkeleton (Custom Count: 5)</Text>
      <LoadingSkeleton count={5} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  demoBox: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    height: 200,
  },
  divider: {
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  title: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.xl,
  },
});
