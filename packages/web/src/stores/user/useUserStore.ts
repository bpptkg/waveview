import { create } from 'zustand';
import { baseUrl } from '../../services/api';
import { createSelectors } from '../../shared/createSelectors';
import { User } from '../../types/user';
import { useAuthStore } from '../auth/useAuthStore';
import { UserStore } from './types';

const userStore = create<UserStore>((set, get) => ({
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
  isAdmin: () => get().user?.is_staff || get().user?.is_superuser || false,
  isSuperuser: () => get().user?.is_superuser || false,
}));

export const useUserStore = createSelectors(userStore);
