import { AUTH_KEY } from '../stores/auth';

export const baseUrl = import.meta.env.VITE_API_URL as string;
export const wsUrl = import.meta.env.VITE_WS_URL as string;

export interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
}

export const api = async <T = any>(url: string, options: APIOptions = {}): Promise<T> => {
  const { method = 'GET', body, params } = options;

  const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
  const token = auth ? JSON.parse(auth) : null;
  if (!token) {
    window.location.href = '/login';
  }

  const urlWithParams = new URL(`${baseUrl}${url}`);
  if (params) {
    Object.keys(params).forEach((key) => urlWithParams.searchParams.append(key, params[key]));
  }

  const response = await fetch(urlWithParams.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
  }

  return response.json() as Promise<T>;
};
