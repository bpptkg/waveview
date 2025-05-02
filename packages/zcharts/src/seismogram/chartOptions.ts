import { ChartOptions } from "../core/chartModel";
import { GridOptions } from "../grid/gridModel";
import { Channel } from "../util/types";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";

export type SeismogramEventMarkerOptions = EventMarkerOptions;

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
   * The list of channels to be displayed in the seismogram chart.
   */
  channels: Channel[];
  /**
   * Markers to be displayed in the seismogram chart.
   */
  markers: SeismogramEventMarkerOptions[];
  /**
   * Whether to enable tooltip.
   */
  enableTooltip?: boolean;
  /**
   * The vertical scaling of the seismogram chart. Global scaling scales all
   * channels to the same scale. Local scaling scales each channel to its own
   * scale.
   */
  scaling: "global" | "local";
  /**
   * Whether to show the spectrogram.
   */
  showSpecrogram?: boolean;
  /**
   * Whether to show the signal.
   */
  showSignal?: boolean;
}

export function getDefaultOptions(): SeismogramOptions {
  return {
    backgroundColor: "#ffffff",
    darkMode: false,
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
      show: false,
    },
    timezone: "UTC",
    channels: [],
    markers: [],
    enableTooltip: true,
    scaling: "global",
    useOffscreenRendering: true,
    showSignal: true,
    showSpecrogram: false,
  };
}
