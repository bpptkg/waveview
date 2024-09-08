import { ChartOptions } from "../core/chartModel";
import { GridOptions } from "../grid/gridModel";
import { Channel } from "../util/types";

export interface HelicorderEventMarkerOptions {
  start: number;
  end: number;
  color: string;
}

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
}

export function getDefaultOptions(): HelicorderOptions {
  return {
    backgroundColor: "#ffffff",
    devicePixelRatio: window.devicePixelRatio,
    darkMode: false,
    autoDensity: true,
    antialias: true,
    autoResize: true,
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
  };
}
