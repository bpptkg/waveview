import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { CustomError } from '../../types/response';
import { Volcano } from '../../types/volcano';
import { useOrganizationStore } from '../organization';
import { VolcanoStore } from './types';

const volcanoStore = create<VolcanoStore>((set, get) => ({
  currentVolcano: null,
  allVolcanoes: [],
  setCurrentVolcano: (volcano) => set({ currentVolcano: volcano }),
  setCurrentVolcanoById: async (id) => {
    const volcanoes = get().allVolcanoes;
    const volcano = volcanoes.find((volcano) => volcano.id === id);
    if (volcano) {
      set({ currentVolcano: volcano });
    }
  },
  /**
   * Fetches all volcanoes from the organization where the user is a member of
   * and sets the default volcano.
   */
  fetchAllVolcanoes: async () => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      return;
    }
    const response = await api(apiVersion.listVolcano.v1(currentOrganization.id));
    const data: Volcano[] = await response.json();
    set({ allVolcanoes: data });

    const defaultVolcano = data.find((v) => v.is_default);
    const volcano = defaultVolcano || data[0];
    if (volcano) {
      set({ currentVolcano: defaultVolcano });
    } else {
      throw new CustomError('No default volcano found');
    }
  },
}));

export const useVolcanoStore = createSelectors(volcanoStore);
