import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { EventPayload } from '../../../types/event';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useOrganizationStore } from '../../organization';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { PickSlice, PickerStore } from '../slices';
import { getPickExtent } from '../../../shared/time';

export const createPickSlice: StateCreator<PickerStore, [], [], PickSlice> = (set, get) => {
  return {
    pickStart: 0,
    pickEnd: 0,
    editedEvent: undefined,
    setEditedEvent: (editedEvent) => {
      const [pickStart, pickEnd] = getPickExtent(editedEvent);
      set({ editedEvent, pickStart, pickEnd });
    },
    resetEditedEvent: () => {
      set({ editedEvent: undefined });
    },
    isPickEmpty: () => get().pickStart === 0 && get().pickEnd === 0,
    setPickStart: (start) => set({ pickStart: start }),
    setPickEnd: (end) => set({ pickEnd: end }),
    clearPick: () => {
      set({ pickStart: 0, pickEnd: 0 });
    },
    setPickRange: (range) => {
      const [pickStart, pickEnd] = range;
      set({ pickStart, pickEnd });
    },
    savePickedEvent: async (event) => {
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

      const payload: EventPayload = {
        station_of_first_arrival_id: event.stationOfFirstArrival,
        time: new Date(event.time).toISOString(),
        duration: event.duration,
        type_id: event.eventType,
        note: event.note,
        method: event.method,
        evaluation_mode: event.evaluation_mode,
        evaluation_status: event.evaluation_status,
        attachment_ids: event.attachment_ids,
      };

      const makeApiRequest = async (url: string, method: 'PUT' | 'POST', payload: any) => {
        const response = await api(url, {
          method,
          body: payload,
        });
        if (!response.ok) {
          const err: ErrorData = await response.json();
          throw CustomError.fromErrorData(err);
        }
        return await response.json();
      };

      const url = event.eventId
        ? apiVersion.updateEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, event.eventId)
        : apiVersion.createEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id);

      const method: 'PUT' | 'POST' = event.eventId ? 'PUT' : 'POST';

      return await makeApiRequest(url, method, payload);
    },

    fetchEditedEvent: async (eventId) => {
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

      const url = apiVersion.getEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId);
      const response = await api(url);
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      return await response.json();
    },
  };
};
