
export type WorkerRequestType = string;

export interface WorkerRequestData<T> {
  type: WorkerRequestType;
  payload: T;
}

export interface WorkerResponseData<T> {
  type: WorkerRequestType;
  payload: T;
}

export type ResampleMode = "match_width" | "max_points" | "none" | "auto";

export interface StreamRequestData {
  requestId: string;
  channelId: string;
  start: number;
  end: number;
  mode?: ResampleMode;
  width?: number;
  devicePixelRatio?: number;
  maxPoints?: number;
  forceCenter?: boolean;
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
  data: Float64Array;
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