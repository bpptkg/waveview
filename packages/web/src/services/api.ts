import { AUTH_KEY } from '../stores/auth';
import { JwtToken } from '../types/auth';
import apiVersion from './apiVersion';

export const baseUrl = import.meta.env.VITE_API_URL as string;
export const wsUrl = import.meta.env.VITE_WS_URL as string;

export interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
}

const refreshToken = async () => {
  const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
  const token = auth ? JSON.parse(auth) : null;
  if (!token || !token.refresh) {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
  }

  const response = await fetch(`${baseUrl}${apiVersion.refreshToken.v1}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: token.refresh,
    }),
  });

  if (response.status === 401) {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/login';
  }

  const data = (await response.json()) as JwtToken;
  if (data) {
    token.access = data.access;
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(token));
  }
};

const isAbsoluteUrl = (url: string): boolean => /^(?:[a-z]+:)?\/\//i.test(url);

const constructUrl = (baseUrl: string, url: string, params?: Record<string, string>): string => {
  const fullUrl = isAbsoluteUrl(url) ? url : `${baseUrl}${url}`;
  const urlWithParams = new URL(fullUrl);

  if (params) {
    Object.keys(params).forEach((key) => urlWithParams.searchParams.append(key, params[key]));
  }

  return urlWithParams.toString();
};

export const api = async (url: string, options: APIOptions = {}): Promise<Response> => {
  let attempts = 0;

  const tryFetch = async () => {
    const { method = 'GET', body, params } = options;

    const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
    const token = auth ? JSON.parse(auth) : null;
    if (!token) {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = '/login';
    }

    const headers: Record<string, string> = body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const data = body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined;

    const input = constructUrl(baseUrl, url, params);
    const response = await fetch(input, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${token.access}`,
      },
      body: data,
    });

    if (response.status === 401) {
      if (attempts > 0) {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = '/login';
      }
      await refreshToken();
      attempts += 1;

      return tryFetch();
    }

    return response;
  };

  return await tryFetch();
};
