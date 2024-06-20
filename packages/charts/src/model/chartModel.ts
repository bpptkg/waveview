import { ModelOptions } from "../util/types";
import { Model } from "./model";

export interface ChartOptions extends ModelOptions {
  backgroundColor?: string;
  devicePixelRatio?: number;
  darkMode?: boolean;
  autoDensity?: boolean;
  antialias?: boolean;
  resizeTo?: HTMLElement;
}

export class ChartModel<T extends ChartOptions> extends Model<T> {
  override readonly type = "chart";

  static defaultOptions: ChartOptions = {
    backgroundColor: "transparent",
    darkMode: false,
    autoDensity: true,
    antialias: true,
  };

  constructor(options?: T) {
    const opts = { ...ChartModel.defaultOptions, ...options };
    super(opts as T);
  }
}
