import { getPatientDemographics } from '../clinical';
import { apiClient } from '../client';
import type { Patient } from '@/types/patient';

jest.mock('../client', () => ({
  apiClient: { get: jest.fn() },
}));

// Mock the helper functions from usePatients to avoid circular deps in tests
jest.mock('@/hooks/usePatients', () => ({
  resolveDisplayName: jest.fn((patient: Patient) => {
    const preferred = patient.person.names.find((n) => n.preferred) ?? patient.person.names[0];
    return preferred ? `${preferred.givenName} ${preferred.familyName}` : 'Unknown Patient';
  }),
  resolvePatientId: jest.fn((patient: Patient) => {
    const preferred = patient.identifiers.find((i) => i.preferred);
    return preferred?.identifier ?? patient.identifiers[0]?.identifier ?? 'N/A';
  }),
  resolveAge: jest.fn((person: Patient['person']) => {
    if (!person?.birthdate) return 'Unknown';
    return person.birthdateEstimated ? '~45y' : '45y';
  }),
}));

const mockPatient: Patient = {
  uuid: 'patient-uuid-1',
  identifiers: [
    {
      uuid: 'id-uuid-1',
      identifier: '10002AB',
      identifierType: { uuid: 'type-uuid', display: 'OpenMRS ID' },
      preferred: true,
    },
  ],
  person: {
    uuid: 'person-uuid-1',
    names: [{ uuid: 'name-uuid-1', preferred: true, givenName: 'John', familyName: 'Smith' }],
    gender: 'M',
    birthdate: '1980-01-01',
    birthdateEstimated: false,
    dead: false,
    attributes: [],
    addresses: [],
  },
  voided: false,
};

const mockPatientEstimated: Patient = {
  ...mockPatient,
  person: { ...mockPatient.person, birthdateEstimated: true },
};

describe('getPatientDemographics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls GET /patient/{uuid}?v=full', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPatient });
    await getPatientDemographics('patient-uuid-1');
    expect(apiClient.get).toHaveBeenCalledWith('/patient/patient-uuid-1?v=full');
  });

  it('transforms response to PatientDemographics with preferred name', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPatient });
    const result = await getPatientDemographics('patient-uuid-1');
    expect(result.displayName).toBe('John Smith');
    expect(result.patientId).toBe('10002AB');
    expect(result.gender).toBe('M');
  });

  it('returns age with ~ prefix when birthdateEstimated', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPatientEstimated });
    const result = await getPatientDemographics('patient-uuid-1');
    expect(result.age).toMatch(/^~/);
  });

  it('returns age without ~ prefix when birthdate is exact', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPatient });
    const result = await getPatientDemographics('patient-uuid-1');
    expect(result.age).not.toMatch(/^~/);
  });

  it('propagates errors from apiClient', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(getPatientDemographics('patient-uuid-1')).rejects.toThrow('Network Error');
  });
});
