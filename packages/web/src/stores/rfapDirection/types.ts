import { EChartsOption } from 'echarts';
import { PeriodItem } from '../../types/period';
import { RfApData } from '../../types/rfap';

export type AxisType = 'count' | 'distance';

export interface DirectionBarOptions {
  axisType: AxisType;
}

export interface RfApDirectionStore {
  data: RfApData | null;
  error: string | null;
  loading: boolean;
  startDate: number;
  endDate: number;
  periods: PeriodItem[];
  periodIndex: number;
  barAxisType: AxisType;
  roseAxisType: AxisType;
  setBarAxisType: (axisType: AxisType) => void;
  setRoseAxisType: (axisType: AxisType) => void;
  setPeriodIndex: (index: number) => void;
  setTimeRange: (startDate: number, endDate: number) => void;
  fetchRfApDirection: () => Promise<void>;
  getDistributionChartOption: () => EChartsOption;
  getDirectionRoseChartOption: () => EChartsOption;
  getDirectionBarChartOption: () => EChartsOption;
}
