import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { CreateEventPayload } from '../../../types/event';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useOrganizationStore } from '../../organization';
import { PickSlice, PickerStore } from '../slices';

export const createPickSlice: StateCreator<PickerStore, [], [], PickSlice> = (set, get) => {
  return {
    pickStart: 0,
    pickEnd: 0,
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
    /**
     * Saves the picked event to the API.
     */
    savePickedEvent: async (event) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('No organization selected');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('No catalog selected');
      }

      const payload: CreateEventPayload = {
        station_of_first_arrival_id: event.stationOfFirstArrival,
        time: new Date(event.time).toISOString(),
        duration: event.duration,
        type_id: event.eventType,
        note: event.note,
        method: 'waveview',
        evaluation_mode: 'manual',
        evaluation_status: 'confirmed',
        attachment_ids: [],
      };
      const response = await api(apiVersion.createEvent.v1(currentOrganization.id, currentCatalog.id), {
        method: 'POST',
        body: payload,
      });
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      return await response.json();
    },
  };
};
