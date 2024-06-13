import { AreaMarker, AreaMarkerOptions } from "../marker/area";
import { LineMarker, LineMarkerOptions } from "../marker/line";
import { EventMap, LayoutRect, ScaleTick } from "../util/types";
import { View } from "../view/view";
import { AxisBuilder } from "./axisBuilder";
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
  override type = "axis";
  private _rect: LayoutRect;
  private readonly _builder: AxisBuilder;
  private readonly _markers: MarkerView[] = [];

  constructor(model: AxisModel, rect: LayoutRect) {
    super(model);
    this._rect = rect;

    this._builder = new AxisBuilder(model, this);
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
    const newMin = center - (center - min) * (1 + factor);
    const newMax = center + (max - center) * (1 + factor);
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
    const marker = new LineMarker(this, this.getModel().getChart(), {
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
    const marker = new AreaMarker(this, this.getModel().getChart(), {
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
    this.clear();

    const { show } = this.model.getOptions();
    if (!show) {
      return;
    }

    this._builder.drawAxisLine();
    this._builder.drawMajorTick();
    this._builder.drawMinorTick();
    this.renderMarkers();
  }

  private renderMarkers(): void {
    for (const marker of this._markers) {
      marker.render();
    }
  }
}
