import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

export interface DurationOption {
  value: number; // in minutes
  label: string;
  badge?: string;
  hint?: string;
}

export const SETTINGS_STORAGE_KEY = 'kimaify_max_activity_duration_minutes';
export const DEFAULT_MAX_ACTIVITY_MINUTES = 120; // 2 hours
export const ABSOLUTE_MAX_ACTIVITY_MINUTES = 240; // 4 hours

export const ACTIVITY_DURATION_OPTIONS: DurationOption[] = [
  { value: 30, label: '30 minutes', hint: 'Granular tracking for short tasks' },
  { value: 60, label: '1 hour', hint: 'Standard 1-hour increments' },
  { value: 120, label: '2 hours', badge: 'Default', hint: 'Recommended for standard workday logging' },
  { value: 180, label: '3 hours', hint: 'Extended blocks for focused work' },
  { value: 240, label: '4 hours', badge: 'Max limit', hint: 'Maximum allowed duration per activity' },
];

export interface SettingsContextType {
  maxDurationMinutes: number;
  setMaxDurationMinutes: (minutes: number) => void;
  maxDurationLabel: string;
  options: DurationOption[];
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function getInitialMaxDuration(): number {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed)) {
          // Enforce maximum limit of 4 hours (240 minutes)
          const clamped = Math.min(parsed, ABSOLUTE_MAX_ACTIVITY_MINUTES);
          // Ensure it matches one of the valid options
          const match = ACTIVITY_DURATION_OPTIONS.find((opt) => opt.value === clamped);
          if (match) {
            return match.value;
          }
        }
      }
    }
  } catch {
    // Ignore localStorage errors (e.g. private browsing or sandboxed iframe)
  }
  return DEFAULT_MAX_ACTIVITY_MINUTES;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [maxDurationMinutes, setMaxDurationMinutesState] = useState<number>(getInitialMaxDuration);

  const setMaxDurationMinutes = (minutes: number) => {
    // Strictly enforce maximum limit of 4 hours
    const clamped = Math.min(Math.max(1, minutes), ABSOLUTE_MAX_ACTIVITY_MINUTES);
    const validOption = ACTIVITY_DURATION_OPTIONS.find((opt) => opt.value === clamped);
    const nextVal = validOption ? validOption.value : DEFAULT_MAX_ACTIVITY_MINUTES;

    setMaxDurationMinutesState(nextVal);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, String(nextVal));
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  useEffect(() => {
    // Ensure initial storage sync
    if (typeof localStorage !== 'undefined') {
      try {
        const current = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!current) {
          localStorage.setItem(SETTINGS_STORAGE_KEY, String(maxDurationMinutes));
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [maxDurationMinutes]);

  const maxDurationLabel = useMemo(() => {
    const opt = ACTIVITY_DURATION_OPTIONS.find((o) => o.value === maxDurationMinutes);
    return opt ? opt.label : `${maxDurationMinutes / 60} hours`;
  }, [maxDurationMinutes]);

  const value = useMemo(
    () => ({
      maxDurationMinutes,
      setMaxDurationMinutes,
      maxDurationLabel,
      options: ACTIVITY_DURATION_OPTIONS,
    }),
    [maxDurationMinutes, maxDurationLabel]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
