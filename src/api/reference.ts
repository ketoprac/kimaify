import { getCustomers } from './customers';
import { getAllProjects } from './projects';
import { getActivities } from './activities';
import type { Customer, Project, Activity } from '../types';

const CACHE_KEY = 'kimaify_refs';
const CACHE_TTL = 30 * 60 * 1000; // 30 mins

interface Refs {
  customers: Customer[];
  projects: Project[];
  activities: Activity[];
  fetchedAt: number;
}

export interface LookupMaps {
  customerName: Map<number, string>;    // customerId → name
  projectName: Map<number, string>;     // projectId → name
  projectCustomer: Map<number, string>; // projectId → customerName
  projectCustomerId: Map<number, number>; // projectId → customerId
  activityName: Map<number, string>;    // activityId → name
}

function readCache(): Refs | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Refs;
    if (Date.now() - data.fetchedAt > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: Omit<Refs, 'fetchedAt'>) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, fetchedAt: Date.now() }));
}

export async function fetchRefs(): Promise<Refs> {
  const cached = readCache();
  if (cached) return cached;

  const [customers, projects, activities] = await Promise.all([
    getCustomers(),
    getAllProjects(),
    getActivities(),
  ]);

  const data = { customers, projects, activities };
  writeCache(data);
  return data;
}

export function buildMaps(refs: Refs): LookupMaps {
  const customerName = new Map<number, string>();
  refs.customers.forEach(c => customerName.set(c.id, c.name));

  const projectName = new Map<number, string>();
  const projectCustomer = new Map<number, string>();
  const projectCustomerId = new Map<number, number>();
  refs.projects.forEach(p => {
    projectName.set(p.id, p.name);
    projectCustomer.set(p.id, customerName.get(p.customer) ?? '');
    projectCustomerId.set(p.id, p.customer);
  });

  const activityName = new Map<number, string>();
  refs.activities.forEach(a => activityName.set(a.id, a.name));

  return { customerName, projectName, projectCustomer, projectCustomerId, activityName };
}
