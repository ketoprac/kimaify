import type { BulkRow } from '../types';

export interface RowErrors {
  begin?: string;
  end?: string;
  customerId?: string;
  projectId?: string;
  activityId?: string;
}

export function validateRow(row: BulkRow, dateStr: string): RowErrors {
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // "2026-08-12"

  const errors: RowErrors = {};
  if (!row.begin.trim()) errors.begin = 'Required';
  if (!row.end.trim()) errors.end = 'Required';

  if (row.begin && row.end) {
    if (row.begin >= row.end) {
      errors.end = 'End must be after start';
    }
  }

  // Future check: only for today's date
  if (row.begin && dateStr === today) {
    const [bh, bm] = row.begin.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const beginMins = bh * 60 + bm;
    if (beginMins > nowMins) {
      errors.begin = "Can't create future activity";
    }
  }

  if (row.customerId === null) errors.customerId = 'Required';
  if (row.projectId === null) errors.projectId = 'Required';
  if (row.activityId === null) errors.activityId = 'Required';
  return errors;
}

export function hasErrors(errors: RowErrors): boolean {
  return Object.keys(errors).length > 0;
}
