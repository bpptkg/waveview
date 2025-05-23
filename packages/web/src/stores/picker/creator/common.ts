import { StateCreator } from 'zustand';
import { api } from '../../../services/api';
import apiVersion from '../../../services/apiVersion';
import { getDefaultSeismogramExtent } from '../../../shared/common';
import { BandpassFilterOptions, FilterOperationOptions, HighpassFilterOptions, LowpassFilterOptions } from '../../../types/filter';
import { FilterOptions, PickerConfig } from '../../../types/picker';
import { CustomError, ErrorData } from '../../../types/response';
import { useCatalogStore } from '../../catalog';
import { useFilterStore } from '../../filter';
import { useInventoryStore } from '../../inventory';
import { useOrganizationStore } from '../../organization';
import { useVolcanoStore } from '../../volcano/useVolcanoStore';
import { ChannelConfig, CommonSlice, PickerStore } from '../slices';

export const extractFilterOptions = (item: FilterOptions): FilterOperationOptions => {
  if (item.type === 'bandpass') {
    return {
      id: item.id,
      filterType: 'bandpass',
      filterOptions: {
        freqmin: item.freqmin,
        freqmax: item.freqmax,
        order: item.order,
        zerophase: item.zerophase,
      } as BandpassFilterOptions,
      taperType: item.taper,
      taperWidth: item.taper_width,
    } as FilterOperationOptions;
  } else if (item.type === 'lowpass') {
    return {
      id: item.id,
      filterType: 'lowpass',
      filterOptions: {
        freq: item.freq,
        order: item.order,
        zerophase: item.zerophase,
      } as LowpassFilterOptions,
      taperType: item.taper,
      taperWidth: item.taper_width,
    } as FilterOperationOptions;
  } else if (item.type === 'highpass') {
    return {
      id: item.id,
      filterType: 'highpass',
      filterOptions: {
        freq: item.freq,
        order: item.order,
        zerophase: item.zerophase,
      } as HighpassFilterOptions,
      taperType: item.taper,
      taperWidth: item.taper_width,
    } as FilterOperationOptions;
  } else {
    throw new CustomError('Invalid filter type');
  }
};

export const createCommonSlice: StateCreator<PickerStore, [], [], CommonSlice> = (set, get) => {
  return {
    selectedChart: 'helicorder',
    showEvent: true,
    pickerConfig: null,
    eventMarkers: [],
    pickerSettingsOpen: false,
    forceCenter: true,
    loading: false,

    setLoading: (loading) => set({ loading }),

    setForceCenter: (forceCenter) => set({ forceCenter }),

    setPickerSettingsOpen: (pickerSettingsOpen) => set({ pickerSettingsOpen }),

    setSelectedChart: (selectedChart) => set({ selectedChart }),

    setShowEvent: (showEvent) => set({ showEvent }),

    setPickerConfig: (pickerConfig) => {
      const { helicorder_channel, seismogram_channels, force_center, window_size, helicorder_filter } = pickerConfig.data;

      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: ChannelConfig[] = [];
      seismogram_channels.forEach((channel) => {
        const item = availableChannels.find((c) => c.id === channel.channel_id);
        if (item) {
          selectedChannels.push({
            channel: item,
            color: channel.color ?? undefined,
          });
        }
      });
      const forceCenter = force_center !== undefined ? force_center : true;
      const windowSize = window_size !== undefined ? window_size : 5;
      const helicorderFilter = helicorder_filter ? extractFilterOptions(helicorder_filter) : null;
      set({ pickerConfig, channelId: helicorder_channel.channel_id, selectedChannels, forceCenter, windowSize, helicorderFilter });
    },

    fetchPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const response = await api(apiVersion.getPickerConfig.v1(currentOrganization.id, currentVolcano.id));
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      const pickerConfig: PickerConfig = await response.json();
      get().setPickerConfig(pickerConfig);

      const data = pickerConfig.data.seismogram_filters ?? [];
      const seismogramFilter = data.find((item) => item.is_default);
      if (seismogramFilter) {
        const { setAppliedFilter } = useFilterStore.getState();
        setAppliedFilter(extractFilterOptions(seismogramFilter));
      }
    },

    savePickerConfig: async (payload) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const response = await api(apiVersion.updatePickerConfig.v1(currentOrganization.id, currentVolcano.id), {
        method: 'PUT',
        body: payload,
      });
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      const pickerConfig: PickerConfig = await response.json();
      get().setPickerConfig(pickerConfig);
      return pickerConfig;
    },

    resetPickerConfig: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const response = await api(apiVersion.resetPickerConfig.v1(currentOrganization.id, currentVolcano.id), {
        method: 'POST',
      });
      if (!response.ok) {
        const err: ErrorData = await response.json();
        throw CustomError.fromErrorData(err);
      }
      const pickerConfig: PickerConfig = await response.json();
      get().setPickerConfig(pickerConfig);
      return pickerConfig;
    },

    fetchEventMarkers: async (start, end) => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization not found');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog not found');
      }
      const response = await api(apiVersion.listEvent.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id), {
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
        const existingIndex = state.eventMarkers.findIndex((e) => e.id === event.id);
        if (existingIndex !== -1) {
          const newEventMarkers = [...state.eventMarkers];
          newEventMarkers[existingIndex] = event;
          return {
            eventMarkers: newEventMarkers,
          };
        } else {
          return {
            eventMarkers: [...state.eventMarkers, event],
          };
        }
      });
    },

    removeEventMarker: (eventId) => {
      set((state) => {
        const newEventMarkers = state.eventMarkers.filter((e) => e.id !== eventId);
        return {
          eventMarkers: newEventMarkers,
        };
      });
    },

    clearEventMarkers: () => {
      set({ eventMarkers: [] });
    },

    setEventMarkers: (eventMarkers) => {
      set({ eventMarkers });
    },

    getSeismogramFilterOptions: () => {
      const { pickerConfig } = get();
      const seismogramFilters = pickerConfig?.data.seismogram_filters ?? [];
      return seismogramFilters.map(extractFilterOptions);
    },

    getHelicorderFilterOptions: () => {
      const { pickerConfig } = get();
      const helicorderFilters = pickerConfig?.data.helicorder_filters ?? [];
      return helicorderFilters.map(extractFilterOptions);
    },

    resetPickerState: () => {
      const [start, end] = getDefaultSeismogramExtent();
      set({
        // common
        selectedChart: 'helicorder',
        showEvent: true,
        pickerConfig: null,
        eventMarkers: [],
        pickerSettingsOpen: false,
        forceCenter: true,
        loading: false,

        // helicorder
        channelId: '',
        helicorderDuration: 12,
        helicorderInterval: 30,
        offsetDate: Date.now(),
        selectionWindow: undefined,
        lastSelection: 0,
        windowSize: 5,
        autoUpdate: true,
        autoUpdateInterval: 60,
        helicorderToolbarCheckedValues: {
          options: [],
        },
        helicorderFilter: null,

        // pick
        pickRange: [0, 0],
        pickMode: true,
        eventId: undefined,
        time: 0,
        duration: 0,
        eventTypeId: '',
        stationOfFirstArrivalId: '',
        note: '',
        attachments: [],
        amplitudes: [],
        editedEvent: null,
        isCalculatingAmplitudes: false,

        // seismogram
        lastSeismogramExtent: [start, end],
        seismogramToolbarCheckedValues: {
          options: ['signal'],
        },
        isExpandMode: false,
        expandedChannelIndex: -1,
        selectedChannels: [],
      });
    },
  };
};
