import { create } from 'zustand';
import { baseUrl } from '../services/api';
import { createSelectors } from '../shared/createSelectors';
import { User } from '../types/user';
import { useAuthStore } from './auth';

export interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
}

export type UserStore = UserState;

const userStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    const accessToken = useAuthStore.getState().token?.access;
    const url = `${baseUrl}/api/v1/account/`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const user: User = await response.json();
    set({ user });
  },
}));

export const useUserStore = createSelectors(userStore);
