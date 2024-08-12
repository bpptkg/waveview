import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Catalog } from '../../types/catalog';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { CatalogStore } from './types';

const catalogStore = create<CatalogStore>((set) => {
  return {
    currentCatalog: null,
    allCatalogs: [],
    setCurrentCatalog: (catalog) => set({ currentCatalog: catalog }),
    fetchAllCatalogs: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        return;
      }

      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        return;
      }

      const url = apiVersion.listCatalog.v1(currentOrganization.id, currentVolcano.id);
      const data = await api<Catalog[]>(url);
      set({ allCatalogs: data });

      const defaultCatalog = data.find((c) => c.is_default);
      if (defaultCatalog) {
        set({ currentCatalog: defaultCatalog });
      } else {
        throw new Error('No default catalog found.');
      }
    },
  };
});

export const useCatalogStore = createSelectors(catalogStore);
