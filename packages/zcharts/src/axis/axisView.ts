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
  private axisLine: zrender.Line;
  private axisTicks: zrender.Group;
  private axisMinorTicks: zrender.Group;
  private axisLabels: zrender.Group;
  private axisName: zrender.Text;
  private splitLines: zrender.Group;

  constructor(parent: View, options?: DeepPartial<AxisOptions>) {
    const model = new AxisModel(options);
    super(model);
    this.parent = parent;
    this.rect = parent.getRect();
    this.axisLine = new zrender.Line();
    this.axisTicks = new zrender.Group();
    this.axisMinorTicks = new zrender.Group();
    this.axisLabels = new zrender.Group();
    this.axisName = new zrender.Text();
    this.splitLines = new zrender.Group();
    this.group.add(this.axisLine);
    this.group.add(this.axisTicks);
    this.group.add(this.axisMinorTicks);
    this.group.add(this.axisLabels);
    this.group.add(this.axisName);
    this.group.add(this.splitLines);
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
        pixel = y + height - range * percent;
      }
      ticksPixels.push({ pixel, tick });
    }

    return ticksPixels;
  }

  getMinorTicksPixels(): TickPixel[] {
    const { fontSize, reverse } = this.model.getOptions().axisLabel;
    const maxTicks = this.isHorizontal()
      ? Math.floor(this.getRect().width / fontSize)
      : Math.floor(this.getRect().height / fontSize);

    const { scale } = this.model;
    const { x, y, width, height } = this.getRect();
    const { splitNumber } = this.model.options.minorTick;
    const range = this.isHorizontal() ? width : height;
    const ticks = scale.getMinorTicks(splitNumber, { maxTicks, reverse });

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
    const { reverse } = this.model.getOptions().axisLabel;
    const { x, y, width, height } = this.getRect();
    const { scale } = this.model;
    const percent = scale.valueToPercentage(value);
    if (this.isHorizontal()) {
      return reverse ? x + width * (1 - percent) : x + width * percent;
    } else {
      return reverse ? y + height * percent : y + height * (1 - percent);
    }
  }

  getValueForPixel(pixel: number): number {
    const { reverse } = this.model.getOptions().axisLabel;
    const { x, y, width, height } = this.getRect();
    const { scale } = this.model;
    const percent = this.isHorizontal()
      ? reverse
        ? 1 - (pixel - x) / width
        : (pixel - x) / width
      : reverse
      ? (pixel - y) / height
      : 1 - (pixel - y) / height;
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

  clear(): void {}

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
    if (!this.visible) {
      this.group.hide();
      return;
    }
    this.renderAxisLine();
    this.renderAxisMajorTick();
    this.renderAxisMinorTick();
    this.renderAxisLabel();
    this.renderAxisName();
    this.renderSplitLine();
    this.group.show();
  }

  private renderAxisLine(): void {
    const { show, color, width: lineWidth } = this.model.getOptions().axisLine;
    if (!show) {
      this.axisLine.hide();
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

    this.axisLine.attr({
      shape: { x1, y1, x2, y2 },
      style: { stroke: color, lineWidth },
      silent: true,
    });
    this.axisLine.show();
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
      this.axisTicks.hide();
      return;
    }

    const ticks = this.getTicksPixels();
    this.axisTicks.removeAll();

    for (const tick of ticks) {
      const { x1, y1, x2, y2 } = this.calcAdjustedTickPositions(tick);

      const majorTick = new zrender.Line({
        shape: { x1, y1, x2, y2 },
        style: { stroke: color, lineWidth: width },
      });
      majorTick.silent = true;
      this.axisTicks.add(majorTick);
    }

    this.axisTicks.show();
  }

  private renderAxisMinorTick(): void {
    const { show, length, color, width } = this.model.options.minorTick;
    const { inside } = this.model.options.axisTick;
    if (!show) {
      this.axisMinorTicks.hide();
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

    this.axisMinorTicks.removeAll();

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
      this.axisMinorTicks.add(minorTick);
    }

    this.axisMinorTicks.show();
  }

  private renderAxisLabel(): void {
    const { show, margin, formatter, color, fontFamily, fontSize, inside } =
      this.model.options.axisLabel;
    if (!show) {
      this.axisLabels.hide();
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

    this.axisLabels.removeAll();

    const { position } = this.model.options;
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
      this.axisLabels.add(label);
    }

    this.axisLabels.show();
  }

  private renderSplitLine(): void {
    const { show, color, width: lineWidth } = this.model.options.splitLine;
    if (!show) {
      this.splitLines.hide();
      return;
    }

    const { width, height } = this.getRect();
    const ticks = this.getTicksPixels();
    this.splitLines.removeAll();

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
      this.splitLines.add(splitLine);
    }

    this.splitLines.show();
  }

  private renderAxisName(): void {
    const { name, nameGap } = this.model.options;
    const { color, fontFamily, fontSize } = this.model.options.nameStyle;
    this.model.options;
    if (!name) {
      this.axisName.hide();
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

    this.axisName.attr({
      style: {
        text: name,
        fill: color,
        fontFamily,
        fontSize,
        align: "center",
        verticalAlign: "middle",
      },
      rotation,
      silent: true,
    });

    if (this.isHorizontal()) {
      this.axisName.attr({
        x: x + width / 2,
        y: this.isTop() ? y - nameGap : y + height + nameGap,
      });
    } else {
      this.axisName.attr({
        x: this.isLeft() ? x - nameGap : x + width + nameGap,
        y: y + height / 2,
      });
    }

    this.axisName.show();
  }
}
