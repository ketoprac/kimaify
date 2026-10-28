import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  getInitialMaxDuration,
  SETTINGS_STORAGE_KEY,
  DEFAULT_MAX_ACTIVITY_MINUTES,
  ABSOLUTE_MAX_ACTIVITY_MINUTES,
  ACTIVITY_DURATION_OPTIONS,
} from './SettingsContext';

describe('SettingsContext logic', () => {
  const store = new Map<string, string>();
  const originalLocalStorage = globalThis.localStorage;

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, String(val));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    store.clear();
  });

  describe('getInitialMaxDuration', () => {
    it('returns default 120 minutes (2 hours) when localStorage is empty', () => {
      expect(getInitialMaxDuration()).toBe(DEFAULT_MAX_ACTIVITY_MINUTES);
      expect(DEFAULT_MAX_ACTIVITY_MINUTES).toBe(120);
    });

    it('returns valid stored options from localStorage', () => {
      for (const opt of ACTIVITY_DURATION_OPTIONS) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, String(opt.value));
        expect(getInitialMaxDuration()).toBe(opt.value);
      }
    });

    it('falls back to default 120 if stored value is not a recognized option', () => {
      localStorage.setItem(SETTINGS_STORAGE_KEY, '45');
      expect(getInitialMaxDuration()).toBe(DEFAULT_MAX_ACTIVITY_MINUTES);

      localStorage.setItem(SETTINGS_STORAGE_KEY, 'not-a-number');
      expect(getInitialMaxDuration()).toBe(DEFAULT_MAX_ACTIVITY_MINUTES);
    });

    it('enforces maximum ceiling of 4 hours (240 minutes) if stored value exceeds 240', () => {
      localStorage.setItem(SETTINGS_STORAGE_KEY, '300');
      // 300 clamped to 240 is 240 (which is a valid option)
      expect(getInitialMaxDuration()).toBe(ABSOLUTE_MAX_ACTIVITY_MINUTES);
      expect(ABSOLUTE_MAX_ACTIVITY_MINUTES).toBe(240);
    });
  });

  describe('options structure', () => {
    it('provides the 5 required selectable options', () => {
      expect(ACTIVITY_DURATION_OPTIONS.map((o) => o.value)).toEqual([30, 60, 120, 180, 240]);
      expect(ACTIVITY_DURATION_OPTIONS.map((o) => o.label)).toEqual([
        '30 minutes',
        '1 hour',
        '2 hours',
        '3 hours',
        '4 hours',
      ]);
    });

    it('highlights default and maximum limit with badges', () => {
      const defaultOpt = ACTIVITY_DURATION_OPTIONS.find((o) => o.value === 120);
      expect(defaultOpt?.badge).toBe('Default');

      const maxOpt = ACTIVITY_DURATION_OPTIONS.find((o) => o.value === 240);
      expect(maxOpt?.badge).toBe('Max limit');
    });
  });
});
