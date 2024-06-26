import * as PIXI from "pixi.js";
import { FederatedPointerEvent } from "pixi.js";
import { Model } from "../model/model";
import { Extension, LayoutRect, ModelOptions } from "../util/types";
import { View } from "../view/view";
import { Seismogram } from "./seismogram";

export interface PickerOptions extends ModelOptions {
  enable: boolean;
}

export class PickerModel extends Model<PickerOptions> {
  override readonly type = "picker";

  static defaultOptions: PickerOptions = {
    enable: true,
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

  private handlePointerDownBound: (event: FederatedPointerEvent) => void;
  private handlePointerMoveBound: (event: FederatedPointerEvent) => void;
  private handlePointerUpBound: (event: FederatedPointerEvent) => void;

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

    this.handlePointerDownBound = this.handlePointerDown.bind(this);
    this.handlePointerMoveBound = this.handlePointerMove.bind(this);
    this.handlePointerUpBound = this.handlePointerUp.bind(this);
  }

  attachEventListeners(): void {
    this.chart.app.stage.on("pointerdown", this.handlePointerDownBound);
    this.chart.app.stage.on("pointerup", this.handlePointerUpBound);
    this.chart.app.stage.on("pointermove", this.handlePointerMoveBound);
  }

  detachEventListeners(): void {
    this.chart.app.stage.off("pointerdown", this.handlePointerDownBound);
    this.chart.app.stage.off("pointerup", this.handlePointerUpBound);
    this.chart.app.stage.off("pointermove", this.handlePointerMoveBound);
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  isActive(): boolean {
    return this._isActive;
  }

  private handlePointerDown(event: FederatedPointerEvent): void {
    if (!this._isActive) {
      return;
    }
    const xAxis = this.chart.getXAxis();

    if (this._clickCount === 0) {
      this._isDragging = true;
      this._start = event.global.clone();
      this._startValue = xAxis.getValueForPixel(this._start.x);
    } else if (this._clickCount === 1) {
      this._end = event.global.clone();
      this._endValue = xAxis.getValueForPixel(this._end.x);
      this._clickCount = 0;
      this._isDragging = false;
      this.render();
    }
  }

  private handlePointerMove(event: FederatedPointerEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.global.clone();
      this._endValue = this.chart.getXAxis().getValueForPixel(this._end.x);
      this.render();
    }
  }

  private handlePointerUp(event: FederatedPointerEvent): void {
    if (!this._isActive) {
      return;
    }

    if (this._isDragging) {
      this._end = event.global.clone();
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

  override render({ drawLabel = true } = {}): void {
    this._graphics.clear();
    this._label.text = "";
    this._leftArrow.clear();
    this._rightArrow.clear();
    this._line.clear();

    if (!this._isActive) {
      return;
    }

    // Check if the pick hasn't finished but the chart view has changed. So we
    // need to update the end value basen on the current pointer position.
    if (this._clickCount !== 2) {
      this._endValue = this.chart.getXAxis().getValueForPixel(this._end.x);
    }

    const start = this._startValue;
    const end = this._endValue;

    const theme = this.chart.getTheme();
    const { textColor, fontSize, fontFamily, foregroundColor } = theme;
    const { color, opacity, borderWidth } = theme.highlightStyle;

    const xAxis = this.chart.getXAxis();
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const duration = (max - min) / 1000; // in seconds

    let x1 = xAxis.getPixelForValue(min);
    let x2 = xAxis.getPixelForValue(max);

    const { x, y, height, width } = this.chart.getGrid().getRect();
    x1 = Math.max(x1, x);
    x2 = Math.min(x2, x + width);
    const length = x2 - x1;

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
        fontFamily,
        fontSize,
        fill: textColor,
        align: "center",
      };
      this._label.anchor.set(0.5, 1);
      this._label.position.set((x1 + x2) / 2, y + height - offset * 1.1);

      this._leftArrow
        .poly(createArrowPoints(x1, y + height - offset, 5, "left"))
        .fill({
          color: foregroundColor,
        });

      this._rightArrow
        .poly(createArrowPoints(x2, y + height - offset, 5, "right"))
        .fill({
          color: foregroundColor,
        });

      this._line
        .moveTo(x1, y + height - offset)
        .lineTo(x2, y + height - offset)
        .stroke({
          color: foregroundColor,
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

  activate(): void {
    this.picker?.activate();
  }

  deactivate(): void {
    this.picker?.deactivate();
  }

  isActive(): boolean {
    return this.picker?.isActive() || false;
  }
}
