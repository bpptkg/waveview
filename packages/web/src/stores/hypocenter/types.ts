import { Hypocenter } from '../../types/hypocenter';
import { PeriodItem } from '../../types/period';

export interface HypocenterStore {
  startDate: number;
  endDate: number;
  periods: PeriodItem[];
  periodIndex: number;
  currentMethod: string;
  methods: string[];
  hypocenter: Hypocenter | null;
  loading: boolean;
  error: string;
  pitch: number;
  yaw: number;
  setPeriodIndex: (index: number) => void;
  setTimeRange: (startDate: number, endDate: number) => void;
  setCurrentMethod: (method: string) => void;
  setPitch: (pitch: number) => void;
  setYaw: (yaw: number) => void;
  fetchHypocenter: () => Promise<void>;
  getEChartsOption: () => any;
}
