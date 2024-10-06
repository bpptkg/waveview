import { createGrid } from '@waveview/react-echarts';
import { format, subDays } from 'date-fns';
import { EChartsOption, SeriesOption } from 'echarts';
import { CallbackDataParams, GridOption, TooltipOption, XAXisOption, YAXisOption } from 'echarts/types/dist/shared';
import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { ONE_DAY, ONE_HOUR } from '../../shared/time';
import { circle } from '../../shared/tooltip';
import { CustomError } from '../../types/response';
import { SeismicityData } from '../../types/seismicity';
import { useCatalogStore } from '../catalog';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { SeismicityStore } from './types';

const seismicityStore = create<SeismicityStore>((set, get) => {
  const endDate = Date.now();
  const startDate = subDays(endDate, 7).getTime();

  return {
    seismicity: null,
    loading: false,
    error: '',
    startDate,
    endDate,
    sampling: 'day',
    periodIndex: 0,
    periodsDay: [
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
    periodsHour: [
      {
        value: 1,
        unit: 'days',
        label: '1 day',
      },
      {
        value: 3,
        unit: 'days',
        label: '3 days',
      },
      {
        value: 7,
        unit: 'days',
        label: '7 days',
      },
    ],

    setLoading: (loading: boolean) => set({ loading }),

    setError: (error: string) => set({ error }),

    setTimeRange: (startDate: number, endDate: number) => set({ startDate, endDate }),

    setSampling: (sampling) => set({ sampling }),

    setPeriodIndex: (index) => {
      set({ periodIndex: index });
    },

    fetchSeismicity: async () => {
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

      const { startDate, endDate, sampling } = get();

      // Add one more day to the end date to include the last day.
      const start = startDate;
      const end = endDate + (sampling === 'day' ? ONE_DAY : ONE_HOUR);

      const url = apiVersion.getSeismicity.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id);
      const response = await api(url, {
        params: {
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          group_by: sampling,
          fill_gaps: true,
        },
      });
      if (!response.ok) {
        throw new CustomError('Failed to fetch seismicity data');
      }
      const data: SeismicityData[] = await response.json();
      set({ seismicity: data });
    },

    getEChartsOption: () => {
      const { seismicity, startDate, endDate, sampling } = get();

      const margin = sampling === 'day' ? ONE_DAY : ONE_HOUR;
      const data = seismicity || [];

      const xAxis = data.map((_, index) => {
        const option: XAXisOption = {
          type: 'time',
          gridIndex: index,
          position: 'bottom',
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: index === data.length - 1 ? true : false,
          },
          axisTick: {
            show: index === data.length - 1 ? true : false,
          },
          min: startDate - margin,
          max: endDate + margin,
        };
        return option;
      });

      const yAxis = data.map((item, index) => {
        const option: YAXisOption = {
          type: 'value',
          axisLine: { show: true },
          axisTick: { show: true },
          name: item.event_type.code,
          nameGap: 35,
          nameLocation: 'middle',
          gridIndex: index,
          splitLine: { show: false },
        };
        return option;
      });

      const grid: GridOption[] = createGrid(data.length, { top: 10, bottom: 10 });

      const series = data.map((item, index) => {
        const option: SeriesOption = {
          data: item.data.map((data) => [data.timestamp, data.count]),
          name: item.event_type.code,
          type: 'bar',
          xAxisIndex: index,
          yAxisIndex: index,
          color: item.event_type.color,
        };
        return option;
      });

      const tooltip = {
        trigger: 'axis',
        formatter: (params: CallbackDataParams[]) => {
          const param = params[0];
          const { seriesName, value, color } = param;
          const [timestamp, count] = value as [string, number];
          const template = sampling === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:00:00';
          return `${format(new Date(timestamp), template)}<br />
          ${circle(color as string)}
          ${seriesName}: ${count}`;
        },
      } as TooltipOption;

      const option = {
        baseOption: {
          grid,
          series,
          xAxis,
          yAxis,
          tooltip,
          dataZoom: [],
        } as EChartsOption,
        media: [],
      };

      return option;
    },
  };
});

export const useSeismicityStore = createSelectors(seismicityStore);
