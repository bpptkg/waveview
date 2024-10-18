import { Model } from "../../core/model";
import { ModelOptions } from "../../util/types";

export interface OffscreenSignalOptions extends ModelOptions {
  image: string;
  start: number;
  end: number;
}

export class OffscreenSignalModel extends Model<OffscreenSignalOptions> {
  static readonly defaultOptions: OffscreenSignalOptions = {
    image: "",
    start: 0,
    end: 0,
  };

  constructor(options: Partial<OffscreenSignalOptions>) {
    const opts = { ...OffscreenSignalModel.defaultOptions, ...options };
    super(opts);
  }

  isEmpty(): boolean {
    return this.options.image === "";
  }

  clear(): void {
    this.mergeOptions({ image: "", start: 0, end: 0 });
  }
}
