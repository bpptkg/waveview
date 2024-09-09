import { ModelOptions } from "../util/types";
import { Model } from "./model";

export interface ChartOptions extends ModelOptions {
  backgroundColor: string;
  darkMode: boolean;
}

export class ChartModel<T extends ChartOptions> extends Model<T> {
  constructor(options?: T) {
    const opts = { ...options };
    super(opts as T);
  }
}
