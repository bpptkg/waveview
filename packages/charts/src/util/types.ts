import * as PIXI from "pixi.js";
import { Series } from "@waveview/ndarray";

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
