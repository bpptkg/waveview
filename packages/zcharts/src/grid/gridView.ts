import * as zrender from "zrender";
import { BoundingRect } from "zrender";
import { ChartView } from "../core/chartView";
import { View } from "../core/view";
import { LayoutRect, ThemeStyle } from "../util/types";
import { GridModel, GridOptions } from "./gridModel";

export class GridView extends View<GridModel> {
  readonly type = "grid";
  readonly chart: ChartView;
  private rect: LayoutRect;

  constructor(chart: ChartView, options?: Partial<GridOptions>) {
    const model = new GridModel(options);
    super(model);
    this.chart = chart;

    this.rect = this.chart.getRect();
  }

  override getRect(): LayoutRect {
    const { x, y, width, height } = this.chart.getRect();
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
    this.rect = this.chart.getRect();
  }

  override clear(): void {
    this.group.removeAll();
  }

  override render(): void {
    this.clear();

    const { show, backgroundColor, borderColor, borderWidth } =
      this.model.getOptions();
    if (!show) {
      return;
    }

    const { x, y, width, height } = this.getRect();

    const rect = new zrender.Rect({
      shape: {
        x,
        y,
        width,
        height,
      },
      style: {
        fill: backgroundColor,
        stroke: borderColor,
        lineWidth: borderWidth,
      },
    });
    rect.silent = true;
    this.group.add(rect);
  }

  override dispose(): void {
    this.clear();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { gridStyle } = theme;
    this.model.mergeOptions({
      borderColor: gridStyle.lineColor,
      borderWidth: gridStyle.lineWidth,
    });
  }
}
