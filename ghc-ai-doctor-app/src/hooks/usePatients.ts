import { useState, useEffect, useRef } from 'react';
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

export function isCreatedByUser(visit: Visit, userUuid: string): boolean {
  return visit.auditInfo?.creator?.uuid === userUuid;
}

export function isValidPatient(visit: Visit): boolean {
  return !visit.patient.voided && !visit.patient.person?.dead;
}

// --- Data derivation helpers (exported for testability) ---

export function resolveDisplayName(patient: Patient): string {
  if (!patient.person?.names || patient.person.names.length === 0) {
    return 'Unknown Patient';
  }
  const preferred = patient.person.names.find((n) => n.preferred);
  const name = preferred ?? patient.person.names[0];
  if (!name) return 'Unknown Patient';
  return [name.givenName, name.familyName].filter(Boolean).join(' ');
}

export function resolvePatientId(patient: Patient): string {
  if (!patient.identifiers || patient.identifiers.length === 0) {
    return 'N/A';
  }
  const preferred = patient.identifiers.find((i) => i.preferred);
  return preferred?.identifier ?? patient.identifiers[0]?.identifier ?? 'N/A';
}

export function resolveAge(person: Patient['person']): string {
  if (!person?.birthdate) return 'Unknown';
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

export function usePatients(userUuid: string | null): UsePatientsResult {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const wasValidating = useRef(false);

  const { data, error, isValidating, mutate } = useSWR(
    userUuid ? SWR_KEY : null,
    () => getActiveVisits(),
    { dedupingInterval: 300000, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (wasValidating.current && !isValidating && data) {
      setLastUpdatedAt(new Date());
    }
    wasValidating.current = isValidating;
  }, [data, isValidating]);

  const patients: FilteredPatientData[] =
    data && Array.isArray(data) && userUuid
      ? data
          .filter(
            (visit) =>
              isActiveVisit(visit) && isCreatedByUser(visit, userUuid) && isValidPatient(visit)
          )
          .map((visit) => ({
            patientUuid: visit.patient.uuid,
            displayName: resolveDisplayName(visit.patient),
            patientId: resolvePatientId(visit.patient),
            age: resolveAge(visit.patient.person),
            gender: visit.patient.person?.gender ?? 'Unknown',
            ward: visit.location?.display ?? null,
            visitUuid: visit.uuid,
          }))
      : [];

  const isLoading = userUuid !== null && !data && !error;
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
