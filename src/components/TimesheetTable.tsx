import type { Timesheet } from '../types';
import type { LookupMaps } from '../api/reference';
import { formatTime, formatDate, formatDuration } from '../utils/time';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  timesheets: Timesheet[];
  lookups: LookupMaps | null;
  loading: boolean;
  onEdit: (timesheet: Timesheet) => void;
  onDelete: (timesheet: Timesheet) => void;
}

export function TimesheetTable({ timesheets, lookups, loading, onEdit, onDelete }: Props) {
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
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((t, i) => (
            <TableRow key={t.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Edit"
                    onClick={() => onEdit(t)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={() => onDelete(t)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
