import { StateCreator } from 'zustand';
import { useInventoryStore } from '../../inventory';
import { PickerStore, SeismogramSlice } from '../slices';
import { getDefaultSeismogramExtent } from '../../../shared/common';

export const createSeismogramSlice: StateCreator<PickerStore, [], [], SeismogramSlice> = (set, get) => {
  const [start, end] = getDefaultSeismogramExtent();

  return {
    lastSeismogramExtent: [start, end],
    seismogramToolbarCheckedValues: {
      options: ['signal'], // signal, spectrogram, scaling
    },
    isExpandMode: false,
    expandedChannelIndex: -1,
    selectedChannels: [],
    seismogramLoading: false,

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

    getSeismogramScalingType: () => {
      const { seismogramToolbarCheckedValues } = get();
      return seismogramToolbarCheckedValues.options.includes('scaling') ? 'local' : 'global';
    },

    isSpectrogramVisible: () => {
      const { seismogramToolbarCheckedValues } = get();
      return seismogramToolbarCheckedValues.options.includes('spectrogram');
    },

    isSignalVisible: () => {
      const { seismogramToolbarCheckedValues } = get();
      return seismogramToolbarCheckedValues.options.includes('signal');
    },

    setSeismogramLoading: (loading) => set({ seismogramLoading: loading }),
  };
};
