import { ChartOptions } from "../core/chartModel";
import { GridOptions } from "../grid/gridModel";
import { Channel } from "../util/types";

export interface SeismogramEventMarkerOptions {
  start: number;
  end: number;
  color: string;
  opacity?: number;
}

export interface SeismogramOptions extends ChartOptions {
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
  markers: SeismogramEventMarkerOptions[];
}

export function getDefaultOptions(): SeismogramOptions {
  return {
    backgroundColor: "#ffffff",
    devicePixelRatio: window.devicePixelRatio,
    darkMode: false,
    autoDensity: true,
    antialias: true,
    autoResize: true,
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
