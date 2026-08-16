import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { getActivities } from '../api/activities';
import { Combobox } from './ui/combobox';
import type { Activity } from '../types';

interface Props {
  value: number | null;
  onChange: (activityId: number | null) => void;
  error?: string;
}

export function ActivitySelect({ value, onChange }: Props) {
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getActivities()
      .then((data) => {
        if (!cancelled) setActivities(data.filter((a) => a.visible));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const options = useMemo(
    () => activities.map((a) => ({ id: a.id, label: a.name })),
    [activities]
  );

  return (
    <Combobox
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Select activity"
      loading={loading}
    />
  );
}
