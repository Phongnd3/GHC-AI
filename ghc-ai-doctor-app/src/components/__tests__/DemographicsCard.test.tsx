import React from 'react';
import { render } from '@testing-library/react-native';
import { DemographicsCard } from '../DemographicsCard';
import type { PatientDemographics } from '@/types/patient';

jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  return {
    Card: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.View {...rest}>{children}</RN.View>
    ),
    Text: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
      <RN.Text {...rest}>{children}</RN.Text>
    ),
  };
});

// Add Card.Content mock
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
  };
});

const sampleDemographics: PatientDemographics = {
  displayName: 'John Smith',
  patientId: '10002AB',
  age: '45y',
  gender: 'Male',
};

describe('DemographicsCard', () => {
  it('renders the section header', () => {
    const { getByText } = render(<DemographicsCard demographics={sampleDemographics} />);
    expect(getByText('DEMOGRAPHICS')).toBeTruthy();
  });

  it('renders patient name', () => {
    const { getByText } = render(<DemographicsCard demographics={sampleDemographics} />);
    expect(getByText('John Smith')).toBeTruthy();
  });

  it('renders patient ID', () => {
    const { getByText } = render(<DemographicsCard demographics={sampleDemographics} />);
    expect(getByText('10002AB')).toBeTruthy();
  });

  it('renders patient age', () => {
    const { getByText } = render(<DemographicsCard demographics={sampleDemographics} />);
    expect(getByText('45y')).toBeTruthy();
  });

  it('renders patient gender', () => {
    const { getByText } = render(<DemographicsCard demographics={sampleDemographics} />);
    expect(getByText('Male')).toBeTruthy();
  });
});
