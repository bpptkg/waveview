import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { FilterStore } from './types';

const filterStore = create<FilterStore>((set, get) => {
  return {
    appliedFilter: null,
    filterType: 'bandpass',
    bandpass: {
      freqmin: 0.1,
      freqmax: 15,
      order: 4,
      zerophase: false,
    },
    lowpass: {
      freq: 15,
      order: 4,
      zerophase: false,
    },
    highpass: {
      freq: 15,
      order: 4,
      zerophase: false,
    },
    taperType: 'hann',
    taperWidth: 5,
    setFilterType: (filterType) => set({ filterType }),
    setBandpass: (bandpass) => set({ bandpass }),
    setLowpass: (lowpass) => set({ lowpass }),
    setHighpass: (highpass) => set({ highpass }),
    clearFilter: () => set({ filterType: 'none' }),
    setTaperType: (taperType) => set({ taperType }),
    setTaperWidth: (taperWidth) => set({ taperWidth }),
    setAppliedFilter: (filter) => set({ appliedFilter: filter }),
    buildFilterOptions: () => {
      const { filterType, bandpass, lowpass, highpass, taperType, taperWidth } = get();
      const taperPercent = taperWidth / 100;
      switch (filterType) {
        case 'bandpass':
          return {
            filterType,
            filterOptions: bandpass,
            taperType,
            taperWidth: taperPercent,
          };
        case 'lowpass':
          return {
            filterType,
            filterOptions: lowpass,
            taperType,
            taperWidth: taperPercent,
          };
        case 'highpass':
          return {
            filterType,
            filterOptions: highpass,
            taperType,
            taperWidth: taperPercent,
          };
        default:
          return null;
      }
    },
  };
});

export const useFilterStore = createSelectors(filterStore);
