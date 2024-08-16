import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { PickerConfig } from '../../../types/picker';
import { CustomError } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useOrganizationStore } from '../../organization';
import { CommonSlice, PickerStore } from '../slices';

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set) => {
  return {
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    eventMarkers: [],

    setSelectedChart: (selectedChart) => set({ selectedChart }),

    setShowEvent: (showEvent) => set({ showEvent }),

    fetchPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        return;
      }
      const response = await api(apiVersion.getPickerConfig.v1(currentOrganization.id));
      const data: PickerConfig = await response.json();
      set({ pickerConfig: data });
    },

    fetchEventMarkers: async (start, end) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization not found');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog not found');
      }
      const response = await api(apiVersion.listEvent.v1(currentOrganization.id, currentCatalog.id), {
        params: {
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
        },
      });
      const data = await response.json();
      set({ eventMarkers: data });
    },

    addEventMarker: (event) => {
      set((state) => {
        return {
          eventMarkers: [...state.eventMarkers, event],
        };
      });
    },

    clearEventMarkers: () => {
      set({ eventMarkers: [] });
    },
  };
};
