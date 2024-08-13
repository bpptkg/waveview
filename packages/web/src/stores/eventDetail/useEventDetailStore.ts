import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { EventBookmarkResponse, SeismicEventDetail } from '../../types/event';
import { useCatalogStore } from '../catalog';
import { useInventoryStore } from '../inventory';
import { useOrganizationStore } from '../organization';
import { EventDetailStore } from './types';

const cache = new Map<string, SeismicEventDetail>();

const eventDetailStore = create<EventDetailStore>((set, get) => ({
  eventId: '',
  event: null,
  loading: false,
  error: null,
  setEventId: (eventId) => set({ eventId }),
  hasEventId: (eventId) => get().eventId === eventId,
  fetchEvent: async (eventId) => {
    if (cache.has(eventId)) {
      set({ eventId, event: cache.get(eventId) });
      return;
    }

    set({ error: null });

    try {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new Error('Organization is not set');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new Error('Catalog is not set');
      }

      set({ loading: true });
      const data = await api<SeismicEventDetail>(apiVersion.getEvent.v1(currentOrganization.id, currentCatalog.id, eventId));
      set({ eventId, event: data, loading: false });
      cache.set(eventId, data);
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  getStationOfFirstArrival: () => {
    const { event } = get();
    if (!event) {
      return '';
    }
    const { stations } = useInventoryStore.getState();
    return stations().find((station) => station.id === event.station_of_first_arrival_id)?.code || '';
  },
  bookmarkEvent: async () => {
    const { currentOrganization } = useOrganizationStore.getState();
    if (!currentOrganization) {
      throw new Error('Organization is not set');
    }
    const { currentCatalog } = useCatalogStore.getState();
    if (!currentCatalog) {
      throw new Error('Catalog is not set');
    }
    const { eventId } = get();
    if (!eventId) {
      throw new Error('Event ID is not set');
    }

    const data = await api<EventBookmarkResponse>(apiVersion.bookmarkEvent.v1(currentOrganization.id, currentCatalog.id, eventId), {
      method: 'POST',
    });
    set((state) => ({ event: state.event ? { ...state.event, is_bookmarked: data.is_bookmarked } : null }));
  },
  clearCache: () => {
    cache.clear();
  },
}));

export const useEventDetailStore = createSelectors(eventDetailStore);
