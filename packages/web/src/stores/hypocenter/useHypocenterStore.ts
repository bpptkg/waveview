import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Hypocenter } from '../../types/hypocenter';
import { CustomError } from '../../types/response';
import { useCatalogStore } from '../catalog';
import { useOrganizationStore } from '../organization';
import { HypocenterStore } from './types';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { subDays } from 'date-fns';
import { createHypocenterChartOption } from '../../shared/echarts/hypocenter';
import { useDemXyzStore } from '../demxyz';
import { useAppStore } from '../app';

const hypocenterStore = create<HypocenterStore>((set, get) => {
  const endDate = Date.now();
  const startDate = subDays(endDate, 7).getTime();

  return {
    startDate,
    endDate,
    periods: [
      {
        value: 7,
        unit: 'days',
        label: '7 days',
      },
      {
        value: 1,
        unit: 'months',
        label: '1 month',
      },
      {
        value: 3,
        unit: 'months',
        label: '3 months',
      },
      {
        value: 6,
        unit: 'months',
        label: '6 months',
      },
      {
        value: 1,
        unit: 'years',
        label: '1 years',
      },
    ],
    periodIndex: 0,
    currentMethod: '',
    methods: [],
    hypocenter: null,
    loading: false,
    error: '',
    pitch: 20,
    yaw: 40,
    setTimeRange: (startDate: number, endDate: number) => {
      set({ startDate, endDate });
    },
    setCurrentMethod: (method: string) => {
      set({ currentMethod: method });
    },
    setPitch: (pitch: number) => {
      set({ pitch });
    },
    setYaw: (yaw: number) => {
      set({ yaw });
    },
    setPeriodIndex: (index: number) => {
      set({ periodIndex: index });
    },
    fetchHypocenter: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }
      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }
      const { currentCatalog } = useCatalogStore.getState();
      if (!currentCatalog) {
        throw new CustomError('Catalog is not set');
      }

      const { startDate, endDate, currentMethod } = get();

      set({ loading: true });
      try {
        const response = await api(apiVersion.getHypocenter.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id), {
          params: {
            start: new Date(startDate).toISOString(),
            end: new Date(endDate).toISOString(),
            method: currentMethod,
          },
        });
        if (!response.ok) {
          throw CustomError.fromErrorData(await response.json());
        }
        const data: Hypocenter = await response.json();
        set({ hypocenter: data });
      } finally {
        set({ loading: false });
      }
    },
    getEChartsOption: () => {
      const { hypocenter, startDate, endDate, pitch, yaw } = get();
      const { demxyz } = useDemXyzStore.getState();
      if (!demxyz || !hypocenter) {
        return {};
      }
      const { grid } = demxyz;
      const { darkMode, useUTC } = useAppStore.getState();
      const option = createHypocenterChartOption({
        data: hypocenter.hypocenters,
        topo: grid.xyz,
        zoneNumber: demxyz.zone_number,
        surfaceMin: grid.z_min,
        surfaceMax: grid.z_max,
        timeMin: startDate,
        timeMax: endDate,
        xMin: demxyz.x_min,
        xMax: demxyz.x_max,
        yMin: demxyz.y_min,
        yMax: demxyz.y_max,
        zMin: grid.z_min,
        zMax: grid.z_max,
        darkMode: darkMode,
        useUTC: useUTC,
        alpha: pitch,
        beta: yaw,
      });
      return option;
    }
  };
});

export const useHypocenterStore = createSelectors(hypocenterStore);
