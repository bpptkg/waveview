import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Organization, OrganizationSettings } from '../../types/organization';
import { OrganizationStore } from './types';

const organizationStore = create<OrganizationStore>((set, get) => {
  return {
    organization: null,
    organizations: [],
    organizationSettings: null,
    setOrganizations: (organizations) => set({ organizations }),
    setOrganization: (organization) => set({ organization }),
    fetchOrganizations: async () => {
      const url = apiVersion.listOrganization.v1;
      const data = await api<Organization[]>(url);
      set({ organizations: data });
      if (data.length) {
        const org = data[0];
        set({ organization: org });
        await get().fetchOrganizationSettings(org.id);
      }
    },
    fetchOrganization: async (id: string) => {
      const url = apiVersion.getOrganization.v1(id);
      const data = await api<Organization>(url);
      set({ organization: data });
    },
    fetchOrganizationSettings: async (id: string) => {
      const url = apiVersion.getOrganizationSettings.v1(id);
      const data = await api<OrganizationSettings>(url);
      set({ organizationSettings: data });
    },
  };
});

export const useOrganizationStore = createSelectors(organizationStore);
