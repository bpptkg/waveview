import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { SeriesModel } from "../model/series";
import { merge } from "../util/merge";
import { LayoutRect, SeriesOptions, ThemeStyle } from "../util/types";
import { ChartView } from "../view/chartView";
import { View } from "../view/view";

export interface LineSeriesOptions extends SeriesOptions {
  color: string;
  width: number;
}

export class LineSeriesModel extends SeriesModel<LineSeriesOptions> {
  override type = "line";

  static defaultOptions: LineSeriesOptions = {
    color: "#000",
    width: 1,
  };

  constructor(options?: Partial<LineSeriesOptions>) {
    const opts = merge(
      { ...LineSeriesModel.defaultOptions },
      options
    ) as LineSeriesOptions;
    super(opts);
  }
}

export class LineSeries extends View<LineSeriesModel> {
  override type = "line";
  private _rect: LayoutRect;
  readonly xAxis: Axis;
  readonly yAxis: Axis;
  readonly chart: ChartView;

  private readonly _graphics: PIXI.Graphics;

  constructor(
    xAxis: Axis,
    yAxis: Axis,
    chart: ChartView,
    options?: Partial<LineSeriesOptions>
  ) {
    const model = new LineSeriesModel(options);
    super(model);

    this._rect = xAxis.getRect();
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.chart = chart;

    this._graphics = new PIXI.Graphics();
    this.group.addChild(this._graphics);
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { seriesStyle } = theme;
    this.model.mergeOptions({
      color: seriesStyle.lineColor,
      width: seriesStyle.lineWidth,
    });
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    this._graphics.clear();

    const model = this.getModel();
    if (model.isEmpty()) {
      return;
    }

    const { xAxis, yAxis } = this;
    const data = model.getData();
    let first = false;
    for (const [px, py] of data.items()) {
      const cx = xAxis.getPixelForValue(px);
      const cy = yAxis.getPixelForValue(py);

      if (!first) {
        this._graphics.moveTo(cx, cy);
        first = true;
      } else {
        this._graphics.lineTo(cx, cy);
      }
    }

    const { color, width } = model.getOptions();

    this._graphics.stroke({
      color,
      width,
    });
  }
}
