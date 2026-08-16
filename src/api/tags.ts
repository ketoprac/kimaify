import { apiFetch } from './client';

export async function getTags(): Promise<string[]> {
  return apiFetch<string[]>('/tags');
}
