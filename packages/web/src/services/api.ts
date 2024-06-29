import { AUTH_KEY } from '../stores/auth';

export const baseUrl = import.meta.env.VITE_API_URL as string;

export const api = async <T = any>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> => {
  const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
  const token = auth ? JSON.parse(auth) : null;
  if (!token) {
    window.location.href = '/login';
  }

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
  }

  return response.json() as Promise<T>;
};
