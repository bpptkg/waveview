import { format, subDays } from 'date-fns';
import { LegendComponentOption, SeriesOption, TooltipComponentOption } from 'echarts';
import {
  CallbackDataParams,
  GridOption,
  LegendOption,
  TitleOption,
  TooltipOption,
  TopLevelFormatterParams,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared';
import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { numberFormatterFactory } from '../../shared/formatting';
import { circle } from '../../shared/tooltip';
import { CustomError } from '../../types/response';
import { RfApData } from '../../types/rfap';
import { useCatalogStore } from '../catalog';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { AxisType, RfApDirectionStore } from './types';

// Tab20 color map.
const colorMap = [
  '#1f77b4',
  '#aec7e8',
  '#ff7f0e',
  '#ffbb78',
  '#2ca02c',
  '#98df8a',
  '#d62728',
  '#ff9896',
  '#9467bd',
  '#c5b0d5',
  '#8c564b',
  '#c49c94',
  '#e377c2',
  '#f7b6d2',
  '#7f7f7f',
  '#c7c7c7',
  '#bcbd22',
  '#dbdb8d',
  '#17becf',
  '#9edae5',
];

function getColor(index: number, length: number): string {
  const cmapLength = colorMap.length;
  if (length === cmapLength) {
    return colorMap[cmapLength - 1];
  }
  const cmapIndex = Math.floor(index * (cmapLength / length));
  return colorMap[cmapIndex];
}

type AzimuthRange = {
  start: number;
  end: number;
};

type AxisAngleData = {
  direction: string;
  range: AzimuthRange | AzimuthRange[];
};

const rfapDirectionStore = create<RfApDirectionStore>((set, get) => ({
  data: null,
  error: null,
  loading: false,
  startDate: subDays(Date.now(), 30).getTime(),
  endDate: Date.now(),
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
  periodIndex: 1,
  barAxisType: 'count',
  roseAxisType: 'count',
  setBarAxisType: (barAxisType: AxisType) => set({ barAxisType }),
  setRoseAxisType: (roseAxisType: AxisType) => set({ roseAxisType }),
  setPeriodIndex: (index: number) => set({ periodIndex: index }),
  setTimeRange: (startDate: number, endDate: number) => set({ startDate, endDate }),
  fetchRfApDirection: async () => {
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

    const { startDate, endDate } = get();

    const url = apiVersion.getRfApDirection.v1(currentOrganization.id, currentVolcano.id, currentCatalog.id);
    const response = await api(url, {
      params: {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      },
    });
    if (!response.ok) {
      throw new CustomError('Failed to fetch RF & AP data');
    }
    const data: RfApData = await response.json();
    set({ data });
  },
  getDistributionChartOption: () => {
    const { startDate, endDate, data } = get();

    const yAxis: YAXisOption[] = [
      {
        name: 'RF & AP Count',
        nameGap: 40,
        nameLocation: 'middle',
        scale: false,
        splitLine: { show: false },
        type: 'value',
        axisLine: { show: true },
        axisTick: { show: true },
      },
      {
        name: 'Max. Distance (km)',
        nameGap: 40,
        nameLocation: 'middle',
        scale: false,
        splitLine: { show: false },
        type: 'value',
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: {
          formatter: (value: number) => {
            return value % 1000 === 0 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
          },
        },
      },
    ];
    const xAxis: XAXisOption = {
      max: endDate,
      min: startDate,
      splitLine: { show: false },
      type: 'time',
    };

    const barSeries: SeriesOption[] = data
      ? data?.directional_results.map((directionalResult, index) => {
          return {
            areaStyle: {},
            data: directionalResult.data.map((item) => [new Date(item.time).getTime(), item.count]),
            type: 'bar',
            stack: 'count',
            itemStyle: {
              color: getColor(index, data.directional_results.length),
            },
            name: directionalResult.direction,
          };
        })
      : [];
    const distanceSeries: SeriesOption = {
      data: data ? data.daily_results.map((item) => [item.time, item.distance] as [string, number]).filter((item) => item[1] > 0) : [],
      name: 'Max. Distance',
      type: 'scatter',
      symbol: 'circle',
      symbolSize: 7,
      yAxisIndex: 1,
    };
    const series = [...barSeries, distanceSeries];
    const legend: LegendComponentOption = {
      type: 'plain',
      bottom: 0,
      itemWidth: 15,
      itemHeight: 10,
      textStyle: { fontSize: 10 },
    };
    const title: TitleOption = {
      text: 'RF & AP Directional Distribution',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      subtext: '',
      subtextStyle: { color: '#363636' },
    };
    const grid: GridOption = {
      bottom: 65,
    };
    const tooltip: TooltipComponentOption = {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          type: 'dashed',
        },
      },
      formatter: (params: TopLevelFormatterParams) => {
        let template = '';

        (params as CallbackDataParams[]).forEach((param, index) => {
          const { seriesName, value, color } = param;
          if (index === 0) {
            const time = (value as [string, any])[0];
            const formattedTime = format(new Date(time), 'yyyy-MM-dd');
            template += `${formattedTime}<br />`;
          }
          if (seriesName === 'Max. Distance') {
            const [, distance] = value as [string, number];
            template += `${circle(color as string)} ${seriesName}: ${distance} m<br />`;
          } else {
            const [, count] = value as [string, number];
            template += `${circle(color as string)} ${seriesName}: ${count}<br />`;
          }
        });

        return template;
      },
    };

    return {
      baseOption: {
        grid,
        legend,
        series,
        title,
        tooltip,
        xAxis,
        yAxis,
      },
      media: [],
    };
  },
  getDirectionRoseChartOption: () => {
    const { data, roseAxisType } = get();

    const axisType = roseAxisType;
    const sector = 8;
    const startAngle = 360 / sector / 2 + 90;
    const angleAxisData: AxisAngleData[] = [
      {
        direction: 'N [Utara]',
        range: [
          { start: 337.5, end: 360 },
          { start: 0, end: 22.5 },
        ],
      },
      { direction: 'NE [Timur Laut]', range: { start: 22.5, end: 67.5 } },
      { direction: 'E [Timur]', range: { start: 67.5, end: 112.5 } },
      { direction: 'SE [Tenggara]', range: { start: 112.5, end: 157.5 } },
      { direction: 'S [Selatan]', range: { start: 157.5, end: 202.5 } },
      { direction: 'SW [Barat Daya]', range: { start: 202.5, end: 247.5 } },
      { direction: 'W [Barat]', range: { start: 247.5, end: 292.5 } },
      { direction: 'NW [Barat Laut]', range: { start: 292.5, end: 337.5 } },
    ];

    return {
      baseOption: {
        angleAxis: {
          type: 'category',
          startAngle,
          axisLine: {
            show: true,
          },
          axisTick: {
            alignWithLabel: true,
          },
          data: angleAxisData.map((item) => item.direction),
        },
        legend: {
          type: 'plain',
          bottom: 0,
          itemWidth: 15,
          itemHeight: 10,
          textStyle: { fontSize: 11 },
        },
        polar: {
          radius: '60%',
        },
        radiusAxis: {
          axisLine: { show: false },
          axisLabel: { show: true, fontSize: 9 },
          minorTick: { show: false },
          axisTick: { show: false },
        },
        title: {
          align: 'right',
          left: 'center',
          show: true,
          text: 'RF & AP Direction Rose',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
          subtext: '',
          subtextStyle: { color: '#363636' },
        },
        tooltip: {
          formatter: function (param: TopLevelFormatterParams) {
            const { color, name, value } = param as { color: string; name: string; value: number };
            const formattedAxisType = axisType === 'count' ? 'Count' : 'Distance';
            const formattedValue = axisType === 'count' ? `${value}` : `${value} m`;

            return `
              ${circle(color)} ${name}<br />
              ${formattedAxisType}: ${formattedValue}<br />
            `;
          },
        },
        series: data
          ? data.directional_results.map((d) => {
              // Calculate the bin for each direction.
              const bin = angleAxisData.reduce((acc, curr) => {
                let isInRange = false;
                if (Array.isArray(curr.range)) {
                  isInRange = curr.range.some(({ start, end }) => d.azimuth >= start && d.azimuth < end);
                } else {
                  isInRange = d.azimuth >= curr.range.start && d.azimuth < curr.range.end;
                }
                if (isInRange) {
                  acc.push(axisType === 'count' ? d.count : d.distance);
                } else {
                  acc.push(0);
                }
                return acc;
              }, [] as number[]);

              return {
                data: bin,
                name: d.direction,
                type: 'bar',
                coordinateSystem: 'polar',
                stack: 'count',
                itemStyle: {
                  color: getColor(d.direction, data.directional_results.length),
                },
              };
            })
          : [],
      },
      media: [],
    };
  },
  getDirectionBarChartOption: () => {
    const { data, barAxisType } = get();
    const axisType = barAxisType;
    const f = numberFormatterFactory(0);

    const xAxis: XAXisOption = {
      axisLabel: {
        formatter: (value: number) => {
          if (axisType === 'count') {
            return f(value);
          } else {
            return value % 1000 === 0 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
          }
        },
      },
      type: 'value',
      name: axisType === 'count' ? 'Count' : 'Max. Distance (km)',
      nameGap: 28,
      nameLocation: 'middle',
      axisLine: { show: true },
      axisTick: { show: true },
    };
    const yAxis: YAXisOption = {
      type: 'category',
      axisLabel: {
        interval: 0,
      },
      axisLine: { show: true },
      axisTick: { show: false },
    };
    const tooltip = {
      show: true,
      formatter: function (params: any) {
        if (axisType === 'count') {
          let countLabel = '';
          let distanceLabel = '';
          if (params.seriesName === 'RF') {
            countLabel = 'RF count';
            distanceLabel = 'RF max. dist';
          } else if (params.seriesName === 'AP') {
            countLabel = 'AP count';
            distanceLabel = 'AP max. dist';
          } else {
            countLabel = 'Count';
            distanceLabel = 'Max. distance';
          }

          return `
              ${circle(params.color)} ${params.value[1]}<br />
              ${countLabel}: ${f(params.value[0])}<br />
              ${distanceLabel}: ${f(params.value[2])} m<br />
              Max. distance: ${f(params.value[3])} m<br />
            `;
        } else if (axisType === 'distance') {
          return `
              ${circle(params.color)} ${params.value[1]}<br />
              Max. distance: ${f(params.value[0])} m<br />
              RF & AP count: ${f(params.value[2])}<br />
          `;
        } else {
          return '';
        }
      },
    } as TooltipOption;
    let series: SeriesOption[] = [];
    if (axisType === 'count') {
      series = [
        {
          name: 'RF',
          type: 'bar',
          stack: 'count',
          itemStyle: {
            color: '#63CA56',
          },
          data: data ? data.directional_results.map((v) => [v.rf_count, v.direction, v.rf_distance, v.distance, v.count]).sort((a, b) => a[4] - b[4]) : [],
        },
        {
          name: 'AP',
          type: 'bar',
          stack: 'count',
          itemStyle: {
            color: '#EB4B63',
          },
          data: data ? data.directional_results.map((v) => [v.ap_count, v.direction, v.ap_distance, v.distance, v.count]).sort((a, b) => a[4] - b[4]) : [],
        },
      ];
    } else {
      series = [
        {
          name: 'RF & AP',
          type: 'bar',
          stack: 'distance',
          itemStyle: {
            color: '#3478F6',
          },
          data: data ? data.directional_results.map((v) => [v.distance, v.direction, v.count]).sort((a, b) => b[0] - a[0]) : [],
        },
      ];
    }
    const title: TitleOption = {
      text: 'RF & AP Direction Bar',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      subtext: '',
      subtextStyle: { color: '#363636' },
    };
    const legend: LegendOption =
      axisType === 'count'
        ? { show: true, type: 'plain', bottom: 0, itemWidth: 15, itemHeight: 10, textStyle: { fontSize: 11 } }
        : {
            show: false,
          };
    return {
      baseOption: {
        xAxis,
        yAxis,
        tooltip,
        series,
        title,
        legend,
      },
      media: [],
    };
  },
}));

export const useRfApDirectionStore = createSelectors(rfapDirectionStore);
