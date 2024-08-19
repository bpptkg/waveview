import { PeriodItem } from '../../types/period';
import { Sampling, SeismicityData } from '../../types/seismicity';
import { EChartsOption } from 'echarts';

export interface SeismicityStore {
  seismicity: SeismicityData[];
  loading: boolean;
  error: string;
  startDate: number;
  endDate: number;
  sampling: Sampling;
  periodsDay: PeriodItem[];
  periodsHour: PeriodItem[];
  periodIndex: number;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setTimeRange: (startDate: number, endDate: number) => void;
  setSampling: (sampling: Sampling) => void;
  setPeriodIndex: (index: number) => void;
  fetchSeismicity: () => Promise<void>;
  getEChartsOption: () => EChartsOption;
}