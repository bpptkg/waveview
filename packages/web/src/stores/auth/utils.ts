import { JwtToken } from '../../types/auth';
import { AUTH_KEY } from './constants';

export const getJwtToken = (): JwtToken | null => {
  const auth = window.localStorage.getItem(AUTH_KEY);
  const token = auth ? JSON.parse(auth) : null;
  return token;
};

export const removeJwtToken = () => {
  window.localStorage.removeItem(AUTH_KEY);
};

export const setJwtToken = (token: JwtToken) => {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(token));
};
