import { apiClient } from './client';
import type { Visit } from '@/types/visit';

export async function getActiveVisits(): Promise<Visit[]> {
  const response = await apiClient.get<{ results: Visit[] }>(
    '/visit?includeInactive=false&v=custom:(uuid,display,patient:(uuid,display,identifiers,person:(uuid,names,gender,birthdate,birthdateEstimated,dead),voided),visitType,location,startDatetime,stopDatetime,encounters,attributes,voided,auditInfo)'
  );
  return response.data.results || [];
}
