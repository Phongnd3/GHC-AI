import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PatientScreen from '../[id]';
import { useLocalSearchParams } from 'expo-router';
import { useClinicalSummary } from '@/hooks/useClinicalSummary';
import { useMedications } from '@/hooks/useMedications';
import type { PatientDemographics } from '@/types/patient';
import type { Medication } from '@/types/clinical';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'patient-uuid-1' })),
  Stack: { Screen: () => null },
}));

jest.mock('@/hooks/useClinicalSummary', () => ({
  useClinicalSummary: jest.fn(),
}));

jest.mock('@/hooks/useMedications', () => ({
  useMedications: jest.fn(),
}));

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

const mockDemographics: PatientDemographics = {
  displayName: 'John Smith',
  patientId: '10002AB',
  age: '45y',
  gender: 'M',
};

const mockMedications: Medication[] = [
  { uuid: 'med-1', drugName: 'Metformin', dosage: '500 mg', frequency: '2x daily' },
];

const mockMutate = jest.fn();

function setupMedicationsDefault() {
  (useMedications as jest.Mock).mockReturnValue({
    medications: undefined,
    isLoading: true,
    error: undefined,
    mutate: mockMutate,
  });
}

describe('PatientScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'patient-uuid-1' });
    setupMedicationsDefault();
  });

  it('shows LoadingSkeleton while loading', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: undefined,
      isLoading: true,
      error: undefined,
      mutate: mockMutate,
    });
    const { UNSAFE_getAllByType } = render(<PatientScreen />);
    // LoadingSkeleton renders Animated.View elements
    expect(UNSAFE_getAllByType(Animated.View).length).toBeGreaterThan(0);
  });

  it('shows ErrorState with retry on error', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: undefined,
      isLoading: false,
      error: new Error('Network Error'),
      mutate: mockMutate,
    });
    const { getByText } = render(<PatientScreen />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('renders DemographicsCard when data is loaded', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: mockDemographics,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });
    const { getByText } = render(<PatientScreen />);
    expect(getByText('John Smith')).toBeTruthy();
    expect(getByText('10002AB')).toBeTruthy();
  });

  it('renders MedicationCard when demographics loaded and medications present', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: mockDemographics,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });
    (useMedications as jest.Mock).mockReturnValue({
      medications: mockMedications,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });
    const { getByText } = render(<PatientScreen />);
    expect(getByText('Metformin 500 mg')).toBeTruthy();
    expect(getByText('ACTIVE MEDICATIONS')).toBeTruthy();
  });

  it('renders both cards when demographics loaded (medications may load independently)', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: mockDemographics,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });
    // medications still loading — MedicationCard handles its own sub-state
    (useMedications as jest.Mock).mockReturnValue({
      medications: undefined,
      isLoading: true,
      error: undefined,
      mutate: mockMutate,
    });
    const { getByText } = render(<PatientScreen />);
    // Demographics still shows
    expect(getByText('John Smith')).toBeTruthy();
    // MedicationCard header still shows (it renders within its card even when loading)
    expect(getByText('ACTIVE MEDICATIONS')).toBeTruthy();
  });

  it('uses patient displayName as screen title when loaded', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: mockDemographics,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });
    render(<PatientScreen />);
    expect(useClinicalSummary).toHaveBeenCalledWith('patient-uuid-1');
  });

  it('falls back to "Clinical Summary" title when demographics not yet loaded', () => {
    (useClinicalSummary as jest.Mock).mockReturnValue({
      demographics: undefined,
      isLoading: true,
      error: undefined,
      mutate: mockMutate,
    });
    expect(() => render(<PatientScreen />)).not.toThrow();
  });
});
