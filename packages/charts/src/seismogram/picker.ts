import * as PIXI from "pixi.js";
import { Model } from "../model/model";
import { LayoutRect, ModelOptions } from "../util/types";
import { View } from "../view/view";
import { Seismogram } from "./seismogram";
// @ts-ignore
import { InteractionEvent } from "pixi.js";

export interface PickerOptions extends ModelOptions {
  enable: boolean;
  color: string;
  opacity: number;
  borderWidth: number;
}

export class PickerModel extends Model<PickerOptions> {
  override readonly type = "picker";

  static defaultOptions: PickerOptions = {
    enable: true,
    color: "#9747FF",
    opacity: 0.25,
    borderWidth: 1,
  };

  constructor(options?: Partial<PickerOptions>) {
    super({ ...PickerModel.defaultOptions, ...options });
  }
}

function createArrowPoints(
  x: number,
  y: number,
  size: number,
  head: "left" | "right"
): number[] {
  if (head === "left") {
    return [x, y, x + size, y + size, x + size, y - size];
  } else {
    return [x, y, x - size, y + size, x - size, y - size];
  }
}

export class Picker extends View<PickerModel> {
  readonly chart: Seismogram;
  private _rect: LayoutRect;
  private _isActive: boolean = false;
  private _isDragging: boolean = false;
  private _start: PIXI.Point = new PIXI.Point();
  private _end: PIXI.Point = new PIXI.Point();
  private _clickCount: number = 0;

  constructor(chart: Seismogram, options?: Partial<PickerOptions>) {
    const model = new PickerModel(options);
    super(model);

    this._rect = chart.getGrid().getRect();
    this.chart = chart;
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.on("mousedown", this.handleMouseDown.bind(this));
    this.chart.app.stage.on("mouseup", this.handleMouseUp.bind(this));
    this.chart.app.stage.on("mousemove", this.handleMouseMove.bind(this));
  }

  detachEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.off("mousedown", this.handleMouseDown.bind(this));
    this.chart.app.stage.off("mouseup", this.handleMouseUp.bind(this));
    this.chart.app.stage.off("mousemove", this.handleMouseMove.bind(this));
  }

  enable(): void {
    this._isActive = true;
  }

  disable(): void {
    this._isActive = false;
  }

  reset(): void {
    this._clickCount = 0;
    this._isDragging = false;
    this._start = new PIXI.Point();
    this._end = new PIXI.Point();
    this.clear();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "P" || event.key === "p") {
      this._isActive = !this._isActive;
    }
  }

  handleMouseDown(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._clickCount === 0) {
      this._isDragging = true;
      this._start = event.data.getLocalPosition(this.chart.app.stage);
    } else if (this._clickCount === 1) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      this._clickCount = 0;
      this._isDragging = false;
      this.render();
    }
  }

  handleMouseMove(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      this.render({ drawLabel: true });
    }
  }

  handleMouseUp(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      if (Math.abs(this._end.x - this._start.x) > 0) {
        this._isDragging = false;
        this.render();
      } else {
        this._clickCount++;
      }
    }
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render({ drawLabel = false } = {}): void {
    this.clear();

    const { color, opacity, borderWidth } = this.model.getOptions();

    let x1 = Math.min(this._start.x, this._end.x);
    let x2 = Math.max(this._start.x, this._end.x);
    const length = x2 - x1;

    const { x, y, height, width } = this._rect;
    if (x1 < 1 || x2 > x + width) {
      return;
    }

    const startValue = this.chart.xAxis.getValueForPixel(x1);
    const endValue = this.chart.xAxis.getValueForPixel(x2);
    const duration = (endValue - startValue) / 1000; // in seconds

    const graphics = new PIXI.Graphics();
    graphics
      .rect(x1, y, length, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });
    this.group.addChild(graphics);

    if (drawLabel) {
      const offset = 8;

      const text = new PIXI.Text({
        text: `${duration.toFixed(2)}s`,
        style: {
          fontFamily: "Arial",
          fontSize: 11,
          fill: "#000",
          align: "center",
        },
        x: (x1 + x2) / 2,
        y: y + height + offset * 1.1,
        anchor: { x: 0.5, y: 0 },
      });

      const leftArrow = new PIXI.Graphics();
      leftArrow
        .poly(createArrowPoints(x1, y + height + offset, 5, "left"))
        .fill({
          color: "#000",
        });

      const rightArrow = new PIXI.Graphics();
      rightArrow
        .poly(createArrowPoints(x2, y + height + offset, 5, "right"))
        .fill({
          color: "#000",
        });

      const line = new PIXI.Graphics();
      line
        .moveTo(x1, y + height + offset)
        .lineTo(x2, y + height + offset)
        .stroke({
          color: "#000",
          width: 1,
        });

      if (length > 20) {
        this.group.addChild(text);
        this.group.addChild(leftArrow);
        this.group.addChild(rightArrow);
        this.group.addChild(line);
      }
    }
  }
}
