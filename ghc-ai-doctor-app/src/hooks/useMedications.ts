import useSWR from 'swr';
import { getActiveMedications } from '@/services/api/clinical';
import type { Medication } from '@/types/clinical';

interface UseMedicationsResult {
  medications: Medication[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useMedications(patientUuid: string | null): UseMedicationsResult {
  const { data, error, isValidating, mutate } = useSWR(
    patientUuid ? `/order?patient=${patientUuid}&careSetting=OUTPATIENT&status=ACTIVE` : null,
    () => getActiveMedications(patientUuid!),
    { dedupingInterval: 0, revalidateOnFocus: true }
  );

  const isLoading = patientUuid !== null && !data && !error && isValidating;

  return { medications: data, isLoading, error, mutate };
}
