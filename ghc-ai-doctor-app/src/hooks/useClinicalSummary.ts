import useSWR from 'swr';
import { getPatientDemographics } from '@/services/api/clinical';
import type { PatientDemographics } from '@/types/patient';

interface UseClinicalSummaryResult {
  demographics: PatientDemographics | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useClinicalSummary(patientUuid: string | null): UseClinicalSummaryResult {
  const { data, error, isValidating, mutate } = useSWR(
    patientUuid ? `/patient/${patientUuid}?v=full` : null,
    () => getPatientDemographics(patientUuid!),
    { dedupingInterval: 0, revalidateOnFocus: true }
  );

  const isLoading = patientUuid !== null && !data && !error && isValidating;

  return {
    demographics: data,
    isLoading,
    error,
    mutate,
  };
}
