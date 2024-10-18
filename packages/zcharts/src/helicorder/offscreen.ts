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
