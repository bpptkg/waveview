import { FilterOptions, FilterType, TaperType } from './filter';

export type WorkerRequestType = string;

export interface WorkerRequestData<T> {
  type: WorkerRequestType;
  payload: T;
}

export interface WorkerResponseData<T> {
  type: WorkerRequestType;
  payload: T;
}

export type ResampleMode = 'match_width' | 'max_points' | 'none' | 'auto';

export interface StreamRequestData {
  requestId: string;
  channelId: string;
  start: number;
  end: number;
  forceCenter: boolean;
  resample: boolean;
  sampleRate: number;
}

export interface StreamResponseData {
  requestId: string;
  command: string;
  index: Float64Array;
  data: Float64Array;
  extent: [number, number];
  channelId: string;
  start: number;
  end: number;
}

export interface SpectrogramRequestData {
  requestId: string;
  channelId: string;
  start: number;
  end: number;
  width: number;
  height: number;
}

export interface SpectrogramResponseData {
  requestId: string;
  command: string;
  channelId: string;
  start: number;
  end: number;
  image: Uint8Array;
  timeMin: number;
  timeMax: number;
  freqMin: number;
  freqMax: number;
  timeLength: number;
  freqLength: number;
  min: number;
  max: number;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: Error;
}

export interface FilterRequestData {
  requestId: string;
  channelId: string;
  start: number;
  end: number;
  filterType: FilterType;
  filterOptions: FilterOptions;
  taperType: TaperType;
  taperWidth: number;
}
