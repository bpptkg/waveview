import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Catalog } from '../../types/catalog';
import { EventQueryParams, SeismicEvent } from '../../types/event';
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
    filterData: {
      eventTypes: undefined,
      startDate: undefined,
      endDate: undefined,
      isBookmarked: undefined,
    },
    initialFetch: false,
    setInitialFetch: (initialFetch) => set({ initialFetch }),

    setCurrentCatalog: (catalog) => set({ currentCatalog: catalog }),

    setLoading: (loading) => set({ loading }),

    fetchAllCatalogs: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }

      const url = apiVersion.listCatalog.v1(currentOrganization.id, currentVolcano.id);
      const response = await api(url);
      const data: Catalog[] = await response.json();
      set({ allCatalogs: data });

      const defaultCatalog = data.find((c) => c.is_default);
      if (defaultCatalog) {
        set({ currentCatalog: defaultCatalog });
      } else {
        throw new CustomError(`No default catalog found for volcano ${currentVolcano.name}`);
      }
    },
    setNextEventsUrl: (url) => set({ nextEventsUrl: url }),

    fetchEvents: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { currentCatalog } = catalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog is not set');
      }

      const { filterData } = get();

      const url = apiVersion.listEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id);
      const { startDate, endDate, eventTypes, isBookmarked } = filterData;
      const params: EventQueryParams = {
        page: 1,
        ordering: 'desc',
      };
      if (startDate) {
        params.start = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.end = new Date(endDate).toISOString();
      }
      if (eventTypes) {
        params.event_types = eventTypes.join(',');
      }
      if (isBookmarked) {
        params.is_bookmarked = 'true';
      }

      set({ loading: true });
      try {
        const response = await api(url, {
          params,
        });
        const data: Pagination<SeismicEvent[]> = await response.json();
        set({ events: data.results, nextEventsUrl: data.next });
      } finally {
        set({ loading: false });
      }
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

    setFilterData: (data) => {
      set({ filterData: data });
    },
  };
});

export const useCatalogStore = createSelectors(catalogStore);
