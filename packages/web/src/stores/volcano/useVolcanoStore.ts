import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Volcano } from '../../types/volcano';
import { useOrganizationStore } from '../org';
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
    if (data.length) {
      const volcano = data[0];
      set({ currentVolcano: volcano });
    }
  },
}));

export const useVolcanoStore = createSelectors(volcanoStore);
