import { create } from 'zustand';
import { api, baseUrl } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { JwtToken } from '../../types/auth';
import { CustomError } from '../../types/response';
import { AUTH_KEY } from './constants';
import { AuthStore } from './types';
import { getJwtToken, removeJwtToken } from './utils';

const authStore = create<AuthStore>((set, get) => {
  return {
    token: getJwtToken(),

    setToken: (token) => {
      set({ token });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(token));
      }
    },

    clearToken: () => {
      set({ token: null });
      removeJwtToken();
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
      const token = get().token;
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
      const token = get().token;
      if (token) {
        await api(apiVersion.logout.v1, {
          method: 'POST',
          body: {
            refresh: token?.refresh,
          },
        });
      }
      get().clearToken();
    },

    hasToken: () => {
      return !!get().token;
    },
  };
});

export const useAuthStore = createSelectors(authStore);
