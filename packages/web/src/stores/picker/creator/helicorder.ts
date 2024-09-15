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
    setHelicorderChannelId: (channelId) => set({ channelId }),
    setHelicorderDuration: (helicorderDuration) => set({ helicorderDuration }),
    setHelicorderInterval: (helicorderInterval) => set({ helicorderInterval }),
    setHelicorderOffsetDate: (offsetDate) => set({ offsetDate }),
    setSelectionWindow: (extent) => set({ selectionWindow: extent }),
    getHelicorderExtent: () => {
      const { helicorderDuration, helicorderInterval, offsetDate } = get();
      const start = offsetDate - helicorderDuration * ONE_HOUR;
      return [startOf(start, helicorderInterval), endOf(offsetDate, helicorderInterval)];
    },
  };
};
