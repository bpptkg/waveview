import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { PickerConfig } from '../../../types/picker';
import { useOrganizationStore } from '../../organization';
import { CommonSlice, PickerStore } from '../slices';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    setSelectedChart: (selectedChart) => set({ selectedChart }),
    setShowEvent: (showEvent) => set({ showEvent }),
    fetchPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        return;
      }
      const data = await api<PickerConfig>(apiVersion.getPickerConfig.v1(currentOrganization.id));
      set({ pickerConfig: data });
    },
  };
};
