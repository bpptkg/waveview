import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { getPickExtent, ONE_SECOND } from '../../../shared/time';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useOrganizationStore } from '../../organization';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { PickerStore, PickSlice } from '../slices';

export const createPickSlice: StateCreator<PickerStore, [], [], PickSlice> = (set, get) => {
  return {
    pickRange: [0, 0],
    pickMode: false,
    eventId: undefined,
    time: 0,
    duration: 0,
    eventTypeId: '',
    stationOfFirstArrivalId: '',
    note: '',
    attachments: [],
    setTime: (time) => {
      const pickStart = time;
      const pickEnd = pickStart + get().duration * ONE_SECOND;
      set({ time, pickRange: [pickStart, pickEnd] });
    },
    setDuration: (duration) => {
      const { time } = get();
      const pickStart = time;
      const pickEnd = pickStart + duration * ONE_SECOND;
      set({ duration, pickRange: [pickStart, pickEnd] });
    },
    setPickMode: (isActive) => {
      set({ pickMode: isActive });
    },
    setEventTypeId: (eventTypeId) => {
      set({ eventTypeId });
    },
    setStationOfFirstArrivalId: (stationId) => {
      set({ stationOfFirstArrivalId: stationId });
    },
    setNote: (note) => {
      set({ note });
    },
    addAttachment: (attachment) => {
      set((state) => {
        return { attachments: [...state.attachments, attachment] };
      });
    },
    removeAttachment: (attachmentId) => {
      set((state) => {
        return { attachments: state.attachments.filter((attachment) => attachment.id !== attachmentId) };
      });
    },
    resetEditing: () => {
      set({ eventId: undefined, time: 0, duration: 0, eventTypeId: '', stationOfFirstArrivalId: '', note: '', attachments: [], pickRange: [0, 0] });
    },
    setEditedEvent: (editedEvent) => {
      const [pickStart, pickEnd] = getPickExtent(editedEvent);
      const pickRange: [number, number] = [pickStart, pickEnd];
      const time = pickStart;
      const duration = (pickEnd - pickStart) / ONE_SECOND;
      const eventTypeId = editedEvent.type.id;
      const stationOfFirstArrivalId = editedEvent.station_of_first_arrival_id;
      const note = editedEvent.note;
      const attachments = editedEvent.attachments;
      const eventId = editedEvent.id;
      set({ pickRange, eventId, time, duration, eventTypeId, stationOfFirstArrivalId, note, attachments });
    },
    isPickEmpty: () => {
      const { pickRange } = get();
      const [pickStart, pickEnd] = pickRange;
      return pickStart === 0 && pickEnd === 0;
    },
    clearPick: () => {
      set({ pickRange: [0, 0] });
    },
    setPickRange: (range) => {
      const [pickStart, pickEnd] = range;
      let duration = (pickEnd - pickStart) / ONE_SECOND;
      duration = parseFloat(duration.toFixed(2));
      set({ pickRange: [pickStart, pickEnd], time: pickStart, duration });
    },
    savePickedEvent: async () => {
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

      const { eventId, time, duration, eventTypeId, stationOfFirstArrivalId, note, attachments } = get();

      const payload = {
        station_of_first_arrival_id: stationOfFirstArrivalId,
        time: new Date(time).toISOString(),
        duration: duration,
        type_id: eventTypeId,
        note: note,
        method: 'waveview',
        evaluation_mode: 'automatic',
        evaluation_status: 'confirmed',
        attachment_ids: attachments.map((attachment) => attachment.id),
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

      const url = eventId
        ? apiVersion.updateEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId)
        : apiVersion.createEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id);

      const method: 'PUT' | 'POST' = eventId ? 'PUT' : 'POST';

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
