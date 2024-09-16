import { StateCreator } from 'zustand';
import { ONE_MINUTE } from '../../../shared/time';
import { Channel } from '../../../types/channel';
import { useInventoryStore } from '../../inventory';
import { PickerStore, SeismogramSlice } from '../slices';
import { usePickerStore } from '../usePickerStore';

export const createSeismogramSlice: StateCreator<PickerStore, [], [], SeismogramSlice> = (set, get) => {
  const end = Date.now();
  const start = end - 5 * ONE_MINUTE;

  return {
    lastSeismogramExtent: [start, end],
    seismogramToolbarCheckedValues: {
      options: [],
    },
    isExpandMode: false,
    expandedChannelIndex: -1,
    component: 'Z',
    selectedChannels: [],

    getChannelsConfig: () => {
      const { pickerConfig, selectedChannels } = get();
      if (!pickerConfig) {
        return [];
      }
      const seismogramConfig = pickerConfig?.seismogram_config;
      if (!seismogramConfig) {
        return [];
      }
      return selectedChannels.map((channel, index) => {
        return {
          channel,
          color: seismogramConfig.station_configs[index].color,
        };
      });
    },

    setLastSeismogramExtent: (extent) => set({ lastSeismogramExtent: extent }),

    seismogramToolbarSetCheckedValues: (name, checkedValues) =>
      set((state) => {
        return {
          seismogramToolbarCheckedValues: {
            ...state.seismogramToolbarCheckedValues,
            [name]: checkedValues,
          },
        };
      }),

    seismogramToolbarAddCheckedValue: (name, item) =>
      set((state) => {
        const options = state.seismogramToolbarCheckedValues[name] || [];
        return {
          seismogramToolbarCheckedValues: {
            ...state.seismogramToolbarCheckedValues,
            [name]: [...options, item],
          },
        };
      }),

    seismogramToolbarRemoveCheckedValue: (name, item) =>
      set((state) => {
        const options = state.seismogramToolbarCheckedValues[name] || [];
        return {
          seismogramToolbarCheckedValues: {
            ...state.seismogramToolbarCheckedValues,
            [name]: options.filter((value) => value !== item),
          },
        };
      }),

    addSeismogramChannel: (channel) => {
      set((state) => {
        return {
          selectedChannels: [...state.selectedChannels, channel],
        };
      });
    },

    removeSeismogramChannel: (index) =>
      set((state) => {
        const selectedChannels = [...state.selectedChannels];
        selectedChannels.splice(index, 1);

        return {
          selectedChannels,
        };
      }),

    moveChannel: (fromIndex, toIndex) =>
      set((state) => {
        const selectedChannels = [...state.selectedChannels];
        const [channel] = selectedChannels.splice(fromIndex, 1);
        selectedChannels.splice(toIndex, 0, channel);

        return {
          selectedChannels,
        };
      }),

    setSelectedChannels: (channels) => set({ selectedChannels: channels }),

    setExpandMode: (isExpandMode) => set({ isExpandMode }),

    setComponent: (component) => {
      const { pickerConfig } = usePickerStore.getState();
      if (!pickerConfig) {
        return;
      }
      const seismogramConfig = pickerConfig?.seismogram_config;
      if (!seismogramConfig) {
        return;
      }
      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: Channel[] = [];
      seismogramConfig.station_configs.forEach((stationConfig) => {
        const channel = availableChannels.find((channel) => channel.station_id === stationConfig.station.id && channel.code.includes(component));
        if (channel) {
          selectedChannels.push(channel);
        }
      });

      set({ component, selectedChannels });
    },

    getChannelsByStationIndex: (index: number) => {
      const stationId = get().selectedChannels[index].station_id;
      const channels = useInventoryStore.getState().channels();
      const filteredChannels = channels.filter((channel) => channel.station_id === stationId);
      return filteredChannels;
    },

    setExpandedChannelIndex: (index) => set({ expandedChannelIndex: index }),

    getChannelByStreamId: (streamId: string) => {
      const channels = useInventoryStore.getState().channels();
      return channels.find((channel) => channel.stream_id === streamId);
    },

    getChannelById: (id) => {
      const channels = useInventoryStore.getState().channels();
      return channels.find((channel) => channel.id === id);
    },

    getSelectedStations: () => {
      const selectedStationIds = get().selectedChannels.map((channel) => channel.station_id);
      const stations = useInventoryStore.getState().stations();
      return stations.filter((station) => selectedStationIds.includes(station.id));
    },
  };
};
