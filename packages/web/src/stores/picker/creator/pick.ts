import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { getPickExtent, ONE_SECOND } from '../../../shared/time';
import { SignalAmplitude, SignalAmplitudePayload } from '../../../types/amplitude';
import { EventPayload, ManualAmplitude, SeismicEventDetail } from '../../../types/event';
import { ExplosionEvent, ObservationPayload, PyroclasticFlowEvent, RockfallEvent, TectonicEvent, VolcanicEmissionEvent } from '../../../types/observation';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useEventTypeStore } from '../../eventType';
import { useInventoryStore } from '../../inventory';
import { useOrganizationStore } from '../../organization';
import {
  useExplosionEventStore,
  usePyroclasticFlowEventStore,
  useRockfallEventStore,
  useTectonicEventStore,
  useVolcanicEmissionEventStore,
} from '../../visual';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { PickerStore, PickSlice } from '../slices';

export const createPickSlice: StateCreator<PickerStore, [], [], PickSlice> = (set, get) => {
  return {
    pickRange: [0, 0],
    pickMode: true,
    eventId: undefined,
    time: 0,
    duration: 0,
    eventTypeId: '',
    stationOfFirstArrivalId: '',
    note: '',
    attachments: [],
    amplitudes: [],
    editedEvent: null,
    isCalculatingAmplitudes: false,
    useOutlierFilter: false,
    manualAmplitudes: [],

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
      set({
        eventId: undefined,
        time: 0,
        duration: 0,
        eventTypeId: '',
        stationOfFirstArrivalId: '',
        note: '',
        attachments: [],
        amplitudes: [],
        pickRange: [0, 0],
        editedEvent: null,
        manualAmplitudes: [],
        useOutlierFilter: false,
        isCalculatingAmplitudes: false,
      });
    },

    setEditedEvent: (editedEvent) => {
      const { getChannelById } = useInventoryStore.getState();
      const { pickerConfig } = get();
      const [pickStart, pickEnd] = getPickExtent(editedEvent);
      const pickRange: [number, number] = [pickStart, pickEnd];
      const time = pickStart;
      const duration = (pickEnd - pickStart) / ONE_SECOND;
      const eventTypeId = editedEvent.type.id;
      const stationOfFirstArrivalId = editedEvent.station_of_first_arrival_id;
      const note = editedEvent.note;
      const attachments = editedEvent.attachments;
      const eventId = editedEvent.id;
      const amplitudes = editedEvent.amplitudes
        .filter((amplitude) => {
          return pickerConfig?.data.amplitude_config.channels.map((channel) => channel.channel_id).includes(amplitude.waveform_id);
        })
        .map(
          (amplitude) =>
            ({
              amplitude: amplitude.amplitude,
              unit: amplitude.unit,
              stream_id: getChannelById(amplitude.waveform_id)?.stream_id || '',
              type: amplitude.type,
              category: amplitude.category,
              time: amplitude.time,
              duration: amplitude.duration,
              label: amplitude.label,
            } as SignalAmplitude)
        );
      const manual_inputs = pickerConfig?.data.amplitude_config.manual_inputs || [];
      const manualAmplitudes: ManualAmplitude[] = [];
      manual_inputs.forEach((manualInput) => {
        const amplitude = editedEvent.amplitudes.find(
          (amplitude) => amplitude.waveform_id === manualInput.channel_id && amplitude.method === manualInput.method
        );
        if (amplitude) {
          manualAmplitudes.push({
            channel_id: manualInput.channel_id,
            amplitude: amplitude.amplitude,
            type: amplitude.type,
            label: manualInput.label,
            method: amplitude.method,
            category: amplitude.category,
            unit: amplitude.unit,
            is_preferred: manualInput.is_preferred,
            time: amplitude.time,
            begin: amplitude.begin,
            end: amplitude.end,
          });
        } else {
          manualAmplitudes.push({
            channel_id: manualInput.channel_id,
            amplitude: null,
            type: manualInput.type,
            label: manualInput.label,
            method: manualInput.method,
            category: manualInput.category,
            unit: manualInput.unit,
            is_preferred: manualInput.is_preferred,
            time: new Date(pickStart).toISOString(),
            begin: 0,
            end: duration,
          });
        }
      });

      set({ pickRange, eventId, time, duration, eventTypeId, stationOfFirstArrivalId, note, attachments, amplitudes, editedEvent, manualAmplitudes });

      const { observation } = editedEvent;
      if (observation) {
        const explosionEventStore = useExplosionEventStore.getState();
        const pyroclasticFlowEventStore = usePyroclasticFlowEventStore.getState();
        const rockfallEventStore = useRockfallEventStore.getState();
        const tectonicEventStore = useTectonicEventStore.getState();
        const volcanicEmissionEventStore = useVolcanicEmissionEventStore.getState();

        const { eventTypes } = useEventTypeStore.getState();
        const observationType = eventTypes.find((et) => et.id === eventTypeId)?.observation_type;
        switch (observationType) {
          case 'explosion':
            explosionEventStore.fromEvent(observation as ExplosionEvent);
            break;
          case 'pyroclastic_flow':
            pyroclasticFlowEventStore.fromEvent(observation as PyroclasticFlowEvent);
            break;
          case 'rockfall':
            rockfallEventStore.fromEvent(observation as RockfallEvent);
            break;
          case 'tectonic':
            tectonicEventStore.fromEvent(observation as TectonicEvent);
            break;
          case 'volcanic_emission':
            volcanicEmissionEventStore.fromEvent(observation as VolcanicEmissionEvent);
            break;
          default:
            break;
        }
      }
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

      const { pickerConfig } = get();
      const manual_inputs = pickerConfig?.data.amplitude_config.manual_inputs || [];
      const manualAmplitudes: ManualAmplitude[] = [];
      manual_inputs.forEach((manualInput) => {
        manualAmplitudes.push({
          channel_id: manualInput.channel_id,
          amplitude: null,
          type: manualInput.type,
          label: manualInput.label,
          method: manualInput.method,
          category: manualInput.category,
          unit: manualInput.unit,
          is_preferred: manualInput.is_preferred,
          time: new Date(pickStart).toISOString(),
          begin: 0,
          end: duration,
        });
      });

      set({ pickRange: [pickStart, pickEnd], time: pickStart, duration, manualAmplitudes });
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

      const { eventId, time, duration, eventTypeId, stationOfFirstArrivalId, note, attachments, useOutlierFilter, manualAmplitudes } = get();

      const explosionEventStore = useExplosionEventStore.getState();
      const pyroclasticFlowEventStore = usePyroclasticFlowEventStore.getState();
      const rockfallEventStore = useRockfallEventStore.getState();
      const tectonicEventStore = useTectonicEventStore.getState();
      const volcanicEmissionEventStore = useVolcanicEmissionEventStore.getState();

      const { eventTypes } = useEventTypeStore.getState();
      const observationType = eventTypes.find((et) => et.id === eventTypeId)?.observation_type;
      let observation: ObservationPayload | null = null;
      switch (observationType) {
        case 'explosion':
          observation = explosionEventStore.getPayload();
          break;
        case 'pyroclastic_flow':
          observation = pyroclasticFlowEventStore.getPayload();
          break;
        case 'rockfall':
          observation = rockfallEventStore.getPayload();
          break;
        case 'tectonic':
          observation = tectonicEventStore.getPayload();
          break;
        case 'volcanic_emission':
          observation = volcanicEmissionEventStore.getPayload();
          break;
        default:
          break;
      }

      const payload: EventPayload = {
        station_of_first_arrival_id: stationOfFirstArrivalId,
        time: new Date(time).toISOString(),
        duration: duration,
        type_id: eventTypeId,
        note: note,
        method: 'veps',
        evaluation_mode: 'manual',
        evaluation_status: 'confirmed',
        attachment_ids: attachments.map((attachment) => attachment.id),
        observation: observation,
        use_outlier_filter: useOutlierFilter,
        amplitude_manual_inputs: manualAmplitudes,
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
      const eventDetail: SeismicEventDetail = await makeApiRequest(url, method, payload);

      explosionEventStore.reset();
      pyroclasticFlowEventStore.reset();
      rockfallEventStore.reset();
      tectonicEventStore.reset();
      volcanicEmissionEventStore.reset();

      return eventDetail;
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

    deleteEvent: async (eventId) => {
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

      const url = apiVersion.deleteEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id, eventId);
      const response = await api(url, { method: 'DELETE' });
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
    },

    calcSignalAmplitudes: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { time, duration, isCalculatingAmplitudes, useOutlierFilter } = get();
      const payload: SignalAmplitudePayload = {
        time: new Date(time).toISOString(),
        duration: duration,
        use_outlier_filter: useOutlierFilter,
      };
      if (isCalculatingAmplitudes) {
        return;
      }
      set({ isCalculatingAmplitudes: true });
      try {
        const response = await api(apiVersion.calcSignalAmplitude.v1(currentOrganization.id, currentVolcano.id), {
          method: 'POST',
          body: payload,
        });
        if (!response.ok) {
          const err: ErrorData = await response.json();
          throw CustomError.fromErrorData(err);
        }
        const amplitudes: SignalAmplitude[] = await response.json();
        set({ amplitudes });
      } finally {
        set({ isCalculatingAmplitudes: false });
      }
    },

    setUseOutlierFilter: (useOutlierFilter) => {
      set({ useOutlierFilter });
    },

    setManualAmplitudes: (manualAmplitudes) => {
      set({ manualAmplitudes });
    },

    updateManualAmplitude: (index, amplitude) => {
      set((state) => {
        const manualAmplitudes = [...state.manualAmplitudes];
        manualAmplitudes[index] = amplitude;
        return { manualAmplitudes };
      });
    },
  };
};
