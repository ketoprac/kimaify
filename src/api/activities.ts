import { apiFetch } from './client';
import type { Activity } from '../types';

export async function getActivities(): Promise<Activity[]> {
  return apiFetch<Activity[]>('/activities?visible=1&size=500');
}

export async function updateActivity(id: number, patch: Partial<Activity>): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
