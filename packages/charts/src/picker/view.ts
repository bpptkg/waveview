import * as PIXI from "pixi.js";
import { FederatedPointerEvent } from "pixi.js";
import { Seismogram } from "../seismogram/seismogram";
import { EventMap, LayoutRect, ThemeStyle } from "../util/types";
import { View } from "../view/view";
import { PickerModel, PickerOptions } from "./model";
import { createArrowPoints } from "./util";

export interface PickerEventMap extends EventMap {
  change: (range: [number, number]) => void;
}

export class Picker extends View<PickerModel> {
  readonly chart: Seismogram;
  private _rect: LayoutRect;

  private _isDragging: boolean = false;
  private _clickCount: number = 0;
  private _activeHandle: "left" | "right" | null = null;
  private _operationMode: "select" | "move" | "resize" = "select";
  private _pos: PIXI.Point = new PIXI.Point();

  private readonly _graphics: PIXI.Graphics;
  private readonly _label: PIXI.Text;
  private readonly _leftArrow: PIXI.Graphics;
  private readonly _rightArrow: PIXI.Graphics;
  private readonly _line: PIXI.Graphics;
  private readonly _leftHandle: PIXI.Graphics;
  private readonly _rightHandle: PIXI.Graphics;

  private _handlePointerDownBound: (event: FederatedPointerEvent) => void;
  private _handlePointerMoveBound: (event: FederatedPointerEvent) => void;
  private _handlePointerUpBound: (event: FederatedPointerEvent) => void;
  private _onLeftHandleClickBound: (event: FederatedPointerEvent) => void;
  private _onRightHandleClickBound: (event: FederatedPointerEvent) => void;
  private _onSelectionClickBound: (event: FederatedPointerEvent) => void;
  private _handleExtentChangeBound: () => void;

  constructor(chart: Seismogram, options?: Partial<PickerOptions>) {
    const model = new PickerModel(options);
    super(model);

    this._rect = chart.getGrid().getRect();
    this.chart = chart;
    this.chart.addComponent(this);

    this.group.interactive = true;
    this._graphics = new PIXI.Graphics();
    this._graphics.interactive = true;
    this._graphics.eventMode = "static";

    this._label = new PIXI.Text();
    this._leftArrow = new PIXI.Graphics();
    this._rightArrow = new PIXI.Graphics();
    this._line = new PIXI.Graphics();

    this._leftHandle = new PIXI.Graphics();
    this._leftHandle.eventMode = "static";
    this._rightHandle = new PIXI.Graphics();
    this._rightHandle.eventMode = "static";

    this.group.addChild(this._graphics);
    this.group.addChild(this._label);
    this.group.addChild(this._leftArrow);
    this.group.addChild(this._rightArrow);
    this.group.addChild(this._line);
    this.group.addChild(this._leftHandle);
    this.group.addChild(this._rightHandle);

    this._handlePointerDownBound = this._handlePointerDown.bind(this);
    this._handlePointerMoveBound = this._handlePointerMove.bind(this);
    this._handlePointerUpBound = this._handlePointerUp.bind(this);
    this._onLeftHandleClickBound = this._onLeftHandleClick.bind(this);
    this._onRightHandleClickBound = this._onRightHandleClick.bind(this);
    this._onSelectionClickBound = this._handleSelectionClick.bind(this);
    this._handleExtentChangeBound = this._handleExtentChange.bind(this);
  }

  show(): void {
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  focus(): void {}

  blur(): void {}

  applyThemeStyle(theme: ThemeStyle): void {
    const { highlightStyle } = theme;
    this.model.mergeOptions({
      color: highlightStyle.color,
      opacity: highlightStyle.opacity,
      borderWidth: highlightStyle.borderWidth,
    });
  }

  setRange(range: [number, number]): void {
    this.model.setRange(range);
  }

  getRange(): [number, number] {
    return this.model.getRange();
  }

  clearRange(): void {
    this.model.clearRange();
    this.clear();
    this._graphics.interactive = false;
    this._leftHandle.interactive = false;
    this._rightHandle.interactive = false;
  }

  attachEventListeners(): void {
    this.chart.app.stage.on("pointerdown", this._handlePointerDownBound);
    this.chart.app.stage.on("pointerup", this._handlePointerUpBound);
    this.chart.app.stage.on("pointermove", this._handlePointerMoveBound);
    this._leftHandle.on("pointerdown", this._onLeftHandleClickBound);
    this._rightHandle.on("pointerdown", this._onRightHandleClickBound);
    this._graphics.on("pointerdown", this._onSelectionClickBound);
    this.chart.on("extentChanged", this._handleExtentChangeBound);
  }

  detachEventListeners(): void {
    this.chart.app.stage.off("pointerdown", this._handlePointerDownBound);
    this.chart.app.stage.off("pointerup", this._handlePointerUpBound);
    this.chart.app.stage.off("pointermove", this._handlePointerMoveBound);
    this._leftHandle.off("pointerdown", this._onLeftHandleClickBound);
    this._rightHandle.off("pointerdown", this._onRightHandleClickBound);
    this._graphics.off("pointerdown", this._onSelectionClickBound);
    this.chart.off("extentChanged", this._handleExtentChangeBound);
  }

  private _isOutsideBounds(x: number, y: number): boolean {
    const rect = this.chart.getGrid().getRect();
    return !rect.contains(x, y);
  }

  private _handleExtentChange(): void {
    this._updateHandleHitArea();
  }

  private _handleSelectionClick(event: FederatedPointerEvent): void {
    const { enable } = this.model.options;
    if (!enable) {
      return;
    }

    this._operationMode = "move";
    this._isDragging = true;
    this._pos = event.global.clone();
  }

  private _onLeftHandleClick(): void {
    const { enable } = this.model.options;
    if (!enable) {
      return;
    }

    this._operationMode = "resize";
    this._activeHandle = "left";
    this._isDragging = true;
  }

  private _onRightHandleClick(): void {
    const { enable } = this.model.options;
    if (!enable) {
      return;
    }

    this._operationMode = "resize";
    this._activeHandle = "right";
    this._isDragging = true;
  }

  private _handlePointerDown(event: FederatedPointerEvent): void {
    const { enable } = this.model.options;
    if (!enable) {
      return;
    }

    const { x, y } = event.global.clone();
    if (this._isOutsideBounds(x, y)) {
      return;
    }

    if (this.model.isEmpty()) {
      this._operationMode = "select";
      this._handleSelectDown(event);
    }
  }

  private _handleSelectDown(event: FederatedPointerEvent): void {
    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();

    this._isDragging = true;
    const start = xAxis.getValueForPixel(x);
    this.model.setStart(start);
    this.render();
  }

  private _handlePointerMove(event: FederatedPointerEvent): void {
    const { enable } = this.model.options;
    if (!enable || !this._isDragging) {
      return;
    }

    switch (this._operationMode) {
      case "select":
        this._handleSelectMove(event);
        break;
      case "resize":
        this._handleResizeMove(event);
        break;
      case "move":
        this._handlePickMove(event);
        break;
      default:
        break;
    }
  }

  private _handleSelectMove(event: FederatedPointerEvent): void {
    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();
    const { start } = this.model.options;
    const end = xAxis.getValueForPixel(x);
    if (Math.abs(end - start) > 0) {
      this.model.setEnd(end);
      this.render();
    }
  }

  private _handleResizeMove(event: FederatedPointerEvent): void {
    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();

    if (this._activeHandle === "left") {
      const start = xAxis.getValueForPixel(x);
      this.model.setStart(start);
      this._leftHandle.cursor = "col-resize";
    } else if (this._activeHandle === "right") {
      const end = xAxis.getValueForPixel(x);
      this.model.setEnd(end);
      this._rightHandle.cursor = "col-resize";
    }
    this._updateHandleHitArea();
    this.render();
  }

  private _handlePickMove(event: FederatedPointerEvent): void {
    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();
    const { start, end } = this.model.options;

    const prevPos = xAxis.getValueForPixel(this._pos.x);
    const currentPos = xAxis.getValueForPixel(x);
    const delta = currentPos - prevPos;

    this.model.setStart(start + delta);
    this.model.setEnd(end + delta);
    this._updateHandleHitArea();
    this.render();

    this._pos = event.global.clone();
  }

  private _handlePointerUp(event: FederatedPointerEvent): void {
    const { enable } = this.model.options;
    if (!enable) {
      return;
    }

    switch (this._operationMode) {
      case "select":
        this._handleSelectUp(event);
        break;
      case "resize":
        this._handleResizeUp(event);
        break;
      case "move":
        this._handlePickUp(event);
        break;
      default:
        break;
    }
  }

  private _handleSelectUp(event: FederatedPointerEvent): void {
    if (!this._isDragging) {
      return;
    }

    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();
    const { start } = this.model.options;
    const end = xAxis.getValueForPixel(x);
    if (Math.abs(end - start) > 0) {
      this.model.setEnd(end);
      this.render();
      this.emit("change", this.model.getRange());
      this._updateHandleHitArea();
      this._isDragging = false;
    } else {
      this._clickCount++;
    }
  }

  private _handleResizeUp(event: FederatedPointerEvent): void {
    const { x } = event.global.clone();
    const xAxis = this.chart.getXAxis();

    if (this._activeHandle === "left") {
      const start = xAxis.getValueForPixel(x);
      this.model.setStart(start);
    } else if (this._activeHandle === "right") {
      const end = xAxis.getValueForPixel(x);
      this.model.setEnd(end);
    }
    this.emit("change", this.model.getRange());
    this._activeHandle = null;
    this._updateHandleHitArea();
  }

  private _handlePickUp(event: FederatedPointerEvent): void {
    if (!this._isDragging) {
      return;
    }

    this.emit("change", this.model.getRange());
    this._isDragging = false;
    this._pos = event.global.clone();
    this._updateHandleHitArea();
  }

  private _updateHandleHitArea(): void {
    const xAxis = this.chart.getXAxis();

    const rect = this.chart.getGrid().getRect();
    const { start, end } = this.model.options;
    const left = xAxis.getPixelForValue(start);
    const right = xAxis.getPixelForValue(end);
    const handleWidth = 10;
    const leftHandleRect = new PIXI.Rectangle(
      left - handleWidth / 2,
      rect.y,
      handleWidth,
      rect.height
    );
    const rightHandleRect = new PIXI.Rectangle(
      right - handleWidth / 2,
      rect.y,
      handleWidth,
      rect.height
    );

    this._leftHandle.hitArea = leftHandleRect;
    this._leftHandle.cursor = "col-resize";

    this._rightHandle.hitArea = rightHandleRect;
    this._rightHandle.cursor = "col-resize";

    this._graphics.hitArea = new PIXI.Rectangle(
      left,
      rect.y,
      right - left,
      rect.height
    );
    this._graphics.cursor = "move";
    this._leftHandle.interactive = true;
    this._rightHandle.interactive = true;
    this._graphics.interactive = true;
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  clear(): void {
    this._graphics.clear();
    this._label.text = "";
    this._leftArrow.clear();
    this._rightArrow.clear();
    this._line.clear();
    this._leftHandle.clear();
    this._rightHandle.clear();
  }

  resize(): void {
    const rect = this.chart.getGrid().getRect();
    this.setRect(rect);
  }

  override render(): void {
    this.clear();

    if (this.model.isEmpty()) {
      return;
    }

    const { start, end, enable, precision } = this.model.options;
    if (!enable) {
      return;
    }

    const theme = this.chart.getTheme();
    const { textColor, fontSize, fontFamily, foregroundColor } = theme;
    const { color, opacity, borderWidth } = theme.highlightStyle;

    const xAxis = this.chart.getXAxis();
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const duration = (max - min) / 1000; // in seconds

    let cx1 = xAxis.getPixelForValue(min);
    let cx2 = xAxis.getPixelForValue(max);

    const { x, y, height, width } = this.chart.getGrid().getRect();
    const x1 = Math.max(cx1, x);
    const x2 = Math.min(cx2, x + width);
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

    const handleWidth = 10;
    this._leftHandle.rect(x1 - handleWidth / 2, y, handleWidth, height).stroke({
      color: "transparent",
    });

    this._rightHandle
      .rect(x2 - handleWidth / 2, y, handleWidth, height)
      .stroke({
        color: "transparent",
      });

    const offset = 8;

    this._label.text = `${duration.toFixed(precision)}s`;
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

  override dispose(): void {
    this.chart.removeComponent(this);
    this.detachEventListeners();

    this._graphics.destroy();
    this._label.destroy();
    this._leftArrow.destroy();
    this._rightArrow.destroy();
    this._line.destroy();
    this._leftHandle.destroy();
    this._rightHandle.destroy();
    this.group.destroy();
  }
}
