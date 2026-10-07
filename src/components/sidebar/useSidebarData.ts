import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchRefs, buildMaps, invalidateRefs, type LookupMaps } from '@/api/reference';
import type { Customer, Project, Activity, Timesheet } from '@/types';
import type { ActivityCombination } from './sidebarTypes';

const RECENT_KEY = 'kimaify_recent_combinations';
const RECENT_CAP = 20;
const RECENT_DISPLAY = 5;

export function pushRecentCombination(preset: { customerId: number; projectId: number; activityId: number }) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: Array<{ customerId: number; projectId: number; activityId: number }> = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      item => !(item.customerId === preset.customerId && item.projectId === preset.projectId && item.activityId === preset.activityId)
    );
    filtered.unshift(preset);
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, RECENT_CAP)));
  } catch { /* ignore */ }
}

function getStoredRecentCombinations(): Array<{ customerId: number; projectId: number; activityId: number }> {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSidebarData(timesheets: Timesheet[] = []) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [lookups, setLookups] = useState<LookupMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const refs = await fetchRefs(force ? { force: true } : undefined);
      setCustomers(refs.customers);
      setProjects(refs.projects);
      setActivities(refs.activities);
      setLookups(buildMaps(refs));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load sidebar data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refetch = useCallback(async () => {
    invalidateRefs();
    await load(true);
  }, [load]);

  const recentCombinations = useMemo<ActivityCombination[]>(() => {
    if (!lookups) return [];

    const combMap = new Map<string, ActivityCombination>();

    // 1. First add explicitly pushed recent combinations from localStorage
    const stored = getStoredRecentCombinations();
    for (const item of stored) {
      const cName = lookups.customerName.get(item.customerId) ?? '';
      const pName = lookups.projectName.get(item.projectId) ?? '';
      const aName = lookups.activityName.get(item.activityId) ?? '';
      if (pName && aName) {
        const key = `${item.customerId}:${item.projectId}:${item.activityId}`;
        if (!combMap.has(key)) {
          combMap.set(key, {
            id: key,
            customerId: item.customerId,
            projectId: item.projectId,
            activityId: item.activityId,
            customerName: cName,
            projectName: pName,
            activityName: aName,
          });
        }
      }
    }

    // 2. Add combinations derived from timesheets (sorted by begin timestamp descending)
    const sortedTimesheets = [...timesheets].sort((a, b) => new Date(b.begin).getTime() - new Date(a.begin).getTime());
    for (const t of sortedTimesheets) {
      const pId = t.project;
      const aId = t.activity;
      const cId = lookups.projectCustomerId.get(pId);
      if (cId != null) {
        const key = `${cId}:${pId}:${aId}`;
        if (!combMap.has(key)) {
          const cName = lookups.customerName.get(cId) ?? '';
          const pName = lookups.projectName.get(pId) ?? '';
          const aName = lookups.activityName.get(aId) ?? '';
          if (pName && aName) {
            combMap.set(key, {
              id: key,
              customerId: cId,
              projectId: pId,
              activityId: aId,
              customerName: cName,
              projectName: pName,
              activityName: aName,
            });
          }
        }
      }
    }

    // 3. If fewer than 5, fallback to projects & activities
    if (combMap.size < RECENT_DISPLAY) {
      for (const p of projects) {
        for (const a of activities) {
          if (combMap.size >= RECENT_DISPLAY) break;
          const key = `${p.customer}:${p.id}:${a.id}`;
          if (!combMap.has(key)) {
            combMap.set(key, {
              id: key,
              customerId: p.customer,
              projectId: p.id,
              activityId: a.id,
              customerName: lookups.customerName.get(p.customer) ?? '',
              projectName: p.name,
              activityName: a.name,
            });
          }
        }
        if (combMap.size >= RECENT_DISPLAY) break;
      }
    }

    return Array.from(combMap.values()).slice(0, RECENT_DISPLAY);
  }, [timesheets, lookups, projects, activities]);

  return {
    customers, projects, activities,
    recentCombinations,
    lookups, loading, error, refetch, reload: load,
  };
}
