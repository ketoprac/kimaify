import { Activity } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { SidebarSkeleton } from './SidebarSkeleton';
import type { ActivityCombination, PresetSelection } from './sidebarTypes';

interface SidebarProps {
  loading: boolean;
  error: string | null;
  combinations: ActivityCombination[];
  selectedPreset: PresetSelection | null;
  onSelectPreset: (preset: PresetSelection) => void;
  onRetry?: () => void;
}

export function Sidebar({ loading, error, combinations, selectedPreset, onSelectPreset, onRetry }: SidebarProps) {
  if (loading) {
    return (
      <div className="py-2 space-y-4">
        <div>
          <div className="px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Recent Activities</div>
          <SidebarSkeleton count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-4 text-sm">
        <p className="text-destructive text-xs">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 text-xs underline text-muted-foreground hover:text-foreground">
            Retry
          </button>
        )}
      </div>
    );
  }

  const isPresetActive = (c: ActivityCombination) =>
    selectedPreset?.customerId === c.customerId &&
    selectedPreset?.projectId === c.projectId &&
    selectedPreset?.activityId === c.activityId;

  return (
    <div className="py-1">
      <SidebarSection title="Recent Activities" icon={<Activity className="h-3.5 w-3.5" />} count={combinations.length} defaultOpen>
        {combinations.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">No recent activities</p>
        ) : (
          combinations.map(c => (
            <SidebarItem
              key={c.id}
              label={c.activityName}
              subtitle={`${c.customerName || 'No Customer'} · ${c.projectName || 'No Project'}`}
              active={isPresetActive(c)}
              onClick={() => onSelectPreset({ customerId: c.customerId, projectId: c.projectId, activityId: c.activityId })}
              testId={`sidebar-combination-${c.id}`}
            />
          ))
        )}
      </SidebarSection>
    </div>
  );
}
