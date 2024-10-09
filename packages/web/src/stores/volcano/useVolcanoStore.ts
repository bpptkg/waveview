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

  fetchAllVolcanoes: async (slug) => {
    const currentOrganization = useOrganizationStore.getState().currentOrganization;
    if (!currentOrganization) {
      throw new CustomError('Organization is not set');
    }
    const response = await api(apiVersion.listVolcano.v1(currentOrganization.id));
    if (!response.ok) {
      throw CustomError.fromErrorData(await response.json());
    }

    const allVolcanoes: Volcano[] = await response.json();
    set({ allVolcanoes });
    if (allVolcanoes.length) {
      const currentVolcano = allVolcanoes.find((v) => v.slug === slug) || allVolcanoes[0];
      set({ currentVolcano });
      return currentVolcano;
    } else {
      throw new CustomError(`No volcanoes found for organization ${currentOrganization.name}`);
    }
  },
}));

export const useVolcanoStore = createSelectors(volcanoStore);
