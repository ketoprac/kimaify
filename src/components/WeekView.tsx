import { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parse, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { formatDuration, formatTime } from '../utils/time';
import type { Timesheet } from '../types';
import type { LookupMaps } from '../api/reference';

const TZ = 'Asia/Jakarta';
const WEEKEND_DAYS = new Set([6, 0]); // Sat=6, Sun=0 per getDay()

interface Props {
  allTimesheets: Timesheet[];
  date: string; // yyyy-MM-dd — any day in the target week
  lookups: LookupMaps | null;
  onSelectDay: (date: string) => void;
  onEdit: (t: Timesheet) => void;
}

export function WeekView({ allTimesheets, date, lookups, onSelectDay, onEdit }: Props) {
  const weekDays = useMemo(() => {
    const d = parse(date, 'yyyy-MM-dd', new Date());
    return eachDayOfInterval({
      start: startOfWeek(d, { weekStartsOn: 1 }),
      end: endOfWeek(d, { weekStartsOn: 1 }),
    });
  }, [date]);

  const byDay = useMemo(() => {
    const map = new Map<string, Timesheet[]>();
    for (const t of allTimesheets) {
      const key = format(toZonedTime(new Date(t.begin), TZ), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [allTimesheets]);

  const weekTotalSeconds = useMemo(() => {
    const keys = new Set(weekDays.map(d => format(d, 'yyyy-MM-dd')));
    let total = 0;
    for (const [key, entries] of byDay) {
      if (keys.has(key)) total += entries.reduce((s, t) => s + t.duration, 0);
    }
    return total;
  }, [weekDays, byDay]);

  const today = format(toZonedTime(new Date(), TZ), 'yyyy-MM-dd');
  const selectedKey = date;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const isToday = key === today;
          const isSelected = key === selectedKey;
          const isWeekend = WEEKEND_DAYS.has(day.getDay());
          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={cn(
                'py-2 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors',
                'hover:bg-muted/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isWeekend && 'bg-muted/20',
                isSelected && 'bg-primary/10',
              )}
            >
              <span className="text-muted-foreground uppercase tracking-wide text-[10px]">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full font-semibold',
                isToday && 'bg-primary text-primary-foreground',
                isSelected && !isToday && 'ring-1 ring-primary text-primary',
              )}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-7 divide-x min-h-[200px]">
        {weekDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const entries = byDay.get(key) ?? [];
          const totalSec = entries.reduce((s, t) => s + t.duration, 0);
          const isWeekend = WEEKEND_DAYS.has(day.getDay());
          const isSelected = key === selectedKey;

          return (
            <div
              key={key}
              className={cn(
                'flex flex-col min-h-[200px]',
                isWeekend && 'bg-muted/10',
                isSelected && 'bg-primary/5',
              )}
            >
              {totalSec > 0 && (
                <div className="px-1 pt-1 text-[10px] font-medium text-muted-foreground text-center border-b pb-1">
                  {formatDuration(totalSec)}
                </div>
              )}

              <div className="flex flex-col gap-1 p-1 flex-1">
                {entries
                  .sort((a, b) => new Date(a.begin).getTime() - new Date(b.begin).getTime())
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onEdit(t)}
                      title={t.description || lookups?.activityName.get(t.activity) || ''}
                      className={cn(
                        'w-full text-left rounded px-1 py-0.5 text-[10px] leading-tight',
                        'bg-primary/15 hover:bg-primary/25 transition-colors',
                        'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      )}
                    >
                      <div className="font-medium text-foreground truncate">
                        {formatTime(t.begin)}–{formatTime(t.end)}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {lookups?.activityName.get(t.activity) ?? '-'}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {weekTotalSeconds > 0 && (
        <div className="border-t px-4 py-2 bg-muted/20 flex items-center justify-end gap-1 text-sm">
          <span className="text-muted-foreground">Week total:</span>
          <span className="font-semibold text-foreground">{formatDuration(weekTotalSeconds)}</span>
        </div>
      )}
    </div>
  );
}
