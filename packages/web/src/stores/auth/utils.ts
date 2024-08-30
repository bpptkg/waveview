import { JwtToken } from '../../types/auth';
import { AUTH_KEY } from './constants';

export const getJwtToken = (): JwtToken | null => {
  const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
  const token = auth ? JSON.parse(auth) : null;
  return token;
};

export const removeJwtToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_KEY);
  }
};

export const setJwtToken = (token: JwtToken) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(token));
  }
};
