import { StateCreator } from 'zustand';
import { SeismogramSlice, PickerStore } from '../slices';

export const createSeismogramSlice: StateCreator<PickerStore, [], [], SeismogramSlice> = (set, get) => {
  return {
    lastSeismogramExtent: [0, 0],
    seismogramToolbarCheckedValues: {
      options: [],
    },
    isExpandMode: false,
    expandedChannelIndex: -1,
    component: 'Z',
    channels: [],
    stations: [],

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

    addSeismogramChannel: (channel) =>
      set((state) => {
        return {
          channels: [...state.channels, channel],
          stations: [...state.stations, channel.station],
        };
      }),

    removeSeismogramChannel: (index) =>
      set((state) => {
        const channels = [...state.channels];
        channels.splice(index, 1);

        const stations = [...state.stations];
        stations.splice(index, 1);
        return {
          channels,
          stations,
        };
      }),

    moveChannel: (fromIndex, toIndex) =>
      set((state) => {
        const channels = [...state.channels];
        const [channel] = channels.splice(fromIndex, 1);
        channels.splice(toIndex, 0, channel);

        const stations = [...state.stations];
        const [station] = stations.splice(fromIndex, 1);
        stations.splice(toIndex, 0, station);
        return {
          channels,
          stations,
        };
      }),

    setExpandMode: (isExpandMode) => set({ isExpandMode }),

    setComponent: (component) => {
      const channels = get()
        .stations.map((station) => {
          return get().availableChannels.filter((channel) => {
            return channel.station.code === station.code && channel.code.includes(component);
          });
        })
        .flat(1);

      set({ component, channels });
    },

    getChannelsByStationIndex: (index: number) => {
      const station = get().stations[index];
      const channels = get().availableChannels.filter((channel) => {
        return channel.station.code === station.code;
      });
      return channels;
    },

    setExpandedChannelIndex: (index) => set({ expandedChannelIndex: index }),

    getChannelByStreamId: (streamId: string) => {
      return get().channels.find((channel) => channel.stream_id === streamId);
    },

    getChannelById: (id) => {
      return get().channels.find((channel) => channel.id === id);
    },
  };
};
