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
    this.clear();

    const model = this.getModel();
    if (model.isEmpty()) {
      return;
    }

    const { xAxis, yAxis } = this;
    const data = model.getData();
    const graphics = new PIXI.Graphics();
    let first = false;
    for (const [px, py] of data.items()) {
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

    const w = this.model.chart.getWidth();
    const h = this.model.chart.getHeight();

    const renderTexture = PIXI.RenderTexture.create({
      width: w,
      height: h,
    });

    this.model.chart.app.renderer.render({
      container: graphics,
      target: renderTexture,
    });

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.position.set(0, 0);
    this.group.addChild(sprite);
    graphics.destroy();
  }
}
