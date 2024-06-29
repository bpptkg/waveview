import { create } from 'zustand';
import { createSelectors } from '../shared/createSelectors';

export const AUTH_KEY = 'wv:auth';

export interface JwtToken {
  access: string;
  refresh: string;
}

export interface AuthStore {
  token: JwtToken | null;
  setToken: (token: JwtToken) => void;
  clearToken: () => void;
}

const authStore = create<AuthStore>((set) => {
  const auth = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null;
  const token = auth ? JSON.parse(auth) : null;

  return {
    token,

    setToken: (token) => {
      set({ token });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(token));
      }
    },

    clearToken: () => {
      set({ token: null });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_KEY);
      }
    },
  };
});

export const useAuthStore = createSelectors(authStore);
