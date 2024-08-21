import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Organization } from '../../types/organization';
import { CustomError } from '../../types/response';
import { OrganizationStore } from './types';

const organizationStore = create<OrganizationStore>((set) => {
  return {
    currentOrganization: null,
    allOrganizations: [],
    currentOrganizationSettings: null,

    setCurrentOrganization: (organization) => set({ currentOrganization: organization }),

    fetchAllOrganizations: async () => {
      const url = apiVersion.listOrganization.v1;
      const response = await api(url);
      const data: Organization[] = await response.json();
      set({ allOrganizations: data });
      if (data.length) {
        const org = data[0];
        set({ currentOrganization: org });
      } else {
        throw new CustomError('You are not a member of any organization.');
      }
    },
  };
});

export const useOrganizationStore = createSelectors(organizationStore);
