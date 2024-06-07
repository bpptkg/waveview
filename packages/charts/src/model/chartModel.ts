import { ModelOptions } from "../util/types";
import { Model } from "./model";

export interface ChartOptions extends ModelOptions {
  backgroundColor?: string;
  devicePixelRatio?: number;
  darkMode?: boolean;
}

export class ChartModel<T extends ChartOptions> extends Model<T> {
  override readonly type = "chart";

  static defaultOptions: ChartOptions = {
    backgroundColor: "#ffffff",
    devicePixelRatio: window.devicePixelRatio,
    darkMode: false,
  };

  constructor(options?: T) {
    const opts = { ...ChartModel.defaultOptions, ...options };
    super(opts as T);
  }
}
