import { ModelOptions } from "../util/types";
import { Model } from "./model";

export interface ChartOptions extends ModelOptions {
  backgroundColor: string;
  devicePixelRatio: number;
  darkMode: boolean;
  autoDensity: boolean;
  antialias: boolean;
}

export class ChartModel<T extends ChartOptions> extends Model<T> {
  override readonly type = "chart";

  constructor(options?: T) {
    const opts = { ...options };
    super(opts as T);
  }
}
