import { getJwtToken, removeJwtToken, setJwtToken } from '../stores/auth/utils';
import { JwtToken } from '../types/auth';
import apiVersion from './apiVersion';

export const baseUrl = import.meta.env.VITE_API_URL as string;
export const wsUrl = import.meta.env.VITE_WS_URL as string;

export interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
}

export const gotoLogin = () => {
  removeJwtToken();
  window.location.href = '/login';
};

export interface RefreshTokenOptions {
  saveToken?: boolean;
}

export const refreshToken = async (options?: RefreshTokenOptions): Promise<JwtToken> => {
  const { saveToken = true } = options || {};

  const token = getJwtToken();
  if (!token) {
    gotoLogin();
  }
  const { refresh } = token!;

  const response = await fetch(`${baseUrl}${apiVersion.refreshToken.v1}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: refresh,
    }),
  });

  if (response.status === 401) {
    gotoLogin();
  }

  const { access } = (await response.json()) as JwtToken;
  if (access && saveToken) {
    setJwtToken({
      access,
      refresh,
    });
  }
  return { access, refresh } as JwtToken;
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

  const tryFetch = async (): Promise<Response> => {
    const { method = 'GET', body, params } = options;

    const token = getJwtToken();
    if (!token) {
      gotoLogin();
    }

    const { access } = token!;
    const headers: Record<string, string> = body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const data = body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined;

    const input = constructUrl(baseUrl, url, params);
    const response = await fetch(input, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${access}`,
      },
      body: data,
    });

    if (response.status === 401) {
      if (attempts > 0) {
        gotoLogin();
      }
      await refreshToken();
      attempts += 1;

      return tryFetch();
    }

    attempts = 0;

    return response;
  };

  return await tryFetch();
};
