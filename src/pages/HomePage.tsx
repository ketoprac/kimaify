import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, ArrowLeft, ArrowRight, CalendarDays, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTimesheets, deleteTimesheet } from '../api/timesheets';
import { fetchRefs, buildMaps, type LookupMaps } from '../api/reference';
import { TimesheetTable } from '../components/TimesheetTable';
import { CalendarView } from '../components/CalendarView';
import { CreateTimesheetModal } from '../components/CreateTimesheetModal';
import { EditTimesheetModal } from '../components/EditTimesheetModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { todayDateStr, formatDuration } from '../utils/time';
import { addDays, subDays, parse, format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { Timesheet } from '../types';

const TZ = 'Asia/Jakarta';

export function HomePage() {
  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>([]);
  const [lookups, setLookups] = useState<LookupMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayDateStr());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Timesheet | null>(null);
  const [view, setView] = useState<'day' | 'month'>('day');

  const refetchTimesheets = useCallback(async () => {
    try {
      const data = await getTimesheets();
      setAllTimesheets(data);
    } catch {
      setAllTimesheets([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      getTimesheets(),
      fetchRefs().then(buildMaps),
    ])
      .then(([data, maps]) => {
        setAllTimesheets(data);
        setLookups(maps);
      })
      .catch(() => setAllTimesheets([]))
      .finally(() => setLoading(false));
  }, []);

  const timesheets = useMemo(() => {
    const d = parse(date, 'yyyy-MM-dd', new Date());
    return allTimesheets.filter(t => isSameDay(toZonedTime(new Date(t.begin), TZ), d));
  }, [allTimesheets, date]);

  const prevDay = useCallback(() => {
    setDate(d => format(subDays(parse(d, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'));
  }, []);

  const nextDay = useCallback(() => {
    setDate(d => format(addDays(parse(d, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd'));
  }, []);

  const prevMonth = useCallback(() => {
    setDate(d => format(startOfMonth(subMonths(parse(d, 'yyyy-MM-dd', new Date()), 1)), 'yyyy-MM-dd'));
  }, []);

  const nextMonth = useCallback(() => {
    setDate(d => format(startOfMonth(addMonths(parse(d, 'yyyy-MM-dd', new Date()), 1)), 'yyyy-MM-dd'));
  }, []);

  const displayDate = useMemo(() => {
    try {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, dd MMM yyyy');
    } catch {
      return date;
    }
  }, [date]);

  const displayMonth = useMemo(() => {
    try {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'MMMM yyyy');
    } catch {
      return date;
    }
  }, [date]);

  const handleDelete = useCallback(async (t: Timesheet) => {
    if (!window.confirm('Delete this timesheet entry?')) return;
    try {
      await deleteTimesheet(t.id);
      toast.success('Timesheet deleted');
      refetchTimesheets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete timesheet');
    }
  }, [refetchTimesheets]);

  const handleDeleteMany = useCallback(async (list: Timesheet[]) => {
    if (list.length === 0) return;
    if (!window.confirm(`Delete ${list.length} timesheet entr${list.length === 1 ? 'y' : 'ies'}?`)) return;
    let failed = 0;
    for (const t of list) {
      try {
        await deleteTimesheet(t.id);
      } catch {
        failed++;
      }
    }
    if (failed === 0) {
      toast.success(`${list.length} entr${list.length === 1 ? 'y' : 'ies'} deleted`);
    } else {
      toast.error(`${failed} of ${list.length} failed to delete`);
    }
    refetchTimesheets();
  }, [refetchTimesheets]);

  const totalSeconds = useMemo(
    () => timesheets.reduce((sum, t) => sum + t.duration, 0),
    [timesheets],
  );

  // Press 'N' to open Add Activity (ignore when typing in inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        setCreateOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={view === 'day' ? prevDay : prevMonth}
            variant="ghost" size="icon" className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {view === 'day' ? displayDate : displayMonth}
          </h2>
          <Button
            onClick={view === 'day' ? nextDay : nextMonth}
            variant="ghost" size="icon" className="h-8 w-8"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-0.5 gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 gap-1.5 rounded-sm', view === 'day' ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground')}
              onClick={() => setView('day')}
            >
              <List className="w-3.5 h-3.5" />
              Day
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 gap-1.5 rounded-sm', view === 'month' ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground')}
              onClick={() => setView('month')}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Month
            </Button>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Activity
            <kbd className="hidden sm:inline-flex items-center justify-center h-4 px-1 rounded border border-current/30 text-[10px] font-mono opacity-60 ml-0.5">N</kbd>
          </Button>
        </div>
      </div>

      {view === 'month' ? (
        <CalendarView
          allTimesheets={allTimesheets}
          date={date}
          onSelectDay={(d) => { setDate(d); setView('day'); }}
        />
      ) : (
        <>
          <TimesheetTable
            timesheets={timesheets}
            lookups={lookups}
            loading={loading}
            onEdit={setEditTarget}
            onDelete={handleDelete}
            onDeleteMany={handleDeleteMany}
            onAdd={() => setCreateOpen(true)}
          />
          <div className="flex items-center justify-end text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground ml-1.5">{formatDuration(totalSeconds)}</span>
          </div>
        </>
      )}

      <CreateTimesheetModal open={createOpen} onOpenChange={setCreateOpen} lookups={lookups} onSubmitted={refetchTimesheets} />

      <EditTimesheetModal
        timesheet={editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
        lookups={lookups}
        onSubmitted={refetchTimesheets}
      />
    </div>
  );
}
