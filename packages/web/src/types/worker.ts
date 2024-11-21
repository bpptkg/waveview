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
  /**
   * The request ID.
   */
  requestId: string;
  /**
   * The command that was executed on the worker.
   */
  command: string;
  /**
   * The channel ID.
   */
  channelId: string;
  /**
   * The start time of the request.
   */
  start: number;
  /**
   * The end time of the request.
   */
  end: number;
  /**
   * The index array.
   */
  index: Float64Array;
  /**
   * The data array.
   */
  data: Float64Array;
  /**
   * The minimum value of the data array.
   */
  min: number;
  /**
   * The maximum value of the data array.
   */
  max: number;
  /**
   * The mean value of the data array.
   */
  mean: number;
  /**
   * The number of samples.
   */
  count: number;
}

export interface SpectrogramRequestData {
  requestId: string;
  channelId: string;
  start: number;
  end: number;
  width: number;
  height: number;
  resample: boolean;
  sampleRate: number;
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
  resample: boolean;
  sampleRate: number;
}
