import { useState } from 'react';
import type { Timesheet } from '../types';
import type { LookupMaps } from '../api/reference';
import { formatTime, formatDate, formatDuration } from '../utils/time';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
  timesheets: Timesheet[];
  lookups: LookupMaps | null;
  loading: boolean;
  onEdit: (timesheet: Timesheet) => void;
  onDelete: (timesheet: Timesheet) => void;
  onDeleteMany: (timesheets: Timesheet[]) => void;
  onAdd?: () => void;
}

export function TimesheetTable({ timesheets, lookups, loading, onEdit, onDelete, onDeleteMany, onAdd }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === timesheets.length
        ? new Set()
        : new Set(timesheets.map((t) => t.id))
    );
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = () => {
    const targets = timesheets.filter((t) => selected.has(t.id));
    onDeleteMany(targets);
    clearSelection();
  };

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
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-3">No entries for this day.</p>
          {onAdd && (
            <Button size="sm" className="gap-1.5" onClick={onAdd}>
              <Plus className="w-4 h-4" />
              Add Activity
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile card layout */}
      <div className="sm:hidden space-y-2">
        {timesheets.map((t, i) => (
          <Card key={t.id}>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {formatTime(t.begin)} – {formatTime(t.end)}
                    <span className="ml-2 text-xs text-muted-foreground">{formatDuration(t.duration)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lookups?.projectName.get(t.project) ?? '-'} · {lookups?.activityName.get(t.activity) ?? '-'}
                  </div>
                  {t.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-[240px]">{t.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(t)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(t)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block border rounded-lg overflow-x-auto">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={timesheets.length > 0 && selected.size === timesheets.length}
                onChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
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
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggle(t.id)}
                  aria-label={`Select row ${i + 1}`}
                />
              </TableCell>
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
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
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

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
