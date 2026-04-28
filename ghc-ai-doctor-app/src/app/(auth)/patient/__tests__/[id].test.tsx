import React from 'react';
import { render } from '@testing-library/react-native';
import PatientScreen from '../[id]';
import { useLocalSearchParams } from 'expo-router';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'patient-uuid-1' })),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  return {
    Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.Text {...rest}>{children}</RN.Text>
    ),
    useTheme: () => ({ colors: {} }),
  };
});

describe('PatientScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'patient-uuid-1' });
  });

  it('renders the patient UUID from route params', () => {
    const { getByText } = render(<PatientScreen />);
    expect(getByText('patient-uuid-1')).toBeTruthy();
  });

  it('calls useLocalSearchParams to read id param', () => {
    render(<PatientScreen />);
    expect(useLocalSearchParams).toHaveBeenCalled();
  });
});
