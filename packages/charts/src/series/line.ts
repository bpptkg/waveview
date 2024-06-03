import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Grid } from "../grid/grid";
import { SeriesModel } from "../model/series";
import { LayoutRect, SeriesOptions } from "../util/types";
import { View } from "../view/view";

export interface LineSeriesOptions extends SeriesOptions {}

export class LineSeries extends SeriesModel<LineSeriesOptions> {
  override type = "line";
}

export class LineSeriesView extends View<LineSeries> {
  override type = "line";
  private readonly _rect: LayoutRect;
  readonly grid: Grid;
  readonly xAxis: Axis;
  readonly yAxis: Axis;

  constructor(model: LineSeries, grid: Grid, xAxis: Axis, yAxis: Axis) {
    super(model);

    this._rect = grid.getRect();
    this.grid = grid;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  override render(): void {
    const { xAxis, yAxis } = this;
    const data = this.getModel().getData();
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
  }

  override getRect(): LayoutRect {
    return this._rect;
  }
}
