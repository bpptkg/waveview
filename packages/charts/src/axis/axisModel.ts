import { Model } from "../model/model";
import { LinearScale } from "../scale/linear";
import { Scale } from "../scale/scale";
import { TimeScale } from "../scale/time";
import { clone, merge } from "../util/merge";
import { DeepPartial } from "../util/types";

export interface AxisTickOptions {
  show: boolean;
  color: string;
  length: number;
  inside: boolean;
  width: number;
}

export interface AxisLabelOptions {
  show: boolean;
  inside: boolean;
  margin: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  formatter?: (value: number) => string;
}

export interface AxisLineOptions {
  show: boolean;
  color: string;
  width: number;
}

export interface SplitLineOptions {
  show: boolean;
  color: string;
  width: number;
}

export interface MinorTickOptions {
  show: boolean;
  color: string;
  length: number;
  width: number;
  splitNumber: number;
}

export type ScaleType = LinearScale | TimeScale;

export interface AxisOptions {
  show: boolean;
  position: "top" | "right" | "bottom" | "left";
  type: "linear" | "time" | "log";
  name: string;
  nameGap: number;
  axisTick: AxisTickOptions;
  minorTick: MinorTickOptions;
  axisLabel: AxisLabelOptions;
  axisLine: AxisLineOptions;
  splitLine: SplitLineOptions;
  min?: number;
  max?: number;
  useUTC: boolean;
}

export class AxisModel extends Model<AxisOptions> {
  override readonly type = "axis";

  static defaultOptions: AxisOptions = {
    show: true,
    position: "top",
    type: "linear",
    name: "",
    nameGap: 10,
    axisTick: {
      show: true,
      length: 10,
      inside: true,
      color: "#000",
      width: 1,
    },
    minorTick: {
      show: true,
      length: 5,
      splitNumber: 5,
      color: "#000",
      width: 1,
    },
    axisLine: {
      show: true,
      color: "#000",
      width: 1,
    },
    axisLabel: {
      show: true,
      inside: false,
      margin: 8,
      color: "#000",
      fontSize: 12,
      fontFamily: "Arial",
    },
    splitLine: {
      show: false,
      color: "#ccc",
      width: 1,
    },
    useUTC: false,
  };

  readonly scale: Scale;

  constructor(options?: DeepPartial<AxisOptions>) {
    const opts = merge(
      clone(AxisModel.defaultOptions),
      options || {},
      true
    ) as AxisOptions;
    super(opts);

    if (opts.type === "linear") {
      this.scale = new LinearScale();
    } else if (opts.type === "time") {
      this.scale = new TimeScale({
        isUTC: opts.useUTC,
      });
    } else {
      throw new Error("Unsupported scale type");
    }
  }

  getScale(): ScaleType {
    return this.scale;
  }
}
