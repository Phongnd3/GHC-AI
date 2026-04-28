import { apiClient } from './client';
import type { Visit } from '@/types/visit';

export async function getActiveVisits(): Promise<Visit[]> {
  const response = await apiClient.get<{ results: Visit[] }>(
    '/visit?includeInactive=false&v=full'
  );
  return response.data.results;
}
