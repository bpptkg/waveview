import { StateCreator } from 'zustand';
import { CommonSlice, PickerStore } from '../slices';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    useUTC: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selectedChart: 'helicorder',
    showEvent: true,
    setUseUTC: (useUTC) => set({ useUTC }),
    setSelectedChart: (selectedChart) => set({ selectedChart }),
    setShowEvent: (showEvent) => set({ showEvent }),
  };
};
