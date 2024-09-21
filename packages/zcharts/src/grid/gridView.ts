import * as zrender from "zrender";
import { BoundingRect } from "zrender";
import { ChartView } from "../core/chartView";
import { View } from "../core/view";
import { LayoutRect, ThemeStyle } from "../util/types";
import { GridModel, GridOptions } from "./gridModel";

export class GridView extends View<GridModel> {
  override readonly type: string = "grid";
  readonly chart: ChartView;
  private rect: LayoutRect;
  private grid: zrender.Rect;

  constructor(chart: ChartView, options?: Partial<GridOptions>) {
    const model = new GridModel(options);
    super(model);
    this.chart = chart;

    this.rect = this.chart.getRect();

    const { backgroundColor, borderColor, borderWidth } =
      this.model.getOptions();
    this.grid = new zrender.Rect({
      shape: {
        x: this.rect.x,
        y: this.rect.y,
        width: this.rect.width,
        height: this.rect.height,
      },
      style: {
        fill: backgroundColor,
        stroke: borderColor,
        lineWidth: borderWidth,
      },
      silent: true,
    });
    this.group.add(this.grid);
  }

  override getRect(): LayoutRect {
    const { x, y, width, height } = this.rect;
    const { top, right, bottom, left } = this.model.getOptions();
    return new BoundingRect(
      x + left,
      y + top,
      width - left - right,
      height - top - bottom
    );
  }

  override setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  override resize(): void {
    this.setRect(this.chart.getRect());
  }

  override clear(): void {}

  override render(): void {
    if (!this.visible) {
      this.group.hide();
      return;
    }

    const { x, y, width, height } = this.getRect();
    this.grid.attr({
      shape: {
        x,
        y,
        width,
        height,
      },
    });
    this.group.show();
  }

  override dispose(): void {}

  applyThemeStyle(theme: ThemeStyle): void {
    const { gridStyle } = theme;
    this.model.mergeOptions({
      borderColor: gridStyle.lineColor,
      borderWidth: gridStyle.lineWidth,
    });
    this.grid.attr({
      style: {
        stroke: gridStyle.lineColor,
        lineWidth: gridStyle.lineWidth,
      },
    });
  }
}
