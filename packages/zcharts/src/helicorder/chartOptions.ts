import { ChartOptions } from "../core/chartModel";
import { GridOptions } from "../grid/gridModel";
import { Channel } from "../util/types";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";

export type HelicorderEventMarkerOptions = EventMarkerOptions;

export interface HelicorderOptions extends ChartOptions {
  /**
   * Channel of the helicorder chart, e.g. ``VG.MEPAS.00.HHZ``.
   */
  channel: Channel;
  /**
   * Interval of the helicorder chart in minutes.
   */
  interval: number;
  /**
   * Duration of the helicorder chart in hours.
   */
  duration: number;
  /**
   * Offset date of the helicorder chart.
   */
  offsetDate: number;
  /**
   * Force center the signal in the helicorder chart.
   */
  forceCenter: boolean;
  /**
   * Use UTC time for the helicorder chart.
   */
  useUTC: boolean;
  /**
   * Grid options for the helicorder chart.
   */
  grid: Partial<GridOptions>;
  /**
   * Local timezone of the helicorder chart.
   */
  timezone: string;
  /**
   * Markers to be displayed in the helicorder chart.
   */
  markers: HelicorderEventMarkerOptions[];
  /**
   * Selection window size of the helicorder chart.
   */
  windowSize?: number;
  /**
   * Selection window of the helicorder chart.
   */
  selectionWindow?: [number, number];
  /**
   * The vertical scaling of the helicorder chart. ``global`` scales all tracks
   * relative to global min/max values, while ``local`` scales each track
   * relative to its own min/max values.
   */
  scaling: "global" | "local";
  /**
   * Clip the overscaled signal or not.
   */
  clip: boolean;
  /**
   * Show the clip indicator or not.
   */
  showClip: boolean;
}

export function getDefaultOptions(): HelicorderOptions {
  return {
    backgroundColor: "#ffffff",
    darkMode: false,
    channel: {
      id: "",
    },
    interval: 30,
    duration: 12,
    offsetDate: Date.now(),
    forceCenter: true,
    useUTC: false,
    grid: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 80,
    },
    timezone: "UTC",
    markers: [],
    selectionWindow: undefined,
    windowSize: undefined,
    scaling: "global",
    useOffscreenRendering: false,
    clip: false,
    showClip: false,
  };
}
