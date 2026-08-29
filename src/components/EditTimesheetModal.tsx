import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { updateTimesheet } from '../api/timesheets';
import { toISOWithTZ, formatTime } from '../utils/time';
import type { Timesheet } from '../types';
import type { LookupMaps } from '../api/reference';
import { TimeInput } from './TimeInput';
import { CustomerSelect } from './CustomerSelect';
import { ProjectSelect } from './ProjectSelect';
import { ActivitySelect } from './ActivitySelect';
import { TagInput } from './TagInput';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface Props {
  timesheet: Timesheet | null;
  onOpenChange: (open: boolean) => void;
  lookups: LookupMaps | null;
  onSubmitted: () => void;
}

export function EditTimesheetModal({ timesheet, onOpenChange, lookups, onSubmitted }: Props) {
  const [date, setDate] = useState('');
  const [begin, setBegin] = useState('');
  const [end, setEnd] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Synchronous latch — see CreateTimesheetModal for rationale.
  const savingRef = useRef(false);

  useEffect(() => {
    if (!timesheet) return;
    setDate(timesheet.begin.slice(0, 10));
    setBegin(formatTime(timesheet.begin));
    setEnd(formatTime(timesheet.end));
    setProjectId(timesheet.project);
    setCustomerId(lookups?.projectCustomerId.get(timesheet.project) ?? null);
    setActivityId(timesheet.activity);
    setDescription(timesheet.description ?? '');
    setTags((timesheet.tags ?? []).join(', '));
    setError(null);
  }, [timesheet, lookups]);

  const handleSave = async () => {
    if (!timesheet || savingRef.current) return;
    savingRef.current = true;
    if (!begin || !end) {
      setError('Start and end are required');
      return;
    }
    if (begin >= end) {
      setError('End must be after start');
      return;
    }
    if (projectId === null || activityId === null) {
      setError('Project and activity are required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateTimesheet(timesheet.id, {
        begin: toISOWithTZ(date, begin),
        end: toISOWithTZ(date, end),
        project: projectId,
        activity: activityId,
        description,
        tags,
      });
      toast.success('Timesheet updated');
      onSubmitted();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update timesheet');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  return (
    <Dialog open={!!timesheet} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Timesheet</DialogTitle>
          <DialogDescription>
            Update this time entry, then save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 w-auto"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Start</span>
              <TimeInput value={begin} onChange={setBegin} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">End</span>
              <TimeInput value={end} onChange={setEnd} />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Customer</span>
            <CustomerSelect
              value={customerId}
              onChange={(v) => {
                setCustomerId(v);
                setProjectId(null);
              }}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Project</span>
            <ProjectSelect
              customerId={customerId}
              value={projectId}
              onChange={setProjectId}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Activity</span>
            <ActivitySelect value={activityId} onChange={setActivityId} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              disabled={saving}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tags</span>
            <TagInput value={tags} onChange={setTags} />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
