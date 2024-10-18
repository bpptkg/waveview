import { SeriesJSON } from "@waveview/ndarray";
import { ScaleOptions } from "../scale/scale";
import { LayoutRect } from "../util/types";

export interface OffscreenRenderTrackContext {
  trackRect: LayoutRect;
  xScaleOptions: ScaleOptions;
  yScaleOptions: ScaleOptions;
  seriesData: SeriesJSON;
}

export interface OffscreenRenderContext {
  tracks: OffscreenRenderTrackContext[];
  rect: LayoutRect;
  gridRect: LayoutRect;
  pixelRatio: number;
  scaling: "global" | "local";
  color: string;
  timeMin: number;
  timeMax: number;
}

export interface OffscreenRenderResult {
  /**
   * Image data of the rendered seismogram.
   */
  image: string;
  /**
   * The start time of the rendered seismogram.
   */
  start: number;
  /**
   * The end time of the rendered seismogram.
   */
  end: number;
}
