import { describe, it, expect } from 'vitest';
import { splitIntoHours, minutesBetween } from './schedule';

describe('splitIntoHours', () => {
  it('returns empty for missing times', () => {
    expect(splitIntoHours('', '17:00')).toEqual([]);
    expect(splitIntoHours('09:00', '')).toEqual([]);
  });

  it('keeps a short span as one segment', () => {
    expect(splitIntoHours('09:00', '11:00')).toEqual([['09:00', '11:00']]);
  });

  it('splits a 4-hour morning-afternoon span at lunch and 2h cap', () => {
    // 08:00–16:00 → 08–10, 10–12, (lunch skipped), 13–15, 15–16
    expect(splitIntoHours('08:00', '16:00')).toEqual([
      ['08:00', '10:00'],
      ['10:00', '12:00'],
      ['13:00', '15:00'],
      ['15:00', '16:00'],
    ]);
  });

  it('cuts a span that would cross into lunch', () => {
    expect(splitIntoHours('11:00', '14:00')).toEqual([
      ['11:00', '12:00'],
      ['13:00', '14:00'],
    ]);
  });

  it('starts after lunch when begin falls inside the break', () => {
    expect(splitIntoHours('12:30', '15:00')).toEqual([
      ['13:00', '15:00'],
    ]);
  });

  it('handles an all-day span (10h worked)', () => {
    // 07:00–18:00 minus lunch = 10 hours → segments of ≤2h plus remainder
    const segments = splitIntoHours('07:00', '18:00');
    expect(segments).toEqual([
      ['07:00', '09:00'],
      ['09:00', '11:00'],
      ['11:00', '12:00'],
      ['13:00', '15:00'],
      ['15:00', '17:00'],
      ['17:00', '18:00'],
    ]);
  });

  it('never produces zero-length or inverted segments', () => {
    for (const [b, e] of splitIntoHours('06:00', '22:00')) {
      expect(b < e).toBe(true);
    }
  });

  it('splits into 30-minute segments when configured', () => {
    expect(splitIntoHours('09:00', '11:00', 30)).toEqual([
      ['09:00', '09:30'],
      ['09:30', '10:00'],
      ['10:00', '10:30'],
      ['10:30', '11:00'],
    ]);
  });

  it('splits into 1-hour segments when configured', () => {
    expect(splitIntoHours('09:00', '12:00', 60)).toEqual([
      ['09:00', '10:00'],
      ['10:00', '11:00'],
      ['11:00', '12:00'],
    ]);
  });

  it('splits into 3-hour segments when configured, cutting at lunch', () => {
    // 09:00–16:00: 09:00-12:00 (3h), lunch skipped (12-13), 13:00-16:00 (3h)
    expect(splitIntoHours('09:00', '16:00', 180)).toEqual([
      ['09:00', '12:00'],
      ['13:00', '16:00'],
    ]);
  });

  it('splits into 4-hour segments when configured', () => {
    // 08:00–12:00 is 4 hours
    expect(splitIntoHours('08:00', '12:00', 240)).toEqual([
      ['08:00', '12:00'],
    ]);
  });

  it('enforces maximum ceiling of 4 hours (240 minutes) even if higher value is passed', () => {
    // Passing 360m (6h): should be clamped to 240m (4h)
    // 08:00–17:00: 08:00-12:00 (4h), lunch skipped (12-13), 13:00-17:00 (4h)
    expect(splitIntoHours('08:00', '17:00', 360)).toEqual([
      ['08:00', '12:00'],
      ['13:00', '17:00'],
    ]);
  });
});

describe('minutesBetween', () => {
  it('computes positive duration', () => {
    expect(minutesBetween('09:00', '17:30')).toBe(510);
  });

  it('returns null for missing input', () => {
    expect(minutesBetween('', '')).toBeNull();
  });
});
