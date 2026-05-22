import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { AllergiesCard } from '../AllergiesCard';
import type { Allergy } from '@/types/clinical';

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

const mockAllergies: Allergy[] = [
  {
    uuid: 'all-1',
    allergenDisplay: 'Penicillin',
    allergenType: 'DRUG',
    severity: 'Severe',
    reactions: ['Anaphylaxis'],
    comment: 'EpiPen',
  },
  {
    uuid: 'all-2',
    allergenDisplay: 'Sulfa',
    allergenType: 'DRUG',
    severity: 'Moderate',
    reactions: ['Rash'],
  },
];

describe('AllergiesCard', () => {
  it('renders allergy names and severity when allergies provided', () => {
    const { getByText } = render(
      <AllergiesCard
        allergies={mockAllergies}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('Penicillin (Severe)')).toBeTruthy();
    expect(getByText('Sulfa (Moderate)')).toBeTruthy();
  });

  it('renders reactions', () => {
    const { getByText } = render(
      <AllergiesCard
        allergies={mockAllergies}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('Anaphylaxis')).toBeTruthy();
    expect(getByText('Rash')).toBeTruthy();
  });

  it('renders "No known allergies" with green state when empty array', () => {
    const { getByText } = render(
      <AllergiesCard allergies={[]} isLoading={false} error={undefined} onRetry={jest.fn()} />
    );
    expect(getByText('No known allergies')).toBeTruthy();
  });

  it('renders loading skeleton when loading', () => {
    const { UNSAFE_getAllByType } = render(
      <AllergiesCard allergies={undefined} isLoading={true} error={undefined} onRetry={jest.fn()} />
    );
    const animatedViews = UNSAFE_getAllByType(Animated.View);
    expect(animatedViews.length).toBeGreaterThan(0);
  });

  it('renders error state with retry when error', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <AllergiesCard
        allergies={undefined}
        isLoading={false}
        error={new Error('Network Error')}
        onRetry={onRetry}
      />
    );
    expect(getByText('Unable to load allergies. Tap to retry.')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('renders section header ALLERGIES', () => {
    const { getByText } = render(
      <AllergiesCard
        allergies={mockAllergies}
        isLoading={false}
        error={undefined}
        onRetry={jest.fn()}
      />
    );
    expect(getByText('ALLERGIES')).toBeTruthy();
  });
});
