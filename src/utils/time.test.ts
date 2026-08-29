import { describe, it, expect } from 'vitest';
import { toISOWithTZ, nowJakarta, todayDateStr, TIMEZONE } from './time';

describe('toISOWithTZ', () => {
  // These assertions must hold regardless of the host machine's timezone.
  // Run with TZ=Pacific/Auckland to prove it (see package.json test script).
  it('pins wall-clock time to Jakarta offset', () => {
    expect(toISOWithTZ('2026-08-24', '09:00')).toBe('2026-08-24T09:00:00+07:00');
    expect(toISOWithTZ('2026-08-24', '17:30')).toBe('2026-08-24T17:30:00+07:00');
  });

  it('keeps midnight spans on the requested calendar day', () => {
    expect(toISOWithTZ('2026-01-01', '00:00')).toBe('2026-01-01T00:00:00+07:00');
    expect(toISOWithTZ('2026-12-31', '23:59')).toBe('2026-12-31T23:59:00+07:00');
  });
});

describe('nowJakarta / todayDateStr', () => {
  it('returns date and minutes on the same clock', () => {
    const now = nowJakarta();
    expect(now.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(now.minutes).toBeGreaterThanOrEqual(0);
    expect(now.minutes).toBeLessThan(24 * 60);
  });

  it('todayDateStr matches nowJakarta date', () => {
    expect(todayDateStr()).toBe(nowJakarta().date);
  });

  it('exposes the expected timezone constant', () => {
    expect(TIMEZONE).toBe('Asia/Jakarta');
  });
});
