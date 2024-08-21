import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { CustomError } from '../../types/response';
import { Volcano } from '../../types/volcano';
import { useOrganizationStore } from '../organization';
import { VolcanoStore } from './types';

const volcanoStore = create<VolcanoStore>((set) => ({
  currentVolcano: null,
  allVolcanoes: [],

  setCurrentVolcano: (volcano) => set({ currentVolcano: volcano }),

  fetchAllVolcanoes: async () => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      return;
    }
    const response = await api(apiVersion.listVolcano.v1(currentOrganization.id));
    if (!response.ok) {
      throw CustomError.fromErrorData(await response.json());
    }

    const data: Volcano[] = await response.json();
    set({ allVolcanoes: data });

    const defaultVolcano = data.find((v) => v.is_default);
    const volcano = defaultVolcano || data[0];
    if (volcano) {
      set({ currentVolcano: defaultVolcano });
    } else {
      throw new CustomError('No default volcano found.');
    }
  },
}));

export const useVolcanoStore = createSelectors(volcanoStore);
