import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Organization } from '../../types/organization';
import { OrganizationStore } from './types';

const organizationStore = create<OrganizationStore>((set) => {
  return {
    organization: null,
    organizations: [],
    setOrganizations: (organizations) => set({ organizations }),
    setOrganization: (organization) => set({ organization }),
    fetchOrganizations: async () => {
      const url = apiVersion.listOrganization.v1;
      const data = await api<Organization[]>(url);
      set({ organizations: data });
      if (data.length) {
        set({ organization: data[0] });
      }
    },
  };
});

export const useOrganizationStore = createSelectors(organizationStore);
