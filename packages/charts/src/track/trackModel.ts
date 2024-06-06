import { Model } from "../model/model";
import { merge } from "../util/merge";
import { ChartView } from "../view/chartView";

export interface HightlightOptions {
  color: string;
  opacity: number;
  borderWidth: number;
}

export interface TrackOptions {
  show: boolean;
  leftLabel: string;
  rightLabel: string;
  margin: number;
  highlight: HightlightOptions;
}

export class TrackModel extends Model<TrackOptions> {
  override readonly type = "track";

  static defaultOptions: TrackOptions = {
    show: true,
    leftLabel: "",
    rightLabel: "",
    margin: 10,
    highlight: {
      color: "#9747FF",
      opacity: 0.25,
      borderWidth: 1,
    },
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
