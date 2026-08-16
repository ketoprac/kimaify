import { apiFetch } from './client';
import type { Timesheet, CreateTimesheetPayload } from '../types';

export async function getTimesheets(): Promise<Timesheet[]> {
  return apiFetch<Timesheet[]>('/timesheets?size=100');
}

export async function createTimesheet(payload: CreateTimesheetPayload): Promise<Timesheet> {
  return apiFetch<Timesheet>('/timesheets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
