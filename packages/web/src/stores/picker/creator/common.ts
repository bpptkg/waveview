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
    /**
     * Fetches the picker configuration, which includes the list of default
     * channels to display in the picker.
     */
    fetchPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        return;
      }
      const response = await api(apiVersion.getPickerConfig.v1(currentOrganization.id));
      const data: PickerConfig = await response.json();
      set({ pickerConfig: data });
    },
  };
};
