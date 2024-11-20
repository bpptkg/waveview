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
  static readonly defaultOptions: AxisPointerOptions = {
    enable: true,
    lineColor: "#ff0000",
    lineWidth: 1,
    textColor: "#fff",
    fontSize: 11,
    backgroundColor: "#ff0000",
  };

  constructor(options?: Partial<AxisPointerOptions>) {
    super({ ...AxisPointerModel.defaultOptions, ...options });
  }
}
