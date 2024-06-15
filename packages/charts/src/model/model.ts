import { merge } from "../util/merge";
import { DeepPartial, ModelOptions } from "../util/types";

export class Model<T extends ModelOptions = ModelOptions> {
  type = "model";
  private _options: T;

  constructor(options?: T) {
    this._options = options || ({} as T);
  }

  get options(): T {
    return this._options;
  }

  getOptions(): T {
    return this._options;
  }

  mergeOptions(options: DeepPartial<T>): void {
    this._options = merge(this._options, options, true) as T;
  }
}
