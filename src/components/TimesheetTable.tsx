import type { Timesheet } from '../types';
import type { LookupMaps } from '../api/reference';
import { formatTime, formatDate, formatDuration } from '../utils/time';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent } from './ui/card';

interface Props {
  timesheets: Timesheet[];
  lookups: LookupMaps | null;
  loading: boolean;
}

export function TimesheetTable({ timesheets, lookups, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
          Loading timesheets...
        </CardContent>
      </Card>
    );
  }

  if (timesheets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No timesheet entries for this date.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{formatDate(t.begin)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatTime(t.begin)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatTime(t.end)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDuration(t.duration)}</TableCell>
              <TableCell className="max-w-[120px] truncate" title={lookups?.projectCustomer.get(t.project) ?? ''}>
                {lookups?.projectCustomer.get(t.project) ?? '-'}
              </TableCell>
              <TableCell className="max-w-[160px] truncate" title={lookups?.projectName.get(t.project) ?? ''}>
                {lookups?.projectName.get(t.project) ?? '-'}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {lookups?.activityName.get(t.activity) ?? '-'}
              </TableCell>
              <TableCell className="max-w-[300px] truncate" title={t.description || ''}>
                {t.description || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
