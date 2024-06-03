import { Axis } from "../axis/axis";
import { DataProvider } from "../data/dataProvider";
import { ChartOptions } from "../model/chartModel";
import { Track } from "../track/track";
import { ChartType, ChartView } from "../view/chartView";

export interface SeismogramChartOptions extends ChartOptions {}

function getDefaultOptions(): SeismogramChartOptions {
  return {};
}

export interface SeismogramChartType extends ChartType<SeismogramChartOptions> {
  update(): void;
}

export class Seismogram
  extends ChartView<SeismogramChartOptions>
  implements SeismogramChartType
{
  override readonly type = "seismogram";
  private readonly tracks: Track[] = [];
  private readonly xAxis: Axis;
  private readonly dataProvider: DataProvider;

  constructor(
    dom: HTMLCanvasElement,
    options?: Partial<SeismogramChartOptions>
  ) {
    const opts = Object.assign(
      {},
      getDefaultOptions(),
      options || {}
    ) as SeismogramChartOptions;
    super(dom, opts);
  }

  update(): void {
    // TODO
  }
}
