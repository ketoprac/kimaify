import type { Activity } from '@/types';

export interface ActivityCombination {
  id: string;
  customerId: number;
  projectId: number;
  activityId: number;
  customerName: string;
  projectName: string;
  activityName: string;
}

export interface PresetSelection {
  customerId: number | null;
  projectId: number | null;
  activityId: number | null;
}

export interface SidebarOutletContext {
  refs: { customers: any[]; projects: any[]; activities: Activity[] } | null;
  lookups: import('@/api/reference').LookupMaps | null;
  refetchRefs: () => Promise<void>;
  loading: boolean;
  error: string | null;
  selectedPreset?: PresetSelection | null;
  onSelectPreset?: (preset: PresetSelection) => void;
  setAllTimesheetsForSidebar?: (timesheets: any[]) => void;
}
