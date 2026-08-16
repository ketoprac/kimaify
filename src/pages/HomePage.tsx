import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { getTimesheets } from '../api/timesheets';
import { fetchRefs, buildMaps, type LookupMaps } from '../api/reference';
import { TimesheetTable } from '../components/TimesheetTable';
import { CreateTimesheetModal } from '../components/CreateTimesheetModal';
import { Button } from '@/components/ui/button';
import { todayDateStr } from '../utils/time';
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

      <TimesheetTable timesheets={timesheets} lookups={lookups} loading={loading} />

      <CreateTimesheetModal open={createOpen} onOpenChange={setCreateOpen} lookups={lookups} />
    </div>
  );
}
