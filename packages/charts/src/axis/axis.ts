import * as PIXI from "pixi.js";
import { AreaMarker, AreaMarkerOptions } from "../marker/area";
import { LineMarker, LineMarkerOptions } from "../marker/line";
import { drawDash } from "../util/dashline";
import { EventMap, LayoutRect, ScaleTick, ThemeStyle } from "../util/types";
import { View } from "../view/view";
import { AxisModel, AxisOptions } from "./axisModel";

export interface TickPixel {
  pixel: number;
  tick: ScaleTick;
}

export type MarkerView = LineMarker | AreaMarker;

export interface AxisEventMap extends EventMap {
  extentChanged: (extent: [number, number]) => void;
}

export class Axis extends View<AxisModel> {
  override readonly type = "axis";
  private _rect: LayoutRect;
  private _markers: MarkerView[] = [];
  private readonly _axisLine: PIXI.Graphics;
  private readonly _majorTicks: PIXI.Graphics;
  private readonly _minorTicks: PIXI.Graphics;
  private readonly _splitLine: PIXI.Graphics;
  private readonly _labels: PIXI.Text[] = [];

  constructor(rect: LayoutRect, options?: Partial<AxisOptions>) {
    const model = new AxisModel(options);
    super(model);

    this._rect = rect;
    this._axisLine = new PIXI.Graphics();
    this._majorTicks = new PIXI.Graphics();
    this._minorTicks = new PIXI.Graphics();
    this._splitLine = new PIXI.Graphics();
    this.group.addChild(this._axisLine);
    this.group.addChild(this._majorTicks);
    this.group.addChild(this._minorTicks);
    this.group.addChild(this._splitLine);
  }

  applyThemeStyle(style: ThemeStyle): void {
    const { axisStyle, textColor, fontSize, fontFamily } = style;
    this.model.mergeOptions({
      axisTick: {
        color: axisStyle.axisTickColor,
      },
      minorTick: {
        color: axisStyle.axisTickColor,
      },
      axisLine: {
        color: axisStyle.axisLineColor,
      },
      axisLabel: {
        color: textColor,
        fontSize,
        fontFamily,
      },
      splitLine: {
        color: axisStyle.splitLineColor,
      },
    });
  }

  setExtent(extent: [number, number]) {
    this.model.scale.setExtent(extent);
    this.emit("extentChanged", extent);
  }

  getExtent(): [number, number] {
    return this.model.scale.getExtent();
  }

  isHorizontal() {
    const options = this.model.getOptions();
    return options.position === "top" || options.position === "bottom";
  }

  isVertical() {
    return !this.isHorizontal();
  }

  isAxisPositionEqualTo(pos: AxisOptions["position"]) {
    const options = this.model.getOptions();
    return options.position === pos;
  }

  getOrigin(): [number, number] {
    const { position } = this.model.getOptions();
    const { x, y, width, height } = this.getRect();
    if (position === "top") {
      return [x, y];
    } else if (position === "right") {
      return [x + width, y];
    } else if (position === "bottom") {
      return [x, y + height];
    } else {
      return [x, y];
    }
  }

  getTicksPixels(): TickPixel[] {
    const { scale } = this.model;
    const { x, y, width, height } = this.getRect();
    const range = this.isHorizontal() ? width : height;
    const ticks = scale.getTicks();

    const ticksPixels = [];
    for (const tick of ticks) {
      const percent = scale.valueToPercentage(tick.value);
      let pixel;
      if (this.isHorizontal()) {
        pixel = x + range * percent;
      } else {
        pixel = y + range * percent;
      }
      ticksPixels.push({ pixel, tick });
    }

    return ticksPixels;
  }

  getMinorTicksPixels(): TickPixel[] {
    const { scale } = this.model;
    const { x, y, width, height } = this.getRect();
    const { splitNumber } = this.model.options.minorTick;
    const range = this.isHorizontal() ? width : height;
    const ticks = scale.getMinorTicks(splitNumber);

    const ticksPixels = [];
    for (const tick of ticks) {
      const percent = scale.valueToPercentage(tick.value);
      let pixel;
      if (this.isHorizontal()) {
        pixel = x + range * percent;
      } else {
        pixel = y + range * percent;
      }
      ticksPixels.push({ pixel, tick });
    }

    return ticksPixels;
  }

  getPixelForValue(value: number): number {
    const { x, y, width, height } = this.getRect();
    const { scale } = this.model;
    const percent = scale.valueToPercentage(value);
    if (this.isHorizontal()) {
      return x + width * percent;
    } else {
      return y + height * percent;
    }
  }

  getValueForPixel(pixel: number): number {
    const { x, y, width, height } = this.getRect();
    const { scale } = this.model;
    const percent = this.isHorizontal()
      ? (pixel - x) / width
      : (pixel - y) / height;
    return scale.percentageToValue(percent);
  }

  scrollLeft(by: number): void {
    const [min, max] = this.getExtent();
    const range = max - min;
    const newMin = min - range * by;
    const newMax = max - range * by;
    this.setExtent([newMin, newMax]);
  }

  scrollRight(by: number): void {
    this.scrollLeft(-by);
  }

  scrollTo(value: number): void {
    const [min, max] = this.getExtent();
    const offset = (max - min) / 2;
    const newMin = value - offset;
    const newMax = value + offset;
    this.setExtent([newMin, newMax]);
  }

  zoomIn(center: number, factor: number): void {
    const [min, max] = this.getExtent();
    const newMin = center - (center - min) * (1 - factor);
    const newMax = center + (max - center) * (1 - factor);
    this.setExtent([newMin, newMax]);
  }

  zoomOut(center: number, factor: number): void {
    this.zoomIn(center, -factor);
  }

  contains(value: number): boolean {
    return this.model.getScale().contains(value);
  }

  addLineMarker(
    value: number,
    options: Partial<LineMarkerOptions>
  ): LineMarker {
    const marker = new LineMarker(this, {
      value,
      ...options,
    });
    this._markers.push(marker);
    return marker;
  }

  removeLineMarker(value: number): void {
    const index = this._markers.findIndex(
      (marker) =>
        marker.type === "lineMarker" &&
        (marker as LineMarker).getValue() === value
    );
    if (index >= 0) {
      this._markers.splice(index, 1);
    }
  }

  addAreaMarker(
    start: number,
    end: number,
    options: Partial<AreaMarkerOptions>
  ): AreaMarker {
    const marker = new AreaMarker(this, {
      start,
      end,
      ...options,
    });
    this._markers.push(marker);
    return marker;
  }

  removeAreaMarker(start: number, end: number): void {
    const index = this._markers.findIndex(
      (marker) =>
        marker.type === "areaMarker" &&
        (marker as AreaMarker).getStart() === start &&
        (marker as AreaMarker).getEnd() === end
    );
    if (index >= 0) {
      this._markers.splice(index, 1);
    }
  }

  getVisibleMarkers(type?: "line" | "area"): MarkerView[] {
    const markers: MarkerView[] = [];
    const targetMarkers = type
      ? this._markers.filter((marker) => marker.type === `${type}Marker`)
      : this._markers;
    for (const marker of targetMarkers) {
      if (marker.type === "lineMarker") {
        const { value } = (marker as LineMarker).getModel().getOptions();
        if (this.contains(value)) {
          markers.push(marker);
        }
      } else if (marker.type === "areaMarker") {
        const { start, end } = (marker as AreaMarker).getModel().getOptions();
        if (this.contains(start) || this.contains(end)) {
          markers.push(marker);
        }
      }
    }
    return markers;
  }

  showVisibleMarkers(): void {
    for (const marker of this.getVisibleMarkers()) {
      marker.show();
    }
  }

  hideVisibleMarkers(): void {
    for (const marker of this.getVisibleMarkers()) {
      marker.hide();
    }
  }

  override getRect() {
    return this._rect;
  }

  override setRect(rect: LayoutRect) {
    this._rect = rect;
  }

  override render(): void {
    this._axisLine.clear();
    this._majorTicks.clear();
    this._minorTicks.clear();
    this._splitLine.clear();
    this._labels.forEach((label) => (label.visible = false));

    const { show } = this.model.getOptions();
    if (!show) {
      return;
    }

    this._drawAxisLine();
    this._drawMajorTick();
    this._drawLabels();
    this._drawMinorTick();
    this._drawSplitLine();
    this._renderMarkers();
  }

  override dispose(): void {
    this._axisLine.destroy();
    this._majorTicks.destroy();
    this._minorTicks.destroy();
    this._splitLine.destroy();
    this._labels.forEach((label) => label.destroy());
    this._markers.forEach((marker) => marker.dispose());
  }

  private _renderMarkers(): void {
    for (const marker of this._markers) {
      marker.render();
    }
  }

  private _drawAxisLine(): void {
    const { show, color, width: lineWidth } = this.model.getOptions().axisLine;
    if (!show) {
      return;
    }

    const [x, y] = this.getOrigin();
    const { width, height } = this.getRect();
    let x1, x2, y1, y2;

    if (this.isHorizontal()) {
      x1 = x;
      x2 = x + width;
      y1 = y2 = y;
    } else {
      x1 = x2 = x;
      y1 = y;
      y2 = y + height;
    }

    this._axisLine.moveTo(x1, y1).lineTo(x2, y2).stroke({
      color: color,
      width: lineWidth,
    });
  }

  private _calcAdjustedTickPositions(tick: TickPixel): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } {
    const { length, inside } = this.model.getOptions().axisTick;
    const [x, y] = this.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.isAxisPositionEqualTo("top")) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.isAxisPositionEqualTo("left")) {
        return inside ? x + length : x - length;
      } else {
        return inside ? x - length : x + length;
      }
    };

    if (this.isHorizontal()) {
      x1 = x2 = tick.pixel;
      y1 = y;
      y2 = getYOffset(y);
    } else {
      x1 = x;
      x2 = getXOffset(x);
      y1 = y2 = tick.pixel;
    }

    return { x1, y1, x2, y2 };
  }

  private _drawMajorTick(): void {
    const { show, color, width } = this.model.getOptions().axisTick;
    if (!show) {
      return;
    }

    const ticks = this.getTicksPixels();

    for (const tick of ticks) {
      const { x1, y1, x2, y2 } = this._calcAdjustedTickPositions(tick);

      this._majorTicks.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color,
        width,
      });
    }
  }

  private _drawLabels(): void {
    const { show, margin, formatter, color, fontFamily, fontSize } =
      this.model.options.axisLabel;
    if (!show) {
      return;
    }

    // Get ticks and their positions
    const ticks = this.getTicksPixels().map((tick) => {
      const text = formatter
        ? formatter(tick.tick.value)
        : this.model.scale.getLabel(tick.tick);
      const { x1, y1 } = this._calcAdjustedTickPositions(tick);
      return { x: x1, y: y1, text };
    });

    // Create labels if needed
    while (this._labels.length < ticks.length) {
      const text = new PIXI.Text();
      this._labels.push(text);
      this.group.addChild(text);
    }

    // Update label positions
    const { position } = this.model.options;
    for (const [index, tick] of ticks.entries()) {
      const text = this._labels[index];
      text.text = tick.text;
      text.visible = true;
      text.style = {
        fontFamily,
        fontSize,
        fill: color,
        align: "center",
      };
      text.position.set(tick.x, tick.y);
      text.anchor.set(0.5, 1);

      switch (position) {
        case "bottom":
          text.y += margin;
          break;
        case "top":
          text.y -= margin;
          break;
        case "left":
          text.x -= margin;
          break;
        case "right":
          text.x += margin;
          break;
      }
    }

    // Hide unused labels
    for (let i = ticks.length; i < this._labels.length; i++) {
      this._labels[i].visible = false;
    }
  }

  _drawMinorTick(): void {
    const { show, length, color, width } = this.model.options.minorTick;
    const { inside } = this.model.options.axisTick;
    if (!show) {
      return;
    }

    const ticks = this.getMinorTicksPixels();
    const [x, y] = this.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.isAxisPositionEqualTo("top")) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.isAxisPositionEqualTo("left")) {
        return inside ? x + length : x - length;
      } else {
        return inside ? x - length : x + length;
      }
    };

    for (const tick of ticks) {
      if (this.isHorizontal()) {
        x1 = x2 = tick.pixel;
        y1 = y;
        y2 = getYOffset(y);
      } else {
        x1 = x;
        x2 = getXOffset(x);
        y1 = y2 = tick.pixel;
      }

      this._minorTicks.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color,
        width,
      });
    }
  }

  _drawSplitLine(): void {
    const { show, color, width: lineWidth } = this.model.options.splitLine;
    if (!show) {
      return;
    }

    const { width, height } = this.getRect();

    const ticks = this.getTicksPixels();
    for (const [index, tick] of ticks.entries()) {
      if (index === 0 || index === ticks.length - 1) {
        continue;
      }

      const { x1: x, y1: y } = this._calcAdjustedTickPositions(tick);

      let x1, x2, y1, y2;
      if (this.isHorizontal()) {
        x1 = x2 = x;
        y1 = y;
        y2 = y + height;
      } else {
        x1 = x;
        x2 = x + width;
        y1 = y2 = y;
      }

      drawDash(this._splitLine, x1, y1, x2, y2, 5, 5);
      this._splitLine.stroke({
        color: color,
        width: lineWidth,
      });
    }
  }
}
