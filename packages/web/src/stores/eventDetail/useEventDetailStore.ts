import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { EventBookmarkResponse, SeismicEventDetail } from '../../types/event';
import { CustomError, ErrorData } from '../../types/response';
import { useCatalogStore } from '../catalog';
import { useInventoryStore } from '../inventory';
import { useOrganizationStore } from '../organization';
import { EventDetailStore } from './types';
import { useVolcanoStore } from '../volcano/useVolcanoStore';

const cache = new Map<string, SeismicEventDetail>();

const eventDetailStore = create<EventDetailStore>((set, get) => ({
  eventId: '',
  event: null,
  loading: false,
  error: null,

  setEvent: (event) => set({ event, eventId: event.id }),

  setEventId: (eventId) => set({ eventId }),

  hasEventId: (eventId) => get().eventId === eventId,

  fetchEvent: async (eventId, options = {}) => {
    const { clearCache } = options;
    if (clearCache) {
      cache.delete(eventId);
    }

    if (cache.has(eventId)) {
      set({ eventId, event: cache.get(eventId) });
      return;
    }

    set({ error: null });

    try {
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

      const response = await api(apiVersion.getEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId));
      if (response.status === 404) {
        throw new CustomError('Event not found');
      }

      const data: SeismicEventDetail = await response.json();
      set({ eventId, event: data, loading: false });
      cache.set(eventId, data);
    } catch (error) {
      set({ loading: false, error: (error as CustomError).message });
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
    const { eventId } = get();
    if (!eventId) {
      throw new CustomError('Event ID is not set');
    }

    const response = await api(apiVersion.bookmarkEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId), {
      method: 'POST',
    });
    const data: EventBookmarkResponse = await response.json();
    set((state) => ({ event: state.event ? { ...state.event, is_bookmarked: data.is_bookmarked } : null }));
  },

  clearCache: () => {
    cache.clear();
  },

  deleteEvent: async () => {
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
    const { eventId } = get();
    if (!eventId) {
      throw new CustomError('Event ID is not set');
    }

    const response = await api(apiVersion.deleteEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId), { method: 'DELETE' });
    if (!response.ok) {
      const err: ErrorData = await response.json();
      throw CustomError.fromErrorData(err);
    }
  },
}));

export const useEventDetailStore = createSelectors(eventDetailStore);
