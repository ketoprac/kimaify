import { apiFetch } from './client';
import type { UserInfo } from '../types';

export async function getUserInfo(token: string): Promise<UserInfo> {
  return apiFetch<UserInfo>('/users/me', {}, token);
}
