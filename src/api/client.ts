const BASE_URL = 'https://timesheet.codeoffice.net/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const authToken = token ?? localStorage.getItem('kimaify_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Accept': 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('kimaify_token');
    throw new ApiError('Your Kimai token is invalid or expired. Please sign in again.', res.status);
  }

  if (!res.ok) {
    throw new ApiError(`API Error: ${res.status} ${res.statusText}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
