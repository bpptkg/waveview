import * as zrender from "zrender";
import { EventEmitter } from "../core/eventEmitter";
import { View } from "../core/view";
import {
  DeepPartial,
  EventMap,
  LayoutRect,
  ScaleTick,
  ThemeStyle,
} from "../util/types";
import { AxisModel, AxisOptions } from "./axisModel";

export interface TickPixel {
  pixel: number;
  tick: ScaleTick;
}

export interface AxisEventMap extends EventMap {
  extentChanged: (extent: [number, number]) => void;
}

export class AxisView extends View<AxisModel> {
  override readonly type: string = "axis";
  readonly parent: View;
  private rect: LayoutRect;
  private eventEmitter = new EventEmitter<AxisEventMap>();

  constructor(parent: View, options?: DeepPartial<AxisOptions>) {
    const model = new AxisModel(options);
    super(model);
    this.parent = parent;
    this.rect = parent.getRect();
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
      nameStyle: {
        color: textColor,
        fontSize,
        fontFamily,
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

  isTop() {
    return this.model.getOptions().position === "top";
  }

  isRight() {
    return this.model.getOptions().position === "right";
  }

  isBottom() {
    return this.model.getOptions().position === "bottom";
  }

  isLeft() {
    return this.model.getOptions().position === "left";
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
    const { fontSize, reverse } = this.model.getOptions().axisLabel;
    const maxTicks = this.isHorizontal()
      ? Math.floor(this.getRect().width / fontSize)
      : Math.floor(this.getRect().height / fontSize);

    const { scale } = this.model;
    const { x, y, width, height } = this.getRect();
    const range = this.isHorizontal() ? width : height;
    const ticks = scale.getTicks({ maxTicks, reverse });

    const ticksPixels = [];
    for (const tick of ticks) {
      let percent = scale.valueToPercentage(tick.value);
      if (reverse) {
        percent = 1 - percent;
      }

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

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.parent.getRect());
  }

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.group.removeAll();
  }

  on<K extends keyof AxisEventMap>(event: K, listener: AxisEventMap[K]): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof AxisEventMap>(event: K, listener: AxisEventMap[K]): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof AxisEventMap>(
    event: K,
    ...args: Parameters<AxisEventMap[K]>
  ): void {
    this.eventEmitter.emit(event, ...args);
  }

  render(): void {
    this.clear();
    this.renderAxisLine();
    this.renderAxisMajorTick();
    this.renderAxisMinorTick();
    this.renderAxisLabel();
    this.renderAxisName();
    this.renderSplitLine();
  }

  private renderAxisLine(): void {
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

    const axisLine = new zrender.Line({
      shape: { x1, y1, x2, y2 },
      style: { stroke: color, lineWidth },
    });
    axisLine.silent = true;
    this.group.add(axisLine);
  }

  private calcAdjustedTickPositions(tick: TickPixel): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } {
    const { length, inside } = this.model.getOptions().axisTick;
    const [x, y] = this.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.isTop()) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.isLeft()) {
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

  private renderAxisMajorTick(): void {
    const { show, color, width } = this.model.getOptions().axisTick;
    if (!show) {
      return;
    }

    const ticks = this.getTicksPixels();
    const majorTicks = new zrender.Group();

    for (const tick of ticks) {
      const { x1, y1, x2, y2 } = this.calcAdjustedTickPositions(tick);

      const majorTick = new zrender.Line({
        shape: { x1, y1, x2, y2 },
        style: { stroke: color, lineWidth: width },
      });
      majorTick.silent = true;
      majorTicks.add(majorTick);
    }

    this.group.add(majorTicks);
  }

  private renderAxisMinorTick(): void {
    const { show, length, color, width } = this.model.options.minorTick;
    const { inside } = this.model.options.axisTick;
    if (!show) {
      return;
    }

    const ticks = this.getMinorTicksPixels();
    const [x, y] = this.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.isTop()) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.isLeft()) {
        return inside ? x + length : x - length;
      } else {
        return inside ? x - length : x + length;
      }
    };

    const minorTicks = new zrender.Group();

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

      const minorTick = new zrender.Line({
        shape: { x1, y1, x2, y2 },
        style: { stroke: color, lineWidth: width },
      });
      minorTick.silent = true;
      minorTicks.add(minorTick);
    }

    this.group.add(minorTicks);
  }

  private renderAxisLabel(): void {
    const { show, margin, formatter, color, fontFamily, fontSize, inside } =
      this.model.options.axisLabel;
    if (!show) {
      return;
    }
    const { length } = this.model.getOptions().axisTick;

    // Get ticks and their positions
    const ticks = this.getTicksPixels().map((tick) => {
      const text = formatter
        ? formatter(tick.tick.value)
        : this.model.scale.getLabel(tick.tick);
      const { x1, y1 } = this.calcAdjustedTickPositions(tick);
      return { x: x1, y: y1, text };
    });

    const { position } = this.model.options;
    const labels = new zrender.Group();
    for (const tick of ticks) {
      const { x, y, text } = tick;
      const label = new zrender.Text({
        style: {
          text,
          fill: color,
          fontFamily,
          fontSize,
          align: "center",
          verticalAlign: "middle",
        },
      });

      if (this.isHorizontal()) {
        label.attr({
          x,
          y: position === "top" ? y - margin : y + margin,
        });
      } else {
        label.attr({
          x: inside
            ? position === "left"
              ? x - margin
              : x + margin
            : position === "left"
            ? x - length - margin
            : x + length + margin,
          y,
        });
      }
      label.silent = true;
      labels.add(label);
    }

    this.group.add(labels);
  }

  private renderSplitLine(): void {
    const { show, color, width: lineWidth } = this.model.options.splitLine;
    if (!show) {
      return;
    }

    const { width, height } = this.getRect();
    const ticks = this.getTicksPixels();
    const splitLines = new zrender.Group();

    for (const [index, tick] of ticks.entries()) {
      if (index === 0 || index === ticks.length - 1) {
        continue;
      }

      const { x1: x, y1: y } = this.calcAdjustedTickPositions(tick);

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

      const splitLine = new zrender.Line({
        shape: { x1, y1, x2, y2 },
        style: { stroke: color, lineWidth },
      });
      splitLine.silent = true;
      splitLines.add(splitLine);
    }

    this.group.add(splitLines);
  }

  private renderAxisName(): void {
    const { name, nameGap } = this.model.options;
    const { color, fontFamily, fontSize } = this.model.options.nameStyle;
    this.model.options;
    if (!name) {
      return;
    }

    const { x, y, width, height } = this.getRect();
    const rotation = this.isTop()
      ? 0
      : this.isBottom()
      ? Math.PI
      : this.isLeft()
      ? Math.PI / 2
      : -Math.PI / 2;

    const nameText = new zrender.Text({
      style: {
        text: name,
        fill: color,
        fontFamily,
        fontSize,
        align: "center",
        verticalAlign: "middle",
      },
      rotation,
    });

    if (this.isHorizontal()) {
      nameText.attr({
        x: x + width / 2,
        y: this.isTop() ? y - nameGap : y + height + nameGap,
      });
    } else {
      nameText.attr({
        x: this.isLeft() ? x - nameGap : x + width + nameGap,
        y: y + height / 2,
      });
    }

    nameText.silent = true;
    this.group.add(nameText);
  }
}
