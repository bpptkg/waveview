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
