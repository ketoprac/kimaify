export interface Timesheet {
  id: number;
  activity: number;
  project: number;
  user: number;
  begin: string;
  end: string;
  duration: number;
  description: string;
  tags: string[];
  exported: boolean;
  billable: boolean;
  rate: number;
}

export interface Customer {
  id: number;
  name: string;
  company: string;
  visible: boolean;
  billable: boolean;
  color?: string;
}

export interface Project {
  id: number;
  name: string;
  customer: number;
  parentTitle: string;
  visible: boolean;
  billable: boolean;
  start: string | null;
  end: string | null;
}

export interface Activity {
  id: number;
  name: string;
  parentTitle: string | null;
  visible: boolean;
  billable: boolean;
}

export interface UserInfo {
  id: number;
  alias: string;
  username: string;
  email: string;
  timezone: string;
  language: string;
  apiToken: boolean;
}

export interface BulkRow {
  id: string;
  begin: string;
  end: string;
  customerId: number | null;
  projectId: number | null;
  activityId: number | null;
  description: string;
  tags: string;
  status?: 'pending' | 'submitting' | 'success' | 'error';
  errorMessage?: string;
}

export interface CreateTimesheetPayload {
  begin: string;
  end: string;
  project: number;
  activity: number;
  description: string;
  tags: string;
}

export interface UpdateTimesheetPayload {
  begin: string;
  end: string;
  project: number;
  activity: number;
  description: string;
  tags: string;
}
