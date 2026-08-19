import { apiFetch } from './client';
import type { Timesheet, CreateTimesheetPayload, UpdateTimesheetPayload } from '../types';

export async function getTimesheets(): Promise<Timesheet[]> {
  return apiFetch<Timesheet[]>('/timesheets?size=100');
}

export async function createTimesheet(payload: CreateTimesheetPayload): Promise<Timesheet> {
  return apiFetch<Timesheet>('/timesheets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTimesheet(id: number, payload: UpdateTimesheetPayload): Promise<Timesheet> {
  return apiFetch<Timesheet>(`/timesheets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTimesheet(id: number): Promise<void> {
  return apiFetch<void>(`/timesheets/${id}`, {
    method: 'DELETE',
  });
}
