import { create } from 'zustand';
import { api, baseUrl } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { JwtToken } from '../../types/auth';
import { CustomError } from '../../types/response';
import { AUTH_KEY } from './constants';
import { AuthStore } from './types';

const authStore = create<AuthStore>((set, get) => {
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

    fetchToken: async (credentials) => {
      const { username, password } = credentials;
      const url = new URL(`${baseUrl}${apiVersion.login.v1}`);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (!response.ok) {
        throw new CustomError(
          `The username and password you entered did not match our records. 
          Please double-check and try again.`
        );
      }
      const data: JwtToken = await response.json();
      get().setToken(data);
    },

    refreshToken: async () => {
      const response = await api(apiVersion.refreshToken.v1, {
        method: 'POST',
        body: {
          refresh: token?.refresh,
        },
      });
      const data: JwtToken = await response.json();
      get().setToken(data);
    },

    blacklistToken: async () => {
      await api(apiVersion.logout.v1, {
        method: 'POST',
        body: {
          refresh: token?.refresh,
        },
      });
      get().clearToken();
    },
  };
});

export const useAuthStore = createSelectors(authStore);
