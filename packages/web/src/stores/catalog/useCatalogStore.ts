import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Catalog } from '../../types/catalog';
import { SeismicEvent } from '../../types/event';
import { Pagination } from '../../types/pagination';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { CatalogStore } from './types';

const catalogStore = create<CatalogStore>((set, get) => {
  return {
    currentCatalog: null,
    allCatalogs: [],
    events: [],
    nextEventsUrl: null,
    loading: false,

    setCurrentCatalog: (catalog) => set({ currentCatalog: catalog }),

    setLoading: (loading) => set({ loading }),

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
      const response = await api(url);
      const data: Catalog[] = await response.json();
      set({ allCatalogs: data });

      const defaultCatalog = data.find((c) => c.is_default);
      if (defaultCatalog) {
        set({ currentCatalog: defaultCatalog });
      } else {
        throw new CustomError('No default catalog found');
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
      const response = await api(url, {
        params: {
          page: 1,
          ordering: 'desc',
        },
      });
      const data: Pagination<SeismicEvent[]> = await response.json();
      set({ events: data.results, nextEventsUrl: data.next });
    },

    fetchNextEvents: async () => {
      const { nextEventsUrl } = get();
      if (!nextEventsUrl) {
        return;
      }

      set({ loading: true });
      try {
        const response = await api(nextEventsUrl);
        const data: Pagination<SeismicEvent[]> = await response.json();
        set((state) => ({ events: [...state.events, ...data.results], nextEventsUrl: data.next }));
      } finally {
        set({ loading: false });
      }
    },

    hasNextEvents: () => {
      const { nextEventsUrl } = get();
      return !!nextEventsUrl;
    },

    removeEvent: (eventId) => {
      set((state) => ({ events: state.events.filter((event) => event.id !== eventId) }));
    },

    updateEvent: (event) => {
      set((state) => ({
        events: state.events.map((e) => (e.id === event.id ? event : e)),
      }));
    },
  };
});

export const useCatalogStore = createSelectors(catalogStore);
