import { renderHook, waitFor } from '@testing-library/react-native';
import { useMedications } from '../useMedications';
import { getActiveMedications } from '@/services/api/clinical';
import type { Medication } from '@/types/clinical';

jest.mock('@/services/api/clinical', () => ({
  getActiveMedications: jest.fn(),
}));

const mockMedications: Medication[] = [
  { uuid: 'med-1', drugName: 'Metformin', dosage: '500 mg', frequency: '2x daily' },
  { uuid: 'med-2', drugName: 'Lisinopril', dosage: '10 mg', frequency: '1x daily' },
];

describe('useMedications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null SWR key (no fetch) when patientUuid is null', () => {
    (getActiveMedications as jest.Mock).mockResolvedValue(mockMedications);
    const { result } = renderHook(() => useMedications(null));
    expect(getActiveMedications).not.toHaveBeenCalled();
    expect(result.current.medications).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns medications, isLoading, error, mutate', async () => {
    (getActiveMedications as jest.Mock).mockResolvedValue(mockMedications);
    const { result } = renderHook(() => useMedications('patient-uuid-1'));

    await waitFor(() => {
      expect(result.current.medications).toEqual(mockMedications);
    });

    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('returns error when fetch fails', async () => {
    const err = new Error('Network Error');
    (getActiveMedications as jest.Mock).mockRejectedValue(err);
    const { result } = renderHook(() => useMedications('patient-uuid-2'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('returns empty array when patient has no medications', async () => {
    (getActiveMedications as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useMedications('patient-uuid-3'));

    await waitFor(() => {
      expect(result.current.medications).toEqual([]);
    });
  });
});
