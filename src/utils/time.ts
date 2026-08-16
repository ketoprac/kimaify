import { format, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Jakarta';

export function todayDateStr(): string {
  return format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd');
}

export function toISOWithTZ(dateStr: string, timeStr: string): string {
  // dateStr: "2026-08-12", timeStr: "09:00"
  const local = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
  return format(toZonedTime(local, TIMEZONE), "yyyy-MM-dd'T'HH:mm:ssXX");
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
