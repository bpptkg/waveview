import * as zrender from "zrender";
import { AxisView } from "../axis/axisView";
import { Model } from "../core/model";
import { View } from "../core/view";
import { formatDate } from "../util/time";
import { LayoutRect, ThemeStyle } from "../util/types";
import { Seismogram } from "./seismogram";

export interface AxisPointerOptions {
  enable: boolean;
  lineColor: string;
  lineWidth: number;
  textColor: string;
  fontSize: number;
  backgroundColor: string;
}

export class AxisPointerModel extends Model<AxisPointerOptions> {
  static readonly defaultOptions: AxisPointerOptions = {
    enable: true,
    lineColor: "#ff0000",
    lineWidth: 1,
    textColor: "#fff",
    fontSize: 12,
    backgroundColor: "#ff0000",
  };

  constructor(options?: Partial<AxisPointerOptions>) {
    super({ ...AxisPointerModel.defaultOptions, ...options });
  }
}

export class AxisPointer extends View<AxisPointerModel> {
  private readonly chart: Seismogram;
  private readonly axis: AxisView;
  private rect: LayoutRect;
  private onPointerMoveBound: (event: zrender.ElementEvent) => void;
  private position: zrender.Point = new zrender.Point();

  constructor(
    axis: AxisView,
    chart: Seismogram,
    options?: Partial<AxisPointerOptions>
  ) {
    const model = new AxisPointerModel(options);
    super(model);
    this.chart = chart;
    this.axis = axis;
    this.rect = axis.getRect();

    this.onPointerMoveBound = this.onPointerMove.bind(this);
  }

  attachEventListeners(): void {
    this.chart.zr.on("mousemove", this.onPointerMoveBound);
  }

  detachEventListeners(): void {
    this.chart.zr.off("mousemove", this.onPointerMoveBound);
  }

  private onPointerMove(event: zrender.ElementEvent): void {
    this.position.x = event.offsetX;
    this.position.y = event.offsetY;
    this.render();
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
    const { lineColor, lineWidth, textColor, fontSize, backgroundColor } =
      theme.axisPointerStyle;
    this.getModel().mergeOptions({
      lineColor,
      lineWidth,
      textColor,
      fontSize,
      backgroundColor,
    });
  }

  render(): void {
    this.clear();

    const {
      lineColor,
      lineWidth,
      textColor,
      fontSize,
      backgroundColor,
      enable,
    } = this.getModel().getOptions();
    if (!enable) {
      return;
    }

    const { x, y } = this.position;
    if (!this.axis.getRect().contain(x, y)) {
      return;
    }

    const { y: y0, height } = this.axis.getRect();
    const line = new zrender.Line({
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
    });
    line.silent = true;

    const value = this.axis.getValueForPixel(x);
    const padding = 5;
    const { useUTC } = this.chart.getModel().getOptions();
    const template = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}";
    const valueFormatted = formatDate(value, template, useUTC);

    const label = new zrender.Text({
      style: {
        text: valueFormatted,
        fill: textColor,
        fontSize,
        backgroundColor,
        padding: [padding, padding],
        align: "center",
      },
      x,
      y: y0,
      anchorY: 20,
    });
    label.silent = true;

    this.group.add(line);
    this.group.add(label);
  }
}
