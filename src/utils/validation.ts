import type { BulkRow } from '../types';
import { nowJakarta } from './time';
import { minutesBetween } from './schedule';
import { DEFAULT_MAX_ACTIVITY_MINUTES, ABSOLUTE_MAX_ACTIVITY_MINUTES } from '../context/SettingsContext';

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

/**
 * Validates that an activity duration does not exceed the allowed maximum duration (capped at 4 hours).
 * Returns an error string if invalid, or null if valid.
 */
export function validateActivityDuration(
  begin: string,
  end: string,
  maxMinutes: number = DEFAULT_MAX_ACTIVITY_MINUTES
): string | null {
  const duration = minutesBetween(begin, end);
  if (duration === null) return null;

  // Enforce absolute maximum of 4 hours
  const enforcedLimit = Math.min(Math.max(1, maxMinutes), ABSOLUTE_MAX_ACTIVITY_MINUTES);

  if (duration > enforcedLimit) {
    const label =
      enforcedLimit === 30
        ? '30 minutes'
        : `${enforcedLimit / 60} hour${enforcedLimit / 60 > 1 ? 's' : ''}`;
    return `Activity duration cannot exceed ${label}`;
  }
  return null;
}
