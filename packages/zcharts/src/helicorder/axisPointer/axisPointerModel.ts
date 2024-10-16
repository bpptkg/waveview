import { Model } from "../../core/model";

export interface AxisPointerOptions {
  enable: boolean;
  lineColor: string;
  lineWidth: number;
}

export class AxisPointerModel extends Model<AxisPointerOptions> {
  static readonly defaultOptions: AxisPointerOptions = {
    enable: true,
    lineColor: "#ff0000",
    lineWidth: 1,
  };

  constructor(options?: Partial<AxisPointerOptions>) {
    super({ ...AxisPointerModel.defaultOptions, ...options });
  }
}
