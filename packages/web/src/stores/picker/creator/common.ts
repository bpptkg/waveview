import { StateCreator } from 'zustand';
import { CommonSlice, PickerStore } from '../slices';
import { useOrganizationStore } from '../../organization';
import { api } from '../../../services/api';
import { PickerConfig } from '../../../types/picker';
import apiVersion from '../../../services/apiVersion';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    useUTC: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    setUseUTC: (useUTC) => set({ useUTC }),
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
