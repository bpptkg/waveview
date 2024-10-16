import { ModelOptions } from "../util/types";
import { Model } from "./model";

export interface ChartOptions extends ModelOptions {
  /**
   * The background color of the chart.
   */
  backgroundColor: string;
  /**
   * The color of the chart border.
   */
  darkMode: boolean;
  /**
   * Use offscreen rendering for the helicorder chart. This is useful for
   * rendering large amounts of data in a separate thread. Offscreen rendering
   * only renders signal data and does not render any other chart elements. It
   * is only supported in modern browsers and requires a web worker to be
   * enabled.
   */
  useOffscrrenRendering: boolean;
}

export class ChartModel<T extends ChartOptions> extends Model<T> {
  constructor(options?: T) {
    const opts = { ...options };
    super(opts as T);
  }
}
