import { renderHook } from '@testing-library/react-native';
import {
  isActiveVisit,
  isDoctorPrimaryProvider,
  isValidPatient,
  resolveDisplayName,
  resolvePatientId,
  resolveAge,
  usePatients,
} from '../usePatients';
import type { Visit } from '@/types/visit';
import type { Patient } from '@/types/patient';

// Mock SWR
jest.mock('swr');
import useSWR from 'swr';

// Mock the patients service
jest.mock('@/services/api/patients');
import { getActiveVisits } from '@/services/api/patients';

// --- Test data ---

function makeVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    uuid: 'visit-uuid-1',
    display: 'Test Visit',
    patient: {
      uuid: 'patient-uuid-1',
      identifiers: [
        {
          uuid: 'id-uuid-1',
          identifier: 'MRN-001',
          identifierType: { uuid: 'type-uuid', display: 'OpenMRS ID' },
          preferred: true,
        },
      ],
      person: {
        uuid: 'person-uuid-1',
        names: [{ uuid: 'name-uuid-1', preferred: true, givenName: 'John', familyName: 'Doe' }],
        gender: 'M',
        birthdate: '1980-01-01',
        birthdateEstimated: false,
        dead: false,
        attributes: [],
        addresses: [],
      },
      voided: false,
    },
    visitType: { uuid: 'vt-uuid', display: 'Outpatient' },
    location: { uuid: 'loc-uuid', display: 'Ward A' },
    startDatetime: '2024-01-01T08:00:00',
    stopDatetime: null,
    encounters: [
      {
        uuid: 'enc-uuid-1',
        encounterDatetime: '2024-01-01T09:00:00',
        encounterType: { uuid: 'et-uuid', display: 'Consultation' },
        encounterProviders: [
          {
            uuid: 'ep-uuid-1',
            provider: { uuid: 'doctor-uuid', person: { uuid: 'person-uuid', display: 'Dr. Smith' } },
            encounterRole: { uuid: 'role-uuid', display: 'Attending' },
          },
        ],
        obs: [],
        orders: [],
        voided: false,
      },
    ],
    attributes: [],
    voided: false,
    ...overrides,
  };
}

// --- Filter helper tests ---

describe('isActiveVisit', () => {
  it('returns true when stopDatetime is null', () => {
    expect(isActiveVisit(makeVisit({ stopDatetime: null }))).toBe(true);
  });

  it('returns false when stopDatetime is a date string', () => {
    expect(isActiveVisit(makeVisit({ stopDatetime: '2024-01-02T12:00:00' }))).toBe(false);
  });
});

describe('isDoctorPrimaryProvider', () => {
  it('returns true when providerUuid matches an encounter provider', () => {
    expect(isDoctorPrimaryProvider(makeVisit(), 'doctor-uuid')).toBe(true);
  });

  it('returns false when providerUuid does not match any encounter provider', () => {
    expect(isDoctorPrimaryProvider(makeVisit(), 'other-doctor-uuid')).toBe(false);
  });

  it('returns false when visit has no encounters', () => {
    expect(isDoctorPrimaryProvider(makeVisit({ encounters: [] }), 'doctor-uuid')).toBe(false);
  });
});

describe('isValidPatient', () => {
  it('returns true for a non-voided, living patient', () => {
    expect(isValidPatient(makeVisit())).toBe(true);
  });

  it('returns false for a voided patient', () => {
    const visit = makeVisit();
    visit.patient.voided = true;
    expect(isValidPatient(visit)).toBe(false);
  });

  it('returns false for a deceased patient', () => {
    const visit = makeVisit();
    visit.patient.person.dead = true;
    expect(isValidPatient(visit)).toBe(false);
  });
});

// --- Data derivation helper tests ---

const makePatient = (overrides?: Partial<Patient['person']>): Patient => ({
  uuid: 'patient-uuid-1',
  identifiers: [
    {
      uuid: 'id-uuid-1',
      identifier: 'MRN-001',
      identifierType: { uuid: 'type-uuid', display: 'OpenMRS ID' },
      preferred: true,
    },
  ],
  person: {
    uuid: 'person-uuid-1',
    names: [{ uuid: 'name-uuid-1', preferred: true, givenName: 'John', familyName: 'Doe' }],
    gender: 'M',
    birthdate: '1980-01-01',
    birthdateEstimated: false,
    dead: false,
    attributes: [],
    addresses: [],
    ...overrides,
  },
  voided: false,
});

describe('resolveDisplayName', () => {
  it('returns preferred name as givenName + familyName', () => {
    expect(resolveDisplayName(makePatient())).toBe('John Doe');
  });

  it('falls back to first name when no preferred name', () => {
    const patient = makePatient();
    patient.person.names = [
      { uuid: 'n1', preferred: false, givenName: 'Jane', familyName: 'Smith' },
    ];
    expect(resolveDisplayName(patient)).toBe('Jane Smith');
  });

  it('returns "Unknown Patient" when names array is empty', () => {
    const patient = makePatient();
    patient.person.names = [];
    expect(resolveDisplayName(patient)).toBe('Unknown Patient');
  });
});

describe('resolvePatientId', () => {
  it('returns preferred identifier', () => {
    expect(resolvePatientId(makePatient())).toBe('MRN-001');
  });

  it('falls back to first identifier when none preferred', () => {
    const patient = makePatient();
    patient.identifiers[0].preferred = false;
    expect(resolvePatientId(patient)).toBe('MRN-001');
  });

  it('returns "N/A" when no identifiers', () => {
    const patient = makePatient();
    patient.identifiers = [];
    expect(resolvePatientId(patient)).toBe('N/A');
  });
});

describe('resolveAge', () => {
  it('returns age as "Xy" for exact birthdate', () => {
    const person = makePatient().person;
    const result = resolveAge(person);
    expect(result).toMatch(/^\d+y$/);
  });

  it('returns "~Xy" for estimated birthdate', () => {
    const person = makePatient({ birthdateEstimated: true }).person;
    const result = resolveAge(person);
    expect(result).toMatch(/^~\d+y$/);
  });

  it('returns "Unknown" when no birthdate', () => {
    const person = makePatient({ birthdate: '' }).person;
    expect(resolveAge(person)).toBe('Unknown');
  });
});

// --- usePatients hook tests ---

describe('usePatients', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty patients and isLoading=true when SWR has no data yet', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.patients).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('passes null SWR key when providerUuid is null', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    renderHook(() => usePatients(null));

    const [key] = (useSWR as jest.Mock).mock.calls[0];
    expect(key).toBeNull();
  });

  it('returns isLoading=false when providerUuid is null (SWR disabled)', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients(null));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.patients).toHaveLength(0);
  });

  it('returns filtered patients matching providerUuid', () => {
    const visit = makeVisit();
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.patients).toHaveLength(1);
    expect(result.current.patients[0].patientUuid).toBe('patient-uuid-1');
    expect(result.current.patients[0].displayName).toBe('John Doe');
    expect(result.current.patients[0].patientId).toBe('MRN-001');
    expect(result.current.patients[0].ward).toBe('Ward A');
    expect(result.current.isLoading).toBe(false);
  });

  it('excludes visits where doctor is not a provider', () => {
    const visit = makeVisit();
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('different-doctor-uuid'));

    expect(result.current.patients).toHaveLength(0);
  });

  it('excludes closed visits', () => {
    const visit = makeVisit({ stopDatetime: '2024-01-02T12:00:00' });
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.patients).toHaveLength(0);
  });

  it('excludes voided patients', () => {
    const visit = makeVisit();
    visit.patient.voided = true;
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.patients).toHaveLength(0);
  });

  it('returns error state', () => {
    const networkError = new Error('Network Error');
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: networkError,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.error).toBe(networkError);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isRefreshing=true when SWR is validating with existing data', () => {
    const visit = makeVisit();
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: true,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isRefreshing=false when data is undefined (initial load)', () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: true,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns isRefreshing=false when isValidating=false', () => {
    const visit = makeVisit();
    (useSWR as jest.Mock).mockReturnValue({
      data: [visit],
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => usePatients('doctor-uuid'));

    expect(result.current.isRefreshing).toBe(false);
  });
});
