import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTimesheets, deleteTimesheet } from '../api/timesheets';
import { fetchRefs, buildMaps, type LookupMaps } from '../api/reference';
import { TimesheetTable } from '../components/TimesheetTable';
import { CreateTimesheetModal } from '../components/CreateTimesheetModal';
import { EditTimesheetModal } from '../components/EditTimesheetModal';
import { Button } from '@/components/ui/button';
import { todayDateStr, formatDuration } from '../utils/time';
import { addDays, subDays, parse, format, isSameDay } from 'date-fns';
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

  const displayDate = useMemo(() => {
    try {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, dd MMM yyyy');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={prevDay} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {displayDate}
          </h2>
          <Button onClick={nextDay} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      <TimesheetTable
        timesheets={timesheets}
        lookups={lookups}
        loading={loading}
        onEdit={setEditTarget}
        onDelete={handleDelete}
        onDeleteMany={handleDeleteMany}
      />

      <div className="flex items-center justify-end text-sm text-muted-foreground">
        Total: <span className="font-semibold text-foreground ml-1.5">{formatDuration(totalSeconds)}</span>
      </div>

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
