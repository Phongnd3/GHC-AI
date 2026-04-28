import { renderHook, waitFor } from '@testing-library/react-native';
import { useClinicalSummary } from '../useClinicalSummary';
import { getPatientDemographics } from '@/services/api/clinical';
import type { PatientDemographics } from '@/types/patient';

jest.mock('@/services/api/clinical', () => ({
  getPatientDemographics: jest.fn(),
}));

const mockDemographics: PatientDemographics = {
  displayName: 'John Smith',
  patientId: '10002AB',
  age: '45y',
  gender: 'M',
};

describe('useClinicalSummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null SWR key (no fetch) when patientUuid is null', () => {
    (getPatientDemographics as jest.Mock).mockResolvedValue(mockDemographics);
    const { result } = renderHook(() => useClinicalSummary(null));
    expect(getPatientDemographics).not.toHaveBeenCalled();
    expect(result.current.demographics).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns demographics, isLoading, error, mutate', async () => {
    (getPatientDemographics as jest.Mock).mockResolvedValue(mockDemographics);
    const { result } = renderHook(() => useClinicalSummary('patient-uuid-1'));

    await waitFor(() => {
      expect(result.current.demographics).toEqual(mockDemographics);
    });

    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('returns error when fetch fails', async () => {
    const err = new Error('Network Error');
    (getPatientDemographics as jest.Mock).mockRejectedValue(err);
    const { result } = renderHook(() => useClinicalSummary('patient-uuid-2'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
