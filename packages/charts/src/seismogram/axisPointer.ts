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
  private readonly _line: PIXI.Graphics;
  private readonly _label: PIXI.Text;
  private readonly _background: PIXI.Graphics;

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
    this.chart.addComponent(this);

    this._line = new PIXI.Graphics();
    this._label = new PIXI.Text();
    this._background = new PIXI.Graphics();

    this.group.addChild(this._background);
    this.group.addChild(this._line);
    this.group.addChild(this._label);
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
    this._line.clear();
    this._background.clear();
    this._label.text = "";

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

    this._line
      .moveTo(x, y0)
      .lineTo(x, y0 + height)
      .stroke({
        color: lineColor,
        width: lineWidth,
      });

    const value = this.axis.getValueForPixel(x);
    const padding = 5;
    const isUTC = this.chart.getModel().getOptions().useUTC;
    const template = isUTC
      ? "{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}.{SSS}"
      : "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}";
    const valueFormatted = formatDate(value, template, isUTC);

    this._label.text = valueFormatted;
    this._label.style = {
      fill: textColor,
      fontSize: textFontSize,
    };
    this._label.anchor.set(0.5, 1.1);
    this._label.position.set(x, y0);

    this._background
      .rect(
        x - this._label.width / 2 - padding,
        y0 - this._label.height - padding,
        this._label.width + padding * 2,
        this._label.height + padding
      )
      .fill({
        color: backgroundColor,
        alignment: 0,
      });
  }
}

export class AxisPointerExtension implements Extension<Seismogram> {
  private options: Partial<AxisPointerOptions>;
  private axisPointer?: AxisPointer;

  constructor(options?: Partial<AxisPointerOptions>) {
    this.options = options || {};
  }

  install(chart: Seismogram): void {
    this.axisPointer = new AxisPointer(chart.getXAxis(), chart, this.options);
    this.axisPointer.attachEventListeners();
  }

  uninstall(chart: Seismogram): void {
    if (this.axisPointer) {
      this.axisPointer.detachEventListeners();
      chart.removeComponent(this.axisPointer);
    }
  }

  getInstance(): AxisPointer {
    if (!this.axisPointer) {
      throw new Error("AxisPointer extension is not installed");
    }
    return this.axisPointer;
  }
}
