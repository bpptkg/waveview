import { SeriesJSON } from "@waveview/ndarray";
import { ScaleOptions } from "../scale/scale";
import { LayoutRect } from "../util/types";
import { Segment } from "./dataStore";

export interface OffscreenRenderTrackContext {
  trackRect: LayoutRect;
  xScaleOptions: ScaleOptions;
  yScaleOptions: ScaleOptions;
  seriesData: SeriesJSON;
  segment: Segment;
}

export interface OffscreenRenderContext {
  tracks: OffscreenRenderTrackContext[];
  rect: LayoutRect;
  gridRect: LayoutRect;
  pixelRatio: number;
  scaling: "global" | "local";
  color: string;
  interval: number;
  duration: number;
}

export interface OffscreenRenderTrackInfo {
  segment: Segment;
  minMax: [number, number];
}

export interface OffscreenRenderResult {
  image: string;
  tracks: OffscreenRenderTrackInfo[];
}
