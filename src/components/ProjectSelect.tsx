import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { getProjects } from '../api/projects';
import { Combobox } from './ui/combobox';
import type { Project } from '../types';

interface Props {
  customerId: number | null;
  value: number | null;
  onChange: (projectId: number | null) => void;
  error?: string;
}

export function ProjectSelect({ customerId, value, onChange }: Props) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId === null) {
      setProjects([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProjects(customerId)
      .then((data) => {
        if (!cancelled) setProjects(data.filter((p) => p.visible));
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [customerId, token]);

  const options = useMemo(
    () => projects.map((p) => ({ id: p.id, label: p.name })),
    [projects]
  );

  return (
    <Combobox
      value={value}
      options={options}
      onChange={onChange}
      placeholder={customerId ? 'Select project' : 'Select customer first'}
      loading={loading}
      disabled={!customerId}
    />
  );
}
