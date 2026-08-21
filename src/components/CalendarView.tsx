import { useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, parse, format,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { formatDuration } from '../utils/time';
import type { Timesheet } from '../types';

const TZ = 'Asia/Jakarta';
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKEND_COLS = new Set([5, 6]); // Sat=index 5, Sun=index 6 in Mon-start grid

interface Props {
  allTimesheets: Timesheet[];
  date: string; // yyyy-MM-dd — used to derive current month
  onSelectDay: (date: string) => void;
}

export function CalendarView({ allTimesheets, date, onSelectDay }: Props) {
  const monthStart = useMemo(
    () => startOfMonth(parse(date, 'yyyy-MM-dd', new Date())),
    [date],
  );

  const days = useMemo(() => {
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthStart]);

  // Map yyyy-MM-dd → total seconds for that day
  const dailySeconds = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allTimesheets) {
      const day = format(toZonedTime(new Date(t.begin), TZ), 'yyyy-MM-dd');
      map.set(day, (map.get(day) ?? 0) + t.duration);
    }
    return map;
  }, [allTimesheets]);

  const maxSeconds = useMemo(() => {
    let max = 0;
    for (const s of dailySeconds.values()) if (s > max) max = s;
    return max || 1;
  }, [dailySeconds]);

  const today = format(toZonedTime(new Date(), TZ), 'yyyy-MM-dd');

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DOW.map((d, i) => (
          <div key={d} className={cn(
            'py-2 text-center text-xs font-medium text-muted-foreground',
            WEEKEND_COLS.has(i) && 'text-muted-foreground/60 bg-muted/20',
          )}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const seconds = dailySeconds.get(key) ?? 0;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, parse(date, 'yyyy-MM-dd', new Date()));
          const isToday = key === today;
          const barHeight = seconds > 0 ? Math.max(3, Math.round((seconds / maxSeconds) * 28)) : 0;
          const isWeekend = WEEKEND_COLS.has(i % 7);

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={cn(
                'relative flex flex-col items-center gap-1 py-2 px-1 min-h-[64px] border-b border-r text-sm transition-colors',
                'hover:bg-muted/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isWeekend && 'bg-muted/10',
                !isCurrentMonth && 'opacity-30',
                isSelected && 'bg-primary/10',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                  isToday && 'bg-primary text-primary-foreground',
                  isSelected && !isToday && 'ring-1 ring-primary text-primary',
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Hours bar */}
              {seconds > 0 && (
                <div className="flex flex-col items-center gap-0.5 w-full px-1">
                  <div
                    className="w-full rounded-sm bg-primary opacity-60"
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {formatDuration(seconds)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
