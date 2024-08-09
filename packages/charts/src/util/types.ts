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
  getAPI(version: string): any;
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
  index: Float64Array;
  data: Float64Array;
  extent: [number, number];
  channelId: string;
  start: number;
  end: number;
}

export interface RenderableGroup {
  group: PIXI.Container;
  render(): void;
  dispose(): void;
}

export interface RefreshMode {
  mode: "light" | "hard";
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ThemeRegistry {
  [key: string]: ThemeStyle;
}

export type ThemeName = keyof ThemeRegistry;

export interface AxisStyle {
  axisLineColor: string;
  axisTickColor: string;
  splitLineColor: string;
}

export interface GridStyle {
  lineColor: string;
  lineWidth: number;
}

export interface SeriesStyle {
  lineColor: string;
  lineWidth: number;
}

export interface HighlightStyle {
  color: string;
  opacity: number;
  borderWidth: number;
}

export interface ThemeStyle {
  backgroundColor: string;
  foregroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  gridStyle: GridStyle;
  axisStyle: AxisStyle;
  seriesStyle: SeriesStyle;
  highlightStyle: HighlightStyle;
}

export interface Channel {
  /**
   * Unique identifier for the channel.
   */
  id: string;
  /**
   * Name of the channel.
   */
  label?: string;
  /**
   * Sublabel of the channel.
   */
  sublabel?: string;
  /**
   * Description of the channel.
   */
  color?: string;
}

export interface ResizeOptions {
  width: number;
  height: number;
}
