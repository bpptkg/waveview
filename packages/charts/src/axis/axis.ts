import { LayoutRect, ScaleTick } from "../util/types";
import { View } from "../view/view";
import { AxisBuilder } from "./axisBuilder";
import { AxisModel, AxisOptions } from "./axisModel";

export interface TickPixel {
  pixel: number;
  tick: ScaleTick;
}

export class Axis extends View<AxisModel> {
  override type = "axis";
  private _rect: LayoutRect;
  private readonly _builder: AxisBuilder;

  constructor(model: AxisModel, rect: LayoutRect) {
    super(model);
    this._rect = rect;

    this._builder = new AxisBuilder(model, this);
  }

  setExtent(extent: [number, number]) {
    this.model.scale.setExtent(extent);
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
    const { scale } = this.model;
    const [min, max] = scale.getExtent();
    const range = max - min;
    const newMin = min - range * by;
    const newMax = max - range * by;
    scale.setExtent([newMin, newMax]);
  }

  scrollRight(by: number): void {
    this.scrollLeft(-by);
  }

  scrollTo(value: number): void {
    const { scale } = this.model;
    const [min, max] = scale.getExtent();
    const range = max - min;
    const newMin = value;
    const newMax = value + range;
    scale.setExtent([newMin, newMax]);
  }

  zoomIn(center: number, factor: number): void {
    const { scale } = this.model;
    const [min, max] = scale.getExtent();
    const newMin = center - (center - min) * factor;
    const newMax = center + (max - center) * factor;
    scale.setExtent([newMin, newMax]);
  }

  zoomOut(center: number, factor: number): void {
    this.zoomIn(center, 1 / factor);
  }

  override getRect() {
    return this._rect;
  }

  override setRect(rect: LayoutRect) {
    this._rect = rect;
  }

  override render(): void {
    const { show } = this.model.getOptions();
    if (!show) {
      return;
    }

    this.group.removeChildren();
    this._builder.drawAxisLine();
    this._builder.drawMajorTick();
    this._builder.drawMinorTick();
  }
}
