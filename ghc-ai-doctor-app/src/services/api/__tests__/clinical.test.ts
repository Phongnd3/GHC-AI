import { getPatientDemographics, getActiveMedications, getAllergies } from '../clinical';
import { apiClient } from '../client';
import type { Patient } from '@/types/patient';
import type { Order } from '@/types/visit';

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

const mockDrugOrder: Order = {
  uuid: 'order-uuid-1',
  orderType: { display: 'Drug Order' },
  drug: { display: 'Metformin' },
  dose: 500,
  doseUnits: { display: 'mg' },
  frequency: { display: '2x daily, with meals' },
  dateActivated: '2026-01-01T00:00:00Z',
  voided: false,
};

const mockDrugOrderMissingDose: Order = {
  uuid: 'order-uuid-2',
  orderType: { display: 'Drug Order' },
  drug: { display: 'Paracetamol' },
  frequency: { display: 'As needed' },
  dateActivated: '2026-01-01T00:00:00Z',
  voided: false,
};

const mockVoidedOrder: Order = {
  uuid: 'order-uuid-3',
  orderType: { display: 'Drug Order' },
  drug: { display: 'Aspirin' },
  dose: 100,
  doseUnits: { display: 'mg' },
  dateActivated: '2026-01-01T00:00:00Z',
  voided: true,
};

const mockNonDrugOrder: Order = {
  uuid: 'order-uuid-4',
  orderType: { display: 'Test Order' },
  drug: { display: 'Blood Panel' },
  dateActivated: '2026-01-01T00:00:00Z',
  voided: false,
};

describe('getActiveMedications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls GET /order with correct params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { results: [] } });
    await getActiveMedications('patient-uuid-1');
    expect(apiClient.get).toHaveBeenCalledWith('/order', {
      params: { patient: 'patient-uuid-1', careSetting: 'OUTPATIENT', status: 'ACTIVE', v: 'full' },
    });
  });

  it('transforms drug orders to Medication[]', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockDrugOrder] },
    });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result).toEqual([
      {
        uuid: 'order-uuid-1',
        drugName: 'Metformin',
        dosage: '500 mg',
        frequency: '2x daily, with meals',
      },
    ]);
  });

  it('filters out voided orders', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockDrugOrder, mockVoidedOrder] },
    });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe('order-uuid-1');
  });

  it('filters out non-drug orders', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockDrugOrder, mockNonDrugOrder] },
    });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe('order-uuid-1');
  });

  it('returns dosage "N/A" when dose or doseUnits is missing', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockDrugOrderMissingDose] },
    });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result[0].dosage).toBe('N/A');
  });

  it('returns frequency "N/A" when frequency is missing', async () => {
    const orderWithoutFreq: Order = {
      uuid: 'order-uuid-5',
      orderType: { display: 'Drug Order' },
      drug: { display: 'Ibuprofen' },
      dose: 200,
      doseUnits: { display: 'mg' },
      dateActivated: '2026-01-01T00:00:00Z',
      voided: false,
    };
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [orderWithoutFreq] },
    });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result[0].frequency).toBe('N/A');
  });

  it('handles empty results', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { results: [] } });
    const result = await getActiveMedications('patient-uuid-1');
    expect(result).toEqual([]);
  });

  it('propagates apiClient errors', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(getActiveMedications('patient-uuid-1')).rejects.toThrow('Network Error');
  });
});

const mockAllergyResponse = {
  uuid: 'allergy-uuid-1',
  allergen: { display: 'Penicillin', allergenType: 'DRUG' },
  severity: { display: 'Severe' },
  reactions: [{ reaction: { display: 'Anaphylaxis' } }],
  comment: 'Patient carries EpiPen',
};

const mockAllergyNoSeverity = {
  uuid: 'allergy-uuid-2',
  allergen: { display: 'Sulfa drugs', allergenType: 'DRUG' },
  severity: null,
  reactions: [{ reaction: { display: 'Rash' } }],
};

const mockAllergyNullAllergen = {
  uuid: 'allergy-uuid-3',
  allergen: undefined,
  severity: { display: 'Moderate' },
  reactions: [],
};

describe('getAllergies', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls GET /patient/{uuid}/allergy', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { results: [] } });
    await getAllergies('patient-uuid-1');
    expect(apiClient.get).toHaveBeenCalledWith('/patient/patient-uuid-1/allergy');
  });

  it('transforms allergy responses to Allergy[]', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockAllergyResponse] },
    });
    const result = await getAllergies('patient-uuid-1');
    expect(result).toEqual([
      {
        uuid: 'allergy-uuid-1',
        allergenDisplay: 'Penicillin',
        allergenType: 'DRUG',
        severity: 'Severe',
        reactions: ['Anaphylaxis'],
        comment: 'Patient carries EpiPen',
      },
    ]);
  });

  it('handles null severity', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockAllergyNoSeverity] },
    });
    const result = await getAllergies('patient-uuid-1');
    expect(result[0].severity).toBeNull();
  });

  it('handles empty reactions', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockAllergyNullAllergen] },
    });
    const result = await getAllergies('patient-uuid-1');
    expect(result[0].reactions).toEqual([]);
  });

  it('falls back to Unknown allergen when allergen is null', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { results: [mockAllergyNullAllergen] },
    });
    const result = await getAllergies('patient-uuid-1');
    expect(result[0].allergenDisplay).toBe('Unknown allergen');
  });

  it('handles empty results', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { results: [] } });
    const result = await getAllergies('patient-uuid-1');
    expect(result).toEqual([]);
  });

  it('propagates apiClient errors', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(getAllergies('patient-uuid-1')).rejects.toThrow('Network Error');
  });
});
