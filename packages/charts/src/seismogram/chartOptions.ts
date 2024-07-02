import { GridOptions } from "../grid";
import { ChartOptions } from "../model";
import { Channel } from "../util/types";

export interface EventMarkerOptions {
  start: number;
  end: number;
  color: string;
  opacity?: number;
}

export interface LineMarkerOptions {
  value: number;
  color: string;
  width?: number;
}

export interface MarkerOptions {
  type: "event" | "line";
  options: EventMarkerOptions | LineMarkerOptions;
}

export interface SeismogramChartOptions extends ChartOptions {
  /**
   * The start time of the chart in UNIX timestamp.
   */
  startTime?: number;
  /**
   * The end time of the chart in UNIX timestamp.
   */
  endTime?: number;
  /**
   * The interval of the chart in minutes if `startTime` and `endTime` are not
   * provided.
   */
  interval: number;
  /**
   * Whether to force the chart to center the data.
   */
  forceCenter: boolean;
  /**
   * Whether to use UTC time.
   */
  useUTC: boolean;
  /**
   * Vertical scaling of the helicorder chart. ``local`` scales each track
   * independently, while ``global`` scales all tracks together.
   */
  verticalScaling: "local" | "global";
  /**
   * The grid options.
   */
  grid: Partial<GridOptions>;
  /**
   * Local timezone name of the seismogram chart.
   */
  timezone: string;
  /**
   * The list of channel IDs.
   */
  channels: Channel[];
  /**
   * Markers to be displayed in the seismogram chart.
   */
  markers: MarkerOptions[];
}

export function getDefaultOptions(): SeismogramChartOptions {
  return {
    backgroundColor: "#ffffff",
    devicePixelRatio: window.devicePixelRatio,
    darkMode: false,
    autoDensity: true,
    antialias: true,
    startTime: undefined,
    endTime: undefined,
    interval: 30,
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
    channels: [],
    markers: [],
  };
}
