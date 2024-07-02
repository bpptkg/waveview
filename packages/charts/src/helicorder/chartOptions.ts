import { GridOptions } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import { Channel } from "../util/types";

export interface MarkerOptions {
  value: number;
  color?: string;
  width?: number;
}

export interface HelicorderChartOptions extends ChartOptions {
  /**
   * Channel ID of the helicorder chart, e.g. ``IU.ANMO.00.BHZ``.
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
   * Vertical scaling of the helicorder chart. ``local`` scales each track
   * independently, while ``global`` scales all tracks together.
   */
  verticalScaling: "local" | "global";
  /**
   * Grid options for the helicorder chart.
   */
  grid: Partial<GridOptions>;
  /**
   * Local timezone of the helicorder chart.
   */
  timezone: string;
  /**
   * The timestamp of the last selection in the helicorder chart.
   */
  selection: number;
  /**
   * Markers to be displayed in the helicorder chart.
   */
  markers: MarkerOptions[];
}

export function getDefaultOptions(): HelicorderChartOptions {
  return {
    backgroundColor: "#ffffff",
    devicePixelRatio: window.devicePixelRatio,
    darkMode: false,
    autoDensity: true,
    antialias: true,
    channel: {
      id: "",
    },
    interval: 30,
    duration: 12,
    offsetDate: Date.now(),
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
    grid: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 80,
    },
    timezone: "UTC",
    selection: 0,
    markers: [],
  };
}
