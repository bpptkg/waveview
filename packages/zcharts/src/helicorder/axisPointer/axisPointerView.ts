import * as zrender from "zrender";
import { AxisView } from "../../axis/axisView";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import { AxisPointerModel, AxisPointerOptions } from "./axisPointerModel";

export class AxisPointerView extends View<AxisPointerModel> {
  private readonly chart: Helicorder;
  private readonly axis: AxisView;
  private rect: LayoutRect;
  private onPointerMoveBound: (event: zrender.ElementEvent) => void;
  private onPointerLeaveBound: () => void;
  private position: zrender.Point = new zrender.Point();
  private line: zrender.Line;

  constructor(
    axis: AxisView,
    chart: Helicorder,
    options?: Partial<AxisPointerOptions>
  ) {
    const model = new AxisPointerModel(options);
    super(model);
    this.chart = chart;
    this.axis = axis;
    this.rect = axis.getRect();
    this.line = new zrender.Line();
    this.group.add(this.line);

    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerLeaveBound = this.onPointerLeave.bind(this);
  }

  attachEventListeners(): void {
    this.chart.zr.on("mousemove", this.onPointerMoveBound);
    this.chart.zr.on("mouseout", this.onPointerLeaveBound);
  }

  detachEventListeners(): void {
    this.chart.zr.off("mousemove", this.onPointerMoveBound);
    this.chart.zr.off("mouseout", this.onPointerLeaveBound);
  }

  private onPointerMove(event: zrender.ElementEvent): void {
    this.position.x = event.offsetX;
    this.position.y = event.offsetY;
    this.render();
  }

  private onPointerLeave(): void {
    this.line.hide();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.axis.getRect());
  }

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.detachEventListeners();
    this.clear();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { lineColor, lineWidth } = theme.axisPointerStyle;
    this.getModel().mergeOptions({
      lineColor,
      lineWidth,
    });
  }

  render(): void {
    if (!this.visible) {
      return;
    }

    const { lineColor, lineWidth, enable } = this.getModel().getOptions();
    if (!enable) {
      this.line.hide();
      return;
    }

    const { x, y } = this.position;
    if (!this.axis.getRect().contain(x, y)) {
      this.line.hide();
      return;
    }

    const { y: y0, height } = this.axis.getRect();
    this.line.attr({
      shape: {
        x1: x,
        y1: y0,
        x2: x,
        y2: y0 + height,
      },
      style: {
        stroke: lineColor,
        lineWidth,
      },
      z: 10,
      silent: true,
    });

    this.line.show();
  }
}
