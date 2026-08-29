import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Plus, ArrowLeft, Send, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBulkRows } from '../hooks/useBulkRows';
import { createTimesheet } from '../api/timesheets';
import { todayDateStr, toISOWithTZ } from '../utils/time';
import { minutesBetween, splitIntoHours } from '../utils/schedule';
import {
  validateRow,
  hasErrors,
  MAX_LOOKBACK_DAYS,
  lookbackFloor,
  isWeekend,
  type RowErrors,
} from '../utils/validation';
import type { CreateTimesheetPayload } from '../types';
import type { LookupMaps } from '../api/reference';
import { TimeInput } from './TimeInput';
import { CustomerSelect } from './CustomerSelect';
import { ProjectSelect } from './ProjectSelect';
import { ActivitySelect } from './ActivitySelect';
import { TagInput } from './TagInput';
import { SubmissionResult } from './SubmissionResult';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: LookupMaps | null;
  onSubmitted: () => void;
}

type Step = 'fill' | 'preview' | 'result';

// Upper bound on rows per bulk submission — keeps a stray "duplicate row"
// click-storm from fanning out into thousands of Kimai POSTs.
const MAX_ROWS = 50;

function FieldLabel({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function CreateTimesheetModal({ open, onOpenChange, lookups, onSubmitted }: Props) {
  const {
    date,
    rows,
    setDate,
    addRow,
    removeRow,
    updateRow,
    duplicateRow,
    setRowStatus,
  } = useBulkRows(todayDateStr());

  const [step, setStep] = useState<Step>('fill');
  const [errors, setErrors] = useState<Map<string, RowErrors>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  // Synchronous double-submit latch. React state updates are batched, so two
  // rapid clicks can both observe `submitting === false` in the same tick;
  // the ref is checked before any state changes.
  const submittingRef = useRef(false);
  // Rows that exactly duplicate another row in the batch (same project/activity/
  // times/description). Warned about at preview; submission stays allowed since
  // legitimate use exists (e.g. same slot across different tags).
  const duplicateRowIds = useMemo(() => {
    const seen = new Map<string, string[]>();
    for (const r of rows) {
      const key = `${r.customerId}|${r.projectId}|${r.activityId}|${r.begin}|${r.end}|${r.description}|${r.tags}`;
      seen.set(key, [...(seen.get(key) ?? []), r.id]);
    }
    const dups = new Set<string>();
    for (const ids of seen.values()) {
      if (ids.length > 1) ids.forEach((id) => dups.add(id));
    }
    return dups;
  }, [rows]);

  const previewRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      customer: r.customerId != null ? lookups?.customerName.get(r.customerId) ?? '-' : '-',
      project: r.projectId != null ? lookups?.projectName.get(r.projectId) ?? '-' : '-',
      activity: r.activityId != null ? lookups?.activityName.get(r.activityId) ?? '-' : '-',
      duration: minutesBetween(r.begin, r.end),
      segments: splitIntoHours(r.begin, r.end).length,
    }));
  }, [rows, lookups]);

  const totalSegments = useMemo(
    () => previewRows.reduce((sum, r) => sum + r.segments, 0),
    [previewRows],
  );

  const goPreview = () => {
    const newErrors = new Map<string, RowErrors>();
    rows.forEach((r) => {
      const e = validateRow(r, date);
      if (hasErrors(e)) newErrors.set(r.id, e);
    });
    setErrors(newErrors);
    if (newErrors.size === 0) setStep('preview');
  };

  const dateWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (date < lookbackFloor()) {
      warnings.push(`Date is more than ${MAX_LOOKBACK_DAYS} days in the past`);
    } else {
      const d = new Date(`${date}T00:00:00`);
      const dow = d.getDay();
      if (!Number.isNaN(dow) && isWeekend(dow)) {
        warnings.push('Selected date falls on a weekend');
      }
    }
    return warnings;
  }, [date]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    let successCount = 0;
    let failedCount = 0;
    for (const row of rows) {
      setRowStatus(row.id, 'submitting');
      try {
        for (const [begin, end] of splitIntoHours(row.begin, row.end)) {
          const payload: CreateTimesheetPayload = {
            begin: toISOWithTZ(date, begin),
            end: toISOWithTZ(date, end),
            project: row.projectId!,
            activity: row.activityId!,
            description: row.description,
            tags: row.tags,
          };
          await createTimesheet(payload);
        }
        setRowStatus(row.id, 'success');
        successCount++;
      } catch (err: any) {
        setRowStatus(row.id, 'error', err.message || 'Failed to create timesheet entry');
        failedCount++;
      }
    }
    setSubmitting(false);
    submittingRef.current = false;
    setStep('result');
    onSubmitted();

    if (failedCount === 0) {
      toast.success(`${successCount} entr${successCount === 1 ? 'y' : 'ies'} created`);
    } else {
      toast.error(`${failedCount} entr${failedCount === 1 ? 'y' : 'ies'} failed to create`);
    }
  };

  const reset = () => {
    setStep('fill');
    setErrors(new Map());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Timesheets</DialogTitle>
          <DialogDescription>
            Fill in your time entries, preview them, then submit to Kimai.
          </DialogDescription>
        </DialogHeader>

        {step === 'fill' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Date:</span>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 w-auto"
                />
              </label>
              {errors.size > 0 &&
                [...new Set([...errors.values()].map((e) => e.date).filter(Boolean))].map(
                  (msg) => (
                    <p key={msg} className="text-sm text-destructive">
                      {msg}
                    </p>
                  ),
                )}
            </div>

            <div className="space-y-4">
              {rows.map((row, i) => (
                <div key={row.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Entry {i + 1}
                      {duplicateRowIds.has(row.id) && (
                        <span className="ml-2 text-amber-600 dark:text-amber-400">
                          duplicate of another entry
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        onClick={() => duplicateRow(row.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Duplicate"
                        disabled={submitting}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => removeRow(row.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Remove"
                        disabled={submitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel label="Start" error={errors.get(row.id)?.begin}>
                      <TimeInput
                        value={row.begin}
                        onChange={(v) => updateRow(row.id, 'begin', v)}
                      />
                    </FieldLabel>
                    <FieldLabel label="End" error={errors.get(row.id)?.end}>
                      <TimeInput
                        value={row.end}
                        onChange={(v) => updateRow(row.id, 'end', v)}
                      />
                    </FieldLabel>
                  </div>

                  <FieldLabel label="Customer" error={errors.get(row.id)?.customerId}>
                    <CustomerSelect
                      value={row.customerId}
                      onChange={(v) => {
                        updateRow(row.id, 'customerId', v);
                        updateRow(row.id, 'projectId', null);
                      }}
                    />
                  </FieldLabel>

                  <FieldLabel label="Project" error={errors.get(row.id)?.projectId}>
                    <ProjectSelect
                      customerId={row.customerId}
                      value={row.projectId}
                      onChange={(v) => updateRow(row.id, 'projectId', v)}
                    />
                  </FieldLabel>

                  <FieldLabel label="Activity" error={errors.get(row.id)?.activityId}>
                    <ActivitySelect
                      value={row.activityId}
                      onChange={(v) => updateRow(row.id, 'activityId', v)}
                    />
                  </FieldLabel>

                  <FieldLabel label="Description">
                    <Input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                      placeholder="Description"
                      disabled={submitting}
                    />
                  </FieldLabel>

                  <FieldLabel label="Tags">
                    <TagInput value={row.tags} onChange={(v) => updateRow(row.id, 'tags', v)} />
                  </FieldLabel>
                </div>
              ))}
            </div>

            {rows.length >= MAX_ROWS ? (
              <p className="text-xs text-muted-foreground">
                Maximum of {MAX_ROWS} entries per submission reached.
              </p>
            ) : (
              <Button onClick={addRow} disabled={submitting} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Entry
              </Button>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={goPreview} disabled={submitting || rows.length === 0}>
                Preview
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {dateWarnings.length > 0 && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                {dateWarnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            )}
            {(totalSegments !== rows.length || duplicateRowIds.size > 0) && (
              <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 space-y-0.5">
                {duplicateRowIds.size > 0 && <p>Some entries are exact duplicates of others in this batch.</p>}
                {totalSegments !== rows.length && (
                  <p>
                    Long spans are split at the 12:00–13:00 lunch break and into ≤2h segments:
                    {` ${rows.length} ${rows.length === 1 ? 'entry' : 'entries'} will create
                    ${totalSegments} Kimai ${totalSegments === 1 ? 'record' : 'records'}.`}
                  </p>
                )}
              </div>
            )}
            <div className="border rounded-lg divide-y">
              {previewRows.map((r, i) => (
                <div key={r.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Entry {i + 1}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.begin} – {r.end}
                      {r.duration != null && ` · ${r.duration}m`}
                      {r.segments > 1 && ` · ${r.segments} entries`}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Project: </span>
                    {r.project}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Customer: </span>
                    {r.customer}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Activity: </span>
                    {r.activity}
                  </div>
                  {r.description && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Description: </span>
                      {r.description}
                    </div>
                  )}
                  {r.tags && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Tags: </span>
                      {r.tags}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep('fill')} disabled={submitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Send className="w-4 h-4 mr-1.5" />
                {submitting
                  ? 'Creating...'
                  : `Submit ${totalSegments} entr${totalSegments === 1 ? 'y' : 'ies'}`}
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4">
            <SubmissionResult rows={rows} />
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
