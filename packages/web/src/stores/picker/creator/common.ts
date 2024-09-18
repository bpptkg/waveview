import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { PickerConfig } from '../../../types/picker';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useInventoryStore } from '../../inventory';
import { useOrganizationStore } from '../../organization';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { ChannelConfig, CommonSlice, PickerStore } from '../slices';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    eventMarkers: [],
    pickerSettingsOpen: false,
    forceCenter: true,

    setForceCenter: (forceCenter) => set({ forceCenter }),

    setPickerSettingsOpen: (pickerSettingsOpen) => set({ pickerSettingsOpen }),

    setSelectedChart: (selectedChart) => set({ selectedChart }),

    setShowEvent: (showEvent) => set({ showEvent }),

    fetchPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const response = await api(apiVersion.getPickerConfig.v1(currentOrganization.id, currentVolcano.id));
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      const pickerConfig: PickerConfig = await response.json();
      const { helicorder_channel, seismogram_channels, force_center, window_size } = pickerConfig.data;

      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: ChannelConfig[] = [];
      seismogram_channels.forEach((channel) => {
        const item = availableChannels.find((c) => c.id === channel.channel_id);
        if (item) {
          selectedChannels.push({
            channel: item,
            color: channel.color,
          });
        }
      });
      const forceCenter = force_center || true;
      const windowSize = window_size || 5; // 5 minutes
      set({ pickerConfig, channelId: helicorder_channel.channel_id, selectedChannels, forceCenter, windowSize });
    },

    savePickerConfig: async (payload) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const response = await api(apiVersion.updatePickerConfig.v1(currentOrganization.id, currentVolcano.id), {
        method: 'PUT',
        body: payload,
      });
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      const pickerConfig: PickerConfig = await response.json();
      const { helicorder_channel, seismogram_channels, force_center, window_size } = pickerConfig.data;

      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: ChannelConfig[] = [];
      seismogram_channels.forEach((channel) => {
        const item = availableChannels.find((c) => c.id === channel.channel_id);
        if (item) {
          selectedChannels.push({
            channel: item,
            color: channel.color,
          });
        }
      });
      set({ pickerConfig, channelId: helicorder_channel.channel_id, selectedChannels, forceCenter: force_center, windowSize: window_size });
    },

    fetchEventMarkers: async (start, end) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization not found');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog not found');
      }
      const response = await api(apiVersion.listEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id), {
        params: {
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
        },
      });
      const data = await response.json();
      set({ eventMarkers: data });
    },

    addEventMarker: (event) => {
      set((state) => {
        const existingIndex = state.eventMarkers.findIndex((e) => e.id === event.id);
        if (existingIndex !== -1) {
          const newEventMarkers = [...state.eventMarkers];
          newEventMarkers[existingIndex] = event;
          return {
            eventMarkers: newEventMarkers,
          };
        } else {
          return {
            eventMarkers: [...state.eventMarkers, event],
          };
        }
      });
    },

    clearEventMarkers: () => {
      set({ eventMarkers: [] });
    },

    setEventMarkers: (eventMarkers) => {
      set({ eventMarkers });
    },
  };
};
