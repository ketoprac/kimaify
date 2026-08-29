import { format, parse } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Jakarta';
// Fixed offset string for Asia/Jakarta (WIB). Jakarta observes no DST,
// so the offset is constant — safe to embed directly in ISO strings.
const TZ_OFFSET = '+07:00';

export function todayDateStr(): string {
  return format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd');
}

/** Current wall-clock time in Jakarta: { date: "2026-08-24", minutes: 543 }. */
export function nowJakarta(): { date: string; minutes: number } {
  const zoned = new Date(toZonedTime(new Date(), TIMEZONE));
  return {
    date: format(zoned, 'yyyy-MM-dd'),
    minutes: zoned.getHours() * 60 + zoned.getMinutes(),
  };
}

/**
 * Build a Kimai-ready ISO datetime from wall-clock fields, pinned to the
 * Jakarta (+07:00) offset. Deliberately avoids Date round-trips: parsing
 * through `new Date()` would interpret the input in the browser's timezone
 * and silently shift entries for users outside UTC+7.
 */
export function toISOWithTZ(dateStr: string, timeStr: string): string {
  // dateStr: "2026-08-12", timeStr: "09:00"
  return `${dateStr}T${timeStr}:00${TZ_OFFSET}`;
}

export function formatTime(isoStr: string): string {
  return format(toZonedTime(new Date(isoStr), TIMEZONE), 'HH:mm');
}

export function formatDate(isoStr: string): string {
  return format(toZonedTime(new Date(isoStr), TIMEZONE), 'EEE, dd MMM yyyy');
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// Kept for callers that need a real instant from wall-clock Jakarta time
// (e.g. comparing against server timestamps).
export function jakartaToInstant(dateStr: string, timeStr: string): Date {
  return fromZonedTime(parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date()), TIMEZONE);
}
