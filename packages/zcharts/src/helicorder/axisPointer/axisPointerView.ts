import * as zrender from "zrender";
import { AxisView } from "../../axis/axisView";
import { View } from "../../core/view";
import { formatDate } from "../../util/time";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import { AxisPointerModel, AxisPointerOptions } from "./axisPointerModel";

export class AxisPointerView extends View<AxisPointerModel> {
  private readonly chart: Helicorder;
  private readonly axis: AxisView;
  private rect: LayoutRect;
  private onPointerMoveBound: (event: zrender.ElementEvent) => void;
  private onPointerLeaveBound: (event: zrender.ElementEvent) => void;
  private position: zrender.Point = new zrender.Point();
  private verticalLine: zrender.Line;
  private timeLabel: zrender.Text;

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
    this.verticalLine = new zrender.Line();
    this.timeLabel = new zrender.Text();
    this.group.add(this.verticalLine);
    this.group.add(this.timeLabel);

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
    this.position.x = -1;
    this.position.y = -1;
    this.verticalLine.hide();
    this.timeLabel.hide();
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

    const {
      lineColor,
      lineWidth,
      textColor,
      fontSize,
      backgroundColor,
      enable,
    } = this.getModel().getOptions();
    if (!enable) {
      this.verticalLine.hide();
      this.timeLabel.hide();
      return;
    }

    const { x, y } = this.position;
    if (!this.axis.getRect().contain(x, y)) {
      this.verticalLine.hide();
      this.timeLabel.hide();
    } else {
      const { y: y0, height } = this.axis.getRect();
      this.verticalLine.attr({
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

      const padding = 5;
      const trackManager = this.chart.getTrackManager();
      const value = trackManager.getTimeAtPoint(x, y);
      const { useUTC } = this.chart.getModel().getOptions();
      const template = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
      const valueFormatted = formatDate(value, template, useUTC);

      this.timeLabel.attr({
        style: {
          text: valueFormatted,
          fill: textColor,
          fontSize,
          backgroundColor,
          padding: [padding, padding],
          align: "center",
          verticalAlign: "bottom",
        },
        x,
        y: y0,
        silent: true,
      });
      const chartWidth = this.chart.getWidth();
      if (x + this.timeLabel.getBoundingRect().width / 2 > chartWidth) {
        this.timeLabel.attr({
          x: chartWidth - this.timeLabel.getBoundingRect().width / 2,
        });
      }

      this.verticalLine.show();
      this.timeLabel.show();
    }
  }
}
