import { apiFetch } from './client';
import type { Project } from '../types';

export async function getProjects(customerId: number): Promise<Project[]> {
  return apiFetch<Project[]>(`/projects?customer=${customerId}&visible=1&size=500`);
}

export async function getAllProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects?visible=1&size=500');
}
