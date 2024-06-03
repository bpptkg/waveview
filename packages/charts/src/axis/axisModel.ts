import { Model } from "../model/model";
import { LinearScale } from "../scale/linear";
import { Scale } from "../scale/scale";
import { TimeScale } from "../scale/time";
import { merge } from "../util/merge";
import { ChartView } from "../view/chartView";

export interface AxisTickOptions {
  show: boolean;
  length: number;
  inside: boolean;
}

export interface AxisLabelOptions {
  show: boolean;
  inside: boolean;
  margin: number;
  formatter?: (value: number) => string;
}

export interface SplitLineOptions {
  show: boolean;
  color: string;
  width: number;
}

export interface MinorTickOptions {
  show: boolean;
  length: number;
  splitNumber: number;
}

export interface AxisOptions {
  show: boolean;
  position: "top" | "right" | "bottom" | "left";
  type: "linear" | "time" | "log";
  name: string;
  nameGap: number;
  axisTick: AxisTickOptions;
  minorTick: MinorTickOptions;
  axisLabel: AxisLabelOptions;
  splitLine: SplitLineOptions;
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
    },
    minorTick: {
      show: true,
      length: 5,
      splitNumber: 5,
    },
    axisLabel: {
      show: true,
      inside: false,
      margin: 8,
    },
    splitLine: {
      show: false,
      color: "#ccc",
      width: 1,
    },
  };

  readonly scale: Scale;

  readonly chart: ChartView;

  constructor(chart: ChartView, options?: Partial<AxisOptions>) {
    const opts = merge(
      Object.assign({}, AxisModel.defaultOptions),
      options || {},
      true
    ) as AxisOptions;
    super(opts);

    this.chart = chart;
    if (opts.type === "linear") {
      this.scale = new LinearScale();
      this.scale.setExtent([0, 1]);
    } else if (opts.type === "time") {
      this.scale = new TimeScale();
    } else {
      throw new Error("Unsupported scale type");
    }
  }

  getChart(): ChartView {
    return this.chart;
  }

  getScale(): Scale {
    return this.scale;
  }
}
