import { StateCreator } from 'zustand';
import { ONE_MINUTE } from '../../../shared/time';
import { useInventoryStore } from '../../inventory';
import { PickerStore, SeismogramSlice } from '../slices';

export const createSeismogramSlice: StateCreator<PickerStore, [], [], SeismogramSlice> = (set, get) => {
  const end = Date.now();
  const start = end - 5 * ONE_MINUTE;

  return {
    lastSeismogramExtent: [start, end],
    seismogramToolbarCheckedValues: {
      options: ['signal'],
    },
    isExpandMode: false,
    expandedChannelIndex: -1,
    selectedChannels: [],

    getChannelsConfig: () => {
      const { selectedChannels } = get();
      return selectedChannels;
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

    setSelectedChannels: (channels) => set({ selectedChannels: channels }),

    setExpandMode: (isExpandMode) => set({ isExpandMode }),

    getChannelById: (id) => {
      const channels = useInventoryStore.getState().channels();
      return channels.find((channel) => channel.id === id);
    },

    getSelectedStations: () => {
      const stations = useInventoryStore.getState().stations();
      return stations.sort((a, b) => a.code.localeCompare(b.code));
    },
  };
};
