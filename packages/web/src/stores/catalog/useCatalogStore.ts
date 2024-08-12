import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Catalog } from '../../types/catalog';
import { SeismicEvent } from '../../types/event';
import { Pagination } from '../../types/pagination';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { CatalogStore } from './types';

const catalogStore = create<CatalogStore>((set, get) => {
  return {
    currentCatalog: null,
    allCatalogs: [],
    events: [],
    nextEventsUrl: null,
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
        throw new Error('No default catalog found');
      }
    },
    setNextEventsUrl: (url) => set({ nextEventsUrl: url }),
    fetchEvents: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        return;
      }

      const { currentCatalog } = catalogStore.getState();
      if (!currentCatalog) {
        return;
      }

      const url = apiVersion.listEvent.v1(currentOrganization.id, currentCatalog.id);
      const data = await api<Pagination<SeismicEvent[]>>(url, {
        params: {
          page: 1,
        },
      });
      set({ events: data.results, nextEventsUrl: data.next });
    },
    fetchNextEvents: async () => {
      const { nextEventsUrl } = get();
      if (!nextEventsUrl) {
        return;
      }

      const data = await api<Pagination<SeismicEvent[]>>(nextEventsUrl);
      set((state) => ({ events: [...state.events, ...data.results], nextEventsUrl: data.next }));
    },
    hasNextEvents: () => {
      const { nextEventsUrl } = get();
      return !!nextEventsUrl;
    },
  };
});

export const useCatalogStore = createSelectors(catalogStore);
