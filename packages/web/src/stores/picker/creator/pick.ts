import { StateCreator } from 'zustand';
import { PickSlice, PickerStore } from '../slices';

export const createPickSlice: StateCreator<PickerStore, [], [], PickSlice> = (set, get) => {
  return {
    pickStart: 0,
    pickEnd: 0,
    isPickEmpty: () => get().pickStart === 0 && get().pickEnd === 0,
    setPickStart: (start) => set({ pickStart: start }),
    setPickEnd: (end) => set({ pickEnd: end }),
    clearPick: () => {
      set({ pickStart: 0, pickEnd: 0 });
    },
    setPickRange: (range) => {
      const [pickStart, pickEnd] = range;
      set({ pickStart, pickEnd });
    },
    savePickedEvent: () => {
      // TODO: Implement savePickedEvent
    },
  };
};
