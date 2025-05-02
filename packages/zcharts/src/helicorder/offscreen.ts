import { SeriesJSON } from "@waveview/ndarray";
import { ScaleOptions } from "../scale/scale";
import { LayoutRect } from "../util/types";
import { Segment } from "./dataStore";

export interface OffscreenRenderTrackContext {
  /**
   * Track rectangle in the helicorder grid.
   */
  trackRect: LayoutRect;
  /**
   * Scale options for the x-axis.
   */
  xScaleOptions: ScaleOptions;
  /**
   * Scale options for the y-axis.
   */
  yScaleOptions: ScaleOptions;
  /**
   * Helicorder segment.
   */
  segment: Segment;
  /**
   * Series data to render.
   */
  series: SeriesJSON;
  /**
   * Min value of the series data.
   */
  min: number;
  /**
   * Max value of the series data
   */
  max: number;
}

export interface OffscreenRenderContext {
  /**
   * Helicorder tracks to render.
   */
  tracks: OffscreenRenderTrackContext[];
  /**
   * Chart rectangle of the helicorder.
   */
  rect: LayoutRect;
  /**
   * Grid rectangle of the helicorder.
   */
  gridRect: LayoutRect;
  /**
   * Pixel ratio of the canvas.
   */
  pixelRatio: number;
  /**
   * Scaling method for the helicorder tracks.
   */
  scaling: "global" | "local";
  /**
   * Color of the signal.
   */
  color: string;
  /**
   * Interval of the helicorder chart in minutes.
   */
  interval: number;
  /**
   * Duration of the helicorder chart in hours.
   */
  duration: number;
  /**
   * Clip the overscaled signal or not.
   */
  clip: boolean;
  /**
   * Clip scale of the helicorder chart.
   */
  clipScale: number;
}

export interface OffscreenRenderResult {
  /**
   * Base64 encoded image of the offscreen canvas.
   */
  image: string;
  /**
   * Helicorder segment start time. Segment can be used to identify the
   * helicorder segment and the corresponding track to place the image.
   */
  segmentStart: Segment;
  /**
   * Helicorder segment end time
   */
  segmentEnd: Segment;
}
