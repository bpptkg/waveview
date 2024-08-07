import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { createCommonSlice, createHelicorderSlice, createPickSlice, createSeismogramSlice } from './creator';
import { PickerStore } from './slices';

const pickerStore = create<PickerStore>()((...a) => ({
  ...createCommonSlice(...a),
  ...createHelicorderSlice(...a),
  ...createPickSlice(...a),
  ...createSeismogramSlice(...a),
}));

export const usePickerStore = createSelectors(pickerStore);
