import { Model } from "../model/model";
import { merge } from "../util/merge";
import { ChartView } from "../view/chartView";

export interface TrackOptions {
  show: boolean;
  leftLabel: string;
  rightLabel: string;
  margin: number;
}

export class TrackModel extends Model<TrackOptions> {
  override readonly type = "track";

  static defaultOptions: TrackOptions = {
    show: true,
    leftLabel: "",
    rightLabel: "",
    margin: 10,
  };

  readonly chart: ChartView;

  constructor(chart: ChartView, options?: Partial<TrackOptions>) {
    const opts = merge(
      { ...TrackModel.defaultOptions },
      options || {},
      true
    ) as TrackOptions;
    super(opts);

    this.chart = chart;
  }

  getChart(): ChartView {
    return this.chart;
  }
}
