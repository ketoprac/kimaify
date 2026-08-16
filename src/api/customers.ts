import { apiFetch } from './client';
import type { Customer } from '../types';

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers?visible=1&size=500');
}
