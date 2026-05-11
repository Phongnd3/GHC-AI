import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { MedicationCard } from '../MedicationCard';
import type { Medication } from '@/types/clinical';

jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const Card = ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <RN.View {...rest}>{children}</RN.View>
  );
  Card.displayName = 'Card';
  Card.Content = ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <RN.View {...rest}>{children}</RN.View>
  );
  Card.Content.displayName = 'CardContent';
  return {
    Card,
    Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.Text {...rest}>{children}</RN.Text>
    ),
    Button: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.TouchableOpacity {...rest}>
        <RN.Text>{children}</RN.Text>
      </RN.TouchableOpacity>
    ),
    Icon: () => null,
    useTheme: () => ({ colors: {} }),
  };
});

const mockMedications: Medication[] = [
  { uuid: 'med-1', drugName: 'Metformin', dosage: '500 mg', frequency: '2x daily, with meals' },
  { uuid: 'med-2', drugName: 'Lisinopril', dosage: '10 mg', frequency: '1x daily, morning' },
];

describe('MedicationCard', () => {
  it('renders drug names and dosages when medications provided', () => {
    const { getByText } = render(
      <MedicationCard
        medications={mockMedications}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('Metformin 500 mg')).toBeTruthy();
    expect(getByText('Lisinopril 10 mg')).toBeTruthy();
  });

  it('renders frequencies', () => {
    const { getByText } = render(
      <MedicationCard
        medications={mockMedications}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('2x daily, with meals')).toBeTruthy();
    expect(getByText('1x daily, morning')).toBeTruthy();
  });

  it('renders empty state when medications array is empty', () => {
    const { getByText } = render(
      <MedicationCard medications={[]} isLoading={false} error={undefined} onRetry={jest.fn()} />
    );
    expect(getByText('No active medications recorded')).toBeTruthy();
  });

  it('renders loading skeleton when loading', () => {
    const { UNSAFE_getAllByType } = render(
      <MedicationCard
        medications={undefined}
        isLoading={true}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    // LoadingSkeleton renders Animated.View elements
    const animatedViews = UNSAFE_getAllByType(Animated.View);
    expect(animatedViews.length).toBeGreaterThan(0);
  });

  it('renders error state with retry when error', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <MedicationCard
        medications={undefined}
        isLoading={false}
        error={new Error('Network Error')}
        onRetry={onRetry}
      />
    );
    expect(getByText('Unable to load medications. Tap to retry.')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('renders section header ACTIVE MEDICATIONS', () => {
    const { getByText } = render(
      <MedicationCard
        medications={mockMedications}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('ACTIVE MEDICATIONS')).toBeTruthy();
  });
});
