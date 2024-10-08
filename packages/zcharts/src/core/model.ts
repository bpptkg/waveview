import { merge } from "zrender/lib/core/util";
import { DeepPartial, ModelOptions } from "../util/types";

export class Model<T extends ModelOptions = ModelOptions> {
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

  setOptions(options: T): void {
    this._options = options;
  }

  mergeOptions(options: DeepPartial<T>): void {
    this._options = merge(this._options, options, true) as T;
  }
}
