import useSWR from 'swr';
import { getAllergies } from '@/services/api/clinical';
import type { Allergy } from '@/types/clinical';

interface UseAllergiesResult {
  allergies: Allergy[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useAllergies(patientUuid: string | null): UseAllergiesResult {
  const { data, error, isValidating, mutate } = useSWR(
    patientUuid ? `/patient/${patientUuid}/allergy` : null,
    () => getAllergies(patientUuid!),
    { dedupingInterval: 0, revalidateOnFocus: true }
  );

  const isLoading = patientUuid !== null && !data && !error && isValidating;

  return { allergies: data, isLoading, error, mutate };
}
