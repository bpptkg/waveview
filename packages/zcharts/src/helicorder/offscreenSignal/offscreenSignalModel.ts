import { merge } from "zrender/lib/core/util";
import { Model } from "../../core/model";
import { ModelOptions } from "../../util/types";
import { Segment } from "../dataStore";

export interface OffscreenSignalOptions extends ModelOptions {
  image: string;
  segmentStart: Segment;
  segmentEnd: Segment;
}

export class OffscreenSignalModel extends Model<OffscreenSignalOptions> {
  static defaultOptions(): OffscreenSignalOptions {
    return {
      image: "",
      segmentStart: [0, 0],
      segmentEnd: [0, 0],
    };
  }

  constructor(options?: Partial<OffscreenSignalOptions>) {
    const opts = merge(
      OffscreenSignalModel.defaultOptions(),
      options || {},
      true
    );
    super(opts);
  }

  isEmpty(): boolean {
    return this.options.image === "";
  }

  clear(): void {
    this.setOptions(OffscreenSignalModel.defaultOptions());
  }
}
