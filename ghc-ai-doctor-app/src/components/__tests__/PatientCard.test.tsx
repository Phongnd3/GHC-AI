import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PatientCard } from '../PatientCard';
import type { FilteredPatientData } from '@/types/patient';

const mockPatient: FilteredPatientData = {
  patientUuid: 'patient-uuid-1',
  displayName: 'John Doe',
  patientId: 'MRN-001',
  age: '44y',
  gender: 'M',
  ward: 'Ward A',
  visitUuid: 'visit-uuid-1',
};

describe('PatientCard', () => {
  it('renders patient display name', () => {
    const { getByText } = render(<PatientCard patient={mockPatient} onPress={jest.fn()} />);
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders patient ID, age, and gender', () => {
    const { getByText } = render(<PatientCard patient={mockPatient} onPress={jest.fn()} />);
    expect(getByText('ID: MRN-001  •  44y  •  M')).toBeTruthy();
  });

  it('renders ward when provided', () => {
    const { getByText } = render(<PatientCard patient={mockPatient} onPress={jest.fn()} />);
    expect(getByText('Ward: Ward A')).toBeTruthy();
  });

  it('does not render ward row when ward is null', () => {
    const patientNoWard: FilteredPatientData = { ...mockPatient, ward: null };
    const { queryByText } = render(<PatientCard patient={patientNoWard} onPress={jest.fn()} />);
    expect(queryByText(/Ward:/)).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PatientCard patient={mockPatient} onPress={onPress} />);
    fireEvent.press(getByText('John Doe'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
