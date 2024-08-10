import { StateCreator } from 'zustand';
import { Channel } from '../../../types/channel';
import { useInventoryStore } from '../../inventory';
import { PickerStore, SeismogramSlice } from '../slices';

export const createSeismogramSlice: StateCreator<PickerStore, [], [], SeismogramSlice> = (set, get) => {
  return {
    lastSeismogramExtent: [0, 0],
    seismogramToolbarCheckedValues: {
      options: [],
    },
    isExpandMode: false,
    expandedChannelIndex: -1,
    component: 'Z',
    selectedChannels: [],

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
      const oldChannels = get().selectedChannels;
      const selectedStationIds = oldChannels.map((channel) => channel.station_id);
      const channels = useInventoryStore.getState().channels();
      const filteredChannels = channels.filter((channel) => channel.code.includes(component));
      const newChannels = selectedStationIds
        .map((stationId) => {
          return filteredChannels.find((channel) => channel.station_id === stationId);
        })
        .filter((channel) => channel !== undefined) as Channel[];

      set({ component, selectedChannels: newChannels });
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

    isPickModeActive() {
      return get().seismogramToolbarCheckedValues.options.includes('pick-mode');
    },

    deactivatePickMode() {
      set((state) => {
        return {
          seismogramToolbarCheckedValues: {
            ...state.seismogramToolbarCheckedValues,
            options: state.seismogramToolbarCheckedValues.options.filter((value) => value !== 'pick-mode'),
          },
        };
      });
    },
  };
};
