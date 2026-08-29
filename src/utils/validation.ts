import type { BulkRow } from '../types';
import { nowJakarta } from './time';

export interface RowErrors {
  begin?: string;
  end?: string;
  customerId?: string;
  projectId?: string;
  activityId?: string;
  date?: string;
}

export const MAX_LOOKBACK_DAYS = 31;

const jakartaDateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // en-CA yields "yyyy-MM-dd"

/** Today minus N days, as a Jakarta "yyyy-MM-dd" string. */
export function lookbackFloor(days: number = MAX_LOOKBACK_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return jakartaDateFmt.format(d);
}

export function validateRow(row: BulkRow, dateStr: string): RowErrors {
  const now = nowJakarta();

  const errors: RowErrors = {};
  if (!row.begin.trim()) errors.begin = 'Required';
  if (!row.end.trim()) errors.end = 'Required';

  if (row.begin && row.end) {
    if (row.begin >= row.end) {
      errors.end = 'End must be after start';
    }
  }

  // Look-back window: block backfilling older than the allowed period
  if (dateStr < lookbackFloor()) {
    errors.date = `Date is more than ${MAX_LOOKBACK_DAYS} days in the past`;
  }

  // Future check: only for today's date (all times in Jakarta clock)
  if (row.begin && dateStr === now.date) {
    if (Number(row.begin.slice(0, 2)) * 60 + Number(row.begin.slice(3, 5)) > now.minutes) {
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

export function isWeekend(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday / Saturday
}
