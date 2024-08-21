import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Hypocenter } from '../../types/hypocenter';
import { CustomError } from '../../types/response';
import { useCatalogStore } from '../catalog';
import { useOrganizationStore } from '../organization';
import { HypocenterStore } from './types';
import { useVolcanoStore } from '../volcano/useVolcanoStore';

const hypocenterStore = create<HypocenterStore>((set) => {
  return {
    hypocenter: null,
    loading: false,
    error: '',

    fetchHypocenter: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog is not set');
      }

      set({ loading: true });
      try {
        const response = await api(apiVersion.getHypocenter.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id));
        const data: Hypocenter = await response.json();
        set({ hypocenter: data });
      } catch (error: unknown) {
        const err = error as Error;
        set({ error: err.message });
      } finally {
        set({ loading: false });
      }
    },
  };
});

export const useHypocenterStore = createSelectors(hypocenterStore);
