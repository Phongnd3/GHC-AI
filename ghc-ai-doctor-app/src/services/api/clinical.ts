import { apiClient } from './client';
import { resolveDisplayName, resolvePatientId, resolveAge } from '@/hooks/usePatients';
import type { Patient, PatientDemographics } from '@/types/patient';
import type { Order } from '@/types/visit';
import type { Medication } from '@/types/clinical';

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

export async function getActiveMedications(patientUuid: string): Promise<Medication[]> {
  const response = await apiClient.get<{ results: Order[] }>('/order', {
    params: { patient: patientUuid, careSetting: 'OUTPATIENT', status: 'ACTIVE', v: 'full' },
  });

  return (response.data.results ?? [])
    .filter((order) => !order.voided)
    .filter((order) => order.orderType?.display?.toLowerCase().includes('drug'))
    .filter((order) => order.drug)
    .map((order) => ({
      uuid: order.uuid,
      drugName: order.drug!.display,
      dosage:
        order.dose != null && order.doseUnits ? `${order.dose} ${order.doseUnits.display}` : 'N/A',
      frequency: order.frequency?.display ?? 'N/A',
    }));
}
