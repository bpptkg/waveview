import * as PIXI from "pixi.js";
// @ts-ignore
import { InteractionEvent } from "pixi.js";
import { Axis } from "../axis/axis";
import { Model } from "../model/model";
import { formatDate } from "../util/time";
import { Extension, LayoutRect } from "../util/types";
import { View } from "../view/view";
import { Seismogram } from "./seismogram";

export interface AxisPointerOptions {
  enabled: boolean;
  lineColor: string;
  lineWidth: number;
  textColor: string;
  textFontSize: number;
  backgroundColor: string;
}

export class AxisPointerModel extends Model<AxisPointerOptions> {
  override readonly type: string = "axisPointer";

  static defaultOptions: AxisPointerOptions = {
    enabled: true,
    lineColor: "#ff0000",
    lineWidth: 1,
    textColor: "#fff",
    textFontSize: 12,
    backgroundColor: "#ff0000",
  };

  constructor(options?: Partial<AxisPointerOptions>) {
    super({ ...AxisPointerModel.defaultOptions, ...options });
  }
}

export class AxisPointer extends View<AxisPointerModel> {
  readonly chart: Seismogram;
  readonly axis: Axis;
  private _position: PIXI.Point = new PIXI.Point();
  private _rect: LayoutRect;

  constructor(
    axis: Axis,
    chart: Seismogram,
    options?: Partial<AxisPointerOptions>
  ) {
    const model = new AxisPointerModel(options);
    super(model);

    this.chart = chart;
    this.axis = axis;
    this._rect = axis.getRect();
  }

  attachEventListeners(): void {
    this.chart.app.stage.on("pointermove", this.onPointerMove.bind(this));
  }

  detachEventListeners(): void {
    this.chart.app.stage.off("pointermove", this.onPointerMove.bind(this));
  }

  onPointerMove(event: InteractionEvent): void {
    this._position = event.data.getLocalPosition(this.chart.app.stage);
    this.render();
  }

  getPosition(): PIXI.Point {
    return this._position;
  }

  enable(): void {
    this.getModel().mergeOptions({ enabled: true });
  }

  disable(): void {
    this.getModel().mergeOptions({ enabled: false });
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    this.clear();

    const {
      lineColor,
      lineWidth,
      textColor,
      textFontSize,
      backgroundColor,
      enabled,
    } = this.getModel().getOptions();
    if (!enabled) {
      return;
    }

    const { x, y } = this.getPosition();
    const { x: x0, y: y0, height, width } = this.axis.getRect();
    if (x < x0 || x > x0 + width || y < y0 || y > y0 + height) {
      return;
    }

    const line = new PIXI.Graphics();
    line
      .moveTo(x, y0)
      .lineTo(x, y0 + height)
      .stroke({
        color: lineColor,
        width: lineWidth,
      });
    this.group.addChild(line);

    const value = this.axis.getValueForPixel(x);
    const padding = 5;
    const label = new PIXI.Container();
    const isUTC = this.chart.getModel().getOptions().useUTC;
    const template = isUTC
      ? "{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}.{SSS}"
      : "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}";
    const valueFormatted = formatDate(value, template, isUTC);
    const text = new PIXI.Text({
      text: valueFormatted,
      style: {
        fill: textColor,
        fontSize: textFontSize,
        align: "center",
      },
      anchor: { x: 0.5, y: 1.1 },
      x: x,
      y: y0,
    });
    const background = new PIXI.Graphics();
    background
      .rect(
        x - text.width / 2 - padding,
        y0 - text.height - padding,
        text.width + padding * 2,
        text.height + padding
      )
      .fill({
        color: backgroundColor,
        alignment: 0,
      });
    label.addChild(background);
    label.addChild(text);

    this.group.addChild(label);
  }
}

export class AxisPointerExtension implements Extension<Seismogram> {
  private options: Partial<AxisPointerOptions>;
  private axisPointer!: AxisPointer;

  constructor(options?: Partial<AxisPointerOptions>) {
    this.options = options || {};
  }

  install(chart: Seismogram): void {
    this.axisPointer = new AxisPointer(chart.getXAxis(), chart, this.options);
    this.axisPointer.attachEventListeners();
  }

  uninstall(): void {
    this.axisPointer.detachEventListeners();
  }

  getInstance(): AxisPointer {
    if (!this.axisPointer) {
      throw new Error("AxisPointer is not initialized");
    }
    return this.axisPointer;
  }
}
