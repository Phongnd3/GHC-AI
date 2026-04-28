import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { differenceInYears } from 'date-fns';
import { getActiveVisits } from '@/services/api/patients';
import type { Visit } from '@/types/visit';
import type { Patient } from '@/types/patient';
import type { FilteredPatientData } from '@/types/patient';

// --- Filter helpers (exported for testability) ---

export function isActiveVisit(visit: Visit): boolean {
  return visit.stopDatetime === null;
}

export function isDoctorPrimaryProvider(visit: Visit, providerUuid: string): boolean {
  return visit.encounters.some(enc =>
    enc.encounterProviders.some(ep => ep.provider.uuid === providerUuid)
  );
}

export function isValidPatient(visit: Visit): boolean {
  return !visit.patient.voided && !visit.patient.person?.dead;
}

// --- Data derivation helpers (exported for testability) ---

export function resolveDisplayName(patient: Patient): string {
  const preferred = patient.person.names.find(n => n.preferred);
  const name = preferred ?? patient.person.names[0];
  if (!name) return 'Unknown Patient';
  return [name.givenName, name.familyName].filter(Boolean).join(' ');
}

export function resolvePatientId(patient: Patient): string {
  const preferred = patient.identifiers.find(i => i.preferred);
  return preferred?.identifier ?? patient.identifiers[0]?.identifier ?? 'N/A';
}

export function resolveAge(person: Patient['person']): string {
  if (!person.birthdate) return 'Unknown';
  const years = differenceInYears(new Date(), new Date(person.birthdate));
  return person.birthdateEstimated ? `~${years}y` : `${years}y`;
}

// --- Hook ---

const SWR_KEY = '/visit?includeInactive=false&v=full';

interface UsePatientsResult {
  patients: FilteredPatientData[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: unknown;
  mutate: () => void;
  lastUpdatedAt: Date | null;
}

export function usePatients(providerUuid: string | null): UsePatientsResult {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const { data, error, isValidating, mutate } = useSWR(
    providerUuid ? SWR_KEY : null,
    () => getActiveVisits(),
    { dedupingInterval: 300000, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (data && !isValidating) {
      setLastUpdatedAt(new Date());
    }
  }, [data, isValidating]);

  const patients: FilteredPatientData[] =
    data && providerUuid
      ? data
          .filter(
            visit =>
              isActiveVisit(visit) &&
              isDoctorPrimaryProvider(visit, providerUuid) &&
              isValidPatient(visit)
          )
          .map(visit => ({
            patientUuid: visit.patient.uuid,
            displayName: resolveDisplayName(visit.patient),
            patientId: resolvePatientId(visit.patient),
            age: resolveAge(visit.patient.person),
            gender: visit.patient.person.gender,
            ward: visit.location?.display ?? null,
            visitUuid: visit.uuid,
          }))
      : [];

  const isLoading = providerUuid !== null && !data && !error;
  const isRefreshing = data !== undefined && isValidating;

  return {
    patients,
    isLoading,
    isRefreshing,
    error,
    mutate,
    lastUpdatedAt,
  };
}
