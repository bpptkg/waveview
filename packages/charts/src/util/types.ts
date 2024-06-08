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

export type SeriesData = number[][];

export interface SeriesOptions {
  data: SeriesData;
  xRange?: [number, number];
  yRange?: [number, number];
}

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
