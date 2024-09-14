import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { Channel } from '../../../types/channel';
import { PickerConfig } from '../../../types/picker';
import { CustomError } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useInventoryStore } from '../../inventory';
import { useOrganizationStore } from '../../organization';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { CommonSlice, PickerStore } from '../slices';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    eventMarkers: [],

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
      const pickerConfig: PickerConfig = await response.json();
      if (!pickerConfig) {
        return;
      }

      const helicorderConfig = pickerConfig.helicorder_config;
      if (!helicorderConfig) {
        return;
      }
      const helicorderChannelId = pickerConfig.helicorder_config.channel.id;
      const seismogramConfig = pickerConfig.seismogram_config;
      if (!seismogramConfig) {
        return;
      }
      const component = seismogramConfig.component;
      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: Channel[] = [];
      seismogramConfig.station_configs.forEach((stationConfig) => {
        const channel = availableChannels.find((channel) => channel.station_id === stationConfig.station.id && channel.code.includes(component));
        if (channel) {
          selectedChannels.push(channel);
        }
      });
      set({ pickerConfig, channelId: helicorderChannelId, selectedChannels });
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
