import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
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
  fetchAllVolcanoes: async () => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      return;
    }
    const data = await api<Volcano[]>(apiVersion.listVolcano.v1(currentOrganization.id));
    set({ allVolcanoes: data });

    const defaultVolcano = data.find((v) => v.is_default);
    const volcano = defaultVolcano || data[0];
    if (volcano) {
      set({ currentVolcano: defaultVolcano });
    } else {
      throw new Error('No default volcano found');
    }
  },
}));

export const useVolcanoStore = createSelectors(volcanoStore);
