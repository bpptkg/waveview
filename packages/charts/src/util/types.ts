import { Series } from "@waveview/ndarray";
import * as PIXI from "pixi.js";

export type ModelOptions = Record<string, any>;

export interface ScaleTick {
  value: number;
}

export interface LayoutRect extends PIXI.Rectangle {}

export interface Point {
  x: number;
  y: number;
}

export type SeriesData = Series<Float64Array, Float64Array>;

export interface SeriesOptions {}

export type TimeUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export interface EventManager {
  enable(): void;
  disable(): void;
}

export interface EventManagerConfig {}

export interface EventMap {
  [event: string]: (...args: any[]) => void;
}

export interface Extension<T> {
  install(target: T): void;
  uninstall(target: T): void;
}

export type ExtensionConstructor<T> = new (config?: any) => Extension<T>;

export type WorkerRequestType = "ping" | "stream.fetch" | "stream.fetch.error";

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
  channelId: string;
  start: number;
  end: number;
  mode: ResampleMode;
  width?: number;
  devicePixelRatio?: number;
  maxPoints?: number;
}

export interface StreamResponseData {
  index: Float64Array;
  data: Float64Array;
  extent: [number, number];
  channelId: string;
  start: number;
  end: number;
}
