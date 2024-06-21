import * as PIXI from "pixi.js";
import { Model } from "../model/model";
import { Extension, LayoutRect, ModelOptions } from "../util/types";
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
  private _startValue: number = 0;
  private _endValue: number = 0;

  private readonly _graphics: PIXI.Graphics;
  private readonly _label: PIXI.Text;
  private readonly _leftArrow: PIXI.Graphics;
  private readonly _rightArrow: PIXI.Graphics;
  private readonly _line: PIXI.Graphics;

  constructor(chart: Seismogram, options?: Partial<PickerOptions>) {
    const model = new PickerModel(options);
    super(model);

    this._rect = chart.getGrid().getRect();
    this.chart = chart;
    this.chart.addComponent(this);

    this._graphics = new PIXI.Graphics();
    this._label = new PIXI.Text();
    this._leftArrow = new PIXI.Graphics();
    this._rightArrow = new PIXI.Graphics();
    this._line = new PIXI.Graphics();

    this.group.addChild(this._graphics);
    this.group.addChild(this._label);
    this.group.addChild(this._leftArrow);
    this.group.addChild(this._rightArrow);
    this.group.addChild(this._line);
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.on("pointerdown", this.handlePointerDown.bind(this));
    this.chart.app.stage.on("pointerup", this.handlePointerUp.bind(this));
    this.chart.app.stage.on("pointermove", this.handlePointerMove.bind(this));
  }

  detachEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.off("pointerdown", this.handlePointerDown.bind(this));
    this.chart.app.stage.off("pointerup", this.handlePointerUp.bind(this));
    this.chart.app.stage.off("pointermove", this.handlePointerMove.bind(this));
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
    this._startValue = 0;
    this._endValue = 0;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "P" || event.key === "p") {
      this._isActive = !this._isActive;
    }
  }

  handlePointerDown(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }
    const xAxis = this.chart.getXAxis();

    if (this._clickCount === 0) {
      this._isDragging = true;
      this._start = event.data.getLocalPosition(this.chart.app.stage);
      this._startValue = xAxis.getValueForPixel(this._start.x);
    } else if (this._clickCount === 1) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      this._endValue = xAxis.getValueForPixel(this._end.x);
      this._clickCount = 0;
      this._isDragging = false;
      this.render();
    }
  }

  handlePointerMove(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      this._endValue = this.chart.getXAxis().getValueForPixel(this._end.x);
      this.render({ drawLabel: true });
    }
  }

  handlePointerUp(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.data.getLocalPosition(this.chart.app.stage);
      this._endValue = this.chart.getXAxis().getValueForPixel(this._end.x);
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
    this._graphics.clear();
    this._label.text = "";
    this._leftArrow.clear();
    this._rightArrow.clear();
    this._line.clear();

    const { color, opacity, borderWidth } = this.model.getOptions();

    const xAxis = this.chart.getXAxis();
    const min = Math.min(this._startValue, this._endValue);
    const max = Math.max(this._startValue, this._endValue);
    const duration = (max - min) / 1000; // in seconds

    let x1 = xAxis.getPixelForValue(min);
    let x2 = xAxis.getPixelForValue(max);
    const length = x2 - x1;

    const { x, y, height, width } = this._rect;
    if (x1 < x || x2 > x + width) {
      this.reset();
      return;
    }

    this._graphics
      .rect(x1, y, length, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });

    if (drawLabel) {
      const offset = 8;

      this._label.text = `${duration.toFixed(3)}s`;
      this._label.style = {
        fontFamily: "Arial",
        fontSize: 11,
        fill: "#000",
        align: "center",
      };
      this._label.anchor.set(0.5, 0);
      this._label.position.set((x1 + x2) / 2, y + height + offset * 1.1);

      this._leftArrow
        .poly(createArrowPoints(x1, y + height + offset, 5, "left"))
        .fill({
          color: "#000",
        });

      this._rightArrow
        .poly(createArrowPoints(x2, y + height + offset, 5, "right"))
        .fill({
          color: "#000",
        });

      this._line
        .moveTo(x1, y + height + offset)
        .lineTo(x2, y + height + offset)
        .stroke({
          color: "#000",
          width: 1,
        });

      if (length > this._label.width) {
        this._label.visible = true;
        this._leftArrow.visible = true;
        this._rightArrow.visible = true;
        this._line.visible = true;
      } else {
        this._label.visible = false;
        this._leftArrow.visible = false;
        this._rightArrow.visible = false;
        this._line.visible = false;
      }
    }
  }

  override dispose(): void {
    this.chart.removeComponent(this);
    this.detachEventListeners();
    this._graphics.destroy();
    this._label.destroy();
    this._leftArrow.destroy();
    this._rightArrow.destroy();
    this._line.destroy();
  }
}

export class PickerExtension implements Extension<Seismogram> {
  private options: Partial<PickerOptions>;
  private picker?: Picker;

  constructor(options?: Partial<PickerOptions>) {
    this.options = options || {};
  }

  install(chart: Seismogram): void {
    this.picker = new Picker(chart, this.options);
    this.picker.attachEventListeners();
  }

  uninstall(chart: Seismogram): void {
    if (this.picker) {
      this.picker.detachEventListeners();
      chart.removeComponent(this.picker);
    }
  }

  getInstance(): Picker {
    if (!this.picker) {
      throw new Error("Picker extension not initialized");
    }
    return this.picker;
  }
}
