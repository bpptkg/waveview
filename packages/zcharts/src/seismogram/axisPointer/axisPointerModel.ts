import { merge } from "zrender/lib/core/util";
import { Model } from "../../core/model";

export interface AxisPointerOptions {
  enable: boolean;
  lineColor: string;
  lineWidth: number;
  textColor: string;
  fontSize: number;
  backgroundColor: string;
}

export class AxisPointerModel extends Model<AxisPointerOptions> {
  static defaultOptions(): AxisPointerOptions {
    return {
      enable: true,
      lineColor: "#ff0000",
      lineWidth: 1,
      textColor: "#fff",
      fontSize: 11,
      backgroundColor: "#ff0000",
    };
  }

  constructor(options?: Partial<AxisPointerOptions>) {
    const opts = merge(AxisPointerModel.defaultOptions(), options || {}, true);
    super(opts);
  }
}
