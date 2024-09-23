import * as zrender from "zrender";
import { EventEmitter } from "../core/eventEmitter";
import { View } from "../core/view";
import { Seismogram } from "../seismogram/seismogram";
import { LayoutRect, ThemeStyle } from "../util/types";
import { PickerEventMap } from "./eventMap";
import { PickerModel, PickerOptions } from "./pickerModel";

export class PickerView extends View<PickerModel> {
  readonly chart: Seismogram;
  private isDragging = false;
  private rect: zrender.BoundingRect;
  private activeHandle: "left" | "right" | null = null;
  private operationMode: "select" | "move" | "resize" = "select";
  private graphics: zrender.Rect;
  private leftHandle: zrender.Rect;
  private rightHandle: zrender.Rect;
  private pos: zrender.Point = new zrender.Point();
  private eventEmitter = new EventEmitter<PickerEventMap>();

  constructor(chart: Seismogram, options?: Partial<PickerOptions>) {
    const model = new PickerModel(options);
    super(model);
    this.chart = chart;
    this.rect = chart.getXAxis().getRect();

    this.graphics = new zrender.Rect();
    this.graphics.on("mousedown", (e: zrender.ElementEvent) => {
      this.operationMode = "move";
      this.isDragging = true;
      this.activeHandle = null;
      this.pos.set(e.offsetX, e.offsetY);
    });

    this.leftHandle = new zrender.Rect();
    this.leftHandle.cursor = "ew-resize";
    this.leftHandle.on("mousedown", () => {
      this.activeHandle = "left";
      this.operationMode = "resize";
      this.isDragging = true;
    });

    this.rightHandle = new zrender.Rect({});
    this.rightHandle.on("mousedown", () => {
      this.activeHandle = "right";
      this.operationMode = "resize";
      this.isDragging = true;
    });

    this.group.add(this.graphics);
    this.group.add(this.leftHandle);
    this.group.add(this.rightHandle);

    this.chart.zr.on("mousedown", this.onMouseDown, this);
    this.chart.zr.on("mousemove", this.onMouseMove, this);
    this.chart.zr.on("mouseup", this.onMouseUp, this);
    this.applyThemeStyle(this.chart.getThemeStyle());
  }

  private isOutOfBounds(e: zrender.ElementEvent): boolean {
    const { offsetX, offsetY } = e;
    const rect = this.chart.getGrid().getRect();
    return !rect.contain(offsetX, offsetY);
  }

  private onMouseDown(e: zrender.ElementEvent): void {
    if (!this.model.isEnabled()) {
      return;
    }
    if (this.isOutOfBounds(e)) {
      return;
    }
    if (this.model.isEmpty()) {
      this.operationMode = "select";
      const xAxis = this.chart.getXAxis();

      this.isDragging = true;
      const start = xAxis.getValueForPixel(e.offsetX);
      this.model.setStart(start);
      this.render();
    }
  }

  private onMouseMove(e: zrender.ElementEvent): void {
    if (!this.isDragging) {
      return;
    }
    if (this.operationMode === "select") {
      const offsetX = e.offsetX;
      const xAxis = this.chart.getXAxis();
      const end = xAxis.getValueForPixel(offsetX);
      this.model.setEnd(end);
      this.render();
    } else if (this.operationMode === "resize") {
      const offsetX = e.offsetX;
      const xAxis = this.chart.getXAxis();
      const value = xAxis.getValueForPixel(offsetX);
      if (this.activeHandle === "left") {
        this.model.setStart(value);
      } else if (this.activeHandle === "right") {
        this.model.setEnd(value);
      }
      this.render();
    } else if (this.operationMode === "move") {
      const { offsetX, offsetY } = e;
      const xAxis = this.chart.getXAxis();
      const [start, end] = this.model.getRange();
      const prevPos = xAxis.getValueForPixel(this.pos.x);
      const currentPos = xAxis.getValueForPixel(offsetX);
      const delta = currentPos - prevPos;
      this.model.setStart(start + delta);
      this.model.setEnd(end + delta);
      this.render();
      this.pos.set(offsetX, offsetY);
    }
  }

  private onMouseUp(_: zrender.ElementEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
    this.render();
    this.updateHandles();
    const [start, end] = this.model.getRange();
    // Emit change event if the range has changed (more than 1s)
    if (Math.abs(end - start) > 1e3) {
      this.eventEmitter.emit("change", this.model.getRange());
    }
  }

  enable(): void {
    this.model.enable();
  }

  disable(): void {
    this.model.disable();
  }

  isEnabled(): boolean {
    return this.model.isEnabled();
  }

  setRange(range: [number, number]): void {
    this.model.setRange(range);
  }

  clearRange(): void {
    this.model.clearRange();
  }

  getRect(): zrender.BoundingRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.chart.getXAxis().getRect());
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { pickerStyle } = theme;
    this.graphics.attr({
      style: {
        fill: pickerStyle.color,
        opacity: pickerStyle.opacity,
        stroke: pickerStyle.color,
        lineWidth: pickerStyle.borderWidth,
      },
    });
  }

  clear(): void {
    this.graphics.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
    this.leftHandle.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
    this.rightHandle.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
    this.getModel().clearRange();
  }

  dispose(): void {
    this.chart.zr.off("mousedown", this.onMouseDown);
    this.chart.zr.off("mousemove", this.onMouseMove);
    this.chart.zr.off("mouseup", this.onMouseUp);
  }

  render(): void {
    if (!this.visible) {
      this.group.hide();
      return;
    }
    if (this.model.isEmpty()) {
      this.clearGraphics();
      return;
    }
    const [start, end] = this.model.getRange();
    const xAxis = this.chart.getXAxis();
    const x1 = xAxis.getPixelForValue(start);
    const x2 = xAxis.getPixelForValue(end);
    const y = this.rect.y;
    const width = x2 - x1;
    const height = this.rect.height;
    this.graphics.attr({
      shape: {
        x: x1,
        y,
        width,
        height,
      },
      cursor: "move",
    });

    this.updateHandles();
    this.group.show();
  }

  private clearGraphics(): void {
    this.graphics.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
    this.leftHandle.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
    this.rightHandle.attr({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    });
  }

  private updateHandles(): void {
    const { x, y, width, height } = this.graphics.shape;
    const handleWidth = 10;

    this.leftHandle.attr({
      shape: {
        x: x - handleWidth / 2,
        y,
        width: handleWidth,
        height: height,
      },
      style: {
        fill: "transparent",
      },
      cursor: "ew-resize",
      silent: false,
    });

    this.rightHandle.attr({
      shape: {
        x: x + width - handleWidth / 2,
        y,
        width: handleWidth,
        height: height,
      },
      style: {
        fill: "transparent",
      },
      cursor: "ew-resize",
      silent: false,
    });
  }

  on<K extends keyof PickerEventMap>(
    event: K,
    listener: PickerEventMap[K]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof PickerEventMap>(
    event: K,
    listener: PickerEventMap[K]
  ): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof PickerEventMap>(
    event: K,
    ...args: Parameters<PickerEventMap[K]>
  ): void {
    this.eventEmitter.emit(event, ...args);
  }
}
