import { EChartsOption } from 'echarts';
import { Hypocenter, HypocenterWorkspace } from '../../types/hypocenter';
import { PeriodItem } from '../../types/period';

export interface HypocenterStore {
  workspace: HypocenterWorkspace;
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
  eventTypesFilter: string[];
  setWorkspace: (workspace: HypocenterWorkspace) => void;
  setPeriodIndex: (index: number) => void;
  setTimeRange: (startDate: number, endDate: number) => void;
  setCurrentMethod: (method: string) => void;
  setPitch: (pitch: number) => void;
  setYaw: (yaw: number) => void;
  setEventTypesFilter: (types: string[]) => void;
  fetchHypocenter: () => Promise<void>;
  getEChartsOption: () => EChartsOption;
}
