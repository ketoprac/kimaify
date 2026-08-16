import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { getCustomers } from '../api/customers';
import { Combobox } from './ui/combobox';
import type { Customer } from '../types';

interface Props {
  value: number | null;
  onChange: (customerId: number | null) => void;
  error?: string;
}

export function CustomerSelect({ value, onChange }: Props) {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCustomers()
      .then((data) => {
        if (!cancelled) setCustomers(data.filter((c) => c.visible));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const options = useMemo(
    () => customers.map((c) => ({ id: c.id, label: c.name })),
    [customers]
  );

  return (
    <Combobox
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Select customer"
      loading={loading}
    />
  );
}
