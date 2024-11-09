import { Channel } from '../../types/channel';
import { FieldType, PlotRemoveResponse } from '../../types/instrumentResponse';

export interface PlotRemoveResponseStore {
  channel: Channel | null;
  result: PlotRemoveResponse | null;
  error: string | null;
  loading: boolean;
  output: FieldType;
  useWaterLevel: boolean;
  waterLevel: number;
  usePreFilter: boolean;
  f1: number;
  f2: number;
  f3: number;
  f4: number;
  zeroMean: boolean;
  taper: boolean;
  taperFraction: number;
  setChannel: (channel: Channel) => void;
  setOutput: (output: FieldType) => void;
  setUseWaterLevel: (useWaterLevel: boolean) => void;
  setWaterLevel: (waterLevel: number) => void;
  setUsePreFilter: (usePreFilter: boolean) => void;
  setF1: (f1: number) => void;
  setF2: (f2: number) => void;
  setF3: (f3: number) => void;
  setF4: (f4: number) => void;
  setZeroMean: (zeroMean: boolean) => void;
  setTaper: (taper: boolean) => void;
  setTaperFraction: (taperFraction: number) => void;
  fetchPlotRemoveResponse: () => Promise<void>;
  clearResult: () => void;
}
