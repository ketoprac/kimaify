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
});

describe('minutesBetween', () => {
  it('computes positive duration', () => {
    expect(minutesBetween('09:00', '17:30')).toBe(510);
  });

  it('returns null for missing input', () => {
    expect(minutesBetween('', '')).toBeNull();
  });
});
