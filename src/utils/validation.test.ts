import { describe, it, expect } from 'vitest';
import {
  validateRow,
  validateActivityDuration,
  hasErrors,
  isWeekend,
  lookbackFloor,
  MAX_LOOKBACK_DAYS,
} from './validation';
import type { BulkRow } from '../types';

function makeRow(overrides: Partial<BulkRow> = {}): BulkRow {
  return {
    id: 'test-row',
    begin: '09:00',
    end: '17:00',
    customerId: 1,
    projectId: 2,
    activityId: 3,
    description: '',
    tags: '',
    status: undefined,
    errorMessage: undefined,
    ...overrides,
  };
}

describe('validateRow', () => {
  it('passes a complete valid row on a recent date', () => {
    const date = shiftDate(lookbackFloor(), 1); // one day newer than the floor
    const errors = validateRow(makeRow(), date);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('rejects begin >= end', () => {
    const errors = validateRow(makeRow({ begin: '17:00', end: '09:00' }), '2020-01-15');
    expect(errors.end).toBe('End must be after start');
  });

  it('rejects equal begin and end', () => {
    const errors = validateRow(makeRow({ begin: '09:00', end: '09:00' }), '2020-01-15');
    expect(errors.end).toBe('End must be after start');
  });

  it('requires required fields', () => {
    const errors = validateRow(
      makeRow({ begin: '', end: '', customerId: null, projectId: null, activityId: null }),
      '2020-01-15',
    );
    expect(errors.begin).toBe('Required');
    expect(errors.end).toBe('Required');
    expect(errors.customerId).toBe('Required');
    expect(errors.projectId).toBe('Required');
    expect(errors.activityId).toBe('Required');
  });

  it('blocks dates older than the look-back window', () => {
    const tooOld = shiftDate(lookbackFloor(), -1); // one day older than floor
    const errors = validateRow(makeRow(), tooOld);
    expect(errors.date).toMatch(new RegExp(`${MAX_LOOKBACK_DAYS} days`));
  });

  it('allows dates at the look-back boundary or newer', () => {
    expect(validateRow(makeRow(), lookbackFloor()).date).toBeUndefined();
    expect(validateRow(makeRow(), '2099-01-01').date).toBeUndefined();
  });

  it('blocks future times for today (Jakarta clock)', () => {
    const { date: today, minutes } = nowJakarta();
    const futureMins = minutes + 60;
    if (futureMins >= 24 * 60) return; // skip near-midnight to avoid day rollover
    const errors = validateRow(makeRow({ begin: hhmm(futureMins) }), today);
    expect(errors.begin).toBe("Can't create future activity");
  });

  it('allows past times today', () => {
    const { date: today, minutes } = nowJakarta();
    if (minutes < 90) return; // not enough elapsed time to test safely
    const past = minutes - 90;
    const errors = validateRow(
      makeRow({ begin: hhmm(past), end: hhmm(past + 30) }),
      today,
    );
    expect(errors.begin).toBeUndefined();
  });
});

describe('isWeekend', () => {
  it('identifies Saturday and Sunday', () => {
    expect(isWeekend(6)).toBe(true);
    expect(isWeekend(0)).toBe(true);
    expect(isWeekend(1)).toBe(false);
    expect(isWeekend(5)).toBe(false);
  });
});

describe('validateActivityDuration', () => {
  it('passes when duration is equal to or less than default 2 hours', () => {
    expect(validateActivityDuration('09:00', '11:00')).toBeNull();
    expect(validateActivityDuration('09:00', '10:30')).toBeNull();
  });

  it('rejects when duration exceeds default 2 hours', () => {
    expect(validateActivityDuration('09:00', '11:30')).toBe('Activity duration cannot exceed 2 hours');
  });

  it('validates 30 minutes limit', () => {
    expect(validateActivityDuration('09:00', '09:30', 30)).toBeNull();
    expect(validateActivityDuration('09:00', '09:45', 30)).toBe('Activity duration cannot exceed 30 minutes');
  });

  it('validates 1 hour limit', () => {
    expect(validateActivityDuration('09:00', '10:00', 60)).toBeNull();
    expect(validateActivityDuration('09:00', '10:15', 60)).toBe('Activity duration cannot exceed 1 hour');
  });

  it('validates 3 hours limit', () => {
    expect(validateActivityDuration('09:00', '12:00', 180)).toBeNull();
    expect(validateActivityDuration('09:00', '12:30', 180)).toBe('Activity duration cannot exceed 3 hours');
  });

  it('validates 4 hours limit', () => {
    expect(validateActivityDuration('08:00', '12:00', 240)).toBeNull();
    expect(validateActivityDuration('08:00', '12:30', 240)).toBe('Activity duration cannot exceed 4 hours');
  });

  it('enforces maximum 4-hour limit even if a larger limit is configured', () => {
    // Passing 300 minutes (5 hours) is capped at 240 minutes (4 hours)
    expect(validateActivityDuration('08:00', '12:00', 300)).toBeNull();
    expect(validateActivityDuration('08:00', '12:30', 300)).toBe('Activity duration cannot exceed 4 hours');
  });

  it('returns null if begin or end is missing', () => {
    expect(validateActivityDuration('', '10:00')).toBeNull();
    expect(validateActivityDuration('09:00', '')).toBeNull();
  });
});

// --- helpers ---

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function hhmm(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

// The validation module uses Asia/Jakarta internally; derive "today" through
// the same path so assertions don't depend on host TZ.
function nowJakarta(): { date: string; minutes: number } {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // en-CA yields "yyyy-MM-dd"
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now); // "HH:mm"
  const [h, m] = time.split(':').map(Number);
  return { date, minutes: h * 60 + m };
}
