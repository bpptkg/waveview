import { Model } from "../model/model";
import { merge } from "../util/merge";
import { ModelOptions } from "../util/types";
import { ChartView } from "../view/chartView";

export interface GridOptions extends ModelOptions {
  show: boolean;
  top: number;
  bottom: number;
  left: number;
  right: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export class GridModel extends Model<GridOptions> {
  override readonly type = "grid";

  static defaultOptions: GridOptions = {
    show: true,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    borderColor: "#000",
    borderWidth: 1,
  };

  readonly chart: ChartView;

  constructor(chart: ChartView, options?: Partial<GridOptions>) {
    const opts = merge(
      { ...GridModel.defaultOptions },
      options || {},
      true
    ) as GridOptions;
    super(opts);

    this.chart = chart;
  }

  getChart(): ChartView {
    return this.chart;
  }
}
