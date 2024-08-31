import { create } from 'zustand';
import { baseUrl } from '../../services/api';
import { createSelectors } from '../../shared/createSelectors';
import { UserDetail } from '../../types/user';
import { useAuthStore } from '../auth/useAuthStore';
import { useOrganizationStore } from '../organization';
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
    const user: UserDetail = await response.json();
    set({ user });
  },

  isAdmin: () => get().user?.is_staff || get().user?.is_superuser || false,

  isSuperuser: () => get().user?.is_superuser || false,

  hasPermission: (permission) => {
    const { currentOrganization } = useOrganizationStore.getState();
    const { user } = get();
    if (!currentOrganization || !user) {
      return false;
    }
    if (currentOrganization.author.id === user.id) {
      return true;
    }
    const membership = user.organization_memberships.find((m) => m.organization.id === currentOrganization.id);
    if (!membership) {
      return false;
    }
    return membership.roles.some((r) => r.permissions.includes(permission));
  },
}));

export const useUserStore = createSelectors(userStore);
