import { SeriesJSON } from "@waveview/ndarray";
import { ScaleOptions } from "../scale/scale";
import { LayoutRect } from "../util/types";

export interface OffscreenRenderTrackContext {
  channelId: string;
  trackRect: LayoutRect;
  xScaleOptions: ScaleOptions;
  yScaleOptions: ScaleOptions;
  series: SeriesJSON;
  min: number;
  max: number;
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

export interface OffscreenRenderTrackInfo {
  channelId: string;
  scaling: "global" | "local";
  min: number;
  max: number;
  normFactor: number;
  normMin: number;
  normMax: number;
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
  /**
   * The general info of the rendered seismogram tracks.
   */
  info: OffscreenRenderTrackInfo[];
}
