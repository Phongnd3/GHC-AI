import { renderHook, waitFor } from '@testing-library/react-native';
import { useAllergies } from '../useAllergies';
import { getAllergies } from '@/services/api/clinical';
import type { Allergy } from '@/types/clinical';

jest.mock('@/services/api/clinical', () => ({
  getAllergies: jest.fn(),
}));

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

describe('useAllergies', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null SWR key (no fetch) when patientUuid is null', () => {
    (getAllergies as jest.Mock).mockResolvedValue(mockAllergies);
    const { result } = renderHook(() => useAllergies(null));
    expect(getAllergies).not.toHaveBeenCalled();
    expect(result.current.allergies).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns allergies, isLoading, error, mutate', async () => {
    (getAllergies as jest.Mock).mockResolvedValue(mockAllergies);
    const { result } = renderHook(() => useAllergies('patient-uuid-1'));

    await waitFor(() => {
      expect(result.current.allergies).toEqual(mockAllergies);
    });

    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('returns error when fetch fails', async () => {
    const err = new Error('Network Error');
    (getAllergies as jest.Mock).mockRejectedValue(err);
    const { result } = renderHook(() => useAllergies('patient-uuid-2'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('returns empty array when patient has no allergies', async () => {
    (getAllergies as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useAllergies('patient-uuid-3'));

    await waitFor(() => {
      expect(result.current.allergies).toEqual([]);
    });
  });
});
