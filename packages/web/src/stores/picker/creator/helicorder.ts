import { StateCreator } from 'zustand';
import { HelicorderSlice, PickerStore } from '../slices';

export const createHelicorderSlice: StateCreator<PickerStore, [], [], HelicorderSlice> = (set) => {
  return {
    channel: null,
    duration: 12,
    interval: 30,
    offsetDate: Date.now(),
    lastTrackExtent: [0, 0],
    lastSelection: 0,
    setHelicorderChannel: (channel) => set({ channel }),
    setHelicorderDuration: (duration) => set({ duration }),
    setHelicorderInterval: (interval) => set({ interval }),
    setHelicorderOffsetDate: (offsetDate) => set({ offsetDate }),
    setLastTrackExtent: (extent) => set({ lastTrackExtent: extent }),
    setLastSelection: (value) => set({ lastSelection: value }),
  };
};
