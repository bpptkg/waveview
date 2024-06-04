import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { SeriesModel } from "../model/series";
import { merge } from "../util/merge";
import { LayoutRect, SeriesOptions } from "../util/types";
import { ChartView } from "../view/chartView";
import { View } from "../view/view";

export interface LineSeriesOptions extends SeriesOptions {}

export class LineSeries extends SeriesModel<LineSeriesOptions> {
  override type = "line";
  readonly chart: ChartView;

  constructor(chart: ChartView, options?: Partial<LineSeriesOptions>) {
    const opts = merge({}, options) as LineSeriesOptions;
    super(opts);

    this.chart = chart;
  }
}

export class LineSeriesView extends View<LineSeries> {
  override type = "line";
  private _rect: LayoutRect;
  readonly xAxis: Axis;
  readonly yAxis: Axis;

  constructor(model: LineSeries, rect: LayoutRect, xAxis: Axis, yAxis: Axis) {
    super(model);

    this._rect = rect;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    const model = this.getModel();
    if (model.isEmpty()) {
      return;
    }

    const { xAxis, yAxis } = this;
    const data = model.getData();
    const graphics = new PIXI.Graphics();
    let first = false;
    for (let index = 0; index < data.length; index++) {
      const [px, py] = data[index];
      const cx = xAxis.getPixelForValue(px);
      const cy = yAxis.getPixelForValue(py);

      if (!first) {
        graphics.moveTo(cx, cy);
        first = true;
      } else {
        graphics.lineTo(cx, cy);
      }
    }

    graphics.stroke({
      color: "#000",
      width: 1,
    });
    this.group.addChild(graphics);

    const chart = this.model.chart;
    const rect = chart.getGrid().getRect();
    const mask = new PIXI.Graphics();
    mask.rect(rect.x, rect.y, rect.width, rect.height).fill({
      color: 0xffffff,
    });
    chart.app.stage.addChild(mask);
    this.group.mask = mask;
  }
}
