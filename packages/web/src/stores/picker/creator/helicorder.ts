import { StateCreator } from 'zustand';
import { endOf, ONE_HOUR, startOf } from '../../../shared/time';
import { HelicorderSlice, PickerStore } from '../slices';

export const createHelicorderSlice: StateCreator<PickerStore, [], [], HelicorderSlice> = (set, get) => {
  return {
    channelId: '',
    helicorderDuration: 12,
    helicorderInterval: 30,
    offsetDate: Date.now(),
    selectionWindow: undefined,
    lastSelection: 0,
    windowSize: 5,
    autoUpdate: true,
    autoUpdateInterval: 60,
    helicorderToolbarCheckedValues: {
      options: [], // scaling
    },
    helicorderFilter: null,
    helicorderLoading: false,

    setWindowSize: (windowSize) => set({ windowSize }),

    setHelicorderChannelId: (channelId) => set({ channelId }),

    setHelicorderDuration: (helicorderDuration) => set({ helicorderDuration }),

    setHelicorderInterval: (helicorderInterval) => set({ helicorderInterval }),

    setHelicorderOffsetDate: (offsetDate) => set({ offsetDate }),

    setHelicorderFilter: (helicorderFilter) => set({ helicorderFilter }),

    setSelectionWindow: (extent) => set({ selectionWindow: extent }),

    getHelicorderExtent: () => {
      const { helicorderDuration, helicorderInterval, offsetDate } = get();
      const start = offsetDate - helicorderDuration * ONE_HOUR;
      return [startOf(start, helicorderInterval), endOf(offsetDate, helicorderInterval)];
    },

    setAutoUpdate: (autoUpdate) => set({ autoUpdate }),

    setAutoUpdateInterval: (autoUpdateInterval) => set({ autoUpdateInterval }),

    helicorderToolbarSetCheckedValues: (name, checkedValues) =>
      set((state) => {
        return {
          helicorderToolbarCheckedValues: {
            ...state.helicorderToolbarCheckedValues,
            [name]: checkedValues,
          },
        };
      }),

    getHelicorderScalingType: () => {
      const { helicorderToolbarCheckedValues } = get();
      return helicorderToolbarCheckedValues.options.includes('scaling') ? 'local' : 'global';
    },

    setHelicorderLoading: (loading) => set({ helicorderLoading: loading }),
  };
};
