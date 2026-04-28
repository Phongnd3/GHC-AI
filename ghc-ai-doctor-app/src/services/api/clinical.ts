import { apiClient } from './client';
import { resolveDisplayName, resolvePatientId, resolveAge } from '@/hooks/usePatients';
import type { Patient, PatientDemographics } from '@/types/patient';

export async function getPatientDemographics(patientUuid: string): Promise<PatientDemographics> {
  const response = await apiClient.get<Patient>(`/patient/${patientUuid}?v=full`);
  const patient = response.data;
  return {
    displayName: resolveDisplayName(patient),
    patientId: resolvePatientId(patient),
    age: resolveAge(patient.person),
    gender: patient.person?.gender ?? 'Unknown',
  };
}
