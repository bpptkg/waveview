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
    setCurrentCatalog: (catalog) => set({ currentCatalog: catalog }),
    /**
     * Fetches all catalogs from the organization where the user is a member of
     * and sets the default catalog.
     */
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
    /**
     * Fetches the events from the current catalog at page 1.
     */
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
        },
      });
      const data: Pagination<SeismicEvent[]> = await response.json();
      set({ events: data.results, nextEventsUrl: data.next });
    },
    /**
     * Fetches the next page of events from the current catalog.
     */
    fetchNextEvents: async () => {
      const { nextEventsUrl } = get();
      if (!nextEventsUrl) {
        return;
      }

      const response = await api(nextEventsUrl);
      const data: Pagination<SeismicEvent[]> = await response.json();
      set((state) => ({ events: [...state.events, ...data.results], nextEventsUrl: data.next }));
    },
    /**
     * True if there are more events to fetch.
     */
    hasNextEvents: () => {
      const { nextEventsUrl } = get();
      return !!nextEventsUrl;
    },
    /**
     * Removes an event from the list of events.
     */
    removeEvent: (eventId) => {
      set((state) => ({ events: state.events.filter((event) => event.id !== eventId) }));
    },
  };
});

export const useCatalogStore = createSelectors(catalogStore);
