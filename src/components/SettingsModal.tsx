import { Check, Clock, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { useSettings } from '../context/SettingsContext';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: Props) {
  const { maxDurationMinutes, setMaxDurationMinutes, options } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-green-dark dark:text-brand-green" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure time tracking rules and preferences for your timesheet activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground">
                Maximum Hours per Activity
              </label>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-green-dark dark:text-brand-green" />
                Auto-splits longer entries
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Spans exceeding this limit are automatically segmented when creating timesheets,
              and single activity edits cannot exceed this ceiling (up to 4 hours maximum).
            </p>

            <div className="space-y-2" role="radiogroup" aria-label="Maximum hours per activity">
              {options.map((opt) => {
                const isSelected = opt.value === maxDurationMinutes;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setMaxDurationMinutes(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'border-brand-green-dark bg-brand-green-soft/40 dark:bg-brand-green-dark/20 dark:border-brand-green shadow-xs'
                        : 'border-border bg-card hover:bg-muted/60 text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0',
                          isSelected
                            ? 'border-brand-green-dark bg-brand-green-dark text-white dark:border-brand-green dark:bg-brand-green dark:text-brand-teal-deep'
                            : 'border-muted-foreground/40 bg-transparent'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div
                          className={cn(
                            'text-sm font-medium leading-tight',
                            isSelected && 'text-brand-green-dark dark:text-brand-green'
                          )}
                        >
                          {opt.label}
                        </div>
                        {opt.hint && (
                          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                            {opt.hint}
                          </div>
                        )}
                      </div>
                    </div>

                    {opt.badge && (
                      <span
                        className={cn(
                          'text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                          isSelected
                            ? 'bg-brand-green-dark text-white dark:bg-brand-green dark:text-brand-teal-deep'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
